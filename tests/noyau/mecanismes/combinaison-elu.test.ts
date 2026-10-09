import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { combinaisonElu } from '../../../src/noyau/mecanismes/combinaison-elu/index';

// Valeurs attendues calculees a la main (docs/validation/combinaison-elu.md).

const poteau = { G: 800, Q1: 300, psi01: 0.7, Q2: 100, psi02: 0.5, cc: 'CC2' };
const cel = (e: object, g: string, n: string) => calculerMatrice(combinaisonElu, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('combinaisons d actions ELU (EN 1990)', () => {
  it('generations comparees : EN 1990:2002 et EN 1990-1:2023', () => {
    expect([...new Set(calculerMatrice(combinaisonElu, poteau).cellules.map((c) => c.generation))]).toEqual(['en1990-2002', 'en1990-2023']);
  });

  it('2002 : (6.10) = 1605 ; (6.10a) = 1470, (6.10b) = 1443, retenue 1470', () => {
    expect(cel(poteau, 'en1990-2002', 'e610').resistance).toBeCloseTo(1605, 9);
    const c = cel(poteau, 'en1990-2002', 'e610ab');
    expect(c.intermediaires['(6.10a)'].valeur).toBeCloseTo(1470, 9);
    expect(c.intermediaires['(6.10b)'].valeur).toBeCloseTo(1443, 9);
    expect(c.resistance).toBeCloseTo(1470, 9);
  });

  it('2023, CC2 : (8.12) = 1605, (8.13) = 1470, (8.14) = max(1080 ; 1443) = 1443', () => {
    expect(cel(poteau, 'en1990-2023', 'e812').resistance).toBeCloseTo(1605, 9);
    expect(cel(poteau, 'en1990-2023', 'e813').resistance).toBeCloseTo(1470, 9);
    const c = cel(poteau, 'en1990-2023', 'e814');
    expect(c.intermediaires['(8.14) haut'].valeur).toBeCloseTo(1080, 9);
    expect(c.resistance).toBeCloseTo(1443, 9);
  });

  it('2023, CC3 : k_F = 1,1, (8.12) = 1765,5 ; CC1 : k_F = 0,9, 1444,5', () => {
    expect(cel({ ...poteau, cc: 'CC3' }, 'en1990-2023', 'e812').resistance).toBeCloseTo(1765.5, 9);
    expect(cel({ ...poteau, cc: 'CC1' }, 'en1990-2023', 'e812').resistance).toBeCloseTo(1444.5, 9);
  });

  it('sans classe de consequences, les niveaux 2023 sont non applicables, pas ceux de 2002', () => {
    const { cc, ...sans } = poteau;
    expect(cc).toBe('CC2');
    expect(cel(sans, 'en1990-2023', 'e812').statut.etat).toBe('non-applicable');
    expect(cel(sans, 'en1990-2002', 'e610').statut.etat).toBe('calcule');
  });
});
