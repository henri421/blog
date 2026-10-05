---
titre: Torsion
ordre: 15
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Le modèle de section creuse équivalente demeure ; l’angle des bielles peut se redresser au-delà de 45°, la résistance des bielles prend une valeur forfaitaire nouvelle, et les sections trapues à fort enrobage sont réduites.
motscles: torsion, treillis, elu
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

Le calcul reste celui d’une section creuse équivalente, armée de cadres et de barres longitudinales. Trois choses changent : l’angle des bielles peut descendre sous 45° ($\cot\theta$ jusqu’à 0,4), le coefficient de résistance des bielles devient forfaitaire (0,60 à 45°, 0,4 sinon, faute de calcul des déformations), et une section trapue à fort enrobage est réduite pour tenir compte de l’éclatement possible de l’enrobage.

## Pourquoi

Une section pleine en torsion se comporte comme un tube : le flux de cisaillement circule près des parements, et le cœur ne porte presque rien. Les deux générations remplacent donc la section par un tube d’épaisseur $t_{ef}$, armé de cadres fermés et de barres longitudinales, et retiennent un treillis spatial dont les bielles s’inclinent d’un angle $\theta$.

Le choix de $\theta$ équilibre cadres et barres longitudinales : coucher les bielles soulage les barres longitudinales et charge les cadres, les redresser fait l’inverse. La deuxième génération ouvre la plage dans les deux sens, ce qui permet d’exploiter un ferraillage longitudinal abondant.

Dans un tube tordu, l’enrobage extérieur peut éclater sous la poussée des bielles qui contournent les angles. Pour une section presque carrée avec un enrobage épais, la deuxième génération retire cette part de béton du calcul.

## Le calcul dans les deux générations

Avec $A_k$ et $u_k$ l’aire et le périmètre au feuillet moyen :

$$
T_{Rd} = \min\left(\frac{2\,A_k\,A_{sw}\,f_{ywd}\,\cot\theta}{s} \; ; \; \frac{2\,A_k\,\Sigma A_{sl}\,f_{yd}}{u_k\,\cot\theta} \; ; \; \frac{2\,A_k\,t_{ef}\,\nu\,f_{cd}}{\cot\theta + \tan\theta}\right)
$$

| | Plage de $\cot\theta$ | $\nu$ |
|---|---|---|
| 2004 (6.3.2) | 1 à 2,5 | $0.6\,(1 - f_{ck}/250)$ |
| 2023, niveau 1 (8.3.4(3)) | 1 | 0,60 |
| 2023, niveau 2 (8.3.4(4), annexe G) | 0,4 à 2,5 | 0,4, ou calculé selon les déformations |

En 2023, si le rapport des côtés est inférieur à 1,5 et l’enrobage des cadres supérieur à 0,07 fois le petit côté, la section est réduite en ramenant cet enrobage à 0,07 $b_{min}$ (8.3.4(5)).

## L’exemple type : poutre de rive

Poutre de rive 30 × 50 cm reprenant la torsion d’une dalle en console, C30/37, cadres fermés HA10 tous les 15 cm, 6 HA12 longitudinaux répartis, axe des barres à 45 mm du parement ; $T_{Ed}$ = 30 kN·m.

```exemple
{
  "nom": "poutre-rive",
  "mecanisme": "torsion",
  "entree": { "TEd": 30, "b": 300, "h": 500, "a": 45, "c": 30, "Asw": 78.54, "s": 150, "Asl": 679, "fck": 30, "fyk": 500 },
  "attendus": {
    "ec2-2004/base.t_ef": "94",
    "ec2-2004/base.cot θ": "1,03",
    "ec2-2004/base.resistance": "39,25",
    "ec2-2004/base.taux": "0,764",
    "ec2-2023/cot-1.resistance": "38,15",
    "ec2-2023/cot-1.taux": "0,786",
    "ec2-2023/cot-variable.resistance": "39,25",
    "ec2-2023/cot-variable.taux": "0,764"
  }
}
```

L’optimum s’établit à $\cot\theta$ = {{poutre-rive:ec2-2004/base.cot θ}}, là où cadres et barres longitudinales s’équilibrent ; les bielles ne gouvernent pas. Les deux générations y donnent la même résistance, {{poutre-rive:ec2-2004/base.resistance}} kN·m (taux de travail {{poutre-rive:ec2-2004/base.taux}}). Le niveau forfaitaire de 2023, à 45°, donne {{poutre-rive:ec2-2023/cot-1.resistance}} kN·m.

{{calculateur:poutre-rive}}

## Second exemple : poteau carré à fort enrobage

Section de 40 × 40 cm, enrobage des cadres 40 mm, 8 HA12 longitudinaux, $T_{Ed}$ = 40 kN·m.

```exemple
{
  "nom": "carree",
  "mecanisme": "torsion",
  "entree": { "TEd": 40, "b": 400, "h": 400, "a": 50, "c": 40, "Asw": 78.54, "s": 150, "Asl": 904, "fck": 30, "fyk": 500 },
  "attendus": {
    "ec2-2004/base.resistance": "49,15",
    "ec2-2004/base.taux": "0,813",
    "ec2-2023/cot-1.resistance": "36,21",
    "ec2-2023/cot-1.taux": "1,105",
    "ec2-2023/cot-variable.resistance": "44,8",
    "ec2-2023/cot-variable.taux": "0,892"
  }
}
```

La section est trapue et l’enrobage dépasse 0,07 × 400 = 28 mm : en 2023, elle est réduite à 376 × 376 mm. La résistance passe de {{carree:ec2-2004/base.resistance}} kN·m en 2004 à {{carree:ec2-2023/cot-variable.resistance}} kN·m au niveau 2 de 2023 ; le niveau forfaitaire, {{carree:ec2-2023/cot-1.resistance}} kN·m, ne suffit plus (taux de travail {{carree:ec2-2023/cot-1.taux}}).

{{calculateur:carree}}

## L’effet sur une note de calcul existante

- Les sections **trapues à fort enrobage** (poteaux, poutres carrées, enrobages de durabilité ou de feu) perdent de la résistance en torsion par la réduction de section.
- En vérification combinée avec l’effort tranchant, chaque paroi se calcule avec un angle unique, commun aux deux sollicitations (6.3.2(2) ; 8.3.5(2)).
- La vérification combinée torsion, flexion et effort tranchant peut se faire par une formule d’interaction linéaire (8.3.6), plus simple que les conditions de 2004.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs de $\nu$ et la plage de $\cot\theta$, liées à celles de l’effort tranchant.
