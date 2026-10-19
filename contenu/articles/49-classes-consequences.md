---
titre: Classes de conséquences et facteur kF
ordre: 49
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), sans autre amendement ni corrigendum pris en compte ; clauses 4.3, 4.5, A.1.3, A.1.4, A.2.3 et tableaux A.1.8, A.1.9, A.2.11 lus sur le texte le 2026-10-18 ; EN 1990:2002 (version française), 2.3, tableau 2.1 et annexe B (B.3, tableaux B.1 à B.3), lue sur le texte le 2026-10-19, sans l’A1:2005 ; la ligne « Ponts » du premier tableau relève de l’A1:2005, non détenu, et reste citée de mémoire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: Les trois classes de conséquences de 2002 deviennent cinq, de CC0 à CC4. Elles passent de l’annexe informative au corps du texte, et leur facteur kF s’applique désormais d’office aux coefficients des actions défavorables.
motscles: fiabilite, actions, elu
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (2.3, annexe B) : valeurs confirmées ; note de B.3.3 sur la classe RC3 et note du tableau 2.1 ajoutées.
---

## Ce qui change

La classe de conséquences mesure la gravité d’une défaillance : pertes humaines d’une part, conséquences économiques, sociales ou environnementales d’autre part. On retient la plus grave des deux.

| | 2002 | 2023 |
|---|---|---|
| Où | annexe B, informative | 4.3 (corps du texte), exemples en annexe A |
| Classes | CC1 à CC3 | CC0 à CC4 |
| Facteur sur les actions | $K_{FI}$, facultatif | $k_F$ dans le tableau des coefficients partiels (A.1.8, A.1.9) |
| Ponts | pas de distinction | CC3 divisée en CC3a ($k_F$ = 1,0) et CC3b ($k_F$ = 1,1) (tableau A.2.11) |

**Deux classes nouvelles.** CC0, conséquences minimales, vise les éléments auxiliaires : pour eux, il est permis d’utiliser les Eurocodes ou d’autres dispositions (4.3(3)). CC4, conséquences maximales, vise par exemple les centrales nucléaires et les barrages : les Eurocodes ne suffisent pas, et il faut des dispositions complémentaires (4.3, NOTE 3). Les Eurocodes couvrent donc les classes CC1 à CC3, comme en 2002.

**Des exemples, pas des définitions.** Le tableau A.1.1 classe les bâtiments par l’exemple : en CC3, les bâtiments où une défaillance toucherait un très grand nombre de personnes (tribunes, salles de concert, immeubles de grande hauteur) ; en CC1, ceux où elle n’en toucherait que très peu (bâtiments agricoles, de stockage) ; CC2 pour tout le reste. Une partie de bâtiment peut relever d’une autre classe que l’ensemble. Le tableau est un paramètre national : l’annexe nationale peut le remplacer.

**Le facteur $k_F$.** Il multiplie les coefficients partiels des actions défavorables : $\gamma_G = 1.35\,k_F$, $\gamma_Q = 1.5\,k_F$ (cas VC1 et VC2). Il ne touche ni les actions favorables ($\gamma_{G,fav}$ = 1,0), ni la partie stabilisatrice d’une action de source unique ($\gamma_{G,stb}$). En 2002, le facteur $K_{FI}$ de l’annexe B (B.3.3, tableau B.3) avait les mêmes valeurs et ne visait déjà que les actions défavorables, mais il restait facultatif, l’annexe B elle-même était informative, et sa note préférait pour la classe RC3 d’autres mesures (supervision du projet, contrôle de l’exécution) à la majoration des coefficients.

**La durée d’utilisation de projet** passe aussi en annexe A (tableau A.1.2), avec moins de catégories qu’en 2002 : 100 ans pour les bâtiments monumentaux, 50 ans pour les autres, 25 ans pour les structures agricoles et les parties remplaçables, au plus 10 ans pour les structures provisoires. Une structure démontable destinée au réemploi n’est pas provisoire (4.5(3)), comme le disait déjà la note du tableau 2.1 de 2002.

**Éléments autres que structuraux.** La deuxième génération définit les éléments de finition et d’équipement fixés à la structure (couverture, cloisons, faux plafonds, gaines, équipements) comme les éléments de plus faibles conséquences de défaillance (3.1.1.9).

## Pourquoi

Le niveau de fiabilité visé par les Eurocodes correspond à un indice $\beta$ = 3,8 sur 50 ans pour une structure courante. Les coefficients 1,35 et 1,5 sont calibrés pour cette cible. Une défaillance plus grave justifie une cible plus haute, une défaillance bénigne une cible plus basse. Le facteur $k_F$ fait varier les coefficients d’environ 10 % de part et d’autre. Dans l’annexe B de 2002, cet écart correspondait à des cibles $\beta$ de 3,3, 3,8 et 4,3 pour les classes 1, 2 et 3.

La classe de conséquences sert aussi ailleurs : mesures de gestion de la qualité (annexe B), cibles de fiabilité (annexe C) et robustesse (annexe E). En la sortant de l’annexe informative, la deuxième génération oblige à la déclarer dans chaque note de calcul.

## L’exemple type : hangar agricole et salle de concert

Un hangar de stockage agricole relève de CC1, une salle de concert de CC3.

```exemple
{
  "nom": "hangar-cc1",
  "mecanisme": "facteur-consequence",
  "entree": { "cc": "CC1" },
  "attendus": {
    "en1990-2002/kf.resistance": "0,9",
    "en1990-2023/kf.resistance": "0,9",
    "en1990-2023/kf.γ_G": "1,215",
    "en1990-2023/kf.γ_Q": "1,35"
  }
}
```

```exemple
{
  "nom": "salle-cc3",
  "mecanisme": "facteur-consequence",
  "entree": { "cc": "CC3" },
  "attendus": {
    "en1990-2023/kf.resistance": "1,1",
    "en1990-2023/kf.γ_G": "1,485",
    "en1990-2023/kf.γ_Q": "1,65"
  }
}
```

Pour le hangar, les coefficients deviennent $\gamma_G$ = {{hangar-cc1:en1990-2023/kf.γ_G}} et $\gamma_Q$ = {{hangar-cc1:en1990-2023/kf.γ_Q}}. Pour la salle de concert, $\gamma_G$ = {{salle-cc3:en1990-2023/kf.γ_G}} et $\gamma_Q$ = {{salle-cc3:en1990-2023/kf.γ_Q}}. En 2002, les mêmes valeurs s’obtenaient avec $K_{FI}$, mais seulement si l’annexe nationale ou le projet le retenaient. L’article 47 montre l’effet sur une combinaison complète.

{{calculateur:hangar-cc1}}

## L’effet sur une note de calcul existante

- La note doit **déclarer la classe de conséquences** du bâtiment ou de chaque partie.
- Un bâtiment **CC3** calculé en 2002 sans $K_{FI}$ sous-estime de 10 % les effets défavorables par rapport à la deuxième génération.
- Un bâtiment **CC1** peut gagner 10 % sur les actions défavorables.
- Pour les ponts, les ouvrages au-dessus des grands axes ou des lignes ferroviaires principales sont en CC3a, avec $k_F$ = 1,0. Le facteur 1,1 n’intervient qu’en CC3b, sur décision de l’autorité ou des parties au projet.
- Les fondations d’un pont sont au moins dans la classe du pont (A.2.3(2)).

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les qualifications des classes (tableau 4.1) et les exemples (tableau A.1.1).
- Les valeurs de $k_F$ (tableau A.1.9), y compris une éventuelle valeur égale à 1,0 pour CC1.
- Les durées d’utilisation de projet (tableau A.1.2).
