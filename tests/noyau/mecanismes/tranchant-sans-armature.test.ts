import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { tranchantSansArmature, type EntreeTsa } from '../../../src/noyau/mecanismes/tranchant-sans-armature/index';
import { ddg2023 } from '../../../src/noyau/materiaux';

// Valeurs attendues calculees a la main (docs/validation/tranchant-sans-armature.md).

/** Dalle de logement, 22 cm, HA12/150, C25/30, par metre de largeur. */
const dalle = (): EntreeTsa => ({ VEd: 60, MEd: 15, bw: 1000, d: 190, Asl: 754, fck: 25, fyk: 500, Dlower: 16 });
/** Radier de 50 cm fortement arme, HA25/100, C30/37, loin de l appui. */
const radier = (): EntreeTsa => ({ VEd: 400, MEd: 1000, bw: 1000, d: 450, Asl: 4909, fck: 30, fyk: 500, Dlower: 16 });

const cel = (e: EntreeTsa, g: string, n: string) =>
  calculerMatrice(tranchantSansArmature, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('effort tranchant sans armature, dalle de logement', () => {
  it('premiere generation : V_Rd,c = 97,98 kN/m, k plafonne a 2', () => {
    const c = cel(dalle(), 'ec2-2004', 'base');
    expect(c.intermediaires.k.valeur).toBe(2);
    expect(c.intermediaires['v_Rd,c'].valeur).toBeCloseTo(0.5157, 4);
    expect(c.intermediaires.v_min.valeur).toBeCloseTo(0.49497, 4);
    expect(c.resistance).toBeCloseTo(97.98, 2);
  });

  it('deuxieme generation : tau_Rdc,min = 0,7732 MPa gouverne les trois niveaux, 132,22 kN/m', () => {
    for (const n of ['tau-min', 'hauteur-utile', 'portee-mecanique']) {
      const c = cel(dalle(), 'ec2-2023', n);
      expect(c.intermediaires['τ_Rdc,min'].valeur).toBeCloseTo(0.77321, 4);
      expect(c.resistance, n).toBeCloseTo(132.22, 2);
    }
    expect(cel(dalle(), 'ec2-2023', 'hauteur-utile').intermediaires['τ_Rd,c (8.27)'].valeur).toBeCloseTo(0.55942, 4);
    const n3 = cel(dalle(), 'ec2-2023', 'portee-mecanique');
    expect(n3.intermediaires.a_cs.valeur).toBe(250);
    expect(n3.intermediaires.a_v.valeur).toBeCloseTo(108.97, 2);
    expect(n3.intermediaires['τ_Rd,c (a_v)'].valeur).toBeCloseTo(0.67331, 4);
  });

  it('sans moment, le niveau 3 est non applicable et nomme le moment', () => {
    const c = cel({ ...dalle(), MEd: undefined }, 'ec2-2023', 'portee-mecanique');
    expect(c.statut).toEqual({ etat: 'non-applicable', motif: 'motif.donnees-manquantes', donneesManquantes: ['champ.MEd'] });
  });

  it('sans granulat declare, toute la deuxieme generation est non applicable, la premiere reste calculee', () => {
    const m = calculerMatrice(tranchantSansArmature, { ...dalle(), Dlower: undefined });
    for (const c of m.cellules) expect(c.statut.etat).toBe(c.generation === 'ec2-2004' ? 'calcule' : 'non-applicable');
  });

  it('niveau 1 sans ferraillage longitudinal saisi', () => {
    expect(cel({ ...dalle(), Asl: undefined }, 'ec2-2023', 'tau-min').resistance).toBeCloseTo(132.22, 2);
  });
});

describe('effort tranchant sans armature, radier loin de l appui', () => {
  it('a_cs = 2500 mm >= 4 d : le niveau 3 est non applicable et nomme la condition (8.2.2(3))', () => {
    expect(cel(radier(), 'ec2-2004', 'base').resistance).toBeCloseTo(287.88, 2);
    expect(cel(radier(), 'ec2-2023', 'tau-min').resistance).toBeCloseTo(222.90, 2);
    expect(cel(radier(), 'ec2-2023', 'hauteur-utile').resistance).toBeCloseTo(253.02, 2);
    expect(cel(radier(), 'ec2-2023', 'portee-mecanique').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.acs-sup-4d',
      donneesManquantes: [],
    });
  });

  it('juste sous 4 d, le niveau 3 redevient applicable', () => {
    // a_cs = 1790 mm < 1800 mm
    expect(cel({ ...radier(), MEd: 716 }, 'ec2-2023', 'portee-mecanique').statut.etat).toBe('calcule');
  });
});

describe('domaine et erreurs', () => {
  it('fck > 90 MPa est hors domaine dans les deux generations', () => {
    for (const c of calculerMatrice(tranchantSansArmature, { ...dalle(), fck: 100 }).cellules) {
      expect(c.statut).toEqual({ etat: 'hors-domaine', motif: 'motif.fck-sup-90' });
    }
  });

  it('D_lower < 8 mm est hors du domaine de la deuxieme generation seulement', () => {
    const m = calculerMatrice(tranchantSansArmature, { ...dalle(), Dlower: 4 });
    for (const c of m.cellules) {
      expect(c.statut.etat).toBe(c.generation === 'ec2-2004' ? 'calcule' : 'hors-domaine');
    }
  });

  it('une largeur nulle leve une erreur nommant la grandeur', () => {
    expect(() => calculerMatrice(tranchantSansArmature, { ...dalle(), bw: 0 })).toThrow(/bw/);
  });

  it('d_dg : 16 + D_lower plafonne a 40 mm, reduit au-dela de 60 MPa', () => {
    expect(ddg2023(30, 16)).toBe(32);
    expect(ddg2023(30, 32)).toBe(40);
    expect(ddg2023(80, 16)).toBeCloseTo(25, 12);
  });
});
