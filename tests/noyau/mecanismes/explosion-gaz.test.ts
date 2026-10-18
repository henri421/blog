import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { explosionGaz } from '../../../src/noyau/mecanismes/explosion-gaz/index';

// Valeurs attendues calculees a la main (docs/validation/explosion-gaz.md).

const local = { pstat: 3, Av: 4, V: 50 };
const cel = (e: object, g: string) => calculerMatrice(explosionGaz, e).cellules.find((c) => c.generation === g)!;

describe('explosion de gaz naturel (EN 1991-1-7, annexe D)', () => {
  it('local de 50 m3 avec 4 m2 d events : p_d = 10,75 kN/m2', () => {
    for (const g of ['en1991-1-7-2006', 'en1991-1-7-2025']) expect(cel(local, g).sollicitation).toBeCloseTo(10.75, 12);
  });

  it('events de 7 m2 : (D.2) donne 6,54 et gouverne encore (D.1 : 6)', () => {
    expect(cel({ ...local, Av: 7 }, 'en1991-1-7-2025').sollicitation).toBeCloseTo(6.540816, 5);
  });

  it('events trop petits ou volume trop grand : non applicable', () => {
    expect(cel({ ...local, Av: 2 }, 'en1991-1-7-2025').statut.etat).toBe('non-applicable');
    expect(cel({ pstat: 3, Av: 120, V: 1200 }, 'en1991-1-7-2025').statut.etat).toBe('non-applicable');
  });
});
