/**
 * Valeur caracteristique (fractile a 5 %) d une propriete a partir de n
 * resultats d essais, loi normale, sans connaissance prealable de la moyenne.
 *
 * Unites : celles des essais.
 *
 * Premiere generation (EN 1990:2002, annexe D, D.7.1(5), D.7.2, (D.1) a (D.3),
 *   tableau D.1, lus sur le texte le 2026-10-19) et deuxieme generation
 *   (EN 1990-1:2023+A1:2026, annexe D, D.7.2, (D.1) a (D.3), tableau D.1) :
 *   X_k = m_x (1 - k_n V_x) (V_x connu) ou X_k = m_x - k_n s_x (V_x inconnu).
 *   D.7.1(5) de 2002, reconduit en 2023, recommande de ne pas supposer V_x
 *   inconnu inferieur a 0,10.
 * Choix de l outil (decision de l auteur du 2026-10-19) : le plancher est
 *   applique, par prudence, au cas V_x inconnu : X_k = m_x (1 - k_n V_x) avec
 *   V_x = max(s_x / m_x ; 0,10), identique a m_x - k_n s_x au-dessus du
 *   plancher ; la valeur sans plancher reste affichee en intermediaire.
 * Choix de l outil : k_n calcule et non lu dans le tableau D.1 :
 *   V_x connu : k_n = u_0,95 sqrt(1 + 1/n) ;
 *   V_x inconnu : k_n = t_(n-1 ; 0,95) sqrt(1 + 1/n), t de Student calcule par
 *   integration numerique. Le tableau D.1 tronque plutot qu il n arrondit :
 *   ecart de 0,01 a 0,02 (n = 1 : 2,33 contre 2,31 ; n = 4 : 1,84 contre
 *   1,83 ; n = 8, V_x inconnu : 2,01 contre 2,00), sans effet sur X_k au-dela
 *   du centieme relatif. Huit essais au plus ; loi log-normale non codee.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';

const IDS = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'] as const;

export type EntreeEssaisCaracteristique = Partial<Record<(typeof IDS)[number], number>> & {
  /** Coefficient de variation connu a priori (facultatif). */
  Vx?: number;
};

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

export const U95 = 1.6448536269514722;

/** Densite de Student a nu degres de liberte. */
function densite(t: number, nu: number): number {
  const lg = (x: number): number => {
    // log Gamma par Lanczos (g = 7).
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lg(1 - x);
    x -= 1;
    let a = c[0];
    const tt = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(tt) - tt + Math.log(a);
  };
  return Math.exp(lg((nu + 1) / 2) - lg(nu / 2) - 0.5 * Math.log(nu * Math.PI) - ((nu + 1) / 2) * Math.log(1 + (t * t) / nu));
}

/** Fonction de repartition de Student pour t >= 0 (Simpson). */
function repartition(t: number, nu: number): number {
  const n = 4000;
  const h = t / n;
  let s = densite(0, nu) + densite(t, nu);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * densite(i * h, nu);
  return 0.5 + (s * h) / 3;
}

/** Quantile a 95 % de la loi de Student. */
export function student95(nu: number): number {
  let a = 0;
  let b = 20;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (repartition(m, nu) < 0.95) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

export function knConnu(n: number): number {
  return U95 * Math.sqrt(1 + 1 / n);
}

export function knInconnu(n: number): number {
  return student95(n - 1) * Math.sqrt(1 + 1 / n);
}

function valeurs(e: EntreeEssaisCaracteristique): number[] {
  return IDS.map((k) => e[k]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

function stats(x: number[]): { n: number; m: number; s: number } {
  const n = x.length;
  const m = x.reduce((a, b) => a + b, 0) / n;
  const s = n > 1 ? Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)) : 0;
  return { n, m, s };
}

export function connu(e: EntreeEssaisCaracteristique, clauses: string[]): Calcul {
  const { n, m } = stats(valeurs(e));
  const V = e.Vx as number;
  if (!(V >= 0 && V < 1)) throw new Error('Vx doit etre compris entre 0 et 1.');
  const kn = knConnu(n);
  const Xk = m * (1 - kn * V);
  return { statut: { etat: 'calcule' }, resistance: Xk, intermediaires: { n: saisie(n, '-'), m_x: calculee(m, '-'), V_x: saisie(V, '-'), k_n: calculee(kn, '-'), X_k: calculee(Xk, '-') }, clauses };
}

/** Plancher du coefficient de variation inconnu (D.7.1(5)). */
export const VX_MIN = 0.1;

export function inconnu(e: EntreeEssaisCaracteristique, clauses: string[]): Calcul {
  const { n, m, s } = stats(valeurs(e));
  const kn = knInconnu(n);
  const Vech = s / m;
  const plancher = Vech < VX_MIN;
  const V = plancher ? VX_MIN : Vech;
  const Xk = m * (1 - kn * V);
  return {
    statut: { etat: 'calcule' },
    resistance: Xk,
    intermediaires: {
      n: saisie(n, '-'),
      m_x: calculee(m, '-'),
      s_x: calculee(s, '-'),
      'V_x échantillon': calculee(Vech, '-'),
      V_x: plancher ? recommandee(VX_MIN, '-') : calculee(V, '-'),
      k_n: calculee(kn, '-'),
      'X_k sans plancher': calculee(m - kn * s, '-'),
      X_k: calculee(Xk, '-'),
    },
    clauses: plancher ? [...clauses, 'D.7.1(5)'] : clauses,
  };
}

const R = {
  x1: { champ: 'x1', libelle: 'champ.essai-1' },
  x2: { champ: 'x2', libelle: 'champ.essai-2' },
  x3: { champ: 'x3', libelle: 'champ.essai-3' },
  Vx: { champ: 'Vx', libelle: 'champ.Vx-connu' },
} as const satisfies Record<string, { champ: keyof EntreeEssaisCaracteristique; libelle: Cle }>;

function niveaux(clause: string, clauses: string[], h: string): DefinitionNiveau<EntreeEssaisCaracteristique>[] {
  return [
    { id: 'v-connu', ordre: 1, position: 'annexe-informative', reserve: 'reserve.en1990-annexe-d', clause, hypothese: `niveau.essais.${h}.connu` as Cle, donneesRequises: [R.x1, R.Vx], conditions: () => null, calculer: (e) => connu(e, clauses) },
    {
      id: 'v-inconnu',
      ordre: 2,
      position: 'annexe-informative',
      reserve: 'reserve.en1990-annexe-d',
      clause,
      hypothese: `niveau.essais.${h}.inconnu` as Cle,
      donneesRequises: [R.x1, R.x2, R.x3],
      conditions: () => null,
      calculer: (e) => inconnu(e, clauses),
    },
  ];
}

export const essaisCaracteristique: Mecanisme<EntreeEssaisCaracteristique> = {
  id: 'essais-caracteristique',
  version: '0.1.0',
  titre: 'meca.essais.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    ...IDS.map((id, i) => ({ type: 'nombre' as const, id, libelle: `champ.essai-${i + 1}` as Cle, symbole: `x_${i + 1}`, unite: '-', facultatif: i >= 1 })),
    { type: 'nombre', id: 'Vx', libelle: 'champ.Vx-connu', symbole: 'V_x', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.valeur-caracteristique-essais', unite: '-' },
  niveaux: { 'en1990-2002': niveaux('D.7.2', ['D.7.2', '(D.1)', 'tableau D.1'], '2002'), 'en1990-2023': niveaux('D.7.2', ['D.7.2', '(D.1) à (D.3)', 'tableau D.1'], '2023') },
};
