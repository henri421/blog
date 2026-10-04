import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { sectionCreuse, sectionReduite2023, torsion, type EntreeTorsion } from '../../../src/noyau/mecanismes/torsion/index';

// Valeurs attendues calculees a la main par balayage de cot(theta)
// (docs/validation/torsion.md).

const poutre = (): EntreeTorsion => ({ TEd: 30, b: 300, h: 500, a: 45, c: 30, Asw: 78.54, s: 150, Asl: 679, fck: 30, fyk: 500 });
const carree = (): EntreeTorsion => ({ TEd: 40, b: 400, h: 400, a: 50, c: 40, Asw: 78.54, s: 150, Asl: 904, fck: 30, fyk: 500 });

const cel = (e: EntreeTorsion, g: string, n: string) =>
  calculerMatrice(torsion, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('section creuse equivalente', () => {
  it('poutre 300 x 500 : t_ef = A/u = 93,75 mm, A_k = 83 789 mm2, u_k = 1225 mm', () => {
    const s = sectionCreuse(300, 500, 45);
    expect(s.tef).toBe(93.75);
    expect(s.Ak).toBeCloseTo(83789.0625, 6);
    expect(s.uk).toBeCloseTo(1225, 9);
  });

  it('t_ef au moins deux fois la distance a l axe', () => {
    expect(sectionCreuse(300, 500, 60).tef).toBe(120);
  });

  it('section trapue a fort enrobage : reduite en 2023 (8.3.4(5))', () => {
    const r = sectionReduite2023(carree() as Required<EntreeTorsion>);
    expect(r.reduite).toBe(true);
    expect(r.b).toBeCloseTo(376, 9);
  });
});

describe('torsion de la poutre 30 x 50', () => {
  it('2004 et 2023 optimise : armatures determinantes, 39,251 kN.m', () => {
    expect(cel(poutre(), 'ec2-2004', 'base').resistance).toBeCloseTo(39.2515, 3);
    expect(cel(poutre(), 'ec2-2023', 'cot-variable').resistance).toBeCloseTo(39.2514, 3);
  });

  it('2023, cot = 1 : 38,150 kN.m', () => {
    expect(cel(poutre(), 'ec2-2023', 'cot-1').resistance).toBeCloseTo(38.1495, 3);
  });
});

describe('torsion de la section carree 40 x 40', () => {
  it('2004 : 49,152 kN.m ; 2023 : 36,208 (cot = 1) et 44,795 kN.m (section reduite)', () => {
    expect(cel(carree(), 'ec2-2004', 'base').resistance).toBeCloseTo(49.1516, 3);
    expect(cel(carree(), 'ec2-2023', 'cot-1').resistance).toBeCloseTo(36.2076, 3);
    expect(cel(carree(), 'ec2-2023', 'cot-variable').resistance).toBeCloseTo(44.795, 2);
  });
});
