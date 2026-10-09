/**
 * Beton non arme : effort normal excentre, effort tranchant sous compression,
 * semelles superficielles non armees.
 *
 * Unites : mm, kN, MPa ; pression du sol en kN/m2.
 *
 * Resistances de calcul :
 *   2004 (12.3.1, valeurs recommandees) : f_cd,pl = 0,8 f_ck/gamma_c,
 *     f_ctd,pl = 0,8 f_ctk,0.05/gamma_c (12.1) ;
 *   2023 (14.2) : f_cd,pl = 0,8 f_cd (14.1), f_cd = eta_cc k_tc f_ck/gamma_C ;
 *     f_ctd,pl = 0,8 f_ctd (14.2), f_ctd = k_tt f_ctk,0.05/gamma_C (5.5),
 *     k_tt = 0,8 (t_ref <= 28 jours, cimenterie CN ou CR) ;
 *   f_ctk,0.05 = 0,7 f_ctm.
 * Effort normal excentre d une section rectangulaire :
 *   N_Rd = eta f_cd,pl b h (1 - 2 e/h) (12.2), eta selon 3.1.7(3) ;
 *   N_Rd = f_cd,pl b h (1 - 2 e/h) (14.3).
 * Effort tranchant (12.6.3 ; 14.4.3(3)) : sigma_cp = |N_Ed|/A_cc,
 *   tau_cp = 1,5 V_Ed/A_cc ; tau_Rd = racine(f_ctd,pl^2 + sigma_cp f_ctd,pl)
 *   si sigma_cp <= sigma_c,lim, sinon diminue de ((sigma_cp - sigma_c,lim)/2)^2 ;
 *   sigma_c,lim = f_cd,pl - 2 racine(f_ctd,pl (f_ctd,pl + f_cd,pl)).
 * Semelles (12.9.3 ; 14.6.3) : 0,85 h_F/a_F >= racine(3 sigma_gd/f_ctd,pl)
 *   (12.13 ; 14.13), ou simplement h_F/a_F >= 2 (12.14 ; 14.14).
 * Voiles et poteaux contreventes elances, methode simplifiee :
 *   2004 (12.6.5.2) : N_Rd = b h f_cd,pl Phi (12.10),
 *     Phi = 1,14 (1 - 2 e_tot/h) - 0,02 l_0/h <= 1 - 2 e_tot/h (12.11) ;
 *   2023 (14.4.5.2) : N_Rd = b h f_cd,pl Phi (14.10), f_ck < 55 MPa,
 *     Phi = [1 - (2,1 + 0,02 l_0/h) e_tot/h] /
 *           [1 + (l_0/h)^2 (0,9 + 6 e_tot/h) ((0,8 + phi_eff)/1000) (f_cd,pl/20)^0,6] (14.11) ;
 *   e_tot = e_0 + e_i (12.12 ; 14.12) ; l_0/h <= 25 pour un voile coule en place
 *   (12.6.5.1(5) ; 14.4.5.1(5)).
 * Choix de l outil : e_i = l_0/400 dans les deux generations (5.2(7) ;
 *   7.2.1, element contrevente) ; l_0 saisie (coefficient beta du tableau 12.1
 *   ou 14.1 applique par l ingenieur) ; Phi ramene a 0 s il devient negatif ;
 *   la valeur 1,0 de k_tt pour une sollicitation tardive n est pas proposee.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_C_2023, fcd2023, fctm2004, fctm2023, positif } from '../../materiaux';

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Generation = '2004' | '2023';

/** Coefficients alpha_cc,pl, alpha_ct,pl (2004) et k_c,pl, k_t,pl (2023), valeurs recommandees. */
const K_PL = 0.8;
/** k_tt pour t_ref <= 28 jours (5.1.6(2), NOTE). */
const K_TT_2023 = 0.8;

export function fcdPl(gen: Generation, fck: number): number {
  return gen === '2004' ? (K_PL * fck) / GAMMA_C_2004 : K_PL * fcd2023(fck);
}

export function fctdPl(gen: Generation, fck: number): number {
  if (gen === '2004') return (K_PL * 0.7 * fctm2004(fck)) / GAMMA_C_2004;
  return (K_PL * K_TT_2023 * 0.7 * fctm2023(fck)) / GAMMA_C_2023;
}

function domaine(e: { fck?: number }): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

const RC = { fck: { champ: 'fck', libelle: 'champ.fck' } } as const;

// ---------------------------------------------------------------------------
// Effort normal excentre
// ---------------------------------------------------------------------------

