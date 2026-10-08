import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { coefficientsPartiels } from '../../../src/noyau/mecanismes/coefficients-partiels/index';

// Valeurs attendues calculees a la main (docs/validation/coefficients-partiels.md).

const base = { fck: 30, fyk: 500, situation: 'durable', sansTubage: 'non' };
const cel = (e: object, g: string) => calculerMatrice(coefficientsPartiels, e).cellules.find((c) => c.generation === g)!;

describe('coefficients partiels', () => {
  it('C30, situation durable : f_cd = 20,0 (2004) et 17,0 MPa (2023), f_yd = 434,8 MPa', () => {
    expect(cel(base, 'ec2-2004').resistance).toBeCloseTo(20, 10);
    expect(cel(base, 'ec2-2023').resistance).toBeCloseTo(17, 10);
    expect(cel(base, 'ec2-2023').intermediaires.f_yd.valeur).toBeCloseTo(434.783, 3);
  });

  it('accidentelle : gamma_c = 1,2 (2004) et 1,15 (2023), f_yd = f_yk', () => {
    const e = { ...base, situation: 'accidentelle' };
    expect(cel(e, 'ec2-2004').resistance).toBeCloseTo(25, 10);
    expect(cel(e, 'ec2-2023').resistance).toBeCloseTo(22.1739, 4);
    expect(cel(e, 'ec2-2023').intermediaires['γ_V'].valeur).toBe(1.15);
    expect(cel(e, 'ec2-2004').intermediaires.f_yd.valeur).toBe(500);
  });

  it('pieu sans tubage : gamma_c x 1,1', () => {
    const e = { ...base, sansTubage: 'oui' };
    expect(cel(e, 'ec2-2004').resistance).toBeCloseTo(18.1818, 4);
    expect(cel(e, 'ec2-2023').resistance).toBeCloseTo(15.4545, 4);
  });

  it('C60 en 2023 : eta_cc = (40/60)^(1/3), f_cd = 29,70 MPa', () => {
    expect(cel({ ...base, fck: 60 }, 'ec2-2023').resistance).toBeCloseTo(29.7017, 4);
  });
});
