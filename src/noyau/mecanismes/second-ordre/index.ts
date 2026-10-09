/**
 * Second ordre des elements comprimes isoles, section rectangulaire a
 * armatures symetriques : critere d elancement et methode de la courbure
 * nominale.
 *
 * Unites : mm, kN, kN.m, MPa. Effort normal saisi en compression, positif.
 *
 * Premiere generation : lambda_lim = 20 A B C / sqrt(n) (5.13N) ;
 *   courbure nominale (5.8.8) : M_Ed = M_0Ed + M_2, M_0e = 0,6 M_02 + 0,4 M_01
 *   >= 0,4 M_02 (contreventé), M_2 = N e_2, e_2 = (1/r) l_0^2 / c, c = 10,
 *   1/r = K_r K_phi eps_yd / (0,45 d).
 * Deuxieme generation, annexe O (informative) : lambda_lim (O.12) ;
 *   courbure nominale (O.7) : M_0Ed = C_m M_02, C_m = 0,6 + 0,4 r_m >= 0,4,
 *   r_m = 1 si |M_02| < 0,05 N h (O.14 a O.16) ; e_2 = l_0^2 / c_1/r . 1/r,
 *   c_1/r = 8 contreventé, 10 sinon ; 1/r = k_r k_phi 2 eps_yd / (d - d')
 *   (O.19), k_r = 1 en premiere approximation ou (O.21), k_phi (O.22).
 *
 * Rigidite nominale (5.8.7 ; O.8) : M_Ed = M_0Ed [1 + beta/(N_B/N_Ed - 1)],
 *   beta = pi^2/8 avec le moment equivalent constant (contreventé), 1 sinon ;
 *   2004 : EI = K_c E_cd I_c + K_s E_s I_s, E_cd = E_cm/1,2 ((5.21) a (5.26)) ;
 *   2023 : EI = 0,4 E_cd I_c (O.8.1(5)), E_cd = E_cm/1,5 ((7.28), tableau 4.3).
 *   Choix de l outil : la rigidite forfaitaire de O.8.1(5), donnee pour
 *   l analyse globale, est retenue faute d expression pour l element isole.
 *
 * Choix de l outil :
 *   - imperfection : e_i = l_0/400 pour un element contreventé (5.2(7) ;
 *     7.2.1.2(5)), e_i = theta_i l_0/2 sinon, m = 1 ; N e_i s ajoute aux deux
 *     moments d extremite dans le sens de M_02 ;
 *   - moments exprimes dans le sens de M_02 (M_02 > 0, M_01 positif si la
 *     tension est du meme cote) ; M_Ed = max(M_0Ed + M_2 ; M_02) en 2004 (5.8.8.2) ;
 *     en 2023, (O.13) ajoute |M_01 - 0,5 M_2 - 2 |N_Ed| e_i|, ou M_01 inclut
 *     l imperfection comme M_02 (figure O.1 a) : le terme -2 N e_i la renverse ;
 *   - section rectangulaire b x h, armatures concentrees sur les deux faces :
 *     d - d' = 2 d - h ; f_cd 2023 avec k_tc = 0,85.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { ES, GAMMA_S_2004, GAMMA_S_2023, ecm2004, ecm2023, fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeSecondOrdre {
  b?: number;
  h?: number;
  d?: number;
  /** Section totale des armatures longitudinales (mm2), symetrique. */
  As?: number;
  fck?: number;
  fyk?: number;
  /** Longueur reelle de l element (mm). */
  l?: number;
  /** Longueur efficace (mm). */
  l0?: number;
  /** Effort normal de compression (kN), positif. */
  NEd?: number;
  /** Moments du premier ordre aux extremites, hors imperfection (kN.m), |M02| >= |M01|, meme signe si tension du meme cote. */
  M01?: number;
  M02?: number;
  /** Coefficient de fluage effectif. */
  phiEff?: number;
  /** 'oui' si l element est contreventé. */
  contrevente?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeSecondOrdre>;
const KN_M_PAR_KN_MM = 1e-3;
const N_PAR_KN = 1000;

