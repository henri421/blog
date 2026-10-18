import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { neigeVersants } from '../../../src/noyau/mecanismes/neige-versants/index';

// Valeurs attendues calculees a la main (docs/validation/neige-versants.md).

const maison = { sk: 0.5, alpha: 20, exposition: 'normal', Ct: 1 };
const cel = (e: object, g: string, n: string) => calculerMatrice(neigeVersants, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('neige sur toiture a deux versants (EN 1991-1-3)', () => {
  it('20 degres, normal : 0,40 uniforme ; non uniforme 0,40 (2003) contre 0,448 (2025)', () => {
    expect(cel(maison, 'en1991-1-3-2003', 'uniforme').sollicitation).toBeCloseTo(0.4, 12);
    expect(cel(maison, 'en1991-1-3-2025', 'uniforme').sollicitation).toBeCloseTo(0.4, 12);
    expect(cel(maison, 'en1991-1-3-2003', 'non-uniforme').sollicitation).toBeCloseTo(0.4, 12);
    expect(cel(maison, 'en1991-1-3-2025', 'non-uniforme').sollicitation).toBeCloseTo(0.448, 12);
  });

  it('20 degres, balaye : 0,32 (2003) contre 0,416 (2025) en non uniforme', () => {
    const e = { ...maison, exposition: 'balaye' };
    expect(cel(e, 'en1991-1-3-2003', 'non-uniforme').sollicitation).toBeCloseTo(0.32, 12);
    expect(cel(e, 'en1991-1-3-2025', 'non-uniforme').sollicitation).toBeCloseTo(0.416, 12);
  });

  it('45 degres : 0,2 (2003) contre 0,25 + vent (2025) ; 65 degres : 0 en 2003', () => {
    expect(cel({ ...maison, alpha: 45 }, 'en1991-1-3-2003', 'uniforme').sollicitation).toBeCloseTo(0.2, 12);
    expect(cel({ ...maison, alpha: 45 }, 'en1991-1-3-2025', 'uniforme').sollicitation).toBeCloseTo(0.25, 12);
    expect(cel({ ...maison, alpha: 45 }, 'en1991-1-3-2025', 'non-uniforme').sollicitation).toBeCloseTo(0.25 + 0.5 * 0.16 * 25 / 40, 12);
    expect(cel({ ...maison, alpha: 65 }, 'en1991-1-3-2003', 'uniforme').sollicitation).toBe(0);
  });
});