export interface EntreeNonArmeCompression {
  fck?: number;
  /** Largeur b et epaisseur h de la section (mm). */
  b?: number;
  h?: number;
  /** Excentricite de N_Ed dans la direction de h (mm). */
  e?: number;
  /** Effort normal de calcul, compression positive (kN). */
  NEd?: number;
  /** Longueur efficace l_0 = beta l_w (mm), pour la methode des elements elances. */
  l0?: number;
  /** Coefficient de fluage effectif (2023). */
  phiEff?: number;
}

type CompleteCompression = Required<EntreeNonArmeCompression>;

const RN = {
  ...RC,
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  e: { champ: 'e', libelle: 'champ.e-excentricite' },
  NEd: { champ: 'NEd', libelle: 'champ.NEd-compression' },
  l0: { champ: 'l0', libelle: 'champ.l0' },
  phiEff: { champ: 'phiEff', libelle: 'champ.phiEff' },
} as const satisfies Record<string, { champ: keyof EntreeNonArmeCompression; libelle: Cle }>;

export function compression(gen: Generation, e: CompleteCompression): Calcul {
  positif(e.b, 'b', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.NEd, 'N_Ed', 'kN');
  if (!(Number.isFinite(e.e) && e.e >= 0)) throw new Error('e doit etre positive ou nulle (mm).');
  const eta = gen === '2004' && e.fck > 50 ? 1 - (e.fck - 50) / 200 : 1;
  const fcd = fcdPl(gen, e.fck);
  const NRd = (eta * fcd * e.b * e.h * (1 - (2 * e.e) / e.h)) / 1000;
  const inter: Cellule['intermediaires'] = { 'f_cd,pl': calculee(fcd, 'MPa') };
  if (gen === '2004') inter['η'] = calculee(eta, '-');
  inter['1 − 2 e/h'] = calculee(1 - (2 * e.e) / e.h, '-');
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.NEd,
    resistance: NRd,
    intermediaires: inter,
    clauses: gen === '2004' ? ['12.3.1', '12.6.1(3)', '(12.2)'] : ['14.2', '(14.1)', '14.4.2(3)', '(14.3)'],
  };
}

function niveauCompression(gen: Generation): DefinitionNiveau<EntreeNonArmeCompression> {
  return {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '12.6.1' : '14.4.2',
    hypothese: gen === '2004' ? 'niveau.na.compression.2004' : 'niveau.na.compression.2023',
    donneesRequises: [RN.fck, RN.b, RN.h, RN.e, RN.NEd],
    domaine,
    conditions: (e) => ((e.e as number) >= (e.h as number) / 2 ? 'motif.na-excentricite' : null),
    calculer: (e) => compression(gen, e as CompleteCompression),
  };
}

/** Methode simplifiee des voiles et poteaux contreventes elances ((12.10)-(12.12) ; (14.10)-(14.12)). */
export function compressionElance(gen: Generation, e: CompleteCompression): Calcul {
  positif(e.b, 'b', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.NEd, 'N_Ed', 'kN');
  positif(e.l0, 'l_0', 'mm');
  if (!(Number.isFinite(e.e) && e.e >= 0)) throw new Error('e doit etre positive ou nulle (mm).');
  const fcd = fcdPl(gen, e.fck);
  const ei = e.l0 / 400;
  const etot = e.e + ei;
  const l0h = e.l0 / e.h;
  const inter: Cellule['intermediaires'] = {
    'f_cd,pl': calculee(fcd, 'MPa'),
    e_i: calculee(ei, 'mm'),
    e_tot: calculee(etot, 'mm'),
    'l_0 / h': calculee(l0h, '-'),
  };
  let Phi: number;
  if (gen === '2004') {
    Phi = Math.min(1.14 * (1 - (2 * etot) / e.h) - 0.02 * l0h, 1 - (2 * etot) / e.h);
  } else {
    if (!(Number.isFinite(e.phiEff) && e.phiEff >= 0)) throw new Error('phi_eff doit etre positif ou nul.');
    const num = 1 - (2.1 + 0.02 * l0h) * (etot / e.h);
    const den = 1 + l0h ** 2 * (0.9 + (6 * etot) / e.h) * ((0.8 + e.phiEff) / 1000) * (fcd / 20) ** 0.6;
    inter['numérateur (14.11)'] = calculee(num, '-');
    inter['dénominateur (14.11)'] = calculee(den, '-');
    Phi = num / den;
  }
  Phi = Math.max(Phi, 0);
  inter['Φ'] = calculee(Phi, '-');
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.NEd,
    resistance: (e.b * e.h * fcd * Phi) / 1000,
    intermediaires: inter,
    clauses: gen === '2004' ? ['12.6.5.2', '(12.10)', '(12.11)', '(12.12)'] : ['14.4.5.2', '(14.10)', '(14.11)', '(14.12)'],
  };
}

