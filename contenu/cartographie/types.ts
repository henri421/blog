/**
 * Types de la cartographie d une norme (CDC v4 §5.2).
 *
 * La cartographie est la seule source de la liste des clauses : la page d un
 * Eurocode et le tableau d avancement en derivent (EF9). Elle n enonce aucune
 * expression normative ; les intitules sont ceux de l auteur.
 */

import type { Generation, PositionNormative } from '../../src/noyau/model/resultat';

/** Niveau d approximation attendu pour une clause, code ou non. */
export interface NiveauCarte {
  generation: Generation;
  /** Identifiant du mecanisme qui porte (ou portera) le niveau. */
  mecanisme: string;
  /** Identifiant du niveau dans le mecanisme. */
  niveau: string;
  position: PositionNormative;
  /** Renvoi de clause ou d annexe, pour lecture. */
  clause: string;
}

export interface AnnexeRattachee {
  /** Renvoi : `I.8.3.1`, `S`, `P`... */
  ref: string;
  caractere: 'normative' | 'informative';
}

export interface ClauseCarte {
  /** Numero de la clause dans la norme de deuxieme generation. */
  clause: string;
  /** Intitule redige par l auteur. */
  titre: string;
  /** Clauses correspondantes de la premiere generation (vide si aucune). */
  correspondance: string[];
  /** `exclu` : hors du perimetre de la version 1 (CDC §1), avec son motif. */
  perimetre: 'inclus' | 'exclu';
  motifExclusion?: string;
  annexes?: AnnexeRattachee[];
  /** Niveaux attendus ; l article qui traite la clause doit tous les rendre (test 15). */
  niveaux?: NiveauCarte[];
  /** Slug de l article qui traite la clause, s il existe. */
  article?: string;
  /** Colonne « theorie ingeree » : la clause a ete lue et ses niveaux identifies. */
  ingeree: boolean;
  /**
   * Colonne « teste et verifie » : date ISO de l attestation de l auteur.
   * Saisie a la main par l auteur, jamais par la construction, un test ou un
   * agent (CDC v4 §6).
   */
  verifie: string | null;
  /** Reserves et points ouverts. */
  reserves?: string;
}

export interface Carte {
  /** Identifiant court : `en1992`. */
  id: string;
  norme: string;
  correspondant: string;
  /** Chapitres, dans l ordre de la norme. */
  chapitres: Array<{ numero: string; titre: string; clauses: ClauseCarte[] }>;
}
