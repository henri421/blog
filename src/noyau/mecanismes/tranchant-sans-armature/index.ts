/**
 * Effort tranchant des elements sans armature d effort tranchant.
 *
 * Unites : kN, kN.m, mm, MPa.
 *
 * Premiere generation : 6.2.2(1) sans effort normal, puis avec le terme
 *   k1 sigma_cp (k1 = 0,15, sigma_cp = N_Ed/A_c <= 0,2 f_cd, compression positive).
 * Deuxieme generation : 8.2.1 et 8.2.2, trois niveaux :
 *   1. resistance minimale tau_Rdc,min, qui dispense de toute verification
 *      plus fine et n exige pas le ferraillage longitudinal ;
 *   2. tau_Rd,c avec la hauteur utile d ;
 *   3. tau_Rd,c avec la portee mecanique a_v, qui exige le moment concomitant.
 * Le niveau 3 n est permis que si a_cs < 4 d (8.2.2(3)) : a_v reste alors
 * inferieur a d et le niveau 3 ne peut pas etre moins favorable que le 2.
 * Au-dela, il est non applicable, avec ce motif.
 * Effort normal (8.2.2(4) et (5)), convention de 3.10 : N_Ed positif en traction.
 *   - d (ou a_v) multiplie par k_vp = 1 + N_Ed/|V_Ed| . d/(3 a_cs) >= 0,1 (8.31) ;
 *   - en compression, variante tau_Rdc,0 - k1 sigma_cp bornee par tau_Rdc,min et
 *     tau_Rdc,max ((8.32) a (8.35)), k1 selon la NOTE (8.34). Choix de l outil :
 *     element non precontraint, a_cs,0 = a_cs (M_Ed et V_Ed saisis hors effet de
 *     l effort normal), A_c = b_w h ; le remplacement de d par a_v,0 dans k1 n est
 *     pas code.
 *   4. annexe I.8.3.1 (informative, evaluation des structures existantes) :
 *      tau_Rd,c tire de la deformation epsilon_v des armatures longitudinales
 *      (I.7), en variante de 8.2.2(2) a (5) ; niveau en reserve.
 *      Choix de l outil : epsilon_v est obtenu par l equilibre de la section
 *      rectangulaire b_w x d sous M_Ed seul, avec les hypotheses de 8.1.1
 *      (sections planes, beton tendu neglige, parabole-rectangle sur f_cd,
 *      acier elastique parfaitement plastique) ; pas de plancher tau_Rdc,min,
 *      que (I.7) ne mentionne pas.
 *   5. annexe I.8.3.1(3) : pour d > 500 mm, en variante de (1) et (2), la
 *      resistance (8.27) multipliee par k_vd = 1,35 (100 rho_l d_dg/d)^(1/10)
 *      <= 1 (I.8) ; niveau en reserve, non applicable si d <= 500 mm.
 *      Choix de l outil : k_vd porte sur la valeur de la formule (8.27), le
 *      plancher tau_Rdc,min de 8.2.2(1) est conserve. Le texte vise les
 *      elements lineaires : l outil ne peut pas le verifier.
 *
 * Domaine de la deuxieme generation : D_lower >= 8 mm (1.1(3)).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { ES, GAMMA_C_2004, GAMMA_S_2023, GAMMA_V_2023, ddg2023, fcd2004, fcd2023, positif } from '../../materiaux';

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
  /** Effort normal concomitant (kN), positif en traction (3.10). */
  NEd?: number;
  /** Hauteur totale de la section (mm), pour A_c = b_w h. */
  h?: number;
  /** Excentricite de l effort de compression par rapport au centre de gravite (mm), positive vers la face tendue. */
  ep?: number;
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
  NEd: { champ: 'NEd', libelle: 'champ.NEd-normal' },
  h: { champ: 'h', libelle: 'champ.h' },
  ep: { champ: 'ep', libelle: 'champ.ep' },
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

