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

const ISO = /(\d{4})-(\d{2})-(\d{2})/g;

/**
 * Date affichee au lecteur, au format europeen jour/mois/annee (CDC v4 ET7).
 * Seule fonction de mise en forme des dates : l ISO reste la forme stockee.
 */
export function dateFr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Date « ${iso} » non ISO (AAAA-MM-JJ).`);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Convertit toutes les dates ISO d un texte libre (en-tete, historique). */
export function datesFr(texte: string): string {
  return texte.replace(ISO, (d) => dateFr(d));
}
