/**
 * Cisaillement a l interface entre betons coules a des dates differentes
 * (dalle rapportee sur predalle, reprise de betonnage).
 *
 * Unites : kN, mm, MPa.
 *
 * La contrainte agissante est la meme dans les deux generations :
 * tau_Edi = beta V_Ed / (z b_i) ((6.24) ; (8.75)).
 *
 * Premiere generation (6.2.5) :
 *   v_Rdi = c f_ctd + mu sigma_n + rho f_yd (mu sin(alpha) + cos(alpha)) <= 0,5 nu f_cd (6.25).
 * Deuxieme generation (8.2.6), deux niveaux :
 *   1. armatures ancrees pour f_yd (ou absentes) (8.76) :
 *      c_v1 sqrt(fck)/gamma_C + mu_v sigma_n + rho_i f_yd (mu_v sin + cos)
 *      <= 0,30 f_cd + rho_i f_yd cos(alpha) ;
 *   2. armatures dont l ancrage ne permet pas la plastification (8.77) :
 *      c_v2 sqrt(fck)/gamma_C + mu_v sigma_n + k_v rho_i f_yd mu_v
 *      + k_dowel rho_i sqrt(f_yd f_cd) <= 0,25 f_cd.
 *
 * Correspondances et choix de l outil :
 * - la classe « tres rugueuse » de 2023 n existe pas en 2004 : la premiere
 *   generation la traite comme « rugueuse » (aspérites d au moins 3 mm) ;
 * - « tres lisse » en 2004 : c pris a la borne basse 0,025 de la plage ;
 * - effet de goujon : la barre est supposee a au moins 10 phi du bord libre ;
 * - la majoration de c_v2 par 1,2 pour les dalles rapportees n est pas
 *   appliquee (sens de la securite).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import {
  GAMMA_C_2004,
  GAMMA_C_2023,
  GAMMA_S_2004,
  GAMMA_S_2023,
  fcd2004,
  fcd2023,
  fctm2004,
  positif,
} from '../../materiaux';

export interface EntreeInterface {
  VEd?: number;
  /** Rapport beta entre l effort longitudinal dans le beton de reprise et l effort total. */
  beta?: number;
  /** Bras de levier de la section composite (mm). */
  z?: number;
  /** Largeur de l interface (mm). */
  bi?: number;
  /** 'tres-lisse', 'lisse', 'rugueuse', 'tres-rugueuse' ou 'a-cles'. */
  rugosite?: string;
  /** Resistance du beton le plus faible des deux (MPa). */
  fck?: number;
  fyk?: number;
  /** Armatures traversant l interface, par metre de longueur (mm2/m). */
  Asi?: number;
  /** Angle des armatures d interface (degres). */
  alpha?: number;
  /** Contrainte normale sur l interface, positive en compression (MPa). */
  sigmaN?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeInterface>;
const N_PAR_KN = 1000;
const MM_PAR_M = 1000;

/** Coefficients de la premiere generation, 6.2.5(2). */
const COEF_2004: Record<string, { c: number; mu: number }> = {
  'tres-lisse': { c: 0.025, mu: 0.5 },
  lisse: { c: 0.2, mu: 0.6 },
  rugueuse: { c: 0.4, mu: 0.7 },
  'tres-rugueuse': { c: 0.4, mu: 0.7 },
  'a-cles': { c: 0.5, mu: 0.9 },
};

/** Coefficients de la deuxieme generation, tableau 8.2 ; null : formule (8.77) sans objet. */
const COEF_2023: Record<string, { cv1: number; mu: number; cv2: number | null; kv: number | null; kdowel: number | null }> = {
  'tres-lisse': { cv1: 0.01, mu: 0.5, cv2: 0, kv: 0, kdowel: 1.5 },
  lisse: { cv1: 0.08, mu: 0.6, cv2: 0, kv: 0.5, kdowel: 1.1 },
  rugueuse: { cv1: 0.15, mu: 0.7, cv2: 0.08, kv: 0.5, kdowel: 0.9 },
  'tres-rugueuse': { cv1: 0.19, mu: 0.9, cv2: 0.15, kv: 0.5, kdowel: 0.9 },
  'a-cles': { cv1: 0.37, mu: 0.9, cv2: null, kv: null, kdowel: null },
};

