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
    const m = calculerMatrice(tranchantSansArmature, { ...dalle(), NEd: -100, h: 220, ep: 0, Dlower: undefined });
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
    for (const c of calculerMatrice(tranchantSansArmature, { ...dalle(), NEd: -100, h: 220, ep: 0, fck: 100 }).cellules) {
      expect(c.statut).toEqual({ etat: 'hors-domaine', motif: 'motif.fck-sup-90' });
    }
  });

  it('D_lower < 8 mm est hors du domaine de la deuxieme generation seulement', () => {
    const m = calculerMatrice(tranchantSansArmature, { ...dalle(), NEd: -100, h: 220, ep: 0, Dlower: 4 });
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

describe('niveau 4, annexe I.8.3.1 (I.7)', () => {
  it('dalle : epsilon_v = 0,5798 pour mille, tau = 0,6552 MPa, en reserve, sous le plancher du niveau 1', () => {
    const c = cel(dalle(), 'ec2-2023', 'annexe-i');
    expect(c.statut).toEqual({ etat: 'reserve', motif: 'reserve.annexe-i' });
    expect(c.intermediaires['ε_v'].valeur).toBeCloseTo(0.579771, 5);
    expect(c.intermediaires.x.valeur).toBeCloseTo(54.7426, 3);
    expect(c.intermediaires['τ_Rd,c (I.7)'].valeur).toBeCloseTo(0.655226, 5);
    expect(c.resistance).toBeCloseTo(112.0436, 3);
    expect(c.iterations).toBeGreaterThan(0);
    // Non monotone : rendu tel quel, sans plancher tau_Rdc,min.
    expect(c.resistance as number).toBeLessThan(cel(dalle(), 'ec2-2023', 'tau-min').resistance as number);
  });

  it('radier a 800 kN.m : epsilon_v = 2,1678 pour mille, tau = 0,4038 MPa', () => {
    const c = cel({ ...radier(), MEd: 800 }, 'ec2-2023', 'annexe-i');
    expect(c.intermediaires['ε_v'].valeur).toBeCloseTo(2.167781, 4);
    expect(c.intermediaires['τ_Rd,c (I.7)'].valeur).toBeCloseTo(0.403754, 5);
  });

  it('moment superieur a la capacite : non applicable, motif nomme', () => {
    expect(cel(radier(), 'ec2-2023', 'annexe-i').statut).toEqual({ etat: 'non-applicable', motif: 'motif.med-sup-mrd', donneesManquantes: [] });
  });

  it('moment nul : epsilon_v nul, tau = 0,33 gamma_def^(2/3) sqrt(fck) / gamma_V^3', () => {
    const c = cel({ ...dalle(), MEd: 0 }, 'ec2-2023', 'annexe-i');
    expect(c.intermediaires['τ_Rd,c (I.7)'].valeur).toBeCloseTo((0.33 * 1.33 ** (2 / 3) * 5) / 1.4 ** 3, 10);
  });
});

describe('niveau 5, annexe I.8.3.1(3), k_vd (I.8)', () => {
  const poutre = (): EntreeTsa => ({ VEd: 100, MEd: 250, bw: 400, d: 650, Asl: 1963, fck: 30, fyk: 500, Dlower: 16 });

  it('poutre d = 650 mm : k_vd = 0,9713, tau = 0,4748 MPa, en reserve', () => {
    const c = cel(poutre(), 'ec2-2023', 'annexe-i-kvd');
    expect(c.statut).toEqual({ etat: 'reserve', motif: 'reserve.annexe-i' });
    expect(c.intermediaires.k_vd.valeur).toBeCloseTo(0.971297, 5);
    expect(c.intermediaires['τ_Rd,c'].valeur).toBeCloseTo(0.474828, 5);
    expect(c.resistance).toBeCloseTo(111.1097, 3);
  });

  it('k_vd plafonne a 1 et plancher tau_Rdc,min conserve', () => {
    expect(cel({ ...poutre(), Asl: 2945 }, 'ec2-2023', 'annexe-i-kvd').intermediaires.k_vd.valeur).toBe(1);
    const c = cel({ ...poutre(), Asl: 1257 }, 'ec2-2023', 'annexe-i-kvd');
    expect(c.intermediaires['τ_Rd,c'].valeur).toBeCloseTo(c.intermediaires['τ_Rdc,min'].valeur, 12);
  });

  it('d <= 500 mm : non applicable, motif nomme', () => {
    expect(cel(dalle(), 'ec2-2023', 'annexe-i-kvd').statut).toEqual({ etat: 'non-applicable', motif: 'motif.d-inf-500', donneesManquantes: [] });
  });
});

describe('effort normal (6.2.2(1) ; 8.2.2(4) et (5))', () => {
  const comprimee = (): EntreeTsa => ({ VEd: 150, MEd: 120, NEd: -600, bw: 300, d: 450, h: 500, ep: 0, Asl: 1473, fck: 30, fyk: 500, Dlower: 16 });

  it('2004 : sigma_cp = 4 MPa, V_Rd,c = 167,37 kN', () => {
    const c = cel(comprimee(), 'ec2-2004', 'effort-normal');
    expect(c.intermediaires['σ_cp'].valeur).toBeCloseTo(4, 12);
    expect(c.resistance).toBeCloseTo(167.3695, 3);
  });

  it('2023 : k_vp = 0,25 ; d k_vp -> 120,50 kN ; a_v k_vp -> 137,94 kN', () => {
    expect(cel(comprimee(), 'ec2-2023', 'kvp').intermediaires.k_vp.valeur).toBeCloseTo(0.25, 12);
    expect(cel(comprimee(), 'ec2-2023', 'kvp').resistance).toBeCloseTo(120.5003, 3);
    expect(cel(comprimee(), 'ec2-2023', 'kvp-portee').resistance).toBeCloseTo(137.9384, 3);
  });

  it('2023 compression : k1 = 0,20, tau = 1,4248 <= tau_max = 1,4785, 173,11 kN', () => {
    const c = cel(comprimee(), 'ec2-2023', 'compression');
    expect(c.intermediaires.k_1.valeur).toBeCloseTo(0.2, 12);
    expect(c.intermediaires['τ_Rdc,max'].valeur).toBeCloseTo(1.478461, 5);
    expect(c.resistance).toBeCloseTo(173.1104, 3);
  });

  it('traction : k_vp = 1,25 abaisse la resistance, la variante (8.32) est non applicable', () => {
    const t = { ...comprimee(), NEd: 200 };
    expect(cel(t, 'ec2-2023', 'kvp').resistance).toBeCloseTo(70.469, 3);
    expect(cel(t, 'ec2-2023', 'compression').statut).toEqual({ etat: 'non-applicable', motif: 'motif.ned-pas-compression', donneesManquantes: [] });
    expect(cel(t, 'ec2-2004', 'effort-normal').resistance).toBeCloseTo(59.3695, 3);
  });

  it('k_vp plafonne inferieurement a 0,1', () => {
    expect(cel({ ...comprimee(), NEd: -5000 }, 'ec2-2023', 'kvp').intermediaires.k_vp.valeur).toBe(0.1);
  });

  it('annexe I non calculee quand un effort normal est saisi', () => {
    expect(cel(comprimee(), 'ec2-2023', 'annexe-i').statut).toEqual({ etat: 'non-applicable', motif: 'motif.annexe-i-effort-normal', donneesManquantes: [] });
  });
});
