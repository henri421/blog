---
titre: Pressions localisées
ordre: 14
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: La formule de diffusion reste la même, mais la surface de diffusion se construit autrement et la charge excentrée reçoit enfin une règle explicite.
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

La résistance à l’écrasement sous une charge concentrée garde sa forme : la résistance du béton multipliée par la racine du rapport entre surface de diffusion et surface chargée, plafonnée à trois fois. Ce qui change, c’est la surface de diffusion, construite dans le bloc d’introduction et non plus homothétique de la surface chargée, et le traitement de la charge excentrée, par une surface chargée réduite.

## Pourquoi

Sous un appui, le béton directement chargé est confiné par le béton qui l’entoure : il peut supporter bien plus que sa résistance en compression simple. La racine du rapport des surfaces traduit ce confinement, et le plafond limite le gain à ce que le béton environnant peut réellement fournir.

La première génération demandait une surface de diffusion de même forme que la surface chargée, centrée sur la ligne d’action. Pour un appareil d’appui allongé près d’un bord, cette homothétie gaspille une partie du bloc. La deuxième génération construit la surface de diffusion à partir des dimensions du bloc, côté parallèle au bord compris, ce qui exploite mieux la largeur disponible.

Une charge excentrée concentre la pression d’un côté. La première génération demandait seulement de réduire la résistance, sans dire comment. La deuxième centre une surface chargée réduite sur le point d’application, à la manière de la largeur efficace d’une semelle excentrée.

## Le calcul dans les deux générations

$$
F_{Rdu} = A_{c0}\,f_{cd}\,\sqrt{\frac{A_{c1}}{A_{c0}}} \le 3\,f_{cd}\,A_{c0} \quad (6.63), \qquad \sigma_{Rdu} = f_{cd}\,\sqrt{\frac{A_{c1}}{A_{c0}}} \le \nu_{part}\,f_{cd} \quad (8.126)
$$

En 2023 : $A_{c0,red} = (a_0 - 2\,e_a)(b_0 - 2\,e_b)$ pour une charge excentrée, $A_{c1} = a_1\,b_1$ avec $b_1 = \min(b_0 + (a_1 - a_0) ; b)$, $\nu_{part}$ = 3,0, et une hauteur de bloc au moins égale à $a_1$.

Le calculateur retient en 2004 le plus grand rectangle homothétique contenu dans le bloc, d’échelle au plus 3.

## L’exemple type : appui de poutre préfabriquée

Appareil d’appui de 150 × 200 mm, le côté de 150 mm perpendiculaire au bord, sur un bloc de 450 × 300 mm en C30/37 ; réaction de calcul 600 kN.

```exemple
{
  "nom": "appui",
  "mecanisme": "pression-localisee",
  "entree": { "FEd": 600, "a0": 150, "b0": 200, "ea": 0, "eb": 0, "a1": 450, "b": 300, "hBloc": 500, "fck": 30 },
  "attendus": {
    "ec2-2004/base.A_c1": "67500",
    "ec2-2004/base.resistance": "900",
    "ec2-2004/base.taux": "0,666",
    "ec2-2023/base.A_c1": "135000",
    "ec2-2023/base.resistance": "1082",
    "ec2-2023/base.taux": "0,554"
  }
}
```

La surface homothétique de 2004 bute sur la largeur du bloc et ne vaut que {{appui:ec2-2004/base.A_c1}} mm² ; celle de 2023 occupe toute la largeur, {{appui:ec2-2023/base.A_c1}} mm². Malgré un $f_{cd}$ plus faible de 15 %, la résistance passe de {{appui:ec2-2004/base.resistance}} à {{appui:ec2-2023/base.resistance}} kN.

{{calculateur:appui}}

## Second exemple : appui excentré

Le même appui, la réaction décalée de 20 mm vers l’intérieur du bloc.

```exemple
{
  "nom": "appui-excentre",
  "mecanisme": "pression-localisee",
  "entree": { "FEd": 600, "a0": 150, "b0": 200, "ea": 20, "eb": 0, "a1": 450, "b": 300, "hBloc": 500, "fck": 30 },
  "attendus": {
    "ec2-2023/base.A_c0 (réduite)": "22000",
    "ec2-2023/base.resistance": "926",
    "ec2-2023/base.taux": "0,647"
  }
}
```

La première génération ne donne pas de règle : le calculateur affiche sa cellule non applicable, avec ce motif. La deuxième réduit la surface chargée à {{appui-excentre:ec2-2023/base.A_c0 (réduite)}} mm² ; la pression admissible augmente, puisque le rapport des surfaces croît, mais la résistance totale baisse à {{appui-excentre:ec2-2023/base.resistance}} kN.

{{calculateur:appui-excentre}}

## L’effet sur une note de calcul existante

- Les appuis **allongés le long d’un bord** gagnent en résistance par la nouvelle construction de la surface de diffusion.
- Les charges **excentrées**, qui relevaient du jugement, ont désormais une règle à appliquer et à justifier dans la note.
- L’effort de **traction transversale** (frettage) reste à vérifier séparément, par un modèle à bielles et tirants (8.5).

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\nu_{part}$, si l’annexe nationale en admet une autre.
