/**
 * Effort tranchant des elements avec armatures d effort tranchant verticales,
 * sans effort normal.
 *
 * Unites : kN, kN.m, mm, MPa.
 *
 * Les deux generations reposent sur le meme treillis a inclinaison variable :
 * tau = min(rho_w f_ywd cot(theta) ; nu f_cd cot(theta) / (1 + cot2(theta))),
 * cot(theta) choisi dans [1 ; 2,5] pour maximiser la resistance.
 * Ce qui change : le coefficient de reduction de la bielle nu et la valeur de
 * f_cd, et, au niveau 2 de la deuxieme generation, un nu qui depend de la
 * deformation longitudinale, donc de la sollicitation ; ce niveau autorise
 * cot(theta) au-dela de 2,5 (8.2.3(7)).
 *
 * Hypothese de l outil : armatures de ductilite B ou C. En classe A,
 * cot(theta_min) serait reduit de 20 % et le niveau 2 ne serait pas permis.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, maximiserSectionDoree, recommandee } from '../../moteur/grandeurs';
import { ES, GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeTaa {
  VEd?: number;
  /** Moment concomitant (kN.m) : necessaire au seul niveau a nu variable. */
  MEd?: number;
  bw?: number;
  d?: number;
  /** Section d un cours d armatures d effort tranchant (mm2). */
  Asw?: number;
  /** Espacement des cours (mm). */
  s?: number;
  fck?: number;
  /** Limite d elasticite des armatures, longitudinales et transversales (MPa). */
  fyk?: number;
  /** Section des armatures de la membrure tendue (mm2). */
  Ast?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
const N_PAR_KN = 1000;
/** cot(theta_min) sans effort normal, armatures de ductilite B ou C (8.2.3(4)). */
const COT_THETA_MAX = 2.5;
/**
 * Borne de recherche au niveau a nu variable. Le texte y permet de depasser
 * cot(theta) = 2,5 (8.2.3(7)) sans fixer de limite : nu decroit avec cot2 et
 * l optimum reste fini. Cette borne est celle de l outil ; elle n est jamais
 * atteinte sur les cas courants, et l atteindre est signale comme non-convergence.
 */
export const COT_THETA_RECHERCHE = 10;

const R = {
  VEd: { champ: 'VEd', libelle: 'champ.VEd' },
  MEd: { champ: 'MEd', libelle: 'champ.MEd' },
  bw: { champ: 'bw', libelle: 'champ.bw' },
  d: { champ: 'd', libelle: 'champ.d' },
  Asw: { champ: 'Asw', libelle: 'champ.Asw' },
  s: { champ: 's', libelle: 'champ.s' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Ast: { champ: 'Ast', libelle: 'champ.Ast' },
} as const satisfies Record<string, { champ: keyof EntreeTaa; libelle: Cle }>;

const communs = [R.VEd, R.bw, R.d, R.Asw, R.s, R.fck, R.fyk];

function domaineFck(e: EntreeTaa): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

export interface Treillis {
  cot: number;
  tau: number;
  tauS: number;
  tauMax: number;
}

/**
 * Optimum du treillis a nu constant. L acier croit avec cot(theta), la bielle
 * decroit : l optimum est a l egalite, 1 + cot2 = nu f_cd / (rho_w f_ywd),
 * borne a [1 ; 2,5].
 */
export function treillisNuConstant(rhoW: number, fywd: number, nu: number, fcd: number): Treillis {
  const rapport = (nu * fcd) / (rhoW * fywd);
  const cot = Math.min(Math.max(Math.sqrt(Math.max(rapport - 1, 0)), 1), COT_THETA_MAX);
  const tauS = rhoW * fywd * cot;
  const tauMax = (nu * fcd * cot) / (1 + cot * cot);
  return { cot, tau: Math.min(tauS, tauMax), tauS, tauMax };
}

function verifierPositifs(e: Required<EntreeTaa>): void {
  positif(e.VEd, 'VEd', 'kN');
  positif(e.bw, 'bw', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.Asw, 'Asw', 'mm2');
  positif(e.s, 's', 'mm');
  positif(e.fyk, 'fyk', 'MPa');
}

// ---------------------------------------------------------------------------
// Premiere generation : 6.2.3, alpha_cw = 1, nu_1 = 0,6 (1 - fck/250)
// ---------------------------------------------------------------------------

export function taa2004(e: Required<EntreeTaa>): Calcul {
  verifierPositifs(e);
  const z = 0.9 * e.d;
  const rhoW = e.Asw / (e.s * e.bw);
  const fywd = e.fyk / GAMMA_S_2004;
  const nu1 = 0.6 * (1 - e.fck / 250);
  const fcd = fcd2004(e.fck);
  const t = treillisNuConstant(rhoW, fywd, nu1, fcd);
  const VRd = (t.tau * e.bw * z) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      z: calculee(z, 'mm'),
      'ρ_w': calculee(rhoW, '-'),
      f_ywd: calculee(fywd, 'MPa'),
      f_cd: calculee(fcd, 'MPa'),
      'ν_1': calculee(nu1, '-'),
      'cot θ': calculee(t.cot, '-'),
      'V_Rd,s': calculee((t.tauS * e.bw * z) / N_PAR_KN, 'kN'),
      'V_Rd,max': calculee((t.tauMax * e.bw * z) / N_PAR_KN, 'kN'),
      V_Rd: calculee(VRd, 'kN'),
    },
    clauses: ['6.2.3(3)', '(6.8)', '(6.9)'],
  };
}

