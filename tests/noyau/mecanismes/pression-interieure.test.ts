import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { cpiFigure713, cpiOuvertures, pressionInterieure } from '../../../src/noyau/mecanismes/pression-interieure/index';

// Valeurs attendues calculees a la main (docs/validation/pression-interieure.md).

const toiture = { qp: 700, cpe: -1.2, Ap: 4, An: 6, cpep: 0.8, cpen: -0.5, hd: 0.2 };
const cel = (e: object, g: string, n: string) => calculerMatrice(pressionInterieure, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('pression interieure et pression nette (EN 1991-1-4)', () => {
  it('c_pi par les ouvertures : -0,1', () => {
    expect(cpiOuvertures(4, 6, 0.8, -0.5)).toBeCloseTo(-0.1, 12);
  });

  it('toiture c_pe = -1,2 : 980 Pa par defaut, 770 Pa par les ouvertures (2026)', () => {
    for (const g of ['en1991-1-4-2005', 'en1991-1-4-2026']) expect(cel(toiture, g, 'defaut').sollicitation).toBeCloseTo(980, 9);
    expect(cel(toiture, 'en1991-1-4-2026', 'ouvertures').sollicitation).toBeCloseTo(770, 9);
    expect(cel(toiture, 'en1991-1-4-2005', 'ouvertures').sollicitation).toBeCloseTo(869.4737, 3);
  });

  it('figure 7.13 (2005) : mu = 0,6, interpolation sur h/d, palier au-dela de 0,9', () => {
    expect(cpiFigure713(0.6, 0.2)).toBeCloseTo(0.042105, 6);
    expect(cpiFigure713(0.6, 1)).toBeCloseTo(-0.020161, 6);
    expect(cpiFigure713(0.6, 0.625)).toBeCloseTo(0.010972, 6);
    expect(cpiFigure713(0.95, 0.25)).toBeCloseTo(-0.3, 12);
    expect(cel({ ...toiture, hd: 1 }, 'en1991-1-4-2005', 'ouvertures').sollicitation).toBeCloseTo(825.8871, 3);
  });

  it('figure 7.13 (2005) : face dominante (mu < 1/3) hors figure', () => {
    expect(cel({ ...toiture, Ap: 7, An: 3 }, 'en1991-1-4-2005', 'ouvertures').statut.etat).toBe('non-applicable');
  });

  it('mur au vent c_pe = +0,8 : 770 Pa par defaut, 630 Pa par les ouvertures', () => {
    expect(cel({ ...toiture, cpe: 0.8 }, 'en1991-1-4-2026', 'defaut').sollicitation).toBeCloseTo(770, 9);
    expect(cel({ ...toiture, cpe: 0.8 }, 'en1991-1-4-2026', 'ouvertures').sollicitation).toBeCloseTo(630, 9);
    expect(cel({ ...toiture, cpe: 0.8 }, 'en1991-1-4-2005', 'ouvertures').sollicitation).toBeCloseTo(530.5263, 3);
  });
});
