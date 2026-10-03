/**
 * Type des cles du dictionnaire, verifie a la compilation.
 *
 * Le dictionnaire francais fait reference : toute autre langue devra fournir
 * exactement les memes cles (`Dictionnaire`).
 */

import { fr } from './fr';

export type Cle = keyof typeof fr;

export type Dictionnaire = Readonly<Record<Cle, string>>;

/**
 * Garde a l execution : une chaine venue du noyau ou d un JSON rejoue est-elle
 * une cle connue ? Sert au test « aucun motif n est une chaine libre ».
 */
export function estCle(texte: string): texte is Cle {
  return Object.prototype.hasOwnProperty.call(fr, texte);
}

/** Traduit une cle dans le dictionnaire actif (francais seul en version 1). */
export function t(cle: Cle, dictionnaire: Dictionnaire = fr): string {
  return dictionnaire[cle];
}
