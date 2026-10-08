---
titre: Post-tension, gaines et rayon de courbure
ordre: 33
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les espacements des gaines ne changent pas. L’Eurocode 2 donne désormais lui-même un rayon de courbure minimal des câbles, fonction de leur section et de la pression transversale admise, au lieu de renvoyer à l’agrément du procédé.
motscles: precontrainte, dispositions-constructives
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

**Espacement des gaines** (11.6.2) : les minimums ne changent pas. Horizontalement, l’espacement libre vaut au moins le plus grand du granulat plus 5 mm, du diamètre de la gaine et de 50 mm. Verticalement, il vaut au moins le plus grand du granulat, du diamètre de la gaine et de 40 mm. Deux précisions sont ajoutées :

- l’espacement vertical peut descendre sous le diamètre de la gaine si des armatures transversales reprennent les efforts de déviation ;
- les paquets de câbles sont espacés d’au moins 100 mm. On peut regrouper deux gaines, ou quatre torons gainés graissés, hors des zones d’ancrage et transversalement au plan de courbure.

**Rayon de courbure** (11.6.3) : c’est la nouveauté. En 2004, le rayon minimal relevait du seul agrément technique du procédé. En 2023, l’Eurocode donne une valeur plancher, que la documentation du procédé ne peut abaisser que sur essais :

$$
R_{min} = \frac{\sigma_{pd}\,\sqrt{A_p}}{p_{Rd}}
$$

avec $\sigma_{pd}$ la contrainte de calcul à la mise en tension et $p_{Rd}$ la pression transversale maximale sur le câble. Celle-ci se lit dans le tableau 11.4, paramètre national, selon le type de gaine.

Les boucles de câble en U reçoivent des dispositions propres (enrobage d’au moins un diamètre de gaine, armatures de déviation). Les efforts de déviation des câbles courbes proches de la surface se traitent comme ceux des membrures courbes (11.7).

## Pourquoi

Dans une courbe, le câble tendu presse la gaine puis le béton avec une force radiale égale à l’effort divisé par le rayon. Ramenée à une largeur d’appui de l’ordre de $\sqrt{A_p}$, cette force donne une pression qui ne doit pas écraser le béton non confiné ni réduire la résistance du câble. L’expression de 2023 traduit directement cet équilibre.

## L’exemple type : câble de 12 torons dans une poutre de pont

Câble de 12 T15,7 ($A_p$ = 1800 mm²) dans une gaine de 80 mm, granulat de 20 mm, gaines espacées de 80 mm horizontalement et 60 mm verticalement. Le câble est tendu à 1450 MPa, gaine nervurée ($p_{Rd}$ = 15 MPa lu dans le tableau 11.4), et le rayon prévu est de 6 m.

```exemple
{
  "nom": "cable-12t15",
  "mecanisme": "post-tension",
  "entree": { "phiDuct": 80, "Dupper": 20, "csx": 80, "csy": 60, "sigmaPd": 1450, "Ap": 1800, "pRd": 15, "rPrevu": 6000 },
  "attendus": {
    "ec2-2004/espacement-horizontal.sollicitation": "80",
    "ec2-2023/espacement-vertical.sollicitation": "80",
    "ec2-2023/espacement-vertical.taux": "1,334",
    "ec2-2023/rayon.sollicitation": "4101",
    "ec2-2023/rayon.taux": "0,683"
  }
}
```

L’espacement vertical de 60 mm est insuffisant dans les deux générations : il faut {{cable-12t15:ec2-2023/espacement-vertical.sollicitation}} mm, soit un taux de {{cable-12t15:ec2-2023/espacement-vertical.taux}}, à moins de disposer des armatures transversales (2023). Le rayon minimal vaut {{cable-12t15:ec2-2023/rayon.sollicitation}} mm : le rayon de 6 m convient, avec un taux de {{cable-12t15:ec2-2023/rayon.taux}}.

{{calculateur:cable-12t15}}

## L’effet sur une note de calcul existante

- Les **espacements de gaines** restent valables.
- Les **rayons de courbure** doivent être justifiés par (11.23), en plus de l’agrément du procédé. Les câbles de forte section à faible rayon (déviateurs, boucles) sont les plus concernés.
- Les **paquets de câbles** doivent respecter l’espacement de 100 mm.

## Ce qu’il faudra vérifier

- Les valeurs de $p_{Rd}$ du tableau 11.4 sont des paramètres nationaux : à relire dans l’annexe nationale.
