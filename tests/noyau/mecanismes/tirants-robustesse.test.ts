import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { tirantsRobustesse } from '../../../src/noyau/mecanismes/tirants-robustesse/index';

// Valeurs attendues calculees a la main (docs/validation/tirants-robustesse.md).

const bureaux = { type: 'ossature', gk: 6.5, qk: 3, psi: 0.3, st: 7.2, Lt: 7.2 };
const murs = { type: 'murs', gk: 6.5, qk: 3, psi: 0.3, z: 6, ns: 5 };
const cel = (e: object, g: string, n: string) => calculerMatrice(tirantsRobustesse, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('tirants de robustesse (EN 1991-1-7, annexe A)', () => {
  it('ossature 7,2 x 7,2 m : T_i = 306,9 kN, T_p = 153,4 kN dans les deux generations', () => {
    for (const g of ['en1991-1-7-2006', 'en1991-1-7-2025']) {
      expect(cel(bureaux, g, 'internes').sollicitation).toBeCloseTo(306.8928, 6);
      expect(cel(bureaux, g, 'peripheriques').sollicitation).toBeCloseTo(153.4464, 6);
    }
  });

  it('petite trame : minimum de 75 kN', () => {
    expect(cel({ ...bureaux, st: 3, Lt: 3 }, 'en1991-1-7-2025', 'peripheriques').sollicitation).toBe(75);
  });

  it('murs porteurs, 5 niveaux : F_t = 40 kN/m, T_i = 47,36 kN/m', () => {
    expect(cel(murs, 'en1991-1-7-2025', 'peripheriques').sollicitation).toBe(40);
    expect(cel(murs, 'en1991-1-7-2025', 'internes').sollicitation).toBeCloseTo(47.36, 9);
    expect(cel({ ...murs, ns: 12 }, 'en1991-1-7-2025', 'peripheriques').sollicitation).toBe(60);
  });
});
