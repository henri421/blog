import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { largeurParticipante } from '../../../src/noyau/mecanismes/largeur-participante/index';

// Valeurs attendues calculees a la main (docs/validation/largeur-participante.md).

const poutre = { bw: 300, b1: 1350, b2: 1350, l0: 6800 };
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(largeurParticipante, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('largeur participante', () => {
  it('poutre en T : b_eff,i = min(270 + 680 ; 1360 ; 1350) = 950, b_eff = 2200 mm', () => {
    expect(cel(poutre, 'ec2-2004', 'reduite').resistance).toBe(2200);
    expect(cel(poutre, 'ec2-2023', 'reduite').resistance).toBe(2200);
    expect(cel(poutre, 'ec2-2023', 'elu-ductile').resistance).toBe(3000);
  });

  it('poutre en L sur appui (l_0 = 2400) : 0,2 l_0 = 480 gouverne', () => {
    const e = { bw: 300, b1: 1350, b2: 0, l0: 2400 };
    expect(cel(e, 'ec2-2023', 'reduite').intermediaires['b_eff,1'].valeur).toBeCloseTo(480, 10);
    expect(cel(e, 'ec2-2023', 'reduite').resistance).toBeCloseTo(780, 10);
  });

  it('debord court : b_eff,i plafonnee a b_i', () => {
    expect(cel({ bw: 300, b1: 200, b2: 200, l0: 6800 }, 'ec2-2004', 'reduite').resistance).toBe(700);
  });
});
