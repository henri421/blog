/**
 * Matrice des resultats : une cellule par generation et par niveau, et sa
 * serialisation JSON rejouable (CDC ET5).
 */

import type { Cellule } from '../model/resultat';
import { GENERATIONS, type Mecanisme } from './mecanisme';
import { evaluerNiveaux } from './niveaux';

export const FORMAT_MATRICE = 'ec2-2e-generation/matrice';
export const VERSION_FORMAT = 1;

export interface Matrice<E = Record<string, unknown>> {
  mecanisme: string;
  version: string;
  entree: E;
  cellules: Cellule[];
}

/** Calcule toutes les cellules : chaque generation, chaque niveau. */
export function calculerMatrice<E>(m: Mecanisme<E>, e: E): Matrice<E> {
  const cellules = GENERATIONS.flatMap((g) => evaluerNiveaux(g, m.niveaux[g], e));
  return { mecanisme: m.id, version: m.version, entree: e, cellules };
}

export function serialiser<E>(matrice: Matrice<E>): string {
  return JSON.stringify({ format: FORMAT_MATRICE, formatVersion: VERSION_FORMAT, ...matrice }, null, 2);
}

/**
 * Relit une matrice serialisee. La lecture est tolerante : une cellule d un
 * niveau inconnu (ajoute apres coup) reste une cellule, ce qui garantit qu un
 * resultat archive reste relisible apres l ajout d un niveau.
 */
export function relire(json: string): Matrice {
  const brut: unknown = JSON.parse(json);
  if (typeof brut !== 'object' || brut === null) throw new Error('Matrice illisible : objet attendu.');
  const o = brut as Record<string, unknown>;
  if (o.format !== FORMAT_MATRICE) throw new Error(`Matrice illisible : format ${String(o.format)} inconnu.`);
  if (typeof o.mecanisme !== 'string' || typeof o.version !== 'string') {
    throw new Error('Matrice illisible : mecanisme ou version absent.');
  }
  if (typeof o.entree !== 'object' || o.entree === null || !Array.isArray(o.cellules)) {
    throw new Error('Matrice illisible : entree ou cellules absentes.');
  }
  return {
    mecanisme: o.mecanisme,
    version: o.version,
    entree: o.entree as Record<string, unknown>,
    cellules: o.cellules as Cellule[],
  };
}

/** Recalcule une matrice archivee avec le noyau courant, a partir de son entree. */
export function rejouer<E>(m: Mecanisme<E>, json: string): Matrice<E> {
  const archive = relire(json);
  if (archive.mecanisme !== m.id) {
    throw new Error(`Matrice du mecanisme ${archive.mecanisme}, pas de ${m.id}.`);
  }
  return calculerMatrice(m, archive.entree as E);
}
