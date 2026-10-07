/**
 * Ancrage en traction par barres transversales soudees et par boucles en U.
 *
 * Unites : mm, MPa.
 *
 * Barres transversales soudees.
 * Premiere generation (8.4.4, tableau 8.2, figure 8.1 e)) :
 *   l_bd = alpha_2 alpha_4 l_b,rqd >= l_b,min, alpha_4 = 0,7 avec au moins une
 *   barre soudee de diametre phi_t >= 0,6 phi sur la longueur d ancrage,
 *   alpha_2 des barres droites, c_d = min(a/2 ; c_1 ; c) (figure 8.3 a)).
 * Deuxieme generation (11.4.5(1)) : l_bd = l_bd,droit - 15 phi >= 5 phi, avec
 *   une barre si phi_t >= 0,6 phi, sinon deux barres espacees de 50 a 100 mm
 *   et phi <= 16 mm.
 * Boucles en U.
 * Premiere generation (8.4.4, tableau 8.2, figure 8.1 d)) : alpha_1 = 0,7 si
 *   c_d > 3 phi, alpha_2 des barres non droites, c_d = c (figure 8.3 c)),
 *   pris egal a l enrobage c_y perpendiculaire au plan de la boucle.
 * Deuxieme generation (11.4.6(2)) : l_bd = l_bd,droit - 20 phi >= 10 phi,
 *   boucle au diametre de mandrin minimal. L ancrage sans longueur d une
 *   boucle en traction pure conforme a 11.3 (11.4.6(1)) n est pas code.
 * l_bd,droit selon (11.3), c_d = min(c_s/2 ; c_x ; c_y) <= 3,75 phi.
 * Choix de l outil : au voisinage d un appui direct, la longueur de 2004
 *   inferieure a l_b,min (note du tableau 8.2) n est pas codee ; la valeur
 *   phi_t = 0,6 phi est rattachee au cas d une seule barre en 2023.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Champ, Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { estAbsente } from '../../moteur/niveaux';
import { GAMMA_C_2004, GAMMA_S_2004, GAMMA_S_2023, fctm2004, positif } from '../../materiaux';

export interface EntreeAncrageSoude {
  phi?: number;
  fck?: number;
  fyk?: number;
  sigmaSd?: number;
  adherence?: string;
  /** Distance libre entre barres (mm). */
  cs?: number;
  /** Enrobage lateral (mm). */
  cx?: number;
  /** Enrobage inferieur ou superieur (mm). */
  cy?: number;
  /** Diametre des barres transversales soudees (mm). */
  phiT?: number;
  /** Nombre de barres transversales soudees sur la longueur d ancrage. */
  nT?: number;
  /** Espacement des barres transversales soudees (mm), exige si phi_t < 0,6 phi. */
  sT?: number;
  lDispo?: number;
}

export type EntreeAncrageBoucle = Omit<EntreeAncrageSoude, 'phiT' | 'nT' | 'sT'>;

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAncrageSoude>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
  adherence: { champ: 'adherence', libelle: 'champ.adherence' },
  cs: { champ: 'cs', libelle: 'champ.cs' },
  cx: { champ: 'cx', libelle: 'champ.cx' },
  cy: { champ: 'cy', libelle: 'champ.cy' },
  phiT: { champ: 'phiT', libelle: 'champ.phiT-soude' },
  nT: { champ: 'nT', libelle: 'champ.nT-soude' },
  lDispo: { champ: 'lDispo', libelle: 'champ.lDispo' },
} as const satisfies Record<string, { champ: keyof EntreeAncrageSoude; libelle: Cle }>;

const communs = [R.phi, R.fck, R.fyk, R.adherence, R.cs, R.cx, R.cy, R.lDispo];

function domaine(e: EntreeAncrageSoude): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function contrainteAdmise(e: EntreeAncrageSoude, gammaS: number): Cle | null {
  return (e.sigmaSd as number) > (e.fyk as number) / gammaS ? 'motif.sigma-sup-fyd' : null;
}

function verifier(e: Complete, sigma: number): void {
  for (const [v, nom] of [
    [e.phi, 'phi'],
    [e.cs, 'cs'],
    [e.cx, 'cx'],
    [e.cy, 'cy'],
    [e.lDispo, 'lDispo'],
  ] as const) {
    positif(v, nom, 'mm');
  }
  positif(sigma, 'sigma_sd', 'MPa');
}

/** f_bd (8.2) et l_b,rqd (8.3), f_ctm plafonnee a celle du C60/75. */
function longueurDeBase2004(e: Complete, sigma: number): { fbd: number; lbrqd: number; lmin: number } {
  const fctd = (0.7 * fctm2004(Math.min(e.fck, 60))) / GAMMA_C_2004;
  const eta1 = e.adherence === 'mediocre' ? 0.7 : 1;
  const eta2 = e.phi <= 32 ? 1 : (132 - e.phi) / 100;
  const fbd = 2.25 * eta1 * eta2 * fctd;
  const lbrqd = ((e.phi / 4) * sigma) / fbd;
  return { fbd, lbrqd, lmin: Math.max(0.3 * lbrqd, 10 * e.phi, 100) };
}

