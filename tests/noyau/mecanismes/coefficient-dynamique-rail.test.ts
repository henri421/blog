import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { coefficientDynamiqueRail } from '../../../src/noyau/mecanismes/coefficient-dynamique-rail/index';

// Valeurs attendues calculees a la main (docs/validation/coefficient-dynamique-rail.md).

const pont = { entretien: 'normal', L: 20 };
const cel = (e: object, g: string) => calculerMatrice(coefficientDynamiqueRail, e).cellules.find((c) => c.generation === g)!;

describe('coefficient dynamique ferroviaire (EN 1991-2, 8.4.5)', () => {
  it('L = 20 m : Phi3 = 1,2356, Phi2 = 1,1571', () => {
    expect(cel(pont, 'en1991-2-2023').sollicitation).toBeCloseTo(1.2356018869, 9);
    expect(cel({ ...pont, entretien: 'soigne' }, 'en1991-2-2023').sollicitation).toBeCloseTo(1.1570679246, 9);
    expect(cel(pont, 'en1991-2-2003').sollicitation).toBeCloseTo(1.2356018869, 9);
  });

  it('couverture de 1,5 m : reduction de 0,05 ; bornes', () => {
    expect(cel({ ...pont, h: 1.5 }, 'en1991-2-2023').sollicitation).toBeCloseTo(1.1856018869, 9);
    expect(cel({ entretien: 'normal', L: 2 }, 'en1991-2-2023').sollicitation).toBeCloseTo(2.0, 12);
    expect(cel({ entretien: 'soigne', L: 400 }, 'en1991-2-2023').sollicitation).toBeCloseTo(1.0, 12);
  });
});
