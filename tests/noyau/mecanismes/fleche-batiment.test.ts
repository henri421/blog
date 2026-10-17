import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { flecheBatiment } from '../../../src/noyau/mecanismes/fleche-batiment/index';

// Valeurs attendues calculees a la main (docs/validation/fleche-batiment.md).

const plancher = { l: 7.2, wc: 0, w1: 8, w2: 10, w3: 4, nd: 500, na: 250 };
const cel = (e: object, g: string, n: string) => calculerMatrice(flecheBatiment, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('criteres de fleche des batiments (EN 1990)', () => {
  it('2023, dommages : 14 mm contre l/500 = 14,4 mm', () => {
    const c = cel(plancher, 'en1990-2023', 'dommage');
    expect(c.sollicitation).toBe(14);
    expect(c.resistance).toBeCloseTo(14.4, 12);
  });

  it('2023, apparence : 18 mm contre l/250 = 28,8 mm ; contrefleche deduite', () => {
    expect(cel(plancher, 'en1990-2023', 'apparence').sollicitation).toBe(18);
    expect(cel(plancher, 'en1990-2023', 'apparence').resistance).toBeCloseTo(28.8, 12);
    expect(cel({ ...plancher, wc: 10 }, 'en1990-2023', 'apparence').sollicitation).toBe(8);
  });

  it('2002 : pas de limite chiffree', () => {
    expect(cel(plancher, 'en1990-2002', 'dommage').statut.etat).toBe('non-applicable');
    expect(cel(plancher, 'en1990-2002', 'apparence').statut.etat).toBe('non-applicable');
  });
});
