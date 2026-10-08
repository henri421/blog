import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { armatureScellee } from '../../../src/noyau/mecanismes/armature-scellee/index';

// Valeurs attendues calculees a la main (docs/validation/armature-scellee.md).

const reprise = { phi: 16, fck: 30, fyk: 500, sigmaSd: 250, adherence: 'bonne', cs: 200, cx: 50, cy: 50, kbpi: 0.8, lDispo: 600 };
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(armatureScellee, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('armature scellee', () => {
  it('HA16, C30 : l_bd = 469,3 mm, l_bd,pi = 469,3/0,8 = 586,7 mm', () => {
    const c = cel(reprise, 'ec2-2023', 'barre-plastifiee');
    expect(c.intermediaires.l_bd.valeur).toBeCloseTo(469.344, 2);
    expect(c.sollicitation).toBeCloseTo(586.68, 1);
  });

  it('f_ck limitee a 50 MPa : C60 donne 363,6/0,8 = 454,4 mm', () => {
    expect(cel({ ...reprise, fck: 60 }, 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(454.44, 1);
  });

  it('plancher 10 phi alpha_lb = 240 mm a 250 MPa : 204,6/0,8 = 255,8 mm', () => {
    expect(cel(reprise, 'ec2-2023', 'contrainte-reelle').sollicitation).toBeCloseTo(255.801, 2);
  });

  it('premiere generation sans equivalent ; sigma_sd > 435 refuse', () => {
    expect(cel(reprise, 'ec2-2004', 'sans-equivalent').statut).toMatchObject({ motif: 'motif.sans-equivalent-2004' });
    expect(cel({ ...reprise, sigmaSd: 450 }, 'ec2-2023', 'contrainte-reelle').statut).toMatchObject({ motif: 'motif.scellee-sigma-435' });
  });
});
