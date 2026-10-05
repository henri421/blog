import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { armatureTranchantMinimale, reductionDuctilite } from '../../../src/noyau/mecanismes/armature-tranchant-minimale/index';

// Valeurs attendues calculees a la main (docs/validation/armatures-minimales.md).

const cadres = { Asw: 100.5, s: 400, bw: 300, alpha: 90, fck: 30, fyk: 500, classe: 'B' };
const cel = (e: object, g: string, n: string) => calculerMatrice(armatureTranchantMinimale, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('armatures minimales d effort tranchant', () => {
  it('rho_w = 0,0008375 ; minimum 0,0008764 en 2004 et 2023 sans reduction', () => {
    expect(cel(cadres, 'ec2-2004', 'base').resistance).toBeCloseTo(0.0008375, 10);
    expect(cel(cadres, 'ec2-2004', 'base').sollicitation).toBeCloseTo((0.08 * Math.sqrt(30)) / 500, 12);
    expect(cel(cadres, 'ec2-2023', 'base').sollicitation).toBeCloseTo((0.08 * Math.sqrt(30)) / 500, 12);
  });

  it('2023 : reduction de 10 % (B) ou 20 % (C), aucune pour A', () => {
    expect(cel(cadres, 'ec2-2023', 'ductilite').sollicitation).toBeCloseTo((0.9 * 0.08 * Math.sqrt(30)) / 500, 12);
    expect([reductionDuctilite('A'), reductionDuctilite('B'), reductionDuctilite('C')]).toEqual([0, 0.1, 0.2]);
  });

  it('armatures inclinees : sin alpha au denominateur', () => {
    expect(cel({ ...cadres, alpha: 45 }, 'ec2-2023', 'base').resistance).toBeCloseTo(100.5 / (400 * 300 * Math.SQRT1_2), 12);
  });
});
