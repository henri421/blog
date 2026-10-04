import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import {
  fissurationMinimale,
  k2004,
  kh2023,
  nonFragilite,
  type EntreeArmaturesMinimales,
} from '../../../src/noyau/mecanismes/armatures-minimales/index';

// Valeurs attendues calculees a la main (docs/validation/armatures-minimales.md).

const dalle = (): EntreeArmaturesMinimales => ({ b: 1000, h: 200, d: 172, fck: 25, fyk: 500, As: 565 });
const poutre = (): EntreeArmaturesMinimales => ({ b: 300, h: 600, d: 550, fck: 30, fyk: 500, As: 402 });

const nf = (e: EntreeArmaturesMinimales, g: string, n: string) =>
  calculerMatrice(nonFragilite, e).cellules.find((c) => c.generation === g && c.niveau === n)!;
const fm = (e: EntreeArmaturesMinimales, g: string) =>
  calculerMatrice(fissurationMinimale, e).cellules.find((c) => c.generation === g)!;

describe('non-fragilite', () => {
  it('dalle : 229,4 mm2 en 2004 ; 220,9 puis 201,2 mm2 en 2023', () => {
    expect(nf(dalle(), 'ec2-2004', 'base').sollicitation).toBeCloseTo(229.4104, 3);
    expect(nf(dalle(), 'ec2-2023', 'z-forfaitaire').sollicitation).toBeCloseTo(220.9271, 3);
    expect(nf(dalle(), 'ec2-2023', 'z-equilibre').sollicitation).toBeCloseTo(201.1877, 3);
  });

  it('poutre : 248,5 mm2 en 2004 ; 210,7 puis 191,4 mm2 en 2023', () => {
    expect(nf(poutre(), 'ec2-2004', 'base').sollicitation).toBeCloseTo(248.517, 2);
    expect(nf(poutre(), 'ec2-2023', 'z-forfaitaire').sollicitation).toBeCloseTo(210.6522, 3);
    expect(nf(poutre(), 'ec2-2023', 'z-equilibre').sollicitation).toBeCloseTo(191.4379, 3);
  });

  it('le plancher 0,0013 b d gouverne pour un beton faible', () => {
    const c = nf({ ...dalle(), fck: 12 }, 'ec2-2004', 'base');
    expect(c.sollicitation).toBeCloseTo(0.0013 * 1000 * 172, 9);
  });
});

describe('maitrise de la fissuration', () => {
  it('dalle : 205,2 mm2 (k = 1) en 2004 ; 164,2 mm2 (k_h = 0,8) en 2023', () => {
    expect(fm(dalle(), 'ec2-2004').sollicitation).toBeCloseTo(205.1971, 3);
    expect(fm(dalle(), 'ec2-2023').sollicitation).toBeCloseTo(164.1577, 3);
  });

  it('poutre : 164,8 mm2 (k = 0,79) en 2004 ; 166,8 mm2 en 2023', () => {
    expect(fm(poutre(), 'ec2-2004').sollicitation).toBeCloseTo(164.7511, 3);
    expect(fm(poutre(), 'ec2-2023').sollicitation).toBeCloseTo(166.8366, 3);
  });

  it('coefficients k et k_h', () => {
    expect(k2004(300)).toBe(1);
    expect(k2004(550)).toBeCloseTo(0.825, 12);
    expect(k2004(900)).toBe(0.65);
    expect(kh2023(1000, 200)).toBe(0.8);
    expect(kh2023(1000, 600)).toBeCloseTo(0.62, 12);
    expect(kh2023(2000, 1500)).toBe(0.5);
  });
});
