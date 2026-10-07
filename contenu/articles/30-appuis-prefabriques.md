---
titre: Appuis des éléments préfabriqués
ordre: 30
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: La règle de la longueur d’appui quitte le chapitre de la préfabrication pour celui des dispositions générales. Elle perd ses tableaux de valeurs minimales et son expression de la profondeur nominale : il reste le calcul de la longueur nette et une liste des termes à prendre en compte.
motscles: prefabrication, dispositions-constructives
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

En 2004, la profondeur d’appui d’un élément préfabriqué se calculait par une expression complète (10.6). Elle additionnait la longueur nette $a_1$, deux distances inefficaces au bord des éléments, $a_2$ et $a_3$, et une tolérance combinée. Chaque terme se lisait dans un tableau (10.2 à 10.5) selon le type d’appui, le matériau et la contrainte d’appui relative. La longueur nette avait de plus un minimum tabulé, de 25 mm pour un plancher à 140 mm pour une poutre fortement chargée.

En 2023, la règle passe en 12.10, avec les appuis en général, et 13.7.2 y renvoie. Elle conserve :

- la **longueur nette** $a_1$, déduite de la capacité portante ;
- la **résistance de l’appui** : $f_{Rd} = 0.4\,f_{cd}$ pour un joint sec (12.13), $f_{Rd} = f_{bed} \le 0.85\,f_{cd}$ dans les autres cas (12.14) ;
- la **liste des termes** de la profondeur nominale : mouvements, distances inefficaces au bord, tolérances $\Delta a_2$ et $\Delta a_3$ ;
- la règle de l’élément isolé : longueur nette augmentée pour les mouvements et les rotations (13.7.2), mais sans le supplément forfaitaire de 20 mm de 2004.

Elle ne donne plus ni les tableaux ni l’expression de combinaison : chaque terme est à justifier par l’ingénieur. Les distances d’ancrage des armatures dans l’appui ($d_i = c_{h,i} + \Delta a_i$, plus le rayon de cintrage pour des barres coudées) sont reprises de 2004.

## Pourquoi

Les valeurs tabulées de 2004 étaient des forfaits, utiles pour un bâtiment courant, mais sans fondement pour des cas qui s’en écartent. La deuxième génération ne garde que les principes : capacité portante, tolérances, épaufrures. Les valeurs relèvent alors de l’ingénieur, qui peut les tirer des normes de produit des éléments préfabriqués et des tolérances d’exécution du projet.

## Le calcul dans les deux générations

**Longueur nette** (10.9.5.2(1) ; 12.10(5), (7)) :

$$
a_1 = \frac{F_{Ed}}{b_1\,f_{Rd}}
$$

au moins le minimum du tableau 10.2 en 2004, saisi par l’ingénieur.

**Profondeur nominale, première génération** (10.6) :

$$
a = a_1 + a_2 + a_3 + \sqrt{\Delta a_2^2 + \Delta a_3^2}, \qquad \Delta a_3 = \frac{l_n}{2500}
$$

augmentée de 20 mm pour un élément isolé (10.9.5.3(1)). Les valeurs de $a_2$, $a_3$ et $\Delta a_2$ se lisent dans les tableaux 10.3 à 10.5 et se saisissent.

## L’exemple type : poutre préfabriquée sur corbeau

Poutre de 8 m, réaction de 400 kN sur un corbeau de 300 mm de large, en C40/50, posée sur un lit de mortier de résistance de calcul 15 MPa. Longueur nette prévue 150 mm, profondeur nominale 200 mm. Pour 2004, les valeurs sont lues dans les tableaux : 110 mm de longueur nette minimale pour un appui concentré avec $\sigma_{Ed}/f_{cd}$ entre 0,15 et 0,4 ; $a_2$ = 15 mm, $a_3$ = 15 mm, $\Delta a_2$ = 10 mm.

```exemple
{
  "nom": "corbeau",
  "mecanisme": "appui-prefabrique",
  "entree": { "FEd": 400, "b1": 300, "fck": 40, "joint": "lit", "fbed": 15, "a1Prevu": 150, "a1Min2004": 110, "a2": 15, "a3": 15, "deltaA2": 10, "ln": 8, "isole": "non", "aPrevu": 200 },
  "attendus": {
    "ec2-2004/nette.sollicitation": "110,0",
    "ec2-2023/nette.sollicitation": "88,9",
    "ec2-2004/nominale.sollicitation": "150,5",
    "ec2-2004/nominale.taux": "0,752"
  }
}
```

```exemple
{
  "nom": "corbeau-sec",
  "mecanisme": "appui-prefabrique",
  "entree": { "FEd": 400, "b1": 300, "fck": 40, "joint": "sec", "a1Prevu": 150, "a1Min2004": 110 },
  "attendus": {
    "ec2-2004/nette.sollicitation": "125,0",
    "ec2-2023/nette.sollicitation": "147,1",
    "ec2-2023/nette.taux": "0,980"
  }
}
```

Sur lit de mortier, la longueur nette calculée est la même dans les deux générations, {{corbeau:ec2-2023/nette.sollicitation}} mm, la résistance du mortier gouvernant. En 2004, le minimum tabulé la porte à {{corbeau:ec2-2004/nette.sollicitation}} mm. La profondeur nominale de 2004 vaut {{corbeau:ec2-2004/nominale.sollicitation}} mm (taux {{corbeau:ec2-2004/nominale.taux}}). En 2023, il faut la composer soi-même à partir des mêmes termes.

Sur **joint sec**, la longueur nette passe de {{corbeau-sec:ec2-2004/nette.sollicitation}} à {{corbeau-sec:ec2-2023/nette.sollicitation}} mm, en raison du coefficient $k_{tc}$ = 0,85 désormais inclus dans $f_{cd}$. Les 150 mm prévus ne laissent plus de marge : taux {{corbeau-sec:ec2-2023/nette.taux}}.

{{calculateur:corbeau}}

## L’effet sur une note de calcul existante

- La **longueur nette** sur joint sec augmente d’environ 18 % pour un béton de moins de 40 MPa ($1/0.85$).
- Les **valeurs minimales** et les distances inefficaces ne viennent plus de l’Eurocode 2 : la note doit citer leur source (norme de produit, tolérances du projet) ou les justifier.
- La **profondeur nominale** reste à composer avec les mêmes termes. L’expression de 2004 reste une méthode raisonnable, à présenter comme un choix de l’ingénieur.

## Ce qu’il faudra vérifier

- Les autres règles de 13.7.1 (armatures de fendage (13.14), voiles sur planchers (13.15), (13.16)) sont décrites, non codées.
- La limite $b_1 \le$ 600 mm de 2004 pour une pression non uniforme est laissée à l’ingénieur, qui saisit $b_1$.
