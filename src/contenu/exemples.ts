/**
 * Exemples chiffres des articles (CDC EE3, test 9).
 *
 * Un article declare ses exemples dans des blocs ```exemple contenant du
 * JSON : le mecanisme, l entree, et les valeurs attendues ECRITES PAR
 * L AUTEUR, telles qu elles s affichent (« 97,98 »). Le texte de l article ne
 * cite un chiffre que par reference, {{nom:chemin}}, remplacee a la
 * construction par la valeur attendue. Un test recalcule chaque valeur avec
 * le noyau et la compare a l attendu, a la precision ecrite : une correction
 * du noyau invalide l article au lieu de le laisser mentir.
 *
 * Chemin d une valeur : `generation/niveau.grandeur`, ou grandeur vaut
 * `resistance`, `sollicitation`, `taux`, `iterations`, ou le symbole d une
 * grandeur intermediaire (`ec2-2023/tau-min.τ_Rdc,min`).
 */

import { nombreFr, tauxFr } from './format';
import type { Cellule } from '../noyau/model/resultat';
import type { Matrice } from '../noyau/moteur/matrice';

export interface Exemple {
  nom: string;
  mecanisme: string;
  entree: Record<string, number | string>;
  attendus: Record<string, string>;
}

const BLOC = /^```exemple\s*\n([\s\S]*?)\n```\s*$/gm;
const REFERENCE = /\{\{([a-z0-9-]+):([^}]+)\}\}/g;

/** Retire les blocs ```exemple du Markdown et les rend analyses. */
export function extraireExemples(md: string): { texte: string; exemples: Exemple[] } {
  const exemples: Exemple[] = [];
  const texte = md.replace(/\r\n/g, '\n').replace(BLOC, (_, json: string) => {
    const e = JSON.parse(json) as Exemple;
    if (typeof e.nom !== 'string' || typeof e.mecanisme !== 'string' || !e.entree || !e.attendus) {
      throw new Error('Exemple incomplet : nom, mecanisme, entree et attendus sont exiges.');
    }
    if (exemples.some((x) => x.nom === e.nom)) throw new Error(`Exemple ${e.nom} declare deux fois.`);
    exemples.push(e);
    return '';
  });
  return { texte, exemples };
}

/** Remplace chaque {{nom:chemin}} par la valeur attendue ecrite par l auteur. */
export function substituer(texte: string, exemples: Exemple[]): string {
  return texte.replace(REFERENCE, (tout, nom: string, chemin: string) => {
    if (nom === 'calculateur') return tout;
    const ex = exemples.find((e) => e.nom === nom);
    if (!ex) throw new Error(`Reference ${tout} : exemple ${nom} inconnu.`);
    const v = ex.attendus[chemin];
    if (v === undefined) throw new Error(`Reference ${tout} : aucune valeur attendue a ce chemin.`);
    return v;
  });
}

/** Valeur numerique d un chemin dans une matrice, ou `undefined`. */
export function valeurAuChemin(m: Matrice, chemin: string): number | undefined {
  const m1 = /^([^/]+)\/([^.]+)\.(.+)$/.exec(chemin);
  if (!m1) throw new Error(`Chemin ${chemin} mal forme : generation/niveau.grandeur attendu.`);
  const [, generation, niveau, grandeur] = m1;
  const c: Cellule | undefined = m.cellules.find((x) => x.generation === generation && x.niveau === niveau);
  if (!c) throw new Error(`Chemin ${chemin} : cellule ${generation}/${niveau} inconnue.`);
  switch (grandeur) {
    case 'resistance':
      return c.resistance;
    case 'sollicitation':
      return c.sollicitation;
    case 'taux':
      return c.taux;
    case 'iterations':
      return c.iterations;
    default:
      return c.intermediaires[grandeur]?.valeur;
  }
}

/** Nombre de decimales d une valeur ecrite a la francaise (« 97,98 » : 2). */
export function decimales(ecrit: string): number {
  const i = ecrit.indexOf(',');
  return i < 0 ? 0 : ecrit.length - i - 1;
}

/**
 * Met en forme une valeur calculee comme l auteur a ecrit l attendu : meme
 * nombre de decimales ; un taux de travail est arrondi vers le verdict.
 */
export function miseEnForme(valeur: number | undefined, chemin: string, ecrit: string): string {
  if (valeur === undefined) return '(absent)';
  const n = decimales(ecrit);
  return chemin.endsWith('.taux') ? tauxFr(valeur, n) : nombreFr(valeur, n);
}

export interface Ecart {
  chemin: string;
  attendu: string;
  calcule: string;
}

/** Ecarts entre les attendus d un exemple et la matrice recalculee. */
export function ecarts(ex: Exemple, m: Matrice): Ecart[] {
  return Object.entries(ex.attendus)
    .map(([chemin, attendu]) => ({ chemin, attendu, calcule: miseEnForme(valeurAuChemin(m, chemin), chemin, attendu) }))
    .filter((e) => e.calcule !== e.attendu);
}
