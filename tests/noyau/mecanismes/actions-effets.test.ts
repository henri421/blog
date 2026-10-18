import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { actionsEffets } from '../../../src/noyau/mecanismes/actions-effets/index';

// Valeurs attendues calculees a la main (docs/validation/actions-effets.md).

const cable = { F: 2, k: 50, p: 2 / 3, gamma: 1.5 };
const cel = (e: object, g: string, n: string) => calculerMatrice(actionsEffets, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('coefficients sur les actions ou sur les effets (EN 1990)', () => {
  it('cable, p = 2/3 : (8.4) 104,00 ; (8.5) 119,06', () => {
    expect(cel(cable, 'en1990-2023', 'actions').sollicitation).toBeCloseTo(50 * 3 ** (2 / 3), 9);
    expect(cel(cable, 'en1990-2023', 'effets').sollicitation).toBeCloseTo(1.5 * 50 * 2 ** (2 / 3), 9);
    expect(cel(cable, 'en1990-2023', 'actions').sollicitation).toBeCloseTo(104.0042, 3);
    expect(cel(cable, 'en1990-2023', 'effets').sollicitation).toBeCloseTo(119.0551, 3);
  });

  it('lineaire (p = 1) : les deux formules coincident', () => {
    const e = { ...cable, p: 1 };
    expect(cel(e, 'en1990-2002', 'actions').sollicitation).toBeCloseTo(150, 12);
    expect(cel(e, 'en1990-2002', 'effets').sollicitation).toBeCloseTo(150, 12);
  });

  it('effet surlineaire (p = 2) : la formule sur les actions est la plus defavorable', () => {
    const e = { ...cable, p: 2 };
    expect(cel(e, 'en1990-2023', 'actions').sollicitation).toBeCloseTo(450, 12);
    expect(cel(e, 'en1990-2023', 'effets').sollicitation).toBeCloseTo(300, 12);
  });
});