// ---------------------------------------------------------------------------
// Deuxieme generation : 8.2.3
// ---------------------------------------------------------------------------

/** Niveau 1 : nu = 0,5 (note de 8.2.3, valeur recommandee). */
export function taa2023NuConstant(e: Required<EntreeTaa>): Calcul {
  verifierPositifs(e);
  const z = 0.9 * e.d;
  const rhoW = e.Asw / (e.s * e.bw);
  const fywd = e.fyk / GAMMA_S_2023;
  const fcd = fcd2023(e.fck);
  const nu = 0.5;
  const t = treillisNuConstant(rhoW, fywd, nu, fcd);
  const VRd = (t.tau * e.bw * z) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      z: calculee(z, 'mm'),
      'ρ_w': calculee(rhoW, '-'),
      f_ywd: calculee(fywd, 'MPa'),
      f_cd: calculee(fcd, 'MPa'),
      'ν': recommandee(nu, '-'),
      'cot θ': calculee(t.cot, '-'),
      'τ_Rd,s': calculee(t.tauS, 'MPa'),
      'τ_Rd,max': calculee(t.tauMax, 'MPa'),
      V_Rd: calculee(VRd, 'kN'),
    },
    clauses: ['8.2.3(3)', '(8.42)', '(8.44)'],
  };
}

/**
 * nu = 1 / (1 + 110 (eps_x + (eps_x + 0,001) cot2)) <= 1 (8.45), avec
 * eps_x = eps_xt / 2 et eps_xt = F_td / (E_s A_st), F_td = M_Ed/z + V_Ed cot/2
 * ((8.46), (8.47), (8.50), (8.51)).
 *
 * Choix de l outil : la deformation de la membrure comprimee eps_xc est
 * negligee. Elle raccourcit la membrure et ferait baisser eps_x : la negliger
 * va dans le sens de la securite et evite de saisir l aire de la membrure.
 */
export function nuVariable(cot: number, e: Required<EntreeTaa>, z: number): { nu: number; epsX: number; Ftd: number } {
  const Ftd = (e.MEd * N_PAR_KN) / z + (e.VEd * cot) / 2;
  const epsXt = (Ftd * N_PAR_KN) / (ES * e.Ast);
  const epsX = Math.max(epsXt / 2, 0);
  const nu = Math.min(1 / (1 + 110 * (epsX + (epsX + 0.001) * cot * cot)), 1);
  return { nu, epsX, Ftd };
}

