import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { valeurPermanente } from '../../../src/noyau/mecanismes/valeur-permanente/index';

// Valeurs attendues calculees a la main (docs/validation/valeur-permanente.md).

const chape = { Gm: 2.0, V: 0.08, verification: 'equilibre' };
const cel = (e: object, g: string, n: string) => calculerMatrice(valeurPermanente, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('valeurs caracteristiques des actions permanentes (EN 1990)', () => {
  it('V = 8 % : G_k,sup = 2,2632 et G_k,inf = 1,7368', () => {
    expect(cel(chape, 'en1990-2023', 'superieure').sollicitation).toBeCloseTo(2.2632, 12);
    expect(cel(chape, 'en1990-2023', 'inferieure').sollicitation).toBeCloseTo(1.7368, 12);
  });

  it('equilibre, V = 8 % : valeur unique refusee en 2023, admise en 2002 (seuil 0,10)', () => {
    expect(cel(chape, 'en1990-2023', 'unique').statut.etat).toBe('non-applicable');
    expect(cel(chape, 'en1990-2002', 'unique').sollicitation).toBe(2);
  });

  it('resistance, V = 8 % : valeur unique admise en 2023', () => {
    expect(cel({ ...chape, verification: 'resistance' }, 'en1990-2023', 'unique').sollicitation).toBe(2);
  });
});
