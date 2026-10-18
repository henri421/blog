import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { comptageCycles, rainflow } from '../../../src/noyau/mecanismes/comptage-cycles/index';

// Valeurs attendues calculees independamment (Python),
// docs/validation/comptage-cycles.md.

describe('comptage des cycles par demi-cycles (EN 1990, annexe F)', () => {
  it('historiques de controle', () => {
    expect(rainflow([0, 10, 2, 8, 4, 12, 0])).toEqual([12, 8, 4]);
    expect(rainflow([20, 60, 30, 80, 10, 50, 40, 90])).toEqual([80, 60, 30, 10]);
  });

  it('plage equivalente, m = 3, 10^6 repetitions : 72,30 MPa', () => {
    const e = { s1: 20, s2: 60, s3: 30, s4: 80, s5: 10, s6: 50, s7: 40, s8: 90, m: 3, nrep: 1e6 };
    const c = calculerMatrice(comptageCycles, e).cellules.find((x) => x.generation === 'en1990-2023')!;
    expect(c.sollicitation).toBeCloseTo(72.304268, 5);
    expect(calculerMatrice(comptageCycles, e).cellules.find((x) => x.generation === 'en1990-2002')!.statut.etat).toBe('non-applicable');
  });
});
