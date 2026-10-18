import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { poidsPropePont } from '../../../src/noyau/mecanismes/poids-propre-pont/index';

// Valeurs attendues calculees a la main (docs/validation/poids-propre-pont.md).

const cel = (e: object, g: string, n: string) => calculerMatrice(poidsPropePont, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('poids propre des elements non structuraux des ponts (EN 1991-1-1)', () => {
  it('chaussee de 8 cm sans rechargement : 2,688 et 1,536 kN/m2', () => {
    const e = { gnom: 1.92, element: 'revetement-sans' };
    for (const g of ['en1991-1-1-2002', 'en1991-1-1-2025']) {
      expect(cel(e, g, 'superieure').sollicitation).toBeCloseTo(2.688, 12);
      expect(cel(e, g, 'inferieure').sollicitation).toBeCloseTo(1.536, 12);
    }
  });

  it('ballast : +/- 30 %', () => {
    expect(cel({ gnom: 10, element: 'ballast' }, 'en1991-1-1-2025', 'superieure').sollicitation).toBeCloseTo(13, 12);
    expect(cel({ gnom: 10, element: 'ballast' }, 'en1991-1-1-2025', 'inferieure').sollicitation).toBeCloseTo(7, 12);
  });
});