const R = {
  VEd: { champ: 'VEd', libelle: 'champ.VEd' },
  beta: { champ: 'beta', libelle: 'champ.beta-interface' },
  z: { champ: 'z', libelle: 'champ.z-composite' },
  bi: { champ: 'bi', libelle: 'champ.bi' },
  rugosite: { champ: 'rugosite', libelle: 'champ.rugosite' },
  fck: { champ: 'fck', libelle: 'champ.fck-interface' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Asi: { champ: 'Asi', libelle: 'champ.Asi' },
  alpha: { champ: 'alpha', libelle: 'champ.alpha-interface' },
  sigmaN: { champ: 'sigmaN', libelle: 'champ.sigmaN' },
} as const satisfies Record<string, { champ: keyof EntreeInterface; libelle: Cle }>;

const requises = [R.VEd, R.beta, R.z, R.bi, R.rugosite, R.fck, R.fyk, R.Asi, R.alpha, R.sigmaN];

function domaine(e: EntreeInterface): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

/** tau_Edi = beta V_Ed / (z b_i) ((6.24), (8.75)). */
export function contrainteInterface(e: Complete): number {
  positif(e.VEd, 'VEd', 'kN');
  positif(e.beta, 'beta', '-');
  positif(e.z, 'z', 'mm');
  positif(e.bi, 'b_i', 'mm');
  return (e.beta * e.VEd * N_PAR_KN) / (e.z * e.bi);
}

function rhoInterface(e: Complete): number {
  if (!(Number.isFinite(e.Asi) && e.Asi >= 0)) throw new Error('A_si doit etre un nombre positif ou nul (mm2/m).');
  return e.Asi / (e.bi * MM_PAR_M);
}

const rad = (deg: number): number => (deg * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

export function interface2004(e: Complete): Calcul {
  const tau = contrainteInterface(e);
  const rho = rhoInterface(e);
  const k = COEF_2004[e.rugosite];
  const fctd = (0.7 * fctm2004(e.fck)) / GAMMA_C_2004;
  const fyd = e.fyk / GAMMA_S_2004;
  const fcd = fcd2004(e.fck);
  const nu = 0.6 * (1 - e.fck / 250);
  const traction = e.sigmaN < 0;
  const cohesion = traction ? 0 : k.c * fctd;
  const frottement = k.mu * e.sigmaN;
  const acier = rho * fyd * (k.mu * Math.sin(rad(e.alpha)) + Math.cos(rad(e.alpha)));
  const plafond = 0.5 * nu * fcd;
  const vRdi = Math.min(cohesion + frottement + acier, plafond);
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: vRdi,
    intermediaires: {
      'v_Edi': calculee(tau, 'MPa'),
      c: recommandee(k.c, '-'),
      'μ': recommandee(k.mu, '-'),
      f_ctd: calculee(fctd, 'MPa'),
      'ρ': calculee(rho, '-'),
      'c f_ctd': calculee(cohesion, 'MPa'),
      'ρ f_yd (μ sin α + cos α)': calculee(acier, 'MPa'),
      '0,5 ν f_cd': calculee(plafond, 'MPa'),
      v_Rdi: calculee(vRdi, 'MPa'),
    },
    clauses: ['6.2.5(1)', '(6.24)', '(6.25)', '6.2.5(2)'],
  };
}

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

export function interface2023Ancree(e: Complete): Calcul {
  const tau = contrainteInterface(e);
  const rho = rhoInterface(e);
  const k = COEF_2023[e.rugosite];
  const fyd = e.fyk / GAMMA_S_2023;
  const fcd = fcd2023(e.fck);
  const traction = e.sigmaN < 0;
  const cohesion = traction ? 0 : (k.cv1 * Math.sqrt(e.fck)) / GAMMA_C_2023;
  const frottement = traction ? 0 : k.mu * e.sigmaN;
  const acier = rho * fyd * (k.mu * Math.sin(rad(e.alpha)) + Math.cos(rad(e.alpha)));
  const plafond = 0.3 * fcd + rho * fyd * Math.cos(rad(e.alpha));
  const tauRdi = Math.min(cohesion + frottement + acier, plafond);
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: tauRdi,
    intermediaires: {
      'τ_Edi': calculee(tau, 'MPa'),
      c_v1: recommandee(k.cv1, '-'),
      'μ_v': recommandee(k.mu, '-'),
      'ρ_i': calculee(rho, '-'),
      'c_v1 √f_ck / γ_C': calculee(cohesion, 'MPa'),
      'ρ_i f_yd (μ_v sin α + cos α)': calculee(acier, 'MPa'),
      plafond: calculee(plafond, 'MPa'),
      'τ_Rdi': calculee(tauRdi, 'MPa'),
    },
    clauses: ['8.2.6(5)', '(8.75)', '(8.76)', 'tableau 8.2'],
  };
}

