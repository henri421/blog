import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { temperaturePont } from '../../../src/noyau/mecanismes/temperature-pont/index';

// Valeurs attendues calculees a la main (docs/validation/temperature-pont.md).

const beton = { type: 'beton', Tmax: 35, Tmin: -20, T0: 10, dT0: 5 };
const cel = (e: object, g: string, n: string) => calculerMatrice(temperaturePont, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('temperature uniforme d un tablier (EN 1991-1-5)', () => {
  it('beton : contraction 22 et dilatation 26,5 en 2003 ; 27 et 32 en 2025', () => {
    expect(cel(beton, 'en1991-1-5-2003', 'contraction').sollicitation).toBeCloseTo(22, 12);
    expect(cel(beton, 'en1991-1-5-2003', 'dilatation').sollicitation).toBeCloseTo(26.5, 12);
    expect(cel(beton, 'en1991-1-5-2025', 'contraction').sollicitation).toBeCloseTo(27, 12);
    expect(cel(beton, 'en1991-1-5-2025', 'dilatation').sollicitation).toBeCloseTo(32, 12);
  });

  it('changement climatique + 2 degres : dilatation 34 ; acier : 41 en 2003', () => {
    expect(cel({ ...beton, dTccmax: 2 }, 'en1991-1-5-2025', 'dilatation').sollicitation).toBeCloseTo(34, 12);
    expect(cel({ ...beton, type: 'acier' }, 'en1991-1-5-2003', 'dilatation').sollicitation).toBeCloseTo(41, 12);
  });
});
