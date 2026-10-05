import { describe, expect, it } from 'vitest';
import type { Mecanisme } from '../../../src/noyau/moteur/mecanisme';
import { calculerMatrice, relire, rejouer, serialiser } from '../../../src/noyau/moteur/matrice';
import { evaluerNiveau, type DefinitionNiveau } from '../../../src/noyau/moteur/niveaux';
import { balayer } from '../../../src/noyau/moteur/balayer';
import { maximiserSectionDoree } from '../../../src/noyau/moteur/grandeurs';
import { MECANISMES } from '../../../src/noyau/index';
import { estCle } from '../../../src/i18n/cle';

// Mecanisme fictif a quatre niveaux, construit pour exercer chaque regle du
// moteur : un niveau calcule, un niveau a donnee manquante, un niveau a
// condition normative, un niveau plus « precis » mais moins favorable, et un
// niveau qui ne converge pas.
interface EntreeFictive {
  a?: number;
  b?: number;
}

const fictif: Mecanisme<EntreeFictive> = {
  id: 'fictif',
  version: '0.0.1',
  titre: 'meca.tsa.titre',
  champs: [
    { type: 'nombre', id: 'a', libelle: 'champ.d', symbole: 'a', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.MEd', symbole: 'b', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-tranchant', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-tranchant', unite: 'kN' },
  niveaux: {
    'ec2-2004': [
      {
        id: 'unique',
        ordre: 1,
        position: 'corps',
        clause: 'x',
        hypothese: 'niveau.tsa.2004.base',
        donneesRequises: [{ champ: 'a', libelle: 'champ.d' }],
        conditions: () => null,
        calculer: (e) => ({ statut: { etat: 'calcule' }, sollicitation: 5, resistance: e.a as number, intermediaires: {}, clauses: [] }),
      },
    ],
    'ec2-2023': [
      {
        id: 'simple',
        ordre: 1,
        position: 'corps',
        clause: 'x',
        hypothese: 'niveau.tsa.2023.tau-min',
        donneesRequises: [{ champ: 'a', libelle: 'champ.d' }],
        conditions: () => null,
        calculer: () => ({ statut: { etat: 'calcule' }, sollicitation: 5, resistance: 10, intermediaires: {}, clauses: [] }),
      },
      {
        id: 'avec-b',
        ordre: 2,
        position: 'corps',
        clause: 'x',
        hypothese: 'niveau.tsa.2023.hauteur-utile',
        donneesRequises: [
          { champ: 'a', libelle: 'champ.d' },
          { champ: 'b', libelle: 'champ.MEd' },
        ],
        conditions: (e) => ((e.b as number) > 100 ? 'motif.d-sup-h' : null),
        calculer: () => ({ statut: { etat: 'calcule' }, sollicitation: 5, resistance: 12, intermediaires: {}, clauses: [] }),
      },
      {
        // Plus precis, moins favorable : doit etre rendu tel quel.
        id: 'precis',
        ordre: 3,
        position: 'corps',
        clause: 'x',
        hypothese: 'niveau.tsa.2023.portee-mecanique',
        donneesRequises: [{ champ: 'a', libelle: 'champ.d' }],
        domaine: (e) => ((e.a as number) > 50 ? 'motif.fck-sup-90' : null),
        conditions: () => null,
        calculer: () => ({ statut: { etat: 'calcule' }, sollicitation: 5, resistance: 8, intermediaires: {}, clauses: [] }),
      },
      {
        id: 'iteratif',
        ordre: 4,
        position: 'corps',
        clause: 'x',
        hypothese: 'niveau.taa.2023.nu-variable',
        donneesRequises: [],
        conditions: () => null,
        calculer: () => ({ statut: { etat: 'non-convergent', iterations: 200 }, intermediaires: {}, clauses: [], iterations: 200 }),
      },
    ],
  },
};

const cellule = (e: EntreeFictive, niveau: string) =>
  calculerMatrice(fictif, e).cellules.find((c) => c.generation === 'ec2-2023' && c.niveau === niveau)!;

describe('moteur de niveaux', () => {
  it('rend tous les niveaux, dans l ordre, sans en masquer aucun', () => {
    const m = calculerMatrice(fictif, { a: 10 });
    expect(m.cellules.map((c) => `${c.generation}/${c.niveau}`)).toEqual([
      'ec2-2004/unique',
      'ec2-2023/simple',
      'ec2-2023/avec-b',
      'ec2-2023/precis',
      'ec2-2023/iteratif',
    ]);
  });

  it('une donnee manquante rend le niveau non applicable et la nomme, sans valeur par defaut', () => {
    const c = cellule({ a: 10 }, 'avec-b');
    expect(c.statut).toEqual({ etat: 'non-applicable', motif: 'motif.donnees-manquantes', donneesManquantes: ['champ.MEd'] });
    expect(c.resistance).toBeUndefined();
    // NaN compte comme absent.
    expect(cellule({ a: 10, b: Number.NaN }, 'avec-b').statut.etat).toBe('non-applicable');
  });

  it('une condition normative non satisfaite rend le niveau non applicable et la nomme', () => {
    expect(cellule({ a: 10, b: 200 }, 'avec-b').statut).toEqual({
      etat: 'non-applicable',
      motif: 'motif.d-sup-h',
      donneesManquantes: [],
    });
  });

  it('un niveau plus precis mais moins favorable est rendu tel quel', () => {
    const m = calculerMatrice(fictif, { a: 10, b: 1 });
    const r = m.cellules.filter((c) => c.generation === 'ec2-2023').map((c) => c.resistance);
    expect(r).toEqual([10, 12, 8, undefined]);
  });

  it('le taux de travail est derive de la sollicitation et de la resistance', () => {
    expect(cellule({ a: 10 }, 'simple').taux).toBeCloseTo(0.5, 12);
  });

  it('une non-convergence est un statut portant le nombre d iterations', () => {
    expect(cellule({ a: 10 }, 'iteratif').statut).toEqual({ etat: 'non-convergent', iterations: 200 });
  });

  it('hors du domaine de l outil, le niveau est hors-domaine et non extrapole', () => {
    expect(cellule({ a: 60 }, 'precis').statut).toEqual({ etat: 'hors-domaine', motif: 'motif.fck-sup-90' });
  });
});

describe('balayage', () => {
  it('une rupture d applicabilite donne des valeurs nulles et une entree de rupture', () => {
    const b = balayer(fictif, { a: 10 }, 'a', [30, 40, 50, 60, 70]);
    const precis = b.series.find((s) => s.niveau === 'precis')!;
    expect(precis.resistance).toEqual([8, 8, 8, null, null]);
    expect(b.ruptures).toEqual([
      { generation: 'ec2-2023', niveau: 'precis', entre: [50, 60], avant: 'calcule', apres: 'hors-domaine' },
    ]);
    const unique = b.series.find((s) => s.niveau === 'unique')!;
    expect(unique.resistance).toEqual([30, 40, 50, 60, 70]);
  });
});

describe('serialisation', () => {
  it('une matrice serialisee se relit, et se rejoue a l identique', () => {
    const m = calculerMatrice(fictif, { a: 10, b: 1 });
    const json = serialiser(m);
    expect(relire(json)).toEqual(m);
    expect(rejouer(fictif, json)).toEqual(m);
  });

  it('une matrice archivee reste relisible apres l ajout d un niveau', () => {
    const json = serialiser(calculerMatrice(fictif, { a: 10, b: 1 }));
    const etendu: Mecanisme<EntreeFictive> = {
      ...fictif,
      niveaux: {
        ...fictif.niveaux,
        'ec2-2023': [
          ...fictif.niveaux['ec2-2023'],
          { ...fictif.niveaux['ec2-2023'][0], id: 'nouveau', ordre: 5 },
        ],
      },
    };
    expect(relire(json).cellules).toHaveLength(5);
    expect(rejouer(etendu, json).cellules).toHaveLength(6);
  });

  it('refuse un JSON d un autre format', () => {
    expect(() => relire('{"format":"autre"}')).toThrow(/format/);
  });
});

describe('section doree', () => {
  it('trouve le maximum d une parabole et compte ses iterations', () => {
    const m = maximiserSectionDoree((x) => -((x - 1.7) ** 2), 1, 2.5);
    expect(m.x).toBeCloseTo(1.7, 8);
    expect(m.converge).toBe(true);
    expect(m.iterations).toBeGreaterThan(10);
  });

  it('signale la non-convergence sans la masquer', () => {
    const m = maximiserSectionDoree((x) => -((x - 1.7) ** 2), 1, 2.5, 1e-12, 3);
    expect(m.converge).toBe(false);
    expect(m.iterations).toBe(3);
  });
});

describe('cles', () => {
  it('tous les libelles, motifs et hypotheses des mecanismes sont des cles du dictionnaire', () => {
    for (const m of Object.values(MECANISMES)) {
      expect(estCle(m.titre)).toBe(true);
      expect(estCle(m.sollicitation.libelle) && estCle(m.resistance.libelle)).toBe(true);
      for (const c of m.champs) {
        expect(estCle(c.libelle), c.id).toBe(true);
        if (c.type === 'choix') for (const o of c.options) expect(estCle(o.libelle), o.valeur).toBe(true);
      }
      for (const defs of Object.values(m.niveaux)) {
        for (const d of defs) {
          expect(estCle(d.hypothese), d.id).toBe(true);
          for (const r of d.donneesRequises) expect(estCle(r.libelle)).toBe(true);
        }
      }
    }
  });

  it('aucun motif renvoye par le noyau sur une entree vide n est une chaine libre', () => {
    for (const m of Object.values(MECANISMES)) {
      for (const c of calculerMatrice(m, {}).cellules) {
        expect(c.statut.etat).toBe('non-applicable');
        if (c.statut.etat === 'non-applicable') {
          expect(estCle(c.statut.motif)).toBe(true);
          expect(c.statut.donneesManquantes.length).toBeGreaterThan(0);
          for (const d of c.statut.donneesManquantes) expect(estCle(d)).toBe(true);
        }
      }
    }
  });
});

// Tests 10 et 11 du cahier des charges v4 : niveaux hors du corps du texte.
describe('position normative et reserve', () => {
  const annexe: DefinitionNiveau<EntreeFictive> = {
    id: 'annexe',
    ordre: 5,
    position: 'annexe-informative',
    reserve: 'reserve.annexe-i',
    clause: 'I.8.3.1',
    hypothese: 'niveau.tsa.2023.portee-mecanique',
    donneesRequises: [{ champ: 'a', libelle: 'champ.d' }],
    conditions: () => null,
    calculer: () => ({ statut: { etat: 'calcule' }, sollicitation: 5, resistance: 20, intermediaires: {}, clauses: [] }),
  };

  it('test 10 : tout niveau hors du corps du texte declare une reserve, cle du dictionnaire', () => {
    for (const m of Object.values(MECANISMES)) {
      for (const defs of Object.values(m.niveaux)) {
        for (const d of defs) {
          if (d.position === 'corps') continue;
          expect(d.reserve, `${m.id}/${d.id}`).toBeDefined();
          expect(estCle(d.reserve as string), `${m.id}/${d.id}`).toBe(true);
        }
      }
    }
    const sansReserve = { ...annexe, reserve: undefined };
    expect(() => evaluerNiveau('ec2-2023', sansReserve, { a: 1 })).toThrow(/reserve/);
  });

  it('test 11 : un niveau en reserve est chiffre, porte sa mention, et n est pas non applicable', () => {
    const c = evaluerNiveau('ec2-2023', annexe, { a: 1 });
    expect(c.statut).toEqual({ etat: 'reserve', motif: 'reserve.annexe-i' });
    expect(c.resistance).toBe(20);
    expect(c.taux).toBe(0.25);
    // Donnee manquante : la non-applicabilite prime, la reserve ne la masque pas.
    expect(evaluerNiveau('ec2-2023', annexe, {}).statut.etat).toBe('non-applicable');
  });
});
