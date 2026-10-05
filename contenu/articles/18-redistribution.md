---
titre: Redistribution des moments
ordre: 18
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: La limite de redistribution ne dépend plus de deux coefficients calés pour le béton ordinaire mais de la déformation de l’acier au moment où le béton s’écrase ; pour les bétons à haute résistance, la règle devient nettement plus généreuse.
motscles: analyse-structurale, ductilite, poutre, elu
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

La condition qui encadre la redistribution sans calcul de la rotation garde sa forme, un rapport $\delta$ minimal croissant avec la hauteur comprimée $x_u/d$, et ses deux bornes, 0,7 pour les aciers de classe B ou C et 0,8 pour la classe A. Ce qui change est l’origine des coefficients. En 2004, deux couples de valeurs recommandées, l’un jusqu’à C50/60, l’autre au-delà. En 2023, un terme constant tiré de la déformation d’écoulement de l’acier, et une pente unité sur $x_u/d$. La clause ajoute enfin une vérification explicite de la capacité de rotation pour l’analyse linéaire avec redistribution (7.3.2(5)), que 2004 ne prévoyait que pour l’analyse plastique (5.6.3).

## Pourquoi

Une section sur appui dont on réduit le moment doit tourner plastiquement pendant que les travées se chargent. Cette rotation est d’autant plus disponible que l’acier s’allonge beaucoup avant que le béton comprimé ne s’écrase, donc que la hauteur comprimée est faible. La règle de 2004 traduisait cette idée par une droite calée sur les essais de bétons courants, avec un saut de 0,10 sur l’ordonnée à l’origine au-delà de C50/60 pour tenir compte de la fragilité des bétons à haute résistance.

La règle de 2023 part directement du rapport entre la déformation ultime du béton et la déformation d’écoulement de l’acier, qui fixe le terme constant ; elle ne fait plus de cas particulier des bétons à haute résistance. Comme ceux-ci donnent aussi une hauteur comprimée plus faible pour une même armature, le gain est double.

## Le calcul dans les deux générations

Première génération, jusqu’à C50/60 (5.10a) :

$$
\delta \ge k_1 + k_2\,\frac{x_u}{d}, \quad k_1 = 0.44, \quad k_2 = 1.25\left(0.6 + \frac{0.0014}{\varepsilon_{cu2}}\right)
$$

au-delà, $k_3$ = 0,54 et $k_4 = k_2$ (5.10b), avec $\varepsilon_{cu2}$ qui décroît avec $f_{ck}$.

Deuxième génération (7.16) :

$$
\delta_M \ge \frac{1}{1 + 0.7\,\varepsilon_{cu}\,E_s/f_{yd}} + \frac{x_u}{d}
$$

Dans les deux cas, $\delta$ ne descend pas sous 0,7 (classes B et C) ou 0,8 (classe A), et la règle ne vaut que pour des éléments principalement fléchis dont les portées adjacentes restent dans un rapport de 0,5 à 2. Pour un acier B500, le premier terme vaut 0,470 : à $x_u/d$ égal, la règle de 2023 est un peu plus sévère que celle de 2004 tant que $x_u/d$ reste sous 0,12 environ, puis plus souple au-delà.

Le calculateur obtient $x_u$ par l’équilibre de la section armée pour le moment redistribué (parabole-rectangle, armatures tendues seules), comme l’article sur la flexion. En 2023, $f_{cd}$ y inclut $k_{tc}$ = 0,85.

## L’exemple type : poutre continue sur deux travées

Deux travées de 7 m, charge de calcul de 50 kN/m. Le moment élastique sur l’appui central vaut $qL^2/8$ = 306,25 kN·m ; on le réduit de 20 % à 245 kN·m. Section 300 × 600, $d$ = 540 mm, 3 HA25 (1473 mm²) sur appui, C30/37, B500 de classe B.

