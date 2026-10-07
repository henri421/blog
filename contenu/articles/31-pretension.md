---
titre: Transmission et ancrage de la précontrainte par pré-tension
ordre: 31
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: La contrainte d’adhérence de 2004 disparaît au profit d’une expression directe en racine de fck. Pour un toron courant, la longueur de transmission change peu ; l’ancrage à l’ELU raccourcit un peu, sauf sous fatigue, où son complément au-delà de la transmission augmente de moitié.
motscles: precontrainte, prefabrication, ancrage
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Dans un élément précontraint par pré-tension, l’effort des armatures passe au béton par adhérence, sur la **longueur de transmission** $l_{pt}$ à partir de l’about. À l’ELU, une armature plus tendue s’ancre sur une **longueur d’ancrage** $l_{bpd}$ plus grande.

En 2004, ces longueurs se déduisaient d’une contrainte d’adhérence uniforme $f_{bpt}$ ou $f_{bpd}$, proportionnelle à la résistance en traction du béton. En 2023, elles s’écrivent directement en fonction de $\sqrt{f_{ck}}$, sans contrainte d’adhérence intermédiaire, à la manière de l’ancrage des barres (11.4.2). Les coefficients de forme changent de valeur en conséquence, et un coefficient $\alpha_3$ = 1,5 apparaît pour l’ancrage des éléments soumis à la fatigue.

Ne changent pas : le coefficient de relâchement (1,0 progressif, 1,25 brutal), le coefficient d’adhérence $\eta_1$ (1,0 ou 0,7), les valeurs de calcul $l_{pt1}$ = 0,8 $l_{pt}$ et $l_{pt2}$ = 1,2 $l_{pt}$, et la longueur de régularisation $l_{disp} = \sqrt{l_{pt}^2 + d^2}$.

## Pourquoi

La deuxième génération écrit toutes les longueurs d’adhérence sous la même forme, en $\sqrt{f_{ck}}$, pour les barres (11.4.2) comme pour les armatures pré-tendues. Elle supprime l’étape intermédiaire de la contrainte d’adhérence, qui variait comme $f_{ck}^{2/3}$ en 2004. Le coefficient $\alpha_3$ majore l’ancrage des éléments vérifiés à la fatigue, ce que la première génération ne faisait pas.

## Le calcul dans les deux générations

**Première génération** (8.10.2) :

$$
l_{pt} = \frac{\alpha_1\,\alpha_2\,\varphi\,\sigma_{pm0}}{f_{bpt}}, \quad f_{bpt} = \eta_{p1}\,\eta_1\,f_{ctd}(t), \qquad l_{bpd} = l_{pt2} + \frac{\alpha_2\,\varphi\,(\sigma_{pd} - \sigma_{pm\infty})}{f_{bpd}}, \quad f_{bpd} = \eta_{p2}\,\eta_1\,f_{ctd}
$$

avec $\alpha_2$ = 0,19 (torons) ou 0,25 (fils), $\eta_{p1}$ = 3,2 ou 2,7, $\eta_{p2}$ = 1,2 ou 1,4.

**Deuxième génération** (13.4), (13.9), avec $\gamma_C$ = 1,5 :

$$
l_{pt} = \frac{\alpha_1\,\alpha_2\,\sigma_{pm0}\,\varphi_p}{\eta_1\,\sqrt{f_{ck}(t)}}, \qquad l_{bpd} = l_{pt2} + \frac{2\,\alpha_2\,\alpha_3\,(\sigma_{pd} - \sigma_{pm\infty})\,\varphi_p}{\eta_1\,\sqrt{f_{ck}}}
$$

avec $\alpha_2$ = 0,26 (torons à 3 ou 7 fils) ou 0,40 (fils crantés), $\alpha_3$ = 1,5 si la fatigue est à vérifier.

Le calculateur demande la résistance au relâchement $f_{ck}(t)$. En 2004, il en déduit $\beta_{cc}(t) = f_{cm}(t)/f_{cm}$ puis $f_{ctm}(t)$.

## L’exemple type : poutre précontrainte par torons T15,7

Torons de 15,7 mm tendus à 1200 MPa après relâchement progressif, béton C45/55 relâché à 30 MPa, poutre de 400 mm de hauteur. À l’ELU, la contrainte à ancrer est de 1400 MPa, pour 1000 MPa après pertes, avec 2000 mm disponibles depuis l’about.

```exemple
{
  "nom": "toron-t157",
  "mecanisme": "pretension",
  "entree": { "armature": "toron", "phiP": 15.7, "sigmaPm0": 1200, "relachement": "progressif", "adherence": "bonne", "fck": 45, "fckt": 30, "d": 400, "sigmaPd": 1400, "sigmaPmInf": 1000, "fatigue": "non", "lDispo": 2000 },
  "attendus": {
    "ec2-2004/transmission.l_pt": "880,9",
    "ec2-2023/transmission.l_pt": "894,3",
    "ec2-2004/transmission.sollicitation": "1057,0",
    "ec2-2023/transmission.sollicitation": "1073,2",
    "ec2-2004/ancrage.sollicitation": "1618,4",
    "ec2-2023/ancrage.sollicitation": "1560,0"
  }
}
```

```exemple
{
  "nom": "toron-fatigue",
  "mecanisme": "pretension",
  "entree": { "armature": "toron", "phiP": 15.7, "sigmaPm0": 1200, "relachement": "progressif", "adherence": "bonne", "fck": 45, "fckt": 30, "d": 400, "sigmaPd": 1400, "sigmaPmInf": 1000, "fatigue": "oui", "lDispo": 2000 },
  "attendus": {
    "ec2-2023/ancrage.sollicitation": "1803,4"
  }
}
```

| Longueur (mm) | 2004 | 2023 |
|---|---:|---:|
| Transmission $l_{pt}$ | {{toron-t157:ec2-2004/transmission.l_pt}} | {{toron-t157:ec2-2023/transmission.l_pt}} |
| Transmission à l’ELU $l_{pt2}$ | {{toron-t157:ec2-2004/transmission.sollicitation}} | {{toron-t157:ec2-2023/transmission.sollicitation}} |
| Ancrage $l_{bpd}$ | {{toron-t157:ec2-2004/ancrage.sollicitation}} | {{toron-t157:ec2-2023/ancrage.sollicitation}} |
| Ancrage sous fatigue | — | {{toron-fatigue:ec2-2023/ancrage.sollicitation}} |

Les deux générations se rejoignent presque pour la transmission. L’ancrage raccourcit d’environ 60 mm. Sous fatigue, il passe à {{toron-fatigue:ec2-2023/ancrage.sollicitation}} mm, soit 11 % de plus qu’en 2004.

{{calculateur:toron-t157}}

## L’effet sur une note de calcul existante

- Les **longueurs de transmission** des torons courants changent peu. Les vérifications de contraintes à l’about, qui utilisent $l_{pt1}$, restent valables à quelques pour cent près.
- Les **éléments soumis à la fatigue** (poutres de ponts, de ponts roulants) voient leur longueur d’ancrage augmenter nettement.
- Pour les **fils crantés**, le rapport des coefficients diffère de celui des torons : refaire le calcul.

## Ce qu’il faudra vérifier

- La formule (13.5), qui estime $f_{ck}(t)$ à partir de $\beta_{cc}(t)$, se lit $[\beta_{cc}(t)]^{2/3} f_{ck}$ à l’extraction. Le calculateur ne l’emploie pas et demande $f_{ck}(t)$ directement.
- L’enrobage minimal des armatures pré-tendues (tableau 13.1) et la résistance à l’effort tranchant par la contrainte principale (13.5.5) ne sont pas traités.
