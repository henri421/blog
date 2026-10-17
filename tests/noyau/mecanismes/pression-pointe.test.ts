import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { pressionPointe } from '../../../src/noyau/mecanismes/pression-pointe/index';

// Valeurs attendues calculees a la main (docs/validation/pression-pointe.md),
// confrontees a l exemple de l atelier JRC de juin 2025 (immeuble de 100 m).

const tour = { vb0: 27, z0: 0.3, zmin: 5, z: 100 };
const ville = { vb0: 26, z0: 1.0, zmin: 10, z: 8 };
const qp = (e: object, g: string) => calculerMatrice(pressionPointe, e).cellules.find((c) => c.generation === g)!;

describe('pression dynamique de pointe (EN 1991-1-4)', () => {
  it('immeuble de 100 m, categorie III : 1572,9 Pa en 2005, 1603,3 Pa en 2026', () => {
    expect(qp(tour, 'en1991-1-4-2005').sollicitation).toBeCloseTo(1572.853, 2);
    expect(qp(tour, 'en1991-1-4-2026').sollicitation).toBeCloseTo(1603.27, 2);
    expect(qp({ ...tour, z: 40 }, 'en1991-1-4-2005').sollicitation).toBeCloseTo(1229.997, 2);
    expect(qp({ ...tour, z: 40 }, 'en1991-1-4-2026').sollicitation).toBeCloseTo(1283.656, 2);
  });

  it('petit immeuble en ville, categorie IV, z < z_min : 496,9 Pa contre 627,9 Pa', () => {
    expect(qp(ville, 'en1991-1-4-2005').sollicitation).toBeCloseTo(496.933, 2);
    expect(qp(ville, 'en1991-1-4-2026').sollicitation).toBeCloseTo(627.938, 2);
  });

  it('f_w,cc = 1,05 : 692,3 Pa ; au-dela de 200 m : non applicable', () => {
    expect(qp({ ...ville, fwcc: 1.05 }, 'en1991-1-4-2026').sollicitation).toBeCloseTo(692.301, 2);
    expect(qp({ ...tour, z: 250 }, 'en1991-1-4-2026').statut.etat).toBe('non-applicable');
  });
});
