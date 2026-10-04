import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { tranchantAvecArmature, type EntreeTaa } from '../../../src/noyau/mecanismes/tranchant-avec-armature/index';

// Valeurs attendues calculees a la main (docs/validation/tranchant-avec-armature.md).
// Le niveau a nu variable a ete verifie par un balayage de cot(theta) au pas
// de 1e-6, independant de la section doree du code.

/** Poutre 30 x 60, d = 550 mm, cadres HA10 a 2 brins tous les 125 mm, C30/37. */
const poutre = (): EntreeTaa => ({ VEd: 550, MEd: 300, bw: 300, d: 550, Asw: 157, s: 125, fck: 30, fyk: 500, Ast: 1963 });
/** Meme poutre, cadres HA8 tous les 200 mm : l acier gouverne a cot = 2,5. */
const peuArmee = (): EntreeTaa => ({ VEd: 250, MEd: 150, bw: 300, d: 550, Asw: 100.5, s: 200, fck: 30, fyk: 500, Ast: 1257 });

const cel = (e: EntreeTaa, g: string, n: string) =>
  calculerMatrice(tranchantAvecArmature, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('effort tranchant avec armatures, bielle determinante', () => {
  it('premiere generation : cot = 2,191, V_Rd = 592,3 kN', () => {
    const c = cel(poutre(), 'ec2-2004', 'base');
    expect(c.intermediaires['ν_1'].valeur).toBeCloseTo(0.528, 12);
    expect(c.intermediaires['cot θ'].valeur).toBeCloseTo(2.19118, 4);
    expect(c.resistance).toBeCloseTo(592.31, 1);
  });

  it('deuxieme generation, nu = 0,5 : cot = 1,916, V_Rd = 517,8 kN', () => {
    const c = cel(poutre(), 'ec2-2023', 'nu-constant');
    expect(c.intermediaires.f_cd.valeur).toBeCloseTo(17, 12);
    expect(c.intermediaires['cot θ'].valeur).toBeCloseTo(1.91562, 4);
    expect(c.resistance).toBeCloseTo(517.82, 1);
  });

  it('deuxieme generation, nu variable : nu = 0,4796, cot = 1,865, V_Rd = 504,2 kN, iterations visibles', () => {
    const c = cel(poutre(), 'ec2-2023', 'nu-variable');
    expect(c.statut.etat).toBe('calcule');
    expect(c.intermediaires['cot θ'].valeur).toBeCloseTo(1.8653, 3);
    expect(c.intermediaires['ν'].valeur).toBeCloseTo(0.47963, 3);
    expect(c.intermediaires['ε_x'].valeur).toBeCloseTo(0.0014251, 6);
    expect(c.resistance).toBeCloseTo(504.22, 1);
    expect(c.iterations).toBeGreaterThan(10);
  });
});

describe('effort tranchant avec armatures, acier determinant', () => {
  it('nu = 0,5 : les cellules 2004 et 2023 niveau 1 donnent 270,37 kN a cot = 2,5', () => {
    for (const [g, n] of [
      ['ec2-2004', 'base'],
      ['ec2-2023', 'nu-constant'],
    ]) {
      const c = cel(peuArmee(), g, n);
      expect(c.intermediaires['cot θ'].valeur, n).toBeCloseTo(2.5, 6);
      expect(c.resistance, n).toBeCloseTo(270.37, 2);
    }
  });

  it('nu variable : cot depasse 2,5 (8.2.3(7)), cot = 2,657, V_Rd = 287,3 kN', () => {
    const c = cel(peuArmee(), 'ec2-2023', 'nu-variable');
    expect(c.intermediaires['cot θ'].valeur).toBeCloseTo(2.657, 2);
    expect(c.intermediaires['ν'].valeur).toBeCloseTo(0.34525, 3);
    expect(c.resistance).toBeCloseTo(287.34, 1);
  });

  it('sans armature de membrure saisie, le niveau a nu variable est non applicable', () => {
    expect(cel({ ...poutre(), Ast: undefined }, 'ec2-2023', 'nu-variable').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.donnees-manquantes',
      donneesManquantes: ['champ.Ast'],
    });
  });
});
