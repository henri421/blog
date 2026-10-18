import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { passerelleFlux } from '../../../src/noyau/mecanismes/passerelle-flux/index';

// Valeurs attendues calculees a la main (docs/validation/passerelle-flux.md).

const beton = { f: 1.9, L: 40, b: 3, m: 6000, xi: 0.015, d: 0.5, psiw: 1, alim: 1.0 };
const cel = (e: object, g: string) => calculerMatrice(passerelleFlux, e).cellules.find((c) => c.generation === g)!;

describe('passerelle sous flux de pietons (EN 1991-2, annexe G)', () => {
  it('beton, TC3 : a = 0,5073 m/s2', () => {
    const c = cel(beton, 'en1991-2-2023');
    expect(c.intermediaires["n'"].valeur).toBeCloseTo(0.0853815, 6);
    expect(c.sollicitation).toBeCloseTo(0.507318, 5);
  });

  it('acier, TC3 : a = 2,636 m/s2 ; TC4 : 9,031 m/s2', () => {
    const acier = { ...beton, m: 2000, xi: 0.005 };
    expect(cel(acier, 'en1991-2-2023').sollicitation).toBeCloseTo(2.636104, 5);
    expect(cel({ ...acier, d: 1.0 }, 'en1991-2-2023').sollicitation).toBeCloseTo(9.031097, 5);
  });

  it('hors plage de frequences et 2003 : non applicable', () => {
    expect(cel({ ...beton, f: 6 }, 'en1991-2-2023').statut.etat).toBe('non-applicable');
    expect(cel(beton, 'en1991-2-2003').statut.etat).toBe('non-applicable');
  });
});
