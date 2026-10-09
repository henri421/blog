import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { integrite } from '../../../src/noyau/mecanismes/integrite/index';

// Valeurs attendues calculees a la main (docs/validation/integrite.md).

const poteau = { VEd: 424, AsInt: 12 * Math.PI * 64, fyk: 500, classe: 'B', fck: 30, nHog: 16, phiHog: 12, sHog: 150, cHog: 30 };
const cel = (e: object, g: string, n: string) => calculerMatrice(integrite, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('armatures d integrite des planchers-dalles', () => {
  it('(12.10) : 12 traversees HA16, classe B, V_Rd,int = 446,36 kN', () => {
    const c = cel(poteau, 'ec2-2023', 'base');
    expect(c.intermediaires.k_int.valeur).toBe(0.37);
    expect(c.resistance).toBeCloseTo(446.35748, 4);
    expect(c.taux).toBeCloseTo(424 / 446.35748, 6);
  });

  it('classe C : k_int = 0,49, 591,12 kN', () => {
    expect(cel({ ...poteau, classe: 'C' }, 'ec2-2023', 'base').resistance).toBeCloseTo(591.12207, 4);
  });

  it('(12.12) : b_ef,hog = min(138 ; 72 ; 120) = 72 mm, V_Rd,hog = 65,84 kN', () => {
    const c = cel(poteau, 'ec2-2023', 'appui');
    expect(c.intermediaires['b_ef,hog'].valeur).toBe(72);
    expect(c.intermediaires['V_Rd,hog (12.12)'].valeur).toBeCloseTo(65.841014, 5);
    expect(c.resistance).toBeCloseTo(512.198498, 4);
  });

  it('classe A : non applicable ; 2004 : regle de moyens sans calcul', () => {
    expect(cel({ ...poteau, classe: 'A' }, 'ec2-2023', 'base').statut).toMatchObject({ etat: 'non-applicable', motif: 'motif.integrite-classe-a' });
    expect(cel(poteau, 'ec2-2004', 'sans-equivalent').statut).toMatchObject({ motif: 'motif.sans-equivalent-2004' });
  });
});
