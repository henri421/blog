import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { espacement } from '../../../src/noyau/mecanismes/espacement/index';

// Valeurs attendues calculees a la main (docs/validation/espacement.md).

const poutre = { phi: 25, nb: 2, disposition: 'courant', Dupper: 20, csPrevu: 40 };
const cel = (e: object, g: string) => calculerMatrice(espacement, e).cellules.find((c) => c.generation === g)!;

describe('espacement des barres et paquets', () => {
  it('paquet de 2 HA25 : phi_b = 25 racine 2 = 35,36 mm dans les deux generations', () => {
    for (const g of ['ec2-2004', 'ec2-2023']) {
      const c = cel(poutre, g);
      expect(c.statut.etat).toBe('calcule');
      expect(c.sollicitation).toBeCloseTo(25 * Math.SQRT2, 10);
      expect(c.taux).toBeCloseTo((25 * Math.SQRT2) / 40, 10);
    }
    expect(cel(poutre, 'ec2-2004').intermediaires['φ_n'].valeur).toBeCloseTo(35.3553, 4);
    expect(cel(poutre, 'ec2-2023').intermediaires['φ_b'].valeur).toBeCloseTo(35.3553, 4);
  });

  it('barre isolee HA25, granulat 20 : max(25 ; 25 ; 20) = 25 mm', () => {
    const e = { ...poutre, nb: 1 };
    expect(cel(e, 'ec2-2004').sollicitation).toBe(25);
    expect(cel(e, 'ec2-2023').sollicitation).toBe(25);
  });

  it('paquet de 3 HA40 : phi_n = 69,28 > 55 mm en 2004, admis en 2023', () => {
    const e = { phi: 40, nb: 3, disposition: 'courant', Dupper: 20, csPrevu: 80 };
    expect(cel(e, 'ec2-2004').statut).toEqual({ etat: 'non-applicable', motif: 'motif.phin-sup-55', donneesManquantes: [] });
    expect(cel(e, 'ec2-2023').sollicitation).toBeCloseTo(69.282, 3);
  });

  it('paquet de 2 HA10 : 25 mm en 2004 (granulat), phi_b = 14,14 mm seul en 2023', () => {
    const e = { phi: 10, nb: 2, disposition: 'courant', Dupper: 20, csPrevu: 20 };
    expect(cel(e, 'ec2-2004').sollicitation).toBe(25);
    expect(cel(e, 'ec2-2023').sollicitation).toBeCloseTo(14.1421, 4);
  });

  it('4 barres : refusees en cas courant, admises dans un recouvrement', () => {
    const e = { phi: 20, nb: 4, disposition: 'courant', Dupper: 20, csPrevu: 60 };
    for (const g of ['ec2-2004', 'ec2-2023']) expect(cel(e, g).statut).toMatchObject({ motif: 'motif.paquet-nb-max' });
    const r = { ...e, disposition: 'recouvrement' };
    expect(cel(r, 'ec2-2004').sollicitation).toBe(40);
    expect(cel(r, 'ec2-2023').sollicitation).toBe(40);
  });

  it('un nombre de barres non entier est refuse', () => {
    expect(() => calculerMatrice(espacement, { ...poutre, nb: 1.5 })).toThrow();
  });
});
