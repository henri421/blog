/**
 * Longueur d ancrage des barres d armature scellees (post-installees) en
 * traction.
 *
 * Unites : mm, MPa.
 *
 * Premiere generation : aucune regle, les barres scellees relevent d un
 *   agrement technique europeen.
 * Deuxieme generation (11.4.8(4)) : l_bd,pi = l_bd / k_b,pi >= 10 phi alpha_lb
 *   (11.12), l_bd selon 11.4.2 (11.3) avec f_ck limitee a 50 MPa et
 *   sigma_sd <= 435 MPa ; k_b,pi facteur d efficacite d adherence du produit
 *   (annexe C.8, specification technique), saisi ; alpha_lb = 1,5 en general.
 *   La barre de fraction de (11.12) est perdue a l extraction : k_b,pi est
 *   traite en diviseur, puisqu il s agit d une efficacite (lecture signalee).
 * Choix de l outil : la valeur de f_ck superieure a 50 MPa admise par une
 *   specification de produit n est pas proposee ; l enrobage minimal du
 *   tableau 11.2 et les espacements de 11.4.8(3) sont decrits dans l article.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_S_2023, positif } from '../../materiaux';

export interface EntreeArmatureScellee {
  phi?: number;
  fck?: number;
  fyk?: number;
  /** Contrainte de calcul dans la barre (MPa) ; a defaut, f_yd. */
  sigmaSd?: number;
  adherence?: string;
  cs?: number;
  cx?: number;
  cy?: number;
  /** Facteur d efficacite d adherence du produit de scellement. */
  kbpi?: number;
  lDispo?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeArmatureScellee>;

const ALPHA_LB = 1.5;
const FCK_MAX = 50;
const SIGMA_MAX = 435;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
  adherence: { champ: 'adherence', libelle: 'champ.adherence' },
  cs: { champ: 'cs', libelle: 'champ.cs' },
  cx: { champ: 'cx', libelle: 'champ.cx' },
  cy: { champ: 'cy', libelle: 'champ.cy' },
  kbpi: { champ: 'kbpi', libelle: 'champ.kbpi' },
  lDispo: { champ: 'lDispo', libelle: 'champ.lDispo' },
} as const satisfies Record<string, { champ: keyof EntreeArmatureScellee; libelle: Cle }>;

const communs = [R.phi, R.fck, R.fyk, R.adherence, R.cs, R.cx, R.cy, R.kbpi, R.lDispo];

export function scellee(e: Complete, sigma: number): Calcul {
  for (const [v, n] of [
    [e.phi, 'phi'],
    [e.cs, 'cs'],
    [e.cx, 'cx'],
    [e.cy, 'cy'],
    [e.lDispo, 'lDispo'],
  ] as const) {
    positif(v, n, 'mm');
  }
  positif(sigma, 'sigma_sd', 'MPa');
  if (!(e.kbpi > 0 && e.kbpi <= 1)) throw new Error('k_b,pi doit etre compris entre 0 et 1.');
  const fck = Math.min(e.fck, FCK_MAX);
  const kcp = e.adherence === 'mediocre' ? 1.2 : 1;
  const cd = Math.min(e.cs / 2, e.cx, e.cy, 3.75 * e.phi);
  const brut =
    50 *
    kcp *
    e.phi *
    (sigma / 435) ** 1.5 *
    Math.sqrt(Math.max(25 / fck, 0.3)) *
    Math.max(e.phi / 20, 0.6) ** (1 / 3) *
    Math.sqrt((1.5 * e.phi) / cd);
  const lbd = Math.max(brut, 10 * e.phi);
  const plancher = 10 * e.phi * ALPHA_LB;
  const lpi = Math.max(lbd / e.kbpi, plancher);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lpi,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      'f_ck retenue': calculee(fck, 'MPa'),
      c_d: calculee(cd, 'mm'),
      l_bd: calculee(lbd, 'mm'),
      'k_b,pi': saisie(e.kbpi, '-'),
      'α_lb': recommandee(ALPHA_LB, '-'),
      '10 φ α_lb': calculee(plancher, 'mm'),
      'l_bd,pi': calculee(lpi, 'mm'),
    },
    clauses: ['11.4.8(4)', '(11.12)', '(11.3)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeArmatureScellee>[] = [
  {
    id: 'sans-equivalent',
    ordre: 1,
    position: 'corps',
    clause: '8.4.1',
    hypothese: 'niveau.as.2004',
    donneesRequises: [],
    conditions: () => 'motif.sans-equivalent-2004',
    calculer: () => {
      throw new Error('Niveau sans equivalent : jamais calcule.');
    },
  },
];

const niveaux2023: DefinitionNiveau<EntreeArmatureScellee>[] = [
  {
    id: 'barre-plastifiee',
    ordre: 1,
    position: 'corps',
    clause: '11.4.8',
    hypothese: 'niveau.as.2023.plastifiee',
    donneesRequises: communs,
    conditions: () => null,
    calculer: (e) => scellee(e as Complete, Math.min((e.fyk as number) / GAMMA_S_2023, SIGMA_MAX)),
  },
  {
    id: 'contrainte-reelle',
    ordre: 2,
    position: 'corps',
    clause: '11.4.8',
    hypothese: 'niveau.as.2023.reelle',
    donneesRequises: [...communs, R.sigmaSd],
    conditions: (e) => ((e.sigmaSd as number) > SIGMA_MAX ? 'motif.scellee-sigma-435' : null),
    calculer: (e) => scellee(e as Complete, e.sigmaSd as number),
  },
];

export const armatureScellee: Mecanisme<EntreeArmatureScellee> = {
  id: 'armature-scellee',
  version: '0.1.0',
  titre: 'meca.as.titre',
  champs: [
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
    { type: 'nombre', id: 'kbpi', libelle: 'champ.kbpi', symbole: 'k_b,pi', unite: '-' },
    { type: 'nombre', id: 'lDispo', libelle: 'champ.lDispo', symbole: 'l_dispo', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.longueur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-disponible', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
