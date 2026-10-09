import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { teteAncrage } from '../../../src/noyau/mecanismes/tete-ancrage/index';

// Valeurs attendues calculees a la main (docs/validation/tete-ancrage.md).

const voile = { phi: 20, fck: 30, Dlower: 16, phiH: 64, th: 16, fissuration: 'non-fissure', ay: 60, ax: 200, sx: 250, sigmaSd: 400 };
const cel = (e: object, g: string) => calculerMatrice(teteAncrage, e).cellules.find((c) => c.generation === g)!;

describe('tete d ancrage, conditions de 11.4.7(1)', () => {
  it('HA20, tete de 64 mm : conditions remplies, 435 MPa, taux 400/435', () => {
    const c = cel(voile, 'ec2-2023');
    expect(c.statut.etat).toBe('calcule');
    expect(c.resistance).toBe(435);
    expect(c.taux).toBeCloseTo(400 / 435, 12);
    expect(c.intermediaires.d_dg.valeur).toBe(32);
    expect(c.intermediaires['a_x,min'].valeur).toBeCloseTo(196.8, 10);
    expect(c.intermediaires['s_x,min'].valeur).toBe(240);
  });

  it('premiere generation : sans equivalent', () => {
    expect(cel(voile, 'ec2-2004').statut).toMatchObject({ motif: 'motif.sans-equivalent-2004' });
  });

  it('beton fissure : a_y = 60 < 4 phi = 80 mm', () => {
    expect(cel({ ...voile, fissuration: 'fissure' }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.tete-bord' });
  });

  it('granulat D_lower = 8 : d_dg = 24 < 32 mm', () => {
    expect(cel({ ...voile, Dlower: 8 }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.tete-materiaux' });
  });

  it('tete trop petite ou trop mince', () => {
    expect(cel({ ...voile, phiH: 56 }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.tete-dimensions' });
    expect(cel({ ...voile, th: 15 }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.tete-dimensions' });
  });

  it('angle : a_x = 150 < 196,8 mm ; a_x et a_y permutes si a_x < a_y', () => {
    expect(cel({ ...voile, ax: 150 }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.tete-angle' });
    expect(cel({ ...voile, ax: 60, ay: 200 }, 'ec2-2023').statut.etat).toBe('calcule');
  });

  it('groupe : s_x = 200 < 240 mm ; barre isolee sans s_x', () => {
    expect(cel({ ...voile, sx: 200 }, 'ec2-2023').statut).toMatchObject({ motif: 'motif.tete-espacement' });
    expect(cel({ ...voile, sx: undefined }, 'ec2-2023').statut.etat).toBe('calcule');
  });
});

const general = (e: object) => calculerMatrice(teteAncrage, e).cellules.find((c) => c.niveau === 'general')!;

describe('tete d ancrage, verification generale (11.8) a (11.10)', () => {
  it('voile fissure : a_d = a_y = 60, nu = 8, k_h,A = 9,24, sigma = 427,28 MPa', () => {
    const c = general({ ...voile, fissuration: 'fissure' });
    expect(c.statut.etat).toBe('calcule');
    expect(c.intermediaires['k_h,A'].valeur).toBeCloseTo(9.24, 12);
    expect(c.intermediaires.a_d.valeur).toBe(60);
    expect(c.resistance).toBeCloseTo(427.276003, 5);
    expect(c.taux).toBeCloseTo(0.93616304, 7);
  });

  it('beton non fissure : nu = 11, 528,60 MPa', () => {
    expect(general(voile).resistance).toBeCloseTo(528.599504, 5);
  });

  it('barre isolee proche de l angle : a_d = 0,5 a_y + 0,25 a_x - 0,3 phi_h = 48,3 mm', () => {
    const c = general({ ...voile, fissuration: 'fissure', ax: 150, sx: undefined });
    expect(c.intermediaires.a_d.valeur).toBeCloseTo(48.3, 10);
    expect(c.resistance).toBeCloseTo(374.587782, 5);
  });

  it('groupe serre s_x = 150 < 4 a_y : a_d (11.10) = 32,29 mm', () => {
    const c = general({ ...voile, fissuration: 'fissure', sx: 150 });
    expect(c.intermediaires.a_d.valeur).toBeCloseTo(32.289764, 5);
    expect(c.resistance).toBeCloseTo(302.489419, 5);
    expect(c.clauses).toContain('(11.10)');
  });

  it('tete plus large que 4 t_h : non applicable', () => {
    expect(general({ ...voile, th: 10 }).statut).toMatchObject({ etat: 'non-applicable', motif: 'motif.tete-epaisseur' });
  });
});
