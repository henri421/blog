---
titre: Combinaisons et critères à l’ELS des bâtiments
ordre: 51
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), sans autre amendement ni corrigendum pris en compte ; 8.4.3, formules (8.29) à (8.32), A.1.6.3, A.1.8 et figure A.1.1 lus sur le texte le 2026-10-18 ; tableau A.1.7 lu sur la page rendue, dont l’alignement est ambigu pour les catégories H à T ; EN 1990:2002 (version française), 6.5.3, A1.4 et figure A1.1, lue sur le texte le 2026-10-19, sans l’A1:2005 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: Les trois combinaisons de service ne changent pas. L’annexe A de l’EN 1990 propose désormais des limites de flèche, de déplacement et de mouvement des fondations, et redéfinit les parties de la flèche.
motscles: combinaisons, els, fleche
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (6.5.3, A1.4.2, A1.4.3) : combinaisons et décomposition de la flèche confirmées, absence de limite chiffrée confirmée.
  - 2026-10-19 : section sur les vibrations des planchers et calculateur `frequence-propre` (A1.4.4 de 2002 lu sur le texte ; A.1.8.3 de 2023 à relire sur ce point).
---

## Ce qui change

**Les combinaisons restent les mêmes.** Les formules (8.29) à (8.31) reprennent (6.14b) à (6.16b) de 2002 :

$$
\sum F_d = \sum_i G_{k,i} + Q_{k,1} + \sum_{j>1} \psi_{0,j}\,Q_{k,j} + P_k \qquad \text{(8.29)}
$$

$$
\sum F_d = \sum_i G_{k,i} + \psi_{1,1}\,Q_{k,1} + \sum_{j>1} \psi_{2,j}\,Q_{k,j} + P_k \qquad \text{(8.30)}
$$

$$
\sum F_d = \sum_i G_{k,i} + \sum_{j} \psi_{2,j}\,Q_{k,j} + P_k \qquad \text{(8.31)}
$$

La combinaison caractéristique sert aux états-limites irréversibles, la fréquente aux réversibles, la quasi permanente aux effets à long terme et à l’apparence. Une combinaison sismique de service (8.32) est ajoutée ; elle renvoie à l’EN 1998.

**Les coefficients ψ** ne changent pas pour les catégories A à E, la neige, le vent et la température. Les garages (F, G) sont désormais classés selon le poids des véhicules, et de nouvelles catégories apparaissent : toitures accessibles (I, K), escaliers (S1 à S3), terrasses et balcons (T). Dans la version française NBN de l’A1:2026, les valeurs des catégories H à T ne sont pas alignées sur leurs lignes : il faut les lire avec prudence, et l’outil ne les reprend pas.

**Les parties de la flèche sont redéfinies** (figure A.1.1) :

| | 2002 | 2023 |
|---|---|---|
| $w_1$ | flèche initiale sous les charges permanentes | idem |
| $w_2$ | partie à long terme sous les charges permanentes | partie à long terme sous les charges permanentes **et la partie quasi permanente des actions variables** |
| $w_3$ | flèche due aux actions variables | flèche instantanée due aux actions variables, **hors partie quasi permanente** |
| Limites | aucune valeur ; critères à convenir avec le client ou fixés par l’annexe nationale (A1.4.2(2)) | suggérées par le tableau A.1.10 (NDP) |

**Des limites chiffrées.** Le tableau A.1.10 suggère des limites pour les bâtiments non industriels, selon l’élément (toiture, plancher, plafond, cloisons, carrelage, fenêtres) et selon trois critères : dommages aux éléments auxiliaires ($w_2 + w_3$, combinaison caractéristique), confort des usagers (combinaison fréquente) et apparence ($w_1 + w_2 - w_c$, combinaison quasi permanente). Pour une console, $l$ vaut deux fois la portée. L’annexe A.1 traite aussi les déplacements horizontaux (tableau A.1.11), les vibrations (A.1.8.3) et les mouvements des fondations, avec des classes de sensibilité de la structure (tableaux A.1.12 à A.1.16), alignés sur l’EN 1997.

**Mouvements des fondations.** Ils sont classés comme une action permanente $G_{set}$, introduite dans les combinaisons de l’ELU et de l’ELS (A.1.6.3(2)).

## Pourquoi

Les limites de flèche figuraient jusqu’ici dans chaque Eurocode de matériau (par exemple $l/250$ et $l/500$ en 7.4.1 de l’EN 1992-1-1:2004) ou dans les annexes nationales. Les rassembler dans l’EN 1990, exprimées indépendamment du matériau, donne la même règle pour une poutre en béton, en acier ou en bois. Le déplacement de la partie quasi permanente des actions variables vers $w_2$ rattache la flèche à long terme à la charge qui la produit vraiment : le fluage agit sous la charge durable, pas seulement sous le poids propre.

## L’exemple type : plancher de bureaux sous cloisons fragiles

Poutre de plancher de 7,2 m, sans contreflèche. Flèches calculées par ailleurs (béton fissuré, fluage) au sens de 2023 : $w_1$ = 8 mm, $w_2$ = 10 mm, $w_3$ = 4 mm. L’ingénieur lit dans le tableau A.1.10 les dénominateurs applicables : $n_d$ = 500 pour des cloisons en matériau fragile, $n_a$ = 250 pour l’apparence.

```exemple
{
  "nom": "plancher-cloisons",
  "mecanisme": "fleche-batiment",
  "entree": { "l": 7.2, "wc": 0, "w1": 8, "w2": 10, "w3": 4, "nd": 500, "na": 250 },
  "attendus": {
    "en1990-2023/dommage.sollicitation": "14,0",
    "en1990-2023/dommage.resistance": "14,4",
    "en1990-2023/apparence.sollicitation": "18,0",
    "en1990-2023/apparence.resistance": "28,8"
  }
}
```