function conditionsElance(gen: Generation) {
  return (e: EntreeNonArmeCompression): Cle | null => {
    if (gen === '2023' && (e.fck as number) >= 55) return 'motif.na-elance-fck';
    return (e.l0 as number) / (e.h as number) > 25 ? 'motif.na-elance-l0h' : null;
  };
}

function niveauElance(gen: Generation): DefinitionNiveau<EntreeNonArmeCompression> {
  return {
    id: 'elance',
    ordre: 2,
    position: 'corps',
    clause: gen === '2004' ? '12.6.5.2' : '14.4.5.2',
    hypothese: gen === '2004' ? 'niveau.na.elance.2004' : 'niveau.na.elance.2023',
    donneesRequises: gen === '2004' ? [RN.fck, RN.b, RN.h, RN.e, RN.NEd, RN.l0] : [RN.fck, RN.b, RN.h, RN.e, RN.NEd, RN.l0, RN.phiEff],
    domaine,
    conditions: conditionsElance(gen),
    calculer: (e) => compressionElance(gen, e as CompleteCompression),
  };
}

export const nonArmeCompression: Mecanisme<EntreeNonArmeCompression> = {
  id: 'non-arme-compression',
  version: '0.1.0',
  titre: 'meca.na.compression.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'e', libelle: 'champ.e-excentricite', symbole: 'e', unite: 'mm' },
    { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-compression', symbole: 'N_Ed', unite: 'kN' },
    { type: 'nombre', id: 'l0', libelle: 'champ.l0', symbole: 'l_0', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'phiEff', libelle: 'champ.phiEff', symbole: 'φ_eff', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-normal', unite: 'kN' },
  resistance: { libelle: 'grandeur.effort-normal-resistant', unite: 'kN' },
  niveaux: {
    'ec2-2004': [niveauCompression('2004'), niveauElance('2004')],
    'ec2-2023': [niveauCompression('2023'), niveauElance('2023')],
  },
};

// ---------------------------------------------------------------------------
// Effort tranchant
// ---------------------------------------------------------------------------

export interface EntreeNonArmeTranchant {
  fck?: number;
  /** Effort normal de compression (kN, valeur absolue) et effort tranchant (kN). */
  NEd?: number;
  VEd?: number;
  /** Aire comprimee A_cc (mm2), section rectangulaire. */
  Acc?: number;
}

type CompleteTranchant = Required<EntreeNonArmeTranchant>;

const RV = {
  ...RC,
  NEd: { champ: 'NEd', libelle: 'champ.NEd-compression' },
  VEd: { champ: 'VEd', libelle: 'champ.VEd' },
  Acc: { champ: 'Acc', libelle: 'champ.Acc' },
} as const satisfies Record<string, { champ: keyof EntreeNonArmeTranchant; libelle: Cle }>;

export function tranchant(gen: Generation, e: CompleteTranchant): Calcul {
  positif(e.Acc, 'A_cc', 'mm2');
  positif(e.VEd, 'V_Ed', 'kN');
  if (!(Number.isFinite(e.NEd) && e.NEd >= 0)) throw new Error('|N_Ed| doit etre positif ou nul (kN).');
  const fcd = fcdPl(gen, e.fck);
  const fctd = fctdPl(gen, e.fck);
  const scp = (e.NEd * 1000) / e.Acc;
  const tcp = (1.5 * e.VEd * 1000) / e.Acc;
  const slim = fcd - 2 * Math.sqrt(fctd * (fctd + fcd));
  const base = fctd ** 2 + scp * fctd;
  const tRd = Math.sqrt(scp <= slim ? base : Math.max(base - ((scp - slim) / 2) ** 2, 0));
  return {
    statut: { etat: 'calcule' },
    sollicitation: tcp,
    resistance: tRd,
    intermediaires: {
      'f_cd,pl': calculee(fcd, 'MPa'),
      'f_ctd,pl': calculee(fctd, 'MPa'),
      'σ_cp': calculee(scp, 'MPa'),
      'σ_c,lim': calculee(slim, 'MPa'),
      'τ_cp': calculee(tcp, 'MPa'),
      'τ_Rd': calculee(tRd, 'MPa'),
    },
    clauses: gen === '2004' ? ['12.6.3', '(12.3) à (12.7)'] : ['14.4.3(3)', '(14.4) à (14.8)'],
  };
}

function niveauTranchant(gen: Generation): DefinitionNiveau<EntreeNonArmeTranchant> {
  return {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '12.6.3' : '14.4.3',
    hypothese: 'niveau.na.tranchant',
    donneesRequises: [RV.fck, RV.NEd, RV.VEd, RV.Acc],
    domaine,
    conditions: () => null,
    calculer: (e) => tranchant(gen, e as CompleteTranchant),
  };
}

export const nonArmeTranchant: Mecanisme<EntreeNonArmeTranchant> = {
  id: 'non-arme-tranchant',
  version: '0.1.0',
  titre: 'meca.na.tranchant.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-compression', symbole: '|N_Ed|', unite: 'kN' },
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'Acc', libelle: 'champ.Acc', symbole: 'A_cc', unite: 'mm²' },
  ],
  sollicitation: { libelle: 'grandeur.tau-cp', unite: 'MPa' },
  resistance: { libelle: 'grandeur.tau-rd-pl', unite: 'MPa' },
  niveaux: { 'ec2-2004': [niveauTranchant('2004')], 'ec2-2023': [niveauTranchant('2023')] },
};

