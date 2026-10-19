/**
 * Valeur de calcul d une resistance : coefficient sur la propriete du
 * materiau (MFA) ou sur la resistance (RFA), pour une loi R = k X^q.
 *
 * Unites : celles de X et de R saisies par l utilisateur.
 *
 * Premiere generation (EN 1990:2002, 6.3.3, (6.3) ; 6.3.5, (6.6) a (6.6d), lu
 *   sur le texte le 2026-10-19) : R_d = R(eta X_k / gamma_M) (6.6a) ou
 *   R_d = R_k / gamma_M (6.6c) ; (6.6d), plusieurs materiaux en analyse non
 *   lineaire, non codee.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 8.3.5.1 a 8.3.5.3, (8.18) a
 *   (8.20), 8.3.6, (8.23)) : MFA (8.19) R_d = R(eta X_k / gamma_M) ;
 *   RFA (8.20) R_d = R(eta X_k) / gamma_R ; gamma_M = gamma_R = gamma_m gamma_Rd.
 * Choix de l outil : une propriete, eta et gamma saisis ; les deux approches
 *   sont calculees dans chaque generation.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeResistanceCalcul {
  Xk?: number;
  eta?: number;
  k?: number;
  q?: number;
  gamma?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeResistanceCalcul>;

const R = {
  Xk: { champ: 'Xk', libelle: 'champ.Xk' },
  eta: { champ: 'eta', libelle: 'champ.eta-conversion' },
  k: { champ: 'k', libelle: 'champ.k-loi-resistance' },
  q: { champ: 'q', libelle: 'champ.q-loi-resistance' },
  gamma: { champ: 'gamma', libelle: 'champ.gamma-materiau' },
} as const satisfies Record<string, { champ: keyof EntreeResistanceCalcul; libelle: Cle }>;

function verifier(e: Complete): void {
  positif(e.Xk, 'Xk', '-');
  positif(e.eta, 'eta', '-');
  positif(e.k, 'k', '-');
  positif(e.q, 'q', '-');
  if (!(e.gamma >= 1)) throw new Error('gamma doit etre au moins egal a 1.');
}

export function mfa(e: Complete, clauses: string[]): Calcul {
  verifier(e);
  const Xd = (e.eta * e.Xk) / e.gamma;
  const Rd = e.k * Xd ** e.q;
  const Rk = e.k * (e.eta * e.Xk) ** e.q;
  return { statut: { etat: 'calcule' }, resistance: Rd, intermediaires: { X_d: calculee(Xd, '-'), 'γ_M': saisie(e.gamma, '-'), R_k: calculee(Rk, '-'), 'R_k / R_d': calculee(Rk / Rd, '-') }, clauses };
}

export function rfa(e: Complete, clauses: string[]): Calcul {
  verifier(e);
  const Rk = e.k * (e.eta * e.Xk) ** e.q;
  const Rd = Rk / e.gamma;
  return { statut: { etat: 'calcule' }, resistance: Rd, intermediaires: { X_rep: calculee(e.eta * e.Xk, '-'), 'γ_R': saisie(e.gamma, '-'), R_k: calculee(Rk, '-'), 'R_k / R_d': calculee(Rk / Rd, '-') }, clauses };
}

const requis = [R.Xk, R.eta, R.k, R.q, R.gamma];

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, f: (e: Complete) => Calcul): DefinitionNiveau<EntreeResistanceCalcul> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const resistanceCalcul: Mecanisme<EntreeResistanceCalcul> = {
  id: 'resistance-calcul',
  version: '0.1.0',
  titre: 'meca.rd.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'Xk', libelle: 'champ.Xk', symbole: 'X_k', unite: '-' },
    { type: 'nombre', id: 'eta', libelle: 'champ.eta-conversion', symbole: 'η', unite: '-' },
    { type: 'nombre', id: 'k', libelle: 'champ.k-loi-resistance', symbole: 'k', unite: '-' },
    { type: 'nombre', id: 'q', libelle: 'champ.q-loi-resistance', symbole: 'q', unite: '-' },
    { type: 'nombre', id: 'gamma', libelle: 'champ.gamma-materiau', symbole: 'γ_M', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.resistance-calcul', unite: '-' },
  niveaux: {
    'en1990-2002': [niveau('mfa', 1, '6.3.5', 'niveau.rd.2002.mfa', (e) => mfa(e, ['6.3.5', '(6.6a)'])), niveau('rfa', 2, '6.3.5', 'niveau.rd.2002.rfa', (e) => rfa(e, ['6.3.5', '(6.6c)']))],
    'en1990-2023': [niveau('mfa', 1, '8.3.5.2', 'niveau.rd.2023.mfa', (e) => mfa(e, ['8.3.5.2', '(8.19)', '(8.23)'])), niveau('rfa', 2, '8.3.5.3', 'niveau.rd.2023.rfa', (e) => rfa(e, ['8.3.5.3', '(8.20)']))],
  },
};
