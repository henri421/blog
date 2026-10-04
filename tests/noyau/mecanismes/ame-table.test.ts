import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { ameTable, type EntreeAmeTable } from '../../../src/noyau/mecanismes/ame-table/index';

// Valeurs attendues calculees a la main (docs/validation/ame-table.md).

/** Poutre en T, table de 15 cm comprimee, HA10/200 transversaux, C30/37. */
const poutreT = (): EntreeAmeTable => ({
  dFd: 267,
  dx: 1500,
  hf: 150,
  membrure: 'comprimee',
  fck: 30,
  fyk: 500,
  asf: 393,
  astMin: 393,
});

const cel = (e: EntreeAmeTable, g: string, n: string) =>
  calculerMatrice(ameTable, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('cisaillement ame-table, table comprimee', () => {
  it('tau_Ed = 1,1867 MPa dans les deux generations', () => {
    expect(cel(poutreT(), 'ec2-2004', 'seuil').sollicitation).toBeCloseTo(1.186667, 5);
    expect(cel(poutreT(), 'ec2-2023', 'seuil').sollicitation).toBeCloseTo(1.186667, 5);
  });

  it('2004 : seuil 0,4 f_ctd = 0,5407 MPa ; treillis a cot = 2 : 2,2783 MPa', () => {
    expect(cel(poutreT(), 'ec2-2004', 'seuil').resistance).toBeCloseTo(0.540674, 5);
    const t = cel(poutreT(), 'ec2-2004', 'treillis');
    expect(t.intermediaires['cot θ_f'].valeur).toBe(2);
    expect(t.resistance).toBeCloseTo(2.278261, 5);
  });

  it('2023 : seuil 1,1391 MPa ; treillis a cot = 2,542 : 2,8957 MPa', () => {
    expect(cel(poutreT(), 'ec2-2023', 'seuil').resistance).toBeCloseTo(1.13913, 5);
    const t = cel(poutreT(), 'ec2-2023', 'treillis');
    expect(t.intermediaires['cot θ_f'].valeur).toBeCloseTo(2.542013, 5);
    expect(t.resistance).toBeCloseTo(2.895685, 5);
  });

  it('table tendue : cot borne a 1,25 dans les deux generations', () => {
    const e = { ...poutreT(), membrure: 'tendue' };
    expect(cel(e, 'ec2-2004', 'treillis').intermediaires['cot θ_f'].valeur).toBe(1.25);
    expect(cel(e, 'ec2-2023', 'treillis').intermediaires['cot θ_f'].valeur).toBe(1.25);
  });

  it('sans armature minimale saisie, le seuil 2023 est non applicable et le nomme', () => {
    expect(cel({ ...poutreT(), astMin: undefined }, 'ec2-2023', 'seuil').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.donnees-manquantes',
      donneesManquantes: ['champ.astMin'],
    });
  });
});
