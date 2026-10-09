import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { mandrin } from '../../../src/noyau/mecanismes/mandrin/index';

// Valeurs attendues calculees a la main (docs/validation/mandrin.md).

const crosse = { phi: 20, phiMand: 140, fck: 30, sigmaSd: 500 / 1.15, ab: 60 };
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(mandrin, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('mandrins de cintrage', () => {
  it('endommagement : 7 phi = 140 mm pour un HA20, 4 phi = 48 mm pour un HA12, dans les deux generations', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      expect(cel(crosse, g, 'dommage').sollicitation).toBe(140);
      expect(cel({ phi: 12, phiMand: 48 }, g, 'dommage').sollicitation).toBe(48);
    }
  });

  it('beton 2004 (8.1) : F_bt = 136,6 kN, phi_m,min = 284,6 mm', () => {
    const c = cel(crosse, 'ec2-2004', 'beton');
    expect(c.intermediaires.F_bt.valeur).toBeCloseTo(136.591, 2);
    expect(c.sollicitation).toBeCloseTo(284.565, 2);
  });

  it('f_cd plafonnee au C55/67 : 155,2 mm pour un C70/85', () => {
    expect(cel({ ...crosse, fck: 70 }, 'ec2-2004', 'beton').sollicitation).toBeCloseTo(155.217, 2);
  });

  it('beton 2023 (11.1) : k_bend = 16, sigma_lim = 345,13 MPa < 434,78 MPa', () => {
    const e = { ...crosse, cd: 50, Dlower: 16, alphaBend: 90 };
    const c = cel(e, 'ec2-2023', 'beton');
    expect(c.intermediaires.k_bend.valeur).toBeCloseTo(16, 12);
    expect(c.intermediaires['terme du béton confiné'].valeur).toBeCloseTo(267.77924, 4);
    expect(c.resistance).toBeCloseTo(345.129239, 5);
    expect(c.taux).toBeCloseTo(1.2597675, 6);
  });

  it('beton 2023 (11.2) : 2 HA14 dans la courbure, k_trans = 1,28, sigma_lim = 441,77 MPa', () => {
    const e = { ...crosse, cd: 50, Dlower: 16, alphaBend: 90, nTrans: 2, phiTrans: 14 };
    const c = cel(e, 'ec2-2023', 'beton-trans');
    expect(c.intermediaires.k_trans.valeur).toBeCloseTo(1.28, 12);
    expect(c.resistance).toBeCloseTo(441.765426, 5);
    expect(c.taux).toBeCloseTo(0.98419338, 7);
  });

  it('beton 2023 : phi_trans plafonne a 1,35 phi ; HA20 sur 4 phi, c_d = 2,5 phi : 285,07 MPa', () => {
    const e = { ...crosse, phiMand: 80, cd: 50, Dlower: 16, alphaBend: 90, nTrans: 1, phiTrans: 40 };
    expect(cel(e, 'ec2-2023', 'beton-trans').intermediaires['φ_trans retenu'].valeur).toBeCloseTo(27, 12);
    expect(cel(e, 'ec2-2023', 'beton').resistance).toBeCloseTo(285.073191, 5);
  });

  it('sans sigma_sd ni a_b, seul le niveau d endommagement est calcule', () => {
    const c = cel({ phi: 12, phiMand: 48 }, 'ec2-2004', 'beton');
    expect(c.statut.etat).toBe('non-applicable');
  });
});
