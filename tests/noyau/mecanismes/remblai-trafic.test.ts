import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { remblaiTrafic } from '../../../src/noyau/mecanismes/remblai-trafic/index';

// Valeurs attendues calculees a la main (docs/validation/remblai-trafic.md).

const mur = { zone: 'voie1', K: 0.33, H: 4, d: 2 };
const cel = (e: object, g: string) => calculerMatrice(remblaiTrafic, e).cellules.find((c) => c.generation === g)!;

describe('trafic sur remblai (EN 1991-2, 6.9)', () => {
  it('voie de 3 m, K = 0,33, H = 4 m : 26,4 kN/m', () => {
    expect(cel(mur, 'en1991-2-2023').sollicitation).toBeCloseTo(26.4, 12);
    expect(cel({ ...mur, zone: 'autres' }, 'en1991-2-2023').sollicitation).toBeCloseTo(11.88, 12);
  });

  it('chaussee a moins de 1 m : non applicable ; 2003 a relire', () => {
    expect(cel({ ...mur, d: 0.5 }, 'en1991-2-2023').statut.etat).toBe('non-applicable');
    expect(cel(mur, 'en1991-2-2003').statut.etat).toBe('non-applicable');
  });
});
