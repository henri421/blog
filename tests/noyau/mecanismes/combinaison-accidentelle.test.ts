import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { combinaisonAccidentelle } from '../../../src/noyau/mecanismes/combinaison-accidentelle/index';

// Valeurs attendues calculees a la main (docs/validation/combinaison-accidentelle.md).

const feu = { G: 800, Ad: 0, Q1: 300, psi11: 0.5, psi21: 0.3, Q2: 100, psi22: 0, valeur: 'quasi-permanente', cc: 'CC2' };
const cel = (e: object, g: string) => calculerMatrice(combinaisonAccidentelle, e).cellules.find((c) => c.generation === g)!;

describe('combinaison accidentelle et eta_fi (EN 1990, EN 1991-1-2)', () => {
  it('incendie, CC2 : E_d = 890 kN et eta_fi = 0,5817 dans les deux generations', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) {
      const c = cel(feu, g);
      expect(c.sollicitation).toBe(890);
      expect(c.intermediaires['η_fi'].valeur).toBeCloseTo(890 / 1530, 12);
    }
  });

  it('CC3 : meme E_d, eta_fi = 0,5288 ; valeur frequente : 950 kN', () => {
    expect(cel({ ...feu, cc: 'CC3' }, 'en1990-2023').sollicitation).toBe(890);
    expect(cel({ ...feu, cc: 'CC3' }, 'en1990-2023').intermediaires['η_fi'].valeur).toBeCloseTo(890 / 1683, 12);
    expect(cel({ ...feu, valeur: 'frequente' }, 'en1990-2023').sollicitation).toBe(950);
  });

  it('choc : A_d ajoutee telle quelle', () => {
    expect(cel({ ...feu, Ad: 150, psi22: 0.2 }, 'en1990-2023').sollicitation).toBe(1060);
  });
});
