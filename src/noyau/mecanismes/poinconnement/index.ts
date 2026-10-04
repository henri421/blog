/**
 * Poinconnement d une dalle sans armature de poinconnement, sur poteau
 * interieur rectangulaire, sans moment transmis autre que celui couvert par le
 * coefficient forfaitaire beta.
 *
 * Unites : kN, mm, MPa ; sections d armatures en mm2 par metre.
 *
 * Premiere generation : 6.4.4 et 6.4.5(3), controle a 2d (u_1) et au nu (u_0).
 * Deuxieme generation : 8.4, controle a d_v/2 (b_0,5), deux niveaux :
 *   1. d_v dans le terme d echelle ;
 *   2. a_pd, tire de la distance au point de moment nul, a la place de d_v.
 *
 * Domaine de l outil : chaque cote du poteau au plus egal a 3 d. Au-dela, les
 * deux generations ne retiennent qu une partie du perimetre, regle non codee.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_V_2023, ddg2023, fcd2004, positif } from '../../materiaux';

export interface EntreePoinconnement {
  VEd?: number;
  /** Cotes du poteau (mm). */
  c1?: number;
  c2?: number;
  /** Hauteurs utiles des deux nappes superieures (mm). */
  dx?: number;
  dy?: number;
  /** Sections des deux nappes superieures (mm2/m). */
  Asx?: number;
  Asy?: number;
  fck?: number;
  Dlower?: number;
  /** Distances du centre du poteau aux lignes de moment nul (mm). */
  apx?: number;
  apy?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePoinconnement>;
const N_PAR_KN = 1000;
const MM_PAR_M = 1000;
/** Poteau interieur : 6.4.3(6) en premiere generation, tableau 8.3 en deuxieme. */
export const BETA_INTERIEUR = 1.15;

const R = {
  VEd: { champ: 'VEd', libelle: 'champ.VEd-poinconnement' },
  c1: { champ: 'c1', libelle: 'champ.c1' },
  c2: { champ: 'c2', libelle: 'champ.c2' },
  dx: { champ: 'dx', libelle: 'champ.dx' },
  dy: { champ: 'dy', libelle: 'champ.dy' },
  Asx: { champ: 'Asx', libelle: 'champ.Asx' },
  Asy: { champ: 'Asy', libelle: 'champ.Asy' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
  apx: { champ: 'apx', libelle: 'champ.apx' },
  apy: { champ: 'apy', libelle: 'champ.apy' },
} as const satisfies Record<string, { champ: keyof EntreePoinconnement; libelle: Cle }>;

const communs = [R.VEd, R.c1, R.c2, R.dx, R.dy, R.Asx, R.Asy, R.fck];

function domaine(e: EntreePoinconnement): Cle | null {
  if ((e.fck as number) > 90) return 'motif.fck-sup-90';
  const d = ((e.dx as number) + (e.dy as number)) / 2;
  if (Math.max(e.c1 as number, e.c2 as number) > 3 * d) return 'motif.poteau-allonge';
  return null;
}

function verifier(e: Complete): void {
  positif(e.VEd, 'VEd', 'kN');
  positif(e.c1, 'c1', 'mm');
  positif(e.c2, 'c2', 'mm');
  positif(e.dx, 'dx', 'mm');
  positif(e.dy, 'dy', 'mm');
  positif(e.Asx, 'Asx', 'mm2/m');
  positif(e.Asy, 'Asy', 'mm2/m');
}

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

/**
 * V_Rd = min(v_Rd,c u_1 d ; v_Rd,max u_0 d) / beta.
 * v_Rd,c = max(0,18/gamma_c k (100 rho_l fck)^(1/3) ; v_min) (6.47), rho_l <= 0,02 ;
 * v_Rd,max = 0,4 nu f_cd, nu = 0,6 (1 - fck/250) (6.4.5(3), valeur
 * recommandee depuis l A1:2014).
 */
export function poinconnement2004(e: Complete): Calcul {
  verifier(e);
  const d = (e.dx + e.dy) / 2;
  const u0 = 2 * (e.c1 + e.c2);
  const u1 = u0 + 4 * Math.PI * d;
  const k = Math.min(1 + Math.sqrt(200 / d), 2);
  const rhoX = e.Asx / (MM_PAR_M * e.dx);
  const rhoY = e.Asy / (MM_PAR_M * e.dy);
  const rhoL = Math.min(Math.sqrt(rhoX * rhoY), 0.02);
  const vCalc = (0.18 / GAMMA_C_2004) * k * (100 * rhoL * e.fck) ** (1 / 3);
  const vMin = 0.035 * k ** 1.5 * Math.sqrt(e.fck);
  const vRdc = Math.max(vCalc, vMin);
  const nu = 0.6 * (1 - e.fck / 250);
  const vRdMax = 0.4 * nu * fcd2004(e.fck);
  const VRdc = (vRdc * u1 * d) / BETA_INTERIEUR / N_PAR_KN;
  const VRdMax = (vRdMax * u0 * d) / BETA_INTERIEUR / N_PAR_KN;
  const VRd = Math.min(VRdc, VRdMax);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      'β': recommandee(BETA_INTERIEUR, '-'),
      d: calculee(d, 'mm'),
      u_0: calculee(u0, 'mm'),
      u_1: calculee(u1, 'mm'),
      k: calculee(k, '-'),
      'ρ_l': calculee(rhoL, '-'),
      'v_Rd,c': calculee(vRdc, 'MPa'),
      'v_Rd,max': calculee(vRdMax, 'MPa'),
      'V_Rd,c (u_1)': calculee(VRdc, 'kN'),
      'V_Rd,max (u_0)': calculee(VRdMax, 'kN'),
      V_Rd: calculee(VRd, 'kN'),
    },
    clauses: ['6.4.4(1)', '(6.47)', '6.4.5(3)'],
  };
}

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

