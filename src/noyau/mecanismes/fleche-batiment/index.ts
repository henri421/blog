/**
 * Criteres de fleche verticale des batiments (aptitude au service), a partir
 * des parties de fleche calculees par ailleurs.
 *
 * Unites : m pour la portee ; mm pour les fleches.
 *
 * Premiere generation (EN 1990:2002, A1.4.2, A1.4.3, figure A1.1, lu sur le
 *   texte le 2026-10-19) : w1 (permanentes, initiale), w2 (permanentes, long terme), w3
 *   (actions variables), w_tot = w1 + w2 + w3, w_max = w_tot - w_c ; aucune
 *   limite chiffree, criteres a convenir avec le client ou fixes par l annexe
 *   nationale (A1.4.2(2)) : niveaux non applicables.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, A.1.8.2.2, figure A.1.1,
 *   tableau A.1.10) : w2 inclut la partie quasi permanente des actions
 *   variables, w3 l exclut ; limitation des dommages aux elements auxiliaires
 *   w2 + w3 <= l/n_d (combinaison caracteristique) ; apparence
 *   w1 + w2 - w_c <= l/n_a (quasi permanente).
 * Choix de l outil : les denominateurs n_d et n_a sont lus dans le tableau
 *   A.1.10 (NDP) par l ingenieur, jamais reproduits ; console : l = 2 x portee
 *   a saisir par l utilisateur.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeFlecheBatiment {
  /** Portee (m), deux fois la portee pour une console. */
  l?: number;
  /** Contrefleche (mm). */
  wc?: number;
  w1?: number;
  w2?: number;
  w3?: number;
  /** Denominateur de la limite de dommage (l/n_d), tableau A.1.10. */
  nd?: number;
  /** Denominateur de la limite d apparence (l/n_a), tableau A.1.10. */
  na?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFlecheBatiment>;

const R = {
  l: { champ: 'l', libelle: 'champ.l-portee-fleche' },
  wc: { champ: 'wc', libelle: 'champ.wc' },
  w1: { champ: 'w1', libelle: 'champ.w1' },
  w2: { champ: 'w2', libelle: 'champ.w2' },
  w3: { champ: 'w3', libelle: 'champ.w3' },
  nd: { champ: 'nd', libelle: 'champ.nd' },
  na: { champ: 'na', libelle: 'champ.na' },
} as const satisfies Record<string, { champ: keyof EntreeFlecheBatiment; libelle: Cle }>;

function nonNegatif(v: number, nom: string): void {
  if (!(v >= 0)) throw new Error(`${nom} doit etre positif ou nul.`);
}

function limite(l: number, n: number): number {
  positif(l, 'l', 'm');
  positif(n, 'n', '-');
  return (l * 1000) / n;
}

export function dommage(e: Complete): Calcul {
  nonNegatif(e.w2, 'w2');
  nonNegatif(e.w3, 'w3');
  const w = e.w2 + e.w3;
  const lim = limite(e.l, e.nd);
  return { statut: { etat: 'calcule' }, sollicitation: w, resistance: lim, intermediaires: { 'w_2 + w_3': calculee(w, 'mm'), n_d: saisie(e.nd, '-'), 'l/n_d': calculee(lim, 'mm') }, clauses: ['A.1.8.2.2', 'tableau A.1.10', '(8.29)'] };
}

export function apparence(e: Complete): Calcul {
  nonNegatif(e.w1, 'w1');
  nonNegatif(e.w2, 'w2');
  nonNegatif(e.wc, 'wc');
  const w = Math.max(0, e.w1 + e.w2 - e.wc);
  const lim = limite(e.l, e.na);
  return { statut: { etat: 'calcule' }, sollicitation: w, resistance: lim, intermediaires: { 'w_1 + w_2 - w_c': calculee(w, 'mm'), n_a: saisie(e.na, '-'), 'l/n_a': calculee(lim, 'mm') }, clauses: ['A.1.8.2.2', 'tableau A.1.10', '(8.31)'] };
}

const sansLimite: DefinitionNiveau<EntreeFlecheBatiment>['calculer'] = () => {
  throw new Error('Pas de limite chiffree en 2002 : jamais calcule.');
};

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, requis: DefinitionNiveau<EntreeFlecheBatiment>['donneesRequises'], f: (e: Complete) => Calcul): DefinitionNiveau<EntreeFlecheBatiment> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const flecheBatiment: Mecanisme<EntreeFlecheBatiment> = {
  id: 'fleche-batiment',
  version: '0.1.0',
  titre: 'meca.fleche-bat.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'l', libelle: 'champ.l-portee-fleche', symbole: 'l', unite: 'm' },
    { type: 'nombre', id: 'wc', libelle: 'champ.wc', symbole: 'w_c', unite: 'mm' },
    { type: 'nombre', id: 'w1', libelle: 'champ.w1', symbole: 'w_1', unite: 'mm' },
    { type: 'nombre', id: 'w2', libelle: 'champ.w2', symbole: 'w_2', unite: 'mm' },
    { type: 'nombre', id: 'w3', libelle: 'champ.w3', symbole: 'w_3', unite: 'mm' },
    { type: 'nombre', id: 'nd', libelle: 'champ.nd', symbole: 'n_d', unite: '-' },
    { type: 'nombre', id: 'na', libelle: 'champ.na', symbole: 'n_a', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.fleche-critere', unite: 'mm' },
  resistance: { libelle: 'grandeur.fleche-limite-ln', unite: 'mm' },
  niveaux: {
    'en1990-2002': [
      { id: 'dommage', ordre: 1, position: 'corps', clause: 'A1.4.3', hypothese: 'niveau.fleche-bat.2002', donneesRequises: [], conditions: () => 'motif.sans-equivalent-2004', calculer: sansLimite },
      { id: 'apparence', ordre: 2, position: 'corps', clause: 'A1.4.3', hypothese: 'niveau.fleche-bat.2002', donneesRequises: [], conditions: () => 'motif.sans-equivalent-2004', calculer: sansLimite },
    ],
    'en1990-2023': [
      niveau('dommage', 1, 'A.1.8.2.2', 'niveau.fleche-bat.2023.dommage', [R.l, R.w2, R.w3, R.nd], dommage),
      niveau('apparence', 2, 'A.1.8.2.2', 'niveau.fleche-bat.2023.apparence', [R.l, R.w1, R.w2, R.wc, R.na], apparence),
    ],
  },
};
