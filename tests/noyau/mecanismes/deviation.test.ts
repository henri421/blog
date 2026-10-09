import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { deviation } from '../../../src/noyau/mecanismes/deviation/index';

// Valeurs attendues calculees a la main (docs/validation/deviation.md).

const membrure = { Ftd: (Math.PI * 100 * 500) / 1150, r: 2500, phi: 20, cs: 100, cy: 35, fck: 30, fyk: 500, lsd: 600, ls: 750 };
const cel = (e: object, g: string, n: string) => calculerMatrice(deviation, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('efforts de deviation (11.7)', () => {
  it('(11.24) : c_u = 100 mm, 0,5464 MPa pour 0,4564 MPa, taux 1,1970', () => {
    const c = cel(membrure, 'ec2-2023', 'beton');
    expect(c.intermediaires.c_u.valeur).toBe(100);
    expect(c.sollicitation).toBeCloseTo(0.546364, 6);
    expect(c.resistance).toBeCloseTo(0.4564355, 7);
    expect(c.taux).toBeCloseTo(1.1970234, 6);
    expect(c.intermediaires['armature transversale F_td/(r f_yd)'].valeur).toBeCloseTo(125.66371, 4);
  });

  it('c_u gouverne par l enrobage : c_y = 20 mm, 2 racine(3) x 30 = 103,9 mm', () => {
    const c = cel({ ...membrure, cs: 200, cy: 20 }, 'ec2-2023', 'beton');
    expect(c.intermediaires.c_u.valeur).toBeCloseTo(2 * Math.sqrt(3) * 30, 9);
  });

  it('(11.25) : 1,1970 + 0,8 = 1,9970', () => {
    const c = cel(membrure, 'ec2-2023', 'recouvrement');
    expect(c.intermediaires['γ_C 8 F_td / (r c_u √f_ck)'].valeur).toBeCloseTo(1.1970234, 6);
    expect(c.sollicitation).toBeCloseTo(1.9970234, 6);
    expect(c.resistance).toBe(1);
  });

  it('2004 : sans equivalent', () => {
    expect(cel(membrure, 'ec2-2004', 'sans-equivalent').statut).toMatchObject({ motif: 'motif.sans-equivalent-2004' });
  });
});
