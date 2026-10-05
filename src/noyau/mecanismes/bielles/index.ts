/**
 * Resistance des bielles et des noeuds des modeles a bielles et tirants.
 *
 * Unites : kN, mm, MPa.
 *
 * Contrainte agissante sigma_cd = F_cd / (b_c t) ((8.113) ; 6.5.2).
 *
 * Premiere generation (6.5.2, 6.5.4) : bielle sans traction transversale
 *   sigma_Rd,max = f_cd (6.55) ; bielle fissuree 0,6 nu' f_cd (6.56),
 *   nu' = 1 - fck/250 ; noeuds CCC, CCT, CTT : k1, k2, k3 = 1,0 ; 0,85 ; 0,75
 *   fois nu' f_cd (6.60 a 6.62). Les majorations de 6.5.4(5) et (6) ne sont
 *   pas codees.
 * Deuxieme generation (8.5.2, 8.5.4) : sigma_cd <= nu f_cd (8.114) ;
 *   - bielle sans fissuration transversale, ou noeud CCC, ou tirant ancre
 *     hors de la region nodale : nu = 1,0 ((8.120) ; 8.5.4.2 a 8.5.4.4) ;
 *   - sinon, nu fonction de l angle theta_cs : paliers (8.115) a (8.118),
 *     ou nu = 1/(1,11 + 0,22 cot^2 theta_cs) (8.119), ou, a partir de la
 *     deformation principale de traction, nu = 1/(1 + 110 eps_1) <= 1 (8.121).
 *   L interpolation de 8.5.4.3(4) pour un ancrage en partie dans la region
 *   nodale n est pas codee ; f_cd avec k_tc = 0,85.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeBielles {
  /** Effort de compression dans la bielle (kN). */
  Fcd?: number;
  /** Largeur et epaisseur de la bielle au droit de la section (mm). */
  bc?: number;
  t?: number;
  fck?: number;
  /**
   * 'bielle-comprimee' (sans traction transversale), 'bielle-fissuree'
   * (traversee par un tirant), 'noeud-ccc', 'noeud-cct', 'noeud-ctt'.
   */
  element?: string;
  /** Pour les noeuds CCT et CTT : 'interieur' ou 'exterieur' a la region nodale. */
  ancrage?: string;
  /** Plus petit angle entre la bielle et un tirant qui la croise (degres). */
  theta?: number;
  /** Deformation principale de traction maximale (sans unite), 2023. */
  eps1?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeBielles>;
const N_PAR_KN = 1000;

const R = {
  Fcd: { champ: 'Fcd', libelle: 'champ.Fcd-bielle' },
  bc: { champ: 'bc', libelle: 'champ.bc' },
  t: { champ: 't', libelle: 'champ.t-bielle' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  element: { champ: 'element', libelle: 'champ.element-bielle' },
  ancrage: { champ: 'ancrage', libelle: 'champ.ancrage-noeud' },
  theta: { champ: 'theta', libelle: 'champ.theta-cs' },
  eps1: { champ: 'eps1', libelle: 'champ.eps1' },
} as const satisfies Record<string, { champ: keyof EntreeBielles; libelle: Cle }>;

const communs = [R.Fcd, R.bc, R.t, R.fck, R.element, R.ancrage];

function domaine(e: EntreeBielles): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function verifier(e: Complete): void {
  positif(e.Fcd, 'F_cd', 'kN');
  positif(e.bc, 'b_c', 'mm');
  positif(e.t, 't', 'mm');
}

function cellule(e: Complete, fcd: number, nu: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  const sigma = (e.Fcd * N_PAR_KN) / (e.bc * e.t);
  const sigmaRd = nu * fcd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: sigma,
    resistance: sigmaRd,
    intermediaires: { 'σ_cd': calculee(sigma, 'MPa'), f_cd: calculee(fcd, 'MPa'), ...inter, 'σ_Rd,max': calculee(sigmaRd, 'MPa') },
    clauses,
  };
}

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

const K_NOEUD_2004: Record<string, number> = { 'noeud-ccc': 1.0, 'noeud-cct': 0.85, 'noeud-ctt': 0.75 };

export function bielles2004(e: Complete): Calcul {
  verifier(e);
  const fcd = fcd2004(e.fck);
  const nuP = 1 - e.fck / 250;
  if (e.element === 'bielle-comprimee') return cellule(e, fcd, 1, {}, ['6.5.2(1)', '(6.55)']);
  if (e.element === 'bielle-fissuree') {
    return cellule(e, fcd, 0.6 * nuP, { "ν'": calculee(nuP, '-'), '0,6 ν′': calculee(0.6 * nuP, '-') }, ['6.5.2(2)', '(6.56)', '(6.57N)']);
  }
  const k = K_NOEUD_2004[e.element];
  return cellule(e, fcd, k * nuP, { "ν'": calculee(nuP, '-'), k: recommandee(k, '-') }, ['6.5.4(4)', '(6.60) à (6.62)']);
}

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

/** nu = 1 sans fissuration transversale, au noeud CCC, ou tirant ancre hors du noeud. */
function nuUnite(e: EntreeBielles): boolean {
  if (e.element === 'bielle-comprimee' || e.element === 'noeud-ccc') return true;
  return (e.element === 'noeud-cct' || e.element === 'noeud-ctt') && e.ancrage === 'exterieur';
}

