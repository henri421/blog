---
titre: Efforts de déviation des barres courbes
ordre: 45
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-09 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-09
revise: 2026-10-09
resume: Une barre tendue courbe cherche à se redresser et peut arracher l’enrobage côté centre de courbure. La deuxième génération chiffre ce que le béton seul peut retenir, y compris dans un recouvrement, et demande sinon des armatures transversales.
motscles: dispositions-constructives, recouvrement, ancrage
historique:
  - 2026-10-09 : première rédaction.
---

## Ce qui change

Une barre tendue qui suit une courbe exerce sur le béton une poussée radiale, l’effort de déviation, égale par unité de longueur à l’effort de la barre divisé par le rayon : $F_{td}/r$. La poussée est dirigée vers le centre de courbure pour une barre tendue. Quand ce centre est du côté du parement, elle tend à arracher l’enrobage. C’est le cas d’un intrados de voûte, d’une poutre courbe en plan ou d’une armature de câble près de la surface.

- **2004** : l’EN 1992-1-1 ne donne aucune règle. La vérification relevait du bon sens et de modèles bielles-tirants.
- **2023** (11.7) : les efforts de déviation doivent être pris en compte. En général, des armatures transversales les reprennent (11.7(2)). Sans armature particulière, le béton tendu peut suffire si :

$$
\frac{F_{td}}{r\,c_u} \le \frac{0.125}{\gamma_C}\sqrt{f_{ck}}, \qquad c_u = \min\{c_s \,;\, 2\sqrt{3}\,(c_y + 0.5\,\varphi)\}
$$

$c_s$ est la distance libre entre barres et $c_y$ l’enrobage, comme pour les ancrages (figure 11.3 c)). Pour un câble de post-tension, $\varphi$ devient le diamètre de la gaine.

Pour un **recouvrement** de barres courbes sans armature transversale, l’effort de déviation et l’adhérence sollicitent le même béton. La clause impose une interaction (11.7(4)) :

$$
\frac{\gamma_C \cdot 8\,F_{td}}{r\,c_u\,\sqrt{f_{ck}}} + \frac{l_{sd}}{l_s} \le 1
$$

Le premier terme est exactement le taux de travail de la condition précédente : le recouvrement ne peut utiliser que ce qui reste de la résistance du béton.

## Pourquoi

Le béton qui retient la barre est une bande de largeur $c_u$, entre deux barres voisines ou jusqu’au parement. Sa résistance est celle d’un béton tendu, avec un coefficient réduit (0,125 $\sqrt{f_{ck}}$, voisin du quart de $f_{ctm}$) parce que la rupture est fragile. La borne $2\sqrt{3}\,(c_y + 0.5\,\varphi)$ se lit comme la largeur d’un cône d’éclatement incliné à 60° depuis l’axe de la barre jusqu’au parement. Dans un recouvrement, l’adhérence fend déjà le béton autour des barres, d’où l’interaction.

## L’exemple type : membrure tendue courbe

HA20 plastifiés dans la membrure inférieure d’une poutre courbe, rayon 2,5 m, C30/37, B500. Distance libre entre barres 100 mm, enrobage 35 mm. L’effort par barre vaut $\pi \times 10^2 \times 434.8$ = 136,6 kN.

```exemple
{
  "nom": "membrure-courbe",
  "mecanisme": "deviation",
  "entree": { "Ftd": 136.59, "r": 2500, "phi": 20, "cs": 100, "cy": 35, "fck": 30, "fyk": 500, "lsd": 600, "ls": 750 },
  "attendus": {
    "ec2-2023/beton.c_u": "100",
    "ec2-2023/beton.sollicitation": "0,546",
    "ec2-2023/beton.resistance": "0,456",
    "ec2-2023/beton.taux": "1,198",
    "ec2-2023/beton.armature transversale F_td/(r f_yd)": "126",
    "ec2-2023/recouvrement.sollicitation": "2,00",
    "ec2-2023/recouvrement.taux": "1,998"
  }
}
```

$c_u$ = {{membrure-courbe:ec2-2023/beton.c_u}} mm : l’espacement gouverne, la borne d’enrobage valant 156 mm. L’effort de déviation rapporté à cette bande vaut {{membrure-courbe:ec2-2023/beton.sollicitation}} MPa, pour une résistance de {{membrure-courbe:ec2-2023/beton.resistance}} MPa : le béton seul ne suffit pas (taux {{membrure-courbe:ec2-2023/beton.taux}}). Il faut des armatures transversales, de l’ordre de {{membrure-courbe:ec2-2023/beton.armature transversale F_td/(r f_yd)}} mm²/m par barre, ancrées vers l’intérieur de la section. Un recouvrement dans cette zone, sans armature transversale, serait encore plus loin du compte : l’interaction (11.25) atteint {{membrure-courbe:ec2-2023/recouvrement.sollicitation}}.

{{calculateur:membrure-courbe}}

## L’effet sur une note de calcul existante

- Les **membrures courbes** et les **barres suivant un parement concave** demandent désormais une vérification explicite, ou des armatures transversales justifiées par l’équilibre de la figure 11.17.
- Les **recouvrements dans une zone courbe** sans cadres ne sont admis que si l’effort de déviation reste faible : le terme $l_{sd}/l_s$ laisse peu de marge.
- Les **câbles de post-tension proches du parement** sont concernés de la même façon, avec le diamètre de la gaine.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\gamma_C$ (1,5 recommandé).