```exemple
{
  "nom": "poutre-red",
  "mecanisme": "redistribution",
  "entree": { "Mel": 306.25, "Mred": 245, "L1": 7000, "L2": 7000, "b": 300, "d": 540, "As": 1473, "fck": 30, "fyk": 500, "classe": "B" },
  "attendus": {
    "ec2-2004/base.x_u": "131,9",
    "ec2-2004/base.x_u / d": "0,244",
    "ec2-2004/base.(5.10)": "0,745",
    "ec2-2004/base.taux": "0,931",
    "ec2-2023/base.x_u": "155,1",
    "ec2-2023/base.x_u / d": "0,287",
    "ec2-2023/base.1/(1 + 0,7 ε_cu E_s/f_yd)": "0,470",
    "ec2-2023/base.(7.16)": "0,757",
    "ec2-2023/base.taux": "0,946"
  }
}
```

Le rapport retenu vaut $\delta$ = 245 / 306,25 = 0,80.

**Première génération.** L’axe neutre est à $x_u$ = {{poutre-red:ec2-2004/base.x_u}} mm, soit $x_u/d$ = {{poutre-red:ec2-2004/base.x_u / d}}. La condition (5.10a) demande $\delta \ge$ {{poutre-red:ec2-2004/base.(5.10)}} : la redistribution passe (taux de travail {{poutre-red:ec2-2004/base.taux}}).

**Deuxième génération.** Avec $f_{cd}$ réduit par $k_{tc}$, la hauteur comprimée passe à {{poutre-red:ec2-2023/base.x_u}} mm ($x_u/d$ = {{poutre-red:ec2-2023/base.x_u / d}}). La condition donne {{poutre-red:ec2-2023/base.1/(1 + 0,7 ε_cu E_s/f_yd)}} + {{poutre-red:ec2-2023/base.x_u / d}} = {{poutre-red:ec2-2023/base.(7.16)}} : la redistribution passe encore (taux de travail {{poutre-red:ec2-2023/base.taux}}). Deux effets se compensent : $k_{tc}$ augmente $x_u$, mais la pente de (7.16) sur $x_u/d$ vaut 1 au lieu de 1,25. Avec la formule de 2004, le même $x_u/d$ aurait demandé 0,799.

{{calculateur:poutre-red}}

## Le béton à haute résistance

La même poutre en C60/75 :

```exemple
{
  "nom": "poutre-red-c60",
  "mecanisme": "redistribution",
  "entree": { "Mel": 306.25, "Mred": 245, "L1": 7000, "L2": 7000, "b": 300, "d": 540, "As": 1473, "fck": 60, "fyk": 500, "classe": "B" },
  "attendus": {
    "ec2-2004/base.(5.10)": "0,733",
    "ec2-2023/base.(7.16)": "0,635",
    "ec2-2023/base.sollicitation": "0,700"
  }
}
```

En 2004, l’ordonnée à l’origine passe à 0,54 et la condition remonte à {{poutre-red-c60:ec2-2004/base.(5.10)}}, presque autant qu’en C30/37 malgré une hauteur comprimée presque deux fois plus faible. En 2023, la formule donne {{poutre-red-c60:ec2-2023/base.(7.16)}} et c’est la borne de ductilité qui gouverne, {{poutre-red-c60:ec2-2023/base.sollicitation}} : on pourrait redistribuer jusqu’à 30 %.

## L’effet sur une note de calcul existante

- Pour les bétons courants, une redistribution justifiée en 2004 le reste en général : le terme constant de 2023 est voisin de 0,44, la pente plus douce compense le $x_u$ plus grand dû à $k_{tc}$.
- Pour les bétons au-delà de C50/60, la marge de redistribution augmente nettement.
- La note doit indiquer la classe de ductilité de l’acier et le rapport des portées adjacentes, conditions inchangées.
- Les éléments précontraints remplacent $f_{yd}$ par une contrainte pondérée entre armatures passives et actives (7.17) ; le calculateur ne les traite pas.
- Au-delà de ces limites, 2023 propose une vérification explicite de la rotation (7.3.2(5)), qui fera l’objet d’un article séparé.

## Ce qu’il faudra vérifier dans l’annexe nationale

- D’éventuelles restrictions nationales à la redistribution : en 2004, les coefficients et les bornes étaient des paramètres nationaux.
