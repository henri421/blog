import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { postTension } from '../../../src/noyau/mecanismes/post-tension/index';

// Valeurs attendues calculees a la main (docs/validation/post-tension.md).

const cable = { phiDuct: 80, Dupper: 20, csx: 80, csy: 60, sigmaPd: 1450, Ap: 1800, pRd: 15, rPrevu: 6000 };
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(postTension, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('post-tension', () => {
  it('espacement identique : 80 mm horizontal et vertical, taux 1,000 et 1,333', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      expect(cel(cable, g, 'espacement-horizontal').sollicitation).toBe(80);
      expect(cel(cable, g, 'espacement-vertical').taux).toBeCloseTo(80 / 60, 12);
    }
  });

  it('petite gaine : planchers 50 et 40 mm, granulat 25 et 20 mm', () => {
    const e = { ...cable, phiDuct: 30 };
    expect(cel(e, 'ec2-2023', 'espacement-horizontal').sollicitation).toBe(50);
    expect(cel(e, 'ec2-2023', 'espacement-vertical').sollicitation).toBe(40);
    expect(cel({ ...e, Dupper: 63 }, 'ec2-2023', 'espacement-horizontal').sollicitation).toBe(68);
  });

  it('rayon minimal 2023 : 1450 x racine(1800) / 15 = 4101,2 mm ; sans equivalent en 2004', () => {
    expect(cel(cable, 'ec2-2023', 'rayon').sollicitation).toBeCloseTo(4101.219, 2);
    expect(cel(cable, 'ec2-2004', 'rayon').statut).toMatchObject({ motif: 'motif.sans-equivalent-2004' });
  });
});
