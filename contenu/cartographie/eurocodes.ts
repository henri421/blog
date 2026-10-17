/**
 * Eurocodes traites ou a traiter, dans l ordre de la thematique (CDC v4 §3).
 * Le tableau d avancement a un groupe par Eurocode, une carte par partie.
 */

import type { Carte } from './types';
import { EN1990_1, EN1990_2 } from './en1990';
import { EN1991_1_1, EN1991_1_2, EN1991_1_3, EN1991_1_4, EN1991_1_5, EN1991_1_6, EN1991_1_7, EN1991_1_8, EN1991_1_9, EN1991_2, EN1991_3, EN1991_4 } from './en1991';
import { EN1992 } from './en1992';

export interface Eurocode {
  /** Identifiant, aussi nom de la page de l Eurocode (`en1992.html`). */
  id: string;
  /** Numero de la norme : `EN 1992`. */
  code: string;
  /** Intitule court, redige par l auteur. */
  intitule: string;
  /** `code — intitule`, titre du groupe au tableau d avancement. */
  titre: string;
  /**
   * Logo fourni par l auteur, fichier sous app/public/eurocodes/logos/
   * (CDC v4 §3, droit d usage declare par l auteur le 11/10/2026).
   * La vignette se replie sur le numero si le fichier manque (ET6).
   */
  logo?: string;
  /** Fichier de la forme lisible, sous docs/cartographie/. */
  documentation: string;
  cartes: Carte[];
  /**
   * Articles rattaches a l Eurocode sans traiter une clause de sa carte
   * (cadrage) : sans ce champ, ils ne seraient pas atteignables par
   * l arborescence (EF10).
   */
  generaux?: string[];
}

function eurocode(id: string, code: string, intitule: string, autres: Omit<Eurocode, 'id' | 'code' | 'intitule' | 'titre'>): Eurocode {
  return { id, code, intitule, titre: `${code} — ${intitule}`, ...autres };
}

export const EUROCODES: Eurocode[] = [
  eurocode('en1990', 'EN 1990', 'Bases de calcul', { logo: 'en1990.svg', documentation: 'en1990.md', cartes: [EN1990_1, EN1990_2] }),
  eurocode('en1991', 'EN 1991', 'Actions sur les structures', {
    logo: 'en1991.svg',
    documentation: 'en1991.md',
    cartes: [EN1991_1_1, EN1991_1_2, EN1991_1_3, EN1991_1_4, EN1991_1_5, EN1991_1_6, EN1991_1_7, EN1991_1_8, EN1991_1_9, EN1991_2, EN1991_3, EN1991_4],
  }),
  eurocode('en1992', 'EN 1992', 'Structures en béton', {
    logo: 'en1992.svg',
    documentation: 'en1992.md',
    cartes: [EN1992],
    generaux: ['cadrage'],
  }),
];
