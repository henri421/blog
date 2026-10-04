/**
 * Ouverture de fissure calculee d une section rectangulaire en flexion simple,
 * un lit d armatures tendues regulierement espacees (dalle ou poutre large).
 *
 * Unites : kN.m, mm, MPa.
 *
 * La contrainte de l acier fissure sigma_s est commune aux deux generations :
 * section fissuree elastique, beton tendu neglige, coefficient d equivalence
 * alpha_e saisi. Seule la traduction de sigma_s en ouverture differe.
 *
 * Premiere generation : 7.3.4, s_r,max = 3,4 c + 0,425 k1 k2 phi / rho_p,eff.
 * Deuxieme generation : 9.2.3, w_k,cal = k_w k_1/r s_r,m,cal (eps_sm - eps_cm).
 * En deuxieme generation, la section rectangulaire en flexion simple donne
 * k_fl = (h - h_c,eff) / h (9.16).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { ES, ecm2004, ecm2023, fctm2004, fctm2023, positif } from '../../materiaux';

export interface EntreeFissuration {
  b?: number;
  h?: number;
  d?: number;
  /** Diametre des barres tendues (mm). */
  phi?: number;
  /** Espacement des barres tendues (mm). */
  s?: number;
  /** Enrobage des barres tendues (mm). */
  c?: number;
  /** Moment sous combinaison quasi permanente (kN.m). */
  Mqp?: number;
  fck?: number;
  /** Coefficient d equivalence pour le calcul de sigma_s. */
  alphaE?: number;
  /** Duree de la charge : 'longue' (k_t = 0,4) ou 'courte' (k_t = 0,6). */
  duree?: string;
  /** Ouverture limite (mm). */
  wmax?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFissuration>;
const NMM_PAR_KNM = 1e6;

