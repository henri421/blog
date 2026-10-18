import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { gardeCorps } from '../../../src/noyau/mecanismes/garde-corps/index';

// Valeurs attendues calculees a la main (docs/validation/garde-corps.md).

const balcon = { qk: 1.0, h: 1.1, s: 1.5 };
const cel = (e: object, g: string, n: string) => calculerMatrice(gardeCorps, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('garde-corps (EN 1991-1-1)', () => {
  it('moment a la base : 1,65 kN.m ; hauteur plafonnee a 1,2 m', () => {
    for (const g of ['en1991-1-1-2002', 'en1991-1-1-2025']) expect(cel(balcon, g, 'horizontal').sollicitation).toBeCloseTo(1.65, 12);
    expect(cel({ ...balcon, h: 1.5 }, 'en1991-1-1-2025', 'horizontal').sollicitation).toBeCloseTo(1.8, 12);
  });

  it('charge verticale : 1 kN pour 1,5 m, 1,2 kN pour 2 m ; aucune en 2002', () => {
    expect(cel(balcon, 'en1991-1-1-2025', 'vertical').sollicitation).toBe(1);
    expect(cel({ ...balcon, s: 2 }, 'en1991-1-1-2025', 'vertical').sollicitation).toBeCloseTo(1.2, 12);
    expect(cel(balcon, 'en1991-1-1-2002', 'vertical').statut.etat).toBe('non-applicable');
  });
});
