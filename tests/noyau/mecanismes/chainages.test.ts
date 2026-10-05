import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { chainages } from '../../../src/noyau/mecanismes/chainages/index';

// Valeurs attendues calculees a la main (docs/validation/chainages.md).

const plancher = { type: 'interieur', gk: 6, qk: 3, psi: 0.5, st: 6, Lt: 7.5, fyk: 500 };
const cel = (e: object, g: string) => calculerMatrice(chainages, e).cellules.find((c) => c.generation === g)!;

describe('chainages', () => {
  it('interieur : 120 kN (2004), 270 kN (2023, en reserve), A_s = T / f_yk', () => {
    expect(cel(plancher, 'ec2-2004').resistance).toBe(120);
    const c = cel(plancher, 'ec2-2023');
    expect(c.statut.etat).toBe('reserve');
    expect(c.resistance).toBeCloseTo(270, 10);
    expect(c.intermediaires.A_s.valeur).toBeCloseTo(540, 10);
  });

  it('peripherique : min(10 l ; 70) = 70 kN (2004), 135 kN (2023)', () => {
    expect(cel({ ...plancher, type: 'peripherique' }, 'ec2-2004').resistance).toBe(70);
    expect(cel({ ...plancher, type: 'peripherique' }, 'ec2-2023').resistance).toBeCloseTo(135, 10);
  });

  it('plancher de 75 kN en 2023 pour une faible charge', () => {
    expect(cel({ ...plancher, gk: 1, qk: 0, st: 3, Lt: 4 }, 'ec2-2023').resistance).toBe(75);
  });
});
