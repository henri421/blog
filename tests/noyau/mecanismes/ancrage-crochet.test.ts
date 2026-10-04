import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { ancrageCrochet, type EntreeAncrageCrochet } from '../../../src/noyau/mecanismes/ancrage-crochet/index';

// Valeurs attendues calculees a la main (docs/validation/ancrage-crochet.md).

const poutre = (): EntreeAncrageCrochet => ({ phi: 16, fck: 25, fyk: 500, sigmaSd: 300, adherence: 'bonne', cs: 100, cx: 30, cy: 30, lDispo: 450 });
const massif = (): EntreeAncrageCrochet => ({ ...poutre(), cs: 150, cx: 60, cy: 60 });

const cel = (e: EntreeAncrageCrochet, g: string, n: string) =>
  calculerMatrice(ancrageCrochet, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('crochet en about de poutre (enrobage 30 mm)', () => {
  it('2004 : c_d < 3 phi, alpha_1 = alpha_2 = 1, l_bd = 645,7 puis 445,6 mm', () => {
    const c = cel(poutre(), 'ec2-2004', 'barre-plastifiee');
    expect(c.intermediaires['α_1'].valeur).toBe(1);
    expect(c.intermediaires['α_2'].valeur).toBe(1);
    expect(c.sollicitation).toBeCloseTo(645.746, 2);
    expect(cel(poutre(), 'ec2-2004', 'contrainte-reelle').sollicitation).toBeCloseTo(445.565, 2);
  });

  it('2023 : 663,8 - 240 = 423,8 mm ; a 300 MPa, plancher 10 phi = 160 mm', () => {
    expect(cel(poutre(), 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(423.752, 2);
    expect(cel(poutre(), 'ec2-2023', 'contrainte-reelle').sollicitation).toBe(160);
  });
});

describe('crochet en massif (enrobage 60 mm)', () => {
  it('2004 : alpha_1 = 0,7, alpha_2 = 0,8875, l_bd = 401,2 mm', () => {
    const c = cel(massif(), 'ec2-2004', 'barre-plastifiee');
    expect(c.intermediaires['α_1'].valeur).toBe(0.7);
    expect(c.intermediaires['α_2'].valeur).toBeCloseTo(0.8875, 12);
    expect(c.sollicitation).toBeCloseTo(0.7 * 0.8875 * 645.746, 2);
  });

  it('2023 : c_d plafonne a 3,75 phi = 60 mm, l_bd = 469,3 - 240 = 229,3 mm', () => {
    expect(cel(massif(), 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(229.344, 2);
  });
});