export function interface2023AncrageInsuffisant(e: Complete): Calcul {
  const tau = contrainteInterface(e);
  const rho = rhoInterface(e);
  const k = COEF_2023[e.rugosite];
  const fyd = e.fyk / GAMMA_S_2023;
  const fcd = fcd2023(e.fck);
  const traction = e.sigmaN < 0;
  const cv2 = k.cv2 ?? 0;
  const kv = k.kv ?? 0;
  const kdowel = k.kdowel ?? 0;
  const cohesion = traction ? 0 : (cv2 * Math.sqrt(e.fck)) / GAMMA_C_2023;
  const frottement = traction ? 0 : k.mu * e.sigmaN;
  const acier = kv * rho * fyd * k.mu;
  const goujon = kdowel * rho * Math.sqrt(fyd * fcd);
  const plafond = 0.25 * fcd;
  const tauRdi = Math.min(cohesion + frottement + acier + goujon, plafond);
  return {
    statut: { etat: 'calcule' },
    sollicitation: tau,
    resistance: tauRdi,
    intermediaires: {
      'τ_Edi': calculee(tau, 'MPa'),
      c_v2: recommandee(cv2, '-'),
      'μ_v': recommandee(k.mu, '-'),
      k_v: recommandee(kv, '-'),
      k_dowel: recommandee(kdowel, '-'),
      'ρ_i': calculee(rho, '-'),
      'c_v2 √f_ck / γ_C': calculee(cohesion, 'MPa'),
      'k_v ρ_i f_yd μ_v': calculee(acier, 'MPa'),
      'k_dowel ρ_i √(f_yd f_cd)': calculee(goujon, 'MPa'),
      '0,25 f_cd': calculee(plafond, 'MPa'),
      'τ_Rdi': calculee(tauRdi, 'MPa'),
    },
    clauses: ['8.2.6(7)', '(8.75)', '(8.77)', 'tableau 8.2'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeInterface>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '6.2.5',
    hypothese: 'niveau.int.2004.base',
    donneesRequises: requises,
    domaine,
    conditions: (e) =>
      (e.alpha as number) < 45 || (e.alpha as number) > 90
        ? 'motif.alpha-interface-2004'
        : (e.sigmaN as number) > 0.6 * fcd2004(e.fck as number)
          ? 'motif.sigman-sup'
          : null,
    calculer: (e) => interface2004(e as Complete),
  },
];

function conditions2023(e: EntreeInterface): Cle | null {
  const a = e.alpha as number;
  const max = e.rugosite === 'tres-lisse' ? 90 : 135;
  if (a < 35 || a > max) return 'motif.alpha-interface-2023';
  if ((e.sigmaN as number) > 0.6 * fcd2023(e.fck as number)) return 'motif.sigman-sup';
  return null;
}

const niveaux2023: DefinitionNiveau<EntreeInterface>[] = [
  {
    id: 'armatures-ancrees',
    ordre: 1,
    clause: '8.2.6(5)',
    hypothese: 'niveau.int.2023.armatures-ancrees',
    donneesRequises: requises,
    domaine,
    conditions: conditions2023,
    calculer: (e) => interface2023Ancree(e as Complete),
  },
  {
    id: 'ancrage-insuffisant',
    ordre: 2,
    clause: '8.2.6(7)',
    hypothese: 'niveau.int.2023.ancrage-insuffisant',
    donneesRequises: requises,
    domaine,
    conditions: (e) => (e.rugosite === 'a-cles' ? 'motif.cles-8-77' : conditions2023(e)),
    calculer: (e) => interface2023AncrageInsuffisant(e as Complete),
  },
];

export const cisaillementInterface: Mecanisme<EntreeInterface> = {
  id: 'interface',
  version: '0.1.0',
  titre: 'meca.int.titre',
  champs: [
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'beta', libelle: 'champ.beta-interface', symbole: 'β', unite: '-' },
    { type: 'nombre', id: 'z', libelle: 'champ.z-composite', symbole: 'z', unite: 'mm' },
    { type: 'nombre', id: 'bi', libelle: 'champ.bi', symbole: 'b_i', unite: 'mm' },
    {
      type: 'choix',
      id: 'rugosite',
      libelle: 'champ.rugosite',
      options: [
        { valeur: 'tres-lisse', libelle: 'option.rugosite.tres-lisse' },
        { valeur: 'lisse', libelle: 'option.rugosite.lisse' },
        { valeur: 'rugueuse', libelle: 'option.rugosite.rugueuse' },
        { valeur: 'tres-rugueuse', libelle: 'option.rugosite.tres-rugueuse' },
        { valeur: 'a-cles', libelle: 'option.rugosite.a-cles' },
      ],
    },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck-interface', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'Asi', libelle: 'champ.Asi', symbole: 'A_si', unite: 'mm²/m' },
    { type: 'nombre', id: 'alpha', libelle: 'champ.alpha-interface', symbole: 'α', unite: '°' },
    { type: 'nombre', id: 'sigmaN', libelle: 'champ.sigmaN', symbole: 'σ_n', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.cisaillement-interface', unite: 'MPa' },
  resistance: { libelle: 'grandeur.resistance-interface', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
