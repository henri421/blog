import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { chargeCloisons } from '../../../src/noyau/mecanismes/charge-cloisons/index';

// Valeurs attendues calculees a la main (docs/validation/charge-cloisons.md).

const cel = (Qkp: number, g: string) => calculerMatrice(chargeCloisons, { Qkp }).cellules.find((c) => c.generation === g && c.niveau === 'cloisons')!;

describe('charge repartie equivalente aux cloisons (EN 1991-1-1)', () => {
  it('2 kN/m : 0,8 kN/m2 dans les deux generations', () => {
    expect(cel(2, 'en1991-1-1-2002').resistance).toBe(0.8);
    expect(cel(2, 'en1991-1-1-2025').resistance).toBeCloseTo(0.8, 12);
  });

  it('0,5 kN/m : 0,5 en 2002, plancher 0,35 en 2025', () => {
    expect(cel(0.5, 'en1991-1-1-2002').resistance).toBe(0.5);
    expect(cel(0.5, 'en1991-1-1-2025').resistance).toBe(0.35);
  });

  it('1,5 et 3,0 kN/m : classes 2002 contre formule continue', () => {
    expect(cel(1.5, 'en1991-1-1-2002').resistance).toBe(0.8);
    expect(cel(1.5, 'en1991-1-1-2025').resistance).toBeCloseTo(0.6, 12);
    expect(cel(3, 'en1991-1-1-2002').resistance).toBe(1.2);
    expect(cel(3, 'en1991-1-1-2025').resistance).toBeCloseTo(1.2, 12);
  });

  it('au-dela de 3,0 kN/m : non applicable dans les deux generations', () => {
    expect(cel(3.5, 'en1991-1-1-2002').statut.etat).toBe('non-applicable');
    expect(cel(3.5, 'en1991-1-1-2025').statut.etat).toBe('non-applicable');
  });
});
