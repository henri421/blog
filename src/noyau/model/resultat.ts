/**
 * Resultat d un mecanisme : une cellule par generation et par niveau (CDC §5.3).
 *
 * Tout est serialisable en JSON (CDC ET5) : aucun objet de classe, aucune
 * fonction, aucune valeur non finie attendue dans une cellule calculee.
 * Unites : kN, mm, MPa, kN.m, declarees grandeur par grandeur dans `unite`.
 */

import type { Cle } from '../../i18n/cle';

/**
 * Generation d un texte : `<code>-<annee>`. Chaque mecanisme compare deux
 * generations d un meme texte ; par defaut celles de l EN 1992-1-1.
 */
export type Generation = 'ec2-2004' | 'ec2-2023' | 'en1990-2002' | 'en1990-2023' | 'en1991-1-1-2002' | 'en1991-1-1-2025' | 'en1991-1-3-2003' | 'en1991-1-3-2025' | 'en1991-1-4-2005' | 'en1991-1-4-2026' | 'en1991-1-2-2002' | 'en1991-1-2-2024' | 'en1991-1-5-2003' | 'en1991-1-5-2025' | 'en1991-1-6-2005' | 'en1991-1-6-2026' | 'en1991-1-7-2006' | 'en1991-1-7-2025' | 'en1991-2-2003' | 'en1991-2-2023';

/** Identifiant d un niveau d approximation, propre a chaque mecanisme. */
export type Niveau = string;

/**
 * Etat d une cellule. Les motifs et les donnees manquantes sont des CLES du
 * dictionnaire, jamais des phrases : c est la seule facon de traduire plus tard
 * sans toucher au noyau (CDC §5.5). Le CDC les type `string` au §5.3 ; ils sont
 * resserres ici en `Cle` pour que le compilateur fasse respecter le §5.5.
 */
export type Statut =
  | { etat: 'calcule' }
  | { etat: 'non-applicable'; motif: Cle; donneesManquantes: Cle[] }
  | { etat: 'non-convergent'; iterations: number }
  | { etat: 'hors-domaine'; motif: Cle }
  /** Resultat calcule et affiche, assorti d une mention d applicabilite (niveau hors du corps du texte). */
  | { etat: 'reserve'; motif: Cle };

/** Position du niveau dans la norme (CDC v4 §7.2). */
export type PositionNormative = 'corps' | 'annexe-normative' | 'annexe-informative';

/**
 * `nationale` : valeur fixee par l annexe nationale luxembourgeoise de
 * l EN 1990 (AN-LU:2020) ou par la norme a laquelle elle renvoie ; employee
 * seulement dans les niveaux AN-LU, affiches a cote des valeurs recommandees.
 */
export type Provenance = 'saisie' | 'calculee' | 'recommandee' | 'nationale';

export interface Grandeur {
  valeur: number;
  unite: string;
  provenance: Provenance;
}

export interface Cellule {
  generation: Generation;
  niveau: Niveau;
  statut: Statut;
  sollicitation?: number;
  resistance?: number;
  taux?: number;
  /** Grandeurs intermediaires, indexees par leur symbole (`d_dg`, `rho_l`...). */
  intermediaires: Record<string, Grandeur>;
  /** Renvois de clause uniquement, jamais le texte normatif (CDC EE1). */
  clauses: string[];
  iterations?: number;
}

/** Une cellule porte-t-elle un resultat chiffre ? Vrai pour `calcule` et `reserve`. */
export function estChiffree(c: Pick<Cellule, 'statut'>): boolean {
  return c.statut.etat === 'calcule' || c.statut.etat === 'reserve';
}
