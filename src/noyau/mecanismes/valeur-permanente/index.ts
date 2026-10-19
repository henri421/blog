/**
 * Valeurs caracteristiques d une action permanente (loi normale) : valeur
 * unique si la variabilite est faible, sinon valeurs superieure et inferieure.
 *
 * Unites : celles de G_m ; V sans dimension.
 *
 * Premiere generation (EN 1990:2002, 4.1.2(2) a (5), lu sur le texte le
 *   2026-10-19) : valeur unique G_k = G_m si V est faible (0,05 a 0,10 selon
 *   la NOTE de 4.1.2(3)) ; sinon fractiles 95 % et 5 % d une loi supposee
 *   gaussienne ; deux valeurs meme a faible variabilite pour une structure
 *   tres sensible aux variations de G (4.1.2(4)), cas laisse a l ingenieur.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 6.1.2.2(2) a (6)) : V faible si
 *   V <= 5 % pour l equilibre statique ou le soulevement, V <= 10 % sinon ;
 *   G_k,sup et G_k,inf aux fractiles 95 % et 5 % de la loi normale.
 * Choix de l outil : 2002 avec le seuil haut de la fourchette (0,10) ;
 *   fractiles G_m (1 +/- 1,645 V).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeValeurPermanente {
  Gm?: number;
  V?: number;
  /** 'equilibre' ou 'resistance'. */
  verification?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeValeurPermanente>;

export const U95 = 1.645;

const R = {
  Gm: { champ: 'Gm', libelle: 'champ.Gm' },
  V: { champ: 'V', libelle: 'champ.V-variation' },
  verification: { champ: 'verification', libelle: 'champ.verification-g' },
} as const satisfies Record<string, { champ: keyof EntreeValeurPermanente; libelle: Cle }>;

const seuil2002 = (): number => 0.1;
const seuil2023 = (e: EntreeValeurPermanente): number => (e.verification === 'equilibre' ? 0.05 : 0.1);

function verifier(e: Complete): void {
  positif(e.Gm, 'Gm', '-');
  if (!(e.V >= 0 && e.V < 0.5)) throw new Error('V doit etre compris entre 0 et 0,5.');
}

function fractile(e: Complete, signe: 1 | -1, clauses: string[]): Calcul {
  verifier(e);
  const G = e.Gm * (1 + signe * U95 * e.V);
  return { statut: { etat: 'calcule' }, sollicitation: G, intermediaires: { G_m: saisie(e.Gm, '-'), V: saisie(e.V, '-'), u: recommandee(U95, '-'), G_k: calculee(G, '-') }, clauses };
}

function unique(seuil: (e: EntreeValeurPermanente) => number, clauses: string[]): DefinitionNiveau<EntreeValeurPermanente>['calculer'] {
  return (e) => {
    const c = e as Complete;
    verifier(c);
    return { statut: { etat: 'calcule' }, sollicitation: c.Gm, intermediaires: { G_m: saisie(c.Gm, '-'), 'V limite': recommandee(seuil(e), '-'), G_k: calculee(c.Gm, '-') }, clauses };
  };
}

function niveaux(seuil: (e: EntreeValeurPermanente) => number, c: { unique: string; fractiles: string }, h: string): DefinitionNiveau<EntreeValeurPermanente>[] {
  return [
    { id: 'unique', ordre: 1, position: 'corps', clause: c.unique, hypothese: `niveau.gk.${h}.unique` as Cle, donneesRequises: [R.Gm, R.V, R.verification], conditions: (e) => (e.V !== undefined && e.V > seuil(e) ? 'motif.gk-variabilite' : null), calculer: unique(seuil, [c.unique]) },
    { id: 'superieure', ordre: 2, position: 'corps', clause: c.fractiles, hypothese: `niveau.gk.${h}.sup` as Cle, donneesRequises: [R.Gm, R.V], conditions: () => null, calculer: (e) => fractile(e as Complete, 1, [c.fractiles]) },
    { id: 'inferieure', ordre: 3, position: 'corps', clause: c.fractiles, hypothese: `niveau.gk.${h}.inf` as Cle, donneesRequises: [R.Gm, R.V], conditions: () => null, calculer: (e) => fractile(e as Complete, -1, [c.fractiles]) },
  ];
}

export const valeurPermanente: Mecanisme<EntreeValeurPermanente> = {
  id: 'valeur-permanente',
  version: '0.1.0',
  titre: 'meca.gk.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'Gm', libelle: 'champ.Gm', symbole: 'G_m', unite: '-' },
    { type: 'nombre', id: 'V', libelle: 'champ.V-variation', symbole: 'V', unite: '-' },
    {
      type: 'choix',
      id: 'verification',
      libelle: 'champ.verification-g',
      options: [
        { valeur: 'resistance', libelle: 'option.verification-g.resistance' },
        { valeur: 'equilibre', libelle: 'option.verification-g.equilibre' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.gk', unite: '-' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1990-2002': niveaux(seuil2002, { unique: '4.1.2(3)', fractiles: '4.1.2(4)' }, '2002'),
    'en1990-2023': niveaux(seuil2023, { unique: '6.1.2.2(3)', fractiles: '6.1.2.2(6)' }, '2023'),
  },
};
