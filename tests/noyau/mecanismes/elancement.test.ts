import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { elancement, elancementBase2004, type EntreeElancement } from '../../../src/noyau/mecanismes/elancement/index';

// Valeurs attendues calculees a la main (docs/validation/elancement.md).

const dalle = (): EntreeElancement => ({
  L: 5000,
  b: 1000,
  d: 172,
  AsReq: 520,
  AsProv: 565,
  AsComp: 0,
  fck: 25,
  fyk: 500,
  systeme: 'isostatique',
  cloisons: 'non',
  gk: 5.6,
  qk: 2.4,
  lSurDLu: 17,
  rapport: 250,
});

const cel = (e: EntreeElancement, g: string) => calculerMatrice(elancement, e).cellules.find((c) => c.generation === g)!;

describe('elancement, dalle de 5 m', () => {
  it('2004 : (7.16.a) = 31,863, x 1,0865 = 34,621 ; L/d = 29,07 passe', () => {
    const c = cel(dalle(), 'ec2-2004');
    expect(c.intermediaires['l/d (7.16)'].valeur).toBeCloseTo(31.863125, 5);
    expect(c.resistance).toBeCloseTo(34.620511, 5);
    expect(c.sollicitation).toBeCloseTo(29.069767, 5);
  });

  it('2023 : omega_r = 0,0928, LL/TL = 0,30 ; limite lue 17, L/d = 29,07 ne passe pas', () => {
    const c = cel(dalle(), 'ec2-2023');
    expect(c.intermediaires['ω_r (entrée du tableau 9.3)'].valeur).toBeCloseTo(0.092785, 5);
    expect(c.intermediaires['LL/TL (entrée du tableau 9.3)'].valeur).toBeCloseTo(0.3, 12);
    expect(c.resistance).toBe(17);
  });

  it('2023 sans valeur lue : non applicable, nomme la donnee', () => {
    expect(cel({ ...dalle(), lSurDLu: undefined }, 'ec2-2023').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.donnees-manquantes',
      donneesManquantes: ['champ.lSurDLu'],
    });
  });

  it('(7.16.b) quand rho > rho_0, et reduction 7/L au-dela de 7 m avec cloisons', () => {
    expect(elancementBase2004(1, 25, 0.01, 0)).toBeCloseTo(11 + 1.5 * 5 * (0.005 / 0.01), 12);
    const c = cel({ ...dalle(), L: 8000, cloisons: 'oui' }, 'ec2-2004');
    expect(c.intermediaires['facteur de portée'].valeur).toBeCloseTo(7 / 8, 12);
  });
});
