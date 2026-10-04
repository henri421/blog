import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { materiauxBeton } from '../../../src/noyau/mecanismes/materiaux/index';

// Valeurs attendues calculees a la main (docs/validation/materiaux.md).

const cel = (fck: number, chargeTardive: string, g: string) =>
  calculerMatrice(materiauxBeton, { fck, chargeTardive }).cellules.find((c) => c.generation === g)!;

describe('proprietes du beton', () => {
  it('C30/37 : f_cd 20,0 contre 17,0 MPa ; f_ctd 1,352 contre 1,081 MPa', () => {
    const a = cel(30, 'non', 'ec2-2004');
    const b = cel(30, 'non', 'ec2-2023');
    expect(a.resistance).toBeCloseTo(20, 12);
    expect(b.resistance).toBeCloseTo(17, 12);
    expect(a.intermediaires.f_ctd.valeur).toBeCloseTo(1.351685, 5);
    expect(b.intermediaires.f_ctd.valeur).toBeCloseTo(1.081348, 5);
    expect(a.intermediaires.E_cm.valeur).toBeCloseTo(32836.57, 1);
    expect(b.intermediaires.E_cm.valeur).toBeCloseTo(31938.77, 1);
  });

  it('C30/37 charge tardive : k_tc = 1 et f_cd = 20,0 MPa dans les deux generations', () => {
    expect(cel(30, 'oui', 'ec2-2023').resistance).toBeCloseTo(20, 12);
  });

  it('C70/85 : eta_cc = 0,830, f_cd 46,67 contre 32,92 MPa ; f_ctm 4,610 contre 4,533 MPa', () => {
    const a = cel(70, 'non', 'ec2-2004');
    const b = cel(70, 'non', 'ec2-2023');
    expect(b.intermediaires['η_cc'].valeur).toBeCloseTo(0.829827, 5);
    expect(a.resistance).toBeCloseTo(46.666667, 5);
    expect(b.resistance).toBeCloseTo(32.916452, 5);
    expect(a.intermediaires.f_ctm.valeur).toBeCloseTo(4.610474, 5);
    expect(b.intermediaires.f_ctm.valeur).toBeCloseTo(4.533414, 5);
  });
});