/** Longueur d une barre droite selon (11.3), plancher 10 phi compris. */
function longueurDroite2023(e: Complete, sigma: number): { cd: number; kcp: number; lbd: number } {
  const kcp = e.adherence === 'mediocre' ? 1.2 : 1;
  const cd = Math.min(e.cs / 2, e.cx, e.cy, 3.75 * e.phi);
  const brut =
    50 *
    kcp *
    e.phi *
    (sigma / 435) ** 1.5 *
    Math.sqrt(Math.max(25 / e.fck, 0.3)) *
    Math.max(e.phi / 20, 0.6) ** (1 / 3) *
    Math.sqrt((1.5 * e.phi) / cd);
  return { cd, kcp, lbd: Math.max(brut, 10 * e.phi) };
}

const borne = (a: number): number => Math.min(Math.max(a, 0.7), 1);

function soude2004(e: Complete, sigma: number): Calcul {
  verifier(e, sigma);
  const { fbd, lbrqd, lmin } = longueurDeBase2004(e, sigma);
  const cd = Math.min(e.cs / 2, e.cx, e.cy);
  const alpha2 = borne(1 - (0.15 * (cd - e.phi)) / e.phi);
  const alpha4 = 0.7;
  const lbd = Math.max(alpha2 * alpha4 * lbrqd, lmin);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbd,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      f_bd: calculee(fbd, 'MPa'),
      'l_b,rqd': calculee(lbrqd, 'mm'),
      c_d: calculee(cd, 'mm'),
      'α_2': calculee(alpha2, '-'),
      'α_4': recommandee(alpha4, '-'),
      'l_b,min': calculee(lmin, 'mm'),
      l_bd: calculee(lbd, 'mm'),
    },
    clauses: ['8.4.4', 'tableau 8.2', 'figure 8.1 e)'],
  };
}

function soude2023(e: Complete, sigma: number): Calcul {
  verifier(e, sigma);
  const { cd, kcp, lbd: droit } = longueurDroite2023(e, sigma);
  const lbd = Math.max(droit - 15 * e.phi, 5 * e.phi);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbd,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      k_cp: recommandee(kcp, '-'),
      c_d: calculee(cd, 'mm'),
      'l_bd (barre droite)': calculee(droit, 'mm'),
      'réduction 15 φ': calculee(15 * e.phi, 'mm'),
      φ_t: saisie(e.phiT, 'mm'),
      l_bd: calculee(lbd, 'mm'),
    },
    clauses: ['11.4.5(1)', '(11.3)', 'figure 11.8'],
  };
}

function boucle2004(e: Complete, sigma: number): Calcul {
  verifier(e, sigma);
  const { fbd, lbrqd, lmin } = longueurDeBase2004(e, sigma);
  const cd = e.cy;
  const alpha1 = cd > 3 * e.phi ? 0.7 : 1;
  const alpha2 = borne(1 - (0.15 * (cd - 3 * e.phi)) / e.phi);
  const lbd = Math.max(alpha1 * alpha2 * lbrqd, lmin);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbd,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      f_bd: calculee(fbd, 'MPa'),
      'l_b,rqd': calculee(lbrqd, 'mm'),
      c_d: calculee(cd, 'mm'),
      'α_1': recommandee(alpha1, '-'),
      'α_2': calculee(alpha2, '-'),
      'l_b,min': calculee(lmin, 'mm'),
      l_bd: calculee(lbd, 'mm'),
    },
    clauses: ['8.4.4', 'tableau 8.2', 'figure 8.3 c)'],
  };
}

function boucle2023(e: Complete, sigma: number): Calcul {
  verifier(e, sigma);
  const { cd, kcp, lbd: droit } = longueurDroite2023(e, sigma);
  const lbd = Math.max(droit - 20 * e.phi, 10 * e.phi);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbd,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      k_cp: recommandee(kcp, '-'),
      c_d: calculee(cd, 'mm'),
      'l_bd (barre droite)': calculee(droit, 'mm'),
      'réduction 20 φ': calculee(20 * e.phi, 'mm'),
      l_bd: calculee(lbd, 'mm'),
    },
    clauses: ['11.4.6(2)', '(11.3)'],
  };
}

