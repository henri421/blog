/**
 * Description d un mecanisme : ses champs d entree, ses grandeurs comparees et
 * ses niveaux par generation. C est tout ce qu un ilot de calcul doit
 * connaitre pour rendre la matrice sans rien savoir de la mecanique.
 */

import type { Cle } from '../../i18n/cle';
import type { Generation } from '../model/resultat';
import type { DefinitionNiveau } from './niveaux';

export interface ChampNombre<E> {
  type: 'nombre';
  id: keyof E & string;
  libelle: Cle;
  symbole: string;
  unite: string;
  /** Un champ facultatif ne conditionne que certains niveaux. */
  facultatif?: boolean;
}

export interface ChampChoix<E> {
  type: 'choix';
  id: keyof E & string;
  libelle: Cle;
  options: Array<{ valeur: string; libelle: Cle }>;
}

export type Champ<E> = ChampNombre<E> | ChampChoix<E>;

export interface GrandeurComparee {
  libelle: Cle;
  unite: string;
}

export interface Mecanisme<E> {
  id: string;
  /** Version du calculateur, citee dans l en-tete de statut des articles. */
  version: string;
  titre: Cle;
  champs: Champ<E>[];
  sollicitation: GrandeurComparee;
  resistance: GrandeurComparee;
  /** Les deux generations comparees, premiere puis deuxieme ; par defaut l EN 1992-1-1. */
  generations?: readonly [Generation, Generation];
  niveaux: Partial<Record<Generation, DefinitionNiveau<E>[]>>;
}

/** Generations de l EN 1992-1-1, paire par defaut. */
export const GENERATIONS: readonly [Generation, Generation] = ['ec2-2004', 'ec2-2023'];

export function generationsDe<E>(m: Mecanisme<E>): readonly [Generation, Generation] {
  return m.generations ?? GENERATIONS;
}

/** Niveaux d une generation, vides si le mecanisme ne la traite pas. */
export function niveauxDe<E>(m: Mecanisme<E>, g: Generation): DefinitionNiveau<E>[] {
  return m.niveaux[g] ?? [];
}
