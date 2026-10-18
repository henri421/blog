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
import { ann, c, exclu, n, reporte } from './outils';

export const EN1990_1: Carte = {
  id: 'en1990-1',
  norme: 'EN 1990-1:2023+A1:2026',
  correspondant: 'EN 1990:2002 + A1:2005',
  chapitres: [
    {
      numero: '4',
      titre: 'Règles générales',
      clauses: [
        c('4.1', 'Exigences de base', ['2.1'], {
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
        c('4.2', 'Fiabilité structurale', ['2.2'], {
          article: 'bases-fiabilite',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'fiabilite', 'beta', 'C6'),
            n('en1990-2023', 'fiabilite', 'beta', 'C.3.4'),
          ],
          reserves: 'Cibles de l’annexe C ; 4.1, 4.5 à 4.8 et l’annexe B décrits dans le même article. Texte de 2002 non détenu.',
        }),
        c('4.3', 'Conséquences d’une défaillance, classes de conséquences', ['B.3'], {
          article: 'classes-consequences',
          ingeree: true,
          niveaux: [n('en1990-2002', 'facteur-consequence', 'kf', 'B3.3'), n('en1990-2023', 'facteur-consequence', 'kf', '4.3')],
          reserves: 'Bâtiments (tableau A.1.9) ; CC3a et CC3b des ponts décrites, non codées. Texte de 2002 non détenu.',
        }),
        c('4.4', 'Robustesse', ['2.1'], {
          annexes: [ann('E', 'informative')],
          article: 'robustesse',
          ingeree: true,
          reserves: 'Stratégies de robustesse décrites ; tirants calculés selon l’EN 1991-1-7, annexe A.',
        }),
        c('4.5', 'Durée d’utilisation de projet', ['2.3'], {
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
        c('4.6', 'Durabilité', ['2.4'], {
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
        c('4.7', 'Compatibilité avec le développement durable', [], {
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
        c('4.8', 'Management de la qualité', ['2.5'], {
          annexes: [ann('B', 'informative')],
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
      ],
    },
    {
      numero: '5',
      titre: 'Principes du calcul aux états-limites',
      clauses: [
        c('5.1', 'États-limites : généralités', ['3.1'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.2', 'Situations de projet', ['3.2'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.3', 'États-limites ultimes', ['3.3'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.4', 'États-limites de service', ['3.4'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('5.5', 'Modèles structuraux, géotechniques et de charges', ['3.5'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
      ],
    },
    {
      numero: '6',
      titre: 'Variables de base',
      clauses: [
        c('6.1.1', 'Classification des actions', ['4.1.1'], {
          article: 'variables-de-base',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.1.2', 'Valeurs représentatives des actions', ['4.1.2', '4.1.3'], {
          article: 'variables-de-base',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'valeur-permanente', 'unique', '4.1.2(3)'),
            n('en1990-2002', 'valeur-permanente', 'superieure', '4.1.2(4)'),
            n('en1990-2002', 'valeur-permanente', 'inferieure', '4.1.2(4)'),
            n('en1990-2023', 'valeur-permanente', 'unique', '6.1.2.2(3)'),
            n('en1990-2023', 'valeur-permanente', 'superieure', '6.1.2.2(6)'),
            n('en1990-2023', 'valeur-permanente', 'inferieure', '6.1.2.2(6)'),
          ],
          reserves: 'Actions permanentes (loi normale) ; actions de l’eau et valeurs représentatives des actions variables décrites. Texte de 2002 non détenu.',
        }),
        c('6.1.3', 'Types particuliers d’actions', ['4.1.4', '4.1.5'], {
          article: 'variables-de-base',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.1.4', 'Influences de l’environnement', ['4.1.6'], {
          article: 'variables-de-base',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.2', 'Propriétés des matériaux et des produits', ['4.2'], {
          article: 'materiaux-resistances',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('6.3', 'Propriétés géométriques', ['4.3'], {
          article: 'materiaux-resistances',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
      ],
    },
    {
      numero: '7',
      titre: 'Analyse structurale et dimensionnement assisté par l’expérimentation',
      clauses: [
        c('7.1', 'Modélisation : actions statiques, dynamiques, fatigue, feu', ['5.1'], {
          annexes: [ann('F', 'informative')],
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('7.2', 'Analyse linéaire et non linéaire', ['5.1'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('7.3', 'Dimensionnement assisté par l’expérimentation', ['5.2'], {
          annexes: [ann('D', 'informative')],
          article: 'essais',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'essais-caracteristique', 'v-connu', 'D7.2'),
            n('en1990-2002', 'essais-caracteristique', 'v-inconnu', 'D7.2'),
            n('en1990-2023', 'essais-caracteristique', 'v-connu', 'D.7.2'),
            n('en1990-2023', 'essais-caracteristique', 'v-inconnu', 'D.7.2'),
          ],
          reserves: 'Loi normale, huit essais au plus ; loi log-normale, méthode B (D.7.3) et modèles de résistance (D.8) décrits. Texte de 2002 non détenu.',
        }),
      ],
    },
    {
      numero: '8',
      titre: 'Méthode des coefficients partiels',
      clauses: [
        c('8.1', 'Généralités et limites', ['6.1'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('8.3.1', 'ELU : généralités, équilibre, résistance, fatigue', ['6.4.1'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('8.3.2', 'ELU : valeurs de calcul des effets des actions', ['6.3.2'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'actions-effets', 'actions', '6.3.2'),
            n('en1990-2002', 'actions-effets', 'effets', '6.3.2(4)'),
            n('en1990-2023', 'actions-effets', 'actions', '8.3.2.2'),
            n('en1990-2023', 'actions-effets', 'effets', '8.3.2.3'),
          ],
          reserves: 'Action unique et loi E = k F^p ; γSd séparé (8.3) non codé. Texte de 2002 non détenu.',
        }),
        c('8.3.3', 'ELU : valeurs de calcul des actions', ['6.3.1'], {
          article: 'equilibre-statique',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'equilibre-statique', 'equ', 'A1.2(A)'),
            n('en1990-2002', 'equilibre-statique', 'equ-str', 'A1.2(A)'),
            n('en1990-2023', 'equilibre-statique', 'vc2', '8.3.3.1(5)'),
          ],
          reserves: 'Poutre à console sous poids propre et charge variable ; γG,stb = 1,15 sans kF (tableau A.1.8) ; VC3, VC4 (GEO) et actions de l’eau non codés. Texte de 2002 non détenu.',
        }),
        c('8.3.4', 'ELU : combinaisons d’actions', ['6.4.3'], {
          article: 'combinaisons-elu',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'combinaison-elu', 'e610', '6.4.3.2(3)'),
            n('en1990-2002', 'combinaison-elu', 'e610ab', '6.4.3.2(3)'),
            n('en1990-2023', 'combinaison-elu', 'e812', '8.3.4.2(2)'),
            n('en1990-2023', 'combinaison-elu', 'e813', '8.3.4.2(2)'),
            n('en1990-2023', 'combinaison-elu', 'e814', '8.3.4.2(2)'),
          ],
          reserves: 'Situations durables et transitoires, bâtiments, STR (VC1) ; accidentelles dans l’article combinaisons-accidentelles, équilibre (VC2) dans equilibre-statique ; sismiques et GEO non codées. Texte de 2002 lu au travers de la synthèse NBN-CSTC.',
        }),
        c('8.3.5', 'ELU : valeurs de calcul des résistances', ['6.3.5'], {
          article: 'materiaux-resistances',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'resistance-calcul', 'mfa', '6.3.5'),
            n('en1990-2002', 'resistance-calcul', 'rfa', '6.3.5'),
            n('en1990-2023', 'resistance-calcul', 'mfa', '8.3.5.2'),
            n('en1990-2023', 'resistance-calcul', 'rfa', '8.3.5.3'),
          ],
          reserves: 'Une propriété, loi R = k X^q ; (8.21) multi-matériaux et (8.22) fatigue décrites. Texte de 2002 non détenu.',
        }),
        c('8.3.6', 'ELU : propriétés de calcul des matériaux', ['6.3.3'], {
          article: 'materiaux-resistances',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('8.3.7', 'ELU : propriétés géométriques de calcul', ['6.3.4'], {
          article: 'materiaux-resistances',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('8.4.1', 'ELS : généralités', ['6.5.1'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('8.4.2', 'ELS : valeurs de calcul des effets des actions', ['6.5.2'], {
          article: 'etats-limites-actions-effets',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
        c('8.4.3', 'ELS : combinaisons d’actions', ['6.5.3'], {
          article: 'criteres-service',
          ingeree: true,
          reserves: 'Combinaisons (8.29) à (8.31), identiques à 2002, décrites dans l’article.',
        }),
        c('8.4.4', 'ELS : critères', ['6.5.4'], {
          article: 'criteres-service',
          ingeree: true,
          niveaux: [
            n('en1990-2002', 'fleche-batiment', 'dommage', 'A1.4.3'),
            n('en1990-2002', 'fleche-batiment', 'apparence', 'A1.4.3'),
            n('en1990-2023', 'fleche-batiment', 'dommage', 'A.1.8.2.2'),
            n('en1990-2023', 'fleche-batiment', 'apparence', 'A.1.8.2.2'),
          ],
          reserves: 'Flèches verticales seules ; limites saisies (tableau A.1.10 non reproduit) ; combinaisons 8.4.3 décrites dans le même article ; confort, déplacements, vibrations et fondations décrits, non codés ; ψ des catégories H à T du tableau A.1.7 mal alignés dans la version NBN.',
        }),
        c('8.4.5', 'ELS : propriétés des matériaux et géométrie', ['6.5.4'], {
          article: 'materiaux-resistances',
          ingeree: true,
          reserves: 'Clause décrite dans l’article. Texte de 2002 non détenu.',
        }),
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
        c('A.6', 'Structures côtières', [], reporte('structures côtières : hors périmètre, mentionné dans le cadrage, décision de l’auteur (11/10/2026)')),
      ],
    },
    {
      numero: 'B-H',
      titre: 'Autres annexes',
      clauses: [
        c('B', 'Mesures de gestion technique (informative)', ['B'], {
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
        c('C', 'Fiabilité et calibration des codes (informative)', ['C'], {
          article: 'bases-fiabilite',
          ingeree: true,
          reserves: 'Clause décrite dans l’article (pas de calcul propre). Texte de 2002 non détenu.',
        }),
        c('D', 'Dimensionnement assisté par l’expérimentation (informative)', ['D'], {
          article: 'essais',
          ingeree: true,
          reserves: 'Annexe décrite dans l’article ; valeur caractéristique calculée (D.7.2).',
        }),
        c('E', 'Robustesse des bâtiments et des ponts (informative)', [], {
          article: 'robustesse',
          ingeree: true,
          reserves: 'Stratégies de robustesse décrites ; tirants calculés selon l’EN 1991-1-7, annexe A.',
        }),
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
