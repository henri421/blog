import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { poinconnement, type EntreePoinconnement } from '../../../src/noyau/mecanismes/poinconnement/index';

// Valeurs attendues calculees a la main (docs/validation/poinconnement.md).

/** Plancher-dalle de 24 cm, poteau 30 x 30, HA14/150 dans les deux sens, portees de 6 m. */
const plancher = (): EntreePoinconnement => ({
  VEd: 360,
  c1: 300,
  c2: 300,
  dx: 205,
  dy: 190,
  Asx: 1026,
  Asy: 1026,
  fck: 30,
  fyk: 500,
  Dlower: 16,
  apx: 1320,
  apy: 1320,
});

const cel = (e: EntreePoinconnement, g: string, n: string) =>
  calculerMatrice(poinconnement, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('poinconnement, plancher-dalle', () => {
  it('premiere generation : controle a 2d, V_Rd = 379,16 kN', () => {
    const c = cel(plancher(), 'ec2-2004', 'base');
    expect(c.intermediaires.u_1.valeur).toBeCloseTo(3681.86, 1);
    expect(c.intermediaires['ρ_l'].valeur).toBeCloseTo(0.0051987, 6);
    expect(c.intermediaires['v_Rd,c'].valeur).toBeCloseTo(0.59963, 4);
    expect(c.intermediaires['V_Rd,max (u_0)'].valeur).toBeCloseTo(870.51, 1);
    expect(c.resistance).toBeCloseTo(379.16, 1);
  });

  it('deuxieme generation, resistance minimale : tau_Rdc,min = 0,8308 MPa, V_Rd = 259,74 kN', () => {
    const c = cel(plancher(), 'ec2-2023', 'tau-min');
    expect(c.intermediaires['τ_Rdc,min'].valeur).toBeCloseTo(0.83077, 4);
    expect(c.intermediaires['τ_Ed'].valeur).toBeCloseTo(1.15147, 4);
    expect(c.resistance).toBeCloseTo(259.74, 1);
  });

  it('a_p >= 8 d_v : le niveau a_pd est non applicable (8.4.3(2))', () => {
    expect(cel({ ...plancher(), apx: 1600, apy: 1600 }, 'ec2-2023', 'moment-nul').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.ap-sup-8dv',
      donneesManquantes: [],
    });
  });

  it('deuxieme generation, niveau 1 : b_0,5 = 1820,5 mm, k_pb = 2,102, V_Rd = 383,57 kN', () => {
    const c = cel(plancher(), 'ec2-2023', 'hauteur-utile');
    expect(c.intermediaires['b_0,5'].valeur).toBeCloseTo(1820.46, 1);
    expect(c.intermediaires.k_pb.valeur).toBeCloseTo(2.1017, 4);
    expect(c.intermediaires['τ_Rd,c'].valeur).toBeCloseTo(1.22685, 4);
    expect(c.resistance).toBeCloseTo(383.57, 1);
  });

  it('deuxieme generation, niveau 2 : a_pd = 180,5 mm, V_Rd = 395,24 kN', () => {
    const c = cel(plancher(), 'ec2-2023', 'moment-nul');
    expect(c.intermediaires.a_pd.valeur).toBeCloseTo(180.52, 2);
    expect(c.resistance).toBeCloseTo(395.24, 1);
  });

  it('sans distances au moment nul, le niveau 2 nomme les deux donnees', () => {
    const c = cel({ ...plancher(), apx: undefined, apy: undefined }, 'ec2-2023', 'moment-nul');
    expect(c.statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.donnees-manquantes',
      donneesManquantes: ['champ.apx', 'champ.apy'],
    });
  });

  it('un poteau dont un cote depasse 3 d est hors du domaine de l outil', () => {
    for (const c of calculerMatrice(poinconnement, { ...plancher(), c1: 700 }).cellules) {
      expect(c.statut).toEqual({ etat: 'hors-domaine', motif: 'motif.poteau-allonge' });
    }
  });

  it('le plafond 0,5/gamma_V fck^(1/2) borne tau_Rd,c', () => {
    const c = cel({ ...plancher(), Asx: 6000, Asy: 6000 }, 'ec2-2023', 'hauteur-utile');
    expect(c.intermediaires['τ_Rd,c'].valeur).toBeCloseTo((0.5 / 1.4) * Math.sqrt(30), 12);
  });
});
