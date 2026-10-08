/**
 * Precontrainte : contrainte de mise en tension maximale et pertes par
 * frottement.
 *
 * Unites : MPa, radians, m.
 *
 * Memes regles dans les deux generations :
 *   sigma_p,max <= min(0,8 f_pk ; 0,9 f_p0,1k) (5.10.2.1, k_1 = 0,8,
 *   k_2 = 0,9 recommandes ; 7.6.2(2), tableau 7.1) ;
 *   pertes par frottement Delta sigma = sigma_p,max (1 - exp(-mu (theta + k x)))
 *   ((5.45) ; (7.34)), mu et k saisis (tableau 5.1 ou 7.2, documentation du
 *   procede ; 0,005 < k < 0,01 par metre en post-tension interne).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreePrecontrainteTension {
  fpk?: number;
  fp01k?: number;
  /** Contrainte a l extremite active pendant la mise en tension (MPa). */
  sigmaPmax?: number;
  /** Coefficient de frottement, somme des deviations angulaires (rad), deviation parasite (rad/m), abscisse (m). */
  mu?: number;
  theta?: number;
  k?: number;
  x?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePrecontrainteTension>;

const R = {
  fpk: { champ: 'fpk', libelle: 'champ.fpk' },
  fp01k: { champ: 'fp01k', libelle: 'champ.fp01k' },
  sigmaPmax: { champ: 'sigmaPmax', libelle: 'champ.sigmaPmax' },
  mu: { champ: 'mu', libelle: 'champ.mu-frottement' },
  theta: { champ: 'theta', libelle: 'champ.theta-deviation' },
  k: { champ: 'k', libelle: 'champ.k-parasite' },
  x: { champ: 'x', libelle: 'champ.x-abscisse' },
} as const satisfies Record<string, { champ: keyof EntreePrecontrainteTension; libelle: Cle }>;

export function limiteTension(e: Complete, clauses: string[]): Calcul {
  positif(e.fpk, 'f_pk', 'MPa');
  positif(e.fp01k, 'f_p0,1k', 'MPa');
  positif(e.sigmaPmax, 'sigma_p,max', 'MPa');
  const limite = Math.min(0.8 * e.fpk, 0.9 * e.fp01k);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.sigmaPmax,
    resistance: limite,
    intermediaires: { '0,8 f_pk': calculee(0.8 * e.fpk, 'MPa'), '0,9 f_p0,1k': calculee(0.9 * e.fp01k, 'MPa') },
    clauses,
  };
}

export function frottement(e: Complete, clauses: string[]): Calcul {
  positif(e.sigmaPmax, 'sigma_p,max', 'MPa');
  for (const [v, n] of [
    [e.mu, 'mu'],
    [e.theta, 'theta'],
    [e.k, 'k'],
    [e.x, 'x'],
  ] as const) {
    if (!(Number.isFinite(v) && v >= 0)) throw new Error(`${n} doit etre positif ou nul.`);
  }
  const perte = e.sigmaPmax * (1 - Math.exp(-e.mu * (e.theta + e.k * e.x)));
  return {
    statut: { etat: 'calcule' },
    sollicitation: perte,
    intermediaires: {
      'σ_p,max': saisie(e.sigmaPmax, 'MPa'),
      'Δσ_p,μ': calculee(perte, 'MPa'),
      'σ_p(x)': calculee(e.sigmaPmax - perte, 'MPa'),
      'perte relative': calculee(perte / e.sigmaPmax, '-'),
    },
    clauses,
  };
}

function niveaux(gen: '2004' | '2023'): DefinitionNiveau<EntreePrecontrainteTension>[] {
  return [
    {
      id: 'limite',
      ordre: 1,
      position: 'corps',
      clause: gen === '2004' ? '5.10.2.1' : '7.6.2',
      hypothese: 'niveau.pc.limite',
      donneesRequises: [R.fpk, R.fp01k, R.sigmaPmax],
      conditions: () => null,
      calculer: (e) => limiteTension(e as Complete, gen === '2004' ? ['5.10.2.1', '(5.41)'] : ['7.6.2(2)', 'tableau 7.1']),
    },
    {
      id: 'frottement',
      ordre: 2,
      position: 'corps',
      clause: gen === '2004' ? '5.10.5.2' : '7.6.3.2',
      hypothese: 'niveau.pc.frottement',
      donneesRequises: [R.sigmaPmax, R.mu, R.theta, R.k, R.x],
      conditions: () => null,
      calculer: (e) => frottement(e as Complete, gen === '2004' ? ['5.10.5.2', '(5.45)'] : ['7.6.3.2', '(7.34)']),
    },
  ];
}

export const precontrainteTension: Mecanisme<EntreePrecontrainteTension> = {
  id: 'precontrainte-tension',
  version: '0.1.0',
  titre: 'meca.pc.titre',
  champs: [
    { type: 'nombre', id: 'fpk', libelle: 'champ.fpk', symbole: 'f_pk', unite: 'MPa' },
    { type: 'nombre', id: 'fp01k', libelle: 'champ.fp01k', symbole: 'f_p0,1k', unite: 'MPa' },
    { type: 'nombre', id: 'sigmaPmax', libelle: 'champ.sigmaPmax', symbole: 'σ_p,max', unite: 'MPa' },
    { type: 'nombre', id: 'mu', libelle: 'champ.mu-frottement', symbole: 'μ', unite: '-' },
    { type: 'nombre', id: 'theta', libelle: 'champ.theta-deviation', symbole: 'θ', unite: 'rad' },
    { type: 'nombre', id: 'k', libelle: 'champ.k-parasite', symbole: 'k', unite: 'rad/m' },
    { type: 'nombre', id: 'x', libelle: 'champ.x-abscisse', symbole: 'x', unite: 'm' },
  ],
  sollicitation: { libelle: 'grandeur.contrainte-ou-perte', unite: 'MPa' },
  resistance: { libelle: 'grandeur.contrainte-limite-tension', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux('2004'), 'ec2-2023': niveaux('2023') },
};
