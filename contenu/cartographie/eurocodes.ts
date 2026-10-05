/**
 * Eurocodes traites ou a traiter, dans l ordre de la thematique (CDC v4 §3).
 * Le tableau d avancement a un groupe par Eurocode, une carte par partie.
 */

import type { Carte } from './types';
import { EN1990_1, EN1990_2 } from './en1990';
import { EN1991_1_1, EN1991_1_2, EN1991_1_3, EN1991_1_4, EN1991_1_5, EN1991_1_6, EN1991_1_7, EN1991_2, EN1991_3, EN1991_4 } from './en1991';
import { EN1992 } from './en1992';

export interface Eurocode {
  id: string;
  /** Intitule court, redige par l auteur. */
  titre: string;
  /** Fichier de la forme lisible, sous docs/cartographie/. */
  documentation: string;
  cartes: Carte[];
}

export const EUROCODES: Eurocode[] = [
  { id: 'en1990', titre: 'EN 1990 — Bases de calcul', documentation: 'en1990.md', cartes: [EN1990_1, EN1990_2] },
  {
    id: 'en1991',
    titre: 'EN 1991 — Actions sur les structures',
    documentation: 'en1991.md',
    cartes: [EN1991_1_1, EN1991_1_2, EN1991_1_3, EN1991_1_4, EN1991_1_5, EN1991_1_6, EN1991_1_7, EN1991_2, EN1991_3, EN1991_4],
  },
  { id: 'en1992', titre: 'EN 1992 — Structures en béton', documentation: 'en1992.md', cartes: [EN1992] },
];
