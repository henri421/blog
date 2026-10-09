/**
 * Redistribution limitee des moments sans verification explicite de la
 * capacite de rotation (poutres et dalles continues).
 *
 * Unites : mm, MPa, kN.m.
 *
 * Premiere generation (5.5(4)) : delta >= k1 + k2 x_u/d pour fck <= 50 MPa
 *   (5.10a), k3 + k4 x_u/d au-dela (5.10b), et >= k5 = 0,7 (classes B, C)
 *   ou k6 = 0,8 (classe A). Valeurs recommandees : k1 = 0,44, k3 = 0,54,
 *   k2 = k4 = 1,25 (0,6 + 0,0014/epsilon_cu2), epsilon_cu2 du tableau 3.1.
 * Deuxieme generation (7.3.2(3)) : delta_M >= 1/(1 + 0,7 epsilon_cu E_s/f_yd)
 *   + x_u/d (7.16), avec les memes bornes 0,7 et 0,8 (tableau 5.5).
 * Conditions communes : flexion dominante, rapport des portees adjacentes
 *   entre 0,5 et 2.
 *
 * Choix de l outil : x_u est la profondeur de l axe neutre a l ELU de la
 * section armee pour le moment redistribue, obtenue par l equilibre de la
 * flexion simple (section rectangulaire, armatures tendues seules,
 * parabole-rectangle ; voir le mecanisme `flexion`). En 2023, f_cd retient
 * k_tc = 0,85 (mise en charge avant 90 jours), ce qui donne un x_u plus grand.
 * Les elements precontraints (7.17) ne sont pas codes.
 *
 * Verification explicite de la rotation (7.3.2(5), deuxieme generation) :
 *   theta_Ed <= theta_Rd = 1,3 d/gamma_theta ((1/r)_u,m - TS_My eps_yd/(d - x)) (7.18),
 *   (1/r)_u,m = TS_Mu min(eps_ud/(d - x_u) ; eps_cu,d,rho_w/x_u) (7.19),
 *   eps_cu,d,rho_w = 0,002 + 1,35/d + 3 rho_w <= 0,015 (7.20, d en mm),
 *   TS_Mu (7.21) si alpha >= 1, (7.22) sinon ; TS_My = 1 - 0,6 M_cr/M_y >= 0,4 (7.23) ;
 *   alpha = (f_s,ef - f_yd)/(0,6 f_cm^(2/3)) phi/s_r,m,cal (7.24) ; gamma_theta = 3,0.
 * La demande theta_Ed est saisie : elle vient de l analyse (integrale des
 * courbures apres plastification).
 * Choix de l outil pour ce niveau :
 * - x_u, f_s,ef et eps_ud,ef : equilibre a M_Rd avec la branche inclinee de
 *   l acier (k et eps_uk saisis, eps_ud = eps_uk/gamma_S, 5.2.4) et la
 *   parabole-rectangle de calcul ; la rupture est cote beton (eps_cu = 3,5
 *   pour mille) sauf si l acier atteint eps_ud avant ;
 * - M_y et x de (7.18) : acier a eps_yd, meme parabole-rectangle, raccourcissement
 *   du beton deduit de la planeite ; M_cr = f_ctm b h^2/6 ;
 * - s_r,m,cal selon 9.2.3 (9.15), un lit, b_c,eff = b, h_c,eff avec x = x_y,
 *   k_b = 0,9 (bonne adherence), plafond 1,3 (h - x)/k_w ;
 * - rho_w : taux d armatures transversales saisi.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { ES, GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, fctm2023, positif } from '../../materiaux';
import { LOI_2023, equilibre, loi2004, remplissage } from '../flexion/index';
import { KB_2023, KW_2023 } from '../fissuration/index';

export interface EntreeRedistribution {
  /** Moment elastique a l appui (kN.m, valeur absolue). */
  Mel?: number;
  /** Moment retenu apres redistribution (kN.m, valeur absolue). */
  Mred?: number;
  /** Portees adjacentes (mm). */
  L1?: number;
  L2?: number;
  b?: number;
  d?: number;
  /** Armatures tendues de la section redistribuee (mm2). */
  As?: number;
  fck?: number;
  fyk?: number;
  /** Classe de ductilite de l acier : 'A', 'B' ou 'C'. */
  classe?: string;
  /** Verification explicite de la rotation (7.3.2(5)) : hauteur totale (mm). */
  h?: number;
  /** Diametre des barres tendues (mm). */
  phi?: number;
  /** Enrobage des barres tendues (mm). */
  c?: number;
  /** Taux d armatures transversales rho_w (%). */
  rhoW?: number;
  /** Rapport k = (f_t/f_y)_k de l acier. */
  k?: number;
  /** Allongement sous charge maximale (pour mille). */
  epsUk?: number;
  /** Demande de rotation plastique issue de l analyse (mrad). */
  thetaEd?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeRedistribution>;
