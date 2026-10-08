import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { pertesDifferees } from '../../../src/noyau/mecanismes/pertes-differees/index';

// Valeurs attendues calculees a la main (docs/validation/pertes-differees.md).

const poutre = { fck: 35, epsCs: 0.3, phi: 2, dSigmaPr: 60, sigmaCQP: 8, Ep: 195000, Ap: 2800, Ac: 480000, Ic: 6.4e10, zcp: 450 };
const cel = (e: object, g: string) => calculerMatrice(pertesDifferees, e).cellules.find((c) => c.generation === g)!;

describe('pertes differees', () => {
  it('C35/45 : E_cm = 34 077 (2004) et 33 282 MPa (2023), pertes 162,5 et 163,6 MPa', () => {
    const a = cel(poutre, 'ec2-2004');
    expect(a.intermediaires.E_cm.valeur).toBeCloseTo(34077.146, 2);
    expect(a.sollicitation).toBeCloseTo(162.5285, 3);
    expect(cel(poutre, 'ec2-2023').sollicitation).toBeCloseTo(163.6219, 3);
  });
});
