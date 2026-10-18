import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { resistanceCalcul } from '../../../src/noyau/mecanismes/resistance-calcul/index';

// Valeurs attendues calculees a la main (docs/validation/resistance-calcul.md).

const tranchant = { Xk: 30, eta: 1, k: 0.66, q: 1 / 3, gamma: 1.5 };
const cel = (e: object, g: string, n: string) => calculerMatrice(resistanceCalcul, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('resistance de calcul, MFA ou RFA (EN 1990)', () => {
  it('q = 1/3 : MFA 1,7915, RFA 1,3672', () => {
    expect(cel(tranchant, 'en1990-2023', 'mfa').resistance).toBeCloseTo(0.66 * 20 ** (1 / 3), 12);
    expect(cel(tranchant, 'en1990-2023', 'rfa').resistance).toBeCloseTo((0.66 * 30 ** (1 / 3)) / 1.5, 12);
    expect(cel(tranchant, 'en1990-2023', 'mfa').resistance).toBeCloseTo(1.79152, 4);
    expect(cel(tranchant, 'en1990-2023', 'rfa').resistance).toBeCloseTo(1.36718, 4);
  });

  it('lineaire (q = 1) : les deux approches coincident', () => {
    const e = { ...tranchant, q: 1 };
    expect(cel(e, 'en1990-2002', 'mfa').resistance).toBeCloseTo(13.2, 12);
    expect(cel(e, 'en1990-2002', 'rfa').resistance).toBeCloseTo(13.2, 12);
  });
});
