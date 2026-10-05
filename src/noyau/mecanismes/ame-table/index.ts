/**
 * Cisaillement entre l ame et la table d une poutre en T.
 *
 * Unites : kN, mm, MPa ; armatures transversales en mm2/m.
 *
 * La contrainte agissante est la meme dans les deux generations :
 * tau_Ed = Delta F_d / (h_f Delta x) ((6.20) ; (8.65)).
 *
 * Premiere generation (6.2.4), deux niveaux :
 *   1. pas d armature au-dela de la flexion transversale si v_Ed <= k f_ctd,
 *      k = 0,4 (6.2.4(6)) ;
 *   2. treillis : A_sf f_yd / s_f >= v_Ed h_f / cot(theta_f) (6.21) et
 *      v_Ed <= nu f_cd sin(theta_f) cos(theta_f) (6.22), nu selon (6.6N),
 *      1 <= cot(theta_f) <= 2 (membrure comprimee) ou 1,25 (tendue).
 * Deuxieme generation (8.2.5), deux niveaux :
 *   1. pas de verification si tau_Ed <= A_st,min f_yd / (s_f h_f) (8.66),
 *      A_st,min etant l armature transversale minimale (12.2(2), tableau 12.1),
 *      saisie ;
 *   2. treillis : (8.69) et (8.70) avec nu = 0,5 (8.71),
 *      1 <= cot(theta_f) <= 3 (membrure comprimee) ou 1,25 (tendue).
 * Le niveau a nu calcule pour les membrures tendues (8.2.5(5)) n est pas
 * code : l outil le declare.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, fctm2004, positif } from '../../materiaux';

export interface EntreeAmeTable {
  /** Variation de l effort normal dans la partie de table consideree (kN). */
  dFd?: number;
  /** Longueur consideree Delta x (mm). */
  dx?: number;
  /** Epaisseur de la table a la jonction (mm). */
  hf?: number;
  /** 'comprimee' ou 'tendue'. */
  membrure?: string;
  fck?: number;
  fyk?: number;
  /** Armatures transversales de la table, en place (mm2/m). */
  asf?: number;
  /** Armature transversale minimale A_st,min / s_f (mm2/m), pour (8.66). */
  astMin?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAmeTable>;
const N_PAR_KN = 1000;
const MM_PAR_M = 1000;

const R = {
  dFd: { champ: 'dFd', libelle: 'champ.dFd' },
  dx: { champ: 'dx', libelle: 'champ.dx-table' },
  hf: { champ: 'hf', libelle: 'champ.hf' },
  membrure: { champ: 'membrure', libelle: 'champ.membrure' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  asf: { champ: 'asf', libelle: 'champ.asf' },
  astMin: { champ: 'astMin', libelle: 'champ.astMin' },
} as const satisfies Record<string, { champ: keyof EntreeAmeTable; libelle: Cle }>;

const communs = [R.dFd, R.dx, R.hf, R.membrure, R.fck];

function domaine(e: EntreeAmeTable): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

/** tau_Ed = Delta F_d / (h_f Delta x). */
export function contrainteTable(e: Complete): number {
  positif(e.dFd, 'Delta F_d', 'kN');
  positif(e.dx, 'Delta x', 'mm');
  positif(e.hf, 'h_f', 'mm');
  return (e.dFd * N_PAR_KN) / (e.hf * e.dx);
}

export interface TreillisTable {
  cot: number;
  tau: number;
  tauS: number;
  tauMax: number;
}

/**
 * Optimum du treillis de table : l acier croit avec cot, la bielle decroit ;
 * egalite 1 + cot2 = nu f_cd / tau_s1 (tau_s1 = a_sf f_yd / h_f), bornee a
 * [1 ; cotMax].
 */
export function treillisTable(tauS1: number, nu: number, fcd: number, cotMax: number): TreillisTable {
  const rapport = (nu * fcd) / tauS1;
  const cot = Math.min(Math.max(Math.sqrt(Math.max(rapport - 1, 0)), 1), cotMax);
  const tauS = tauS1 * cot;
  const tauMax = (nu * fcd * cot) / (1 + cot * cot);
  return { cot, tau: Math.min(tauS, tauMax), tauS, tauMax };
}

const comprimee = (e: EntreeAmeTable): boolean => e.membrure !== 'tendue';

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

export function table2004Seuil(e: Complete): Calcul {
  const tau = contrainteTable(e);
  const fctd = (0.7 * fctm2004(e.fck)) / GAMMA_C_2004;
  const seuil = 0.4 * fctd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: seuil,
    intermediaires: {
      v_Ed: calculee(tau, 'MPa'),
      k: recommandee(0.4, '-'),
      f_ctd: calculee(fctd, 'MPa'),
      'k f_ctd': calculee(seuil, 'MPa'),
    },
    clauses: ['6.2.4(6)', '(6.20)'],
  };
}

