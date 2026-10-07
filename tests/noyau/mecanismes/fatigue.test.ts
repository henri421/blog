import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { fatigueAcier, fatigueBeton, fatigueTranchant } from '../../../src/noyau/mecanismes/fatigue/index';
import type { Mecanisme } from '../../../src/noyau/moteur/mecanisme';

// Valeurs attendues calculees a la main (docs/validation/fatigue.md).

const cel = <E>(m: Mecanisme<E>, e: E, g: string) => calculerMatrice(m, e).cellules.find((c) => c.generation === g)!;

describe('fatigue des armatures', () => {
  it('HA16 non soudee, 72 MPa : 70 MPa en 2004 (refuse), 73 MPa en 2023', () => {
    const e = { type: 'non-soudee', phi: 16, deltaSigma: 72 };
    expect(cel(fatigueAcier, e, 'ec2-2004').resistance).toBe(70);
    expect(cel(fatigueAcier, e, 'ec2-2023').resistance).toBe(73);
    expect(cel(fatigueAcier, { ...e, phi: 12 }, 'ec2-2023').resistance).toBe(90);
  });

  it('barres soudees : 35 MPa en 2004 ; 40 ou 30 MPa en 2023 ; coupleur 19 MPa, sans regle en 2004', () => {
    expect(cel(fatigueAcier, { type: 'soudee', phi: 10, deltaSigma: 30 }, 'ec2-2004').resistance).toBe(35);
    expect(cel(fatigueAcier, { type: 'soudee', phi: 10, deltaSigma: 30 }, 'ec2-2023').resistance).toBe(40);
    expect(cel(fatigueAcier, { type: 'soudee', phi: 16, deltaSigma: 30 }, 'ec2-2023').resistance).toBe(30);
    const c = { type: 'coupleur', phi: 25, deltaSigma: 15 };
    expect(cel(fatigueAcier, c, 'ec2-2004').statut).toMatchObject({ motif: 'motif.fatigue-coupleur-2004' });
    expect(cel(fatigueAcier, c, 'ec2-2023').resistance).toBe(19);
  });
});

describe('fatigue du beton comprime', () => {
  const e = { fck: 30, betaCc: 1, sigmaMax: 8, sigmaMin: 3 };
  it('C30/37 : f_cd,fat = 14,96 (2004) et 13,6 MPa (2023), compression admise 8,83 et 8,15 MPa', () => {
    const a = cel(fatigueBeton, e, 'ec2-2004');
    expect(a.intermediaires.f_cd_fat.valeur).toBeCloseTo(14.96, 10);
    expect(a.resistance).toBeCloseTo(8.83, 10);
    const b = cel(fatigueBeton, e, 'ec2-2023');
    expect(b.intermediaires.f_cd_fat.valeur).toBeCloseTo(13.6, 10);
    expect(b.resistance).toBeCloseTo(8.15, 10);
  });

  it('C60/75 : eta_cc,fat = 0,7425, plafond 0,8 en 2004', () => {
    const e60 = { fck: 60, betaCc: 1, sigmaMax: 15, sigmaMin: 10 };
    expect(cel(fatigueBeton, e60, 'ec2-2004').intermediaires.plafond.valeur).toBe(0.8);
    expect(cel(fatigueBeton, e60, 'ec2-2023').intermediaires['η_cc,fat'].valeur).toBeCloseTo(0.742539, 5);
    expect(cel(fatigueBeton, e60, 'ec2-2023').resistance).toBeCloseTo(17.1233, 3);
  });

  it('une compression minimale de traction est prise nulle', () => {
    expect(cel(fatigueBeton, { ...e, sigmaMin: -1 }, 'ec2-2023').resistance).toBeCloseTo(6.8, 10);
  });
});

describe('fatigue a l effort tranchant sans armature', () => {
  it('cycle de meme signe : 0,5 + 0,45 x 0,2 = 0,59, V admis 118 kN', () => {
    const e = { fck: 30, vMax: 100, vMin: 40, vRdc2004: 200, vRdc2023: 200 };
    expect(cel(fatigueTranchant, e, 'ec2-2004').resistance).toBeCloseTo(118, 10);
    expect(cel(fatigueTranchant, e, 'ec2-2023').resistance).toBeCloseTo(118, 10);
  });

  it('signe alterne : 0,5 - 0,15 = 0,35, V admis 70 kN', () => {
    const e = { fck: 30, vMax: 100, vMin: -30, vRdc2004: 200, vRdc2023: 200 };
    expect(cel(fatigueTranchant, e, 'ec2-2023').resistance).toBeCloseTo(70, 10);
  });

  it('C60/75 : plafond 0,8 en 2004, 0,9 en 2023', () => {
    const e = { fck: 60, vMax: 150, vMin: 140, vRdc2004: 170, vRdc2023: 170 };
    expect(cel(fatigueTranchant, e, 'ec2-2004').resistance).toBeCloseTo(136, 10);
    expect(cel(fatigueTranchant, e, 'ec2-2023').resistance).toBeCloseTo(148, 10);
  });
});
