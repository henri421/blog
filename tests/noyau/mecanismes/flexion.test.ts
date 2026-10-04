import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { flexion, loi2004, remplissage, type EntreeFlexion } from '../../../src/noyau/mecanismes/flexion/index';

// Valeurs attendues calculees a la main par integration numerique de la
// parabole (docs/validation/flexion.md).

const poutre = (fck = 30, As = 1257, MEd = 250): EntreeFlexion => ({ b: 300, d: 550, As, fck, fyk: 500, MEd, chargeTardive: 'non' });
const cel = (e: EntreeFlexion, g: string, n: string) =>
  calculerMatrice(flexion, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('diagramme parabole-rectangle', () => {
  it('epsilon_c2 = 2, epsilon_cu = 3,5 pour mille : alpha = 17/21, beta = 0,4160', () => {
    const r = remplissage({ ec2: 0.002, ecu: 0.0035, n: 2 });
    expect(r.alpha).toBeCloseTo(17 / 21, 12);
    expect(r.beta).toBeCloseTo(0.415966, 5);
  });

  it('C70/85 en 2004 : alpha = 0,6268, beta = 0,3599', () => {
    const r = remplissage(loi2004(70));
    expect(r.alpha).toBeCloseTo(0.626825, 5);
    expect(r.beta).toBeCloseTo(0.359864, 5);
  });
});

describe('poutre 30 x 60, 4 HA20', () => {
  it('C30/37 : 275,70 (rectangle) et 275,01 kN.m en 2004 ; 270,49 kN.m en 2023', () => {
    expect(cel(poutre(), 'ec2-2004', 'rectangle').resistance).toBeCloseTo(275.6965, 3);
    expect(cel(poutre(), 'ec2-2004', 'parabole').resistance).toBeCloseTo(275.0074, 3);
    expect(cel(poutre(), 'ec2-2023', 'parabole').resistance).toBeCloseTo(270.4934, 3);
  });

  it('C70/85 fortement armee : 993,12 et 987,08 kN.m en 2004 ; 936,85 kN.m en 2023', () => {
    const e = poutre(70, 4909, 900);
    expect(cel(e, 'ec2-2004', 'rectangle').resistance).toBeCloseTo(993.1199, 2);
    expect(cel(e, 'ec2-2004', 'parabole').resistance).toBeCloseTo(987.0835, 2);
    expect(cel(e, 'ec2-2023', 'parabole').resistance).toBeCloseTo(936.8496, 2);
  });

  it('acier non plastifie : contrainte par compatibilite', () => {
    const c = cel(poutre(30, 8000, 500), 'ec2-2023', 'parabole');
    expect(c.intermediaires['σ_s'].valeur).toBeLessThan(500 / 1.15);
    expect(c.intermediaires['σ_s'].valeur).toBeCloseTo(200000 * (c.intermediaires['ε_s'].valeur as number), 6);
  });
});
