/**
 * Indice de fiabilite cible selon la classe de consequences et conversion
 * entre periodes de reference (ELU, situations durables et transitoires).
 *
 * Unites : annees ; beta et P_f sans dimension.
 *
 * Premiere generation (EN 1990:2002, annexe B, B.3.2, tableau B.2, et annexe
 *   C, C.6, NOTE 2, (C.3), lus sur le texte le 2026-10-19) : beta_1 = 4,2 ;
 *   4,7 ; 5,2 pour RC1 a RC3 (CC1 a CC3) ; Phi(beta_n) = [Phi(beta_1)]^n, posee
 *   en note pour des maxima annuels independants. Le tableau B.2 donne aussi
 *   directement beta_50 = 3,3 ; 3,8 ; 4,3, valeurs arrondies que (C.3) ne
 *   reproduit pas exactement (3,21 ; 3,83 ; 4,42) : ecart soumis a l auteur.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 4.2, annexe C, tableau C.3,
 *   tableau C.2) : memes valeurs, meme conversion, P_f = Phi(-beta).
 * Choix de l outil : conversion par independance des annees successives ;
 *   Phi et Phi^-1 calcules numeriquement (precision 1e-9 environ).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeFiabilite {
  cc?: string;
  /** Periode de reference (annees). */
  T?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFiabilite>;

const R = {
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
  T: { champ: 'T', libelle: 'champ.T-reference' },
} as const satisfies Record<string, { champ: keyof EntreeFiabilite; libelle: Cle }>;

/** Fonction de repartition de la loi normale centree reduite. */
export function phi(x: number): number {
  // erfc de Numerical Recipes (erfcc), erreur relative inferieure a 1,2e-7.
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? 1 - r / 2 : r / 2;
}

/** Inverse de phi par dichotomie (monotone). */
export function phiInv(p: number): number {
  let a = -40;
  let b = 40;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (phi(m) < p) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

export function beta1(cc: string): number {
  return cc === 'CC3' ? 5.2 : cc === 'CC1' ? 4.2 : 4.7;
}

/** beta sur T annees a partir de beta sur 1 an. */
export function betaT(b1: number, T: number): number {
  // Phi(beta_T) = Phi(beta_1)^T ; calcul en complementaire pour la precision.
  const pf1 = phi(-b1);
  const pfT = -Math.expm1(T * Math.log1p(-pf1));
  return -phiInv(pfT);
}

function calculer(e: Complete, clauses: string[]): Calcul {
  positif(e.T, 'T', 'ans');
  const b1 = beta1(e.cc);
  const bT = betaT(b1, e.T);
  return {
    statut: { etat: 'calcule' },
    resistance: bT,
    intermediaires: { 'β_1': recommandee(b1, '-'), T: saisie(e.T, 'ans'), 'β_T': calculee(bT, '-'), 'P_f,T': calculee(phi(-bT), '-') },
    clauses,
  };
}

const extremes = (e: EntreeFiabilite): Cle | null => (e.cc === 'CC0' ? 'motif.cc0' : e.cc === 'CC4' ? 'motif.cc4' : null);

const niveau2002: DefinitionNiveau<EntreeFiabilite> = {
  id: 'beta',
  ordre: 1,
  position: 'annexe-informative',
  reserve: 'reserve.en1990-annexe-c',
  clause: 'C.6',
  hypothese: 'niveau.fiab.2002',
  donneesRequises: [R.cc, R.T],
  conditions: extremes,
  calculer: (e) => calculer(e as Complete, ['B.3.2', 'tableau B.2', 'C.6', '(C.3)']),
};

const niveau2023: DefinitionNiveau<EntreeFiabilite> = {
  id: 'beta',
  ordre: 1,
  position: 'annexe-informative',
  reserve: 'reserve.en1990-annexe-c',
  clause: 'C.3.4',
  hypothese: 'niveau.fiab.2023',
  donneesRequises: [R.cc, R.T],
  conditions: extremes,
  calculer: (e) => calculer(e as Complete, ['4.2', 'C.3.4', 'tableau C.2', 'tableau C.3']),
};

export const fiabilite: Mecanisme<EntreeFiabilite> = {
  id: 'fiabilite',
  version: '0.1.0',
  titre: 'meca.fiab.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
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
    { type: 'nombre', id: 'T', libelle: 'champ.T-reference', symbole: 'T', unite: 'ans' },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.indice-fiabilite', unite: '-' },
  niveaux: { 'en1990-2002': [niveau2002], 'en1990-2023': [niveau2023] },
};
