/**
 * Poinconnement d une dalle avec armatures de poinconnement, poteau
 * interieur rectangulaire, armatures verticales, verification au premier
 * contour de controle (le contour exterieur b_0,5,out / u_out n est pas
 * traite).
 *
 * Unites : kN, mm, MPa ; nappes de flexion en mm2/m.
 *
 * Premiere generation (6.4.5, modifie par l A1:2014) :
 *   v_Rd,cs = 0,75 v_Rd,c + 1,5 (d/s_r) A_sw f_ywd,ef / (u_1 d) <= k_max v_Rd,c (6.52),
 *   f_ywd,ef = 250 + 0,25 d <= f_ywd, k_max = 1,5 (A1:2014) ;
 *   plafond au nu : v_Rd,max = 0,4 nu f_cd (6.4.5(3)).
 * Deuxieme generation (8.4.4) :
 *   tau_Rd,cs = eta_c tau_Rd,c + eta_s rho_w f_ywd >= rho_w f_ywd (8.104),
 *   eta_c = tau_Rd,c / tau_Ed (8.105),
 *   eta_s = d_v/(150 phi_w) + (15 d_dg/d_v)^(1/2) (1/(eta_c k_pb))^(3/2) <= 0,8 (8.106),
 *   rho_w = A_sw / (s_r s_t) (8.107), s_t = b_0,5 / nombre de brins sur le contour ;
 *   plafond tau_Rd,max = eta_sys tau_Rd,c (8.109),
 *   eta_sys = 0,70 (goujons) ou 0,50 (cadres) + 0,63 (b_0/d_v)^(1/4) >= 1 ((8.110), (8.111)).
 * tau_Rd,c est celui de 8.4.3(1), avec d_v comme longueur d echelle.
 *
 * Les dispositions constructives (12.5.1 ; 9.4.3 en 2004) ne sont pas
 * verifiees : s_r est saisi tel qu il est prevu.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_S_2004, GAMMA_S_2023, GAMMA_V_2023, ddg2023, fcd2004, positif } from '../../materiaux';
import { BETA_INTERIEUR } from '../poinconnement/index';

export interface EntreePoinconnementArme {
  VEd?: number;
  c1?: number;
  c2?: number;
  dx?: number;
  dy?: number;
  Asx?: number;
  Asy?: number;
  fck?: number;
  fyk?: number;
  Dlower?: number;
  /** 'goujons' (a double tete) ou 'etriers'. */
  systeme?: string;
  /** Diametre des armatures de poinconnement (mm). */
  phiW?: number;
  /** Nombre de brins par contour autour du poteau. */
  nBrins?: number;
  /** Espacement radial des contours (mm). */
  sr?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePoinconnementArme>;
const N_PAR_KN = 1000;
const MM_PAR_M = 1000;
/** Plafond de l A1:2014 sur la resistance avec armatures (valeur recommandee). */
export const K_MAX_2004 = 1.5;

