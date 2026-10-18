/**
 * Cartographie de l EN 1991 (deuxieme generation), forme exploitable.
 *
 * Une carte par partie. Etablie sur les tables des matieres des textes
 * fournis par l auteur ; aucune clause n est encore lue en detail. La
 * correspondance avec la premiere generation est donnee au niveau du
 * chapitre lorsqu elle est sure, laissee vide sinon.
 */

import type { Carte } from './types';
import { ann, c, n, reporte } from './outils';

export const EN1991_1_1: Carte = {
  id: 'en1991-1-1',
  norme: 'EN 1991-1-1:2025',
  correspondant: 'EN 1991-1-1:2002',
  chapitres: [
    {
      numero: '4-6',
      titre: 'Poids volumiques, poids propre, charges d’exploitation des bâtiments',
      clauses: [
        c('4', 'Poids volumiques des matériaux de construction et stockés', ['4'], {
          annexes: [ann('A', 'informative')],
          article: 'poids-propre',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.1', 'Poids propre : situations de projet', ['5.1'], {
          article: 'poids-propre',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.2', 'Poids propre : classification', ['5.1'], {
          article: 'poids-propre',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.3', 'Poids propre : représentation', ['5.1'], {
          article: 'poids-propre',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.4', 'Poids propre : valeurs caractéristiques', ['5.2'], {
          article: 'poids-propre',
          ingeree: true,
          niveaux: [
            n('en1991-1-1-2002', 'poids-propre-pont', 'superieure', '5.2.3'),
            n('en1991-1-1-2002', 'poids-propre-pont', 'inferieure', '5.2.3'),
            n('en1991-1-1-2025', 'poids-propre-pont', 'superieure', '5.4.3'),
            n('en1991-1-1-2025', 'poids-propre-pont', 'inferieure', '5.4.3'),
          ],
          reserves: 'Écarts des éléments non structuraux des ponts ; poids volumiques (annexe A) non reproduits. Texte de 2002 non détenu.',
        }),
        c('6.1', 'Charges d’exploitation : situations de projet', ['6.1'], {
          article: 'charges-exploitation',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.2', 'Charges d’exploitation : classification', ['6.2'], {
          article: 'charges-exploitation',
          ingeree: true,
          niveaux: [
            n('en1991-1-1-2002', 'charge-dynamique', 'dynamique', '6.3.4.2'),
            n('en1991-1-1-2025', 'charge-dynamique', 'dynamique', '6.5.6.3'),
          ],
          reserves: 'Coefficient dynamique des chariots et hélicoptères ; tableau 6.1 non reproduit ; catégories et dispositions décrites. Texte de 2002 non détenu.',
        }),
        c('6.3', 'Charges d’exploitation : représentation', ['6.2'], {
          article: 'charges-exploitation',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.4', 'Charges d’exploitation : dispositions des charges', ['6.2'], {
          article: 'charges-exploitation',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.5', 'Charges d’exploitation : valeurs caractéristiques, réductions', ['6.3'], {
          article: 'reduction-charges-exploitation',
          ingeree: true,
          niveaux: [
            n('en1991-1-1-2002', 'reduction-exploitation', 'surface', '6.3.1.2(10)'),
            n('en1991-1-1-2002', 'reduction-exploitation', 'etages', '6.3.1.2(11)'),
            n('en1991-1-1-2025', 'reduction-exploitation', 'surface', '6.5.3.2(4)'),
            n('en1991-1-1-2025', 'reduction-exploitation', 'etages', '6.5.3.2(5)'),
            n('en1991-1-1-2025', 'reduction-exploitation', 'cumul', '6.5.3.2(2)'),
            n('en1991-1-1-2002', 'charge-cloisons', 'cloisons', '6.3.1.2(8)'),
            n('en1991-1-1-2025', 'charge-cloisons', 'cloisons', '6.5.3.1(3)'),
          ],
          reserves: 'Mode d’application de αn ambigu (un seul αn par tronçon retenu) ; valeurs caractéristiques des tableaux non reproduites ; texte de 2002 lu au travers du guide de Calgaro et al. (2009).',
        }),
        c('6.6', 'Charges sur les garde-corps et barrières', ['6.4'], {
          article: 'garde-corps',
          ingeree: true,
          niveaux: [
            n('en1991-1-1-2002', 'garde-corps', 'horizontal', '6.4'),
            n('en1991-1-1-2002', 'garde-corps', 'vertical', '—'),
            n('en1991-1-1-2025', 'garde-corps', 'horizontal', '6.6.2'),
            n('en1991-1-1-2025', 'garde-corps', 'vertical', '6.6.3'),
          ],
          reserves: 'Tableau 6.5 non reproduit (qk saisie) ; tribunes décrites. Texte de 2002 non détenu.',
        }),
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
        c('4', 'Procédure de calcul au feu : scénario, feu de calcul, analyses', ['2'], {
          article: 'feu-courbes-nominales',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.1', 'Flux thermique', ['3.1'], {
          article: 'feu-courbes-nominales',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.2', 'Courbes de feu nominales', ['3.2'], {
          article: 'feu-courbes-nominales',
          ingeree: true,
          niveaux: [
            n('en1991-1-2-2002', 'feu-nominal', 'flux', '3.2'),
            n('en1991-1-2-2024', 'feu-nominal', 'flux', '5.2'),
          ],
          reserves: 'Courbes nominales et flux net, Φ = 1. Texte de 2002 non détenu.',
        }),
        c('5.3', 'Modèles d’incendie physiquement fondés', ['3.3'], {
          annexes: [ann('A', 'informative'), ann('C', 'informative'), ann('D', 'informative'), ann('E', 'informative'), ann('F', 'informative')],
          article: 'charge-calorifique',
          ingeree: true,
          niveaux: [
            n('en1991-1-2-2002', 'charge-calorifique', 'qd', 'E.1'),
            n('en1991-1-2-2024', 'charge-calorifique', 'qd', 'E.3'),
          ],
          reserves: 'Charge calorifique (annexe E) ; courbes paramétrées (A), feux localisés (C) et modèles avancés (D) décrits. Texte de 2002 non détenu.',
        }),
        c('6', 'Actions mécaniques et combinaisons en situation d’incendie', ['4'], {
          article: 'combinaisons-accidentelles',
          ingeree: true,
          niveaux: [n('en1990-2002', 'combinaison-accidentelle', 'acc', '6.4.3.3'), n('en1990-2023', 'combinaison-accidentelle', 'acc', '8.3.4.3')],
          reserves: 'Combinaison (8.15) et ηfi (6.2) ; formules (6.3), (6.4) pour (8.13) non codées ; actions indirectes du feu non traitées. Textes de 2002 non détenus.',
        }),
        c('B', 'Éléments extérieurs, méthode simplifiée (informative)', ['B'], {
          article: 'feu-courbes-nominales',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('G', 'Facteur de forme (informative)', ['G'], {
          article: 'feu-courbes-nominales',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('H', 'Charges d’incendie des structures en bois (informative)', [], {
          article: 'feu-courbes-nominales',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
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
        c('4', 'Situations de projet, conditions normales et exceptionnelles', ['3'], {
          article: 'neige-sol',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2003 non détenu.',
        }),
        c('5', 'Modélisation et classification de la charge de neige', ['2'], {
          article: 'neige-sol',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2003 non détenu.',
        }),
        c('6', 'Charge de neige sur le sol', ['4'], {
          annexes: [ann('A', 'informative'), ann('B', 'informative')],
          article: 'neige-sol',
          ingeree: true,
          niveaux: [
            n('en1991-1-3-2003', 'neige-sol', 'retour', 'D'),
            n('en1991-1-3-2003', 'neige-sol', 'exceptionnelle', '4.3'),
            n('en1991-1-3-2025', 'neige-sol', 'retour', 'B.3'),
            n('en1991-1-3-2025', 'neige-sol', 'exceptionnelle', '6.2'),
          ],
          reserves: 'Loi de Gumbel ; cartes (annexe A) et changement climatique décrits. Texte de 2003 non détenu.',
        }),
        c('7.1', 'Toitures : dispositions des charges', ['5.1'], {
          article: 'neige-versants',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2003 non détenu.',
        }),
        c('7.2', 'Toitures : détermination de la charge', ['5.2'], {
          article: 'neige-toitures',
          ingeree: true,
          niveaux: [
            n('en1991-1-3-2003', 'neige-toiture', 'uniforme', '5.2(3)'),
            n('en1991-1-3-2003', 'neige-toiture', 'pluie', '—'),
            n('en1991-1-3-2025', 'neige-toiture', 'uniforme', '7.2(1)'),
            n('en1991-1-3-2025', 'neige-toiture', 'pluie', '7.2(4)'),
          ],
          reserves: 'Toitures terrasses, disposition uniforme ; versants, toitures multiples, cylindriques, dômes, panneaux inclinés et congères (8.3, calculées à la main dans l’article) non codés. Texte de 2003 non détenu.',
        }),
        c('7.3', 'Coefficient d’exposition', ['5.2'], {
          article: 'neige-toitures',
          ingeree: true,
          reserves: 'Coefficients Ce et Ct décrits dans l’article sur les toitures terrasses.',
        }),
        c('7.4', 'Coefficient thermique', ['5.2'], {
          article: 'neige-toitures',
          ingeree: true,
          reserves: 'Coefficients Ce et Ct décrits dans l’article sur les toitures terrasses.',
        }),
        c('7.5', 'Coefficients de forme', ['5.3'], {
          article: 'neige-versants',
          ingeree: true,
          niveaux: [
            n('en1991-1-3-2003', 'neige-versants', 'uniforme', '5.3.3'),
            n('en1991-1-3-2003', 'neige-versants', 'non-uniforme', '5.3.3'),
            n('en1991-1-3-2025', 'neige-versants', 'uniforme', '7.5.3'),
            n('en1991-1-3-2025', 'neige-versants', 'non-uniforme', '7.5.3'),
          ],
          reserves: 'Toiture à deux versants sans retenue ; versants multiples, cylindriques, dômes et toitures attenantes décrits. Texte de 2003 non détenu.',
        }),
        c('8', 'Effets locaux : congères, débords, barres à neige', ['6'], {
          annexes: [ann('C', 'informative')],
          article: 'neige-effets-locaux',
          ingeree: true,
          niveaux: [
            n('en1991-1-3-2003', 'neige-acrotere', 'acrotere', '6.2'),
            n('en1991-1-3-2025', 'neige-acrotere', 'acrotere', '8.3'),
          ],
          reserves: 'Acrotère (8.3) ; obstructions, débords, barres à neige et noues d’intersection décrits. Texte de 2003 non détenu.',
        }),
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
        c('4', 'Situations de projet', ['3'], {
          article: 'vent-vitesse-reference',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2005 non détenu.',
        }),
        c('5', 'Modélisation des actions du vent', ['4', '5'], {
          annexes: [ann('J', 'informative')],
          article: 'vent-vitesse-reference',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2005 non détenu.',
        }),
        c('6.2', 'Valeurs de référence de la vitesse du vent', ['4.2'], {
          annexes: [ann('K', 'informative'), ann('L', 'informative')],
          article: 'vent-vitesse-reference',
          ingeree: true,
          niveaux: [
            n('en1991-1-4-2005', 'vitesse-reference', 'qb', '4.2'),
            n('en1991-1-4-2026', 'vitesse-reference', 'qb', '6.2'),
          ],
          reserves: 'calt = 1 ; organisation, rugosité et turbulence décrites. Texte de 2005 non détenu.',
        }),
        c('6.3', 'Vitesse moyenne et pression moyenne', ['4.3'], {
          annexes: [ann('A', 'informative')],
          article: 'vent-vitesse-reference',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2005 non détenu.',
        }),
        c('6.4', 'Turbulence', ['4.4'], {
          article: 'vent-vitesse-reference',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2005 non détenu.',
        }),
        c('6.5', 'Vitesse et pression dynamique de pointe', ['4.5'], {
          article: 'pression-pointe-vent',
          ingeree: true,
          niveaux: [n('en1991-1-4-2005', 'pression-pointe', 'qp', '4.5'), n('en1991-1-4-2026', 'pression-pointe', 'qp', '6.5')],
          reserves: 'Terrain plat (co = 1), cdir = cseason = cprob = 1 ; kr par (6.7), pas par le tableau 6.1 arrondi ; z0 et zmin saisis ; coefficient structural (annexe E) décrit, non codé. Texte de 2005 non détenu.',
        }),
        c('7', 'Pressions et forces du vent', ['5', '7'], {
          annexes: [ann('B', 'normative'), ann('C', 'normative'), ann('D', 'normative')],
          article: 'vent-pressions-forces',
          ingeree: true,
          niveaux: [
            n('en1991-1-4-2005', 'pression-interieure', 'defaut', '7.2.9'),
            n('en1991-1-4-2005', 'pression-interieure', 'ouvertures', '7.2.9'),
            n('en1991-1-4-2026', 'pression-interieure', 'defaut', 'B.6(5)'),
            n('en1991-1-4-2026', 'pression-interieure', 'ouvertures', 'B.6(14)'),
          ],
          reserves: 'Pression intérieure et pression nette ; coefficients des annexes B à D non reproduits ; figure 7.13 de 2005 non codée. Texte de 2005 non détenu.',
        }),
        c('8', 'Coefficient structural', ['6'], { annexes: [ann('E', 'informative'), ann('F', 'informative'), ann('H', 'informative')] }),
        c('9', 'Phénomènes aéroélastiques', ['8'], { annexes: [ann('G', 'informative')] }),
        c('I', 'Pylônes en treillis et mâts haubanés (informative)', [], reporte('pylônes et mâts : reporté par l’auteur (05/10/2026)')),
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
        c('8', 'Actions thermiques sur les ponts', ['6'], { annexes: [ann('B', 'normative')] }),
        c('9', 'Cheminées, silos, réservoirs, tours de refroidissement', ['7'], reporte('cheminées, silos et tours : reporté par l’auteur (05/10/2026)')),
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
        c('B', 'Ponts en cours d’exécution (normative)', ['A2']),
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
        c('4', 'Stratégies et classes de conséquences', ['3'], {
          annexes: [ann('A', 'informative'), ann('B', 'informative')],
          article: 'robustesse',
          ingeree: true,
          niveaux: [
            n('en1991-1-7-2006', 'tirants-robustesse', 'internes', 'A.5.1'),
            n('en1991-1-7-2006', 'tirants-robustesse', 'peripheriques', 'A.5.2'),
            n('en1991-1-7-2025', 'tirants-robustesse', 'internes', 'A.3.1'),
            n('en1991-1-7-2025', 'tirants-robustesse', 'peripheriques', 'A.3.2'),
          ],
          reserves: 'Tirants horizontaux (A.1 à A.4) ; tirants verticaux (A.5), éléments clés et analyse de risque (annexe B) décrits. Texte de 2006 non détenu.',
        }),
        c('5', 'Chocs : véhicules, chariots, trains, bateaux, hélicoptères', ['4'], { annexes: [ann('C', 'informative')] }),
        c('6', 'Explosions intérieures', ['5'], { annexes: [ann('D', 'informative')] }),
        c('E', 'Actions dues aux débris (informative)', []),
      ],
    },
  ],
};

const REPORTEE = (id: string, norme: string, correspondant: string, titre: string, motif: string): Carte => ({
  id,
  norme,
  correspondant,
  chapitres: [{ numero: '—', titre, clauses: [c(norme.split(':')[0], titre, [], reporte(motif))] }],
});

export const EN1991_2: Carte = {
  id: 'en1991-2',
  norme: 'EN 1991-2:2023',
  correspondant: 'EN 1991-2:2003',
  chapitres: [
    {
      numero: '4-5',
      titre: 'Classification des actions et situations de projet',
      clauses: [
        c('4', 'Classification des actions de trafic', ['2']),
        c('5', 'Situations de projet, simultanéité des charges de trafic', ['3']),
      ],
    },
    {
      numero: '6',
      titre: 'Ponts routiers',
      clauses: [
        c('6.1', 'Domaine d’application', ['4.1']),
        c('6.2', 'Représentation des actions, voies conventionnelles', ['4.2']),
        c('6.3', 'Charges verticales', ['4.3']),
        c('6.4', 'Forces horizontales', ['4.4']),
        c('6.5', 'Groupes de charges de trafic', ['4.5']),
        c('6.6', 'Modèles de charge de fatigue', ['4.6']),
        c('6.7', 'Collisions et situations accidentelles', ['4.7']),
        c('6.8', 'Actions sur les garde-corps', ['4.8']),
        c('6.9', 'Charges de trafic sur les ouvrages géotechniques', ['4.9']),
      ],
    },
    {
      numero: '7',
      titre: 'Trottoirs, pistes cyclables et passerelles',
      clauses: [
        c('7', 'Charges verticales et horizontales, groupes, collisions, garde-corps, culées', ['5'], {
          article: 'passerelles-vibrations',
          ingeree: true,
          niveaux: [
            n('en1991-2-2003', 'passerelle-flux', 'flux', 'A2.4.3.2'),
            n('en1991-2-2023', 'passerelle-flux', 'flux', 'G.4'),
          ],
          reserves: 'Flux de piétons, premier mode vertical, appuis simples ; groupes, joggeurs, latéral et charges statiques des passerelles décrits. Textes de 2003 non détenus.',
        }),
      ],
    },
    {
      numero: '8',
      titre: 'Ponts ferroviaires',
      clauses: [
        c('8.1-8.3', 'Domaine, représentation, charges verticales', ['6.1', '6.2', '6.3']),
        c('8.4', 'Effets dynamiques, résonance', ['6.4']),
        c('8.5', 'Forces horizontales', ['6.5']),
        c('8.6', 'Actions aérodynamiques du passage des trains', ['6.6']),
        c('8.7', 'Déraillement et autres actions', ['6.7']),
        c('8.8', 'Autres règles d’application', ['6.8']),
        c('8.9', 'Charges de fatigue', ['6.9']),
        c('8.10', 'Charges sur les ouvrages géotechniques', ['6.3.6.4']),
      ],
    },
  ],
};

export const EN1991_1_8 = REPORTEE(
  'en1991-1-8',
  'EN 1991-1-8',
  'aucune (fondée sur l’ISO 21650:2007)',
  'Actions des vagues et des courants sur les structures côtières',
  'structures côtières : hors périmètre, comme l’EN 1990 A.6 (décision de l’auteur du 11/10/2026) ; texte non détenu',
);

export const EN1991_1_9 = REPORTEE(
  'en1991-1-9',
  'EN 1991-1-9',
  'aucune (fondée sur l’ISO 12494:2001)',
  'Givre atmosphérique',
  'givre atmosphérique : concerne surtout les mâts, pylônes et lignes, déjà reportés ; à confirmer par l’auteur (18/10/2026) ; texte non détenu',
);

export const EN1991_3 = REPORTEE('en1991-3', 'EN 1991-3:2026', 'EN 1991-3:2006', 'Actions des appareils de levage et des machines', 'appareils de levage : reporté par l’auteur (05/10/2026)');

export const EN1991_4 = REPORTEE(
  'en1991-4',
  'EN 1991-4:2026',
  'EN 1991-4:2006',
  'Actions sur les silos et les réservoirs',
  'silos et réservoirs : reporté par l’auteur (05/10/2026)',
);
