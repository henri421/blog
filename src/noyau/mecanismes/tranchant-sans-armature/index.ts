/**
 * Effort tranchant des elements sans armature d effort tranchant.
 *
 * Unites : kN, kN.m, mm, MPa.
 *
 * Premiere generation : 6.2.2(1), un seul niveau.
 * Deuxieme generation : 8.2.1 et 8.2.2, trois niveaux :
 *   1. resistance minimale tau_Rdc,min, qui dispense de toute verification
 *      plus fine et n exige pas le ferraillage longitudinal ;
 *   2. tau_Rd,c avec la hauteur utile d ;
 *   3. tau_Rd,c avec la portee mecanique a_v, qui exige le moment concomitant.
 * Le niveau 3 n est permis que si a_cs < 4 d (8.2.2(3)) : a_v reste alors
 * inferieur a d et le niveau 3 ne peut pas etre moins favorable que le 2.
 * Au-dela, il est non applicable, avec ce motif.
 *
 * Domaine de la deuxieme generation : D_lower >= 8 mm (1.1(3)).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_S_2023, GAMMA_V_2023, ddg2023, positif } from '../../materiaux';

export interface EntreeTsa {
  /** Effort tranchant de calcul (kN). */
  VEd?: number;
  /** Moment concomitant dans la section verifiee (kN.m). */
  MEd?: number;
  /** Largeur de l ame (mm). */
  bw?: number;
  /** Hauteur utile (mm). */
  d?: number;
  /** Section des armatures longitudinales tendues ancrees au-dela de la section (mm2). */
  Asl?: number;
  fck?: number;
  fyk?: number;
  /** Plus petite dimension superieure D de la fraction la plus grossiere des granulats (mm). */
  Dlower?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
const N_PAR_KN = 1000;

const R = {
  VEd: { champ: 'VEd', libelle: 'champ.VEd' },
  MEd: { champ: 'MEd', libelle: 'champ.MEd' },
  bw: { champ: 'bw', libelle: 'champ.bw' },
  d: { champ: 'd', libelle: 'champ.d' },
  Asl: { champ: 'Asl', libelle: 'champ.Asl' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
} as const satisfies Record<string, { champ: keyof EntreeTsa; libelle: Cle }>;

function domaineFck(e: EntreeTsa): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

/** La deuxieme generation exclut les betons dont D_lower < 8 mm (1.1(3)). */
function domaine2023(e: EntreeTsa): Cle | null {
  if ((e.Dlower as number) < 8) return 'motif.dlower-inf-8';
  return domaineFck(e);
}

/** a_cs = max(|M_Ed / V_Ed| ; d) (8.30). */
export function longueurAcs(e: EntreeTsa): number {
  return Math.max(Math.abs(((e.MEd as number) * N_PAR_KN) / (e.VEd as number)), e.d as number);
}

/** Le remplacement de d par a_v n est permis que si a_cs < 4 d (8.2.2(3)). */
function conditionAcs(e: EntreeTsa): Cle | null {
  return longueurAcs(e) < 4 * (e.d as number) ? null : 'motif.acs-sup-4d';
}

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

/**
 * V_Rd,c = max(C_Rd,c k (100 rho_l fck)^(1/3) ; v_min) b_w d, sans effort
 * normal (6.2.2(1)). C_Rd,c = 0,18/gamma_c, k = 1 + sqrt(200/d) <= 2,
 * rho_l <= 0,02, v_min = 0,035 k^(3/2) fck^(1/2).
 */
export function vrdc2004(e: Required<Pick<EntreeTsa, 'VEd' | 'bw' | 'd' | 'Asl' | 'fck'>>): Calcul {
  const { VEd, bw, d, Asl, fck } = e;
  positif(VEd, 'VEd', 'kN');
  positif(bw, 'bw', 'mm');
  positif(d, 'd', 'mm');
  positif(Asl, 'Asl', 'mm2');
  const cRdc = 0.18 / GAMMA_C_2004;
  const k = Math.min(1 + Math.sqrt(200 / d), 2);
  const rhoL = Math.min(Asl / (bw * d), 0.02);
  const vCalc = cRdc * k * (100 * rhoL * fck) ** (1 / 3);
  const vMin = 0.035 * k ** 1.5 * Math.sqrt(fck);
  const vRd = Math.max(vCalc, vMin);
  const VRd = (vRd * bw * d) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: VEd,
    resistance: VRd,
    intermediaires: {
      'C_Rd,c': recommandee(cRdc, '-'),
      k: calculee(k, '-'),
      'ρ_l': calculee(rhoL, '-'),
      'v_Rd,c': calculee(vCalc, 'MPa'),
      v_min: calculee(vMin, 'MPa'),
      'V_Rd,c': calculee(VRd, 'kN'),
    },
    clauses: ['6.2.2(1)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeTsa>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '6.2.2(1)',
    hypothese: 'niveau.tsa.2004.base',
    donneesRequises: [R.VEd, R.bw, R.d, R.Asl, R.fck],
    domaine: domaineFck,
    conditions: () => null,
    calculer: (e) => vrdc2004(e as Required<EntreeTsa>),
  },
];

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

interface Communs2023 {
  z: number;
  tauEd: number;
  ddg: number;
  fyd: number;
  tauMin: number;
}

/** Grandeurs communes aux trois niveaux : z = 0,9 d, tau_Ed, d_dg, tau_Rdc,min (8.20). */
function communs2023(e: Required<EntreeTsa>): Communs2023 {
  positif(e.VEd, 'VEd', 'kN');
  positif(e.bw, 'bw', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.fyk, 'fyk', 'MPa');
  const z = 0.9 * e.d;
  const tauEd = (e.VEd * N_PAR_KN) / (e.bw * z);
  const ddg = ddg2023(e.fck, e.Dlower);
  const fyd = e.fyk / GAMMA_S_2023;
  const tauMin = (11 / GAMMA_V_2023) * Math.sqrt(((e.fck / fyd) * ddg) / e.d);
  return { z, tauEd, ddg, fyd, tauMin };
}

function cellule2023(e: Required<EntreeTsa>, c: Communs2023, tauRd: number, extra: Cellule['intermediaires'], clauses: string[]): Calcul {
  const VRd = (tauRd * e.bw * c.z) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      'γ_V': recommandee(GAMMA_V_2023, '-'),
      z: calculee(c.z, 'mm'),
      'τ_Ed': calculee(c.tauEd, 'MPa'),
      d_dg: calculee(c.ddg, 'mm'),
      'τ_Rdc,min': calculee(c.tauMin, 'MPa'),
      ...extra,
      'τ_Rd,c': calculee(tauRd, 'MPa'),
      'V_Rd,c': calculee(VRd, 'kN'),
    },
    clauses,
  };
}