const R = {
  VEd: { champ: 'VEd', libelle: 'champ.VEd-poinconnement' },
  c1: { champ: 'c1', libelle: 'champ.c1' },
  c2: { champ: 'c2', libelle: 'champ.c2' },
  dx: { champ: 'dx', libelle: 'champ.dx' },
  dy: { champ: 'dy', libelle: 'champ.dy' },
  Asx: { champ: 'Asx', libelle: 'champ.Asx' },
  Asy: { champ: 'Asy', libelle: 'champ.Asy' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
  systeme: { champ: 'systeme', libelle: 'champ.systeme' },
  phiW: { champ: 'phiW', libelle: 'champ.phiW' },
  nBrins: { champ: 'nBrins', libelle: 'champ.nBrins' },
  sr: { champ: 'sr', libelle: 'champ.sr' },
} as const satisfies Record<string, { champ: keyof EntreePoinconnementArme; libelle: Cle }>;

const communs = [R.VEd, R.c1, R.c2, R.dx, R.dy, R.Asx, R.Asy, R.fck, R.fyk, R.phiW, R.nBrins, R.sr];

function domaine(e: EntreePoinconnementArme): Cle | null {
  if ((e.fck as number) > 90) return 'motif.fck-sup-90';
  const d = ((e.dx as number) + (e.dy as number)) / 2;
  if (Math.max(e.c1 as number, e.c2 as number) > 3 * d) return 'motif.poteau-allonge';
  return null;
}

function domaine2023(e: EntreePoinconnementArme): Cle | null {
  if ((e.Dlower as number) < 8) return 'motif.dlower-inf-8';
  return domaine(e);
}

function verifier(e: Complete): void {
  for (const [v, nom, u] of [
    [e.VEd, 'VEd', 'kN'],
    [e.c1, 'c1', 'mm'],
    [e.c2, 'c2', 'mm'],
    [e.dx, 'dx', 'mm'],
    [e.dy, 'dy', 'mm'],
    [e.Asx, 'Asx', 'mm2/m'],
    [e.Asy, 'Asy', 'mm2/m'],
    [e.fyk, 'fyk', 'MPa'],
    [e.phiW, 'phi_w', 'mm'],
    [e.nBrins, 'nombre de brins', '-'],
    [e.sr, 's_r', 'mm'],
  ] as const) {
    positif(v, nom, u);
  }
}

const aireBrin = (e: Complete): number => (Math.PI * e.phiW ** 2) / 4;

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

export function poinconnementArme2004(e: Complete): Calcul {
  verifier(e);
  const d = (e.dx + e.dy) / 2;
  const u0 = 2 * (e.c1 + e.c2);
  const u1 = u0 + 4 * Math.PI * d;
  const k = Math.min(1 + Math.sqrt(200 / d), 2);
  const rhoL = Math.min(Math.sqrt((e.Asx / (MM_PAR_M * e.dx)) * (e.Asy / (MM_PAR_M * e.dy))), 0.02);
  const vRdc = Math.max((0.18 / GAMMA_C_2004) * k * (100 * rhoL * e.fck) ** (1 / 3), 0.035 * k ** 1.5 * Math.sqrt(e.fck));
  const fywd = e.fyk / GAMMA_S_2004;
  const fywdEf = Math.min(250 + 0.25 * d, fywd);
  const Asw = e.nBrins * aireBrin(e);
  const vRdcsBrut = 0.75 * vRdc + 1.5 * (d / e.sr) * Asw * fywdEf / (u1 * d);
  const vRdcs = Math.min(vRdcsBrut, K_MAX_2004 * vRdc);
  const nu = 0.6 * (1 - e.fck / 250);
  const vRdMax = 0.4 * nu * fcd2004(e.fck);
  const VRdcs = (vRdcs * u1 * d) / BETA_INTERIEUR / N_PAR_KN;
  const VRdMax = (vRdMax * u0 * d) / BETA_INTERIEUR / N_PAR_KN;
  const VRd = Math.min(VRdcs, VRdMax);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      'β': recommandee(BETA_INTERIEUR, '-'),
      d: calculee(d, 'mm'),
      u_1: calculee(u1, 'mm'),
      'v_Rd,c': calculee(vRdc, 'MPa'),
      'f_ywd,ef': calculee(fywdEf, 'MPa'),
      A_sw: calculee(Asw, 'mm²'),
      'v_Rd,cs (6.52)': calculee(vRdcsBrut, 'MPa'),
      k_max: recommandee(K_MAX_2004, '-'),
      'v_Rd,cs': calculee(vRdcs, 'MPa'),
      'V_Rd,cs (u_1)': calculee(VRdcs, 'kN'),
      'V_Rd,max (u_0)': calculee(VRdMax, 'kN'),
      V_Rd: calculee(VRd, 'kN'),
    },
    clauses: ['6.4.5(1)', '(6.52)', 'A1:2014', '6.4.5(3)'],
  };
}

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

