import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { fissuration, type EntreeFissuration } from '../../../src/noyau/mecanismes/fissuration/index';

// Valeurs attendues calculees a la main (docs/validation/fissuration.md).

/** Dalle de 22 cm, HA12/150, enrobage 24 mm, C25/30, moment quasi permanent 25 kN.m/m. */
const dalle = (): EntreeFissuration => ({
  b: 1000,
  h: 220,
  d: 190,
  phi: 12,
  s: 150,
  c: 24,
  Mqp: 25,
  fck: 25,
  alphaE: 15,
  duree: 'longue',
  wmax: 0.3,
});

const cel = (e: EntreeFissuration, g: string) =>
  calculerMatrice(fissuration, e).cellules.find((c) => c.generation === g)!;

describe('fissuration, dalle de logement', () => {
  it('section fissuree commune : x = 55,22 mm, sigma_s = 193,23 MPa', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      const c = cel(dalle(), g);
      expect(c.intermediaires.x.valeur).toBeCloseTo(55.2155, 3);
      expect(c.intermediaires['σ_s'].valeur).toBeCloseTo(193.23, 2);
    }
  });

  it('premiere generation : s_r,max = 230,2 mm, w_k = 0,1335 mm', () => {
    const c = cel(dalle(), 'ec2-2004');
    expect(c.intermediaires['h_c,ef'].valeur).toBeCloseTo(54.928, 2);
    expect(c.intermediaires['s_r,max'].valeur).toBeCloseTo(230.22, 1);
    expect(c.sollicitation).toBeCloseTo(0.13345, 4);
    expect(c.taux).toBeCloseTo(0.13345 / 0.3, 3);
  });

  it('deuxieme generation : s_r,m,cal = 120,6 mm, k_1/r = 1,223, k_w = 1,7, w_k,cal = 0,1454 mm', () => {
    const c = cel(dalle(), 'ec2-2023');
    expect(c.intermediaires['h_c,eff'].valeur).toBe(90);
    expect(c.intermediaires['b_c,eff'].valeur).toBe(800);
    expect(c.intermediaires.k_fl.valeur).toBeCloseTo(0.590909, 5);
    expect(c.intermediaires['s_r,m,cal'].valeur).toBeCloseTo(120.64, 1);
    expect(c.intermediaires['k_1/r'].valeur).toBeCloseTo(1.22258, 4);
    expect(c.intermediaires.k_w.valeur).toBe(1.7);
    expect(c.sollicitation).toBeCloseTo(0.14535, 4);
  });

  it('le plancher (1 - k_t) sigma_s / E_s gouverne dans les deux generations', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      expect(cel(dalle(), g).intermediaires['ε_sm − ε_cm'].valeur).toBeCloseTo((0.6 * 193.2302) / 200000, 7);
    }
  });

  it('d >= h est hors du domaine', () => {
    expect(cel({ ...dalle(), d: 230 }, 'ec2-2023').statut).toEqual({ etat: 'hors-domaine', motif: 'motif.d-sup-h' });
  });
});