export function nuPaliers(theta: number): number {
  if (theta < 30) return 0.4;
  if (theta < 40) return 0.55;
  if (theta < 60) return 0.7;
  return 0.85;
}

export function nuContinu(theta: number): number {
  const cot = 1 / Math.tan((theta * Math.PI) / 180);
  return 1 / (1.11 + 0.22 * cot ** 2);
}

function calcul2023(e: Complete, mode: 'paliers' | 'continu' | 'deformation'): Calcul {
  verifier(e);
  const fcd = fcd2023(e.fck);
  if (nuUnite(e)) return cellule(e, fcd, 1, { 'ν': recommandee(1, '-') }, ['8.5.2(4) b)', '(8.120)', '8.5.4']);
  if (mode === 'deformation') {
    const nu = Math.min(1 / (1 + 110 * e.eps1), 1);
    return cellule(e, fcd, nu, { 'ε_1': calculee(e.eps1 * 1000, '‰'), 'ν': calculee(nu, '-') }, ['8.5.2(5)', '(8.121)']);
  }
  const nu = mode === 'paliers' ? nuPaliers(e.theta) : nuContinu(e.theta);
  return cellule(
    e,
    fcd,
    nu,
    { 'θ_cs': calculee(e.theta, '°'), 'ν': mode === 'paliers' ? recommandee(nu, '-') : calculee(nu, '-') },
    mode === 'paliers' ? ['8.5.2(4) a)', '(8.115) à (8.118)'] : ['8.5.2(4) a)', '(8.119)'],
  );
}

/** Les expressions de nu en fonction de l angle ne couvrent que theta_cs >= 20 degres. */
function conditionAngle(e: EntreeBielles): Cle | null {
  if (nuUnite(e)) return null;
  const t = e.theta as number;
  return t >= 20 && t <= 90 ? null : 'motif.theta-cs-hors';
}

/** theta_cs n est exige que si nu depend de l angle. */
function requisAvecAngle(e: EntreeBielles): Cle | null {
  if (nuUnite(e)) return null;
  return e.theta === undefined || e.theta === null || Number.isNaN(e.theta as number) ? 'motif.theta-cs-manquant' : conditionAngle(e);
}

const niveaux2004: DefinitionNiveau<EntreeBielles>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '6.5.2',
    hypothese: 'niveau.bt.2004.base',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => bielles2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeBielles>[] = [
  {
    id: 'paliers',
    ordre: 1,
    position: 'corps',
    clause: '8.5.2(4)',
    hypothese: 'niveau.bt.2023.paliers',
    donneesRequises: communs,
    domaine,
    conditions: requisAvecAngle,
    calculer: (e) => calcul2023(e as Complete, 'paliers'),
  },
  {
    id: 'continu',
    ordre: 2,
    position: 'corps',
    clause: '8.5.2(4)',
    hypothese: 'niveau.bt.2023.continu',
    donneesRequises: communs,
    domaine,
    conditions: requisAvecAngle,
    calculer: (e) => calcul2023(e as Complete, 'continu'),
  },
  {
    id: 'deformation',
    ordre: 3,
    position: 'corps',
    clause: '8.5.2(5)',
    hypothese: 'niveau.bt.2023.deformation',
    donneesRequises: [...communs, R.eps1],
    domaine,
    conditions: () => null,
    calculer: (e) => calcul2023(e as Complete, 'deformation'),
  },
];

export const bielles: Mecanisme<EntreeBielles> = {
  id: 'bielles',
  version: '0.1.0',
  titre: 'meca.bt.titre',
  champs: [
    { type: 'nombre', id: 'Fcd', libelle: 'champ.Fcd-bielle', symbole: 'F_cd', unite: 'kN' },
    { type: 'nombre', id: 'bc', libelle: 'champ.bc', symbole: 'b_c', unite: 'mm' },
    { type: 'nombre', id: 't', libelle: 'champ.t-bielle', symbole: 't', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    {
      type: 'choix',
      id: 'element',
      libelle: 'champ.element-bielle',
      options: [
        { valeur: 'bielle-comprimee', libelle: 'option.bt.bielle-comprimee' },
        { valeur: 'bielle-fissuree', libelle: 'option.bt.bielle-fissuree' },
        { valeur: 'noeud-ccc', libelle: 'option.bt.noeud-ccc' },
        { valeur: 'noeud-cct', libelle: 'option.bt.noeud-cct' },
        { valeur: 'noeud-ctt', libelle: 'option.bt.noeud-ctt' },
      ],
    },
    {
      type: 'choix',
      id: 'ancrage',
      libelle: 'champ.ancrage-noeud',
      options: [
        { valeur: 'interieur', libelle: 'option.bt.interieur' },
        { valeur: 'exterieur', libelle: 'option.bt.exterieur' },
      ],
    },
    { type: 'nombre', id: 'theta', libelle: 'champ.theta-cs', symbole: 'θ_cs', unite: '°', facultatif: true },
    { type: 'nombre', id: 'eps1', libelle: 'champ.eps1', symbole: 'ε_1', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.contrainte-bielle', unite: 'MPa' },
  resistance: { libelle: 'grandeur.resistance-bielle', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
