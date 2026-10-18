import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { executionClimat } from '../../../src/noyau/mecanismes/execution-climat/index';

// Valeurs attendues calculees independamment (Python), docs/validation/execution-climat.md.

const cel = (e: object, g: string) => calculerMatrice(executionClimat, e).cellules.find((c) => c.generation === g)!;

describe('vent pendant l execution (EN 1991-1-6)', () => {
  it('phase de 60 jours : 308,5 Pa en 2005 (5 ans), 422,5 Pa en 2026 (50 ans)', () => {
    expect(cel({ duree: 60, vb0: 26 }, 'en1991-1-6-2005').sollicitation).toBeCloseTo(308.497368, 4);
    expect(cel({ duree: 60, vb0: 26 }, 'en1991-1-6-2026').sollicitation).toBeCloseTo(422.5, 9);
  });

  it('coefficient de saison 0,8 : 270,4 Pa ; au-dela d un an, ignore', () => {
    expect(cel({ duree: 60, vb0: 26, cseason: 0.8 }, 'en1991-1-6-2026').sollicitation).toBeCloseTo(270.4, 9);
    expect(cel({ duree: 500, vb0: 26, cseason: 0.8 }, 'en1991-1-6-2026').sollicitation).toBeCloseTo(422.5, 9);
  });

  it('deux jours : 254,7 Pa en 2005 ; donnees meteorologiques en 2026', () => {
    expect(cel({ duree: 2, vb0: 26 }, 'en1991-1-6-2005').sollicitation).toBeCloseTo(254.703138, 4);
    expect(cel({ duree: 2, vb0: 26 }, 'en1991-1-6-2026').statut.etat).toBe('non-applicable');
  });
});
