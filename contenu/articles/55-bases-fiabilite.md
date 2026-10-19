---
titre: Exigences de base, fiabilité et gestion de la qualité
ordre: 55
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), sans autre amendement ni corrigendum pris en compte ; 4.1, 4.2, 4.5 à 4.8, annexes B et C (tableaux C.2 et C.3) lus sur le texte le 2026-10-18 ; EN 1990:2002 (version française), 2.1 à 2.5, annexes B et C (tableaux B.2, C.2 et (C.3)), lue sur le texte le 2026-10-19, sans l’A1:2005 ; AN-LU:2020 de l’EN 1990:2002+A1:2005 (A1.1(1), A2.1.1(1), annexes B et C) lue sur le texte le 2026-10-19 ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-19
resume: Les exigences de base et les cibles de fiabilité ne changent pas. La deuxième génération ajoute le développement durable aux exigences, sépare la gestion de la qualité en quatre échelles (DQL, DCL, EXC, IL) et réécrit l’annexe C pour aider les pays à fixer leurs cibles.
motscles: fiabilite
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 : cibles β du tableau B.2 confirmées ; ses valeurs à 50 ans sont des arrondis, l’outil garde la conversion exacte (C.3) (décision de l’auteur du 2026-10-19).
  - 2026-10-19 : section sur l’annexe nationale luxembourgeoise (durée d’utilisation, annexes B et C).
---

## Ce qui change

**Exigences de base (4.1).** Une structure doit résister aux actions raisonnablement prévisibles, rester apte au service et durable pendant sa durée d’utilisation de projet, avec une fiabilité appropriée et de façon économique ; elle doit résister au feu le temps requis. C’est le fond de 2.1 de 2002. La robustesse passe dans une clause à part (4.4, voir l’article sur la robustesse).

**Fiabilité (4.2).** La fiabilité visée est atteinte par l’application des Eurocodes. Le choix du niveau tient compte des conséquences d’une défaillance, du mode de ruine (avec ou sans signe précurseur), de l’aversion du public et du coût des mesures. Les erreurs humaines grossières ne sont pas couvertes par les coefficients ; l’annexe B indique comment les limiter.

| | 2002 | 2023 |
|---|---|---|
| Cibles $\beta$ par classe | annexe B (RC1 à RC3) | annexe C, tableau C.3 (CC1 à CC3), paramètre national |
| Valeurs sur 1 an / 50 ans | 4,2/3,3 ; 4,7/3,8 ; 5,2/4,3 | identiques |
| Gestion de la qualité | annexe B : niveaux de contrôle DSL et IL liés aux classes | annexe B : qualification des concepteurs (DQL), contrôle du projet (DCL), classes d’exécution (EXC), contrôle pendant l’exécution (IL) |
| Durée d’utilisation de projet | 2.3, tableau 2.1, cinq catégories | 4.5, tableau A.1.2, quatre catégories |
| Développement durable | absent | 4.7 : limiter l’impact sur les ressources non renouvelables, la société et l’économie, sur tout le cycle de vie |

**Durabilité (4.6).** Même principe : la détérioration pendant la durée d’utilisation ne doit pas altérer les performances prévues, compte tenu de l’environnement et de la maintenance. La deuxième génération autorise une durée réduite pour la fatigue et la durabilité des parties remplaçables, si leur remplacement est prévu au projet (4.5(4)).

## Pourquoi

Le rapport du JRC sur les bases de fiabilité (2024) confirme qu’en moyenne, les coefficients 1,35 et 1,5 atteignent la cible $\beta$ = 3,8 sur 50 ans pour une structure courante. Une optimisation pure aurait conduit à relever fortement les coefficients des actions variables (jusqu’à 2,35 pour la neige) et à baisser celui des actions permanentes ; les rédacteurs ne l’ont pas retenue, faute de sinistralité qui la justifie. Le choix de la cible relève des autorités nationales : l’annexe C leur donne la méthode.

## L’exemple type : de 1 an à la durée de référence

Les cibles sont données sur 1 an et sur 50 ans. Si les années sont indépendantes, $\Phi(\beta_T) = \Phi(\beta_1)^T$. Pour un bâtiment courant (CC2), sur 50 ans :

```exemple
{
  "nom": "fiabilite-cc2",
  "mecanisme": "fiabilite",
  "entree": { "cc": "CC2", "T": 50 },
  "attendus": {
    "en1990-2002/beta.resistance": "3,83",
    "en1990-2023/beta.resistance": "3,83",
    "en1990-2023/beta.β_1": "4,7"
  }
}
```

$\beta_1$ = {{fiabilite-cc2:en1990-2023/beta.β_1}} donne $\beta_{50}$ = {{fiabilite-cc2:en1990-2023/beta.resistance}}, soit une probabilité de défaillance d’environ $6.5 \times 10^{-5}$ sur 50 ans. Le tableau C.3 arrondit à 3,8, comme le tableau B.2 de 2002 ; l’outil garde la valeur exacte de la conversion. Pour CC1, la conversion exacte donne 3,21 et non 3,3 : les deux colonnes du tableau ne sont pas strictement cohérentes, ce qui n’a pas d’effet pratique puisque les coefficients partiels sont calibrés globalement.

{{calculateur:fiabilite-cc2}}

## Au Luxembourg : l’annexe nationale de 2020

**Durée d’utilisation de projet.** Le tableau 2.1 de 2002 reste indicatif ; la durée se fixe de préférence par le maître de l’ouvrage. Pour un bâtiment, l’AN-LU:2020 propose de choisir entre 50 ans (bâtiments courants, catégorie 4) et 100 ans (bâtiments monumentaux, catégorie 5), selon une prévision réaliste de la durée probable. Les ponts sont projetés pour 100 ans. Un élément remplaçable de la catégorie 2 n’a une durée réduite que s’il est facile à inspecter et que son remplacement est prévu ; sinon la durée de l’ensemble s’applique.

**Fiabilité.** Les tableaux de coefficients partiels correspondent à la classe CC2. Les annexes B et C gardent leur caractère informatif, et leur emploi pour viser une autre fiabilité est soumis à l’approbation du client et de l’autorité compétente, sauf si l’Eurocode de matériau ou la norme de produit le prévoit. L’annexe nationale rattache la classe CC2 ($\beta$ = 4,7 sur un an) à une probabilité de dépassement de l’ordre de $1.3 \times 10^{-6}$ par an, soit $\Phi(-4.7)$.

## L’effet sur une note de calcul existante

- Aucun effet direct sur les calculs : les cibles et les coefficients sont les mêmes.
- La note doit indiquer la classe de conséquences, la durée d’utilisation de projet et, selon l’annexe nationale, les niveaux DQL, DCL, EXC et IL.
- Le développement durable devient une exigence de base, à préciser par l’autorité compétente ou par le projet.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les cibles $\beta$ (tableau C.3) et l’application des annexes B et C.
- Les niveaux requis de qualification, de contrôle du projet et de contrôle de l’exécution (tableaux B.1 à B.3).
- Les exigences de développement durable (4.7).
