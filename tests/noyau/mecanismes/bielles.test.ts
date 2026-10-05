import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { bielles, diffusion, nuContinu, nuPaliers, type EntreeBielles } from '../../../src/noyau/mecanismes/bielles/index';

// Valeurs attendues calculees a la main (docs/validation/bielles.md).

const bielle = (): EntreeBielles => ({ Fcd: 900, bc: 250, t: 300, fck: 30, element: 'bielle-fissuree', ancrage: 'interieur', theta: 45 });
const cel = (e: EntreeBielles, g: string, n: string) => calculerMatrice(bielles, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('bielles et noeuds', () => {
  it('bielle fissuree a 45 degres : sigma = 12 MPa ; 10,56 (2004), 11,90 (paliers), 12,78 MPa (continu)', () => {
    expect(cel(bielle(), 'ec2-2004', 'base').sollicitation).toBeCloseTo(12, 12);
    expect(cel(bielle(), 'ec2-2004', 'base').resistance).toBeCloseTo(10.56, 10);
    expect(cel(bielle(), 'ec2-2023', 'paliers').resistance).toBeCloseTo(11.9, 10);
    expect(cel(bielle(), 'ec2-2023', 'continu').resistance).toBeCloseTo(12.781955, 5);
  });

  it('noeuds 2004 : k = 1,0 ; 0,85 ; 0,75 fois nu prime f_cd', () => {
    expect(cel({ ...bielle(), element: 'noeud-ccc' }, 'ec2-2004', 'base').resistance).toBeCloseTo(17.6, 10);
    expect(cel({ ...bielle(), element: 'noeud-cct' }, 'ec2-2004', 'base').resistance).toBeCloseTo(14.96, 10);
    expect(cel({ ...bielle(), element: 'noeud-ctt' }, 'ec2-2004', 'base').resistance).toBeCloseTo(13.2, 10);
  });

  it('2023 : nu = 1 pour un noeud CCT ancre hors de la region nodale, quel que soit le niveau', () => {
    const e = { ...bielle(), element: 'noeud-cct', ancrage: 'exterieur', theta: undefined };
    expect(cel(e, 'ec2-2023', 'paliers').resistance).toBeCloseTo(17, 10);
    expect(cel(e, 'ec2-2023', 'continu').resistance).toBeCloseTo(17, 10);
  });

  it('2023 : nu par la deformation (8.121), plafonne a 1', () => {
    expect(cel({ ...bielle(), eps1: 0.002 }, 'ec2-2023', 'deformation').resistance).toBeCloseTo(17 / 1.22, 10);
    expect(cel({ ...bielle(), eps1: 0 }, 'ec2-2023', 'deformation').resistance).toBeCloseTo(17, 10);
  });

  it('paliers et formule continue de nu', () => {
    expect([19.9, 20, 35, 45, 75].map(nuPaliers)).toEqual([0.4, 0.4, 0.55, 0.7, 0.85]);
    expect(nuContinu(90)).toBeCloseTo(1 / 1.11, 12);
  });

  it('angle hors domaine ou manquant : non applicable avec motif', () => {
    expect(cel({ ...bielle(), theta: 15 }, 'ec2-2023', 'paliers').statut).toEqual({ etat: 'non-applicable', motif: 'motif.theta-cs-hors', donneesManquantes: [] });
    expect(cel({ ...bielle(), theta: undefined }, 'ec2-2023', 'continu').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.theta-cs-manquant',
      donneesManquantes: [],
    });
  });
});


describe('diffusion d une force concentree', () => {
  const d = (e: object, g: string) => calculerMatrice(diffusion, e).cellules.find((c) => c.generation === g)!;
  it('discontinuite partielle (b = H/2 = 600) : 166,67 kN dans les deux generations', () => {
    const e = { Fd: 1000, a: 200, b: 600, H: 1200 };
    expect(d(e, 'ec2-2004').resistance).toBeCloseTo(166.6667, 3);
    expect(d(e, 'ec2-2023').resistance).toBeCloseTo(166.6667, 3);
  });
  it('element large (b = 1500 > a + H/2) : 191,67 kN en 2004, 250 kN en 2023', () => {
    const e = { Fd: 1000, a: 200, b: 1500, H: 1200 };
    expect(d(e, 'ec2-2004').resistance).toBeCloseTo(191.6667, 3);
    expect(d(e, 'ec2-2023').resistance).toBeCloseTo(250, 10);
  });
});
