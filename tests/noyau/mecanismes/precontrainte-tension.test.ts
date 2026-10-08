import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { precontrainteTension } from '../../../src/noyau/mecanismes/precontrainte-tension/index';

// Valeurs attendues calculees a la main (docs/validation/precontrainte-tension.md).

const cable = { fpk: 1860, fp01k: 1640, sigmaPmax: 1450, mu: 0.19, theta: 0.3, k: 0.007, x: 30 };
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(precontrainteTension, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('mise en tension et frottement', () => {
  it('limite min(0,8 x 1860 ; 0,9 x 1640) = 1476 MPa dans les deux generations', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) expect(cel(cable, g, 'limite').resistance).toBeCloseTo(1476, 10);
  });

  it('frottement a 30 m : 1450 (1 - exp(-0,19 x 0,51)) = 133,9 MPa', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) expect(cel(cable, g, 'frottement').sollicitation).toBeCloseTo(133.912, 2);
  });
});
