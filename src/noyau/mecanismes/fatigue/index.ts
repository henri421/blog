/**
 * Fatigue : verifications simplifiees des armatures, du beton comprime et du
 * beton cisaille des elements sans armature d effort tranchant.
 *
 * Unites : MPa, kN.
 *
 * Armatures de beton arme en traction, etendue de contrainte Delta sigma :
 *   2004 (6.8.6(1), valeurs recommandees) : k_1 = 70 MPa barres non soudees,
 *   k_2 = 35 MPa barres soudees ; pas de valeur simplifiee pour les coupleurs.
 *   2023 (10.4(1) a)) : 90 MPa (phi <= 12) ou 73 MPa (phi > 12) non soudees,
 *   40 ou 30 MPa soudees bout a bout et par points, 19 MPa coupleurs.
 * Beton comprime (compression positive) :
 *   2004 (6.8.7(2)) : sigma_c,max / f_cd,fat <= 0,5 + 0,45 sigma_c,min / f_cd,fat,
 *   au plus 0,9 (f_ck <= 50 MPa) ou 0,8 ; sigma_c,min de traction pris nul ;
 *   f_cd,fat = k_1 beta_cc(t_0) f_cd (1 - f_ck/250), k_1 = 0,85 (6.76).
 *   2023 (10.5) : meme forme, au plus 0,9 ; f_cd,fat = beta_cc(t_0) f_ck/gamma_C
 *   k_tc eta_cc,fat, eta_cc,fat = min(0,85 eta_cc ; 0,8) (10.5).
 * Beton cisaille, elements sans armature d effort tranchant (efforts V, ou
 *   contraintes tau en 2023, le rapport etant le meme a section donnee) :
 *   V_min/V_max >= 0 : |V_max|/V_Rd,c <= 0,5 + 0,45 |V_min|/V_Rd,c, au plus
 *   0,9 (0,8 au-dela du C50/60 en 2004) ; V_min/V_max < 0 :
 *   |V_max|/V_Rd,c <= 0,5 - |V_min|/V_Rd,c (6.78), (6.79) ; (10.6), (10.7).
 *   V_Rd,c est saisi par generation ((6.2.a) ; (8.27) ou (8.94)).
 * beta_cc(t_0) est saisi. Choix de l outil : armatures de precontrainte
 *   (10.4(1) b), c)), bielles des elements armes (6.8.7(3) ; 10.6(1)) et
 *   surfaces de reprise (10.7) non codees ; les etendues de contrainte sont
 *   saisies, calculees par l ingenieur sous la combinaison de fatigue.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_C_2023, K_TC_2023, etaCc2023, fcd2004, positif } from '../../materiaux';

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

// ---------------------------------------------------------------------------
// Armatures
// ---------------------------------------------------------------------------

export interface EntreeFatigueAcier {
  /** 'non-soudee', 'soudee' ou 'coupleur'. */
  type?: string;
  phi?: number;
  /** Etendue de contrainte de calcul sous la combinaison de fatigue (MPa). */
  deltaSigma?: number;
}

type CompleteAcier = Required<EntreeFatigueAcier>;

const RA = {
  type: { champ: 'type', libelle: 'champ.type-armature-fatigue' },
  phi: { champ: 'phi', libelle: 'champ.phi' },
  deltaSigma: { champ: 'deltaSigma', libelle: 'champ.deltaSigma' },
} as const satisfies Record<string, { champ: keyof EntreeFatigueAcier; libelle: Cle }>;

export function limiteAcier2004(type: string): number {
  return type === 'soudee' ? 35 : 70;
}

export function limiteAcier2023(type: string, phi: number): number {
  if (type === 'coupleur') return 19;
  if (type === 'soudee') return phi <= 12 ? 40 : 30;
  return phi <= 12 ? 90 : 73;
}

function acier(e: CompleteAcier, limite: number, clauses: string[]): Calcul {
  positif(e.phi, 'phi', 'mm');
  if (!(Number.isFinite(e.deltaSigma) && e.deltaSigma >= 0)) throw new Error('Delta sigma doit etre positif ou nul (MPa).');
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.deltaSigma,
    resistance: limite,
    intermediaires: { 'Δσ_s': saisie(e.deltaSigma, 'MPa'), 'Δσ limite': recommandee(limite, 'MPa') },
    clauses,
  };
}

const niveauxAcier2004: DefinitionNiveau<EntreeFatigueAcier>[] = [
  {
    id: 'simplifie',
    ordre: 1,
    position: 'corps',
    clause: '6.8.6',
    hypothese: 'niveau.fat.acier.2004',
    donneesRequises: [RA.type, RA.phi, RA.deltaSigma],
    conditions: (e) => (e.type === 'coupleur' ? 'motif.fatigue-coupleur-2004' : null),
    calculer: (e) => acier(e as CompleteAcier, limiteAcier2004(e.type as string), ['6.8.6(1)']),
  },
];

