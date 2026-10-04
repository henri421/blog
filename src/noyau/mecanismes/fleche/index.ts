/**
 * Fleche a long terme d une poutre ou d une dalle sur appuis simples, section
 * rectangulaire armee en traction seulement, charge uniformement repartie.
 *
 * Unites : kN/m, mm, MPa ; fleches en mm.
 *
 * Premiere generation (7.4.3) et deuxieme generation, niveau 2 (9.3.4) :
 * methode generale par interpolation entre etat non fissure (I) et etat
 * entierement fissure (II), alpha = zeta alpha_II + (1 - zeta) alpha_I,
 * zeta = 1 - beta (M_cr/M)^2, beta = 0,5 (charge de longue duree) ;
 * E_c,eff = E_cm / (1 + phi) ; courbure de retrait eps_cs alpha_e S / I.
 *   - 2004 : M = M_qp, moment sous la charge consideree (7.19) ;
 *   - 2023 : sigma_s est la contrainte la plus elevee subie jusqu a l analyse
 *     (9.29) : M = M_k, moment sous charge caracteristique.
 * Deuxieme generation, niveau 1 (9.3.3) : calcul simplifie sur section brute,
 *   delta = k_I (delta_loads + k_s delta_cs) (9.23), k_I selon (9.25), (9.26),
 *   k_s selon (9.27), zeta = 1 - 0,5 (M_cr/M_k)^2.
 *
 * Choix de l outil : section homogeneisee non fissuree avec alpha_e A_s (sans
 * deduire le beton deplace) ; fleche tiree de la courbure a mi-portee
 * (5/48 L^2 pour la charge, 1/8 L^2 pour le retrait, courbure uniforme) ;
 * f_ct,eff = f_ctm.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { ES, ecm2004, ecm2023, fctm2004, fctm2023, positif } from '../../materiaux';

export interface EntreeFleche {
  /** Portee (mm). */
  L?: number;
  b?: number;
  h?: number;
  d?: number;
  /** Armatures tendues (mm2). */
  As?: number;
  fck?: number;
  /** Charge quasi permanente (kN/m). */
  qqp?: number;
  /** Charge caracteristique (kN/m). */
  qk?: number;
  /** Coefficient de fluage phi. */
  phi?: number;
  /** Retrait libre (pour mille). */
  epsCs?: number;
  /** Rapport limite portee / fleche (250 pour L/250). */
  rapport?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFleche>;
const NMM_PAR_KNM = 1e6;
const BETA_LONGUE_DUREE = 0.5;

