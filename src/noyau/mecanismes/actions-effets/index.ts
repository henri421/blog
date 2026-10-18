/**
 * Coefficient partiel applique aux actions ou aux effets des actions, pour un
 * effet non lineaire E = k F^p d une action unique.
 *
 * Unites : celles de F et de E saisies par l utilisateur (k les relie).
 *
 * Premiere generation (EN 1990:2002, 6.3.2, (6.2a) ; 6.3.2(4), texte non
 *   detenu, a relire) : E_d = E(gamma_F F) ; pour un effet qui croit moins vite
 *   que l action, le coefficient s applique a l effet de la valeur
 *   representative.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 8.3.2.1 a 8.3.2.3, (8.4),
 *   (8.5)) : (8.4) E_d = E(gamma_F F), par defaut pour les systemes lineaires
 *   et non lineaires ; (8.5) E_d = gamma_E E(F), pour les cables et membranes
 *   ou elle est plus defavorable, gamma_E pouvant etre le plus grand gamma_F.
 * Choix de l outil : une action, gamma saisi ; les deux formules sont
 *   calculees dans chaque generation, l article dit laquelle s impose.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeActionsEffets {
  /** Valeur representative de l action. */
  F?: number;
  /** Coefficient de la loi E = k F^p. */
  k?: number;
  /** Exposant de la loi E = k F^p. */
  p?: number;
  /** Coefficient partiel. */
  gamma?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeActionsEffets>;

const R = {
  F: { champ: 'F', libelle: 'champ.F-representative' },
  k: { champ: 'k', libelle: 'champ.k-loi-effet' },
  p: { champ: 'p', libelle: 'champ.p-loi-effet' },
  gamma: { champ: 'gamma', libelle: 'champ.gamma-partiel' },
} as const satisfies Record<string, { champ: keyof EntreeActionsEffets; libelle: Cle }>;

function verifier(e: Complete): void {
  positif(e.F, 'F', '-');
  positif(e.k, 'k', '-');
  positif(e.p, 'p', '-');
  if (!(e.gamma >= 1)) throw new Error('gamma doit etre au moins egal a 1.');
}

export function surActions(e: Complete, clauses: string[]): Calcul {
  verifier(e);
  const Ek = e.k * e.F ** e.p;
  const Ed = e.k * (e.gamma * e.F) ** e.p;
  return { statut: { etat: 'calcule' }, sollicitation: Ed, intermediaires: { E_k: calculee(Ek, '-'), 'γ_F': saisie(e.gamma, '-'), 'E_d / E_k': calculee(Ed / Ek, '-') }, clauses };
}

export function surEffets(e: Complete, clauses: string[]): Calcul {
  verifier(e);
  const Ek = e.k * e.F ** e.p;
  const Ed = e.gamma * Ek;
  return { statut: { etat: 'calcule' }, sollicitation: Ed, intermediaires: { E_k: calculee(Ek, '-'), 'γ_E': saisie(e.gamma, '-'), 'E_d / E_k': calculee(Ed / Ek, '-') }, clauses };
}

const requis = [R.F, R.k, R.p, R.gamma];

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, f: (e: Complete) => Calcul): DefinitionNiveau<EntreeActionsEffets> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const actionsEffets: Mecanisme<EntreeActionsEffets> = {
  id: 'actions-effets',
  version: '0.1.0',
  titre: 'meca.ae.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'F', libelle: 'champ.F-representative', symbole: 'F_rep', unite: '-' },
    { type: 'nombre', id: 'k', libelle: 'champ.k-loi-effet', symbole: 'k', unite: '-' },
    { type: 'nombre', id: 'p', libelle: 'champ.p-loi-effet', symbole: 'p', unite: '-' },
    { type: 'nombre', id: 'gamma', libelle: 'champ.gamma-partiel', symbole: 'γ', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.effet-calcul', unite: '-' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1990-2002': [
      niveau('actions', 1, '6.3.2', 'niveau.ae.2002.actions', (e) => surActions(e, ['6.3.2', '(6.2a)'])),
      niveau('effets', 2, '6.3.2(4)', 'niveau.ae.2002.effets', (e) => surEffets(e, ['6.3.2(4)'])),
    ],
    'en1990-2023': [
      niveau('actions', 1, '8.3.2.2', 'niveau.ae.2023.actions', (e) => surActions(e, ['8.3.2.2', '(8.4)'])),
      niveau('effets', 2, '8.3.2.3', 'niveau.ae.2023.effets', (e) => surEffets(e, ['8.3.2.3', '(8.5)'])),
    ],
  },
};
