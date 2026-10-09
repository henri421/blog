---
titre: Redistribution des moments
ordre: 18
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-09
resume: La limite de redistribution ne dépend plus de deux coefficients calés pour le béton ordinaire mais de la déformation de l’acier au moment où le béton s’écrase ; pour les bétons à haute résistance, la règle devient nettement plus généreuse.
motscles: analyse-structurale, ductilite, poutre, elu
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-09 : vérification explicite de la capacité de rotation (7.3.2(5), formules 7.18 à 7.24) ajoutée au calculateur.
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

## La vérification explicite de la rotation

La règle (7.16) est une condition forfaitaire. La clause 7.3.2(5) permet aussi de redistribuer davantage, ou hors de ses conditions (portées très inégales), à condition de montrer que la section qui plastifie peut tourner autant que l’analyse le demande : $\theta_{Ed} \le \theta_{Rd}$. En 2004, une vérification de ce type n’existait que pour l’analyse plastique, avec un abaque (5.6.3). En 2023, la capacité est donnée par une formule :

$$
\theta_{Rd} = \frac{1.3\,d}{\gamma_\theta} \left( \left(\frac{1}{r}\right)_{u,m} - TS_{My}\,\frac{\varepsilon_{yd}}{d - x} \right), \quad \gamma_\theta = 3.0
$$

$$
\left(\frac{1}{r}\right)_{u,m} = TS_{Mu} \cdot \min\left\{ \frac{\varepsilon_{ud}}{d - x_u} \,;\, \frac{\varepsilon_{cu,d,\rho_w}}{x_u} \right\}, \quad \varepsilon_{cu,d,\rho_w} = 0.002 + \frac{1.35}{d} + 3\,\rho_w \le 0.015
$$

La rotation disponible est la courbure ultime moins la courbure à la plastification, multipliée par une longueur de rotule de 1,3 $d$. Trois termes portent la physique :

- la courbure ultime est gouvernée soit par l’allongement de l’acier, soit par l’écrasement du béton, dont la déformation ultime croît avec le confinement par les cadres ($\rho_w$) et décroît avec la hauteur utile ;
- les coefficients $TS_{Mu}$ et $TS_{My}$ réduisent les courbures pour tenir compte du béton tendu entre les fissures, qui raidit la poutre. $TS_{Mu}$ dépend d’un paramètre $\alpha$ (7.24) qui compare l’écrouissage de l’acier, $f_{s,ef} - f_{yd}$, à l’adhérence, sur un espacement moyen de fissures pris en 9.2.3 ; un acier peu écroui donne un $\alpha$ faible, donc une rotation réduite ;
- le facteur de modèle $\gamma_\theta$ = 3,0 couvre la grande dispersion des essais de rotation.

La demande $\theta_{Ed}$ ne vient pas de la section : c’est l’intégrale des courbures au-delà de la plastification, que fournit une analyse non linéaire ou un calcul simplifié de la poutre. Le calculateur la prend en donnée.

```exemple
{
  "nom": "appui-rotation",
  "mecanisme": "redistribution",
  "entree": { "Mel": 306.25, "Mred": 245, "L1": 7000, "L2": 7000, "b": 300, "d": 540, "As": 1257, "fck": 30, "fyk": 500, "classe": "B", "h": 600, "phi": 20, "c": 50, "rhoW": 0.17, "k": 1.08, "epsUk": 50, "thetaEd": 2 },
  "attendus": {
    "ec2-2023/base.(7.16)": "0,715",
    "ec2-2023/base.taux": "0,894",
    "ec2-2023/rotation.x_u": "134,2",
    "ec2-2023/rotation.f_s,ef": "441",
    "ec2-2023/rotation.M_Rd": "268",
    "ec2-2023/rotation.M_y": "255",
    "ec2-2023/rotation.s_r,m,cal": "145",
    "ec2-2023/rotation.α (7.24)": "0,124",
    "ec2-2023/rotation.TS_Mu": "0,237",
    "ec2-2023/rotation.TS_My": "0,877",
    "ec2-2023/rotation.resistance": "2,63",
    "ec2-2023/rotation.taux": "0,760"
  }
}
```