const R = {
  L: { champ: 'L', libelle: 'champ.L' },
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  d: { champ: 'd', libelle: 'champ.d' },
  As: { champ: 'As', libelle: 'champ.As' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  qqp: { champ: 'qqp', libelle: 'champ.qqp' },
  qk: { champ: 'qk', libelle: 'champ.qk' },
  phi: { champ: 'phi', libelle: 'champ.phi-fluage' },
  epsCs: { champ: 'epsCs', libelle: 'champ.epsCs' },
  rapport: { champ: 'rapport', libelle: 'champ.rapport-fleche' },
} as const satisfies Record<string, { champ: keyof EntreeFleche; libelle: Cle }>;

const requises = [R.L, R.b, R.h, R.d, R.As, R.fck, R.qqp, R.qk, R.phi, R.epsCs, R.rapport];

function domaine(e: EntreeFleche): Cle | null {
  if ((e.fck as number) > 90) return 'motif.fck-sup-90';
  if ((e.d as number) >= (e.h as number)) return 'motif.d-sup-h';
  return null;
}

function verifier(e: Complete): void {
  for (const [v, nom, u] of [
    [e.L, 'L', 'mm'],
    [e.b, 'b', 'mm'],
    [e.h, 'h', 'mm'],
    [e.d, 'd', 'mm'],
    [e.As, 'As', 'mm2'],
    [e.qqp, 'q_qp', 'kN/m'],
    [e.qk, 'q_k', 'kN/m'],
    [e.rapport, 'rapport limite', '-'],
  ] as const) {
    positif(v, nom, u);
  }
  if (!(e.phi >= 0)) throw new Error('phi doit etre un nombre positif ou nul (-).');
  if (!(e.epsCs >= 0)) throw new Error('eps_cs doit etre un nombre positif ou nul (pour mille).');
}

/** Moment isostatique q L^2 / 8 (kN.m), q en kN/m et L en mm. */
const moment = (q: number, L: number): number => (q * (L / 1000) ** 2) / 8;

export interface Etat {
  /** Position de l axe neutre ou du centre de gravite depuis la fibre comprimee (mm). */
  x: number;
  /** Inertie (mm4). */
  I: number;
  /** Moment statique des armatures par rapport au centre de gravite (mm3). */
  S: number;
}

/** Section homogeneisee non fissuree, alpha_e A_s. */
export function etatNonFissure(b: number, h: number, d: number, As: number, ae: number): Etat {
  const x = ((b * h * h) / 2 + ae * As * d) / (b * h + ae * As);
  const I = (b * h ** 3) / 12 + b * h * (h / 2 - x) ** 2 + ae * As * (d - x) ** 2;
  return { x, I, S: As * (d - x) };
}

/** Section entierement fissuree, beton tendu neglige. */
export function etatFissure(b: number, d: number, As: number, ae: number): Etat {
  const rho = As / (b * d);
  const x = ae * rho * d * (-1 + Math.sqrt(1 + 2 / (ae * rho)));
  const I = (b * x ** 3) / 3 + ae * As * (d - x) ** 2;
  return { x, I, S: As * (d - x) };
}

interface ResultatGeneral {
  fleche: number;
  inter: Cellule['intermediaires'];
}

/** Methode generale (7.4.3 ; 9.3.4). `Mzeta` : moment qui fixe zeta. */
function methodeGenerale(e: Complete, ecm: number, fctm: number, Mzeta: number): ResultatGeneral {
  const Eceff = ecm / (1 + e.phi);
  const ae = ES / Eceff;
  const eI = etatNonFissure(e.b, e.h, e.d, e.As, ae);
  const eII = etatFissure(e.b, e.d, e.As, ae);
  const Mqp = moment(e.qqp, e.L);
  const Mcr = (fctm * eI.I) / (e.h - eI.x) / NMM_PAR_KNM;
  const zeta = Mzeta > Mcr ? 1 - BETA_LONGUE_DUREE * (Mcr / Mzeta) ** 2 : 0;
  const eps = e.epsCs / 1000;
  const fleche = (etat: Etat): number => {
    const charge = ((5 / 48) * e.L ** 2 * (Mqp * NMM_PAR_KNM)) / (Eceff * etat.I);
    const retrait = (e.L ** 2 / 8) * ((eps * ae * etat.S) / etat.I);
    return charge + retrait;
  };
  const dI = fleche(eI);
  const dII = fleche(eII);
  const total = zeta * dII + (1 - zeta) * dI;
  return {
    fleche: total,
    inter: {
      'E_c,eff': calculee(Eceff, 'MPa'),
      'α_e': calculee(ae, '-'),
      M_qp: calculee(Mqp, 'kN·m'),
      M_cr: calculee(Mcr, 'kN·m'),
      'β': recommandee(BETA_LONGUE_DUREE, '-'),
      'ζ': calculee(zeta, '-'),
      'δ_I': calculee(dI, 'mm'),
      'δ_II': calculee(dII, 'mm'),
      'δ': calculee(total, 'mm'),
    },
  };
}

function resultat(e: Complete, fleche: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  const limite = e.L / e.rapport;
  return {
    statut: { etat: 'calcule' },
    sollicitation: fleche,
    resistance: limite,
    intermediaires: { ...inter, a: saisie(e.rapport, '-'), 'L / a': calculee(limite, 'mm') },
    clauses,
  };
}

export function fleche2004(e: Complete): Calcul {
  verifier(e);
  const g = methodeGenerale(e, ecm2004(e.fck), fctm2004(e.fck), moment(e.qqp, e.L));
  return resultat(e, g.fleche, g.inter, ['7.4.3', '(7.18)', '(7.19)', '(7.20)', '(7.21)']);
}

export function fleche2023Generale(e: Complete): Calcul {
  verifier(e);
  const g = methodeGenerale(e, ecm2023(e.fck), fctm2023(e.fck), moment(e.qk, e.L));
  return resultat(e, g.fleche, { M_k: calculee(moment(e.qk, e.L), 'kN·m'), ...g.inter }, ['9.3.4', '(9.28)', '(9.29)', '(9.1)', '(9.24)']);
}

/** Calcul simplifie (9.3.3) sur section brute. */
export function fleche2023Simplifiee(e: Complete): Calcul {
  verifier(e);
  const Eceff = ecm2023(e.fck) / (1 + e.phi);
  const ae = ES / Eceff;
  const Ig = (e.b * e.h ** 3) / 12;
  const Ss = e.As * (e.d - e.h / 2);
  const Mqp = moment(e.qqp, e.L);
  const Mk = moment(e.qk, e.L);
  const Mcr = (fctm2023(e.fck) * Ig) / (e.h / 2) / NMM_PAR_KNM;
  const rho = e.As / (e.b * e.d);
  const fissuree = Mk > Mcr;
  const zeta = fissuree ? 1 - 0.5 * (Mcr / Mk) ** 2 : 0;
  const IgSurIcr = 1 / (2.7 * (ae * rho) ** 0.6 * (e.d / e.h) ** 3);
  const kI = fissuree ? zeta * IgSurIcr + (1 - zeta) : 1;
  const ks = fissuree ? 455 * rho ** 2 - 35 * rho + 1.6 : 1;
  const dLoads = ((5 / 48) * e.L ** 2 * (Mqp * NMM_PAR_KNM)) / (Eceff * Ig);
  const dCs = (e.L ** 2 / 8) * (((e.epsCs / 1000) * ae * Ss) / Ig);
  const total = kI * (dLoads + ks * dCs);
  return resultat(
    e,
    total,
    {
      'E_c,eff': calculee(Eceff, 'MPa'),
      'α_e,ef': calculee(ae, '-'),
      M_k: calculee(Mk, 'kN·m'),
      M_cr: calculee(Mcr, 'kN·m'),
      'ζ': calculee(zeta, '-'),
      'I_g / I_cr': calculee(IgSurIcr, '-'),
      k_I: calculee(kI, '-'),
      k_s: calculee(ks, '-'),
      'δ_loads': calculee(dLoads, 'mm'),
      'δ_εcs': calculee(dCs, 'mm'),
      'δ': calculee(total, 'mm'),
    },
    ['9.3.3', '(9.23)', '(9.24)', '(9.25)', '(9.26)', '(9.27)'],
  );
}

const niveaux2004: DefinitionNiveau<EntreeFleche>[] = [
  {
    id: 'generale',
    ordre: 1,
    clause: '7.4.3',
    hypothese: 'niveau.fl.2004.generale',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => fleche2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeFleche>[] = [
  {
    id: 'simplifiee',
    ordre: 1,
    clause: '9.3.3',
    hypothese: 'niveau.fl.2023.simplifiee',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => fleche2023Simplifiee(e as Complete),
  },
  {
    id: 'generale',
    ordre: 2,
    clause: '9.3.4',
    hypothese: 'niveau.fl.2023.generale',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => fleche2023Generale(e as Complete),
  },
];

export const fleche: Mecanisme<EntreeFleche> = {
  id: 'fleche',
  version: '0.1.0',
  titre: 'meca.fl.titre',
  champs: [
    { type: 'nombre', id: 'L', libelle: 'champ.L', symbole: 'L', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'As', libelle: 'champ.As', symbole: 'A_s', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'qqp', libelle: 'champ.qqp', symbole: 'q_qp', unite: 'kN/m' },
    { type: 'nombre', id: 'qk', libelle: 'champ.qk', symbole: 'q_k', unite: 'kN/m' },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi-fluage', symbole: 'φ', unite: '-' },
    { type: 'nombre', id: 'epsCs', libelle: 'champ.epsCs', symbole: 'ε_cs', unite: '‰' },
    { type: 'nombre', id: 'rapport', libelle: 'champ.rapport-fleche', symbole: 'a', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.fleche', unite: 'mm' },
  resistance: { libelle: 'grandeur.fleche-limite', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
