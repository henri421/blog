/**
 * Chantiers ouverts saisis a la main (decision de l auteur du 05/10/2026 :
 * pas de retour en brouillon, un suivi visible des chantiers a la place).
 *
 * Les autres chantiers sont derives a la construction : niveaux cartographies
 * absents d un article, reserves de la cartographie, points non coches de
 * docs/verification-texte.md, verification ILNAS des amendements. Un
 * chantier se ferme en le retirant de cette liste ou en levant sa cause.
 */

export type NatureChantier = 'amendement' | 'niveau-manquant' | 'reserve' | 'verification-texte' | 'cartographie';

export interface Chantier {
  /** Identifiant stable, sert d ancre dans la page. */
  id: string;
  nature: NatureChantier;
  titre: string;
  detail: string;
  /** Slugs des articles concernes ; vide si le chantier ne touche aucun article. */
  articles: string[];
  /** Date ISO d ouverture. */
  ouvert: string;
}

export const CHANTIERS_MANUELS: Chantier[] = [
  {
    id: 'en1990-amendement',
    nature: 'cartographie',
    titre: 'EN 1990 : texte consolidé avec l’amendement A1:2026',
    detail:
      'L’EN 1990-1:2023+A1:2026 remplace l’EN 1990:2023 et scinde la norme en deux parties. Les renvois à « EN 1990:2023 » des articles et de la cartographie sont à relire.',
    articles: [],
    ouvert: '2026-10-05',
  },
  {
    id: 'correspondances-en1990-en1991',
    nature: 'cartographie',
    titre: 'Correspondances avec la première génération de l’EN 1990 et de l’EN 1991',
    detail: 'Données de mémoire au niveau du chapitre : à confirmer sur les éditions 2002 à 2006, absentes du dossier de références.',
    articles: [],
    ouvert: '2026-10-05',
  },
];
