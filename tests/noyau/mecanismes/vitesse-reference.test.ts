import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { cprob, vitesseReference } from '../../../src/noyau/mecanismes/vitesse-reference/index';

// Valeurs attendues calculees independamment (Python), docs/validation/vitesse-reference.md.

const chantier = { vb0: 26, cdir: 1, cseason: 1, T: 5 };
const cel = (e: object, g: string) => calculerMatrice(vitesseReference, e).cellules.find((c) => c.generation === g)!;

describe('vitesse et pression de reference du vent (EN 1991-1-4)', () => {
  it('c_prob : 0,8545 (5 ans), 1 (50 ans), 1,0385 (100 ans)', () => {
    expect(cprob(5)).toBeCloseTo(0.854501, 6);
    expect(cprob(50)).toBeCloseTo(1, 12);
    expect(cprob(100)).toBeCloseTo(1.038477, 6);
  });

  it('periode de retour 5 ans : q_b = 308,5 Pa dans les deux generations', () => {
    for (const g of ['en1991-1-4-2005', 'en1991-1-4-2026']) expect(cel(chantier, g).sollicitation).toBeCloseTo(308.497368, 4);
  });

  it('f_w,cc = 1,05 en 2026 : 340,1 Pa ; sans effet en 2005', () => {
    expect(cel({ ...chantier, fwcc: 1.05 }, 'en1991-1-4-2026').sollicitation).toBeCloseTo(340.118348, 4);
    expect(cel({ ...chantier, fwcc: 1.05 }, 'en1991-1-4-2005').sollicitation).toBeCloseTo(308.497368, 4);
  });
});
