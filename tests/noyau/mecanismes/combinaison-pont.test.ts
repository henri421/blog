import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { combinaisonPont } from '../../../src/noyau/mecanismes/combinaison-pont/index';

// Valeurs attendues calculees a la main (docs/validation/combinaison-pont.md).

const poutre = { G: 4000, TS: 2500, UDL: 1500, T: 600, cc: 'CC3a' };
const cel = (e: object, g: string) => calculerMatrice(combinaisonPont, e).cellules.find((c) => c.generation === g)!;

describe('combinaison fondamentale d un pont routier (EN 1990, A.2)', () => {
  it('trafic dominant : 11 340 en 2002 et en CC3a', () => {
    expect(cel(poutre, 'en1990-2002').sollicitation).toBeCloseTo(11340, 9);
    expect(cel(poutre, 'en1990-2023').sollicitation).toBeCloseTo(11340, 9);
    expect(cel(poutre, 'en1990-2023').intermediaires['thermique dominante'].valeur).toBeCloseTo(9641.25, 9);
  });

  it('CC3b : 12 474 ; CC1 : 10 206', () => {
    expect(cel({ ...poutre, cc: 'CC3b' }, 'en1990-2023').sollicitation).toBeCloseTo(12474, 9);
    expect(cel({ ...poutre, cc: 'CC1' }, 'en1990-2023').sollicitation).toBeCloseTo(10206, 9);
  });
});