const niveauxAcier2023: DefinitionNiveau<EntreeFatigueAcier>[] = [
  {
    id: 'simplifie',
    ordre: 1,
    position: 'corps',
    clause: '10.4',
    hypothese: 'niveau.fat.acier.2023',
    donneesRequises: [RA.type, RA.phi, RA.deltaSigma],
    conditions: () => null,
    calculer: (e) => acier(e as CompleteAcier, limiteAcier2023(e.type as string, e.phi as number), ['10.4(1) a)']),
  },
];

export const fatigueAcier: Mecanisme<EntreeFatigueAcier> = {
  id: 'fatigue-acier',
  version: '0.1.0',
  titre: 'meca.fat.acier.titre',
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-armature-fatigue',
      options: [
        { valeur: 'non-soudee', libelle: 'option.fat.non-soudee' },
        { valeur: 'soudee', libelle: 'option.fat.soudee' },
        { valeur: 'coupleur', libelle: 'option.fat.coupleur' },
      ],
    },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'deltaSigma', libelle: 'champ.deltaSigma', symbole: 'Δσ_s', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.etendue-contrainte', unite: 'MPa' },
  resistance: { libelle: 'grandeur.etendue-limite', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveauxAcier2004, 'ec2-2023': niveauxAcier2023 },
};

// ---------------------------------------------------------------------------
// Beton comprime
// ---------------------------------------------------------------------------

export interface EntreeFatigueBeton {
  fck?: number;
  /** Coefficient beta_cc(t_0) a la premiere application de la charge cyclique. */
  betaCc?: number;
  /** Compressions maximale et minimale sur la meme fibre (MPa, compression positive). */
  sigmaMax?: number;
  sigmaMin?: number;
}

type CompleteBeton = Required<EntreeFatigueBeton>;

const RB = {
  fck: { champ: 'fck', libelle: 'champ.fck' },
  betaCc: { champ: 'betaCc', libelle: 'champ.betaCc-t0' },
  sigmaMax: { champ: 'sigmaMax', libelle: 'champ.sigma-c-max' },
  sigmaMin: { champ: 'sigmaMin', libelle: 'champ.sigma-c-min' },
} as const satisfies Record<string, { champ: keyof EntreeFatigueBeton; libelle: Cle }>;

function beton(e: CompleteBeton, fcdfat: number, plafond: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  positif(e.sigmaMax, 'sigma_c,max', 'MPa');
  if (!Number.isFinite(e.sigmaMin) || e.sigmaMin > e.sigmaMax) throw new Error('sigma_c,min doit etre au plus egale a sigma_c,max (MPa).');
  const smin = Math.max(e.sigmaMin, 0);
  const limite = Math.min(0.5 + (0.45 * smin) / fcdfat, plafond);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.sigmaMax,
    resistance: limite * fcdfat,
    intermediaires: {
      ...inter,
      f_cd_fat: calculee(fcdfat, 'MPa'),
      'σ_c,min retenue': calculee(smin, 'MPa'),
      'σ_c,max / f_cd,fat': calculee(e.sigmaMax / fcdfat, '-'),
      'rapport limite': calculee(limite, '-'),
      plafond: recommandee(plafond, '-'),
    },
    clauses,
  };
}

export function fatigueBeton2004(e: CompleteBeton): Calcul {
  positif(e.betaCc, 'beta_cc(t0)', '-');
  const fcd = fcd2004(e.fck);
  const fcdfat = 0.85 * e.betaCc * fcd * (1 - e.fck / 250);
  return beton(e, fcdfat, e.fck <= 50 ? 0.9 : 0.8, { f_cd: calculee(fcd, 'MPa'), k_1: recommandee(0.85, '-') }, ['6.8.7(2)', '(6.76)', '(6.77)']);
}

export function fatigueBeton2023(e: CompleteBeton): Calcul {
  positif(e.betaCc, 'beta_cc(t0)', '-');
  const etaFat = Math.min(0.85 * etaCc2023(e.fck), 0.8);
  const fcdfat = ((e.betaCc * e.fck) / GAMMA_C_2023) * K_TC_2023 * etaFat;
  return beton(e, fcdfat, 0.9, { k_tc: recommandee(K_TC_2023, '-'), 'η_cc,fat': calculee(etaFat, '-') }, ['10.5', '(10.4)', '(10.5)']);
}

