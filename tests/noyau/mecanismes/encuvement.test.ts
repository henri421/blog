import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { encuvement } from '../../../src/noyau/mecanismes/encuvement/index';

// Valeurs attendues calculees a la main (docs/validation/encuvement.md).

const portique = { hcol: 400, MEd: 200, NEd: 800, lPrevu: 600 };
const cel = (e: object, g: string) => calculerMatrice(encuvement, e).cellules.find((c) => c.generation === g)!;

describe('fondation en encuvement', () => {
  it('2004 : 1,2 h = 480 mm quelle que soit l excentricite', () => {
    expect(cel(portique, 'ec2-2004').sollicitation).toBe(480);
  });

  it('2023 : e/h = 0,625, l/h = 1,2 + 0,8 x 0,475/1,85 = 1,4054, l = 562,2 mm', () => {
    const c = cel(portique, 'ec2-2023');
    expect(c.intermediaires['l / h_col'].valeur).toBeCloseTo(1.405405, 6);
    expect(c.sollicitation).toBeCloseTo(562.162, 3);
  });

  it('bornes : 1,2 h sous faible excentricite, 2,0 h au-dela de 2 h ou sans compression', () => {
    expect(cel({ ...portique, MEd: 40 }, 'ec2-2023').sollicitation).toBeCloseTo(480, 10);
    expect(cel({ ...portique, MEd: 700 }, 'ec2-2023').sollicitation).toBe(800);
    expect(cel({ ...portique, NEd: 0 }, 'ec2-2023').sollicitation).toBe(800);
  });
});
