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

  it('acier de 1940, 4 essais : 301,11 (V connu) ; V inconnu ramene au plancher 0,10 : 226,04 (294,72 sans plancher)', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) {
      expect(cel(acier, g, 'v-connu').resistance).toBeCloseTo(301.108861, 3);
      const c = cel(acier, g, 'v-inconnu');
      expect(c.resistance).toBeCloseTo(226.039776, 2);
      expect(c.intermediaires.V_x.valeur).toBe(0.1);
      expect(c.intermediaires.V_x.provenance).toBe('recommandee');
      expect(c.intermediaires['X_k sans plancher'].valeur).toBeCloseTo(294.716548, 3);
      expect(c.clauses).toContain('D.7.1(5)');
    }
  });

  it('V inconnu au-dessus du plancher : 100, 80, 120 donnent V = 0,20 et X_k = 100 - 3,3717 x 20 = 32,57', () => {
    const c = cel({ x1: 100, x2: 80, x3: 120 }, 'en1990-2002', 'v-inconnu');
    expect(c.intermediaires.V_x.valeur).toBeCloseTo(0.2, 10);
    expect(c.intermediaires.V_x.provenance).toBe('calculee');
    expect(c.resistance).toBeCloseTo(32.565820, 3);
    expect(c.clauses).not.toContain('D.7.1(5)');
  });
});
