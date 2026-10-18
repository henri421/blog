import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { freinageMeca } from '../../../src/noyau/mecanismes/freinage/index';

// Valeurs attendues calculees a la main (docs/validation/freinage.md).

const cel = (e: object, g: string, n: string) => calculerMatrice(freinageMeca, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('forces horizontales des ponts routiers (EN 1991-2)', () => {
  it('tablier de 60 m : Q_Lk = 360 + 2,7 x 60 = 522 kN ; 250 m : 900 kN', () => {
    for (const g of ['en1991-2-2003', 'en1991-2-2023']) expect(cel({ L: 60 }, g, 'freinage').sollicitation).toBeCloseTo(522, 9);
    expect(cel({ L: 250 }, 'en1991-2-2023', 'freinage').sollicitation).toBe(900);
  });

  it('force centrifuge, Q_v = 1200 kN : 240 (r = 150), 96 (r = 500), 0 (r = 2000)', () => {
    expect(cel({ r: 150, Qv: 1200 }, 'en1991-2-2023', 'centrifuge').sollicitation).toBeCloseTo(240, 9);
    expect(cel({ r: 500, Qv: 1200 }, 'en1991-2-2023', 'centrifuge').sollicitation).toBeCloseTo(96, 9);
    expect(cel({ r: 2000, Qv: 1200 }, 'en1991-2-2023', 'centrifuge').sollicitation).toBe(0);
  });
});
