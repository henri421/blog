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