export function poinconnementArme2023(e: Complete): Calcul {
  verifier(e);
  const dv = (e.dx + e.dy) / 2;
  const b0 = 2 * (e.c1 + e.c2);
  const b05 = b0 + Math.PI * dv;
  const kpb = Math.min(Math.max(3.6 * Math.sqrt(1 - b0 / b05), 1), 2.5);
  const rhoL = Math.sqrt((e.Asx / (MM_PAR_M * e.dx)) * (e.Asy / (MM_PAR_M * e.dy)));
  const ddg = ddg2023(e.fck, e.Dlower);
  const tauRdc = Math.min(
    (0.6 / GAMMA_V_2023) * kpb * ((100 * rhoL * e.fck * ddg) / dv) ** (1 / 3),
    (0.5 / GAMMA_V_2023) * Math.sqrt(e.fck),
  );
  const tauEd = (BETA_INTERIEUR * e.VEd * N_PAR_KN) / (b05 * dv);
  const etaC = tauRdc / tauEd;
  const st = b05 / e.nBrins;
  const rhoW = aireBrin(e) / (e.sr * st);
  const fywd = e.fyk / GAMMA_S_2023;
  const etaS = Math.min(dv / (150 * e.phiW) + Math.sqrt((15 * ddg) / dv) * (1 / (etaC * kpb)) ** 1.5, 0.8);
  const tauRdcs = Math.max(etaC * tauRdc + etaS * rhoW * fywd, rhoW * fywd);
  const a = e.systeme === 'etriers' ? 0.5 : 0.7;
  const etaSys = Math.max(a + 0.63 * (b0 / dv) ** 0.25, 1);
  const tauRdMax = etaSys * tauRdc;
  const tau = Math.min(tauRdcs, tauRdMax);
  const VRd = (tau * b05 * dv) / BETA_INTERIEUR / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: VRd,
    intermediaires: {
      'β_e': recommandee(BETA_INTERIEUR, '-'),
      d_v: calculee(dv, 'mm'),
      'b_0,5': calculee(b05, 'mm'),
      k_pb: calculee(kpb, '-'),
      'τ_Rd,c': calculee(tauRdc, 'MPa'),
      'τ_Ed': calculee(tauEd, 'MPa'),
      'η_c': calculee(etaC, '-'),
      s_t: calculee(st, 'mm'),
      'ρ_w': calculee(rhoW, '-'),
      'η_s': calculee(etaS, '-'),
      'τ_Rd,cs': calculee(tauRdcs, 'MPa'),
      'η_sys': calculee(etaSys, '-'),
      'τ_Rd,max': calculee(tauRdMax, 'MPa'),
      V_Rd: calculee(VRd, 'kN'),
    },
    clauses: ['8.4.4(1)', '(8.104)', '(8.105)', '(8.106)', '(8.107)', '8.4.4(5)', '(8.109)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreePoinconnementArme>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '6.4.5',
    hypothese: 'niveau.pa.2004.base',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => poinconnementArme2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreePoinconnementArme>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '8.4.4',
    hypothese: 'niveau.pa.2023.base',
    donneesRequises: [...communs, R.Dlower, R.systeme],
    domaine: domaine2023,
    conditions: () => null,
    calculer: (e) => poinconnementArme2023(e as Complete),
  },
];

export const poinconnementArme: Mecanisme<EntreePoinconnementArme> = {
  id: 'poinconnement-arme',
  version: '0.1.0',
  titre: 'meca.pa.titre',
  champs: [
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd-poinconnement', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'c1', libelle: 'champ.c1', symbole: 'c_1', unite: 'mm' },
    { type: 'nombre', id: 'c2', libelle: 'champ.c2', symbole: 'c_2', unite: 'mm' },
    { type: 'nombre', id: 'dx', libelle: 'champ.dx', symbole: 'd_x', unite: 'mm' },
    { type: 'nombre', id: 'dy', libelle: 'champ.dy', symbole: 'd_y', unite: 'mm' },
    { type: 'nombre', id: 'Asx', libelle: 'champ.Asx', symbole: 'A_s,x', unite: 'mm²/m' },
    { type: 'nombre', id: 'Asy', libelle: 'champ.Asy', symbole: 'A_s,y', unite: 'mm²/m' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm', facultatif: true },
    {
      type: 'choix',
      id: 'systeme',
      libelle: 'champ.systeme',
      options: [
        { valeur: 'goujons', libelle: 'option.systeme.goujons' },
        { valeur: 'etriers', libelle: 'option.systeme.etriers' },
      ],
    },
    { type: 'nombre', id: 'phiW', libelle: 'champ.phiW', symbole: 'φ_w', unite: 'mm' },
    { type: 'nombre', id: 'nBrins', libelle: 'champ.nBrins', symbole: 'n', unite: '-' },
    { type: 'nombre', id: 'sr', libelle: 'champ.sr', symbole: 's_r', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.reaction-poteau', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-poinconnement', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
