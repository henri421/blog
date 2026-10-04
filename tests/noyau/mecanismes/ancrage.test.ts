import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { ancrage, type EntreeAncrage } from '../../../src/noyau/mecanismes/ancrage/index';

// Valeurs attendues calculees a la main (docs/validation/ancrage.md).

/** HA16 en bonne adherence, C25/30, enrobages 30 mm, 100 mm entre barres. */
const barre = (type = 'ancrage'): EntreeAncrage => ({
  phi: 16,
  fck: 25,
  fyk: 500,
  sigmaSd: 300,
  adherence: 'bonne',
  cs: 100,
  cx: 30,
  cy: 30,
  type,
  lDispo: 600,
});

const cel = (e: EntreeAncrage, g: string, n: string) =>
  calculerMatrice(ancrage, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('ancrage droit d un HA16', () => {
  it('premiere generation : f_bd = 2,693 MPa, alpha_2 = 0,869, l_bd = 561,0 puis 387,1 mm', () => {
    const p = cel(barre(), 'ec2-2004', 'barre-plastifiee');
    expect(p.intermediaires.f_bd.valeur).toBeCloseTo(2.69321, 4);
    expect(p.intermediaires['α_2'].valeur).toBeCloseTo(0.86875, 5);
    expect(p.intermediaires['l_b,rqd'].valeur).toBeCloseTo(645.75, 1);
    expect(p.sollicitation).toBeCloseTo(560.99, 1);
    expect(cel(barre(), 'ec2-2004', 'contrainte-reelle').sollicitation).toBeCloseTo(387.08, 1);
  });

  it('deuxieme generation : l_bd = 663,8 puis 380,4 mm', () => {
    expect(cel(barre(), 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(663.75, 1);
    expect(cel(barre(), 'ec2-2023', 'contrainte-reelle').sollicitation).toBeCloseTo(380.43, 1);
  });
});

describe('recouvrement d un HA16', () => {
  it('l_0 = 841,5 / 580,6 mm et l_sd = 796,5 / 456,5 mm', () => {
    expect(cel(barre('recouvrement'), 'ec2-2004', 'barre-plastifiee').sollicitation).toBeCloseTo(841.49, 1);
    expect(cel(barre('recouvrement'), 'ec2-2004', 'contrainte-reelle').sollicitation).toBeCloseTo(580.63, 1);
    expect(cel(barre('recouvrement'), 'ec2-2023', 'barre-plastifiee').sollicitation).toBeCloseTo(796.5, 1);
    expect(cel(barre('recouvrement'), 'ec2-2023', 'contrainte-reelle').sollicitation).toBeCloseTo(456.52, 1);
  });
});

describe('conditions et domaine', () => {
  it('sigma_sd > f_yd rend le niveau a contrainte reelle non applicable', () => {
    expect(cel({ ...barre(), sigmaSd: 450 }, 'ec2-2023', 'contrainte-reelle').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.sigma-sup-fyd',
      donneesManquantes: [],
    });
  });

  it('fck > 60 MPa est hors du domaine', () => {
    expect(cel({ ...barre(), fck: 70 }, 'ec2-2023', 'barre-plastifiee').statut.etat).toBe('hors-domaine');
  });

  it('l adherence mediocre allonge les deux generations', () => {
    const m = { ...barre(), adherence: 'mediocre' };
    expect(cel(m, 'ec2-2004', 'contrainte-reelle').sollicitation).toBeCloseTo(387.084 / 0.7, 1);
    expect(cel(m, 'ec2-2023', 'contrainte-reelle').sollicitation).toBeCloseTo(380.434 * 1.2, 1);
  });
});
