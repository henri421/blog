import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { centrifugeRail, reductionF } from '../../../src/noyau/mecanismes/centrifuge-rail/index';

// Valeurs attendues calculees a la main (docs/validation/centrifuge-rail.md).

const courbe = { V: 200, r: 1500, Lf: 20, Qvk: 250 };
const cel = (e: object, g: string) => calculerMatrice(centrifugeRail, e).cellules.find((c) => c.generation === g)!;

describe('force centrifuge ferroviaire (EN 1991-2, 8.5.1)', () => {
  it('V = 200 km/h, r = 1500 m, L_f = 20 m, essieu de 250 kN : 37,33 kN', () => {
    expect(cel(courbe, 'en1991-2-2023').sollicitation).toBeCloseTo(37.327179918, 8);
    expect(cel(courbe, 'en1991-2-2003').sollicitation).toBeCloseTo(37.327179918, 8);
  });

  it('coefficient f : tableau 8.7 et bornes', () => {
    expect(reductionF(200, 20)).toBeCloseTo(0.71108, 5);
    expect(reductionF(120, 20)).toBe(1);
    expect(reductionF(300, 150)).toBeCloseTo(0.35, 12);
    expect(reductionF(350, 20)).toBeCloseTo(reductionF(300, 20), 12);
  });
});
