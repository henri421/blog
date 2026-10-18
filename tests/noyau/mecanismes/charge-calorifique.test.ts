import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { chargeCalorifique } from '../../../src/noyau/mecanismes/charge-calorifique/index';

// Valeurs attendues calculees a la main (docs/validation/charge-calorifique.md).

const bureaux = { qk: 500, m: 0.8, dq1: 1.5, dq2: 1.0, dn: 0.61 * 0.73 * 0.87, cc: 'CC2' };
const cel = (e: object, g: string) => calculerMatrice(chargeCalorifique, e).cellules.find((c) => c.generation === g)!;

describe('charge calorifique de calcul (EN 1991-1-2, annexe E)', () => {
  it('bureaux sprinkles, CC2 : 232,45 MJ/m2 dans les deux generations', () => {
    for (const g of ['en1991-1-2-2002', 'en1991-1-2-2024']) expect(cel(bureaux, g).sollicitation).toBeCloseTo(232.4466, 4);
  });

  it('CC3 : x 1,19 = 276,61 MJ/m2 ; CC1 : x 0,83 = 192,93 MJ/m2', () => {
    expect(cel({ ...bureaux, cc: 'CC3' }, 'en1991-1-2-2024').sollicitation).toBeCloseTo(276.6115, 3);
    expect(cel({ ...bureaux, cc: 'CC1' }, 'en1991-1-2-2024').sollicitation).toBeCloseTo(192.9307, 3);
  });
});
