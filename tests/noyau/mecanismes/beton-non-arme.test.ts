import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { nonArmeCompression, nonArmeTranchant, semelleNonArmee } from '../../../src/noyau/mecanismes/beton-non-arme/index';
import type { Mecanisme } from '../../../src/noyau/moteur/mecanisme';

// Valeurs attendues calculees a la main (docs/validation/beton-non-arme.md).

const cel = <E>(m: Mecanisme<E>, e: E, g: string, n = 'base') =>
  calculerMatrice(m, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('beton non arme, effort normal excentre', () => {
  const voile = { fck: 25, b: 1000, h: 200, e: 20, NEd: 1500 };
  it('C25/30 : f_cd,pl = 13,33 et 11,33 MPa, N_Rd = 2133,3 et 1813,3 kN', () => {
    expect(cel(nonArmeCompression, voile, 'ec2-2004').resistance).toBeCloseTo(2133.333, 2);
    expect(cel(nonArmeCompression, voile, 'ec2-2023').resistance).toBeCloseTo(1813.333, 2);
  });
  it('e >= h/2 : non applicable', () => {
    expect(cel(nonArmeCompression, { ...voile, e: 100 }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.na-excentricite' });
  });
  it('2004 au-dela de C50/60 : eta = 1 - (f_ck - 50)/200', () => {
    expect(cel(nonArmeCompression, { ...voile, fck: 70 }, 'ec2-2004').intermediaires['η'].valeur).toBeCloseTo(0.9, 12);
  });

  const elance = { ...voile, l0: 2700, phiEff: 1.5 };
  it('voile elance 2004 (12.11) : e_tot = 26,75 mm, Phi = 0,56505, N_Rd = 1506,8 kN', () => {
    const c = cel(nonArmeCompression, elance, 'ec2-2004', 'elance');
    expect(c.intermediaires.e_tot.valeur).toBeCloseTo(26.75, 12);
    expect(c.intermediaires['Φ'].valeur).toBeCloseTo(0.56505, 10);
    expect(c.resistance).toBeCloseTo(1506.8, 6);
  });
  it('voile elance 2023 (14.11) : Phi = 0,68301 / 1,50755 = 0,45306, N_Rd = 1026,94 kN', () => {
    const c = cel(nonArmeCompression, elance, 'ec2-2023', 'elance');
    expect(c.intermediaires['numérateur (14.11)'].valeur).toBeCloseTo(0.6830125, 9);
    expect(c.intermediaires['dénominateur (14.11)'].valeur).toBeCloseTo(1.5075503, 6);
    expect(c.resistance).toBeCloseTo(1026.93864, 4);
  });
  it('voile elance : l_0/h > 25 ou f_ck >= 55 MPa en 2023, non applicable', () => {
    expect(cel(nonArmeCompression, { ...elance, l0: 5200 }, 'ec2-2004', 'elance').statut).toMatchObject({ motif: 'motif.na-elance-l0h' });
    expect(cel(nonArmeCompression, { ...elance, fck: 60 }, 'ec2-2023', 'elance').statut).toMatchObject({ motif: 'motif.na-elance-fck' });
  });
});

describe('beton non arme, effort tranchant', () => {
  const e = { fck: 25, NEd: 500, VEd: 100, Acc: 200000 };
  it('sigma_cp = 2,5 MPa < sigma_c,lim : tau_Rd = 1,820 et 1,582 MPa pour tau_cp = 0,75', () => {
    const a = cel(nonArmeTranchant, e, 'ec2-2004');
    expect(a.intermediaires['σ_c,lim'].valeur).toBeCloseTo(5.9347, 4);
    expect(a.resistance).toBeCloseTo(1.8196, 4);
    expect(cel(nonArmeTranchant, e, 'ec2-2023').resistance).toBeCloseTo(1.5818, 4);
    expect(a.sollicitation).toBeCloseTo(0.75, 12);
  });
  it('sigma_cp = 8 MPa > sigma_c,lim : 2,7407 et 2,1948 MPa', () => {
    const fort = { ...e, NEd: 1600 };
    expect(cel(nonArmeTranchant, fort, 'ec2-2004').resistance).toBeCloseTo(2.7407, 4);
    expect(cel(nonArmeTranchant, fort, 'ec2-2023').resistance).toBeCloseTo(2.1948, 4);
  });
});

describe('semelle non armee', () => {
  const s = { fck: 25, sigmaGd: 300, aF: 400, hF: 500 };
  it('h_F,min = 456,2 mm (2004) et 510,1 mm (2023) ; simplifie 800 mm', () => {
    expect(cel(semelleNonArmee, s, 'ec2-2004', 'pression').sollicitation).toBeCloseTo(456.219, 2);
    expect(cel(semelleNonArmee, s, 'ec2-2023', 'pression').sollicitation).toBeCloseTo(510.068, 2);
    expect(cel(semelleNonArmee, s, 'ec2-2023', 'simplifie').sollicitation).toBe(800);
  });
});
