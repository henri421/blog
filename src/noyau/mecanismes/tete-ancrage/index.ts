/**
 * Ancrage des barres tendues par tete d ancrage.
 *
 * Unites : mm, MPa.
 *
 * Premiere generation : aucune regle ; les dispositifs mecaniques relevent
 *   de leur norme de produit ou d un agrement (8.4.1(5)).
 * Deuxieme generation (11.4.7(1)) : la tete developpe sigma_sd = 435 MPa sans
 *   longueur d ancrage supplementaire si
 *   phi_h >= 3 phi, phi_h <= 4 t_h, f_ck >= 25 MPa, phi <= 25 mm,
 *   d_dg >= 32 mm, a_y >= 3 phi (beton non fissure) ou 4 phi (fissure),
 *   a_x >= 2 a_y + 1,2 phi_h, s_x >= 4 a_y pour un groupe de barres le long
 *   du bord ; a_x et a_y permutes si a_x < a_y ;
 *   phi_h = 2 racine(A_h/pi) (11.7) pour une tete non circulaire.
 * Choix de l outil : la verification generale (11.8) a (11.11) n est pas
 *   codee (lecture des formules a confirmer) ; hors des conditions de (1),
 *   le niveau est non applicable avec la condition en defaut.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { estAbsente } from '../../moteur/niveaux';
import { ddg2023, positif } from '../../materiaux';

export interface EntreeTeteAncrage {
  phi?: number;
  fck?: number;
  /** Granulat : D_lower de la fraction la plus grosse (mm). */
  Dlower?: number;
  /** Diametre de la tete, ou du cercle de meme aire (mm). */
  phiH?: number;
  /** Epaisseur de la tete (mm). */
  th?: number;
  /** 'non-fissure' ou 'fissure'. */
  fissuration?: string;
  /** Distance de l axe de la barre au bord le plus proche (mm). */
  ay?: number;
  /** Distance de l axe de la barre a l angle (mm). */
  ax?: number;
  /** Espacement des barres d un groupe le long du bord (mm), sans objet pour une barre isolee. */
  sx?: number;
  /** Contrainte de calcul a developper dans la barre (MPa). */
  sigmaSd?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeTeteAncrage>;

/** Contrainte developpee par la tete sous les conditions de 11.4.7(1). */
const SIGMA_TETE = 435;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
  phiH: { champ: 'phiH', libelle: 'champ.phiH' },
  th: { champ: 'th', libelle: 'champ.th' },
  fissuration: { champ: 'fissuration', libelle: 'champ.fissuration-tete' },
  ay: { champ: 'ay', libelle: 'champ.ay' },
  ax: { champ: 'ax', libelle: 'champ.ax' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
} as const satisfies Record<string, { champ: keyof EntreeTeteAncrage; libelle: Cle }>;

/** a_x et a_y, permutes si a_x < a_y (11.4.7(1)). */
function distances(e: EntreeTeteAncrage): { ax: number; ay: number } {
  const ax = e.ax as number;
  const ay = e.ay as number;
  return ax < ay ? { ax: ay, ay: ax } : { ax, ay };
}

function coefficientBord(e: EntreeTeteAncrage): number {
  return e.fissuration === 'fissure' ? 4 : 3;
}

function conditions(e: EntreeTeteAncrage): Cle | null {
  const phi = e.phi as number;
  const phiH = e.phiH as number;
  if (phiH < 3 * phi || phiH > 4 * (e.th as number)) return 'motif.tete-dimensions';
  if ((e.fck as number) < 25 || phi > 25 || ddg2023(e.fck as number, e.Dlower as number) < 32) return 'motif.tete-materiaux';
  const { ax, ay } = distances(e);
  if (ay < coefficientBord(e) * phi) return 'motif.tete-bord';
  if (ax < 2 * ay + 1.2 * phiH) return 'motif.tete-angle';
  if (!estAbsente(e.sx) && (e.sx as number) < 4 * ay) return 'motif.tete-espacement';
  return null;
}

export function teteAncrage2023(e: Complete): Calcul {
  for (const [v, nom] of [
    [e.phi, 'phi'],
    [e.phiH, 'phi_h'],
    [e.th, 't_h'],
    [e.ay, 'a_y'],
    [e.ax, 'a_x'],
  ] as const) {
    positif(v, nom, 'mm');
  }
  positif(e.sigmaSd, 'sigma_sd', 'MPa');
  const { ax, ay } = distances(e);
  const inter: Cellule['intermediaires'] = {
    'φ_h / φ': calculee(e.phiH / e.phi, '-'),
    d_dg: calculee(ddg2023(e.fck, e.Dlower), 'mm'),
    'a_y,min': calculee(coefficientBord(e) * e.phi, 'mm'),
    a_y: saisie(ay, 'mm'),
    'a_x,min': calculee(2 * ay + 1.2 * e.phiH, 'mm'),
    a_x: saisie(ax, 'mm'),
  };
  if (!estAbsente(e.sx)) {
    inter['s_x,min'] = calculee(4 * ay, 'mm');
    inter.s_x = saisie(e.sx, 'mm');
  }
  inter["σ'_sd"] = recommandee(SIGMA_TETE, 'MPa');
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.sigmaSd,
    resistance: SIGMA_TETE,
    intermediaires: inter,
    clauses: ['11.4.7(1)', '(11.7)', 'figure 11.9'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeTeteAncrage>[] = [
  {
    id: 'sans-equivalent',
    ordre: 1,
    position: 'corps',
    clause: '8.4.1(5)',
    hypothese: 'niveau.tete.2004.sans-equivalent',
    donneesRequises: [],
    conditions: () => 'motif.sans-equivalent-2004',
    calculer: () => {
      throw new Error('Niveau sans equivalent : jamais calcule.');
    },
  },
];

const niveaux2023: DefinitionNiveau<EntreeTeteAncrage>[] = [
  {
    id: 'simplifie',
    ordre: 1,
    position: 'corps',
    clause: '11.4.7',
    hypothese: 'niveau.tete.2023.simplifie',
    donneesRequises: [R.phi, R.fck, R.Dlower, R.phiH, R.th, R.fissuration, R.ay, R.ax, R.sigmaSd],
    conditions,
    calculer: (e) => teteAncrage2023(e as Complete),
  },
];

export const teteAncrage: Mecanisme<EntreeTeteAncrage> = {
  id: 'tete-ancrage',
  version: '0.1.0',
  titre: 'meca.tete.titre',
  champs: [
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm' },
    { type: 'nombre', id: 'phiH', libelle: 'champ.phiH', symbole: 'φ_h', unite: 'mm' },
    { type: 'nombre', id: 'th', libelle: 'champ.th', symbole: 't_h', unite: 'mm' },
    {
      type: 'choix',
      id: 'fissuration',
      libelle: 'champ.fissuration-tete',
      options: [
        { valeur: 'non-fissure', libelle: 'option.tete.non-fissure' },
        { valeur: 'fissure', libelle: 'option.tete.fissure' },
      ],
    },
    { type: 'nombre', id: 'ay', libelle: 'champ.ay', symbole: 'a_y', unite: 'mm' },
    { type: 'nombre', id: 'ax', libelle: 'champ.ax', symbole: 'a_x', unite: 'mm' },
    { type: 'nombre', id: 'sx', libelle: 'champ.sx', symbole: 's_x', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'sigmaSd', libelle: 'champ.sigmaSd', symbole: 'σ_sd', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.contrainte-barre', unite: 'MPa' },
  resistance: { libelle: 'grandeur.contrainte-tete', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
