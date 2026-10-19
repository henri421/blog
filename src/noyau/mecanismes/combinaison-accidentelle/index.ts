/**
 * Combinaison d actions en situation de projet accidentelle (choc, incendie,
 * survie apres un evenement), batiments, et coefficient de reduction eta_fi
 * de la methode simplifiee au feu.
 *
 * Unites : celles des effets saisis (kN, kN.m...) ; le calcul est lineaire.
 *
 * Premiere generation (EN 1990:2002, 6.4.3.3, (6.11a), (6.11b), tableau A1.3,
 *   lus sur le texte le 2026-10-19 ; EN 1991-1-2:2002, 4.3.1, 4.3.2, (4.5),
 *   texte non detenu, cite de memoire) :
 *   E_d = G + A_d + (psi1,1 ou psi2,1) Q1 + psi2,2 Q2 ;
 *   eta_fi = (G + psi_fi Q1) / (1,35 G + 1,5 Q1).
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 8.3.4.3, (8.15), tableau A.1.3 ;
 *   EN 1991-1-2:2024, 6.3.1(2), (6.1), (6.2)) : meme combinaison ;
 *   eta_fi = (G + psi_fi Q1) / (gamma_G G + gamma_Q,1 Q1), gamma_G = 1,35 k_F,
 *   gamma_Q = 1,5 k_F (tableaux A.1.8, A.1.9).
 * Choix de l outil : une action permanente, une action variable dominante et
 *   une d accompagnement ; psi saisis ; valeur frequente ou quasi permanente
 *   choisie par l utilisateur (quasi permanente recommandee pour l incendie,
 *   6.3.1(2) NOTE) ; eta_fi rapporte a la formule (6.10) ou (8.12).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { GAMMA_G, GAMMA_Q, kF } from '../combinaison-elu/index';

export interface EntreeCombinaisonAccidentelle {
  G?: number;
  /** Valeur de calcul de l action accidentelle (0 pour l incendie ou la survie). */
  Ad?: number;
  Q1?: number;
  psi11?: number;
  psi21?: number;
  Q2?: number;
  psi22?: number;
  /** 'frequente' ou 'quasi-permanente' pour Q1. */
  valeur?: string;
  cc?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeCombinaisonAccidentelle>;

const R = {
  G: { champ: 'G', libelle: 'champ.G-effet' },
  Ad: { champ: 'Ad', libelle: 'champ.Ad-effet' },
  Q1: { champ: 'Q1', libelle: 'champ.Q1-effet' },
  psi11: { champ: 'psi11', libelle: 'champ.psi11' },
  psi21: { champ: 'psi21', libelle: 'champ.psi21' },
  Q2: { champ: 'Q2', libelle: 'champ.Q2-effet' },
  psi22: { champ: 'psi22', libelle: 'champ.psi22' },
  valeur: { champ: 'valeur', libelle: 'champ.valeur-q1-accidentelle' },
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
} as const satisfies Record<string, { champ: keyof EntreeCombinaisonAccidentelle; libelle: Cle }>;

function verifier(e: Complete): void {
  positif(e.G, 'G', 'effet');
  positif(e.Q1, 'Q1', 'effet');
  for (const [v, nom] of [
    [e.Ad, 'Ad'],
    [e.Q2, 'Q2'],
  ] as const) {
    if (!(v >= 0)) throw new Error(`${nom} doit etre positif ou nul.`);
  }
  for (const [v, nom] of [
    [e.psi11, 'psi1,1'],
    [e.psi21, 'psi2,1'],
    [e.psi22, 'psi2,2'],
  ] as const) {
    if (!(v >= 0 && v <= 1)) throw new Error(`${nom} doit etre compris entre 0 et 1.`);
  }
}

export function accidentelle(e: Complete, k: number, clauses: string[]): Calcul {
  verifier(e);
  const psi = e.valeur === 'frequente' ? e.psi11 : e.psi21;
  const Ed = e.G + e.Ad + psi * e.Q1 + e.psi22 * e.Q2;
  const eta = (e.G + psi * e.Q1) / (GAMMA_G * k * e.G + GAMMA_Q * k * e.Q1);
  return {
    statut: { etat: 'calcule' },
    sollicitation: Ed,
    intermediaires: { 'ψ_fi': saisie(psi, '-'), k_F: recommandee(k, '-'), 'E_d,acc': calculee(Ed, '-'), 'η_fi': calculee(eta, '-') },
    clauses,
  };
}

const requis = [R.G, R.Ad, R.Q1, R.psi11, R.psi21, R.Q2, R.psi22, R.valeur];

function niveau(clause: string, hypothese: Cle, donnees: DefinitionNiveau<EntreeCombinaisonAccidentelle>['donneesRequises'], f: (e: Complete) => Calcul): DefinitionNiveau<EntreeCombinaisonAccidentelle> {
  return { id: 'acc', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: donnees, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const combinaisonAccidentelle: Mecanisme<EntreeCombinaisonAccidentelle> = {
  id: 'combinaison-accidentelle',
  version: '0.1.0',
  titre: 'meca.acc.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'G', libelle: 'champ.G-effet', symbole: 'G_k', unite: 'kN' },
    { type: 'nombre', id: 'Ad', libelle: 'champ.Ad-effet', symbole: 'A_d', unite: 'kN' },
    { type: 'nombre', id: 'Q1', libelle: 'champ.Q1-effet', symbole: 'Q_k,1', unite: 'kN' },
    { type: 'nombre', id: 'psi11', libelle: 'champ.psi11', symbole: 'ψ_1,1', unite: '-' },
    { type: 'nombre', id: 'psi21', libelle: 'champ.psi21', symbole: 'ψ_2,1', unite: '-' },
    { type: 'nombre', id: 'Q2', libelle: 'champ.Q2-effet', symbole: 'Q_k,2', unite: 'kN' },
    { type: 'nombre', id: 'psi22', libelle: 'champ.psi22', symbole: 'ψ_2,2', unite: '-' },
    {
      type: 'choix',
      id: 'valeur',
      libelle: 'champ.valeur-q1-accidentelle',
      options: [
        { valeur: 'quasi-permanente', libelle: 'option.valeur-q1.quasi-permanente' },
        { valeur: 'frequente', libelle: 'option.valeur-q1.frequente' },
      ],
    },
    {
      type: 'choix',
      id: 'cc',
      libelle: 'champ.classe-consequences',
      options: [
        { valeur: 'CC1', libelle: 'option.cc.CC1' },
        { valeur: 'CC2', libelle: 'option.cc.CC2' },
        { valeur: 'CC3', libelle: 'option.cc.CC3' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.effet-calcul-accidentel', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1990-2002': [niveau('6.4.3.3', 'niveau.acc.2002', requis, (e) => accidentelle(e, 1, ['6.4.3.3', '(6.11b)', 'EN 1991-1-2 4.3']))],
    'en1990-2023': [niveau('8.3.4.3', 'niveau.acc.2023', [...requis, R.cc], (e) => accidentelle(e, kF(e.cc), ['8.3.4.3', '(8.15)', 'EN 1991-1-2 6.3', '(6.2)']))],
  },
};
