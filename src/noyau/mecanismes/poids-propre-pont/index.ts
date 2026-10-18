/**
 * Valeurs caracteristiques superieure et inferieure du poids propre des
 * elements non structuraux des ponts (revetements, ballast, reseaux).
 *
 * Unites : celles du poids nominal saisi (kN/m2, kN/m).
 *
 * Premiere generation (EN 1991-1-1:2002, 5.2.3(2) a (4), texte non detenu, a
 *   relire) et deuxieme generation (EN 1991-1-1:2025, 5.4.3(2) a (4)) : memes
 *   ecarts recommandes : ballast +/- 30 % ; etancheite et revetements +/- 20 %
 *   si la valeur nominale inclut un rechargement ulterieur, + 40 % / - 20 %
 *   sinon ; cables, tuyaux et gaines +/- 20 %.
 * Choix de l outil : ecarts appliques au poids nominal (epaisseur x poids
 *   volumique) saisi.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreePoidsPropePont {
  gnom?: number;
  /** 'ballast', 'revetement-avec', 'revetement-sans' ou 'reseaux'. */
  element?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  gnom: { champ: 'gnom', libelle: 'champ.g-nominal' },
  element: { champ: 'element', libelle: 'champ.element-pont' },
} as const satisfies Record<string, { champ: keyof EntreePoidsPropePont; libelle: Cle }>;

export function ecarts(element: string): { sup: number; inf: number } {
  switch (element) {
    case 'ballast':
      return { sup: 0.3, inf: 0.3 };
    case 'revetement-sans':
      return { sup: 0.4, inf: 0.2 };
    default:
      return { sup: 0.2, inf: 0.2 };
  }
}

function calculer(e: EntreePoidsPropePont, sens: 1 | -1, clauses: string[]): Calcul {
  positif(e.gnom as number, 'gnom', '-');
  const ec = ecarts(e.element as string);
  const d = sens > 0 ? ec.sup : ec.inf;
  const G = (e.gnom as number) * (1 + sens * d);
  return { statut: { etat: 'calcule' }, sollicitation: G, intermediaires: { g_nom: saisie(e.gnom as number, '-'), écart: recommandee(sens * d, '-'), G_k: calculee(G, '-') }, clauses };
}

function niveaux(clause: string, h: string): DefinitionNiveau<EntreePoidsPropePont>[] {
  return [
    { id: 'superieure', ordre: 1, position: 'corps', clause, hypothese: `niveau.gpont.${h}.sup` as Cle, donneesRequises: [R.gnom, R.element], conditions: () => null, calculer: (e) => calculer(e, 1, [clause]) },
    { id: 'inferieure', ordre: 2, position: 'corps', clause, hypothese: `niveau.gpont.${h}.inf` as Cle, donneesRequises: [R.gnom, R.element], conditions: () => null, calculer: (e) => calculer(e, -1, [clause]) },
  ];
}

export const poidsPropePont: Mecanisme<EntreePoidsPropePont> = {
  id: 'poids-propre-pont',
  version: '0.1.0',
  titre: 'meca.gpont.titre',
  generations: ['en1991-1-1-2002', 'en1991-1-1-2025'],
  champs: [
    { type: 'nombre', id: 'gnom', libelle: 'champ.g-nominal', symbole: 'g_nom', unite: 'kN/m²' },
    {
      type: 'choix',
      id: 'element',
      libelle: 'champ.element-pont',
      options: [
        { valeur: 'revetement-avec', libelle: 'option.element-pont.revetement-avec' },
        { valeur: 'revetement-sans', libelle: 'option.element-pont.revetement-sans' },
        { valeur: 'ballast', libelle: 'option.element-pont.ballast' },
        { valeur: 'reseaux', libelle: 'option.element-pont.reseaux' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.gk', unite: 'kN/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-1-2002': niveaux('5.2.3', '2002'), 'en1991-1-1-2025': niveaux('5.4.3', '2025') },
};
