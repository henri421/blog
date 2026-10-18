/**
 * Comptage des cycles par la methode des demi-cycles (« rainflow ») d un
 * historique de contraintes ferme, et plage equivalente a 2.10^6 cycles.
 *
 * Unites : MPa (ou toute unite de contrainte) ; nombres de cycles.
 *
 * Premiere generation (EN 1990:2002) : pas de methode de comptage dans
 *   l EN 1990 (renvoi aux Eurocodes de materiaux) ; niveau sans equivalent.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 6.1.3.3(5) et (6), annexe F,
 *   F.3) : couper l historique a son maximum absolu, reporter la partie
 *   gauche a la fin, puis compter les demi-cycles ; les cycles s obtiennent
 *   par couplage.
 * Choix de l outil : algorithme a trois points sur l historique reordonne
 *   (equivalent au couplage des demi-cycles pour un historique ferme) ; plage
 *   equivalente Delta_sigma_E = (n_rep Sum Delta_sigma^m / 2.10^6)^(1/m),
 *   pente m unique saisie.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

const IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;

export type EntreeComptageCycles = Partial<Record<(typeof IDS)[number], number>> & {
  m?: number;
  nrep?: number;
};

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

function extrema(x: number[]): number[] {
  const t = [x[0]];
  for (const v of x.slice(1)) {
    if (v === t[t.length - 1]) continue;
    if (t.length >= 2 && (t[t.length - 1] - t[t.length - 2]) * (v - t[t.length - 1]) > 0) t[t.length - 1] = v;
    else t.push(v);
  }
  return t;
}

/** Plages des cycles complets d un historique ferme. */
export function rainflow(x: number[]): number[] {
  let i = 0;
  x.forEach((v, k) => {
    if (v > x[i]) i = k;
  });
  const y = extrema([...x.slice(i), ...x.slice(0, i), x[i]]);
  const pile: number[] = [];
  const cycles: number[] = [];
  for (const v of y) {
    pile.push(v);
    while (pile.length >= 3) {
      const [a, b, c] = pile.slice(-3);
      const X = Math.abs(c - b);
      const Y = Math.abs(b - a);
      if (X < Y) break;
      cycles.push(Y);
      pile.splice(pile.length - 3, 2);
    }
  }
  return cycles.sort((p, q) => q - p);
}

export function equivalente(e: EntreeComptageCycles): Calcul {
  const x = IDS.map((k) => e[k]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (x.length < 3) throw new Error('Il faut au moins trois valeurs.');
  const m = e.m as number;
  const n = e.nrep as number;
  positif(m, 'm', '-');
  positif(n, 'nrep', '-');
  const c = rainflow(x);
  const somme = c.reduce((a, d) => a + d ** m, 0);
  const dE = ((n * somme) / 2e6) ** (1 / m);
  const inter: Cellule['intermediaires'] = { m: saisie(m, '-'), n_rep: saisie(n, '-'), 'nombre de cycles': calculee(c.length, '-') };
  c.forEach((d, k) => {
    inter[`Δσ_${k + 1}`] = calculee(d, 'MPa');
  });
  inter['Δσ_E,2e6'] = calculee(dE, 'MPa');
  return { statut: { etat: 'calcule' }, sollicitation: dE, intermediaires: inter, clauses: ['6.1.3.3(6)', 'F.3'] };
}

const R = {
  s1: { champ: 's1', libelle: 'champ.contrainte-1' },
  s2: { champ: 's2', libelle: 'champ.contrainte-2' },
  s3: { champ: 's3', libelle: 'champ.contrainte-3' },
  m: { champ: 'm', libelle: 'champ.m-pente' },
  nrep: { champ: 'nrep', libelle: 'champ.nrep' },
} as const satisfies Record<string, { champ: keyof EntreeComptageCycles; libelle: Cle }>;

const requis = [R.s1, R.s2, R.s3, R.m, R.nrep];

const niveau2002: DefinitionNiveau<EntreeComptageCycles> = {
  id: 'rainflow',
  ordre: 1,
  position: 'corps',
  clause: '—',
  hypothese: 'niveau.cycles.2002',
  donneesRequises: requis,
  conditions: () => 'motif.sans-equivalent-2004',
  calculer: () => {
    throw new Error('Pas de methode de comptage dans l EN 1990:2002 : jamais calcule.');
  },
};

const niveau2023: DefinitionNiveau<EntreeComptageCycles> = {
  id: 'rainflow',
  ordre: 1,
  position: 'annexe-informative',
  reserve: 'reserve.en1990-annexe-f',
  clause: 'F.3',
  hypothese: 'niveau.cycles.2023',
  donneesRequises: requis,
  conditions: () => null,
  calculer: (e) => equivalente(e),
};

export const comptageCycles: Mecanisme<EntreeComptageCycles> = {
  id: 'comptage-cycles',
  version: '0.1.0',
  titre: 'meca.cycles.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    ...IDS.map((id, i) => ({ type: 'nombre' as const, id, libelle: `champ.contrainte-${i + 1}` as Cle, symbole: `σ_${i + 1}`, unite: 'MPa', facultatif: i >= 3 })),
    { type: 'nombre', id: 'm', libelle: 'champ.m-pente', symbole: 'm', unite: '-' },
    { type: 'nombre', id: 'nrep', libelle: 'champ.nrep', symbole: 'n_rep', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.plage-equivalente', unite: 'MPa' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1990-2002': [niveau2002], 'en1990-2023': [niveau2023] },
};
