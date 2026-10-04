import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { pressionLocalisee, type EntreePressionLocalisee } from '../../../src/noyau/mecanismes/pression-localisee/index';

// Valeurs attendues calculees a la main (docs/validation/pression-localisee.md).

const appui = (ea = 0): EntreePressionLocalisee => ({ FEd: 600, a0: 150, b0: 200, ea, eb: 0, a1: 450, b: 300, hBloc: 500, fck: 30 });
const cel = (e: EntreePressionLocalisee, g: string) =>
  calculerMatrice(pressionLocalisee, e).cellules.find((c) => c.generation === g)!;

describe('pression localisee, appui centre', () => {
  it('2004 : A_c1 homothetique a l echelle 1,5, F_Rdu = 900 kN', () => {
    const c = cel(appui(), 'ec2-2004');
    expect(c.intermediaires['échelle de A_c1'].valeur).toBe(1.5);
    expect(c.resistance).toBeCloseTo(900, 9);
  });

  it('2023 : b_1 = 300 mm, A_c1 = 135 000 mm2, F_Rdu = 1081,87 kN', () => {
    const c = cel(appui(), 'ec2-2023');
    expect(c.intermediaires.b_1.valeur).toBe(300);
    expect(c.resistance).toBeCloseTo(1081.8734, 3);
  });
});

describe('pression localisee, appui excentre de 20 mm', () => {
  it('2004 : non applicable, pas de regle explicite', () => {
    expect(cel(appui(20), 'ec2-2004').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.excentrement-2004',
      donneesManquantes: [],
    });
  });

  it('2023 : A_c0,red = 22 000 mm2, F_Rdu = 926,46 kN', () => {
    const c = cel(appui(20), 'ec2-2023');
    expect(c.intermediaires['A_c0 (réduite)'].valeur).toBe(22000);
    expect(c.resistance).toBeCloseTo(926.4610, 3);
  });

  it('bloc trop bas : non applicable en 2023', () => {
    expect(cel({ ...appui(), hBloc: 300 }, 'ec2-2023').statut.etat).toBe('non-applicable');
  });
});