export const fatigueBeton: Mecanisme<EntreeFatigueBeton> = {
  id: 'fatigue-beton',
  version: '0.1.0',
  titre: 'meca.fat.beton.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'betaCc', libelle: 'champ.betaCc-t0', symbole: 'β_cc(t_0)', unite: '-' },
    { type: 'nombre', id: 'sigmaMax', libelle: 'champ.sigma-c-max', symbole: 'σ_c,max', unite: 'MPa' },
    { type: 'nombre', id: 'sigmaMin', libelle: 'champ.sigma-c-min', symbole: 'σ_c,min', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.compression-max-fatigue', unite: 'MPa' },
  resistance: { libelle: 'grandeur.compression-admissible-fatigue', unite: 'MPa' },
  niveaux: {
    'ec2-2004': [
      {
        id: 'simplifie',
        ordre: 1,
        position: 'corps',
        clause: '6.8.7',
        hypothese: 'niveau.fat.beton.2004',
        donneesRequises: [RB.fck, RB.betaCc, RB.sigmaMax, RB.sigmaMin],
        conditions: () => null,
        calculer: (e) => fatigueBeton2004(e as CompleteBeton),
      },
    ],
    'ec2-2023': [
      {
        id: 'simplifie',
        ordre: 1,
        position: 'corps',
        clause: '10.5',
        hypothese: 'niveau.fat.beton.2023',
        donneesRequises: [RB.fck, RB.betaCc, RB.sigmaMax, RB.sigmaMin],
        conditions: () => null,
        calculer: (e) => fatigueBeton2023(e as CompleteBeton),
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Beton cisaille, elements sans armature d effort tranchant
// ---------------------------------------------------------------------------

export interface EntreeFatigueTranchant {
  fck?: number;
  /** Efforts tranchants maximal et minimal du cycle dans la meme section (kN, avec leur signe). */
  vMax?: number;
  vMin?: number;
  /** Resistance sans armature d effort tranchant, par generation (kN). */
  vRdc2004?: number;
  vRdc2023?: number;
}

type CompleteTranchant = Required<EntreeFatigueTranchant>;

const RT = {
  fck: { champ: 'fck', libelle: 'champ.fck' },
  vMax: { champ: 'vMax', libelle: 'champ.vMax-fatigue' },
  vMin: { champ: 'vMin', libelle: 'champ.vMin-fatigue' },
  vRdc2004: { champ: 'vRdc2004', libelle: 'champ.vRdc2004' },
  vRdc2023: { champ: 'vRdc2023', libelle: 'champ.vRdc2023' },
} as const satisfies Record<string, { champ: keyof EntreeFatigueTranchant; libelle: Cle }>;

export function verifierFatigueTranchant(e: CompleteTranchant, vRdc: number, plafond: number, clauses: string[]): Calcul {
  positif(vRdc, 'V_Rd,c', 'kN');
  if (!(Number.isFinite(e.vMax) && e.vMax !== 0 && Number.isFinite(e.vMin))) throw new Error('V_max doit etre non nul et V_min fini (kN).');
  if (Math.abs(e.vMin) > Math.abs(e.vMax)) throw new Error('|V_min| ne peut depasser |V_max|.');
  const rmin = Math.abs(e.vMin) / vRdc;
  const alterne = e.vMin / e.vMax < 0;
  const limite = alterne ? 0.5 - rmin : Math.min(0.5 + 0.45 * rmin, plafond);
  return {
    statut: { etat: 'calcule' },
    sollicitation: Math.abs(e.vMax),
    resistance: limite * vRdc,
    intermediaires: {
      'V_Rd,c': saisie(vRdc, 'kN'),
      'V_min / V_max': calculee(e.vMin / e.vMax, '-'),
      '|V_max| / V_Rd,c': calculee(Math.abs(e.vMax) / vRdc, '-'),
      'rapport limite': calculee(limite, '-'),
    },
    clauses,
  };
}

export const fatigueTranchant: Mecanisme<EntreeFatigueTranchant> = {
  id: 'fatigue-tranchant',
  version: '0.1.0',
  titre: 'meca.fat.tranchant.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'vMax', libelle: 'champ.vMax-fatigue', symbole: 'V_Ed,max', unite: 'kN' },
    { type: 'nombre', id: 'vMin', libelle: 'champ.vMin-fatigue', symbole: 'V_Ed,min', unite: 'kN' },
    { type: 'nombre', id: 'vRdc2004', libelle: 'champ.vRdc2004', symbole: 'V_Rd,c 2004', unite: 'kN', facultatif: true },
    { type: 'nombre', id: 'vRdc2023', libelle: 'champ.vRdc2023', symbole: 'V_Rd,c 2023', unite: 'kN', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.tranchant-max-fatigue', unite: 'kN' },
  resistance: { libelle: 'grandeur.tranchant-admissible-fatigue', unite: 'kN' },
  niveaux: {
    'ec2-2004': [
      {
        id: 'simplifie',
        ordre: 1,
        position: 'corps',
        clause: '6.8.7(4)',
        hypothese: 'niveau.fat.tranchant.2004',
        donneesRequises: [RT.fck, RT.vMax, RT.vMin, RT.vRdc2004],
        conditions: () => null,
        calculer: (e) => {
          const c = e as CompleteTranchant;
          return verifierFatigueTranchant(c, c.vRdc2004, c.fck <= 50 ? 0.9 : 0.8, ['6.8.7(4)', '(6.78)', '(6.79)']);
        },
      },
    ],
    'ec2-2023': [
      {
        id: 'simplifie',
        ordre: 1,
        position: 'corps',
        clause: '10.6(2)',
        hypothese: 'niveau.fat.tranchant.2023',
        donneesRequises: [RT.vMax, RT.vMin, RT.vRdc2023],
        conditions: () => null,
        calculer: (e) => {
          const c = e as CompleteTranchant;
          return verifierFatigueTranchant(c, c.vRdc2023, 0.9, ['10.6(2)', '(10.6)', '(10.7)']);
        },
      },
    ],
  },
};
