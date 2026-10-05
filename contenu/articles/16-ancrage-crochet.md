---
titre: Ancrage par coude ou crochet
ordre: 16
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Le crochet ne réduit plus la longueur par un coefficient soumis à une condition d’enrobage, mais par une longueur fixe de quinze diamètres ; l’écart est le plus fort dans les abouts de poutre à enrobage courant.
motscles: ancrage, dispositions-constructives
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

En 2004, un coude ou un crochet ne réduisait la longueur d’ancrage que si l’enrobage dépassait trois diamètres, par un coefficient de 0,7. En 2023, il retranche quinze diamètres à la longueur d’ancrage droite, quel que soit l’enrobage, avec un minimum de dix diamètres.

## Pourquoi

Un crochet transmet une partie de l’effort par la pression de sa courbure sur le béton, ce qui soulage la partie droite de l’ancrage. Cette pression tend à faire éclater le béton dans le plan du crochet : la première génération ne comptait le gain que si l’enrobage était assez épais pour la reprendre, d’où la condition $c_d > 3\,\phi$.

La deuxième génération traite la courbure comme équivalente à une longueur droite fixe, quinze diamètres, et laisse l’effet de l’enrobage à l’expression de la longueur droite elle-même, qui contient déjà le terme $(1.5\,\phi/c_d)^{1/2}$. Le crochet garde donc son intérêt avec un enrobage courant.

## Le calcul dans les deux générations

$$
l_{bd} = \alpha_1\,\alpha_2\,l_{b,rqd} \ge l_{b,min}, \quad \alpha_1 = 0.7 \text{ si } c_d > 3\,\phi, \quad \alpha_2 = 1 - 0.15\,\frac{c_d - 3\,\phi}{\phi} \in [0.7 \; ; \; 1] \quad (2004)
$$

$$
l_{bd} = l_{bd,droit} - 15\,\phi \ge 10\,\phi \quad (2023)
$$

avec $c_d = \min(a/2 ; c_1)$ en 2004 (figure 8.3 b)) et $c_d = \min(c_s/2 ; c_x ; c_y ; c_{yb})$ en 2023 (figure 11.6 c)).

## L’exemple type : about de poutre

Barre HA16 terminée par un crochet sur appui d’extrémité, C25/30, enrobages de 30 mm, 100 mm entre barres ; 450 mm disponibles.

```exemple
{
  "nom": "about",
  "mecanisme": "ancrage-crochet",
  "entree": { "phi": 16, "fck": 25, "fyk": 500, "sigmaSd": 300, "adherence": "bonne", "cs": 100, "cx": 30, "cy": 30, "lDispo": 450 },
  "attendus": {
    "ec2-2004/barre-plastifiee.sollicitation": "646",
    "ec2-2004/barre-plastifiee.taux": "1,435",
    "ec2-2004/contrainte-reelle.sollicitation": "446",
    "ec2-2023/barre-plastifiee.l_bd (barre droite)": "664",
    "ec2-2023/barre-plastifiee.sollicitation": "424",
    "ec2-2023/barre-plastifiee.taux": "0,941",
    "ec2-2023/contrainte-reelle.sollicitation": "160"
  }
}
```

| Longueur d’ancrage (mm) | 2004 | 2023 |
|---|---:|---:|
| Barre plastifiée | {{about:ec2-2004/barre-plastifiee.sollicitation}} | {{about:ec2-2023/barre-plastifiee.sollicitation}} |
| $\sigma_{sd}$ = 300 MPa | {{about:ec2-2004/contrainte-reelle.sollicitation}} | {{about:ec2-2023/contrainte-reelle.sollicitation}} |

Avec 30 mm d’enrobage, le crochet ne rapporte rien en 2004 : la longueur reste celle de la barre droite, {{about:ec2-2004/barre-plastifiee.sollicitation}} mm, et les 450 mm disponibles ne suffisent pas pour une barre plastifiée (taux de travail {{about:ec2-2004/barre-plastifiee.taux}}). En 2023, la longueur droite de {{about:ec2-2023/barre-plastifiee.l_bd (barre droite)}} mm est réduite de 240 mm : {{about:ec2-2023/barre-plastifiee.sollicitation}} mm suffisent (taux de travail {{about:ec2-2023/barre-plastifiee.taux}}).

{{calculateur:about}}

Le balayage sur l’enrobage montre la marche de 2004 à $c_d = 3\,\phi$ et la courbe continue de 2023.

## L’effet sur une note de calcul existante

- Les **abouts de poutre** et les appuis d’extrémité de dalle, où l’enrobage est courant, bénéficient pleinement du crochet en 2023.
- Pour les barres peu sollicitées, le **plancher de dix diamètres** gouverne vite : la contrainte réelle vaut d’être calculée.
- Le diamètre de mandrin et la longueur droite après la courbure (11.3 ; figure 11.6) restent à respecter pour que la réduction s’applique.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La réduction de quinze diamètres et le minimum de dix, s’ils sont modifiés.
