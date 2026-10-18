/**
 * Charge de neige sur une toiture a deux versants : disposition uniforme et
 * versant le plus charge de la disposition non uniforme.
 *
 * Unites : kN/m2 ; degres.
 *
 * Premiere generation (EN 1991-1-3:2003 + A1:2015, 5.3.2 et 5.3.3, tableau 5.2,
 *   figure 5.3, texte non detenu, a relire) : mu_1 = 0,8 (alpha <= 30),
 *   0,8 (60 - alpha)/30 (30 < alpha < 60), 0 au-dela ; s = mu_1 C_e C_t s_k ;
 *   non uniforme : mu_1 sur un versant, 0,5 mu_1 sur l autre.
 * Deuxieme generation (EN 1991-1-3:2025, 7.5.3, (7.7), tableaux 7.2 et 7.3,
 *   figure 7.3) : s = mu_2 C_t s_k ; mu_2,b = 0,8 C_e (5 <= alpha <= 30),
 *   0,8 C_e (70 - alpha)/40 (30 < alpha <= 70), 0 au-dela ; non uniforme :
 *   mu_2,b + mu_2,w sur un versant, rien sur l autre ; mu_2,w = delta_w
 *   (6 - 5 C_e)(alpha - 5)/25 ou delta_w (6 - 5 C_e)(70 - alpha)/40,
 *   delta_w = 0,16.
 * Choix de l outil : alpha du versant charge ; pas de dispositif de retenue.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { ce } from '../neige-toiture/index';

export interface EntreeNeigeVersants {
  sk?: number;
  alpha?: number;
  exposition?: string;
  Ct?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeNeigeVersants>;

export const DELTA_W = 0.16;

const R = {
  sk: { champ: 'sk', libelle: 'champ.sk' },
  alpha: { champ: 'alpha', libelle: 'champ.alpha-versant' },
  exposition: { champ: 'exposition', libelle: 'champ.exposition-vent' },
  Ct: { champ: 'Ct', libelle: 'champ.Ct' },
} as const satisfies Record<string, { champ: keyof EntreeNeigeVersants; libelle: Cle }>;

export function mu1(alpha: number): number {
  return alpha <= 30 ? 0.8 : alpha < 60 ? (0.8 * (60 - alpha)) / 30 : 0;
}

export function mu2b(alpha: number, Ce: number): number {
  return alpha <= 30 ? 0.8 * Ce : alpha <= 70 ? (0.8 * Ce * (70 - alpha)) / 40 : 0;
}

export function mu2w(alpha: number, Ce: number): number {
  const k = DELTA_W * (6 - 5 * Ce);
  return alpha <= 30 ? (k * (alpha - 5)) / 25 : alpha <= 70 ? (k * (70 - alpha)) / 40 : 0;
}

function verifier(e: Complete): void {
  positif(e.sk, 'sk', 'kN/m2');
  positif(e.Ct, 'Ct', '-');
  if (!(e.alpha >= 0 && e.alpha < 90)) throw new Error('alpha doit etre compris entre 0 et 90 degres.');
}

function s2003(e: Complete, nonUniforme: boolean): Calcul {
  verifier(e);
  const C = ce(e.exposition);
  const m = mu1(e.alpha);
  const s = m * C * e.Ct * e.sk;
  const inter: Cellule['intermediaires'] = { 'μ_1': calculee(m, '-'), C_e: saisie(C, '-'), s: calculee(s, 'kN/m²') };
  if (nonUniforme) inter['autre versant'] = calculee(0.5 * s, 'kN/m²');
  return { statut: { etat: 'calcule' }, sollicitation: s, intermediaires: inter, clauses: ['5.3.3', 'tableau 5.2', 'figure 5.3'] };
}

function s2025(e: Complete, nonUniforme: boolean): Calcul {
  verifier(e);
  const C = ce(e.exposition);
  const b = mu2b(e.alpha, C);
  const w = nonUniforme ? mu2w(e.alpha, C) : 0;
  const s = (b + w) * e.Ct * e.sk;
  const inter: Cellule['intermediaires'] = { 'μ_2,b': calculee(b, '-'), C_e: saisie(C, '-') };
  if (nonUniforme) {
    inter['μ_2,w'] = calculee(w, '-');
    inter['autre versant'] = calculee(0, 'kN/m²');
  }
  inter.s = calculee(s, 'kN/m²');
  return { statut: { etat: 'calcule' }, sollicitation: s, intermediaires: inter, clauses: ['7.5.3', '(7.7)', 'tableau 7.2', 'tableau 7.3'] };
}

const requis = [R.sk, R.alpha, R.exposition, R.Ct];
const pente2025 = (e: EntreeNeigeVersants): Cle | null => (e.alpha !== undefined && e.alpha < 5 ? 'motif.versant-plat' : null);

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, f: (e: Complete) => Calcul, conditions: DefinitionNiveau<EntreeNeigeVersants>['conditions'] = () => null): DefinitionNiveau<EntreeNeigeVersants> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions, calculer: (e) => f(e as Complete) };
}

export const neigeVersants: Mecanisme<EntreeNeigeVersants> = {
  id: 'neige-versants',
  version: '0.1.0',
  titre: 'meca.versants.titre',
  generations: ['en1991-1-3-2003', 'en1991-1-3-2025'],
  champs: [
    { type: 'nombre', id: 'sk', libelle: 'champ.sk', symbole: 's_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'alpha', libelle: 'champ.alpha-versant', symbole: 'α', unite: '°' },
    {
      type: 'choix',
      id: 'exposition',
      libelle: 'champ.exposition-vent',
      options: [
        { valeur: 'balaye', libelle: 'option.exposition.balaye' },
        { valeur: 'normal', libelle: 'option.exposition.normal' },
        { valeur: 'protege', libelle: 'option.exposition.protege' },
      ],
    },
    { type: 'nombre', id: 'Ct', libelle: 'champ.Ct', symbole: 'C_t', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.neige-toiture', unite: 'kN/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-3-2003': [niveau('uniforme', 1, '5.3.3', 'niveau.versants.2003.uniforme', (e) => s2003(e, false)), niveau('non-uniforme', 2, '5.3.3', 'niveau.versants.2003.non-uniforme', (e) => s2003(e, true))],
    'en1991-1-3-2025': [
      niveau('uniforme', 1, '7.5.3', 'niveau.versants.2025.uniforme', (e) => s2025(e, false), pente2025),
      niveau('non-uniforme', 2, '7.5.3', 'niveau.versants.2025.non-uniforme', (e) => s2025(e, true), pente2025),
    ],
  },
};
