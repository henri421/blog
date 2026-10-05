import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { contraintesEls } from '../../../src/noyau/mecanismes/contraintes-els/index';

// Valeurs attendues calculees a la main (docs/validation/contraintes-els.md).

const poutre = { b: 300, d: 550, As: 1473, fck: 30, fyk: 500, Mcar: 220, Mqp: 150, phi: 2.0, exposition: 'oui' };
const cel = (e: object, g: string, n: string) => calculerMatrice(contraintesEls, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('contraintes en service', () => {
  it('2004 : sigma_s = 299,49 ; sigma_c = 19,108 > 18 ; quasi permanente 8,959 <= 13,5', () => {
    expect(cel(poutre, 'ec2-2004', 'acier').sollicitation).toBeCloseTo(299.492, 2);
    expect(cel(poutre, 'ec2-2004', 'beton-caracteristique').sollicitation).toBeCloseTo(19.1078, 3);
    expect(cel(poutre, 'ec2-2004', 'beton-quasi-permanent').sollicitation).toBeCloseTo(8.9587, 3);
    expect(cel(poutre, 'ec2-2004', 'beton-quasi-permanent').resistance).toBe(13.5);
  });

  it('2023 : sigma_c = 18,910 ; quasi permanente 9,016 compare au seuil 0,40 f_cm = 15,2', () => {
    expect(cel(poutre, 'ec2-2023', 'beton-caracteristique').sollicitation).toBeCloseTo(18.9103, 3);
    expect(cel(poutre, 'ec2-2023', 'beton-quasi-permanent').sollicitation).toBeCloseTo(9.016, 3);
    expect(cel(poutre, 'ec2-2023', 'beton-quasi-permanent').resistance).toBeCloseTo(15.2, 12);
  });

  it('hors XD, XS, XF : pas de limite de compression caracteristique', () => {
    expect(cel({ ...poutre, exposition: 'non' }, 'ec2-2023', 'beton-caracteristique').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.exposition-sans-limite',
      donneesManquantes: [],
    });
  });
});
