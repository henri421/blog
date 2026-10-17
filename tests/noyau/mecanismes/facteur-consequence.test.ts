import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { facteurConsequence } from '../../../src/noyau/mecanismes/facteur-consequence/index';

// Valeurs attendues calculees a la main (docs/validation/facteur-consequence.md).

const cel = (cc: string, g: string) => calculerMatrice(facteurConsequence, { cc }).cellules.find((c) => c.generation === g && c.niveau === 'kf')!;

describe('facteur de consequence (EN 1990)', () => {
  it('CC1 : k_F = 0,9, gamma_G = 1,215, gamma_Q = 1,35', () => {
    const c = cel('CC1', 'en1990-2023');
    expect(c.resistance).toBe(0.9);
    expect(c.intermediaires['γ_G'].valeur).toBeCloseTo(1.215, 12);
    expect(c.intermediaires['γ_Q'].valeur).toBeCloseTo(1.35, 12);
  });

  it('CC2 et CC3 : 1,0 et 1,1 dans les deux generations', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) {
      expect(cel('CC2', g).resistance).toBe(1);
      expect(cel('CC3', g).resistance).toBe(1.1);
    }
  });

  it('CC0 et CC4 : pas de facteur', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) {
      expect(cel('CC0', g).statut.etat).toBe('non-applicable');
      expect(cel('CC4', g).statut.etat).toBe('non-applicable');
    }
  });
});
