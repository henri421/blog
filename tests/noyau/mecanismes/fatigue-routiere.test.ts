import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { dPhi2003, dPhi2023, fatigueRoutiere } from '../../../src/noyau/mecanismes/fatigue-routiere/index';

// Valeurs attendues calculees a la main (docs/validation/fatigue-routiere.md).

const cel = (e: object, g: string, n: string) => calculerMatrice(fatigueRoutiere, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('fatigue des ponts routiers (EN 1991-2)', () => {
  it('les deux expressions de Delta phi_fat sont la meme droite', () => {
    for (const D of [0, 1, 2.5, 4, 6, 8]) expect(dPhi2003(D)).toBeCloseTo(dPhi2023(D), 12);
    expect(dPhi2023(2)).toBeCloseTo(1.2, 12);
  });

  it('autoroute de categorie 1, deux voies lentes et une voie rapide : 4,2 millions par an', () => {
    for (const g of ['en1991-2-2003', 'en1991-2-2023']) expect(cel({ categorie: '1', ns: 2, nf: 1 }, g, 'trafic').sollicitation).toBeCloseTo(4.2e6, 3);
  });
});