const NMM_PAR_KNM = 1e6;

const R = {
  Mel: { champ: 'Mel', libelle: 'champ.Mel' },
  Mred: { champ: 'Mred', libelle: 'champ.Mred' },
  L1: { champ: 'L1', libelle: 'champ.L1' },
  L2: { champ: 'L2', libelle: 'champ.L2' },
  b: { champ: 'b', libelle: 'champ.b' },
  d: { champ: 'd', libelle: 'champ.d' },
  As: { champ: 'As', libelle: 'champ.As' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  classe: { champ: 'classe', libelle: 'champ.classe-ductilite' },
  h: { champ: 'h', libelle: 'champ.h' },
  phi: { champ: 'phi', libelle: 'champ.phi' },
  c: { champ: 'c', libelle: 'champ.c' },
  rhoW: { champ: 'rhoW', libelle: 'champ.rhoW' },
  k: { champ: 'k', libelle: 'champ.k-acier' },
  epsUk: { champ: 'epsUk', libelle: 'champ.eps-uk' },
  thetaEd: { champ: 'thetaEd', libelle: 'champ.thetaEd' },
} as const satisfies Record<string, { champ: keyof EntreeRedistribution; libelle: Cle }>;

const requises = [R.Mel, R.Mred, R.L1, R.L2, R.b, R.d, R.As, R.fck, R.fyk, R.classe];
const requisesRotation = [R.b, R.h, R.d, R.As, R.phi, R.c, R.rhoW, R.fck, R.fyk, R.k, R.epsUk, R.thetaEd];

function domaine(e: EntreeRedistribution): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

/** Rapport des portees adjacentes entre 0,5 et 2 (5.5(4) ; 7.3.2(3)). */
function conditions(e: EntreeRedistribution): Cle | null {
  const r = (e.L1 as number) / (e.L2 as number);
  return r < 0.5 || r > 2 ? 'motif.portees-adjacentes' : null;
}

function verifier(e: Complete): void {
  positif(e.Mel, 'M_el', 'kN.m');
  positif(e.Mred, 'M_red', 'kN.m');
  positif(e.L1, 'L1', 'mm');
  positif(e.L2, 'L2', 'mm');
  positif(e.b, 'b', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.As, 'As', 'mm2');
  positif(e.fyk, 'fyk', 'MPa');
}

/** Borne inferieure selon la classe de ductilite (k5, k6 ; tableau 5.5). */
function borne(classe: string): number {
  return classe === 'A' ? 0.8 : 0.7;
}

function cellule(e: Complete, deltaMin: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  const delta = e.Mred / e.Mel;
  return {
    statut: { etat: 'calcule' },
    sollicitation: deltaMin,
    resistance: delta,
    intermediaires: {
      ...inter,
      'borne de ductilité': recommandee(borne(e.classe), '-'),
      'δ minimal': calculee(deltaMin, '-'),
      'δ retenu': calculee(delta, '-'),
      'taux de redistribution': calculee(1 - delta, '-'),
    },
    clauses,
  };
}

export function redistribution2004(e: Complete): Calcul {
  verifier(e);
  const loi = loi2004(e.fck);
  const { alpha, beta } = remplissage(loi);
  const eq = equilibre(e, fcd2004(e.fck), e.fyk / GAMMA_S_2004, alpha, beta, loi.ecu);
  const xd = eq.x / e.d;
  const k1 = e.fck <= 50 ? 0.44 : 0.54;
  const k2 = 1.25 * (0.6 + 0.0014 / loi.ecu);
  const formule = k1 + k2 * xd;
  return cellule(
    e,
    Math.max(formule, borne(e.classe)),
    {
      x_u: calculee(eq.x, 'mm'),
      'x_u / d': calculee(xd, '-'),
      'ε_cu2': calculee(loi.ecu * 1000, '‰'),
      [e.fck <= 50 ? 'k1' : 'k3']: recommandee(k1, '-'),
      [e.fck <= 50 ? 'k2' : 'k4']: recommandee(k2, '-'),
      '(5.10)': calculee(formule, '-'),
    },
    ['5.5(4)', e.fck <= 50 ? '(5.10a)' : '(5.10b)', 'tableau 3.1'],
  );
}

export function redistribution2023(e: Complete): Calcul {
  verifier(e);
  const { alpha, beta } = remplissage(LOI_2023);
  const fyd = e.fyk / GAMMA_S_2023;
  const eq = equilibre(e, fcd2023(e.fck), fyd, alpha, beta, LOI_2023.ecu);
  const xd = eq.x / e.d;
  const terme = 1 / (1 + (0.7 * LOI_2023.ecu * ES) / fyd);
  const formule = terme + xd;
  return cellule(
    e,
    Math.max(formule, borne(e.classe)),
    {
      x_u: calculee(eq.x, 'mm'),
      'x_u / d': calculee(xd, '-'),
      '1/(1 + 0,7 ε_cu E_s/f_yd)': calculee(terme, '-'),
      '(7.16)': calculee(formule, '-'),
    },
    ['7.3.2(3)', '(7.16)', 'tableau 5.5'],
  );
}

/** Facteur de securite du modele de rotation, gamma_theta = 3,0 (7.3.2(5), NOTE). */
export const GAMMA_THETA = 3.0;

/**
 * Bloc de compression parabole-rectangle (loi de 2023) pour un raccourcissement
 * de fibre extreme eps_t : C = alpha b x f_cd a beta x de la fibre extreme.
 * Integration de Simpson, exacte ici (contrainte au plus quadratique), coupee
 * au changement de branche.
 */
export function blocBeton(epsT: number): { alpha: number; beta: number } {
  const { ec2 } = LOI_2023;
  const sigma = (u: number): number => {
    const e = epsT * u; // u = distance a l axe neutre / x
    return e >= ec2 ? 1 : 1 - (1 - e / ec2) ** 2;
  };
  const simpson = (a: number, b: number, f: (u: number) => number): number =>
    b <= a ? 0 : ((b - a) / 6) * (f(a) + 4 * f((a + b) / 2) + f(b));
  const coupe = Math.min(1, ec2 / epsT);
  const aire = simpson(0, coupe, sigma) + simpson(coupe, 1, sigma);
  const moment = simpson(0, coupe, (u) => u * sigma(u)) + simpson(coupe, 1, (u) => u * sigma(u));
  return { alpha: aire, beta: 1 - moment / aire };
}

/** Racine de f croissante sur ]0 ; d[ par dichotomie. */
function racine(f: (x: number) => number, d: number): number {
  let bas = 1e-9 * d;
  let haut = d * (1 - 1e-9);
  for (let i = 0; i < 200; i++) {
    const x = (bas + haut) / 2;
    if (f(x) > 0) haut = x;
    else bas = x;
  }
  return (bas + haut) / 2;
}

/** 7.3.2(5) : capacite de rotation (7.18) a (7.24), demande saisie. */
export function rotation2023(e: Complete): Calcul {
  positif(e.b, 'b', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.As, 'As', 'mm2');
  positif(e.phi, 'phi', 'mm');
  positif(e.c, 'c', 'mm');
  positif(e.fyk, 'fyk', 'MPa');
  positif(e.epsUk, 'eps_uk', 'pour mille');
  positif(e.thetaEd, 'theta_Ed', 'mrad');
  if (!(e.rhoW >= 0)) throw new Error('rho_w doit etre positif ou nul.');
  if (!(e.k >= 1)) throw new Error('k doit etre au moins egal a 1.');
  const fyd = e.fyk / GAMMA_S_2023;
  const epsYd = fyd / ES;
  const epsUk = e.epsUk / 1000;
  if (!(epsUk > epsYd)) throw new Error('eps_uk doit depasser eps_yd.');
  const epsUd = epsUk / GAMMA_S_2023;
  const fcd = fcd2023(e.fck);
  const fcm = e.fck + 8;
  const ecu = LOI_2023.ecu;
  const sigmaS = (eps: number): number => (eps <= epsYd ? ES * eps : fyd + ((e.k - 1) * fyd * (eps - epsYd)) / (epsUk - epsYd));

  // Etat ultime : beton a eps_cu, sauf si l acier atteint eps_ud avant.
  let xu = racine((x) => blocBeton(ecu).alpha * e.b * x * fcd - e.As * sigmaS((ecu * (e.d - x)) / x), e.d);
  let epsS = (ecu * (e.d - xu)) / xu;
  let epsC = ecu;
  const ruptureAcier = epsS > epsUd;
  if (ruptureAcier) {
    xu = racine((x) => blocBeton((epsUd * x) / (e.d - x)).alpha * e.b * x * fcd - e.As * sigmaS(epsUd), e.d);
    epsS = epsUd;
    epsC = (epsUd * xu) / (e.d - xu);
  }
  const fsef = sigmaS(epsS);
  const MRd = (e.As * fsef * (e.d - blocBeton(epsC).beta * xu)) / NMM_PAR_KNM;

  // Plastification : acier a eps_yd.
  const xy = racine((x) => blocBeton((epsYd * x) / (e.d - x)).alpha * e.b * x * fcd - e.As * fyd, e.d);
  const My = (e.As * fyd * (e.d - blocBeton((epsYd * xy) / (e.d - xy)).beta * xy)) / NMM_PAR_KNM;
  const Mcr = (fctm2023(e.fck) * e.b * e.h ** 2) / 6 / NMM_PAR_KNM;
  const tsMy = Math.max(0.4, 1 - (0.6 * Mcr) / My);

  // Espacement moyen des fissures (9.15), un lit.
  const ay = e.h - e.d;
  const hceff = Math.min(ay + 5 * e.phi, 10 * e.phi, 3.5 * ay, e.h - xy, e.h / 2);
  const rhoEff = e.As / (e.b * hceff);
  const kfl = (e.h - hceff) / e.h;
  const srm = Math.min(1.5 * e.c + ((kfl * KB_2023) / 7.2) * (e.phi / rhoEff), (1.3 * (e.h - xy)) / KW_2023);

  const alpha = ((fsef - fyd) / (0.6 * fcm ** (2 / 3))) * (e.phi / srm);
  const tsMu =
    alpha >= 1
      ? 1 - (1 / (2 * alpha)) * (1 - epsYd / epsS)
      : alpha / 2 + (epsYd / epsS) * (1 - alpha / 2 + (fsef / fyd - 1) * (2 - 1 / alpha - alpha));
  const ecud = Math.min(0.015, 0.002 + 1.35 / e.d + (3 * e.rhoW) / 100);
  const courbureU = tsMu * Math.min(epsUd / (e.d - xu), ecud / xu);
  const thetaRd = ((1.3 * e.d) / GAMMA_THETA) * (courbureU - (tsMy * epsYd) / (e.d - xy)) * 1000;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.thetaEd,
    resistance: thetaRd,
    intermediaires: {
      f_yd: calculee(fyd, 'MPa'),
      'ε_yd': calculee(epsYd * 1000, '‰'),
      'ε_ud': calculee(epsUd * 1000, '‰'),
      x_u: calculee(xu, 'mm'),
      'f_s,ef': calculee(fsef, 'MPa'),
      'ε_ud,ef': calculee(epsS * 1000, '‰'),
      M_Rd: calculee(MRd, 'kN·m'),
      x_y: calculee(xy, 'mm'),
      M_y: calculee(My, 'kN·m'),
      M_cr: calculee(Mcr, 'kN·m'),
      'h_c,eff': calculee(hceff, 'mm'),
      's_r,m,cal': calculee(srm, 'mm'),
      'α (7.24)': calculee(alpha, '-'),
      TS_Mu: calculee(tsMu, '-'),
      TS_My: calculee(tsMy, '-'),
      'ε_cu,d,ρw': calculee(ecud * 1000, '‰'),
      '(1/r)_u,m': calculee(courbureU * 1e6, '1/km'),
      'γ_θ': recommandee(GAMMA_THETA, '-'),
      'θ_Ed': saisie(e.thetaEd, 'mrad'),
      'θ_Rd': calculee(thetaRd, 'mrad'),
    },
    clauses: ['7.3.2(5)', '(7.18)', '(7.19)', '(7.20)', alpha >= 1 ? '(7.21)' : '(7.22)', '(7.23)', '(7.24)', '(9.15)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeRedistribution>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '5.5(4)',
    hypothese: 'niveau.red.2004.base',
    donneesRequises: requises,
    domaine,
    conditions,
    calculer: (e) => redistribution2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeRedistribution>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '7.3.2(3)',
    hypothese: 'niveau.red.2023.base',
    donneesRequises: requises,
    domaine,
    conditions,
    calculer: (e) => redistribution2023(e as Complete),
  },
  {
    id: 'rotation',
    ordre: 2,
    position: 'corps',
    clause: '7.3.2(5)',
    hypothese: 'niveau.red.2023.rotation',
    grandeurs: {
      sollicitation: { libelle: 'grandeur.rotation-demande', unite: 'mrad' },
      resistance: { libelle: 'grandeur.rotation-capacite', unite: 'mrad' },
    },
    donneesRequises: requisesRotation,
    domaine,
    conditions: () => null,
    calculer: (e) => rotation2023(e as Complete),
  },
];

export const redistribution: Mecanisme<EntreeRedistribution> = {
  id: 'redistribution',
  version: '0.2.0',
  titre: 'meca.red.titre',
  champs: [
    { type: 'nombre', id: 'Mel', libelle: 'champ.Mel', symbole: 'M_el', unite: 'kN·m' },
    { type: 'nombre', id: 'Mred', libelle: 'champ.Mred', symbole: 'M_red', unite: 'kN·m' },
    { type: 'nombre', id: 'L1', libelle: 'champ.L1', symbole: 'L_1', unite: 'mm' },
    { type: 'nombre', id: 'L2', libelle: 'champ.L2', symbole: 'L_2', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'As', libelle: 'champ.As', symbole: 'A_s', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    {
      type: 'choix',
      id: 'classe',
      libelle: 'champ.classe-ductilite',
      options: [
        { valeur: 'A', libelle: 'option.ductilite.A' },
        { valeur: 'B', libelle: 'option.ductilite.B' },
        { valeur: 'C', libelle: 'option.ductilite.C' },
      ],
    },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'c', libelle: 'champ.c', symbole: 'c', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'rhoW', libelle: 'champ.rhoW', symbole: 'ρ_w', unite: '%', facultatif: true },
    { type: 'nombre', id: 'k', libelle: 'champ.k-acier', symbole: 'k', unite: '-', facultatif: true },
    { type: 'nombre', id: 'epsUk', libelle: 'champ.eps-uk', symbole: 'ε_uk', unite: '‰', facultatif: true },
    { type: 'nombre', id: 'thetaEd', libelle: 'champ.thetaEd', symbole: 'θ_Ed', unite: 'mrad', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.delta-minimal', unite: '-' },
  resistance: { libelle: 'grandeur.delta-retenu', unite: '-' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
