/**
 * Efforts de deviation des membrures tendues courbes, sans armature
 * transversale particuliere.
 *
 * Unites : mm, MPa, kN pour F_td.
 *
 * Premiere generation : pas de regle dans l EN 1992-1-1:2004.
 * Deuxieme generation (11.7) :
 *   (3) beton tendu seul : F_td/(r c_u) <= 0,125/gamma_C sqrt(f_ck) (11.24),
 *       c_u = min{c_s ; 2 racine(3) (c_y + 0,5 phi)}, c_s et c_y de la figure 11.3 c) ;
 *   (4) recouvrement de barres courbes sans armature transversale :
 *       gamma_C 8 F_td/(r c_u sqrt(f_ck)) + l_sd/l_s <= 1 (11.25).
 *   (2) sinon, armatures transversales en equilibre avec les efforts de
 *       deviation (figure 11.17).
 * Choix de l outil : F_td est l effort d une barre (ou d une gaine, phi
 *   remplace par phi_duct) ; l armature transversale de (2) est affichee comme
 *   F_td/(r f_yd) par unite de longueur, sans ancrage ni repartition.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee } from '../../moteur/grandeurs';
import { GAMMA_C_2023, GAMMA_S_2023, positif } from '../../materiaux';

export interface EntreeDeviation {
  /** Effort de calcul dans la barre courbe (kN). */
  Ftd?: number;
  /** Rayon de courbure (mm). */
  r?: number;
  phi?: number;
  /** Distance libre entre barres c_s et enrobage c_y (mm), figure 11.3 c). */
  cs?: number;
  cy?: number;
  fck?: number;
  fyk?: number;
  /** Recouvrement : longueur de calcul l_sd et longueur reelle l_s (mm). */
  lsd?: number;
  ls?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeDeviation>;

const R = {
  Ftd: { champ: 'Ftd', libelle: 'champ.Ftd-courbe' },
  r: { champ: 'r', libelle: 'champ.r-courbure' },
  phi: { champ: 'phi', libelle: 'champ.phi' },
  cs: { champ: 'cs', libelle: 'champ.cs' },
  cy: { champ: 'cy', libelle: 'champ.cy' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  lsd: { champ: 'lsd', libelle: 'champ.lsd' },
  ls: { champ: 'ls', libelle: 'champ.ls-reel' },
} as const satisfies Record<string, { champ: keyof EntreeDeviation; libelle: Cle }>;

interface Commun {
  cu: number;
  pression: number;
  limite: number;
  inter: Cellule['intermediaires'];
}

function commun(e: Complete): Commun {
  for (const [v, nom] of [
    [e.r, 'r'],
    [e.phi, 'phi'],
    [e.cs, 'c_s'],
    [e.cy, 'c_y'],
    [e.fck, 'fck'],
    [e.fyk, 'fyk'],
  ] as const) {
    positif(v, nom, 'mm ou MPa');
  }
  positif(e.Ftd, 'F_td', 'kN');
  const cu = Math.min(e.cs, 2 * Math.sqrt(3) * (e.cy + 0.5 * e.phi));
  const pression = (e.Ftd * 1000) / (e.r * cu);
  const limite = (0.125 / GAMMA_C_2023) * Math.sqrt(e.fck);
  const asReq = ((e.Ftd * 1000) / (e.r * (e.fyk / GAMMA_S_2023))) * 1000;
  return {
    cu,
    pression,
    limite,
    inter: {
      c_u: calculee(cu, 'mm'),
      'F_td / (r c_u)': calculee(pression, 'MPa'),
      '0,125 √f_ck / γ_C': calculee(limite, 'MPa'),
      'armature transversale F_td/(r f_yd)': calculee(asReq, 'mm²/m'),
    },
  };
}

export function deviationBeton(e: Complete): Calcul {
  const c = commun(e);
  return {
    statut: { etat: 'calcule' },
    sollicitation: c.pression,
    resistance: c.limite,
    intermediaires: c.inter,
    clauses: ['11.7(3)', '(11.24)'],
  };
}

export function deviationRecouvrement(e: Complete): Calcul {
  const c = commun(e);
  positif(e.lsd, 'l_sd', 'mm');
  positif(e.ls, 'l_s', 'mm');
  const terme = (GAMMA_C_2023 * 8 * e.Ftd * 1000) / (e.r * c.cu * Math.sqrt(e.fck));
  const interaction = terme + e.lsd / e.ls;
  return {
    statut: { etat: 'calcule' },
    sollicitation: interaction,
    resistance: 1,
    intermediaires: {
      ...c.inter,
      'γ_C 8 F_td / (r c_u √f_ck)': calculee(terme, '-'),
      'l_sd / l_s': calculee(e.lsd / e.ls, '-'),
      '(11.25)': calculee(interaction, '-'),
    },
    clauses: ['11.7(4)', '(11.25)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeDeviation>[] = [
  {
    id: 'sans-equivalent',
    ordre: 1,
    position: 'corps',
    clause: '—',
    hypothese: 'niveau.dev11.2004',
    donneesRequises: [],
    conditions: () => 'motif.sans-equivalent-2004',
    calculer: () => {
      throw new Error('Niveau sans equivalent : jamais calcule.');
    },
  },
];

const requises = [R.Ftd, R.r, R.phi, R.cs, R.cy, R.fck, R.fyk];

const niveaux2023: DefinitionNiveau<EntreeDeviation>[] = [
  {
    id: 'beton',
    ordre: 1,
    position: 'corps',
    clause: '11.7(3)',
    hypothese: 'niveau.dev11.2023.beton',
    donneesRequises: requises,
    conditions: () => null,
    calculer: (e) => deviationBeton(e as Complete),
  },
  {
    id: 'recouvrement',
    ordre: 2,
    position: 'corps',
    clause: '11.7(4)',
    hypothese: 'niveau.dev11.2023.recouvrement',
    grandeurs: {
      sollicitation: { libelle: 'grandeur.interaction-11-25', unite: '-' },
      resistance: { libelle: 'grandeur.unite', unite: '-' },
    },
    donneesRequises: [...requises, R.lsd, R.ls],
    conditions: () => null,
    calculer: (e) => deviationRecouvrement(e as Complete),
  },
];

export const deviation: Mecanisme<EntreeDeviation> = {
  id: 'deviation',
  version: '0.1.0',
  titre: 'meca.dev11.titre',
  champs: [
    { type: 'nombre', id: 'Ftd', libelle: 'champ.Ftd-courbe', symbole: 'F_td', unite: 'kN' },
    { type: 'nombre', id: 'r', libelle: 'champ.r-courbure', symbole: 'r', unite: 'mm' },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'cs', libelle: 'champ.cs', symbole: 'c_s', unite: 'mm' },
    { type: 'nombre', id: 'cy', libelle: 'champ.cy', symbole: 'c_y', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'lsd', libelle: 'champ.lsd', symbole: 'l_sd', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'ls', libelle: 'champ.ls-reel', symbole: 'l_s', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.pression-deviation', unite: 'MPa' },
  resistance: { libelle: 'grandeur.limite-deviation', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
