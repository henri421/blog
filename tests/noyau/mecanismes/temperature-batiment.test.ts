import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { temperatureBatiment } from '../../../src/noyau/mecanismes/temperature-batiment/index';

// Valeurs attendues calculees a la main (docs/validation/temperature-batiment.md).

const poutre = { Tin: 20, Tout: 72, T0: 10, E: 210000, A: 5380, alpha: 12e-6 };
const cel = (e: object, g: string) => calculerMatrice(temperatureBatiment, e).cellules.find((c) => c.generation === g)!;

describe('temperature uniforme dans les batiments (EN 1991-1-5)', () => {
  it('poutre en facade sud-ouest sombre : Delta T_N = 36, N = 488,1 kN', () => {
    for (const g of ['en1991-1-5-2003', 'en1991-1-5-2025']) {
      expect(cel(poutre, g).intermediaires['ΔT_N'].valeur).toBe(36);
      expect(cel(poutre, g).sollicitation).toBeCloseTo(488.0736, 6);
    }
  });
});
