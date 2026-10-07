---
titre: Ancrage par barres transversales soudées et par boucles en U
ordre: 25
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Comme pour les crochets, les coefficients multiplicateurs de 2004 deviennent des longueurs à retrancher : 15 φ pour une barre transversale soudée, 20 φ pour une boucle en U. La boucle y gagne, la barre soudée perd à forte contrainte.
motscles: ancrage, dispositions-constructives
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

En 2004, une barre transversale soudée et une boucle réduisaient la longueur d’ancrage par un **coefficient** : $\alpha_4$ = 0,7 pour la barre soudée, $\alpha_1$ = 0,7 pour la boucle si l’enrobage dépasse 3 φ. En 2023, comme pour les crochets, elles la réduisent d’une **longueur fixe** retranchée à la longueur d’une barre droite :

- **barre transversale soudée** (11.4.5) : moins 15 φ, sans descendre sous 5 φ ;
- **boucle en U** (11.4.6) : moins 20 φ, sans descendre sous 10 φ.

Les conditions sur les barres soudées sont précisées. Une barre de diamètre au moins égal à 0,6 φ suffit, comme en 2004. Des barres plus fines sont désormais admises : il en faut deux, espacées de 50 à 100 mm, sur une barre ancrée de 16 mm au plus. Une boucle en traction pure façonnée selon 11.3 peut même être considérée comme ancrée sans longueur supplémentaire (11.4.6(1)).

## Pourquoi

Une réduction relative suppose que la barre soudée ou la boucle reprenne une **fraction** de l’effort, quelle que soit sa valeur. Or ces dispositifs agissent comme une butée : ils reprennent un effort à peu près fixe, que l’on traduit par une longueur droite équivalente. Retrancher une longueur rend mieux compte de ce fonctionnement. La réduction pèse beaucoup sur une barre peu sollicitée, peu sur une barre plastifiée. C’est le même raisonnement que pour les crochets ([article 16](ancrage-crochet.html)).

## Le calcul dans les deux générations

**Première génération** (8.4.4, tableau 8.2) :

$$
l_{bd} = \alpha_2\,\alpha_4\,l_{b,rqd} \ \text{(barre soudée)}, \qquad l_{bd} = \alpha_1\,\alpha_2\,l_{b,rqd} \ \text{(boucle)}, \qquad l_{bd} \ge l_{b,min}
$$

avec $\alpha_4$ = 0,7, $\alpha_2$ des barres droites pour la barre soudée ($c_d = \min(a/2 \;;\; c_1 \;;\; c)$), et pour la boucle $\alpha_1$ = 0,7 si $c_d > 3\varphi$, $\alpha_2$ des barres non droites, $c_d = c$, l’enrobage perpendiculaire au plan de la boucle.

**Deuxième génération** (11.4.5, 11.4.6(2)) :

$$
l_{bd} = l_{bd,droit} - 15\,\varphi \ge 5\,\varphi \ \text{(barre soudée)}, \qquad l_{bd} = l_{bd,droit} - 20\,\varphi \ge 10\,\varphi \ \text{(boucle)}
$$

avec $l_{bd,droit}$ la longueur d’une barre droite selon (11.3), présentée dans l’[article 05](ancrage.html).

## L’exemple type : HA16 en about de poutre

HA16, C25/30, B500, bonne adhérence, 30 mm d’enrobage, 100 mm entre barres, 450 mm disponibles. Les mêmes données servent à l’article sur les crochets. La barre transversale soudée est un HA10, au-dessus de 0,6 × 16 = 9,6 mm.

```exemple
{
  "nom": "soude-poutre",
  "mecanisme": "ancrage-soude",
  "entree": { "phi": 16, "fck": 25, "fyk": 500, "sigmaSd": 300, "adherence": "bonne", "cs": 100, "cx": 30, "cy": 30, "phiT": 10, "nT": 1, "lDispo": 450 },
  "attendus": {
    "ec2-2004/barre-plastifiee.sollicitation": "392,7",
    "ec2-2023/barre-plastifiee.sollicitation": "423,8",
    "ec2-2004/contrainte-reelle.sollicitation": "271,0",
    "ec2-2023/contrainte-reelle.sollicitation": "140,4"
  }
}
```

