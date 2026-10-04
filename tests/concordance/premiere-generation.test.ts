import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../src/noyau/moteur/matrice';
import { MECANISMES } from '../../src/noyau/index';

// Test 7 du cahier des charges : la premiere generation coincide avec les
// outils de la suite pris isolement. Les valeurs ci-dessous ont ete rendues
// par le code reel des depots, execute sur les memes donnees le 2026-10-04
// (docs/validation/concordance.md) :
//   section-uls    commit 6a7a897 : shearWithoutLinks, shearWithLinks
//   poinconnement  commit ed211ef : resistanceSansArmatures
// Tolerance declaree : 1e-6 en relatif.

const TOLERANCE = 1e-6;

function premiere(mecanisme: string, entree: Record<string, unknown>) {
  const c = calculerMatrice(MECANISMES[mecanisme], entree).cellules.find((x) => x.generation === 'ec2-2004');
  if (!c) throw new Error('cellule 2004 absente');
  return c;
}

function proche(calcule: number | undefined, reference: number): void {
  expect(calcule).toBeDefined();
  expect(Math.abs((calcule as number) - reference) / reference).toBeLessThan(TOLERANCE);
}

describe('concordance avec section-uls (6a7a897)', () => {
  it('effort tranchant sans armature, dalle', () => {
    const c = premiere('tranchant-sans-armature', { VEd: 60, bw: 1000, d: 190, Asl: 754, fck: 25 });
    proche(c.resistance, 97.98300635507499);
  });

  it('effort tranchant sans armature, radier', () => {
    const c = premiere('tranchant-sans-armature', { VEd: 400, bw: 1000, d: 450, Asl: 4909, fck: 30 });
    proche(c.resistance, 287.87885529867754);
  });

  it('effort tranchant avec armatures, bielle et cadres simultanes', () => {
    // section-uls prend cot(theta) en entree : on lui a donne l optimum 2,191181.
    const c = premiere('tranchant-avec-armature', { VEd: 550, bw: 300, d: 550, Asw: 157, s: 125, fck: 30, fyk: 500 });
    proche(c.resistance, 592.3047753731723);
  });

  it('effort tranchant avec armatures, cadres determinants a cot = 2,5', () => {
    const c = premiere('tranchant-avec-armature', { VEd: 250, bw: 300, d: 550, Asw: 100.5, s: 200, fck: 30, fyk: 500 });
    proche(c.resistance, 270.366847826087);
  });
});

describe('concordance avec poinconnement (ed211ef)', () => {
  it('contrainte resistante v_Rd,c du plancher-dalle', () => {
    const c = premiere('poinconnement', { VEd: 360, c1: 300, c2: 300, dx: 205, dy: 190, Asx: 1026, Asy: 1026, fck: 30 });
    proche(c.intermediaires['v_Rd,c'].valeur, 0.5996293331674765);
  });
});
