import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { poinconnementArme, type EntreePoinconnementArme } from '../../../src/noyau/mecanismes/poinconnement-arme/index';

// Valeurs attendues calculees a la main (docs/validation/poinconnement-arme.md).

/** Plancher-dalle de 24 cm, poteau 30 x 30, HA14/150, 10 rails de goujons phi 10, s_r = 140 mm. */
const plancher = (systeme = 'goujons'): EntreePoinconnementArme => ({
  VEd: 480,
  c1: 300,
  c2: 300,
  dx: 205,
  dy: 190,
  Asx: 1026,
  Asy: 1026,
  fck: 30,
  fyk: 500,
  Dlower: 16,
  systeme,
  phiW: 10,
  nBrins: 10,
  sr: 140,
});

const cel = (e: EntreePoinconnementArme, g: string) =>
  calculerMatrice(poinconnementArme, e).cellules.find((c) => c.generation === g)!;

describe('poinconnement avec armatures', () => {
  it('2004 : le plafond k_max = 1,5 de l A1 gouverne, V_Rd = 568,74 kN', () => {
    const c = cel(plancher(), 'ec2-2004');
    expect(c.intermediaires['f_ywd,ef'].valeur).toBeCloseTo(299.375, 6);
    expect(c.intermediaires['v_Rd,cs (6.52)'].valeur).toBeCloseTo(1.133951, 5);
    expect(c.intermediaires['v_Rd,cs'].valeur).toBeCloseTo(0.899444, 5);
    expect(c.resistance).toBeCloseTo(568.736, 2);
  });

  it('2023, goujons : eta_c = 0,7991, eta_s plafonne a 0,8, V_Rd = 641,63 kN', () => {
    const c = cel(plancher(), 'ec2-2023');
    expect(c.intermediaires['τ_Ed'].valeur).toBeCloseTo(1.535288, 5);
    expect(c.intermediaires['η_c'].valeur).toBeCloseTo(0.799103, 5);
    expect(c.intermediaires['η_s'].valeur).toBe(0.8);
    expect(c.intermediaires['τ_Rd,cs'].valeur).toBeCloseTo(2.05225, 4);
    expect(c.intermediaires['η_sys'].valeur).toBeCloseTo(1.689109, 5);
    expect(c.resistance).toBeCloseTo(641.626, 2);
  });

  it('2023, etriers : le plafond eta_sys gouverne, V_Rd = 571,18 kN', () => {
    const c = cel(plancher('etriers'), 'ec2-2023');
    expect(c.intermediaires['η_sys'].valeur).toBeCloseTo(1.489109, 5);
    expect(c.resistance).toBeCloseTo(571.176, 2);
  });

  it('la resistance de deuxieme generation depend de la sollicitation par eta_c', () => {
    const a = cel({ ...plancher(), VEd: 400 }, 'ec2-2023').intermediaires['τ_Rd,cs'].valeur;
    const b = cel({ ...plancher(), VEd: 480 }, 'ec2-2023').intermediaires['τ_Rd,cs'].valeur;
    expect(a).toBeGreaterThan(b);
  });
});