/** Disposition des barres soudees exigee par la generation. */
function dispositionSoudee(gen: '2004' | '2023', e: EntreeAncrageSoude): Cle | null {
  const phi = e.phi as number;
  const phiT = e.phiT as number;
  const nT = e.nT as number;
  if (!(Number.isInteger(nT) && nT >= 1)) return 'motif.soude-nombre';
  if (gen === '2004') return phiT >= 0.6 * phi ? null : 'motif.soude-2004-diametre';
  if (phiT >= 0.6 * phi) return null;
  if (nT < 2 || phi > 16) return 'motif.soude-2023-petites';
  if (estAbsente(e.sT)) return 'motif.soude-2023-espacement-manquant';
  const sT = e.sT as number;
  return sT >= 50 && sT <= 100 ? null : 'motif.soude-2023-petites';
}

type Fonction = (e: Complete, sigma: number) => Calcul;

function niveaux<E extends EntreeAncrageSoude>(
  gen: '2004' | '2023',
  f: Fonction,
  clause: string,
  prefixe: 'sou' | 'bou',
  requises: Array<{ champ: keyof E; libelle: Cle }>,
  disposition: (e: E) => Cle | null,
): DefinitionNiveau<E>[] {
  const gammaS = gen === '2004' ? GAMMA_S_2004 : GAMMA_S_2023;
  return [
    {
      id: 'barre-plastifiee',
      ordre: 1,
      position: 'corps',
      clause,
      hypothese: `niveau.${prefixe}.${gen}.barre-plastifiee` as Cle,
      donneesRequises: requises,
      domaine,
      conditions: disposition,
      calculer: (e) => f(e as unknown as Complete, (e.fyk as number) / gammaS),
    },
    {
      id: 'contrainte-reelle',
      ordre: 2,
      position: 'corps',
      clause,
      hypothese: `niveau.${prefixe}.${gen}.contrainte-reelle` as Cle,
      donneesRequises: [...requises, R.sigmaSd as { champ: keyof E; libelle: Cle }],
      domaine,
      conditions: (e) => disposition(e) ?? contrainteAdmise(e, gammaS),
      calculer: (e) => f(e as unknown as Complete, e.sigmaSd as number),
    },
  ];
}

const champsCommuns: Champ<EntreeAncrageBoucle>[] = [
  { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
  { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
  { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
  { type: 'nombre', id: 'sigmaSd', libelle: 'champ.sigmaSd', symbole: 'σ_sd', unite: 'MPa', facultatif: true },
  {
    type: 'choix',
    id: 'adherence',
    libelle: 'champ.adherence',
    options: [
      { valeur: 'bonne', libelle: 'option.adherence.bonne' },
      { valeur: 'mediocre', libelle: 'option.adherence.mediocre' },
    ],
  },
  { type: 'nombre', id: 'cs', libelle: 'champ.cs', symbole: 'c_s', unite: 'mm' },
  { type: 'nombre', id: 'cx', libelle: 'champ.cx', symbole: 'c_x', unite: 'mm' },
  { type: 'nombre', id: 'cy', libelle: 'champ.cy', symbole: 'c_y', unite: 'mm' },
];

const champLongueur: Champ<EntreeAncrageBoucle> = { type: 'nombre', id: 'lDispo', libelle: 'champ.lDispo', symbole: 'l_dispo', unite: 'mm' };

const requisesSoude = [...communs, R.phiT, R.nT];

export const ancrageSoude: Mecanisme<EntreeAncrageSoude> = {
  id: 'ancrage-soude',
  version: '0.1.0',
  titre: 'meca.sou.titre',
  champs: [
    ...champsCommuns,
    { type: 'nombre', id: 'phiT', libelle: 'champ.phiT-soude', symbole: 'φ_t', unite: 'mm' },
    { type: 'nombre', id: 'nT', libelle: 'champ.nT-soude', symbole: 'n_t', unite: '-' },
    { type: 'nombre', id: 'sT', libelle: 'champ.sT-soude', symbole: 's', unite: 'mm', facultatif: true },
    champLongueur,
  ],
  sollicitation: { libelle: 'grandeur.longueur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-disponible', unite: 'mm' },
  niveaux: {
    'ec2-2004': niveaux('2004', soude2004, '8.4.4', 'sou', requisesSoude, (e) => dispositionSoudee('2004', e)),
    'ec2-2023': niveaux('2023', soude2023, '11.4.5', 'sou', requisesSoude, (e) => dispositionSoudee('2023', e)),
  },
};

export const ancrageBoucle: Mecanisme<EntreeAncrageBoucle> = {
  id: 'ancrage-boucle',
  version: '0.1.0',
  titre: 'meca.bou.titre',
  champs: [...champsCommuns, champLongueur],
  sollicitation: { libelle: 'grandeur.longueur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-disponible', unite: 'mm' },
  niveaux: {
    'ec2-2004': niveaux<EntreeAncrageBoucle>('2004', boucle2004, '8.4.4', 'bou', communs, () => null),
    'ec2-2023': niveaux<EntreeAncrageBoucle>('2023', boucle2023, '11.4.6', 'bou', communs, () => null),
  },
};