export function table2004Treillis(e: Complete): Calcul {
  const tau = contrainteTable(e);
  positif(e.asf, 'a_sf', 'mm2/m');
  const fyd = e.fyk / GAMMA_S_2004;
  const tauS1 = (e.asf * fyd) / (e.hf * MM_PAR_M);
  const nu = 0.6 * (1 - e.fck / 250);
  const cotMax = comprimee(e) ? 2 : 1.25;
  const t = treillisTable(tauS1, nu, fcd2004(e.fck), cotMax);
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: t.tau,
    intermediaires: {
      v_Ed: calculee(tau, 'MPa'),
      'ν': calculee(nu, '-'),
      'cot θ_f max': recommandee(cotMax, '-'),
      'cot θ_f': calculee(t.cot, '-'),
      'a_sf f_yd cot θ_f / h_f': calculee(t.tauS, 'MPa'),
      'ν f_cd sin θ_f cos θ_f': calculee(t.tauMax, 'MPa'),
      v_Rd: calculee(t.tau, 'MPa'),
    },
    clauses: ['6.2.4(4)', '(6.21)', '(6.22)'],
  };
}

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

export function table2023Seuil(e: Complete): Calcul {
  const tau = contrainteTable(e);
  positif(e.astMin, 'A_st,min', 'mm2/m');
  const fyd = e.fyk / GAMMA_S_2023;
  const seuil = (e.astMin * fyd) / (e.hf * MM_PAR_M);
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: seuil,
    intermediaires: {
      'τ_Ed': calculee(tau, 'MPa'),
      'A_st,min / s_f': saisie(e.astMin, 'mm²/m'),
      'A_st,min f_yd / (s_f h_f)': calculee(seuil, 'MPa'),
    },
    clauses: ['8.2.5(2)', '(8.65)', '(8.66)'],
  };
}

export function table2023Treillis(e: Complete): Calcul {
  const tau = contrainteTable(e);
  positif(e.asf, 'a_sf', 'mm2/m');
  const fyd = e.fyk / GAMMA_S_2023;
  const tauS1 = (e.asf * fyd) / (e.hf * MM_PAR_M);
  const nu = 0.5;
  const cotMax = comprimee(e) ? 3 : 1.25;
  const fcd = fcd2023(e.fck);
  const t = treillisTable(tauS1, nu, fcd, cotMax);
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: t.tau,
    intermediaires: {
      'τ_Ed': calculee(tau, 'MPa'),
      'ν': recommandee(nu, '-'),
      f_cd: calculee(fcd, 'MPa'),
      'cot θ_f max': recommandee(cotMax, '-'),
      'cot θ_f': calculee(t.cot, '-'),
      'A_sf f_yd cot θ_f / (s_f h_f)': calculee(t.tauS, 'MPa'),
      'ν f_cd / (cot θ_f + tan θ_f)': calculee(t.tauMax, 'MPa'),
      'τ_Rd': calculee(t.tau, 'MPa'),
    },
    clauses: ['8.2.5(3)', '8.2.5(4)', '(8.67)', '(8.68)', '(8.69)', '(8.70)', '(8.71)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeAmeTable>[] = [
  {
    id: 'seuil',
    ordre: 1,
    position: 'corps',
    clause: '6.2.4(6)',
    hypothese: 'niveau.at.2004.seuil',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => table2004Seuil(e as Complete),
  },
  {
    id: 'treillis',
    ordre: 2,
    position: 'corps',
    clause: '6.2.4(4)',
    hypothese: 'niveau.at.2004.treillis',
    donneesRequises: [...communs, R.fyk, R.asf],
    domaine,
    conditions: () => null,
    calculer: (e) => table2004Treillis(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeAmeTable>[] = [
  {
    id: 'seuil',
    ordre: 1,
    position: 'corps',
    clause: '8.2.5(2)',
    hypothese: 'niveau.at.2023.seuil',
    donneesRequises: [...communs, R.fyk, R.astMin],
    domaine,
    conditions: () => null,
    calculer: (e) => table2023Seuil(e as Complete),
  },
  {
    id: 'treillis',
    ordre: 2,
    position: 'corps',
    clause: '8.2.5(4)',
    hypothese: 'niveau.at.2023.treillis',
    donneesRequises: [...communs, R.fyk, R.asf],
    domaine,
    conditions: () => null,
    calculer: (e) => table2023Treillis(e as Complete),
  },
];

export const ameTable: Mecanisme<EntreeAmeTable> = {
  id: 'ame-table',
  version: '0.1.0',
  titre: 'meca.at.titre',
  champs: [
    { type: 'nombre', id: 'dFd', libelle: 'champ.dFd', symbole: 'ΔF_d', unite: 'kN' },
    { type: 'nombre', id: 'dx', libelle: 'champ.dx-table', symbole: 'Δx', unite: 'mm' },
    { type: 'nombre', id: 'hf', libelle: 'champ.hf', symbole: 'h_f', unite: 'mm' },
    {
      type: 'choix',
      id: 'membrure',
      libelle: 'champ.membrure',
      options: [
        { valeur: 'comprimee', libelle: 'option.membrure.comprimee' },
        { valeur: 'tendue', libelle: 'option.membrure.tendue' },
      ],
    },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'asf', libelle: 'champ.asf', symbole: 'A_sf/s_f', unite: 'mm²/m', facultatif: true },
    { type: 'nombre', id: 'astMin', libelle: 'champ.astMin', symbole: 'A_st,min/s_f', unite: 'mm²/m', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.cisaillement-table', unite: 'MPa' },
  resistance: { libelle: 'grandeur.resistance-table', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
