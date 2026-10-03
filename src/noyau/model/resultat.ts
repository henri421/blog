/**
 * Resultat d un mecanisme : une cellule par generation et par niveau (CDC §5.3).
 *
 * Tout est serialisable en JSON (CDC ET5) : aucun objet de classe, aucune
 * fonction, aucune valeur non finie attendue dans une cellule calculee.
 * Unites : kN, mm, MPa, kN.m, declarees grandeur par grandeur dans `unite`.
 */

import type { Cle } from '../../i18n/cle';

export type Generation = 'ec2-2004' | 'ec2-2023';

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
  | { etat: 'hors-domaine'; motif: Cle };

export type Provenance = 'saisie' | 'calculee' | 'recommandee';

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
