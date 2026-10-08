import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { deversementMeca } from '../../../src/noyau/mecanismes/deversement/index';

// Valeurs attendues calculees a la main (docs/validation/deversement.md).

const poutre = { l0t: 12000, h: 1100, b: 400, situation: 'durable' };
const cel = (e: object, g: string) => calculerMatrice(deversementMeca, e).cellules.find((c) => c.generation === g)!;

describe('deversement', () => {
  it('h/b = 2,75 : limite 50/2,75^(1/3) = 35,69 ; refuse en 2004 (h/b > 2,5), admis en 2023', () => {
    expect(cel(poutre, 'ec2-2004').statut).toMatchObject({ motif: 'motif.deversement-hb' });
    const c = cel(poutre, 'ec2-2023');
    expect(c.resistance).toBeCloseTo(35.6883, 4);
    expect(c.taux).toBeCloseTo(30 / 35.6883, 4);
  });

  it('situation transitoire : 70/2,75^(1/3) = 49,96, admis dans les deux generations', () => {
    const e = { ...poutre, situation: 'transitoire' };
    expect(cel(e, 'ec2-2004').resistance).toBeCloseTo(49.9636, 4);
    expect(cel(e, 'ec2-2023').resistance).toBeCloseTo(49.9636, 4);
  });
});