Reprenons l’appui de la poutre, cette fois armé pour le moment redistribué : 4 HA20 (1257 mm²), $M_{Rd}$ = {{appui-rotation:ec2-2023/rotation.M_Rd}} kN·m, cadres HA8 à 20 cm à deux brins ($\rho_w$ ≈ 0,17 %), acier B500B avec $k$ = 1,08 et $\varepsilon_{uk}$ = 50 ‰, les valeurs minimales de la classe B. La règle forfaitaire passe : $\delta$ = 0,80 pour un minimum de {{appui-rotation:ec2-2023/base.(7.16)}}.

À l’état ultime, le béton s’écrase avant la rupture de l’acier ($x_u$ = {{appui-rotation:ec2-2023/rotation.x_u}} mm). L’acier n’y travaille qu’à {{appui-rotation:ec2-2023/rotation.f_s,ef}} MPa, à peine au-dessus de $f_{yd}$, si bien que $\alpha$ = {{appui-rotation:ec2-2023/rotation.α (7.24)}} et $TS_{Mu}$ = {{appui-rotation:ec2-2023/rotation.TS_Mu}} : entre les fissures, le béton tendu ramène la courbure moyenne au quart de celle de la section fissurée. La capacité vaut $\theta_{Rd}$ = {{appui-rotation:ec2-2023/rotation.resistance}} mrad.

Pour une demande supposée de 2 mrad, la vérification passe (taux {{appui-rotation:ec2-2023/rotation.taux}}). Cette valeur de 2 mrad est une hypothèse de l’exemple, et l’ordre de grandeur montre pourquoi l’analyse compte : si l’on estime la rotation de la rotule par $2\,\Delta M\,L / (3\,E I)$ avec $\Delta M$ = 61,25 kN·m, on obtient environ 1,7 mrad avec l’inertie brute et 5,8 mrad avec l’inertie fissurée. La conclusion bascule entre ces deux bornes : la vérification explicite n’a de sens qu’avec une estimation réaliste de la rigidité des travées.

{{calculateur:appui-rotation}}

Le calculateur fait quelques choix qu’il faut connaître. $f_{s,ef}$ et $x_u$ viennent de l’équilibre de la section avec la branche inclinée de l’acier (5.2.4, $\varepsilon_{ud} = \varepsilon_{uk}/\gamma_S$) ; $M_y$ et $x$ de la plastification, avec le même diagramme du béton ; l’espacement $s_{r,m,cal}$ suppose un seul lit, des barres réparties sur toute la largeur et une bonne adhérence. Pour des aciers supérieurs d’une poutre haute, souvent en conditions d’adhérence médiocres, l’espacement et donc $\alpha$ changeraient.

## L’effet sur une note de calcul existante

- Pour les bétons courants, une redistribution justifiée en 2004 le reste en général : le terme constant de 2023 est voisin de 0,44, la pente plus douce compense le $x_u$ plus grand dû à $k_{tc}$.
- Pour les bétons au-delà de C50/60, la marge de redistribution augmente nettement.
- La note doit indiquer la classe de ductilité de l’acier et le rapport des portées adjacentes, conditions inchangées.
- Les éléments précontraints remplacent $f_{yd}$ par une contrainte pondérée entre armatures passives et actives (7.17) ; le calculateur ne les traite pas.
- Au-delà de ces limites, 2023 propose une vérification explicite de la rotation (7.3.2(5)), présentée ci-dessus : elle demande une analyse qui fournisse la rotation plastique à l’appui.

## Ce qu’il faudra vérifier dans l’annexe nationale

- D’éventuelles restrictions nationales à la redistribution : en 2004, les coefficients et les bornes étaient des paramètres nationaux.
- Le facteur de modèle $\gamma_\theta$ de la vérification explicite (3,0 recommandé).
