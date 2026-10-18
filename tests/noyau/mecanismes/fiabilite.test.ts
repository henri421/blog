import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { fiabilite, phi } from '../../../src/noyau/mecanismes/fiabilite/index';

// Valeurs attendues calculees independamment (Python, statistics.NormalDist),
// docs/validation/fiabilite.md.

const cel = (e: object, g: string) => calculerMatrice(fiabilite, e).cellules.find((c) => c.generation === g)!;

describe('indice de fiabilite (EN 1990, annexe C)', () => {
  it('phi : beta = 3,72 pour P_f = 1e-4', () => {
    expect(phi(-3.719016)).toBeCloseTo(1e-4, 9);
  });

  it('CC2 : beta_1 = 4,7 donne beta_50 = 3,826 dans les deux generations', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) expect(cel({ cc: 'CC2', T: 50 }, g).resistance).toBeCloseTo(3.826314, 4);
  });

  it('CC1 et CC3 sur 50 ans : 3,209 et 4,418 ; CC2 sur 100 ans : 3,652', () => {
    expect(cel({ cc: 'CC1', T: 50 }, 'en1990-2023').resistance).toBeCloseTo(3.208533, 4);
    expect(cel({ cc: 'CC3', T: 50 }, 'en1990-2023').resistance).toBeCloseTo(4.417944, 4);
    expect(cel({ cc: 'CC2', T: 100 }, 'en1990-2023').resistance).toBeCloseTo(3.65206, 4);
  });
});