/** Niveau 1 : la section resiste au moins a tau_Rdc,min (8.2.1(4), (8.20)). */
export function niveau1Tsa2023(e: Required<EntreeTsa>): Calcul {
  const c = communs2023(e);
  return cellule2023(e, c, c.tauMin, {}, ['8.2.1(4)']);
}

/**
 * tau_Rd,c = 0,66/gamma_V (100 rho_l fck d_dg / l)^(1/3) >= tau_Rdc,min, avec
 * l = d au niveau 2 (8.27) et l = a_v au niveau 3 ((8.29), (8.30)).
 */
function tauRdc2023(e: Required<EntreeTsa>, c: Communs2023, longueur: number): { tau: number; rhoL: number; brut: number } {
  positif(e.Asl, 'Asl', 'mm2');
  const rhoL = e.Asl / (e.bw * e.d);
  const brut = (0.66 / GAMMA_V_2023) * ((100 * rhoL * e.fck * c.ddg) / longueur) ** (1 / 3);
  return { tau: Math.max(brut, c.tauMin), rhoL, brut };
}

export function niveau2Tsa2023(e: Required<EntreeTsa>): Calcul {
  const c = communs2023(e);
  const t = tauRdc2023(e, c, e.d);
  return cellule2023(e, c, t.tau, { 'ρ_l': calculee(t.rhoL, '-'), 'τ_Rd,c (8.27)': calculee(t.brut, 'MPa') }, ['8.2.2(1)', '(8.27)']);
}

export function niveau3Tsa2023(e: Required<EntreeTsa>): Calcul {
  const c = communs2023(e);
  const acs = longueurAcs(e);
  const av = Math.sqrt((acs * e.d) / 4);
  const t = tauRdc2023(e, c, av);
  return cellule2023(
    e,
    c,
    t.tau,
    {
      'ρ_l': calculee(t.rhoL, '-'),
      a_cs: calculee(acs, 'mm'),
      a_v: calculee(av, 'mm'),
      'τ_Rd,c (a_v)': calculee(t.brut, 'MPa'),
    },
    ['8.2.2(3)', '(8.29)', '(8.30)'],
  );
}

const communs = [R.VEd, R.bw, R.d, R.fck, R.fyk, R.Dlower];

const niveaux2023: DefinitionNiveau<EntreeTsa>[] = [
  {
    id: 'tau-min',
    ordre: 1,
    clause: '8.2.1(4)',
    hypothese: 'niveau.tsa.2023.tau-min',
    donneesRequises: communs,
    domaine: domaine2023,
    conditions: () => null,
    calculer: (e) => niveau1Tsa2023(e as Required<EntreeTsa>),
  },
  {
    id: 'hauteur-utile',
    ordre: 2,
    clause: '8.2.2(1)',
    hypothese: 'niveau.tsa.2023.hauteur-utile',
    donneesRequises: [...communs, R.Asl],
    domaine: domaine2023,
    conditions: () => null,
    calculer: (e) => niveau2Tsa2023(e as Required<EntreeTsa>),
  },
  {
    id: 'portee-mecanique',
    ordre: 3,
    clause: '8.2.2(3)',
    hypothese: 'niveau.tsa.2023.portee-mecanique',
    donneesRequises: [...communs, R.Asl, R.MEd],
    domaine: domaine2023,
    conditions: conditionAcs,
    calculer: (e) => niveau3Tsa2023(e as Required<EntreeTsa>),
  },
];

export const tranchantSansArmature: Mecanisme<EntreeTsa> = {
  id: 'tranchant-sans-armature',
  version: '0.1.0',
  titre: 'meca.tsa.titre',
  champs: [
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'MEd', libelle: 'champ.MEd', symbole: 'M_Ed', unite: 'kN·m', facultatif: true },
    { type: 'nombre', id: 'bw', libelle: 'champ.bw', symbole: 'b_w', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'Asl', libelle: 'champ.Asl', symbole: 'A_sl', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-tranchant', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-tranchant', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
