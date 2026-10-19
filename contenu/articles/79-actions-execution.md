---
titre: Actions en cours d’exécution
ordre: 79
statut: publie
texte: EN 1991-1-6:2026 (NBN, version française), articles 4 à 7, tableaux 5.1, 6.1 à 6.3 et annexes A et B lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-6:2005 (2 à 4, tableau 3.1) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Les périodes de retour réduites des actions climatiques pendant l’exécution disparaissent. Au-delà de cinq jours, on retient la valeur caractéristique à 50 ans, modulée par un coefficient de saison si la phase dure moins d’un an.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Actions climatiques (6.1, tableau 6.1).** C’est le changement majeur :

| Durée de la phase | 2005 (tableau 3.1) | 2026 (tableau 6.1) |
|---|---|---|
| ≤ 3 jours (2005) ou ≤ 5 jours (2026) | période de retour 2 ans | données météorologiques fiables sur la durée de la phase |
| ≤ 3 mois | 5 ans | 50 ans (probabilité annuelle 0,02) avec coefficient de saison |
| ≤ 1 an | 10 ans | idem |
| > 1 an | 50 ans | 50 ans, sans coefficient de saison |

Pour les structures démontables et réutilisées, la durée à considérer est leur durée d’utilisation de projet, toutes réutilisations comprises. Une **vitesse de vent en fonctionnement** (au-delà de laquelle le travail s’arrête) et une **vitesse minimale de calcul** peuvent être spécifiées (6.3.5).

**Actions de construction (6.2, tableau 6.2).** Personnel et petit outillage $q_{ca,k}$ = 1,0 kN/m² ; stockage ($q_{cb}$, $F_{cb}$ ; pour les ponts, au moins 0,2 kN/m² et 100 kN) ; équipements ($Q_{cc}$) ; coulage du béton (tableau 6.3 : 0,75 kN/m² hors zone de travail, 10 % du poids du béton entre 0,75 et 1,5 kN/m² sur 3 × 3 m). Avant durcissement, le poids du béton est une action de construction variable.

**Domaine.** La frontière avec les normes de produits (échafaudages, cintres, étaiements) est précisée ; l’ancienne annexe B (transformation, reconstruction, démolition) est supprimée. Imperfections, stabilité latérale et actions dynamiques reçoivent un article propre (7). Les règles de combinaison pour les bâtiments en exécution sont en annexe A, les ponts en exécution en annexe B (normative).

## Pourquoi

Le texte ne motive pas explicitement ce changement. Il revient à garder la même probabilité annuelle de 2 % que pour l’ouvrage fini et à confier au coefficient de saison la prise en compte de la période de l’année où se déroule la phase.

## L’exemple type : étaiement pendant deux mois

Un étaiement reste en place 60 jours, sur un site à $v_{b,0}$ = 26 m/s.

```exemple
{
  "nom": "etaiement-60j",
  "mecanisme": "execution-climat",
  "entree": { "duree": 60, "vb0": 26 },
  "attendus": {
    "en1991-1-6-2005/qb.T": "5",
    "en1991-1-6-2005/qb.sollicitation": "308",
    "en1991-1-6-2026/qb.sollicitation": "423"
  }
}
```

En 2005, la période de retour de {{etaiement-60j:en1991-1-6-2005/qb.T}} ans donnait $q_b$ = {{etaiement-60j:en1991-1-6-2005/qb.sollicitation}} Pa. En 2026, sans coefficient de saison, $q_b$ = {{etaiement-60j:en1991-1-6-2026/qb.sollicitation}} Pa (+ 37 %). Un coefficient de saison de 0,8, si l’annexe nationale en fournit un pour la période, ramènerait la pression à 270 Pa.

{{calculateur:etaiement-60j}}

## L’effet sur une note de calcul existante

- Ouvrages provisoires et phases de chantier de moins d’un an : la pression de vent augmente sauf coefficient de saison ; idem pour la neige.
- Les phases très courtes (≤ 5 jours) demandent des prévisions météorologiques, pas une valeur normalisée.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Le tableau 6.1, les coefficients de saison, les vitesses minimales de calcul, les tableaux 6.2 et 6.3.
