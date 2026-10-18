import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { lm1, voies } from '../../../src/noyau/mecanismes/lm1/index';

// Valeurs attendues calculees a la main (docs/validation/lm1.md).

const cel = (e: object, g: string) => calculerMatrice(lm1, e).cellules.find((c) => c.generation === g)!;

describe('modele de charge 1 (EN 1991-2)', () => {
  it('voies : 11 m -> 3 voies et 2 m residuels ; 5,6 m -> 2 voies de 2,8 m ; 5 m -> 1 voie', () => {
    expect(voies(11)).toEqual({ n: 3, wl: 3, wr: 2 });
    expect(voies(5.6)).toEqual({ n: 2, wl: 2.8, wr: 0 });
    expect(voies(5).n).toBe(1);
  });

  it('chaussee de 11 m, portee 20 m : M = 7990 kN.m dans les deux generations', () => {
    for (const g of ['en1991-2-2003', 'en1991-2-2023']) expect(cel({ w: 11, L: 20 }, g).sollicitation).toBeCloseTo(7990, 9);
  });

  it('alpha_Q = 0,8 : M_TS = 4512 kN.m', () => {
    expect(cel({ w: 11, L: 20, alphaQ: 0.8 }, 'en1991-2-2023').intermediaires.M_TS.valeur).toBeCloseTo(4512, 9);
  });
});
