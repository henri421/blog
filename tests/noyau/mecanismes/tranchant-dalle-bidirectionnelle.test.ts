import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import {
  tranchantDalleBidirectionnelle,
  type EntreeDalleBidirectionnelle,
} from '../../../src/noyau/mecanismes/tranchant-dalle-bidirectionnelle/index';

// Valeurs attendues calculees a la main (docs/validation/tranchant-dalle-bidirectionnelle.md).

const dalle = (): EntreeDalleBidirectionnelle => ({ vx: 80, vy: 60, dx: 190, dy: 178, Asx: 754, Asy: 565, fck: 30, fyk: 500, Dlower: 16 });
const cel = (e: EntreeDalleBidirectionnelle, g: string, n: string) =>
  calculerMatrice(tranchantDalleBidirectionnelle, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('effort tranchant des dalles portant dans deux directions', () => {
  it('v_Ed = 100 kN/m, alpha_v = 36,87 degres, rho_l = 0,0020368', () => {
    const c = cel(dalle(), 'ec2-2023', 'paliers');
    expect(c.sollicitation).toBeCloseTo(100, 12);
    expect(c.intermediaires['α_v'].valeur).toBeCloseTo(36.8699, 4);
    expect(c.intermediaires['ρ_l'].valeur).toBeCloseTo(0.0020368, 7);
  });

  it('paliers : d = 184 mm, 142,53 kN/m ; angle : d = 185,68 mm, 143,18 kN/m', () => {
    expect(cel(dalle(), 'ec2-2023', 'paliers').intermediaires.d.valeur).toBe(184);
    expect(cel(dalle(), 'ec2-2023', 'paliers').resistance).toBeCloseTo(142.5331, 3);
    expect(cel(dalle(), 'ec2-2023', 'angle').intermediaires.d.valeur).toBeCloseTo(185.68, 10);
    expect(cel(dalle(), 'ec2-2023', 'angle').resistance).toBeCloseTo(143.1823, 3);
  });

  it('paliers extremes : direction x seule si v_y/v_x <= 0,5, y seule si >= 2', () => {
    const x = cel({ ...dalle(), vy: 40 }, 'ec2-2023', 'paliers');
    expect(x.intermediaires.d.valeur).toBe(190);
    expect(x.intermediaires['ρ_l'].valeur).toBeCloseTo(754 / 190000, 12);
    const y = cel({ ...dalle(), vy: 160 }, 'ec2-2023', 'paliers');
    expect(y.intermediaires.d.valeur).toBe(178);
    expect(y.intermediaires['ρ_l'].valeur).toBeCloseTo(565 / 178000, 12);
  });

  it('premiere generation : non applicable, sans equivalent', () => {
    expect(cel(dalle(), 'ec2-2004', 'sans-equivalent').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.sans-equivalent-2004',
      donneesManquantes: [],
    });
  });
});