```exemple
{
  "nom": "boucle-poutre",
  "mecanisme": "ancrage-boucle",
  "entree": { "phi": 16, "fck": 25, "fyk": 500, "sigmaSd": 300, "adherence": "bonne", "cs": 100, "cx": 30, "cy": 30, "lDispo": 450 },
  "attendus": {
    "ec2-2004/barre-plastifiee.sollicitation": "645,7",
    "ec2-2023/barre-plastifiee.sollicitation": "343,8",
    "ec2-2004/contrainte-reelle.sollicitation": "445,6",
    "ec2-2023/contrainte-reelle.sollicitation": "160,0"
  }
}
```

```exemple
{
  "nom": "boucle-massif",
  "mecanisme": "ancrage-boucle",
  "entree": { "phi": 16, "fck": 25, "fyk": 500, "sigmaSd": 300, "adherence": "bonne", "cs": 150, "cx": 60, "cy": 60, "lDispo": 450 },
  "attendus": {
    "ec2-2004/barre-plastifiee.sollicitation": "401,2",
    "ec2-2023/barre-plastifiee.sollicitation": "160,0"
  }
}
```

| Longueur d’ancrage (mm) | 2004, barre plastifiée | 2023, barre plastifiée | 2004, σsd = 300 MPa | 2023, σsd = 300 MPa |
|---|---:|---:|---:|---:|
| Barre transversale soudée | {{soude-poutre:ec2-2004/barre-plastifiee.sollicitation}} | {{soude-poutre:ec2-2023/barre-plastifiee.sollicitation}} | {{soude-poutre:ec2-2004/contrainte-reelle.sollicitation}} | {{soude-poutre:ec2-2023/contrainte-reelle.sollicitation}} |
| Boucle en U | {{boucle-poutre:ec2-2004/barre-plastifiee.sollicitation}} | {{boucle-poutre:ec2-2023/barre-plastifiee.sollicitation}} | {{boucle-poutre:ec2-2004/contrainte-reelle.sollicitation}} | {{boucle-poutre:ec2-2023/contrainte-reelle.sollicitation}} |

Pour la **barre plastifiée**, la barre soudée perd un peu : {{soude-poutre:ec2-2023/barre-plastifiee.sollicitation}} mm au lieu de {{soude-poutre:ec2-2004/barre-plastifiee.sollicitation}}. En 2004, la réduction de 30 % s’ajoutait à celle de l’enrobage, alors que 15 φ ne représentent ici que le tiers environ de la longueur droite. Elle ne fait alors pas mieux qu’un crochet. La **boucle** gagne nettement : en 2004, avec 30 mm d’enrobage, elle n’apportait rien, son coefficient exigeant plus de 3 φ. En 2023, elle retire 20 φ dans tous les cas. Dans un massif (60 mm d’enrobage), elle tombe au plancher de 10 φ, soit {{boucle-massif:ec2-2023/barre-plastifiee.sollicitation}} mm contre {{boucle-massif:ec2-2004/barre-plastifiee.sollicitation}} mm en 2004.

{{calculateur:soude-poutre}}

{{calculateur:boucle-poutre}}

## L’effet sur une note de calcul existante

- Les **treillis soudés** ancrés par leurs fils transversaux : longueur un peu plus grande pour des fils plastifiés sous enrobage courant, nettement plus courte pour des fils peu sollicités, jusqu’au plancher de 5 φ.
- Les **boucles** (attentes en U, épingles d’about) : longueur réduite dans tous les cas, de 20 φ, à condition de façonner la boucle au mandrin minimal.
- Des **barres soudées fines** (moins de 0,6 φ), refusées en 2004, deviennent utilisables, par paires et sur des barres d’au plus 16 mm.

## Ce qu’il faudra vérifier

- **Enrobage de la boucle en 2004** : le calculateur prend $c_d = c$ égal à l’enrobage perpendiculaire au plan de la boucle (figure 8.3 c)).
- **Capacité d’une barre soudée en 2004** : 8.6 donne une capacité d’ancrage propre à chaque barre soudée (formules (8.8) et (8.9)), qui s’ajoute à l’adhérence. Le calculateur ne la traite pas. Il s’en tient à $\alpha_4$.
- **Appui direct** : en 2004, la longueur peut descendre sous $l_{b,min}$ avec une barre soudée dans l’appui (note du tableau 8.2). Ce cas n’est pas codé.
