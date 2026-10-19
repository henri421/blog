import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { equilibreStatique } from '../../../src/noyau/mecanismes/equilibre-statique/index';

// Valeurs attendues calculees a la main (docs/validation/equilibre-statique.md).

const console36 = { L: 5, a: 3.6, g: 10, q: 5, cc: 'CC2' };
const cel = (e: object, g: string, n: string) => calculerMatrice(equilibreStatique, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('equilibre statique d une poutre a console (EN 1990)', () => {
  it('2002, EQU : 119,88 contre 112,5 kN.m, ancrage de 1,476 kN', () => {
    const c = cel(console36, 'en1990-2002', 'equ');
    expect(c.sollicitation).toBeCloseTo(119.88, 9);
    expect(c.resistance).toBeCloseTo(112.5, 9);
    expect(c.intermediaires.F_ancrage.valeur).toBeCloseTo(1.476, 9);
  });

  it('2002 NOTE 2 et 2023 VC2 en CC2 : 136,08 contre 143,75, VC2(a) gouverne', () => {
    for (const [g, n] of [
      ['en1990-2002', 'equ-str'],
      ['en1990-2023', 'vc2'],
    ]) {
      const c = cel(console36, g, n);
      expect(c.sollicitation).toBeCloseTo(136.08, 9);
      expect(c.resistance).toBeCloseTo(143.75, 9);
    }
  });

  it('CC3 : VC2(a) 149,688 contre 143,75, ancrage de 1,1876 kN', () => {
    const c = cel({ ...console36, cc: 'CC3' }, 'en1990-2023', 'vc2');
    expect(c.sollicitation).toBeCloseTo(149.688, 9);
    expect(c.intermediaires.F_ancrage.valeur).toBeCloseTo(1.1876, 9);
  });

  it('CC1 : VC2(b) gouverne, 108,54 contre 125', () => {
    const c = cel({ ...console36, cc: 'CC1' }, 'en1990-2023', 'vc2');
    expect(c.sollicitation).toBeCloseTo(108.54, 9);
    expect(c.resistance).toBe(125);
  });
});

describe('equilibre statique, niveau AN-LU (A1.3.1(1))', () => {
  it('tableau A1.2(A) seul : 119,88 contre 112,50 kN.m, NOTE 2 ecartee', () => {
    const c = cel(console36, 'en1990-2002', 'lu');
    expect(c.sollicitation).toBeCloseTo(119.88, 10);
    expect(c.resistance).toBeCloseTo(112.5, 10);
    expect(c.statut).toEqual({ etat: 'reserve', motif: 'reserve.an-lu-en1990' });
  });
});
