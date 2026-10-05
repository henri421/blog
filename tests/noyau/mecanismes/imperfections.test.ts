import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { imperfections, type EntreeImperfections } from '../../../src/noyau/mecanismes/imperfections/index';

// Valeurs attendues calculees a la main (docs/validation/imperfections.md).

const contreventement = (): EntreeImperfections => ({ effet: 'contreventement', l: 30000, m: 10, N: 8000, contrevente: 'non' });
const poteau = (): EntreeImperfections => ({ effet: 'element', l: 3200, m: 1, N: 1500, contrevente: 'oui', l0: 3200 });
const cel = (e: EntreeImperfections, g: string, n: string) =>
  calculerMatrice(imperfections, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('imperfections geometriques', () => {
  it('contreventement de 30 m : alpha_h borne a 2/3 en 2004, a 0,4 en 2023', () => {
    const a = cel(contreventement(), 'ec2-2004', 'inclinaison');
    expect(a.intermediaires['α_h'].valeur).toBeCloseTo(2 / 3, 12);
    expect(a.resistance).toBeCloseTo(0.00247207, 8);
    expect(a.intermediaires.H_i.valeur).toBeCloseTo(19.7765, 3);
    const b = cel(contreventement(), 'ec2-2023', 'inclinaison');
    expect(b.intermediaires['α_h'].valeur).toBe(0.4);
    expect(b.resistance).toBeCloseTo(0.00148324, 8);
    expect(b.intermediaires.H_i.valeur).toBeCloseTo(11.8659, 3);
  });

  it('poteau contreventé de 3,2 m : theta = 1/200, H = 2 theta N = 15 kN, e_i = 8 mm', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      const c = cel(poteau(), g, 'excentricite');
      expect(c.resistance).toBeCloseTo(0.005, 12);
      expect(c.intermediaires.H_i.valeur).toBeCloseTo(15, 10);
      expect(c.intermediaires.e_i.valeur).toBeCloseTo(8, 10);
      expect(cel(poteau(), g, 'simplifie').intermediaires.e_i.valeur).toBe(8);
    }
  });

  it('diaphragme intermediaire : H = theta (N_a + N_b)/2', () => {
    const c = cel({ ...contreventement(), effet: 'diaphragme-intermediaire', l: 3000, m: 4, N: 2000 }, 'ec2-2023', 'inclinaison');
    expect(c.intermediaires.H_i.valeur).toBeCloseTo((c.resistance as number) * 1000, 12);
  });

  it('2023 : amplitude d un mode sinusoidal a_i = theta l_aw / 2', () => {
    const c = cel({ ...poteau(), law: 6000 }, 'ec2-2023', 'mode');
    expect(c.intermediaires.a_i.valeur).toBeCloseTo(15, 10);
  });

  it('excentricite et simplification non applicables hors element isole', () => {
    expect(cel({ ...contreventement(), l0: 3000 }, 'ec2-2023', 'excentricite').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.imperfection-element',
      donneesManquantes: [],
    });
    expect(cel({ ...poteau(), contrevente: 'non' }, 'ec2-2004', 'simplifie').statut.etat).toBe('non-applicable');
  });
});
