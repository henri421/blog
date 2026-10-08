import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { analysePlastique } from '../../../src/noyau/mecanismes/analyse-plastique/index';

// Valeurs attendues calculees a la main (docs/validation/analyse-plastique.md).

const dalle = { fck: 60, xu: 40, d: 200, rapportMoments: 1.2, classe: 'B' };
const cel = (e: object, g: string) => calculerMatrice(analysePlastique, e).cellules.find((c) => c.generation === g)!;

describe('analyse plastique', () => {
  it('C60/75, x_u/d = 0,20 : limite 0,15 en 2004 (taux 1,334), 0,25 en 2023 (0,800)', () => {
    expect(cel(dalle, 'ec2-2004').resistance).toBe(0.15);
    expect(cel(dalle, 'ec2-2004').taux).toBeCloseTo(0.2 / 0.15, 12);
    expect(cel(dalle, 'ec2-2023').resistance).toBe(0.25);
    expect(cel(dalle, 'ec2-2023').taux).toBeCloseTo(0.8, 12);
  });

  it('C30/37 : 0,25 dans les deux generations', () => {
    expect(cel({ ...dalle, fck: 30 }, 'ec2-2004').resistance).toBe(0.25);
  });

  it('acier de classe A ou rapport des moments hors de 0,5 a 2 : non applicable', () => {
    expect(cel({ ...dalle, classe: 'A' }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.plastique-classe-a' });
    expect(cel({ ...dalle, rapportMoments: 2.5 }, 'ec2-2004').statut).toMatchObject({ motif: 'motif.plastique-rapport-moments' });
  });
});
