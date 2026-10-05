/**
 * Cartographie de l EN 1991 (deuxieme generation), forme exploitable.
 *
 * Une carte par partie. Etablie sur les tables des matieres des textes
 * fournis par l auteur ; aucune clause n est encore lue en detail. La
 * correspondance avec la premiere generation est donnee au niveau du
 * chapitre lorsqu elle est sure, laissee vide sinon.
 */

import type { Carte } from './types';
import { ann, c, exclu } from './outils';

export const EN1991_1_1: Carte = {
  id: 'en1991-1-1',
  norme: 'EN 1991-1-1:2025',
  correspondant: 'EN 1991-1-1:2002',
  chapitres: [
    {
      numero: '4-6',
      titre: 'Poids volumiques, poids propre, charges d’exploitation des bâtiments',
      clauses: [
        c('4', 'Poids volumiques des matériaux de construction et stockés', ['4'], { annexes: [ann('A', 'informative')] }),
        c('5.1', 'Poids propre : situations de projet', ['5.1']),
        c('5.2', 'Poids propre : classification', ['5.1']),
        c('5.3', 'Poids propre : représentation', ['5.1']),
        c('5.4', 'Poids propre : valeurs caractéristiques', ['5.2']),
        c('6.1', 'Charges d’exploitation : situations de projet', ['6.1']),
        c('6.2', 'Charges d’exploitation : classification', ['6.2']),
        c('6.3', 'Charges d’exploitation : représentation', ['6.2']),
        c('6.4', 'Charges d’exploitation : dispositions des charges', ['6.2']),
        c('6.5', 'Charges d’exploitation : valeurs caractéristiques, réductions', ['6.3']),
        c('6.6', 'Charges sur les garde-corps et barrières', ['6.4']),
      ],
    },
  ],
};

export const EN1991_1_2: Carte = {
  id: 'en1991-1-2',
  norme: 'EN 1991-1-2:2024',
  correspondant: 'EN 1991-1-2:2002',
  chapitres: [
    {
      numero: '4-6',
      titre: 'Actions sur les structures exposées au feu',
      clauses: [
        c('4', 'Procédure de calcul au feu : scénario, feu de calcul, analyses', ['2']),
        c('5.1', 'Flux thermique', ['3.1']),
        c('5.2', 'Courbes de feu nominales', ['3.2']),
        c('5.3', 'Modèles d’incendie physiquement fondés', ['3.3'], {
          annexes: [ann('A', 'informative'), ann('C', 'informative'), ann('D', 'informative'), ann('E', 'informative'), ann('F', 'informative')],
        }),
        c('6', 'Actions mécaniques et combinaisons en situation d’incendie', ['4']),
        c('B', 'Éléments extérieurs, méthode simplifiée (informative)', ['B']),
        c('G', 'Facteur de forme (informative)', ['G']),
        c('H', 'Charges d’incendie des structures en bois (informative)', []),
      ],
    },
  ],
};

export const EN1991_1_3: Carte = {
  id: 'en1991-1-3',
  norme: 'EN 1991-1-3:2025',
  correspondant: 'EN 1991-1-3:2003 + A1:2015',
  chapitres: [
    {
      numero: '4-8',
      titre: 'Charges de neige',
      clauses: [
        c('4', 'Situations de projet, conditions normales et exceptionnelles', ['3']),
        c('5', 'Modélisation et classification de la charge de neige', ['2']),
        c('6', 'Charge de neige sur le sol', ['4'], { annexes: [ann('A', 'informative'), ann('B', 'informative')] }),
        c('7.1', 'Toitures : dispositions des charges', ['5.1']),
        c('7.2', 'Toitures : détermination de la charge', ['5.2']),
        c('7.3', 'Coefficient d’exposition', ['5.2']),
        c('7.4', 'Coefficient thermique', ['5.2']),
        c('7.5', 'Coefficients de forme', ['5.3']),
        c('8', 'Effets locaux : congères, débords, barres à neige', ['6'], { annexes: [ann('C', 'informative')] }),
      ],
    },
  ],
};

