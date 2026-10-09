import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { redistribution, type EntreeRedistribution } from '../../../src/noyau/mecanismes/redistribution/index';

// Valeurs attendues calculees a la main (docs/validation/redistribution.md).

const poutre = (): EntreeRedistribution => ({
  Mel: 306.25,
  Mred: 245,
  L1: 7000,
  L2: 7000,
  b: 300,
  d: 540,
  As: 1473,
  fck: 30,
  fyk: 500,
  classe: 'B',
});

const cel = (e: EntreeRedistribution, g: string) => calculerMatrice(redistribution, e).cellules.find((c) => c.generation === g)!;

describe('redistribution, poutre continue de 2 x 7 m, 20 %', () => {
  it('2004 : x_u = 131,85 mm, (5.10a) = 0,7452 <= 0,80 passe', () => {
    const c = cel(poutre(), 'ec2-2004');
    expect(c.intermediaires.x_u.valeur).toBeCloseTo(131.8542, 3);
    expect(c.intermediaires['(5.10)'].valeur).toBeCloseTo(0.745218, 5);
    expect(c.sollicitation).toBeCloseTo(0.745218, 5);
    expect(c.resistance).toBeCloseTo(0.8, 12);
  });

  it('2023 : x_u = 155,12 mm, (7.16) = 0,4701 + 0,2873 = 0,7574 passe', () => {
    const c = cel(poutre(), 'ec2-2023');
    expect(c.intermediaires.x_u.valeur).toBeCloseTo(155.1226, 3);
    expect(c.intermediaires['1/(1 + 0,7 ε_cu E_s/f_yd)'].valeur).toBeCloseTo(0.470146, 5);
    expect(c.sollicitation).toBeCloseTo(0.75741, 5);
  });

  it('C60/75 : k3 = 0,54 et k4 = 1,357 en 2004, borne 0,7 atteinte en 2023', () => {
    const e = { ...poutre(), fck: 60 };
    const a = cel(e, 'ec2-2004');
    expect(a.intermediaires.k3.valeur).toBe(0.54);
    expect(a.sollicitation).toBeCloseTo(0.733353, 5);
    const b = cel(e, 'ec2-2023');
    expect(b.intermediaires['(7.16)'].valeur).toBeCloseTo(0.634563, 5);
    expect(b.sollicitation).toBe(0.7);
  });

  it('classe A : borne 0,8', () => {
    expect(cel({ ...poutre(), fck: 60, classe: 'A' }, 'ec2-2023').sollicitation).toBe(0.8);
  });

  it('portees adjacentes dans un rapport superieur a 2 : non applicable', () => {
    expect(cel({ ...poutre(), L1: 3000 }, 'ec2-2004').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.portees-adjacentes',
      donneesManquantes: [],
    });
  });

  it('le niveau rotation sans ses donnees propres est non applicable, sans gener la base', () => {
    const cs = calculerMatrice(redistribution, poutre()).cellules;
    const r = cs.find((x) => x.niveau === 'rotation')!;
    expect(r.statut.etat).toBe('non-applicable');
    expect(cs.find((x) => x.generation === 'ec2-2023' && x.niveau === 'base')!.statut.etat).toBe('calcule');
  });
});

/** Appui de la meme poutre arme pour le moment redistribue : 4 HA20, cadres rho_w = 0,17 %. */
const appui = (): EntreeRedistribution => ({
  ...poutre(),
  As: Math.PI * 20 ** 2,
  h: 600,
  phi: 20,
  c: 50,
  rhoW: 0.17,
  k: 1.08,
  epsUk: 50,
  thetaEd: 2,
});

const rot = (e: EntreeRedistribution) => calculerMatrice(redistribution, e).cellules.find((c) => c.niveau === 'rotation')!;

describe('capacite de rotation (7.3.2(5)), 2023', () => {
  it('rupture cote beton : x_u = 134,20 mm, f_s,ef = 440,90 MPa, M_Rd = 268,26 kN.m', () => {
    const c = rot(appui());
    expect(c.generation).toBe('ec2-2023');
    expect(c.statut.etat).toBe('calcule');
    expect(c.intermediaires.x_u.valeur).toBeCloseTo(134.19888, 3);
    expect(c.intermediaires['f_s,ef'].valeur).toBeCloseTo(440.89873, 3);
    expect(c.intermediaires['ε_ud,ef'].valeur).toBeCloseTo(10.583575, 4);
    expect(c.intermediaires.M_Rd.valeur).toBeCloseTo(268.25854, 3);
  });

  it('plastification : x_y = 205,90 mm, M_y = 254,84 kN.m, TS_My = 0,8773', () => {
    const c = rot(appui());
    expect(c.intermediaires.x_y.valeur).toBeCloseTo(205.9011, 3);
    expect(c.intermediaires.M_y.valeur).toBeCloseTo(254.84244, 3);
    expect(c.intermediaires.M_cr.valeur).toBeCloseTo(52.136427, 4);
    expect(c.intermediaires.TS_My.valeur).toBeCloseTo(0.8772502, 6);
  });

  it('s_r,m,cal = 145,03 mm, alpha = 0,1244, TS_Mu = 0,2370 (7.22)', () => {
    const c = rot(appui());
    expect(c.intermediaires['h_c,eff'].valeur).toBeCloseTo(160, 9);
    expect(c.intermediaires['s_r,m,cal'].valeur).toBeCloseTo(145.028175, 4);
    expect(c.intermediaires['α (7.24)'].valeur).toBeCloseTo(0.1243693, 6);
    expect(c.intermediaires.TS_Mu.valeur).toBeCloseTo(0.2370028, 6);
    expect(c.clauses).toContain('(7.22)');
  });

  it('theta_Rd = 2,632 mrad pour theta_Ed = 2 mrad : taux 0,760', () => {
    const c = rot(appui());
    expect(c.intermediaires['ε_cu,d,ρw'].valeur).toBeCloseTo(9.6, 9);
    expect(c.resistance).toBeCloseTo(2.6315775, 5);
    expect(c.sollicitation).toBe(2);
    expect(c.taux).toBeCloseTo(2 / 2.6315775, 5);
  });

  it('rupture cote acier (classe A, 4 HA12) : x_u = 55,09 mm, theta_Rd = 0,9325 mrad', () => {
    const e = { ...appui(), As: Math.PI * 12 ** 2, phi: 12, c: 54, k: 1.05, epsUk: 25 };
    const c = rot(e);
    expect(c.intermediaires['ε_ud,ef'].valeur).toBeCloseTo(21.73913, 4);
    expect(c.intermediaires.x_u.valeur).toBeCloseTo(55.090296, 3);
    expect(c.intermediaires.M_Rd.valeur).toBeCloseTo(106.35825, 3);
    expect(c.intermediaires.M_y.valeur).toBeCloseTo(97.532076, 3);
    expect(c.resistance).toBeCloseTo(0.93246106, 6);
  });

  it('epsilon_cu,d,rho_w plafonne a 15 pour mille', () => {
    expect(rot({ ...appui(), rhoW: 1 }).intermediaires['ε_cu,d,ρw'].valeur).toBeCloseTo(15, 9);
  });
});
