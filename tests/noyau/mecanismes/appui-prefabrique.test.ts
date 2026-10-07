import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { appuiPrefabrique } from '../../../src/noyau/mecanismes/appui-prefabrique/index';

// Valeurs attendues calculees a la main (docs/validation/appui-prefabrique.md).

const poutre = {
  FEd: 400,
  b1: 300,
  fck: 40,
  joint: 'lit',
  fbed: 15,
  a1Prevu: 150,
  a1Min2004: 110,
  a2: 15,
  a3: 15,
  deltaA2: 10,
  ln: 8,
  isole: 'non',
  aPrevu: 200,
};
const cel = (e: object, g: string, n: string) =>
  calculerMatrice(appuiPrefabrique, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('appui d une poutre prefabriquee sur corbeau', () => {
  it('lit de mortier f_bed = 15 MPa : a_1 = 88,9 mm, porte au minimum de 110 mm en 2004', () => {
    const a = cel(poutre, 'ec2-2004', 'nette');
    expect(a.intermediaires['F_Ed / (b_1 f_Rd)'].valeur).toBeCloseTo(88.889, 3);
    expect(a.sollicitation).toBe(110);
    expect(cel(poutre, 'ec2-2023', 'nette').sollicitation).toBeCloseTo(88.889, 3);
  });

  it('joint sec : f_Rd = 0,4 f_cd, a_1 = 125,0 (2004) et 147,1 mm (2023)', () => {
    const sec = { ...poutre, joint: 'sec' };
    expect(cel(sec, 'ec2-2004', 'nette').sollicitation).toBeCloseTo(125, 10);
    expect(cel(sec, 'ec2-2023', 'nette').sollicitation).toBeCloseTo(147.059, 3);
  });

  it('2004 nominale : 110 + 15 + 15 + racine(10^2 + 3,2^2) = 150,5 mm ; + 20 mm si isole', () => {
    expect(cel(poutre, 'ec2-2004', 'nominale').sollicitation).toBeCloseTo(150.4995, 3);
    expect(cel({ ...poutre, isole: 'oui' }, 'ec2-2004', 'nominale').sollicitation).toBeCloseTo(170.4995, 3);
  });

  it('lit sans f_bed : non applicable', () => {
    expect(cel({ ...poutre, fbed: undefined }, 'ec2-2023', 'nette').statut).toMatchObject({ motif: 'motif.fbed-manquant' });
  });
});
