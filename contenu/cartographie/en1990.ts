/**
 * Cartographie de l EN 1990 (deuxieme generation), forme exploitable.
 *
 * Texte retenu : EN 1990-1:2023+A1:2026, qui remplace l EN 1990:2023 et
 * devient la partie 1 (structures neuves). La partie 2 (structures
 * existantes, EN 1990-2:2026) est hors du perimetre de la version 1.
 * Etablie sur la table des matieres ; aucune clause n est encore lue en
 * detail (`ingeree` a faux). Correspondance avec l EN 1990:2002 + A1:2005
 * donnee au niveau du chapitre, a confirmer sur le texte.
 */

import type { Carte } from './types';
import { ann, c, exclu, reporte } from './outils';

export const EN1990_1: Carte = {
  id: 'en1990-1',
  norme: 'EN 1990-1:2023+A1:2026',
  correspondant: 'EN 1990:2002 + A1:2005',
  chapitres: [
    {
      numero: '4',
      titre: 'Règles générales',
      clauses: [
        c('4.1', 'Exigences de base', ['2.1']),
        c('4.2', 'Fiabilité structurale', ['2.2']),
        c('4.3', 'Conséquences d’une défaillance, classes de conséquences', ['B.3']),
        c('4.4', 'Robustesse', ['2.1'], { annexes: [ann('E', 'informative')] }),
        c('4.5', 'Durée d’utilisation de projet', ['2.3']),
        c('4.6', 'Durabilité', ['2.4']),
        c('4.7', 'Compatibilité avec le développement durable', []),
        c('4.8', 'Management de la qualité', ['2.5'], { annexes: [ann('B', 'informative')] }),
      ],
    },
    {
      numero: '5',
      titre: 'Principes du calcul aux états-limites',
      clauses: [
        c('5.1', 'États-limites : généralités', ['3.1']),
        c('5.2', 'Situations de projet', ['3.2']),
        c('5.3', 'États-limites ultimes', ['3.3']),
        c('5.4', 'États-limites de service', ['3.4']),
        c('5.5', 'Modèles structuraux, géotechniques et de charges', ['3.5']),
      ],
    },
    {
      numero: '6',
      titre: 'Variables de base',
      clauses: [
        c('6.1.1', 'Classification des actions', ['4.1.1']),
        c('6.1.2', 'Valeurs représentatives des actions', ['4.1.2', '4.1.3']),
        c('6.1.3', 'Types particuliers d’actions', ['4.1.4', '4.1.5']),
        c('6.1.4', 'Influences de l’environnement', ['4.1.6']),
        c('6.2', 'Propriétés des matériaux et des produits', ['4.2']),
        c('6.3', 'Propriétés géométriques', ['4.3']),
      ],
    },
    {
      numero: '7',
      titre: 'Analyse structurale et dimensionnement assisté par l’expérimentation',
      clauses: [
        c('7.1', 'Modélisation : actions statiques, dynamiques, fatigue, feu', ['5.1'], { annexes: [ann('F', 'informative')] }),
        c('7.2', 'Analyse linéaire et non linéaire', ['5.1']),
        c('7.3', 'Dimensionnement assisté par l’expérimentation', ['5.2'], { annexes: [ann('D', 'informative')] }),
      ],
    },
    {
      numero: '8',
      titre: 'Méthode des coefficients partiels',
      clauses: [
        c('8.1', 'Généralités et limites', ['6.1']),
        c('8.3.1', 'ELU : généralités, équilibre, résistance, fatigue', ['6.4.1']),
        c('8.3.2', 'ELU : valeurs de calcul des effets des actions', ['6.3.2']),
        c('8.3.3', 'ELU : valeurs de calcul des actions', ['6.3.1']),
        c('8.3.4', 'ELU : combinaisons d’actions', ['6.4.3']),
        c('8.3.5', 'ELU : valeurs de calcul des résistances', ['6.3.5']),
        c('8.3.6', 'ELU : propriétés de calcul des matériaux', ['6.3.3']),
        c('8.3.7', 'ELU : propriétés géométriques de calcul', ['6.3.4']),
        c('8.4.1', 'ELS : généralités', ['6.5.1']),
        c('8.4.2', 'ELS : valeurs de calcul des effets des actions', ['6.5.2']),
        c('8.4.3', 'ELS : combinaisons d’actions', ['6.5.3']),
        c('8.4.4', 'ELS : critères', ['6.5.4']),
        c('8.4.5', 'ELS : propriétés des matériaux et géométrie', ['6.5.4']),
      ],
    },
    {
      numero: 'A',
      titre: 'Annexe A (normative) : règles d’application',
      clauses: [
        c('A.1', 'Bâtiments : coefficients ψ, coefficients partiels, combinaisons', ['A1']),
        c('A.2', 'Ponts : coefficients ψ, coefficients partiels, combinaisons', ['A2']),
        c('A.3', 'Tours, mâts et cheminées', [], reporte('tours, mâts et cheminées : reporté par l’auteur (05/10/2026)')),
        c('A.4', 'Silos et réservoirs', [], reporte('silos et réservoirs : reporté par l’auteur (05/10/2026)')),
        c('A.5', 'Structures supportant des appareils de levage ou des machines', [], reporte('appareils de levage : reporté par l’auteur (05/10/2026)')),
        c('A.6', 'Structures côtières', [], reporte('structures côtières : hors construction classique, à confirmer par l’auteur')),
      ],
    },
    {
      numero: 'B-H',
      titre: 'Autres annexes',
      clauses: [
        c('B', 'Mesures de gestion technique (informative)', ['B']),
        c('C', 'Fiabilité et calibration des codes (informative)', ['C']),
        c('D', 'Dimensionnement assisté par l’expérimentation (informative)', ['D']),
        c('E', 'Robustesse des bâtiments et des ponts (informative)', []),
        c('F', 'Comptage des cycles de fatigue (informative)', []),
        c('G', 'Appareils d’appui (normative)', []),
        c('H', 'Vibrations des passerelles (informative)', []),
      ],
    },
  ],
};

export const EN1990_2: Carte = {
  id: 'en1990-2',
  norme: 'EN 1990-2:2026',
  correspondant: 'CEN/TS 17440:2020',
  chapitres: [
    {
      numero: '—',
      titre: 'Évaluation des structures existantes',
      clauses: [c('EN 1990-2', 'Bases de l’évaluation et de la réhabilitation des structures existantes', [], exclu('évaluation des structures existantes hors version 1 (CDC §1)'))],
    },
  ],
};
