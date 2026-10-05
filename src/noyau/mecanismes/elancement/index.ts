/**
 * Verification des fleches par le rapport portee / hauteur utile (batiments).
 *
 * Unites : mm, MPa, kN/m.
 *
 * Premiere generation (7.4.2) : (7.16.a) si rho <= rho_0, (7.16.b) sinon,
 *   rho_0 = sqrt(fck) 10^-3, K selon le systeme (tableau 7.4N, valeurs
 *   recommandees), multiplie par 310/sigma_s ~ 500 / (f_yk A_s,req/A_s,prov)
 *   (7.17), et par 7/l_eff si la portee depasse 7 m et porte des cloisons
 *   fragiles (planchers-dalles : 8,5/l_eff au-dela de 8,5 m).
 * Deuxieme generation (9.3.2) : limite l/d lue par l ingenieur dans le
 *   tableau 9.3 (non reproduit) et saisie, multipliee par 250/a (9.3.2(2)).
 *   L outil calcule les deux entrees du tableau : le pourcentage mecanique
 *   omega_r = A_s,req / (b d) f_yd / f_cd et la part de charge
 *   d exploitation LL/TL.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_S_2023, fcd2023, positif } from '../../materiaux';

export interface EntreeElancement {
  L?: number;
  b?: number;
  d?: number;
  /** Armatures tendues requises a l ELU (mm2). */
  AsReq?: number;
  /** Armatures tendues en place (mm2). */
  AsProv?: number;
  /** Armatures comprimees requises (mm2), 0 si aucune. */
  AsComp?: number;
  fck?: number;
  fyk?: number;
  /** 'isostatique', 'rive', 'intermediaire', 'plancher-dalle', 'console'. */
  systeme?: string;
  /** 'oui' si l element porte des cloisons fragiles. */
  cloisons?: string;
  /** Charge permanente caracteristique (kN/m). */
  gk?: number;
  /** Charge d exploitation caracteristique (kN/m). */
  qk?: number;
  /** Limite l/d lue dans le tableau 9.3 de l EN 1992-1-1:2023. */
  lSurDLu?: number;
  /** Rapport limite de fleche a (250 pour l/250). */
  rapport?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeElancement>;

/** K du tableau 7.4N (valeurs recommandees). */
const K_2004: Record<string, number> = { isostatique: 1.0, rive: 1.3, intermediaire: 1.5, 'plancher-dalle': 1.2, console: 0.4 };

const R = {
  L: { champ: 'L', libelle: 'champ.L' },
  b: { champ: 'b', libelle: 'champ.b' },
  d: { champ: 'd', libelle: 'champ.d' },
  AsReq: { champ: 'AsReq', libelle: 'champ.AsReq' },
  AsProv: { champ: 'AsProv', libelle: 'champ.As-place' },
  AsComp: { champ: 'AsComp', libelle: 'champ.AsComp' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  systeme: { champ: 'systeme', libelle: 'champ.systeme-statique' },
  cloisons: { champ: 'cloisons', libelle: 'champ.cloisons' },
  gk: { champ: 'gk', libelle: 'champ.gk' },
  qk: { champ: 'qk', libelle: 'champ.qk-exploitation' },
  lSurDLu: { champ: 'lSurDLu', libelle: 'champ.lSurDLu' },
  rapport: { champ: 'rapport', libelle: 'champ.rapport-fleche' },
} as const satisfies Record<string, { champ: keyof EntreeElancement; libelle: Cle }>;

const communs = [R.L, R.b, R.d, R.AsReq, R.AsProv, R.AsComp, R.fck, R.fyk, R.systeme];

function domaine(e: EntreeElancement): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function verifier(e: Complete): void {
  for (const [v, nom] of [
    [e.L, 'L'],
    [e.b, 'b'],
    [e.d, 'd'],
    [e.AsReq, 'A_s,req'],
    [e.AsProv, 'A_s,prov'],
  ] as const) {
    positif(v, nom, 'mm');
  }
  if (!(e.AsComp >= 0)) throw new Error('A_s2 doit etre un nombre positif ou nul (mm2).');
}

/** Elancement limite de base (7.16.a / 7.16.b), sans facteur de correction. */
export function elancementBase2004(K: number, fck: number, rho: number, rhoP: number): number {
  const rho0 = Math.sqrt(fck) * 1e-3;
  const r = Math.sqrt(fck);
  if (rho <= rho0) return K * (11 + 1.5 * r * (rho0 / rho) + 3.2 * r * (rho0 / rho - 1) ** 1.5);
  return K * (11 + 1.5 * r * (rho0 / (rho - rhoP)) + (r / 12) * Math.sqrt(rhoP / rho0));
}

export function elancement2004(e: Complete): Calcul {
  verifier(e);
  const K = K_2004[e.systeme] ?? 1;
  const rho = e.AsReq / (e.b * e.d);
  const rhoP = e.AsComp / (e.b * e.d);
  const base = elancementBase2004(K, e.fck, rho, rhoP);
  const facteurAcier = 500 / ((e.fyk * e.AsReq) / e.AsProv);
  const Lm = e.L / 1000;
  let facteurPortee = 1;
  if (e.cloisons === 'oui') {
    if (e.systeme === 'plancher-dalle' && Lm > 8.5) facteurPortee = 8.5 / Lm;
    else if (e.systeme !== 'plancher-dalle' && Lm > 7) facteurPortee = 7 / Lm;
  }
  const limite = base * facteurAcier * facteurPortee;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.L / e.d,
    resistance: limite,
    intermediaires: {
      K: recommandee(K, '-'),
      'ρ': calculee(rho, '-'),
      'ρ_0': calculee(Math.sqrt(e.fck) * 1e-3, '-'),
      'l/d (7.16)': calculee(base, '-'),
      '310/σ_s': calculee(facteurAcier, '-'),
      'facteur de portée': calculee(facteurPortee, '-'),
      'l/d limite': calculee(limite, '-'),
      'L/d': calculee(e.L / e.d, '-'),
    },
    clauses: ['7.4.2', '(7.16.a)', '(7.16.b)', '(7.17)', 'tableau 7.4N'],
  };
}

