/**
 * Imperfections geometriques : inclinaison, excentricite et forces
 * transversales equivalentes.
 *
 * Unites : mm, kN. Le calcul de alpha_h demande la longueur en metres.
 *
 * Premiere generation (5.2) : theta_i = theta_0 alpha_h alpha_m (5.1),
 *   theta_0 = 1/200 (valeur recommandee), alpha_h = 2/sqrt(l) borne a
 *   [2/3 ; 1], alpha_m = sqrt(0,5 (1 + 1/m)) ; e_i = theta_i l_0/2 (5.2) ;
 *   forces (5.3a), (5.3b), (5.4) a (5.6) ; simplification e_i = l_0/400.
 * Deuxieme generation (7.2.1) : theta_i = alpha_h alpha_m / 200 (7.1),
 *   alpha_h borne a [0,4 ; 1] (7.2), alpha_m (7.3) ; e_i (7.5) ; forces (7.6)
 *   a (7.10) ; simplification theta_i = 1/200, e_i = l_0/400 ; amplitude d un
 *   mode sinusoidal a_i = theta_i l_aw/2 (7.4).
 *
 * L effort N saisi est celui qui contribue a la force selon l effet : charge
 * verticale de l element, N_b - N_a pour le contreventement, N_a + N_b pour
 * un diaphragme intermediaire, N_a pour le diaphragme superieur.
 * Choix de l outil : les tolerances plus strictes de 7.2.1.1(3) (effet des
 * tolerances maximales multiplie par 1,2) ne sont pas codees.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeImperfections {
  /** 'element', 'contreventement', 'diaphragme-intermediaire', 'diaphragme-superieur'. */
  effet?: string;
  /** Longueur ou hauteur l (mm), selon l effet. */
  l?: number;
  /** Nombre d elements verticaux contribuant a l effet. */
  m?: number;
  /** Effort normal contribuant a la force (kN), voir l en-tete. */
  N?: number;
  /** 'oui' pour un element contreventé (force doublee, (5.3b) ; (7.7)). */
  contrevente?: string;
  /** Longueur efficace (mm), pour l excentricite. */
  l0?: number;
  /** Demi-longueur d onde du mode de flambement (mm), 2023 seulement. */
  law?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeImperfections>;
const MM_PAR_M = 1000;

const R = {
  effet: { champ: 'effet', libelle: 'champ.effet-imperfection' },
  l: { champ: 'l', libelle: 'champ.l-imperfection' },
  m: { champ: 'm', libelle: 'champ.m-imperfection' },
  N: { champ: 'N', libelle: 'champ.N-imperfection' },
  contrevente: { champ: 'contrevente', libelle: 'champ.contrevente' },
  l0: { champ: 'l0', libelle: 'champ.l0' },
  law: { champ: 'law', libelle: 'champ.law' },
} as const satisfies Record<string, { champ: keyof EntreeImperfections; libelle: Cle }>;

const communs = [R.effet, R.l, R.m, R.N, R.contrevente];

/** Coefficient de la force selon l effet ((5.3) a (5.6) ; (7.6) a (7.10)). */
function facteurForce(e: Complete): number {
  if (e.effet === 'element') return e.contrevente === 'oui' ? 2 : 1;
  if (e.effet === 'diaphragme-intermediaire') return 0.5;
  return 1;
}

function verifier(e: Complete): void {
  positif(e.l, 'l', 'mm');
  positif(e.m, 'm', '-');
  if (!(e.N >= 0)) throw new Error('N doit etre un nombre positif ou nul (kN).');
}

interface Inclinaison {
  theta: number;
  alphaH: number;
  alphaM: number;
}

function inclinaison(e: Complete, alphaHMin: number, theta0: number): Inclinaison {
  verifier(e);
  const alphaH = Math.min(Math.max(2 / Math.sqrt(e.l / MM_PAR_M), alphaHMin), 1);
  const alphaM = Math.sqrt(0.5 * (1 + 1 / e.m));
  return { theta: theta0 * alphaH * alphaM, alphaH, alphaM };
}

function cellule(e: Complete, theta: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  const H = theta * e.N * facteurForce(e);
  return {
    statut: { etat: 'calcule' },
    resistance: theta,
    intermediaires: { ...inter, 'θ_i': calculee(theta, '-'), '1/θ_i': calculee(1 / theta, '-'), H_i: calculee(H, 'kN') },
    clauses,
  };
}

const THETA_0 = 1 / 200;

export function inclinaison2004(e: Complete): Calcul {
  const i = inclinaison(e, 2 / 3, THETA_0);
  return cellule(e, i.theta, { 'θ_0': recommandee(THETA_0, '-'), 'α_h': calculee(i.alphaH, '-'), 'α_m': calculee(i.alphaM, '-') }, ['5.2(5)', '(5.1)', '5.2(7)', '5.2(8)']);
}

export function inclinaison2023(e: Complete): Calcul {
  const i = inclinaison(e, 0.4, THETA_0);
  return cellule(e, i.theta, { 'α_h': calculee(i.alphaH, '-'), 'α_m': calculee(i.alphaM, '-') }, ['7.2.1.2(2)', '(7.1) à (7.3)', '(7.6) à (7.10)']);
}

/** Excentricite e_i = theta_i l_0 / 2 ((5.2) ; (7.5)), element isole seulement. */
function excentricite(e: Complete, i: Inclinaison, clauses: string[], avecTheta0: boolean): Calcul {
  positif(e.l0, 'l_0', 'mm');
  const c = cellule(e, i.theta, { 'α_h': calculee(i.alphaH, '-'), 'α_m': calculee(i.alphaM, '-') }, clauses);
  return {
    ...c,
    intermediaires: {
      ...(avecTheta0 ? { 'θ_0': recommandee(THETA_0, '-') } : {}),
      ...c.intermediaires,
      l_0: saisie(e.l0, 'mm'),
      e_i: calculee((i.theta * e.l0) / 2, 'mm'),
    },
  };
}