Le critère de dommage donne {{plancher-cloisons:en1990-2023/dommage.sollicitation}} mm pour une limite de {{plancher-cloisons:en1990-2023/dommage.resistance}} mm : il est juste respecté. L’apparence ({{plancher-cloisons:en1990-2023/apparence.sollicitation}} mm contre {{plancher-cloisons:en1990-2023/apparence.resistance}} mm) ne gouverne pas. Avec les définitions de 2002, la même poutre aurait un $w_2$ plus petit et un $w_3$ plus grand ; la somme $w_2 + w_3$ est la même, mais une note qui ne vérifiait que $w_3$ sous-estime désormais la flèche à prendre en compte.

{{calculateur:plancher-cloisons}}

## Vibrations des planchers : la fréquence propre

**Ce que dit le texte.** En 2002, l’annexe A1 demande de maintenir la fréquence propre de la structure ou de l’élément au-dessus d’une valeur appropriée, fixée selon la fonction du bâtiment et la source des vibrations, en accord avec le client ou l’autorité compétente (A1.4.4(2)). Si la fréquence est plus basse, il faut une analyse plus fine de la réponse dynamique, qui tient compte de l’amortissement (A1.4.4(3)). Le texte ne donne aucune valeur seuil : il renvoie à l’EN 1991-1-1, à l’EN 1991-1-4 et à l’ISO 10137. La deuxième génération traite les vibrations en 8.4.4 et en A.1.8.3 ; l’outil y applique le même principe, à confirmer sur le texte.

**D’où vient la fréquence.** La norme ne dit pas comment estimer la fréquence ; la mécanique le fait à partir de la flèche instantanée $f$ sous les masses qui vibrent (poids propre, finitions, et la part quasi permanente des charges d’exploitation si le projet la retient) :

$$
n = \frac{\lambda}{2\pi}\sqrt{\frac{g}{f}}
$$

Pour une masse concentrée sur un ressort sans masse, $\lambda$ = 1 : c’est une borne prudente. Pour le premier mode d’une poutre isostatique dont la masse est uniformément répartie, $f$ étant sa flèche à mi-portée sous ce même poids, $\lambda = \pi^2\sqrt{5/384}$ = 1,126. L’outil calcule les deux et compare chacune au seuil convenu, qu’il ne fixe pas. Il constate ; au-dessous du seuil, il déclare qu’une analyse dynamique est requise, sans la faire.

Poutre de plancher de bureaux, flèche instantanée sous les masses vibrantes $f$ = 12 mm. Seuil retenu pour l’exemple : 3,5 Hz, à convenir pour le projet.

```exemple
{
  "nom": "plancher-bureaux-vibration",
  "mecanisme": "frequence-propre",
  "entree": { "f": 12, "nlim": 3.5 },
  "attendus": {
    "en1990-2002/concentree.resistance": "4,55",
    "en1990-2002/repartie.resistance": "5,12",
    "en1990-2023/concentree.resistance": "4,55",
    "en1990-2002/concentree.taux": "0,769",
    "en1990-2002/concentree.f pour n_lim": "20,3"
  }
}
```

La fréquence vaut {{plancher-bureaux-vibration:en1990-2002/concentree.resistance}} Hz avec la borne prudente, {{plancher-bureaux-vibration:en1990-2002/repartie.resistance}} Hz avec la masse répartie : le seuil de 3,5 Hz est respecté (taux {{plancher-bureaux-vibration:en1990-2002/concentree.taux}}). Il le resterait jusqu’à une flèche de {{plancher-bureaux-vibration:en1990-2002/concentree.f pour n_lim}} mm. Pour une salle de sport, où le projet retiendrait par exemple 7 Hz, la même poutre ne suffit pas :

```exemple
{
  "nom": "plancher-sport-vibration",
  "mecanisme": "frequence-propre",
  "entree": { "f": 12, "nlim": 7 },
  "attendus": {
    "en1990-2002/concentree.taux": "1,539",
    "en1990-2002/repartie.taux": "1,366",
    "en1990-2002/concentree.f pour n_lim": "5,07"
  }
}
```

Les taux valent {{plancher-sport-vibration:en1990-2002/concentree.taux}} et {{plancher-sport-vibration:en1990-2002/repartie.taux}} : une analyse dynamique est requise, ou une flèche ramenée sous {{plancher-sport-vibration:en1990-2002/concentree.f pour n_lim}} mm avec la borne prudente.

{{calculateur:plancher-bureaux-vibration}}

## L’effet sur une note de calcul existante

- Les **combinaisons** ELS d’une note de 2002 restent valables.
- Le critère de **dommage aux cloisons** porte sur $w_2 + w_3$ au sens de 2023 : la partie quasi permanente des charges d’exploitation y entre par le fluage.
- Les limites viennent de l’EN 1990 et non plus de l’Eurocode du matériau ; elles sont des paramètres nationaux.
- Une note qui justifiait les vibrations par une fréquence propre au-dessus d’un seuil convenu reste valable dans son principe ; le seuil et la méthode d’estimation de la fréquence doivent y être écrits.
- Les **mouvements de fondation** deviennent une action permanente à combiner, avec des limites de tassement différentiel et de distorsion angulaire selon la sensibilité de la structure.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les limites des tableaux A.1.10, A.1.11 et A.1.13 à A.1.15.
- Les critères de vibration des planchers (fréquence seuil ou critère de réponse), que ni 2002 ni l’outil ne chiffrent.
- Les coefficients ψ du tableau A.1.7, en particulier pour les nouvelles catégories, dont la mise en page de la version française de l’A1:2026 prête à confusion.