/** Niveau 2 : nu fonction de eps_x, optimum de cot(theta) cherche par iteration. */
export function taa2023NuVariable(e: Required<EntreeTaa>): Calcul {
  verifierPositifs(e);
  positif(e.Ast, 'Ast', 'mm2');
  if (!(Number.isFinite(e.MEd) && e.MEd >= 0)) throw new Error('MEd doit etre un nombre positif ou nul (kN.m).');
  const z = 0.9 * e.d;
  const rhoW = e.Asw / (e.s * e.bw);
  const fywd = e.fyk / GAMMA_S_2023;
  const fcd = fcd2023(e.fck);
  const tau = (cot: number): number => {
    const { nu } = nuVariable(cot, e, z);
    return Math.min(rhoW * fywd * cot, (nu * fcd * cot) / (1 + cot * cot));
  };
  const m = maximiserSectionDoree(tau, 1, COT_THETA_RECHERCHE, 1e-9, 200);
  const v = nuVariable(m.x, e, z);
  // Un optimum colle a la borne de recherche n est pas un optimum : signale.
  const aLaBorne = m.x > COT_THETA_RECHERCHE - 1e-6;
  const VRd = (m.f * e.bw * z) / N_PAR_KN;
  const intermediaires = {
    z: calculee(z, 'mm'),
    'ρ_w': calculee(rhoW, '-'),
    f_ywd: calculee(fywd, 'MPa'),
    f_cd: calculee(fcd, 'MPa'),
    F_td: calculee(v.Ftd, 'kN'),
    'ε_x': calculee(v.epsX, '-'),
    'ν': calculee(v.nu, '-'),
    'cot θ': calculee(m.x, '-'),
    'τ_Rd,s': calculee(rhoW * fywd * m.x, 'MPa'),
    'τ_Rd,max': calculee((v.nu * fcd * m.x) / (1 + m.x * m.x), 'MPa'),
    V_Rd: calculee(VRd, 'kN'),
  };
  const clauses = ['8.2.3(7)', '(8.45)', '(8.46)', '(8.47)', '(8.51)'];
  if (!m.converge || aLaBorne) {
    return { statut: { etat: 'non-convergent', iterations: m.iterations }, intermediaires, clauses, iterations: m.iterations };
  }
  return { statut: { etat: 'calcule' }, sollicitation: e.VEd, resistance: VRd, intermediaires, clauses, iterations: m.iterations };
}

const niveaux2004: DefinitionNiveau<EntreeTaa>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '6.2.3',
    hypothese: 'niveau.taa.2004.base',
    donneesRequises: communs,
    domaine: domaineFck,
    conditions: () => null,
    calculer: (e) => taa2004(e as Required<EntreeTaa>),
  },
];

const niveaux2023: DefinitionNiveau<EntreeTaa>[] = [
  {
    id: 'nu-constant',
    ordre: 1,
    clause: '8.2.3',
    hypothese: 'niveau.taa.2023.nu-constant',
    donneesRequises: communs,
    domaine: domaineFck,
    conditions: () => null,
    calculer: (e) => taa2023NuConstant(e as Required<EntreeTaa>),
  },
  {
    id: 'nu-variable',
    ordre: 2,
    clause: '8.2.3',
    hypothese: 'niveau.taa.2023.nu-variable',
    donneesRequises: [...communs, R.MEd, R.Ast],
    domaine: domaineFck,
    conditions: () => null,
    calculer: (e) => taa2023NuVariable(e as Required<EntreeTaa>),
  },
];

export const tranchantAvecArmature: Mecanisme<EntreeTaa> = {
  id: 'tranchant-avec-armature',
  version: '0.1.0',
  titre: 'meca.taa.titre',
  champs: [
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'MEd', libelle: 'champ.MEd', symbole: 'M_Ed', unite: 'kN·m', facultatif: true },
    { type: 'nombre', id: 'bw', libelle: 'champ.bw', symbole: 'b_w', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'Asw', libelle: 'champ.Asw', symbole: 'A_sw', unite: 'mm²' },
    { type: 'nombre', id: 's', libelle: 'champ.s', symbole: 's', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'Ast', libelle: 'champ.Ast', symbole: 'A_st', unite: 'mm²', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-tranchant', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-tranchant', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
