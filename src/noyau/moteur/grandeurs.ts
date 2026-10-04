/**
 * Construction des grandeurs intermediaires avec leur provenance (CDC EF7) et
 * maximisation iterative a iteration visible (CDC §5.4).
 */

import type { Grandeur } from '../model/resultat';

export const saisie = (valeur: number, unite: string): Grandeur => ({ valeur, unite, provenance: 'saisie' });
export const calculee = (valeur: number, unite: string): Grandeur => ({ valeur, unite, provenance: 'calculee' });
export const recommandee = (valeur: number, unite: string): Grandeur => ({ valeur, unite, provenance: 'recommandee' });

export interface Maximum {
  x: number;
  f: number;
  iterations: number;
  converge: boolean;
}

/**
 * Maximum d une fonction unimodale sur [a, b] par la section doree. Arret
 * quand l intervalle est inferieur a `tolerance` ; au-dela de `maxIterations`
 * le resultat est rendu avec `converge: false`, jamais silencieusement.
 */
export function maximiserSectionDoree(
  f: (x: number) => number,
  a: number,
  b: number,
  tolerance = 1e-9,
  maxIterations = 200,
): Maximum {
  const r = (Math.sqrt(5) - 1) / 2;
  let x1 = b - r * (b - a);
  let x2 = a + r * (b - a);
  let f1 = f(x1);
  let f2 = f(x2);
  let iterations = 0;
  while (b - a > tolerance && iterations < maxIterations) {
    iterations++;
    if (f1 < f2) {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = a + r * (b - a);
      f2 = f(x2);
    } else {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = b - r * (b - a);
      f1 = f(x1);
    }
  }
  // Les bornes sont candidates : le maximum d un min(croissante, decroissante)
  // tombe souvent sur une borne du domaine admis.
  const candidats = [(a + b) / 2, a, b].map((x) => ({ x, f: f(x) }));
  const meilleur = candidats.reduce((m, c) => (c.f > m.f ? c : m));
  return { x: meilleur.x, f: meilleur.f, iterations, converge: b - a <= tolerance };
}