/**
 * Avec effort normal (6.2.2(1)) : v = max(C_Rd,c k (100 rho_l fck)^(1/3) ;
 * v_min) + k1 sigma_cp, k1 = 0,15, sigma_cp = N/A_c plafonne a 0,2 f_cd,
 * compression positive en 2004.
 */
export function vrdc2004EffortNormal(e: Required<EntreeTsa>): Calcul {
  const base = vrdc2004(e);
  positif(e.h, 'h', 'mm');
  const k1 = 0.15;
  const sigmaCp = Math.min((-e.NEd * N_PAR_KN) / (e.bw * e.h), 0.2 * fcd2004(e.fck));
  const v = Math.max(base.intermediaires['v_Rd,c'].valeur, base.intermediaires.v_min.valeur) + k1 * sigmaCp;
  const VRd = (v * e.bw * e.d) / N_PAR_KN;
  return {
    ...base,
    resistance: VRd,
    intermediaires: {
      ...base.intermediaires,
      k_1: recommandee(k1, '-'),
      'σ_cp': calculee(sigmaCp, 'MPa'),
      'v_Rd,c + k_1 σ_cp': calculee(v, 'MPa'),
      'V_Rd,c': calculee(VRd, 'kN'),
    },
    clauses: ['6.2.2(1)', '(6.2.a)', '(6.2.b)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeTsa>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '6.2.2(1)',
    hypothese: 'niveau.tsa.2004.base',
    donneesRequises: [R.VEd, R.bw, R.d, R.Asl, R.fck],
    domaine: domaineFck,
    conditions: () => null,
    calculer: (e) => vrdc2004(e as Required<EntreeTsa>),
  },
  {
    id: 'effort-normal',
    ordre: 2,
    position: 'corps',
    clause: '6.2.2(1)',
    hypothese: 'niveau.tsa.2004.effort-normal',
    donneesRequises: [R.VEd, R.bw, R.d, R.Asl, R.fck, R.NEd, R.h],
    domaine: domaineFck,
    conditions: () => null,
    calculer: (e) => vrdc2004EffortNormal(e as Required<EntreeTsa>),
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

// ---------------------------------------------------------------------------
// Effort normal (8.2.2(4) et (5))
// ---------------------------------------------------------------------------

/** k_vp = 1 + N_Ed/|V_Ed| . d/(3 a_cs) >= 0,1 (8.31), N_Ed positif en traction. */
export function coefficientKvp(e: Required<EntreeTsa>): number {
  return Math.max(1 + (e.NEd / Math.abs(e.VEd)) * (e.d / (3 * longueurAcs(e))), 0.1);
}

/** tau_Rd,c (8.27) ou (8.29) avec la longueur multipliee par k_vp (8.2.2(4)). */
export function niveauKvpTsa2023(e: Required<EntreeTsa>, portee: boolean): Calcul {
  const c = communs2023(e);
  const kvp = coefficientKvp(e);
  const acs = longueurAcs(e);
  const base = portee ? Math.sqrt((acs * e.d) / 4) : e.d;
  const t = tauRdc2023(e, c, kvp * base);
  return cellule2023(
    e,
    c,
    t.tau,
    {
      'ρ_l': calculee(t.rhoL, '-'),
      a_cs: calculee(acs, 'mm'),
      k_vp: calculee(kvp, '-'),
      [portee ? 'k_vp a_v' : 'k_vp d']: calculee(kvp * base, 'mm'),
      'τ_Rd,c (k_vp)': calculee(t.brut, 'MPa'),
    },
    portee ? ['8.2.2(3)', '8.2.2(4)', '(8.29)', '(8.31)'] : ['8.2.2(4)', '(8.27)', '(8.31)'],
  );
}

/** La variante (8.32) ne vaut qu en compression. */
function conditionCompression(e: EntreeTsa): Cle | null {
  return (e.NEd as number) < 0 ? null : 'motif.ned-pas-compression';
}

/**
 * tau_Rdc,min <= tau_Rd,c = tau_Rdc,0 - k1 sigma_cp <= tau_Rdc,max ((8.32) a
 * (8.35)), sigma_cp = N_Ed/A_c (negatif en compression).
 */
export function niveauCompressionTsa2023(e: Required<EntreeTsa>): Calcul {
  const c = communs2023(e);
  positif(e.Asl, 'Asl', 'mm2');
  positif(e.h, 'h', 'mm');
  const rhoL = e.Asl / (e.bw * e.d);
  const tau0 = (0.66 / GAMMA_V_2023) * ((100 * rhoL * e.fck * c.ddg) / e.d) ** (1 / 3);
  const Ac = e.bw * e.h;
  const sigmaCp = (e.NEd * N_PAR_KN) / Ac;
  const acs0 = longueurAcs(e);
  const k1 = Math.min((0.5 * acs0) / (e.ep + e.d / 3), 0.18) * (Ac / (e.bw * e.d));
  const tauMax = Math.min(2.15 * tau0 * (acs0 / e.d) ** (1 / 6), 2.7 * tau0);
  const tau = Math.min(Math.max(tau0 - k1 * sigmaCp, c.tauMin), tauMax);
  return cellule2023(
    e,
    c,
    tau,
    {
      'ρ_l': calculee(rhoL, '-'),
      'τ_Rdc,0': calculee(tau0, 'MPa'),
      A_c: calculee(Ac, 'mm²'),
      'σ_cp': calculee(sigmaCp, 'MPa'),
      'a_cs,0': calculee(acs0, 'mm'),
      k_1: recommandee(k1, '-'),
      'τ_Rdc,max': calculee(tauMax, 'MPa'),
      'τ_Rdc,0 − k_1 σ_cp': calculee(tau0 - k1 * sigmaCp, 'MPa'),
    },
    ['8.2.2(5)', '(8.32)', '(8.33)', '(8.34)', '(8.35)'],
  );
}

// ---------------------------------------------------------------------------
// Niveau 4 : annexe I.8.3.1
// ---------------------------------------------------------------------------

/** Coefficient partiel sur le calcul de la deformation, valeur recommandee (I.8.3.1(1), NOTE). */
export const GAMMA_DEF = 1.33;
const EPS_C2 = 0.002;
const EPS_CU = 0.0035;
const N_MM_PAR_KN_M = 1e6;

/** Contrainte de compression du beton, parabole-rectangle d exposant 2 (8.1.2). */
function sigmaBeton(eps: number, fcd: number): number {
  if (eps <= 0) return 0;
  if (eps >= EPS_C2) return fcd;
  const r = eps / EPS_C2;
  return fcd * (1 - (1 - r) ** 2);
}

/**
 * Integrales sans dimension du bloc comprime pour un raccourcissement eps_c
 * en fibre extreme : a = moyenne de sigma/f_cd, m = moment par rapport a l axe
 * neutre (u = distance a l axe neutre / x). Simpson sur 200 intervalles.
 */
function bloc(epsC: number, fcd: number): { a: number; m: number } {
  const n = 200;
  let a = 0;
  let m = 0;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const w = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    const s = sigmaBeton(epsC * u, fcd) / fcd;
    a += w * s;
    m += w * s * u;
  }
  return { a: a / (3 * n), m: m / (3 * n) };
}

export interface EtatFlexion {
  /** Allongement des armatures tendues. */
  epsS: number;
  /** Raccourcissement du beton en fibre extreme. */
  epsC: number;
  /** Profondeur de l axe neutre (mm). */
  x: number;
  iterations: number;
}

/**
 * Etat de deformation d une section rectangulaire b x d armee de A_s tendus
 * sous le moment M (N.mm), hypotheses de 8.1.1. Rend null si M depasse la
 * capacite atteinte a eps_c = eps_cu. Bissection exterieure sur eps_c,
 * interieure sur x (equilibre des forces).
 */
export function etatFlexion(M: number, b: number, d: number, As: number, fcd: number, fyd: number): EtatFlexion | null {
  if (M <= 0) return { epsS: 0, epsC: 0, x: 0, iterations: 0 };
  const etat = (epsC: number): { x: number; epsS: number; moment: number } => {
    const { a, m } = bloc(epsC, fcd);
    let bas = 1e-9 * d;
    let haut = d * (1 - 1e-9);
    for (let i = 0; i < 100; i++) {
      const x = (bas + haut) / 2;
      const epsS = (epsC * (d - x)) / x;
      const ecart = b * x * a * fcd - As * Math.min(ES * epsS, fyd);
      if (ecart > 0) haut = x;
      else bas = x;
    }
    const x = (bas + haut) / 2;
    const epsS = (epsC * (d - x)) / x;
    const C = b * x * a * fcd;
    return { x, epsS, moment: C * (d - x + (x * m) / a) };
  };
  if (etat(EPS_CU).moment < M) return null;
  let bas = 0;
  let haut = EPS_CU;
  let iterations = 0;
  while (haut - bas > 1e-12 && iterations < 200) {
    iterations++;
    const milieu = (bas + haut) / 2;
    if (etat(milieu).moment > M) haut = milieu;
    else bas = milieu;
  }
  const epsC = (bas + haut) / 2;
  const f = etat(epsC);
  return { epsS: f.epsS, epsC, x: f.x, iterations };
}

function etatTsa(e: Required<EntreeTsa>): EtatFlexion | null {
  return etatFlexion(Math.abs(e.MEd) * N_MM_PAR_KN_M, e.bw, e.d, e.Asl, fcd2023(e.fck), e.fyk / GAMMA_S_2023);
}

/**
 * Le moment doit rester sous la capacite de la section, sinon epsilon_v n existe
 * pas. L outil ne calcule epsilon_v que sous M_Ed seul : un effort normal non
 * nul rend le niveau non applicable plutot que de l ignorer.
 */
function conditionMoment(e: EntreeTsa): Cle | null {
  if (e.NEd !== undefined && e.NEd !== null && (e.NEd as number) !== 0) return 'motif.annexe-i-effort-normal';
  return etatTsa(e as Required<EntreeTsa>) === null ? 'motif.med-sup-mrd' : null;
}

/**
 * tau_Rd,c = 0,33/gamma_V . gamma_def^(2/3)/gamma_V^2 . sqrt(fck) /
 * (1 + 24 gamma_def epsilon_v d/d_dg) (I.7).
 */
export function niveau4Tsa2023(e: Required<EntreeTsa>): Calcul {
  const c = communs2023(e);
  positif(e.Asl, 'Asl', 'mm2');
  const etat = etatTsa(e);
  if (etat === null) throw new Error('M_Ed depasse la capacite de la section.');
  const facteur = (0.33 / GAMMA_V_2023) * (GAMMA_DEF ** (2 / 3) / GAMMA_V_2023 ** 2);
  const tau = (facteur * Math.sqrt(e.fck)) / (1 + 24 * GAMMA_DEF * etat.epsS * (e.d / c.ddg));
  const cellule = cellule2023(
    e,
    c,
    tau,
    {
      'γ_def': recommandee(GAMMA_DEF, '-'),
      f_cd: calculee(fcd2023(e.fck), 'MPa'),
      x: calculee(etat.x, 'mm'),
      'ε_v': calculee(etat.epsS * 1000, '‰'),
      'τ_Rd,c (I.7)': calculee(tau, 'MPa'),
    },
    ['I.8.3.1(1)', '(I.7)', 'I.8.3.1(2)', '8.1.1'],
  );
  return { ...cellule, iterations: etat.iterations };
}

/** Le coefficient k_vd ne vise que les hauteurs utiles superieures a 500 mm (I.8.3.1(3)). */
function conditionKvd(e: EntreeTsa): Cle | null {
  return (e.d as number) > 500 ? null : 'motif.d-inf-500';
}

/** k_vd = 1,35 (100 rho_l d_dg / d)^(1/10) <= 1,0 (I.8). */
export function coefficientKvd(rhoL: number, ddg: number, d: number): number {
  return Math.min(1.35 * ((100 * rhoL * ddg) / d) ** 0.1, 1);
}

export function niveau5Tsa2023(e: Required<EntreeTsa>): Calcul {
  const c = communs2023(e);
  const t = tauRdc2023(e, c, e.d);
  const kvd = coefficientKvd(t.rhoL, c.ddg, e.d);
  const tau = Math.max(kvd * t.brut, c.tauMin);
  return cellule2023(
    e,
    c,
    tau,
    {
      'ρ_l': calculee(t.rhoL, '-'),
      'τ_Rd,c (8.27)': calculee(t.brut, 'MPa'),
      k_vd: calculee(kvd, '-'),
      'k_vd τ_Rd,c': calculee(kvd * t.brut, 'MPa'),
    },
    ['I.8.3.1(3)', '(I.8)', '(8.27)'],
  );
}

const communs = [R.VEd, R.bw, R.d, R.fck, R.fyk, R.Dlower];

const niveaux2023: DefinitionNiveau<EntreeTsa>[] = [
  {
    id: 'tau-min',
    ordre: 1,
    position: 'corps',
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
    position: 'corps',
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
    position: 'corps',
    clause: '8.2.2(3)',
    hypothese: 'niveau.tsa.2023.portee-mecanique',
    donneesRequises: [...communs, R.Asl, R.MEd],
    domaine: domaine2023,
    conditions: conditionAcs,
    calculer: (e) => niveau3Tsa2023(e as Required<EntreeTsa>),
  },
  {
    id: 'kvp',
    ordre: 4,
    position: 'corps',
    clause: '8.2.2(4)',
    hypothese: 'niveau.tsa.2023.kvp',
    donneesRequises: [...communs, R.Asl, R.MEd, R.NEd],
    domaine: domaine2023,
    conditions: () => null,
    calculer: (e) => niveauKvpTsa2023(e as Required<EntreeTsa>, false),
  },
  {
    id: 'kvp-portee',
    ordre: 5,
    position: 'corps',
    clause: '8.2.2(4)',
    hypothese: 'niveau.tsa.2023.kvp-portee',
    donneesRequises: [...communs, R.Asl, R.MEd, R.NEd],
    domaine: domaine2023,
    conditions: conditionAcs,
    calculer: (e) => niveauKvpTsa2023(e as Required<EntreeTsa>, true),
  },
  {
    id: 'compression',
    ordre: 6,
    position: 'corps',
    clause: '8.2.2(5)',
    hypothese: 'niveau.tsa.2023.compression',
    donneesRequises: [...communs, R.Asl, R.MEd, R.NEd, R.h, R.ep],
    domaine: domaine2023,
    conditions: conditionCompression,
    calculer: (e) => niveauCompressionTsa2023(e as Required<EntreeTsa>),
  },
  {
    id: 'annexe-i',
    ordre: 7,
    position: 'annexe-informative',
    reserve: 'reserve.annexe-i',
    clause: 'I.8.3.1',
    hypothese: 'niveau.tsa.2023.annexe-i',
    donneesRequises: [...communs, R.Asl, R.MEd],
    domaine: domaine2023,
    conditions: conditionMoment,
    calculer: (e) => niveau4Tsa2023(e as Required<EntreeTsa>),
  },
  {
    id: 'annexe-i-kvd',
    ordre: 8,
    position: 'annexe-informative',
    reserve: 'reserve.annexe-i',
    clause: 'I.8.3.1(3)',
    hypothese: 'niveau.tsa.2023.annexe-i-kvd',
    donneesRequises: [...communs, R.Asl],
    domaine: domaine2023,
    conditions: conditionKvd,
    calculer: (e) => niveau5Tsa2023(e as Required<EntreeTsa>),
  },
];

export const tranchantSansArmature: Mecanisme<EntreeTsa> = {
  id: 'tranchant-sans-armature',
  version: '0.4.0',
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
    { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-normal', symbole: 'N_Ed', unite: 'kN', facultatif: true },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'ep', libelle: 'champ.ep', symbole: 'e_p', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-tranchant', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-tranchant', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
