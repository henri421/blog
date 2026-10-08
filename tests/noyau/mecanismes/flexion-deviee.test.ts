import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { flexionDeviee } from '../../../src/noyau/mecanismes/flexion-deviee/index';

// Valeurs attendues calculees a la main (docs/validation/flexion-deviee.md).

const poteau = {
  b: 400,
  h: 400,
  lambdaY: 40,
  lambdaZ: 40,
  NEd: 1500,
  MEdy: 90,
  MEdz: 120,
  fck: 30,
  fyk: 500,
  As: 2513,
  MRdy2004: 250,
  MRdz2004: 250,
  MRdy2023: 235,
  MRdz2023: 235,
};
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(flexionDeviee, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('flexion deviee', () => {
  it("dispense refusee : e'_y/e'_z = 0,2/0,15 = 1,33", () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      expect(cel(poteau, g, 'dispense').statut).toMatchObject({ motif: 'motif.flexion-deviee-requise' });
    }
  });

  it("dispense admise : moment surtout selon un axe (e'_y/e'_z >= 5)", () => {
    const c = cel({ ...poteau, MEdy: 10 }, 'ec2-2023', 'dispense');
    expect(c.statut.etat).toBe('calcule');
    expect(c.intermediaires["e'_y/e'_z"].valeur).toBeCloseTo(12, 10);
  });

  it('interaction : N_Rd = 4292,6 / 3812,6 kN, a = 1,2079 / 1,2445, somme 0,703 / 0,736', () => {
    const a = cel(poteau, 'ec2-2004', 'interaction');
    expect(a.intermediaires.N_Rd.valeur).toBeCloseTo(4292.609, 2);
    expect(a.intermediaires.a.valeur).toBeCloseTo(1.20786, 4);
    expect(a.sollicitation).toBeCloseTo(0.7032, 4);
    const b = cel(poteau, 'ec2-2023', 'interaction');
    expect(b.intermediaires.a.valeur).toBeCloseTo(1.24453, 4);
    expect(b.sollicitation).toBeCloseTo(0.73612, 4);
  });
});
