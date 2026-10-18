import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { chocVehicule } from '../../../src/noyau/mecanismes/choc-vehicule/index';

// Valeurs attendues calculees a la main (docs/validation/choc-vehicule.md).

const cas = { m: 1500, v: 13.9, k: 300, Fdx: 500, h: 5.4 };
const cel = (e: object, g: string, n: string) => calculerMatrice(chocVehicule, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('chocs de vehicules (EN 1991-1-7)', () => {
  it('choc dur : F = 13,9 x racine(300 000 x 1500) = 294,9 kN', () => {
    for (const g of ['en1991-1-7-2006', 'en1991-1-7-2025']) expect(cel(cas, g, 'dur').sollicitation).toBeCloseTo((13.9 * Math.sqrt(300000 * 1500)) / 1000, 9);
    expect(cel(cas, 'en1991-1-7-2025', 'dur').sollicitation).toBeCloseTo(294.8636, 3);
  });

  it('superstructure a 5,4 m : r_F = 0,6, F = 300 kN ; a 6 m : 0', () => {
    expect(cel(cas, 'en1991-1-7-2025', 'superstructure').sollicitation).toBeCloseTo(300, 9);
    expect(cel({ ...cas, h: 6 }, 'en1991-1-7-2025', 'superstructure').sollicitation).toBe(0);
  });
});