const R = {
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  d: { champ: 'd', libelle: 'champ.d' },
  phi: { champ: 'phi', libelle: 'champ.phi' },
  s: { champ: 's', libelle: 'champ.s-barres' },
  c: { champ: 'c', libelle: 'champ.c' },
  Mqp: { champ: 'Mqp', libelle: 'champ.Mqp' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  alphaE: { champ: 'alphaE', libelle: 'champ.alphaE' },
  duree: { champ: 'duree', libelle: 'champ.duree' },
  wmax: { champ: 'wmax', libelle: 'champ.wmax' },
} as const satisfies Record<string, { champ: keyof EntreeFissuration; libelle: Cle }>;

const requises = [R.b, R.h, R.d, R.phi, R.s, R.c, R.Mqp, R.fck, R.alphaE, R.duree, R.wmax];

function domaine(e: EntreeFissuration): Cle | null {
  if ((e.fck as number) > 90) return 'motif.fck-sup-90';
  if ((e.d as number) >= (e.h as number)) return 'motif.d-sup-h';
  return null;
}

export interface SectionFissuree {
  As: number;
  rho: number;
  x: number;
  sigmaS: number;
}

/**
 * Section fissuree elastique : x = d (-n rho + sqrt((n rho)^2 + 2 n rho)),
 * sigma_s = M / (A_s (d - x/3)).
 */
export function sectionFissuree(e: Complete): SectionFissuree {
  positif(e.b, 'b', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.phi, 'phi', 'mm');
  positif(e.s, 's', 'mm');
  positif(e.c, 'c', 'mm');
  positif(e.Mqp, 'Mqp', 'kN.m');
  positif(e.alphaE, 'alphaE', '-');
  const As = ((e.b / e.s) * Math.PI * e.phi ** 2) / 4;
  const rho = As / (e.b * e.d);
  const nr = e.alphaE * rho;
  const x = e.d * (-nr + Math.sqrt(nr * nr + 2 * nr));
  const sigmaS = (e.Mqp * NMM_PAR_KNM) / (As * (e.d - x / 3));
  return { As, rho, x, sigmaS };
}

const kt = (e: Complete): number => (e.duree === 'courte' ? 0.6 : 0.4);

/**
 * eps_sm - eps_cm = max((sigma_s - k_t f_ct,eff/rho_eff (1 + alpha_e rho_eff)) / E_s ; plancher sigma_s / E_s).
 * Plancher : 0,6 quelle que soit la duree en premiere generation (7.9) ;
 * 1 - k_t en deuxieme (9.11).
 */
function ecartDeformation(sigmaS: number, k: number, fct: number, rhoEff: number, alphaE: number, plancher: number): number {
  return Math.max((sigmaS - ((k * fct) / rhoEff) * (1 + alphaE * rhoEff)) / ES, (plancher * sigmaS) / ES);
}

function base(e: Complete, sf: SectionFissuree): Cellule['intermediaires'] {
  return {
    'α_e (σ_s)': saisie(e.alphaE, '-'),
    A_s: calculee(sf.As, 'mm²'),
    x: calculee(sf.x, 'mm'),
    'σ_s': calculee(sf.sigmaS, 'MPa'),
    k_t: recommandee(kt(e), '-'),
  };
}

/** 7.3.4 : w_k = s_r,max (eps_sm - eps_cm), k1 = 0,8, k2 = 0,5, k3 = 3,4, k4 = 0,425. */
export function fissuration2004(e: Complete): Calcul {
  const sf = sectionFissuree(e);
  const hcef = Math.min(2.5 * (e.h - e.d), (e.h - sf.x) / 3, e.h / 2);
  const rhoEff = sf.As / (e.b * hcef);
  const fct = fctm2004(e.fck);
  const alphaEcm = ES / ecm2004(e.fck);
  const de = ecartDeformation(sf.sigmaS, kt(e), fct, rhoEff, alphaEcm, 0.6);
  const espaceSerre = e.s <= 5 * (e.c + e.phi / 2);
  const srmax = espaceSerre ? 3.4 * e.c + 0.425 * 0.8 * 0.5 * (e.phi / rhoEff) : 1.3 * (e.h - sf.x);
  const wk = srmax * de;
  return {
    statut: { etat: 'calcule' },
    sollicitation: wk,
    resistance: e.wmax,
    intermediaires: {
      ...base(e, sf),
      'h_c,ef': calculee(hcef, 'mm'),
      'ρ_p,eff': calculee(rhoEff, '-'),
      'f_ct,eff': calculee(fct, 'MPa'),
      'α_e (E_cm)': calculee(alphaEcm, '-'),
      'ε_sm − ε_cm': calculee(de, '-'),
      's_r,max': calculee(srmax, 'mm'),
      w_k: calculee(wk, 'mm'),
    },
    clauses: espaceSerre ? ['7.3.4(1)', '(7.9)', '(7.11)'] : ['7.3.4(1)', '(7.9)', '(7.14)'],
  };
}

/** k_b pour une barre en bonne condition d adherence (9.2.3). */
export const KB_2023 = 0.9;
/** Coefficient de passage de l ouverture moyenne a l ouverture calculee, k_w = 1,7 (9.2.3(2), NOTE 1). */
export const KW_2023 = 1.7;

/** 9.2.3 : w_k,cal = k_w k_1/r s_r,m,cal (eps_sm - eps_cm). */
export function fissuration2023(e: Complete): Calcul {
  const sf = sectionFissuree(e);
  const ay = e.h - e.d;
  const hceff = Math.min(ay + 5 * e.phi, 10 * e.phi, 3.5 * ay, e.h - sf.x, e.h / 2);
  const bceff = e.s > 10 * e.phi ? (e.b * 10 * e.phi) / e.s : e.b;
  const rhoEff = sf.As / (bceff * hceff);
  const kfl = (e.h - hceff) / e.h;
  const srm = Math.min(1.5 * e.c + ((kfl * KB_2023) / 7.2) * (e.phi / rhoEff), (1.3 * (e.h - sf.x)) / KW_2023);
  const k1r = (e.h - sf.x) / (e.h - ay - sf.x);
  const fct = fctm2023(e.fck);
  const alphaEcm = ES / ecm2023(e.fck);
  const de = ecartDeformation(sf.sigmaS, kt(e), fct, rhoEff, alphaEcm, 1 - kt(e));
  const wk = KW_2023 * k1r * srm * de;
  return {
    statut: { etat: 'calcule' },
    sollicitation: wk,
    resistance: e.wmax,
    intermediaires: {
      ...base(e, sf),
      a_y: calculee(ay, 'mm'),
      'h_c,eff': calculee(hceff, 'mm'),
      'b_c,eff': calculee(bceff, 'mm'),
      'ρ_eff': calculee(rhoEff, '-'),
      k_fl: calculee(kfl, '-'),
      k_b: recommandee(KB_2023, '-'),
      k_w: recommandee(KW_2023, '-'),
      'k_1/r': calculee(k1r, '-'),
      'f_ct,eff': calculee(fct, 'MPa'),
      'α_e (E_cm)': calculee(alphaEcm, '-'),
      'ε_sm − ε_cm': calculee(de, '-'),
      's_r,m,cal': calculee(srm, 'mm'),
      'w_k,cal': calculee(wk, 'mm'),
    },
    clauses: ['9.2.3', '(9.8)', '(9.9)', '(9.11)', '(9.15)', '(9.16)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeFissuration>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '7.3.4',
    hypothese: 'niveau.fiss.2004.base',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => fissuration2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeFissuration>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '9.2.3',
    hypothese: 'niveau.fiss.2023.base',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => fissuration2023(e as Complete),
  },
];

export const fissuration: Mecanisme<EntreeFissuration> = {
  id: 'fissuration',
  version: '0.1.0',
  titre: 'meca.fiss.titre',
  champs: [
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 's', libelle: 'champ.s-barres', symbole: 's', unite: 'mm' },
    { type: 'nombre', id: 'c', libelle: 'champ.c', symbole: 'c', unite: 'mm' },
    { type: 'nombre', id: 'Mqp', libelle: 'champ.Mqp', symbole: 'M_qp', unite: 'kN·m' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'alphaE', libelle: 'champ.alphaE', symbole: 'α_e', unite: '-' },
    {
      type: 'choix',
      id: 'duree',
      libelle: 'champ.duree',
      options: [
        { valeur: 'longue', libelle: 'option.duree.longue' },
        { valeur: 'courte', libelle: 'option.duree.courte' },
      ],
    },
    { type: 'nombre', id: 'wmax', libelle: 'champ.wmax', symbole: 'w_max', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.ouverture', unite: 'mm' },
  resistance: { libelle: 'grandeur.ouverture-limite', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