// ---------------------------------------------------------------------------
// Semelles superficielles non armees
// ---------------------------------------------------------------------------

export interface EntreeSemelleNonArmee {
  fck?: number;
  /** Pression de calcul du sol (kN/m2). */
  sigmaGd?: number;
  /** Debord a_F et epaisseur h_F de la semelle (mm). */
  aF?: number;
  hF?: number;
}

type CompleteSemelle = Required<EntreeSemelleNonArmee>;

const RS = {
  ...RC,
  sigmaGd: { champ: 'sigmaGd', libelle: 'champ.sigmaGd' },
  aF: { champ: 'aF', libelle: 'champ.aF' },
  hF: { champ: 'hF', libelle: 'champ.hF' },
} as const satisfies Record<string, { champ: keyof EntreeSemelleNonArmee; libelle: Cle }>;

export function semelle(gen: Generation, e: CompleteSemelle): Calcul {
  positif(e.sigmaGd, 'sigma_gd', 'kN/m2');
  positif(e.aF, 'a_F', 'mm');
  positif(e.hF, 'h_F', 'mm');
  const fctd = fctdPl(gen, e.fck);
  const sg = e.sigmaGd / 1000;
  const rapport = Math.sqrt((3 * sg) / fctd) / 0.85;
  return {
    statut: { etat: 'calcule' },
    sollicitation: rapport * e.aF,
    resistance: e.hF,
    intermediaires: {
      'f_ctd,pl': calculee(fctd, 'MPa'),
      'σ_gd': saisie(sg, 'MPa'),
      'h_F/a_F requis': calculee(rapport, '-'),
      'h_F,min': calculee(rapport * e.aF, 'mm'),
    },
    clauses: gen === '2004' ? ['12.9.3', '(12.13)'] : ['14.6.3', '(14.13)'],
  };
}

export function semelleSimplifiee(gen: Generation, e: CompleteSemelle): Calcul {
  positif(e.aF, 'a_F', 'mm');
  positif(e.hF, 'h_F', 'mm');
  return {
    statut: { etat: 'calcule' },
    sollicitation: 2 * e.aF,
    resistance: e.hF,
    intermediaires: { 'h_F/a_F requis': recommandee(2, '-'), 'h_F,min': calculee(2 * e.aF, 'mm') },
    clauses: gen === '2004' ? ['12.9.3', '(12.14)'] : ['14.6.3', '(14.14)'],
  };
}

function niveauxSemelle(gen: Generation): DefinitionNiveau<EntreeSemelleNonArmee>[] {
  const clause = gen === '2004' ? '12.9.3' : '14.6.3';
  return [
    {
      id: 'simplifie',
      ordre: 1,
      position: 'corps',
      clause,
      hypothese: 'niveau.na.semelle.simplifie',
      donneesRequises: [RS.aF, RS.hF],
      conditions: () => null,
      calculer: (e) => semelleSimplifiee(gen, e as CompleteSemelle),
    },
    {
      id: 'pression',
      ordre: 2,
      position: 'corps',
      clause,
      hypothese: 'niveau.na.semelle.pression',
      donneesRequises: [RS.fck, RS.sigmaGd, RS.aF, RS.hF],
      domaine,
      conditions: () => null,
      calculer: (e) => semelle(gen, e as CompleteSemelle),
    },
  ];
}

export const semelleNonArmee: Mecanisme<EntreeSemelleNonArmee> = {
  id: 'semelle-non-armee',
  version: '0.1.0',
  titre: 'meca.na.semelle.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'sigmaGd', libelle: 'champ.sigmaGd', symbole: 'σ_gd', unite: 'kN/m²' },
    { type: 'nombre', id: 'aF', libelle: 'champ.aF', symbole: 'a_F', unite: 'mm' },
    { type: 'nombre', id: 'hF', libelle: 'champ.hF', symbole: 'h_F', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.epaisseur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.epaisseur-prevue', unite: 'mm' },
  niveaux: { 'ec2-2004': niveauxSemelle('2004'), 'ec2-2023': niveauxSemelle('2023') },
};
