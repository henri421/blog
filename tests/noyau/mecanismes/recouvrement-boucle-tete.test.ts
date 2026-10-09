import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { recouvrementBoucle, recouvrementTete } from '../../../src/noyau/mecanismes/recouvrement-boucle-tete/index';

// Valeurs attendues calculees a la main (docs/validation/recouvrement-boucle-tete.md).

const boucles = { phi: 12, phiMand: 160, lsd: 300, cs: 50, Ast: 4 * Math.PI * 25, fck: 30, fyk: 500, Dlower: 16, T: (Math.PI * 36 * 500) / 1150 };
const tetes = { phi: 12, phiH: 40, lsd: 300, cs: 50, Ast: 2 * Math.PI * 16, fck: 30, fyk: 500, Dlower: 16, T: (Math.PI * 36 * 300) / 1000 };

describe('recouvrement par boucles en U (11.5.4)', () => {
  const cel = (e: object) => calculerMatrice(recouvrementBoucle, e).cellules.find((c) => c.generation === 'ec2-2023')!;
  it('A_c = 45 387 mm2, omega = 0,43915, k_st = 0,98519, T_Rd,c = 61,46 kN', () => {
    const c = cel(boucles);
    expect(c.intermediaires.A_c.valeur).toBeCloseTo(45387.36, 2);
    expect(c.intermediaires['ω (11.15)'].valeur).toBeCloseTo(0.4391468, 6);
    expect(c.intermediaires.k_st.valeur).toBeCloseTo(0.9851875, 6);
    expect(c.resistance).toBeCloseTo(61.460595, 5);
    expect(c.taux).toBeCloseTo(0.8000696, 6);
  });
  it('armature transversale sous le minimum (11.16) : non applicable', () => {
    expect(cel({ ...boucles, Ast: 200 }).statut).toMatchObject({ etat: 'non-applicable', motif: 'motif.recouvrement-ast-min' });
  });
  it('c_s > 0,5 l_sd : non applicable', () => {
    expect(cel({ ...boucles, cs: 160 }).statut).toMatchObject({ motif: 'motif.recouvrement-cs' });
  });
  it('omega >= 0,5 : k_st = 1', () => {
    expect(cel({ ...boucles, Ast: 500 }).intermediaires.k_st.valeur).toBe(1);
  });
});

describe('recouvrement par barres a tete (11.5.5)', () => {
  const cel = (e: object) => calculerMatrice(recouvrementTete, e).cellules.find((c) => c.generation === 'ec2-2023')!;
  it('b_h1 = 35,45 mm, A_c = 9784 mm2, k_st = 0,97080, T_Rd,c = 39,93 kN', () => {
    const c = cel(tetes);
    expect(c.intermediaires.b_h1.valeur).toBeCloseTo(35.449077, 5);
    expect(c.intermediaires.A_c.valeur).toBeCloseTo(9783.9453, 3);
    expect(c.intermediaires.k_st.valeur).toBeCloseTo(0.9707987, 6);
    expect(c.resistance).toBeCloseTo(39.934774, 5);
    expect(c.intermediaires['A_st,min (11.21)'].valeur).toBeCloseTo(80.383313, 5);
    expect(c.intermediaires['A_std,min (11.22)'].valeur).toBeCloseTo(17.28, 9);
  });
  it('2004 : sans equivalent', () => {
    const c = calculerMatrice(recouvrementTete, tetes).cellules.find((x) => x.generation === 'ec2-2004')!;
    expect(c.statut).toMatchObject({ motif: 'motif.sans-equivalent-2004' });
  });
});
