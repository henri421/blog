import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { neigeSol } from '../../../src/noyau/mecanismes/neige-sol/index';

// Valeurs attendues calculees independamment (Python), docs/validation/neige-sol.md.

const cel = (e: object, g: string, n: string) => calculerMatrice(neigeSol, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('neige sur le sol (EN 1991-1-3)', () => {
  it('periode de retour 10 ans, V = 0,5 : 0,7196 s_k', () => {
    for (const g of ['en1991-1-3-2003', 'en1991-1-3-2025']) expect(cel({ sk: 0.5, V: 0.5, n: 10 }, g, 'retour').sollicitation).toBeCloseTo(0.5 * 0.719589, 6);
  });

  it('50 ans : s_k ; 100 ans : 1,1185 s_k', () => {
    expect(cel({ sk: 0.5, V: 0.5, n: 50 }, 'en1991-1-3-2025', 'retour').sollicitation).toBeCloseTo(0.5, 9);
    expect(cel({ sk: 0.5, V: 0.5, n: 100 }, 'en1991-1-3-2025', 'retour').sollicitation).toBeCloseTo(0.5 * 1.118545, 6);
  });

  it('charge exceptionnelle : 2 s_k ; periode de 5 ans ou moins : non applicable', () => {
    expect(cel({ sk: 0.5 }, 'en1991-1-3-2025', 'exceptionnelle').sollicitation).toBe(1);
    expect(cel({ sk: 0.5, V: 0.5, n: 5 }, 'en1991-1-3-2025', 'retour').statut.etat).toBe('non-applicable');
  });
});
