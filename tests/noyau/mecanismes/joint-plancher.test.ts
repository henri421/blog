import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { jointPlancherMeca } from '../../../src/noyau/mecanismes/joint-plancher/index';

// Valeurs attendues calculees a la main (docs/validation/joint-plancher.md).

describe('joint entre elements de plancher', () => {
  it('q_Ed = 4,5 kN/m2, b_e = 1,2 m : v_Ed = 1,8 kN/m dans les deux generations', () => {
    const m = calculerMatrice(jointPlancherMeca, { qEd: 4.5, be: 1.2, vRd: 10 });
    for (const c of m.cellules) {
      expect(c.sollicitation).toBeCloseTo(1.8, 12);
      expect(c.taux).toBeCloseTo(0.18, 12);
    }
  });
});