export function elancement2023(e: Complete): Calcul {
  verifier(e);
  positif(e.lSurDLu, 'l/d lu', '-');
  positif(e.rapport, 'a', '-');
  const omega = (e.AsReq / (e.b * e.d)) * ((e.fyk / GAMMA_S_2023) / fcd2023(e.fck));
  const part = e.qk / (e.gk + e.qk);
  const limite = e.lSurDLu * (250 / e.rapport);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.L / e.d,
    resistance: limite,
    intermediaires: {
      'ω_r (entrée du tableau 9.3)': calculee(omega, '-'),
      'LL/TL (entrée du tableau 9.3)': calculee(part, '-'),
      'l/d lu': saisie(e.lSurDLu, '-'),
      '250/a': calculee(250 / e.rapport, '-'),
      'l/d limite': calculee(limite, '-'),
      'L/d': calculee(e.L / e.d, '-'),
    },
    clauses: ['9.3.2(1)', '9.3.2(2)', 'tableau 9.3'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeElancement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '7.4.2',
    hypothese: 'niveau.ld.2004.base',
    donneesRequises: [...communs, R.cloisons],
    domaine,
    conditions: () => null,
    calculer: (e) => elancement2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeElancement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '9.3.2',
    hypothese: 'niveau.ld.2023.base',
    donneesRequises: [...communs, R.gk, R.qk, R.lSurDLu, R.rapport],
    domaine,
    conditions: () => null,
    calculer: (e) => elancement2023(e as Complete),
  },
];

export const elancement: Mecanisme<EntreeElancement> = {
  id: 'elancement',
  version: '0.1.0',
  titre: 'meca.ld.titre',
  champs: [
    { type: 'nombre', id: 'L', libelle: 'champ.L', symbole: 'L', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'AsReq', libelle: 'champ.AsReq', symbole: 'A_s,req', unite: 'mm²' },
    { type: 'nombre', id: 'AsProv', libelle: 'champ.As-place', symbole: 'A_s,prov', unite: 'mm²' },
    { type: 'nombre', id: 'AsComp', libelle: 'champ.AsComp', symbole: 'A_s2', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    {
      type: 'choix',
      id: 'systeme',
      libelle: 'champ.systeme-statique',
      options: [
        { valeur: 'isostatique', libelle: 'option.ld.isostatique' },
        { valeur: 'rive', libelle: 'option.ld.rive' },
        { valeur: 'intermediaire', libelle: 'option.ld.intermediaire' },
        { valeur: 'plancher-dalle', libelle: 'option.ld.plancher-dalle' },
        { valeur: 'console', libelle: 'option.ld.console' },
      ],
    },
    {
      type: 'choix',
      id: 'cloisons',
      libelle: 'champ.cloisons',
      options: [
        { valeur: 'non', libelle: 'option.non' },
        { valeur: 'oui', libelle: 'option.oui' },
      ],
    },
    { type: 'nombre', id: 'gk', libelle: 'champ.gk', symbole: 'g_k', unite: 'kN/m' },
    { type: 'nombre', id: 'qk', libelle: 'champ.qk-exploitation', symbole: 'q_k', unite: 'kN/m' },
    { type: 'nombre', id: 'lSurDLu', libelle: 'champ.lSurDLu', symbole: '(l/d) lu', unite: '-', facultatif: true },
    { type: 'nombre', id: 'rapport', libelle: 'champ.rapport-fleche', symbole: 'a', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.elancement', unite: '-' },
  resistance: { libelle: 'grandeur.elancement-limite', unite: '-' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
