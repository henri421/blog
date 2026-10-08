import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { fluageEffectif } from '../../../src/noyau/mecanismes/fluage-effectif/index';

// Valeurs attendues calculees a la main (docs/validation/fluage-effectif.md).

const poteau = { phi: 2, M0Eqp: 60, M0Ed: 100, lambda: 60, NEd: 200, h: 400, delta0Eqp: 8, deltaEd: 20 };
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(fluageEffectif, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('fluage effectif', () => {
  it('phi_ef = 2 x 60/100 = 1,2 dans les deux generations', () => {
    expect(cel(poteau, 'ec2-2004', 'moments').sollicitation).toBeCloseTo(1.2, 12);
    expect(cel(poteau, 'ec2-2023', 'moments').sollicitation).toBeCloseTo(1.2, 12);
  });

  it('2004 : M_0Ed/N_Ed = 500 mm >= h, phi <= 2, lambda <= 75 : phi_ef = 0 admis', () => {
    expect(cel(poteau, 'ec2-2004', 'negligeable').sollicitation).toBe(0);
    expect(cel({ ...poteau, NEd: 1000 }, 'ec2-2004', 'negligeable').statut).toMatchObject({ motif: 'motif.fluage-non-negligeable' });
  });

  it('2023 global : 2 x 8/20 = 0,8', () => {
    expect(cel(poteau, 'ec2-2023', 'global').sollicitation).toBeCloseTo(0.8, 12);
  });
});
