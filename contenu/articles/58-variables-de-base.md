---
titre: Variables de base, valeurs représentatives et actions de l’eau
ordre: 58
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 6.1.1 à 6.1.4 lus sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; EN 1990:2002 (version française), 4.1, lue sur le texte le 2026-10-19, sans l’A1:2005 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: La deuxième génération chiffre le seuil de faible variabilité des actions permanentes (5 % pour l’équilibre, 10 % sinon), définit le principe de la source unique, donne aux actions de l’eau un statut propre et précise la signification des valeurs fréquente et quasi permanente.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (4.1) : fourchette de variabilité confirmée ; règle des structures très sensibles (4.1.2(4)) ajoutée ; le sens des valeurs fréquente et quasi permanente figurait déjà en 2002.
---

## Ce qui change

**Classification (6.1.1).** Permanentes, variables, accidentelles, sismiques : inchangé. Les actions climatiques peuvent être variables ou accidentelles selon le site ; les actions dues aux éléments auxiliaires, permanentes ou variables. Le **principe de la source unique** est défini (6.1.1(3) et (4)) ; voir l’article sur l’équilibre statique.

**Actions permanentes (6.1.2.2).** Une seule valeur caractéristique $G_k$, prise comme la moyenne, suffit si la variabilité est faible ; sinon on utilise $G_{k,sup}$ et $G_{k,inf}$, fractiles à 95 % et 5 %. La première génération donnait une fourchette de 5 à 10 % pour le coefficient de variation (4.1.2(3), NOTE), et imposait déjà deux valeurs, même à faible variabilité, pour une structure très sensible aux variations de $G$, certaines structures précontraintes par exemple (4.1.2(4)). La deuxième tranche :

| Vérification | Seuil de faible variabilité |
|---|---|
| Équilibre statique ou soulèvement | $V$ ≤ 5 % |
| Autres | $V$ ≤ 10 % |

**Actions variables (6.1.2.3).** La valeur caractéristique d’une action climatique correspond toujours à une probabilité de 2 % par an (période de retour de 50 ans). Le sens des autres valeurs est celui des notes de 4.1.3 de 2002 : la valeur fréquente est dépassée 1 % du temps pour les bâtiments (une semaine de période de retour pour le trafic des ponts) ; la valeur quasi permanente, 50 % du temps.

**Actions de l’eau (6.1.3.2).** Nouvelles. Selon le cas, l’eau est une action permanente (valeur moyenne, ou valeurs haute et basse), variable (partie permanente moyenne plus partie variable de période de retour 50 ans), ou accidentelle (probabilité de 0,1 % par an). Les limites physiques (haut d’un mur, drains) peuvent plafonner les valeurs. Les coefficients partiels de l’eau ont leurs propres lignes dans le tableau A.1.8 ($\gamma_{Gw}$ = 1,2 $k_F$, $\gamma_{Qw}$ = 1,35 $k_F$).

**Fatigue (6.1.3.3).** Les plages de contraintes se comptent par la méthode des demi-cycles (« rainflow ») ou du réservoir, détaillées dans l’annexe F nouvelle.

## Pourquoi

La fourchette de 2002 laissait l’ingénieur décider. Le seuil plus strict pour l’équilibre reflète la sensibilité de cette vérification à la variabilité du poids propre. Les actions de l’eau étaient traitées surtout dans l’EN 1997 ; les ramener dans l’EN 1990 aligne les deux normes.

## L’exemple type : chape d’une toiture en console

Chape et lestage d’une toiture, poids moyen $G_m$ = 2,0 kN/m², coefficient de variation 8 % (épaisseur mal maîtrisée). La toiture déborde en console : on vérifie l’équilibre.

```exemple
{
  "nom": "chape-console",
  "mecanisme": "valeur-permanente",
  "entree": { "Gm": 2.0, "V": 0.08, "verification": "equilibre" },
  "attendus": {
    "en1990-2002/unique.sollicitation": "2,00",
    "en1990-2023/superieure.sollicitation": "2,26",
    "en1990-2023/inferieure.sollicitation": "1,74"
  }
}
```

En 2002, avec une variabilité dans la fourchette, la valeur unique de {{chape-console:en1990-2002/unique.sollicitation}} kN/m² pouvait être retenue. En 2023, 8 % dépasse le seuil de 5 % de l’équilibre : il faut prendre $G_{k,sup}$ = {{chape-console:en1990-2023/superieure.sollicitation}} kN/m² pour la partie déstabilisatrice et $G_{k,inf}$ = {{chape-console:en1990-2023/inferieure.sollicitation}} kN/m² pour la partie stabilisatrice.

{{calculateur:chape-console}}

## L’effet sur une note de calcul existante

- Les vérifications d’équilibre de structures dont le poids propre est mal connu (chapes, remblais, lestage) demandent des valeurs haute et basse dès 5 % de variabilité.
- Les actions de l’eau se classent et se combinent selon 6.1.3.2 et le tableau A.1.8.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les probabilités de dépassement des actions de l’eau.
- Les coefficients $\psi$ (tableau A.1.7).