export const EN1991_1_4: Carte = {
  id: 'en1991-1-4',
  norme: 'EN 1991-1-4:2026',
  correspondant: 'EN 1991-1-4:2005 + A1:2010',
  chapitres: [
    {
      numero: '4-9',
      titre: 'Actions du vent',
      clauses: [
        c('4', 'Situations de projet', ['3']),
        c('5', 'Modélisation des actions du vent', ['4', '5'], { annexes: [ann('J', 'informative')] }),
        c('6.2', 'Valeurs de référence de la vitesse du vent', ['4.2'], { annexes: [ann('K', 'informative'), ann('L', 'informative')] }),
        c('6.3', 'Vitesse moyenne et pression moyenne', ['4.3'], { annexes: [ann('A', 'informative')] }),
        c('6.4', 'Turbulence', ['4.4']),
        c('6.5', 'Vitesse et pression dynamique de pointe', ['4.5']),
        c('7', 'Pressions et forces du vent', ['5', '7'], { annexes: [ann('B', 'normative'), ann('C', 'normative'), ann('D', 'normative')] }),
        c('8', 'Coefficient structural', ['6'], { annexes: [ann('E', 'informative'), ann('F', 'informative'), ann('H', 'informative')] }),
        c('9', 'Phénomènes aéroélastiques', ['8'], { annexes: [ann('G', 'informative')] }),
        c('I', 'Pylônes en treillis et mâts haubanés (informative)', []),
      ],
    },
  ],
};

export const EN1991_1_5: Carte = {
  id: 'en1991-1-5',
  norme: 'EN 1991-1-5:2025',
  correspondant: 'EN 1991-1-5:2003',
  chapitres: [
    {
      numero: '4-9',
      titre: 'Actions thermiques',
      clauses: [
        c('4-6', 'Situations de projet, classification et représentation', ['2', '4']),
        c('7', 'Actions thermiques dans les bâtiments', ['5'], { annexes: [ann('A', 'normative'), ann('C', 'informative')] }),
        c('8', 'Actions thermiques sur les ponts', ['6'], { ...exclu('ponts hors version 1 (CDC §1)'), annexes: [ann('B', 'normative')] }),
        c('9', 'Cheminées, silos, réservoirs, tours de refroidissement', ['7']),
      ],
    },
  ],
};

export const EN1991_1_6: Carte = {
  id: 'en1991-1-6',
  norme: 'EN 1991-1-6:2026',
  correspondant: 'EN 1991-1-6:2005',
  chapitres: [
    {
      numero: '4-7',
      titre: 'Actions en cours d’exécution',
      clauses: [
        c('4', 'Situations de projet', ['3']),
        c('5', 'Classification des actions', ['2']),
        c('6', 'Valeurs caractéristiques des actions d’exécution', ['4'], { annexes: [ann('A', 'normative')] }),
        c('7', 'Imperfections, stabilité latérale, actions dynamiques', []),
        c('B', 'Ponts en cours d’exécution (normative)', ['A2'], exclu('ponts hors version 1 (CDC §1)')),
      ],
    },
  ],
};

export const EN1991_1_7: Carte = {
  id: 'en1991-1-7',
  norme: 'EN 1991-1-7:2025',
  correspondant: 'EN 1991-1-7:2006 + A1:2014',
  chapitres: [
    {
      numero: '4-6',
      titre: 'Actions accidentelles',
      clauses: [
        c('4', 'Stratégies et classes de conséquences', ['3'], { annexes: [ann('A', 'informative'), ann('B', 'informative')] }),
        c('5', 'Chocs : véhicules, chariots, trains, bateaux, hélicoptères', ['4'], { annexes: [ann('C', 'informative')] }),
        c('6', 'Explosions intérieures', ['5'], { annexes: [ann('D', 'informative')] }),
        c('E', 'Actions dues aux débris (informative)', []),
      ],
    },
  ],
};

const HORS = (id: string, norme: string, correspondant: string, titre: string, motif: string): Carte => ({
  id,
  norme,
  correspondant,
  chapitres: [{ numero: '—', titre, clauses: [c(norme.split(':')[0], titre, [], exclu(motif))] }],
});

export const EN1991_2 = HORS('en1991-2', 'EN 1991-2:2023', 'EN 1991-2:2003', 'Actions du trafic sur les ponts', 'ponts hors version 1 (CDC §1)');

export const EN1991_3: Carte = {
  id: 'en1991-3',
  norme: 'EN 1991-3:2026',
  correspondant: 'EN 1991-3:2006',
  chapitres: [
    {
      numero: '4-7',
      titre: 'Appareils de levage et machines',
      clauses: [
        c('4-5', 'Bases de calcul et classification', ['2']),
        c('6', 'Ponts roulants sur chemins de roulement', ['2'], { annexes: [ann('A', 'informative'), ann('B', 'informative'), ann('C', 'informative')] }),
        c('7', 'Machines fixes', ['3']),
      ],
    },
  ],
};

export const EN1991_4 = HORS(
  'en1991-4',
  'EN 1991-4:2026',
  'EN 1991-4:2006',
  'Actions sur les silos et les réservoirs',
  'réservoirs : retenue de liquides hors version 1 (CDC §1) ; silos à trancher',
);
