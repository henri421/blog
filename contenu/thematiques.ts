/**
 * Thematiques du blog (CDC v4 §3, niveau 0 de la navigation).
 *
 * La thematique est une donnee : le rendu parcourt cette liste sans cas
 * particulier. Les autres thematiques ne sont pas arretees (CDC §15.7).
 *
 * L arborescence thematique > Eurocode > article n existe que dans la
 * navigation : les adresses des articles restent plates (`./<slug>.html`),
 * decision de l auteur du 11/10/2026.
 */

import { EUROCODES, type Eurocode } from './cartographie/eurocodes';

/** Eurocode a traiter, sans cartographie encore : vignette sans lien. */
export interface EurocodeAnnonce {
  code: string;
  intitule: string;
  /** Logo sous app/public/eurocodes/logos/, facultatif. */
  logo?: string;
}

export interface Thematique {
  /** Identifiant, aussi nom de la page de la thematique. */
  id: string;
  titre: string;
  resume: string;
  /** Eurocodes cartographies, dans l ordre de la thematique. */
  eurocodes: Eurocode[];
  /** Eurocodes a traiter, apres les precedents. */
  annonces: EurocodeAnnonce[];
}

export const THEMATIQUES: Thematique[] = [
  {
    id: 'nouveaux-eurocodes',
    titre: 'Nouveaux Eurocodes',
    resume:
      'La deuxième génération des Eurocodes face à la première, clause par clause : ce que dit la clause, ce qui change, de combien sur un cas courant.',
    eurocodes: EUROCODES,
    annonces: [
      { code: 'EN 1993', intitule: 'Structures en acier', logo: 'en1993.svg' },
      { code: 'EN 1994', intitule: 'Structures mixtes acier-béton', logo: 'en1994.svg' },
      { code: 'EN 1995', intitule: 'Structures en bois', logo: 'en1995.svg' },
      { code: 'EN 1996', intitule: 'Structures en maçonnerie', logo: 'en1996.svg' },
      { code: 'EN 1997', intitule: 'Calcul géotechnique', logo: 'en1997.svg' },
      { code: 'EN 1998', intitule: 'Résistance aux séismes', logo: 'en1998.svg' },
      { code: 'EN 1999', intitule: 'Structures en aluminium', logo: 'en1999.svg' },
    ],
  },
];
