import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { ancrageBoucle, ancrageSoude } from '../../../src/noyau/mecanismes/ancrage-soude-boucle/index';

// Valeurs attendues calculees a la main (docs/validation/ancrage-soude-boucle.md).

const poutre = { phi: 16, fck: 25, fyk: 500, sigmaSd: 300, adherence: 'bonne', cs: 100, cx: 30, cy: 30, lDispo: 450 };
const massif = { ...poutre, cs: 150, cx: 60, cy: 60 };
const soudee = { ...poutre, phiT: 10, nT: 1 };

const celS = (e: object, g: string, n: string) =>
  calculerMatrice(ancrageSoude, e).cellules.find((c) => c.generation === g && c.niveau === n)!;
const celB = (e: object, g: string, n: string) =>
  calculerMatrice(ancrageBoucle, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('barres transversales soudees', () => {
  it('2004 : alpha_2 = 0,86875, alpha_4 = 0,7, l_bd = 392,7 puis 271,0 mm', () => {
    const c = celS(soudee, 'ec2-2004', 'barre-plastifiee');
    expect(c.intermediaires['α_2'].valeur).toBeCloseTo(0.86875, 12);
    expect(c.sollicitation).toBeCloseTo(392.694, 2);
    expect(celS(soudee, 'ec2-2004', 'contrainte-reelle').sollicitation).toBeCloseTo(270.959, 2);
  });

  it('2023 : 663,8 - 240 = 423,8 mm ; a 300 MPa, 380,4 - 240 = 140,4 mm', () => {
    expect(celS(soudee, 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(423.752, 2);
    expect(celS(soudee, 'ec2-2023', 'contrainte-reelle').sollicitation).toBeCloseTo(140.434, 2);
  });

  it('massif a 300 MPa : plancher 5 phi = 80 mm en 2023', () => {
    expect(celS({ ...massif, phiT: 10, nT: 1 }, 'ec2-2023', 'contrainte-reelle').sollicitation).toBe(80);
  });

  it('phi_t < 0,6 phi : refuse en 2004 ; en 2023, deux barres espacees de 50 a 100 mm exigees', () => {
    const petites = { ...soudee, phiT: 8, nT: 2, sT: 75 };
    expect(celS(petites, 'ec2-2004', 'barre-plastifiee').statut).toMatchObject({ motif: 'motif.soude-2004-diametre' });
    expect(celS(petites, 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(423.752, 2);
    expect(celS({ ...petites, nT: 1 }, 'ec2-2023', 'barre-plastifiee').statut).toMatchObject({ motif: 'motif.soude-2023-petites' });
    expect(celS({ ...petites, sT: 120 }, 'ec2-2023', 'barre-plastifiee').statut).toMatchObject({ motif: 'motif.soude-2023-petites' });
    expect(celS({ ...petites, sT: undefined }, 'ec2-2023', 'barre-plastifiee').statut).toMatchObject({
      motif: 'motif.soude-2023-espacement-manquant',
    });
    expect(celS({ ...petites, phi: 20, phiT: 10 }, 'ec2-2023', 'barre-plastifiee').statut).toMatchObject({ motif: 'motif.soude-2023-petites' });
  });
});

describe('boucles en U', () => {
  it('poutre : 2004 c_d = 30 < 3 phi, 645,7 mm ; 2023 663,8 - 320 = 343,8 mm', () => {
    expect(celB(poutre, 'ec2-2004', 'barre-plastifiee').sollicitation).toBeCloseTo(645.746, 2);
    expect(celB(poutre, 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(343.752, 2);
    expect(celB(poutre, 'ec2-2023', 'contrainte-reelle').sollicitation).toBe(160);
  });

  it('massif : 2004 alpha_1 = 0,7, alpha_2 = 0,8875, 401,2 mm ; 2023 plancher 10 phi = 160 mm', () => {
    const c = celB(massif, 'ec2-2004', 'barre-plastifiee');
    expect(c.intermediaires['α_1'].valeur).toBe(0.7);
    expect(c.sollicitation).toBeCloseTo(401.17, 2);
    expect(celB(massif, 'ec2-2023', 'barre-plastifiee').sollicitation).toBe(160);
  });
});
