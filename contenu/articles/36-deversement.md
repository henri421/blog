---
titre: Déversement des poutres élancées
ordre: 36
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les critères qui dispensent de calculer le déversement gardent leur forme, sans la limite sur le rapport hauteur/largeur qui excluait en 2004 les poutres préfabriquées hautes et minces.
motscles: stabilite, prefabrication, poutre
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Une poutre haute et étroite, peu tenue latéralement, peut déverser : sa membrure comprimée flambe hors du plan en entraînant une torsion. Le cas typique est celui d’une poutre préfabriquée pendant le transport et la pose. Les deux générations permettent de négliger cet effet du second ordre sous une condition d’élancement latéral (5.9(3) ; 7.5(3)) :

- situations **durables** : $l_{0t}/b \le 50/(h/b)^{1/3}$ ;
- situations **transitoires** : $l_{0t}/b \le 70/(h/b)^{1/3}$.

$l_{0t}$ est la distance entre les éléments qui s’opposent au déversement, $h$ la hauteur de la poutre, $b$ la largeur de la table comprimée.

En 2004, ces critères ne valaient que pour $h/b \le$ 2,5 en situation durable et 3,5 en situation transitoire. Au-delà, il fallait toujours calculer le second ordre. Le texte de 2023 ne reprend pas ces limites. L’imperfection de calcul reste une flèche latérale de $l/300$, mais en 2023 seulement en l’absence de tolérances propres au projet.

## Pourquoi

Le texte ne donne pas de motif. On peut remarquer que la limite en $(h/b)^{1/3}$ décroît déjà quand la poutre s’amincit, ce qui rendait en partie redondante la borne sur $h/b$. La levée de cette borne étend la dispense aux poutres de toiture et de pont, souvent plus hautes que 2,5 fois leur largeur, dès qu’elles sont suffisamment tenues latéralement.

## L’exemple type : poutre préfabriquée de toiture

Poutre de 1,10 m de haut, table de 400 mm, tenue latéralement tous les 12 m par les pannes.

```exemple
{
  "nom": "poutre-toiture",
  "mecanisme": "deversement",
  "entree": { "l0t": 12000, "h": 1100, "b": 400, "situation": "durable" },
  "attendus": {
    "ec2-2023/base.resistance": "35,69",
    "ec2-2023/base.taux": "0,840"
  }
}
```

```exemple
{
  "nom": "poutre-transport",
  "mecanisme": "deversement",
  "entree": { "l0t": 12000, "h": 1100, "b": 400, "situation": "transitoire" },
  "attendus": {
    "ec2-2004/base.resistance": "49,96",
    "ec2-2023/base.taux": "0,600"
  }
}
```

Avec $h/b$ = 2,75, la poutre sort du domaine de 2004 en situation durable : le second ordre y était à calculer. En 2023, la condition est satisfaite, avec une limite de {{poutre-toiture:ec2-2023/base.resistance}} et un taux de {{poutre-toiture:ec2-2023/base.taux}}. Pendant le transport, levée en deux points à 12 m, la limite transitoire de {{poutre-transport:ec2-2004/base.resistance}} est respectée dans les deux générations, avec un taux de {{poutre-transport:ec2-2023/base.taux}}.

{{calculateur:poutre-toiture}}

## L’effet sur une note de calcul existante

- Les **poutres hautes** ($h/b$ > 2,5) bien tenues latéralement n’ont plus besoin d’un calcul de second ordre, si le critère d’élancement est satisfait.
- Les notes qui justifiaient le déversement par un calcul complet restent valables.

## Ce qu’il faudra vérifier

- **Forme de (7.31) et (7.32)** : la barre de fraction est perdue à l’extraction. Le calculateur retient la forme de 2004, $50/(h/b)^{1/3}$, la seule cohérente avec un critère qui devient plus sévère quand la poutre s’amincit. L’absence de limite sur $h/b$ est à confirmer sur l’exemplaire.
