import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { feuNominal, thetaG } from '../../../src/noyau/mecanismes/feu-nominal/index';

// Valeurs attendues calculees independamment (Python), docs/validation/feu-nominal.md.

const cel = (e: object, g: string) => calculerMatrice(feuNominal, e).cellules.find((c) => c.generation === g)!;

describe('courbes de feu nominales et flux net (EN 1991-1-2)', () => {
  it('feu normalise a 60 min : 945,3 degres C', () => {
    expect(thetaG('normalisee', 60)).toBeCloseTo(945.34005, 4);
    expect(thetaG('hydrocarbures', 60)).toBeCloseTo(1099.98438, 4);
    expect(thetaG('exterieure', 30)).toBeCloseTo(679.96929, 4);
  });

  it('flux net : 94,88 kW/m2 (normalise, 60 min, surface a 500 degres C) dans les deux generations', () => {
    for (const g of ['en1991-1-2-2002', 'en1991-1-2-2024']) expect(cel({ courbe: 'normalisee', t: 60, thetam: 500 }, g).sollicitation).toBeCloseTo(94.879918, 4);
  });

  it('hydrocarbures, 60 min, 500 degres C : 174,99 kW/m2', () => {
    expect(cel({ courbe: 'hydrocarbures', t: 60, thetam: 500 }, 'en1991-1-2-2024').sollicitation).toBeCloseTo(174.992855, 4);
  });
});
