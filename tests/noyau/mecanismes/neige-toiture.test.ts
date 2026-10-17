import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { neigeToiture } from '../../../src/noyau/mecanismes/neige-toiture/index';

// Valeurs attendues calculees a la main (docs/validation/neige-toiture.md).

const entrepot = { sk: 0.5, exposition: 'balaye', Ct: 1, W: 100, L: 200 };
const cel = (e: object, g: string, n: string) => calculerMatrice(neigeToiture, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('neige sur toiture terrasse (EN 1991-1-3)', () => {
  it('entrepot balaye 100 x 200 m : 0,32 en 2003, 0,3714 en 2025, 0,6214 avec la pluie', () => {
    expect(cel(entrepot, 'en1991-1-3-2003', 'uniforme').sollicitation).toBeCloseTo(0.32, 12);
    const c = cel(entrepot, 'en1991-1-3-2025', 'uniforme');
    expect(c.intermediaires.L_c.valeur).toBeCloseTo(150, 12);
    expect(c.intermediaires['C_e,F'].valeur).toBeCloseTo(0.92857143, 8);
    expect(c.sollicitation).toBeCloseTo(0.37142857, 8);
    expect(cel(entrepot, 'en1991-1-3-2025', 'pluie').sollicitation).toBeCloseTo(0.62142857, 8);
  });

  it('exemple de l atelier JRC : 21 x 45 m, normal, L_c = 32,2 m, s = 0,40', () => {
    const c = cel({ ...entrepot, exposition: 'normal', W: 21, L: 45 }, 'en1991-1-3-2025', 'uniforme');
    expect(c.intermediaires.L_c.valeur).toBeCloseTo(32.2, 12);
    expect(c.sollicitation).toBeCloseTo(0.4, 12);
  });

  it('grande toiture protegee : C_e,F plafonne a 1,25 ; s_R = 1,0 - s_k', () => {
    const e = { sk: 0.9, exposition: 'protege', Ct: 1, W: 300, L: 600 };
    expect(cel(e, 'en1991-1-3-2025', 'uniforme').sollicitation).toBeCloseTo(0.9, 12);
    expect(cel(e, 'en1991-1-3-2025', 'pluie').sollicitation).toBeCloseTo(1.0, 12);
    expect(cel({ ...e, sk: 1.2 }, 'en1991-1-3-2025', 'pluie').statut.etat).toBe('non-applicable');
  });

  it('f_s,cc = 1,1 multiplie la charge ; 2003 sans surcharge de pluie', () => {
    expect(cel({ ...entrepot, fscc: 1.1 }, 'en1991-1-3-2025', 'uniforme').sollicitation).toBeCloseTo(0.40857143, 8);
    expect(cel(entrepot, 'en1991-1-3-2003', 'pluie').statut.etat).toBe('non-applicable');
  });
});
