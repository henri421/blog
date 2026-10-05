import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { courbureNominale, elancementLimite, rigiditeNominale, type EntreeSecondOrdre } from '../../../src/noyau/mecanismes/second-ordre/index';

// Valeurs attendues calculees a la main (docs/validation/second-ordre.md).

const poteau = (): EntreeSecondOrdre => ({
  b: 400,
  h: 400,
  d: 350,
  As: 2513,
  fck: 30,
  fyk: 500,
  l: 6000,
  l0: 6000,
  NEd: 2000,
  M01: 40,
  M02: 80,
  phiEff: 1.2,
  contrevente: 'oui',
});
const cel = (m: typeof courbureNominale, e: EntreeSecondOrdre, g: string, n: string) =>
  calculerMatrice(m, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('second ordre, poteau contreventé 400 x 400, l0 = 6 m', () => {
  it('elancement : lambda = 51,96 ; lambda_lim = 31,76 (2004), 30,31 (2023, en reserve)', () => {
    const a = cel(elancementLimite, poteau(), 'ec2-2004', 'base');
    expect(a.sollicitation).toBeCloseTo(51.9615, 4);
    expect(a.resistance).toBeCloseTo(31.7597, 4);
    const b = cel(elancementLimite, poteau(), 'ec2-2023', 'base');
    expect(b.statut).toEqual({ etat: 'reserve', motif: 'reserve.annexe-o' });
    expect(b.resistance).toBeCloseTo(30.3112, 4);
  });

  it('courbure nominale 2004 : M_0e = 94, M_2 = 89,57, M_Ed = 183,57 kN.m', () => {
    const c = cel(courbureNominale, poteau(), 'ec2-2004', 'courbure');
    expect(c.intermediaires.K_r.valeur).toBeCloseTo(0.761, 5);
    expect(c.intermediaires['K_φ'].valeur).toBeCloseTo(1.18431, 5);
    expect(c.intermediaires.M_2.valeur).toBeCloseTo(89.5666, 3);
    expect(c.resistance).toBeCloseTo(183.5666, 3);
  });

  it('courbure nominale 2023 : c = 8 ; k_r = 1 -> 248,47 ; k_r = 0,665 -> 196,77 kN.m', () => {
    const a = cel(courbureNominale, poteau(), 'ec2-2023', 'kr-1');
    expect(a.intermediaires.c.valeur).toBe(8);
    expect(a.intermediaires.C_m.valeur).toBeCloseTo(0.854545, 5);
    expect(a.resistance).toBeCloseTo(248.4749, 3);
    const b = cel(courbureNominale, poteau(), 'ec2-2023', 'kr-precis');
    expect(b.intermediaires.k_r.valeur).toBeCloseTo(0.66527, 5);
    expect(b.resistance).toBeCloseTo(196.768, 3);
  });

  it('non contreventé : c = 10, e_i = theta_i l_0 / 2, M_0Ed = M_02', () => {
    const c = cel(courbureNominale, { ...poteau(), contrevente: 'non' }, 'ec2-2023', 'kr-precis');
    expect(c.intermediaires.c.valeur).toBe(10);
    expect(c.intermediaires.e_i.valeur).toBeCloseTo(((2 / Math.sqrt(6) / 200) * 6000) / 2, 10);
    expect(c.intermediaires.M_0Ed.valeur).toBeCloseTo(c.intermediaires["M_02'"].valeur, 12);
  });

  it('effort normal superieur a n_u : K_r non applicable', () => {
    expect(cel(courbureNominale, { ...poteau(), NEd: 8000 }, 'ec2-2004', 'courbure').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.n-sup-nu',
      donneesManquantes: [],
    });
  });
});

describe('rigidite nominale et majoration des moments', () => {
  it('2004 : N_B = 4 802 kN, M_Ed = 176,77 ; forme simplifiee 325,76 kN.m', () => {
    const a = cel(rigiditeNominale, poteau(), 'ec2-2004', 'base');
    expect(a.intermediaires.N_B.valeur).toBeCloseTo(4802.3242, 2);
    expect(a.resistance).toBeCloseTo(176.7655, 3);
    expect(cel(rigiditeNominale, poteau(), 'ec2-2004', 'simplifiee').resistance).toBeCloseTo(325.7556, 3);
  });

  it('2023 : E_cd = E_cm / 1,5, EI = 0,4 E_cd I_c, M_Ed = 171,80 kN.m, en reserve', () => {
    const c = cel(rigiditeNominale, poteau(), 'ec2-2023', 'base');
    expect(c.statut.etat).toBe('reserve');
    expect(c.intermediaires.E_cd.valeur).toBeCloseTo(21292.5109, 3);
    expect(c.resistance).toBeCloseTo(171.7968, 3);
  });

  it('N_Ed au-dela de N_B : non applicable ; rho < 1 % : forme simplifiee non applicable', () => {
    expect(cel(rigiditeNominale, { ...poteau(), NEd: 6000 }, 'ec2-2023', 'base').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.nb-inf-ned',
      donneesManquantes: [],
    });
    expect(cel(rigiditeNominale, { ...poteau(), As: 1257 }, 'ec2-2004', 'simplifiee').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.rho-inf-001',
      donneesManquantes: [],
    });
  });
});
