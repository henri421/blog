import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { enrobage, type EntreeEnrobage } from '../../../src/noyau/mecanismes/enrobage/index';

// Valeurs attendues calculees a la main (docs/validation/enrobage.md).

/** Balcon en XC4, HA12, granulat 20 mm ; c_min,dur lus dans les tableaux 4.4N (S4) et 6.3 (XRC 3, 50 ans). */
const balcon = (): EntreeEnrobage => ({
  phi: 12,
  Dupper: 20,
  cminDur2004: 30,
  cminDur2023: 20,
  abrasion: 'aucune',
  duree30: 'non',
  compacite: 'non',
  contactSol: 'non',
  deltaCdev: 10,
  cnomPrevu: 35,
});

const cel = (e: EntreeEnrobage, g: string) => calculerMatrice(enrobage, e).cellules.find((c) => c.generation === g)!;

describe('enrobage, balcon en XC4', () => {
  it('premiere generation : c_min = 30, c_nom = 40 mm', () => {
    const c = cel(balcon(), 'ec2-2004');
    expect(c.intermediaires.c_min.valeur).toBe(30);
    expect(c.sollicitation).toBe(40);
    expect(c.taux).toBeCloseTo(40 / 35, 12);
  });

  it('deuxieme generation : c_min = 20, c_nom = 30 mm', () => {
    const c = cel(balcon(), 'ec2-2023');
    expect(c.intermediaires.c_min.valeur).toBe(20);
    expect(c.sollicitation).toBe(30);
  });
});

describe('ajustements', () => {
  it('abrasion : ajoutee a c_min en 2004 (4.4.1.2(13)), dans le max en 2023 ((6.2))', () => {
    const e = { ...balcon(), phi: 25, cminDur2004: 10, cminDur2023: 10, abrasion: 'XM1' };
    // 2004 : max(25 ; 10 ; 10) + 5 = 30 ; 2023 : max(10 + 5 ; 25 ; 10) = 25.
    expect(cel(e, 'ec2-2004').intermediaires.c_min.valeur).toBe(30);
    expect(cel(e, 'ec2-2023').intermediaires.c_min.valeur).toBe(25);
  });

  it('granulat > 32 mm : c_min,b majore de 5 mm dans les deux generations', () => {
    const e = { ...balcon(), phi: 32, Dupper: 40 };
    expect(cel(e, 'ec2-2004').intermediaires['c_min,b'].valeur).toBe(37);
    expect(cel(e, 'ec2-2023').intermediaires['c_min,b'].valeur).toBe(37);
  });

  it('2023 : reductions de 5 mm (30 ans, compacite) et majoration de 5 mm (sol)', () => {
    expect(cel({ ...balcon(), duree30: 'oui', compacite: 'oui' }, 'ec2-2023').intermediaires.c_min.valeur).toBe(12);
    expect(cel({ ...balcon(), contactSol: 'oui' }, 'ec2-2023').intermediaires.c_min.valeur).toBe(25);
  });

  it('jamais moins de 10 mm', () => {
    const e = { ...balcon(), phi: 6, cminDur2004: 5, cminDur2023: 5 };
    expect(cel(e, 'ec2-2004').intermediaires.c_min.valeur).toBe(10);
    expect(cel(e, 'ec2-2023').intermediaires.c_min.valeur).toBe(10);
  });

  it('sans c_min,dur 2023 saisi, seule la cellule 2023 est non applicable et le nomme', () => {
    const m = calculerMatrice(enrobage, { ...balcon(), cminDur2023: undefined });
    expect(m.cellules[0].statut.etat).toBe('calcule');
    expect(m.cellules[1].statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.donnees-manquantes',
      donneesManquantes: ['champ.cminDur2023'],
    });
  });
});

describe('enrobage, annexe P (informative)', () => {
  const balcon = { phi: 12, Dupper: 20, cminDurP: 30, contactSol: 'non', deltaCdev: 10, cnomPrevu: 35 };
  const cel = (e: object) => calculerMatrice(enrobage, e).cellules.find((c) => c.niveau === 'annexe-p')!;
  it('c_min = max(phi ; 30 ; 10) = 30, c_nom = 40 mm, en reserve', () => {
    const c = cel(balcon);
    expect(c.statut).toEqual({ etat: 'reserve', motif: 'reserve.annexe-p' });
    expect(c.sollicitation).toBe(40);
  });
  it('majoration de 5 mm au contact du sol, pas de reduction de 6.5.2.2', () => {
    expect(cel({ ...balcon, contactSol: 'oui', duree30: 'oui', compacite: 'oui' }).sollicitation).toBe(45);
  });
});
