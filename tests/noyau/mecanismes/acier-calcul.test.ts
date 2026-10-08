import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { acierCalcul } from '../../../src/noyau/mecanismes/acier-calcul/index';

// Valeurs attendues calculees a la main (docs/validation/acier-calcul.md).

const b500b = { fyk: 500, k: 1.08, epsUk: 50 };
const cel = (e: object, g: string) => calculerMatrice(acierCalcul, e).cellules.find((c) => c.generation === g)!;

describe('diagramme de calcul de l acier', () => {
  it('B500B : eps_ud = 45 (2004) et 43,48 pour mille (2023)', () => {
    expect(cel(b500b, 'ec2-2004').intermediaires['ε_ud'].valeur).toBeCloseTo(45, 10);
    expect(cel(b500b, 'ec2-2023').intermediaires['ε_ud'].valeur).toBeCloseTo(43.4783, 4);
  });

  it('contrainte a eps_ud : 465,93 et 464,82 MPa', () => {
    expect(cel(b500b, 'ec2-2004').resistance).toBeCloseTo(465.9289, 3);
    expect(cel(b500b, 'ec2-2023').resistance).toBeCloseTo(464.8221, 3);
  });
});
