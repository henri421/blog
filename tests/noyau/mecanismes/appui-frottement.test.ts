import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { alphaN, appuiFrottement } from '../../../src/noyau/mecanismes/appui-frottement/index';

// Valeurs attendues calculees a la main (docs/validation/appui-frottement.md).

const viaduc = { mumax: 0.03, Nd: 2000, nu: 6, nf: 6 };
const cel = (e: object, n: string) => calculerMatrice(appuiFrottement, e).cellules.find((c) => c.generation === 'en1990-2023' && c.niveau === n)!;

describe('frottement des appareils d appui (EN 1990, annexe G)', () => {
  it('alpha_n du tableau G.3', () => {
    expect(alphaN(4)).toBe(1);
    expect(alphaN(6)).toBeCloseTo(10 / 12, 12);
    expect(alphaN(12)).toBe(0.5);
  });

  it('6 + 6 appareils : 360 kN sans compensation, 300 kN avec', () => {
    expect(cel(viaduc, 'sans-compensation').sollicitation).toBeCloseTo(360, 9);
    expect(cel(viaduc, 'compense').sollicitation).toBeCloseTo(300, 9);
  });

  it('4 + 4 appareils : aucune compensation (alpha_n = 1)', () => {
    expect(cel({ ...viaduc, nu: 4, nf: 4 }, 'compense').sollicitation).toBeCloseTo(240, 9);
  });
});
