import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { csdSimplifie } from '../../../src/noyau/mecanismes/csd-simplifie/index';

// Cas de controle (docs/validation/csd-simplifie.md).

const cel = (e: object, g: string) => calculerMatrice(csdSimplifie, e).cellules.find((c) => c.generation === g)!;

describe('coefficient structural pris egal a 1 (EN 1991-1-4)', () => {
  it('cheminee de 40 m, diametre 8 m : dispensee en 2005, plus en 2026', () => {
    expect(cel({ type: 'cheminee', h: 40, d: 8 }, 'en1991-1-4-2005').resistance).toBe(1);
    expect(cel({ type: 'cheminee', h: 40, d: 8 }, 'en1991-1-4-2026').statut.etat).toBe('non-applicable');
  });

  it('immeuble contrevente de 33 m, 21 m de profondeur : dispense dans les deux generations', () => {
    for (const g of ['en1991-1-4-2005', 'en1991-1-4-2026']) expect(cel({ type: 'batiment-contrevente', h: 33, d: 21 }, g).resistance).toBe(1);
  });

  it('tour de 100 m : calcul detaille ; tablier : dispense dans les deux generations (8.2 en 2005)', () => {
    expect(cel({ type: 'batiment-contrevente', h: 100, d: 30 }, 'en1991-1-4-2026').statut.etat).toBe('non-applicable');
    expect(cel({ type: 'tablier', h: 10 }, 'en1991-1-4-2026').resistance).toBe(1);
    expect(cel({ type: 'tablier', h: 10 }, 'en1991-1-4-2005').resistance).toBe(1);
    expect(cel({ type: 'tablier', h: 10 }, 'en1991-1-4-2005').clauses).toEqual(['8.2 NOTE 2']);
  });
});
