/**
 * Balayage d un parametre (CDC EF6) : evolution de la resistance et du taux
 * de travail de chaque niveau de chaque generation.
 *
 * Un point ou le niveau n est pas calcule porte `null` (jamais une valeur
 * interpolee), et chaque changement d etat entre deux points consecutifs est
 * consigne comme une rupture d applicabilite.
 */

import type { Generation, Niveau, Statut } from '../model/resultat';
import type { Mecanisme } from './mecanisme';
import { calculerMatrice } from './matrice';

export interface Serie {
  generation: Generation;
  niveau: Niveau;
  resistance: Array<number | null>;
  taux: Array<number | null>;
  etats: Array<Statut['etat']>;
}

export interface Rupture {
  generation: Generation;
  niveau: Niveau;
  /** Dernier point avant et premier point apres le changement d etat. */
  entre: [number, number];
  avant: Statut['etat'];
  apres: Statut['etat'];
}

export interface Balayage {
  champ: string;
  valeurs: number[];
  series: Serie[];
  ruptures: Rupture[];
}

/** `n` valeurs regulierement espacees de `debut` a `fin`, bornes comprises. */
export function valeursRegulieres(debut: number, fin: number, n: number): number[] {
  if (!(n >= 2)) throw new Error('Le balayage exige au moins deux points.');
  return Array.from({ length: n }, (_, i) => debut + ((fin - debut) * i) / (n - 1));
}

export function balayer<E>(m: Mecanisme<E>, e: E, champ: keyof E & string, valeurs: number[]): Balayage {
  const series = new Map<string, Serie>();
  for (const x of valeurs) {
    const matrice = calculerMatrice(m, { ...e, [champ]: x });
    for (const c of matrice.cellules) {
      const cle = `${c.generation}/${c.niveau}`;
      let s = series.get(cle);
      if (!s) {
        s = { generation: c.generation, niveau: c.niveau, resistance: [], taux: [], etats: [] };
        series.set(cle, s);
      }
      const calcule = c.statut.etat === 'calcule';
      s.resistance.push(calcule && c.resistance !== undefined ? c.resistance : null);
      s.taux.push(calcule && c.taux !== undefined ? c.taux : null);
      s.etats.push(c.statut.etat);
    }
  }
  const ruptures: Rupture[] = [];
  for (const s of series.values()) {
    for (let i = 1; i < s.etats.length; i++) {
      if (s.etats[i] !== s.etats[i - 1]) {
        ruptures.push({
          generation: s.generation,
          niveau: s.niveau,
          entre: [valeurs[i - 1], valeurs[i]],
          avant: s.etats[i - 1],
          apres: s.etats[i],
        });
      }
    }
  }
  return { champ, valeurs, series: [...series.values()], ruptures };
}