const R = {
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  d: { champ: 'd', libelle: 'champ.d' },
  As: { champ: 'As', libelle: 'champ.As-total' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  l: { champ: 'l', libelle: 'champ.l-element' },
  l0: { champ: 'l0', libelle: 'champ.l0' },
  NEd: { champ: 'NEd', libelle: 'champ.NEd-compression' },
  M01: { champ: 'M01', libelle: 'champ.M01' },
  M02: { champ: 'M02', libelle: 'champ.M02' },
  phiEff: { champ: 'phiEff', libelle: 'champ.phiEff' },
  contrevente: { champ: 'contrevente', libelle: 'champ.contrevente' },
} as const satisfies Record<string, { champ: keyof EntreeSecondOrdre; libelle: Cle }>;

const requisesElancement = [R.b, R.h, R.As, R.fck, R.fyk, R.l0, R.NEd, R.M01, R.M02, R.phiEff, R.contrevente];
const requisesCourbure = [R.b, R.h, R.d, R.As, R.fck, R.fyk, R.l, R.l0, R.NEd, R.M01, R.M02, R.phiEff, R.contrevente];

function domaine(e: EntreeSecondOrdre): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function verifier(e: Complete): void {
  for (const [v, nom] of [
    [e.b, 'b'],
    [e.h, 'h'],
    [e.l0, 'l_0'],
    [e.NEd, 'N_Ed'],
  ] as const) {
    positif(v, nom, 'mm ou kN');
  }
  positif(e.As, 'A_s', 'mm2');
  if (!(e.phiEff >= 0)) throw new Error('phi_eff doit etre positif ou nul.');
  if (Math.abs(e.M01) > Math.abs(e.M02)) throw new Error('|M_01| doit etre inferieur ou egal a |M_02|.');
}

interface Section {
  Ac: number;
  i: number;
  lambda: number;
  n: number;
  omega: number;
  fcd: number;
  fyd: number;
}

function section(e: Complete, fcd: number, fyd: number): Section {
  const Ac = e.b * e.h;
  const i = e.h / Math.sqrt(12);
  return { Ac, i, lambda: e.l0 / i, n: (e.NEd * N_PAR_KN) / (Ac * fcd), omega: (e.As * fyd) / (Ac * fcd), fcd, fyd };
}

/** r_m = M01/M02, ou 1 pour un element non contreventé ou des moments negligeables. */
function rapportMoments(e: Complete, forceUn: boolean): number {
  if (forceUn || e.contrevente !== 'oui' || e.M02 === 0) return 1;
  return e.M01 / e.M02;
}

/** lambda_lim = 20 A B C / sqrt(n) ((5.13N) ; (O.12)). */
function elancement(e: Complete, s: Section, rm: number, clauses: string[]): Calcul {
  const A = 1 / (1 + 0.2 * e.phiEff);
  const B = Math.sqrt(1 + 2 * s.omega);
  const C = 1.7 - rm;
  const lim = (20 * A * B * C) / Math.sqrt(s.n);
  return {
    statut: { etat: 'calcule' },
    sollicitation: s.lambda,
    resistance: lim,
    intermediaires: {
      i: calculee(s.i, 'mm'),
      'λ': calculee(s.lambda, '-'),
      f_cd: calculee(s.fcd, 'MPa'),
      n: calculee(s.n, '-'),
      'ω': calculee(s.omega, '-'),
      r_m: calculee(rm, '-'),
      A: calculee(A, '-'),
      B: calculee(B, '-'),
      C: calculee(C, '-'),
      'λ_lim': calculee(lim, '-'),
    },
    clauses,
  };
}

export function elancement2004(e: Complete): Calcul {
  verifier(e);
  return elancement(e, section(e, fcd2004(e.fck), e.fyk / GAMMA_S_2004), rapportMoments(e, false), ['5.8.3.1', '(5.13N)', '5.8.3.2']);
}

export function elancement2023(e: Complete): Calcul {
  verifier(e);
  const s = section(e, fcd2023(e.fck), e.fyk / GAMMA_S_2023);
  return elancement(e, s, rapportMoments(e, false), ['O.6', '(O.12)', 'O.5']);
}

// ---------------------------------------------------------------------------
// Courbure nominale
// ---------------------------------------------------------------------------

function excentriciteImperfection(e: Complete, alphaHMin: number): number {
  if (e.contrevente === 'oui') return e.l0 / 400;
  positif(e.l, 'l', 'mm');
  const alphaH = Math.min(Math.max(2 / Math.sqrt(e.l / 1000), alphaHMin), 1);
  return ((alphaH / 200) * e.l0) / 2;
}

/**
 * Moments d extremite avec imperfection, exprimes dans le sens de M_02 :
 * M02 >= 0 et M01 positif si la tension est du meme cote.
 */
interface MomentsPremierOrdre {
  ei: number;
  M01: number;
  M02: number;
}

function premierOrdre(e: Complete, alphaHMin: number): MomentsPremierOrdre {
  const ei = excentriciteImperfection(e, alphaHMin);
  const sens = e.M02 < 0 ? -1 : 1;
  const ajout = e.NEd * ei * KN_M_PAR_KN_MM;
  return { ei, M01: sens * e.M01 + ajout, M02: sens * e.M02 + ajout };
}

function kr(s: Section): number {
  return Math.min((1 + s.omega - s.n) / (1 + s.omega - 0.4), 1);
}

function kphi(e: Complete, s: Section): number {
  const beta = 0.35 + e.fck / 200 - s.lambda / 150;
  return Math.max(1 + beta * e.phiEff, 1);
}

function celluleCourbure(
  e: Complete,
  p: MomentsPremierOrdre,
  M0Ed: number,
  courbure: number,
  c: number,
  inter: Cellule['intermediaires'],
  clauses: string[],
  avecO13 = false,
): Calcul {
  const e2 = (courbure * e.l0 ** 2) / c;
  const M2 = e.NEd * e2 * KN_M_PAR_KN_MM;
  // (O.13), troisieme terme : extremite 1 avec l imperfection renversee.
  const M1 = Math.abs(p.M01 - 0.5 * M2 - 2 * e.NEd * p.ei * KN_M_PAR_KN_MM);
  const MEd = Math.max(M0Ed + M2, p.M02, avecO13 ? M1 : 0);
  return {
    statut: { etat: 'calcule' },
    resistance: MEd,
    intermediaires: {
      e_i: calculee(p.ei, 'mm'),
      "M_01'": calculee(p.M01, 'kN·m'),
      "M_02'": calculee(p.M02, 'kN·m'),
      ...inter,
      M_0Ed: calculee(M0Ed, 'kN·m'),
      '1/r': calculee(courbure * 1000, '1/m'),
      c: recommandee(c, '-'),
      e_2: calculee(e2, 'mm'),
      M_2: calculee(M2, 'kN·m'),
      ...(avecO13 ? { '|M_01 − 0,5 M_2 − 2 N e_i|': calculee(M1, 'kN·m') } : {}),
      M_Ed: calculee(MEd, 'kN·m'),
    },
    clauses,
  };
}

export function courbure2004(e: Complete): Calcul {
  verifier(e);
  positif(e.d, 'd', 'mm');
  const s = section(e, fcd2004(e.fck), e.fyk / GAMMA_S_2004);
  const p = premierOrdre(e, 2 / 3);
  const M0e = e.contrevente === 'oui' ? Math.max(0.6 * p.M02 + 0.4 * p.M01, 0.4 * p.M02) : p.M02;
  const Kr = kr(s);
  const Kphi = kphi(e, s);
  const r0 = s.fyd / ES / (0.45 * e.d);
  return celluleCourbure(
    e,
    p,
    M0e,
    Kr * Kphi * r0,
    10,
    { 'λ': calculee(s.lambda, '-'), n: calculee(s.n, '-'), 'ω': calculee(s.omega, '-'), K_r: calculee(Kr, '-'), 'K_φ': calculee(Kphi, '-'), '1/r_0': calculee(r0 * 1000, '1/m') },
    ['5.8.8.2', '(5.31) à (5.33)', '5.8.8.3', '(5.34) à (5.37)'],
  );
}

function courbure2023(e: Complete, krPrecis: boolean): Calcul {
  verifier(e);
  positif(e.d, 'd', 'mm');
  const s = section(e, fcd2023(e.fck), e.fyk / GAMMA_S_2023);
  const p = premierOrdre(e, 0.4);
  let M0Ed = p.M02;
  let Cm = 1;
  let rm = 1;
  if (e.contrevente === 'oui') {
    rm = p.M02 < 0.05 * e.NEd * e.h * KN_M_PAR_KN_MM ? 1 : p.M01 / p.M02;
    Cm = Math.max(0.6 + 0.4 * rm, 0.4);
    M0Ed = Cm * p.M02;
  }
  const Kr = krPrecis ? kr(s) : 1;
  const Kphi = kphi(e, s);
  const dd = 2 * e.d - e.h;
  positif(dd, "d - d'", 'mm');
  const r0 = (2 * (s.fyd / ES)) / dd;
  const c = e.contrevente === 'oui' ? 8 : 10;
  return celluleCourbure(
    e,
    p,
    M0Ed,
    Kr * Kphi * r0,
    c,
    {
      'λ': calculee(s.lambda, '-'),
      n: calculee(s.n, '-'),
      'ω': calculee(s.omega, '-'),
      r_m: calculee(rm, '-'),
      C_m: calculee(Cm, '-'),
      k_r: krPrecis ? calculee(Kr, '-') : recommandee(Kr, '-'),
      'k_φ': calculee(Kphi, '-'),
      "d − d'": calculee(dd, 'mm'),
      '1/r_0': calculee(r0 * 1000, '1/m'),
    },
    krPrecis ? ['O.7.2', '(O.13) à (O.18)', 'O.7.3', '(O.19) à (O.22)'] : ['O.7.2', '(O.13) à (O.18)', 'O.7.3(3)', '(O.19)', '(O.22)'],
    true,
  );
}

export const courbure2023Kr1 = (e: Complete): Calcul => courbure2023(e, false);
export const courbure2023KrPrecis = (e: Complete): Calcul => courbure2023(e, true);

/** K_r ((5.36) ; (O.21)) n a de sens que si n reste sous n_u = 1 + omega. */
function compressionAdmissible(fcd: (fck: number) => number, gammaS: number) {
  return (e: EntreeSecondOrdre): Cle | null => {
    const c = e as Complete;
    const f = fcd(c.fck);
    const n = (c.NEd * N_PAR_KN) / (c.b * c.h * f);
    const omega = (c.As * (c.fyk / gammaS)) / (c.b * c.h * f);
    return n < 1 + omega ? null : 'motif.n-sup-nu';
  };
}

export const elancementLimite: Mecanisme<EntreeSecondOrdre> = {
  id: 'elancement-limite',
  version: '0.1.0',
  titre: 'meca.so.elancement',
  champs: [],
  sollicitation: { libelle: 'grandeur.elancement-poteau', unite: '-' },
  resistance: { libelle: 'grandeur.elancement-limite-poteau', unite: '-' },
  niveaux: {
    'ec2-2004': [
      {
        id: 'base',
        ordre: 1,
        position: 'corps',
        clause: '5.8.3.1',
        hypothese: 'niveau.so.2004.elancement',
        donneesRequises: requisesElancement,
        domaine,
        conditions: () => null,
        calculer: (e) => elancement2004(e as Complete),
      },
    ],
    'ec2-2023': [
      {
        id: 'base',
        ordre: 1,
        position: 'annexe-informative',
        reserve: 'reserve.annexe-o',
        clause: 'O.6',
        hypothese: 'niveau.so.2023.elancement',
        donneesRequises: requisesElancement,
        domaine,
        conditions: () => null,
        calculer: (e) => elancement2023(e as Complete),
      },
    ],
  },
};

const niveauxCourbure2004: DefinitionNiveau<EntreeSecondOrdre>[] = [
  {
    id: 'courbure',
    ordre: 1,
    position: 'corps',
    clause: '5.8.8',
    hypothese: 'niveau.so.2004.courbure',
    donneesRequises: requisesCourbure,
    domaine,
    conditions: compressionAdmissible(fcd2004, GAMMA_S_2004),
    calculer: (e) => courbure2004(e as Complete),
  },
];

const niveauxCourbure2023: DefinitionNiveau<EntreeSecondOrdre>[] = [
  {
    id: 'kr-1',
    ordre: 1,
    position: 'annexe-informative',
    reserve: 'reserve.annexe-o',
    clause: 'O.7.3(3)',
    hypothese: 'niveau.so.2023.kr-1',
    donneesRequises: requisesCourbure,
    domaine,
    conditions: () => null,
    calculer: (e) => courbure2023Kr1(e as Complete),
  },
  {
    id: 'kr-precis',
    ordre: 2,
    position: 'annexe-informative',
    reserve: 'reserve.annexe-o',
    clause: 'O.7.3(3)',
    hypothese: 'niveau.so.2023.kr-precis',
    donneesRequises: requisesCourbure,
    domaine,
    conditions: compressionAdmissible(fcd2023, GAMMA_S_2023),
    calculer: (e) => courbure2023KrPrecis(e as Complete),
  },
];

const CHAMPS: Mecanisme<EntreeSecondOrdre>['champs'] = [
  { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-compression', symbole: 'N_Ed', unite: 'kN' },
  { type: 'nombre', id: 'M01', libelle: 'champ.M01', symbole: 'M_01', unite: 'kN·m' },
  { type: 'nombre', id: 'M02', libelle: 'champ.M02', symbole: 'M_02', unite: 'kN·m' },
  { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
  { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
  { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
  { type: 'nombre', id: 'As', libelle: 'champ.As-total', symbole: 'A_s', unite: 'mm²' },
  { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
  { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
  { type: 'nombre', id: 'l', libelle: 'champ.l-element', symbole: 'l', unite: 'mm' },
  { type: 'nombre', id: 'l0', libelle: 'champ.l0', symbole: 'l_0', unite: 'mm' },
  { type: 'nombre', id: 'phiEff', libelle: 'champ.phiEff', symbole: 'φ_eff', unite: '-' },
  {
    type: 'choix',
    id: 'contrevente',
    libelle: 'champ.contrevente',
    options: [
      { valeur: 'oui', libelle: 'option.oui' },
      { valeur: 'non', libelle: 'option.non' },
    ],
  },
];

elancementLimite.champs.push(...CHAMPS.filter((c) => c.id !== 'd' && c.id !== 'l'));

export const courbureNominale: Mecanisme<EntreeSecondOrdre> = {
  id: 'courbure-nominale',
  version: '0.1.0',
  titre: 'meca.so.courbure',
  champs: CHAMPS,
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.moment-calcul-second-ordre', unite: 'kN·m' },
  niveaux: { 'ec2-2004': niveauxCourbure2004, 'ec2-2023': niveauxCourbure2023 },
};

// ---------------------------------------------------------------------------
// Rigidite nominale et majoration des moments
// ---------------------------------------------------------------------------

/** gamma_cE : 1,2 en premiere generation (5.8.6(3)), 1,5 en deuxieme (tableau 4.3). */
export const GAMMA_CE_2004 = 1.2;
export const GAMMA_CE_2023 = 1.5;

interface Rigidite {
  EI: number;
  inter: Cellule['intermediaires'];
}

/** M_Ed = M_0Ed [1 + beta / (N_B/N_Ed - 1)], au moins M_02 ((5.28) ; (O.23)). */
function majoration(
  e: Complete,
  p: MomentsPremierOrdre,
  M0Ed: number,
  beta: number,
  r: Rigidite,
  inter: Cellule['intermediaires'],
  clauses: string[],
): Calcul {
  const NB = (Math.PI ** 2 * r.EI) / e.l0 ** 2 / N_PAR_KN;
  const facteur = 1 + beta / (NB / e.NEd - 1);
  const MEd = Math.max(M0Ed * facteur, p.M02);
  return {
    statut: { etat: 'calcule' },
    resistance: MEd,
    intermediaires: {
      e_i: calculee(p.ei, 'mm'),
      "M_01'": calculee(p.M01, 'kN·m'),
      "M_02'": calculee(p.M02, 'kN·m'),
      ...inter,
      ...r.inter,
      EI: calculee(r.EI / 1e9, 'kN·m²'),
      N_B: calculee(NB, 'kN'),
      'β': calculee(beta, '-'),
      M_0Ed: calculee(M0Ed, 'kN·m'),
      'facteur de majoration': calculee(facteur, '-'),
      M_Ed: calculee(MEd, 'kN·m'),
    },
    clauses,
  };
}

function rigidite2004(e: Complete, simplifiee: boolean): Calcul {
  verifier(e);
  positif(e.d, 'd', 'mm');
  const s = section(e, fcd2004(e.fck), e.fyk / GAMMA_S_2004);
  const p = premierOrdre(e, 2 / 3);
  const Ecd = ecm2004(e.fck) / GAMMA_CE_2004;
  const Ic = (e.b * e.h ** 3) / 12;
  const Is = e.As * (e.d - e.h / 2) ** 2;
  let Kc: number;
  let Ks: number;
  const inter: Cellule['intermediaires'] = { E_cd: calculee(Ecd, 'MPa'), 'ρ': calculee(e.As / s.Ac, '-') };
  if (simplifiee) {
    Ks = 0;
    Kc = 0.3 / (1 + 0.5 * e.phiEff);
  } else {
    const k1 = Math.sqrt(e.fck / 20);
    const k2 = Math.min((s.n * s.lambda) / 170, 0.2);
    Ks = 1;
    Kc = (k1 * k2) / (1 + e.phiEff);
    inter.k_1 = calculee(k1, '-');
    inter.k_2 = calculee(k2, '-');
  }
  inter.K_c = calculee(Kc, '-');
  inter.K_s = recommandee(Ks, '-');
  const EI = Kc * Ecd * Ic + Ks * ES * Is;
  const braced = e.contrevente === 'oui';
  const M0Ed = braced ? Math.max(0.6 * p.M02 + 0.4 * p.M01, 0.4 * p.M02) : p.M02;
  const beta = braced ? Math.PI ** 2 / 8 : 1;
  return majoration(
    e,
    p,
    M0Ed,
    beta,
    { EI, inter },
    { 'λ': calculee(s.lambda, '-'), n: calculee(s.n, '-') },
    simplifiee ? ['5.8.7.2(3)', '(5.21)', '(5.26)', '5.8.7.3', '(5.28)'] : ['5.8.7.2(2)', '(5.21) à (5.25)', '5.8.7.3', '(5.28)', '(5.29)'],
  );
}

export function rigidite2023(e: Complete): Calcul {
  verifier(e);
  const s = section(e, fcd2023(e.fck), e.fyk / GAMMA_S_2023);
  const p = premierOrdre(e, 0.4);
  const Ecd = ecm2023(e.fck) / GAMMA_CE_2023;
  const Ic = (e.b * e.h ** 3) / 12;
  const EI = 0.4 * Ecd * Ic;
  const braced = e.contrevente === 'oui';
  let M0Ed = p.M02;
  let Cm = 1;
  if (braced) {
    const rm = p.M02 < 0.05 * e.NEd * e.h * KN_M_PAR_KN_MM ? 1 : p.M01 / p.M02;
    Cm = Math.max(0.6 + 0.4 * rm, 0.4);
    M0Ed = Cm * p.M02;
  }
  const beta = braced ? Math.PI ** 2 / 8 : 1;
  return majoration(
    e,
    p,
    M0Ed,
    beta,
    { EI, inter: { E_cd: calculee(Ecd, 'MPa'), 'γ_cE': recommandee(GAMMA_CE_2023, '-') } },
    { 'λ': calculee(s.lambda, '-'), C_m: calculee(Cm, '-') },
    ['O.8.1(5)', 'O.8.2', '(O.23)', '(O.25)', '(7.28)'],
  );
}

/** La majoration n a de sens que si N_B depasse N_Ed. */
function conditionFlambement(calcul: (e: Complete) => Calcul) {
  return (e: EntreeSecondOrdre): Cle | null => {
    const c = calcul(e as Complete);
    return c.intermediaires.N_B.valeur > (e.NEd as number) ? null : 'motif.nb-inf-ned';
  };
}

const conditionRho =
  (min: number, motif: Cle) =>
  (e: EntreeSecondOrdre): Cle | null =>
    (e.As as number) / ((e.b as number) * (e.h as number)) >= min ? null : motif;

const rigidite2004Kc = (e: Complete): Calcul => rigidite2004(e, false);
const rigidite2004Simple = (e: Complete): Calcul => rigidite2004(e, true);

export const rigiditeNominale: Mecanisme<EntreeSecondOrdre> = {
  id: 'rigidite-nominale',
  version: '0.1.0',
  titre: 'meca.so.rigidite',
  champs: CHAMPS,
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.moment-calcul-second-ordre', unite: 'kN·m' },
  niveaux: {
    'ec2-2004': [
      {
        id: 'base',
        ordre: 1,
        position: 'corps',
        clause: '5.8.7.2(2)',
        hypothese: 'niveau.so.2004.rigidite',
        donneesRequises: requisesCourbure,
        domaine,
        conditions: (e) => conditionRho(0.002, 'motif.rho-inf-0002')(e) ?? conditionFlambement(rigidite2004Kc)(e),
        calculer: (e) => rigidite2004Kc(e as Complete),
      },
      {
        id: 'simplifiee',
        ordre: 2,
        position: 'corps',
        clause: '5.8.7.2(3)',
        hypothese: 'niveau.so.2004.rigidite-simplifiee',
        donneesRequises: requisesCourbure,
        domaine,
        conditions: (e) => conditionRho(0.01, 'motif.rho-inf-001')(e) ?? conditionFlambement(rigidite2004Simple)(e),
        calculer: (e) => rigidite2004Simple(e as Complete),
      },
    ],
    'ec2-2023': [
      {
        id: 'base',
        ordre: 1,
        position: 'annexe-informative',
        reserve: 'reserve.annexe-o',
        clause: 'O.8',
        hypothese: 'niveau.so.2023.rigidite',
        donneesRequises: requisesCourbure,
        domaine,
        conditions: conditionFlambement(rigidite2023),
        calculer: (e) => rigidite2023(e as Complete),
      },
    ],
  },
};