export function excentricite2004(e: Complete): Calcul {
  return excentricite(e, inclinaison(e, 2 / 3, THETA_0), ['5.2(7) a)', '(5.2)'], true);
}

export function excentricite2023(e: Complete): Calcul {
  return excentricite(e, inclinaison(e, 0.4, THETA_0), ['7.2.1.2(5) a)', '(7.5)'], false);
}

/** Voiles et poteaux isoles contreventes : theta_i = 1/200, e_i = l_0/400. */
function simplifie(e: Complete, clauses: string[]): Calcul {
  verifier(e);
  positif(e.l0, 'l_0', 'mm');
  const c = cellule(e, THETA_0, {}, clauses);
  return { ...c, intermediaires: { ...c.intermediaires, l_0: saisie(e.l0, 'mm'), e_i: calculee(e.l0 / 400, 'mm') } };
}

/** Amplitude d un mode de flambement sinusoidal a_i = theta_i l_aw/2 (7.4). */
export function mode2023(e: Complete): Calcul {
  const i = inclinaison(e, 0.4, THETA_0);
  positif(e.law, 'l_aw', 'mm');
  const c = cellule(e, i.theta, { 'α_h': calculee(i.alphaH, '-'), 'α_m': calculee(i.alphaM, '-') }, ['7.2.1.2(4)', '(7.4)']);
  return { ...c, intermediaires: { ...c.intermediaires, l_aw: saisie(e.law, 'mm'), a_i: calculee((i.theta * e.law) / 2, 'mm') } };
}

const elementSeul = (e: EntreeImperfections): Cle | null => (e.effet === 'element' ? null : 'motif.imperfection-element');
const elementContrevente = (e: EntreeImperfections): Cle | null =>
  e.effet === 'element' && e.contrevente === 'oui' ? null : 'motif.imperfection-contrevente';

function niveaux(
  inclin: (e: Complete) => Calcul,
  exc: (e: Complete) => Calcul,
  clauseInclin: string,
  clauseExc: string,
  clauseSimple: string,
  g: '2004' | '2023',
): DefinitionNiveau<EntreeImperfections>[] {
  return [
    {
      id: 'inclinaison',
      ordre: 1,
      position: 'corps',
      clause: clauseInclin,
      hypothese: g === '2004' ? 'niveau.imp.2004.inclinaison' : 'niveau.imp.2023.inclinaison',
      donneesRequises: communs,
      conditions: () => null,
      calculer: (e) => inclin(e as Complete),
    },
    {
      id: 'excentricite',
      ordre: 2,
      position: 'corps',
      clause: clauseExc,
      hypothese: g === '2004' ? 'niveau.imp.2004.excentricite' : 'niveau.imp.2023.excentricite',
      donneesRequises: [...communs, R.l0],
      conditions: elementSeul,
      calculer: (e) => exc(e as Complete),
    },
    {
      id: 'simplifie',
      ordre: 3,
      position: 'corps',
      clause: clauseSimple,
      hypothese: 'niveau.imp.simplifie',
      donneesRequises: [...communs, R.l0],
      conditions: elementContrevente,
      calculer: (e) => simplifie(e as Complete, [clauseSimple]),
    },
  ];
}

export const imperfections: Mecanisme<EntreeImperfections> = {
  id: 'imperfections',
  version: '0.1.0',
  titre: 'meca.imp.titre',
  champs: [
    {
      type: 'choix',
      id: 'effet',
      libelle: 'champ.effet-imperfection',
      options: [
        { valeur: 'element', libelle: 'option.imp.element' },
        { valeur: 'contreventement', libelle: 'option.imp.contreventement' },
        { valeur: 'diaphragme-intermediaire', libelle: 'option.imp.diaphragme-intermediaire' },
        { valeur: 'diaphragme-superieur', libelle: 'option.imp.diaphragme-superieur' },
      ],
    },
    { type: 'nombre', id: 'l', libelle: 'champ.l-imperfection', symbole: 'l', unite: 'mm' },
    { type: 'nombre', id: 'm', libelle: 'champ.m-imperfection', symbole: 'm', unite: '-' },
    { type: 'nombre', id: 'N', libelle: 'champ.N-imperfection', symbole: 'N', unite: 'kN' },
    {
      type: 'choix',
      id: 'contrevente',
      libelle: 'champ.contrevente',
      options: [
        { valeur: 'oui', libelle: 'option.oui' },
        { valeur: 'non', libelle: 'option.non' },
      ],
    },
    { type: 'nombre', id: 'l0', libelle: 'champ.l0', symbole: 'l_0', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'law', libelle: 'champ.law', symbole: 'l_aw', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.inclinaison', unite: '-' },
  niveaux: {
    'ec2-2004': niveaux(inclinaison2004, excentricite2004, '5.2(5)', '5.2(7) a)', '5.2(9)', '2004'),
    'ec2-2023': [
      ...niveaux(inclinaison2023, excentricite2023, '7.2.1.2(2)', '7.2.1.2(5) a)', '7.2.1.2(5)', '2023'),
      {
        id: 'mode',
        ordre: 4,
        position: 'corps',
        clause: '7.2.1.2(4)',
        hypothese: 'niveau.imp.2023.mode',
        donneesRequises: [...communs, R.law],
        conditions: () => null,
        calculer: (e) => mode2023(e as Complete),
      },
    ],
  },
};
