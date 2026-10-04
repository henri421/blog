import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { cisaillementInterface, type EntreeInterface } from '../../../src/noyau/mecanismes/interface/index';

// Valeurs attendues calculees a la main (docs/validation/interface.md).

/** Dalle sur predalle, interface lisse, sans armature d interface. */
const predalle = (Asi = 0): EntreeInterface => ({
  VEd: 45,
  beta: 1,
  z: 153,
  bi: 1000,
  rugosite: 'lisse',
  fck: 25,
  fyk: 500,
  Asi,
  alpha: 90,
  sigmaN: 0,
});

const cel = (e: EntreeInterface, g: string, n: string) =>
  calculerMatrice(cisaillementInterface, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('interface lisse sans armature', () => {
  it('tau_Edi = 0,2941 MPa dans les deux generations', () => {
    expect(cel(predalle(), 'ec2-2004', 'base').sollicitation).toBeCloseTo(0.294118, 5);
    expect(cel(predalle(), 'ec2-2023', 'armatures-ancrees').sollicitation).toBeCloseTo(0.294118, 5);
  });

  it('2004 : c f_ctd = 0,2394 MPa ; 2023 : c_v1 sqrt(fck)/gamma_C = 0,2667 MPa', () => {
    expect(cel(predalle(), 'ec2-2004', 'base').resistance).toBeCloseTo(0.239397, 5);
    expect(cel(predalle(), 'ec2-2023', 'armatures-ancrees').resistance).toBeCloseTo(0.266667, 5);
  });

  it('2023, ancrage insuffisant : c_v2 = 0 pour une surface lisse, resistance nulle', () => {
    const c = cel(predalle(), 'ec2-2023', 'ancrage-insuffisant');
    expect(c.resistance).toBe(0);
    expect(c.taux).toBeUndefined();
  });
});

describe('interface lisse avec 300 mm2/m d armatures', () => {
  it('2004 : 0,3177 MPa ; 2023 : 0,3449 puis 0,0650 MPa', () => {
    expect(cel(predalle(300), 'ec2-2004', 'base').resistance).toBeCloseTo(0.317658, 5);
    expect(cel(predalle(300), 'ec2-2023', 'armatures-ancrees').resistance).toBeCloseTo(0.344928, 5);
    expect(cel(predalle(300), 'ec2-2023', 'ancrage-insuffisant').resistance).toBeCloseTo(0.065029, 5);
  });
});

describe('rugosite et conditions', () => {
  it('rugueuse : 0,4788 MPa en 2004, 0,5 MPa en 2023', () => {
    const e = { ...predalle(), rugosite: 'rugueuse' };
    expect(cel(e, 'ec2-2004', 'base').resistance).toBeCloseTo(0.478793, 5);
    expect(cel(e, 'ec2-2023', 'armatures-ancrees').resistance).toBeCloseTo(0.5, 9);
  });

  it('interface a cles : la formule (8.77) est sans objet', () => {
    expect(cel({ ...predalle(), rugosite: 'a-cles' }, 'ec2-2023', 'ancrage-insuffisant').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.cles-8-77',
      donneesManquantes: [],
    });
  });

  it('angle de 120 degres : permis en 2023, pas en 2004', () => {
    const e = { ...predalle(300), alpha: 120 };
    expect(cel(e, 'ec2-2004', 'base').statut.etat).toBe('non-applicable');
    expect(cel(e, 'ec2-2023', 'armatures-ancrees').statut.etat).toBe('calcule');
  });

  it('traction sur l interface : cohesion annulee dans les deux generations', () => {
    const e = { ...predalle(), sigmaN: -0.1 };
    // 2004 : c f_ctd = 0 mais mu sigma_n reste compte (negatif), ecrete par rien : 0,6 x -0,1.
    expect(cel(e, 'ec2-2004', 'base').resistance).toBeCloseTo(-0.06, 9);
    expect(cel(e, 'ec2-2023', 'armatures-ancrees').resistance).toBe(0);
  });
});
