import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { fleche, etatFissure, etatNonFissure, type EntreeFleche } from '../../../src/noyau/mecanismes/fleche/index';

// Valeurs attendues calculees a la main (docs/validation/fleche.md).

/** Dalle de logement de 20 cm sur 5 m, HA12/200, C25/30. */
const dalle = (): EntreeFleche => ({
  L: 5000,
  b: 1000,
  h: 200,
  d: 172,
  As: 565,
  fck: 25,
  qqp: 6.6,
  qk: 8,
  phi: 2.5,
  epsCs: 0.4,
  rapport: 250,
});

const cel = (e: EntreeFleche, g: string, n: string) =>
  calculerMatrice(fleche, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('fleche, dalle de logement', () => {
  it('2004 : zeta sur M_qp = 0,5530, fleche 23,33 mm', () => {
    const c = cel(dalle(), 'ec2-2004', 'generale');
    expect(c.intermediaires['ζ'].valeur).toBeCloseTo(0.552976, 5);
    expect(c.intermediaires['δ_I'].valeur).toBeCloseTo(9.666115, 4);
    expect(c.intermediaires['δ_II'].valeur).toBeCloseTo(34.383296, 4);
    expect(c.sollicitation).toBeCloseTo(23.334135, 4);
    expect(c.resistance).toBe(20);
  });

  it('2023, methode generale : zeta sur M_k = 0,6933, fleche 27,04 mm', () => {
    const c = cel(dalle(), 'ec2-2023', 'generale');
    expect(c.intermediaires['ζ'].valeur).toBeCloseTo(0.693314, 5);
    expect(c.sollicitation).toBeCloseTo(27.041137, 4);
  });

  it('2023, calcul simplifie : k_I = 2,3366, k_s = 1,4899, fleche 27,72 mm', () => {
    const c = cel(dalle(), 'ec2-2023', 'simplifiee');
    expect(c.intermediaires['I_g / I_cr'].valeur).toBeCloseTo(2.744777, 5);
    expect(c.intermediaires.k_I.valeur).toBeCloseTo(2.336636, 5);
    expect(c.intermediaires.k_s.valeur).toBeCloseTo(1.489939, 5);
    expect(c.sollicitation).toBeCloseTo(27.723322, 4);
  });

  it('section non fissuree sous M_k : k_I = k_s = 1', () => {
    const c = cel({ ...dalle(), qqp: 2, qk: 3 }, 'ec2-2023', 'simplifiee');
    expect(c.intermediaires.k_I.valeur).toBe(1);
    expect(c.intermediaires.k_s.valeur).toBe(1);
  });
});

describe('sections', () => {
  it('section fissuree : x par l equilibre b x2/2 = alpha_e A_s (d - x)', () => {
    const s = etatFissure(1000, 172, 565, 22.239303);
    expect((1000 * s.x ** 2) / 2).toBeCloseTo(22.239303 * 565 * (172 - s.x), 3);
  });

  it('section non fissuree : centre de gravite homogeneise', () => {
    const s = etatNonFissure(1000, 200, 172, 565, 20);
    expect(s.x).toBeCloseTo((1000 * 200 * 100 + 20 * 565 * 172) / (1000 * 200 + 20 * 565), 9);
  });
});
