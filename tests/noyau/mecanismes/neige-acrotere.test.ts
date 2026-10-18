import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { neigeAcrotere } from '../../../src/noyau/mecanismes/neige-acrotere/index';

// Valeurs attendues calculees a la main (docs/validation/neige-acrotere.md),
// exemple de l atelier JRC de juin 2025 (acrotere de 1,1 m, b = 45 m).

const jrc = { sk: 0.5, hp: 1.1, b: 45, exposition: 'normal', Ct: 1 };
const cel = (e: object, g: string) => calculerMatrice(neigeAcrotere, e).cellules.find((c) => c.generation === g)!;

describe('neige le long d un acrotere (EN 1991-1-3)', () => {
  it('atelier JRC : mu_7 = 3,52, s = 1,76 kN/m2 en 2025 ; mu_2 = 2,0, s = 1,0 en 2003', () => {
    const c = cel(jrc, 'en1991-1-3-2025');
    expect(c.intermediaires['μ_7'].valeur).toBeCloseTo(3.52, 12);
    expect(c.sollicitation).toBeCloseTo(1.76, 12);
    expect(cel(jrc, 'en1991-1-3-2003').sollicitation).toBeCloseTo(1.0, 12);
  });

  it('petit acrotere de 0,3 m, site balaye : plafond 0,8 gamma h/(C_e s_k) = 1,2', () => {
    const e = { ...jrc, hp: 0.3, exposition: 'balaye' };
    expect(cel(e, 'en1991-1-3-2025').intermediaires['μ_7'].valeur).toBeCloseTo(1.2, 12);
    expect(cel(e, 'en1991-1-3-2003').intermediaires['μ_2'].valeur).toBeCloseTo(1.2, 12);
  });
});
