import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { redistribution, type EntreeRedistribution } from '../../../src/noyau/mecanismes/redistribution/index';

// Valeurs attendues calculees a la main (docs/validation/redistribution.md).

const poutre = (): EntreeRedistribution => ({
  Mel: 306.25,
  Mred: 245,
  L1: 7000,
  L2: 7000,
  b: 300,
  d: 540,
  As: 1473,
  fck: 30,
  fyk: 500,
  classe: 'B',
});

const cel = (e: EntreeRedistribution, g: string) => calculerMatrice(redistribution, e).cellules.find((c) => c.generation === g)!;

describe('redistribution, poutre continue de 2 x 7 m, 20 %', () => {
  it('2004 : x_u = 131,85 mm, (5.10a) = 0,7452 <= 0,80 passe', () => {
    const c = cel(poutre(), 'ec2-2004');
    expect(c.intermediaires.x_u.valeur).toBeCloseTo(131.8542, 3);
    expect(c.intermediaires['(5.10)'].valeur).toBeCloseTo(0.745218, 5);
    expect(c.sollicitation).toBeCloseTo(0.745218, 5);
    expect(c.resistance).toBeCloseTo(0.8, 12);
  });

  it('2023 : x_u = 155,12 mm, (7.16) = 0,4701 + 0,2873 = 0,7574 passe', () => {
    const c = cel(poutre(), 'ec2-2023');
    expect(c.intermediaires.x_u.valeur).toBeCloseTo(155.1226, 3);
    expect(c.intermediaires['1/(1 + 0,7 ε_cu E_s/f_yd)'].valeur).toBeCloseTo(0.470146, 5);
    expect(c.sollicitation).toBeCloseTo(0.75741, 5);
  });

  it('C60/75 : k3 = 0,54 et k4 = 1,357 en 2004, borne 0,7 atteinte en 2023', () => {
    const e = { ...poutre(), fck: 60 };
    const a = cel(e, 'ec2-2004');
    expect(a.intermediaires.k3.valeur).toBe(0.54);
    expect(a.sollicitation).toBeCloseTo(0.733353, 5);
    const b = cel(e, 'ec2-2023');
    expect(b.intermediaires['(7.16)'].valeur).toBeCloseTo(0.634563, 5);
    expect(b.sollicitation).toBe(0.7);
  });

  it('classe A : borne 0,8', () => {
    expect(cel({ ...poutre(), fck: 60, classe: 'A' }, 'ec2-2023').sollicitation).toBe(0.8);
  });

  it('portees adjacentes dans un rapport superieur a 2 : non applicable', () => {
    expect(cel({ ...poutre(), L1: 3000 }, 'ec2-2004').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.portees-adjacentes',
      donneesManquantes: [],
    });
  });
});