/**
 * tau_Rd,c = 0,6/gamma_V k_pb (100 rho_l fck d_dg / l)^(1/3) <= 0,5/gamma_V fck^(1/2),
 * k_pb = 3,6 (1 - b_0/b_0,5)^(1/2) borne a [1 ; 2,5] ((8.94) a (8.96)),
 * l = d_v au niveau 1, a_pd au niveau 2 ((8.97), (8.98)).
 */
function poinconnement2023(e: Complete, affine: boolean): Calcul {
  verifier(e);
  const dv = (e.dx + e.dy) / 2;
  const b0 = 2 * (e.c1 + e.c2);
  const b05 = b0 + Math.PI * dv;
  const kpb = Math.min(Math.max(3.6 * Math.sqrt(1 - b0 / b05), 1), 2.5);
  const rhoX = e.Asx / (MM_PAR_M * e.dx);
  const rhoY = e.Asy / (MM_PAR_M * e.dy);
  const rhoL = Math.sqrt(rhoX * rhoY);
  const ddg = ddg2023(e.fck, e.Dlower);
  const extra: Cellule['intermediaires'] = {};
  let longueur = dv;
  if (affine) {
    positif(e.apx, 'apx', 'mm');
    positif(e.apy, 'apy', 'mm');
    const ap = Math.max(Math.sqrt(e.apx * e.apy), dv);
    longueur = Math.sqrt((ap * dv) / 8);
    extra.a_p = calculee(ap, 'mm');
    extra.a_pd = calculee(longueur, 'mm');
  }
  const tauCalc = (0.6 / GAMMA_V_2023) * kpb * ((100 * rhoL * e.fck * ddg) / longueur) ** (1 / 3);
  const tauPlafond = (0.5 / GAMMA_V_2023) * Math.sqrt(e.fck);
  const tau = Math.min(tauCalc, tauPlafond);
  const VRd = (tau * b05 * dv) / BETA_INTERIEUR / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      'β_e': recommandee(BETA_INTERIEUR, '-'),
      'γ_V': recommandee(GAMMA_V_2023, '-'),
      d_v: calculee(dv, 'mm'),
      b_0: calculee(b0, 'mm'),
      'b_0,5': calculee(b05, 'mm'),
      k_pb: calculee(kpb, '-'),
      'ρ_l': calculee(rhoL, '-'),
      d_dg: calculee(ddg, 'mm'),
      ...extra,
      'τ_Ed': calculee((BETA_INTERIEUR * e.VEd * N_PAR_KN) / (b05 * dv), 'MPa'),
      'τ_Rd,c calcule': calculee(tauCalc, 'MPa'),
      'τ_Rd,c plafond': calculee(tauPlafond, 'MPa'),
      'τ_Rd,c': calculee(tau, 'MPa'),
      V_Rd: calculee(VRd, 'kN'),
    },
    clauses: affine ? ['8.4.3', '(8.94)', '(8.97)', '(8.98)'] : ['8.4.3', '(8.94)', '(8.95)', '(8.96)'],
  };
}

export const poinconnement2023Niveau1 = (e: Complete): Calcul => poinconnement2023(e, false);
export const poinconnement2023Niveau2 = (e: Complete): Calcul => poinconnement2023(e, true);

const niveaux2004: DefinitionNiveau<EntreePoinconnement>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '6.4.4',
    hypothese: 'niveau.poin.2004.base',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => poinconnement2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreePoinconnement>[] = [
  {
    id: 'hauteur-utile',
    ordre: 1,
    clause: '8.4.3',
    hypothese: 'niveau.poin.2023.hauteur-utile',
    donneesRequises: [...communs, R.Dlower],
    domaine,
    conditions: () => null,
    calculer: (e) => poinconnement2023Niveau1(e as Complete),
  },
  {
    id: 'moment-nul',
    ordre: 2,
    clause: '8.4.3',
    hypothese: 'niveau.poin.2023.moment-nul',
    donneesRequises: [...communs, R.Dlower, R.apx, R.apy],
    domaine,
    conditions: () => null,
    calculer: (e) => poinconnement2023Niveau2(e as Complete),
  },
];

export const poinconnement: Mecanisme<EntreePoinconnement> = {
  id: 'poinconnement',
  version: '0.1.0',
  titre: 'meca.poin.titre',
  champs: [
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd-poinconnement', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'c1', libelle: 'champ.c1', symbole: 'c_1', unite: 'mm' },
    { type: 'nombre', id: 'c2', libelle: 'champ.c2', symbole: 'c_2', unite: 'mm' },
    { type: 'nombre', id: 'dx', libelle: 'champ.dx', symbole: 'd_x', unite: 'mm' },
    { type: 'nombre', id: 'dy', libelle: 'champ.dy', symbole: 'd_y', unite: 'mm' },
    { type: 'nombre', id: 'Asx', libelle: 'champ.Asx', symbole: 'A_s,x', unite: 'mm²/m' },
    { type: 'nombre', id: 'Asy', libelle: 'champ.Asy', symbole: 'A_s,y', unite: 'mm²/m' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'apx', libelle: 'champ.apx', symbole: 'a_p,x', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'apy', libelle: 'champ.apy', symbole: 'a_p,y', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.reaction-poteau', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-poinconnement', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
