import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { pretension } from '../../../src/noyau/mecanismes/pretension/index';

// Valeurs attendues calculees a la main (docs/validation/pretension.md).

const poutre = {
  armature: 'toron',
  phiP: 15.7,
  sigmaPm0: 1200,
  relachement: 'progressif',
  adherence: 'bonne',
  fck: 45,
  fckt: 30,
  d: 400,
  sigmaPd: 1400,
  sigmaPmInf: 1000,
  fatigue: 'non',
  lDispo: 2000,
};
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(pretension, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('pre-tension, toron T15,7', () => {
  it('2004 : beta_cc = 38/53, f_bpt = 4,064 MPa, l_pt = 880,9 mm', () => {
    const c = cel(poutre, 'ec2-2004', 'transmission');
    expect(c.intermediaires['β_cc(t)'].valeur).toBeCloseTo(38 / 53, 12);
    expect(c.intermediaires.f_bpt.valeur).toBeCloseTo(4.0638, 4);
    expect(c.intermediaires.l_pt.valeur).toBeCloseTo(880.86, 2);
    expect(c.sollicitation).toBeCloseTo(1.2 * 880.86, 1);
    expect(c.intermediaires.l_disp.valeur).toBeCloseTo(967.4, 1);
  });

  it('2023 : l_pt = 0,26 x 1200 x 15,7 / racine 30 = 894,3 mm', () => {
    expect(cel(poutre, 'ec2-2023', 'transmission').intermediaires.l_pt.valeur).toBeCloseTo(894.321, 3);
  });

  it('ancrage : l_bpd = 1618,4 (2004) et 1560,0 mm (2023) ; 1803,4 mm sous fatigue', () => {
    expect(cel(poutre, 'ec2-2004', 'ancrage').sollicitation).toBeCloseTo(1618.419, 2);
    expect(cel(poutre, 'ec2-2023', 'ancrage').sollicitation).toBeCloseTo(1559.993, 2);
    expect(cel({ ...poutre, fatigue: 'oui' }, 'ec2-2023', 'ancrage').sollicitation).toBeCloseTo(1803.396, 2);
  });

  it('relachement brutal : alpha_1 = 1,25', () => {
    expect(cel({ ...poutre, relachement: 'brutal' }, 'ec2-2023', 'transmission').intermediaires.l_pt.valeur).toBeCloseTo(1.25 * 894.321, 2);
  });

  it('f_ck(t) > f_ck : non applicable', () => {
    expect(cel({ ...poutre, fckt: 50 }, 'ec2-2023', 'transmission').statut).toMatchObject({ motif: 'motif.fckt-sup-fck' });
  });
});
