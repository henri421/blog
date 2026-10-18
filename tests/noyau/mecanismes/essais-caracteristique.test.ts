import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { essaisCaracteristique, knConnu, knInconnu } from '../../../src/noyau/mecanismes/essais-caracteristique/index';

// Valeurs attendues calculees independamment (Python, quantiles de Student
// tabules), docs/validation/essais-caracteristique.md.

const acier = { x1: 312, x2: 301, x3: 308, x4: 306, Vx: 0.01 };
const cel = (e: object, g: string, n: string) => calculerMatrice(essaisCaracteristique, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('valeur caracteristique a partir d essais (EN 1990, annexe D)', () => {
  it('k_n retrouve le tableau D.1', () => {
    expect(knConnu(4)).toBeCloseTo(1.839002, 5);
    expect(knInconnu(3)).toBeCloseTo(3.371709, 4);
    expect(knInconnu(4)).toBeCloseTo(2.631140, 4);
    expect(knInconnu(10)).toBeCloseTo(1.922585, 4);
  });

  it('acier de 1940, 4 essais : 301,11 (V connu) et 294,72 (V inconnu)', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) {
      expect(cel(acier, g, 'v-connu').resistance).toBeCloseTo(301.108861, 3);
      expect(cel(acier, g, 'v-inconnu').resistance).toBeCloseTo(294.716548, 3);
    }
  });
});
