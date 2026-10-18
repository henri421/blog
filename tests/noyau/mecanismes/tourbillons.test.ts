import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { tourbillons } from '../../../src/noyau/mecanismes/tourbillons/index';

// Valeurs attendues calculees a la main (docs/validation/tourbillons.md).

const tour = { b: 2, d: 4, n: 1.2, St: 0.06, vm: 30, m: 4000, deltas: 0.05 };
const cel = (e: object, g: string, n: string) => calculerMatrice(tourbillons, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('detachement tourbillonnaire (EN 1991-1-4)', () => {
  it('v_crit = 40 m/s > 1,25 v_m = 37,5 m/s dans les deux generations', () => {
    for (const g of ['en1991-1-4-2005', 'en1991-1-4-2026']) {
      expect(cel(tour, g, 'critere').resistance).toBeCloseTo(40, 12);
      expect(cel(tour, g, 'critere').sollicitation).toBeCloseTo(37.5, 12);
    }
  });

  it('Scruton : 80 en 2005, 40 en 2026 (section rectangulaire d/b = 2)', () => {
    expect(cel(tour, 'en1991-1-4-2005', 'scruton').resistance).toBeCloseTo(80, 12);
    expect(cel(tour, 'en1991-1-4-2026', 'scruton').resistance).toBeCloseTo(40, 12);
    expect(cel({ ...tour, d: 2 }, 'en1991-1-4-2026', 'scruton').resistance).toBeCloseTo(80, 12);
  });
});
