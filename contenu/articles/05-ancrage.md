---
titre: Longueurs d’ancrage et de recouvrement
ordre: 5
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Une contrainte d’adhérence uniforme cède la place à une expression directe où la longueur croît plus vite que la contrainte ; ancrer une barre plastifiée coûte plus, une barre peu sollicitée moins.
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-04 : vérification sur le texte ; expression et bornes confirmées (11.4.2(3)), domaine étendu à 90 MPa.
---

## Ce qui change

La longueur d’ancrage n’est plus proportionnelle à la contrainte de la barre : elle croît comme sa puissance 3/2. Une barre plastifiée demande donc une longueur plus grande qu’en première génération, une barre peu sollicitée une longueur plus courte, et le recouvrement est affecté d’un coefficient unique.

## Pourquoi

La première génération suppose une contrainte d’adhérence uniforme $f_{bd}$ le long de l’ancrage : la longueur est alors proportionnelle à l’effort à transmettre, et des coefficients $\alpha_1$ à $\alpha_6$ corrigent la forme de l’ancrage, l’enrobage, le confinement et le recouvrement.

La deuxième génération reprend le travail de la *fib* sur l’adhérence, rassemblé pour le Model Code 2010 dans le bulletin 72. Les essais montrent que la contrainte d’adhérence moyenne **baisse** quand la longueur ancrée augmente : doubler la longueur ne double pas l’effort transmis. Inverser cette relation donne une longueur qui croît plus vite que la contrainte. Les autres paramètres entrent par des puissances fractionnaires : la résistance du béton à la puissance −1/2, le diamètre par un effet d’échelle, l’enrobage relatif à la puissance −1/2.

## Les niveaux d’approximation

Première génération (8.4.3, 8.4.4, 8.7.3) :

$$
l_{b,rqd} = \frac{\phi}{4}\,\frac{\sigma_{sd}}{f_{bd}}, \quad f_{bd} = 2.25\,\eta_1\,\eta_2\,f_{ctd}, \quad l_{bd} = \alpha_2\,l_{b,rqd} \ge l_{b,min}
$$

Deuxième génération (11.4.2, formule (11.3)) :

$$
l_{bd} = 50\,k_{cp}\,\phi\left(\frac{\sigma_{sd}}{435}\right)^{3/2}\left(\frac{25}{f_{ck}}\right)^{1/2}\left(\frac{\phi}{20}\right)^{1/3}\left(\frac{1.5\,\phi}{c_d}\right)^{1/2} \ge 10\,\phi
$$

L’expression est bornée : $\phi/20 \ge 0.6$, $25/f_{ck} \ge 0.3$ et $c_d \le 3.75\,\phi$. Le recouvrement vaut $l_0 = \alpha_6\,l_{bd}$ avec $\alpha_6$ = 1,5 en première génération quand toutes les barres sont recouvertes dans la même section, et $l_{sd} = k_{ls}\,l_{bd} \ge 15\,\phi$ avec $k_{ls}$ = 1,2 en deuxième génération. Pour un recouvrement, la distance libre $c_s$ à retenir dans $c_d$ est celle entre recouvrements voisins.

Dans les deux générations, le calculateur rend deux niveaux :

1. **barre plastifiée** : $\sigma_{sd} = f_{yd}$, l’hypothèse de la plupart des notes, qui dispense de connaître l’effort ;
2. **contrainte réelle** : $\sigma_{sd}$ saisie, issue du calcul de la section d’ancrage.

Le calculateur retient en première génération le seul coefficient d’enrobage $\alpha_2$ ; les coefficients de forme, de confinement et de pression transversale sont pris égaux à 1, ce qui va dans le sens de la sécurité. En deuxième génération, il retient $c_d$ et ignore le confinement par armatures transversales.

## L’exemple type : HA16 en travée de poutre

Barre HA16 en bonne condition d’adhérence, béton C25/30, acier B500, enrobages latéral et inférieur de 30 mm, 100 mm libres entre barres, soit $c_d$ = 30 mm. Longueur disponible 600 mm. La contrainte de calcul dans la barre à l’abscisse d’ancrage vaut 300 MPa.

```exemple
{
  "nom": "ancrage",
  "mecanisme": "ancrage",
  "entree": { "type": "ancrage", "phi": 16, "fck": 25, "fyk": 500, "sigmaSd": 300, "adherence": "bonne", "cs": 100, "cx": 30, "cy": 30, "lDispo": 600 },
  "attendus": {
    "ec2-2004/barre-plastifiee.f_bd": "2,69",
    "ec2-2004/barre-plastifiee.α_2": "0,869",
    "ec2-2004/barre-plastifiee.l_b,rqd": "646",
    "ec2-2004/barre-plastifiee.sollicitation": "561",
    "ec2-2004/barre-plastifiee.taux": "0,934",
    "ec2-2004/contrainte-reelle.sollicitation": "387",
    "ec2-2004/contrainte-reelle.taux": "0,645",
    "ec2-2023/barre-plastifiee.c_d": "30",
    "ec2-2023/barre-plastifiee.sollicitation": "664",
    "ec2-2023/barre-plastifiee.taux": "1,107",
    "ec2-2023/contrainte-reelle.sollicitation": "380",
    "ec2-2023/contrainte-reelle.taux": "0,634"
  }
}
```

| Longueur d’ancrage (mm) | 2004 | 2023 |
|---|---:|---:|
| Barre plastifiée | {{ancrage:ec2-2004/barre-plastifiee.sollicitation}} | {{ancrage:ec2-2023/barre-plastifiee.sollicitation}} |
| $\sigma_{sd}$ = 300 MPa | {{ancrage:ec2-2004/contrainte-reelle.sollicitation}} | {{ancrage:ec2-2023/contrainte-reelle.sollicitation}} |

En première génération, $f_{bd}$ = {{ancrage:ec2-2004/barre-plastifiee.f_bd}} MPa et $\alpha_2$ = {{ancrage:ec2-2004/barre-plastifiee.α_2}}, d’où $l_{b,rqd}$ = {{ancrage:ec2-2004/barre-plastifiee.l_b,rqd}} mm pour la barre plastifiée. Pour la barre plastifiée, la deuxième génération demande davantage : les 600 mm disponibles suffisent en 2004 (taux de travail {{ancrage:ec2-2004/barre-plastifiee.taux}}) mais plus en 2023 (taux de travail {{ancrage:ec2-2023/barre-plastifiee.taux}}). À 300 MPa, les deux longueurs se rejoignent et la deuxième génération devient légèrement plus courte. Le niveau à contrainte réelle, qui exige une donnée de plus, change la conclusion en 2023 : il vaut d’être calculé dès que la barre n’est pas plastifiée à l’ancrage.

{{calculateur:ancrage}}

Le balayage sur $\sigma_{sd}$ montre la droite de la première génération et la courbe de la deuxième, qui se croisent.

## Second exemple : recouvrement de la même barre

Toutes les barres sont recouvertes dans la même section ; les autres données sont inchangées.

```exemple
{
  "nom": "recouvrement",
  "mecanisme": "ancrage",
  "entree": { "type": "recouvrement", "phi": 16, "fck": 25, "fyk": 500, "sigmaSd": 300, "adherence": "bonne", "cs": 100, "cx": 30, "cy": 30, "lDispo": 600 },
  "attendus": {
    "ec2-2004/barre-plastifiee.sollicitation": "841",
    "ec2-2004/contrainte-reelle.sollicitation": "581",
    "ec2-2023/barre-plastifiee.sollicitation": "797",
    "ec2-2023/contrainte-reelle.sollicitation": "457"
  }
}
```

| Longueur de recouvrement (mm) | 2004 | 2023 |
|---|---:|---:|
| Barre plastifiée | {{recouvrement:ec2-2004/barre-plastifiee.sollicitation}} | {{recouvrement:ec2-2023/barre-plastifiee.sollicitation}} |
| $\sigma_{sd}$ = 300 MPa | {{recouvrement:ec2-2004/contrainte-reelle.sollicitation}} | {{recouvrement:ec2-2023/contrainte-reelle.sollicitation}} |

Le coefficient de recouvrement passe de 1,5 à 1,2 : même pour la barre plastifiée, le recouvrement de deuxième génération est ici plus court, alors que l’ancrage était plus long.

{{calculateur:recouvrement}}

## L’effet sur une note de calcul existante

- Les **tableaux de longueurs** d’ancrage et de recouvrement des bureaux d’études, établis pour une barre plastifiée, sont à refaire : l’écart dépend du diamètre, du béton et de l’enrobage, sans coefficient de passage simple.
- Calculer la **contrainte réelle** à l’ancrage devient plus intéressant qu’auparavant, puisque la longueur décroît plus vite que la contrainte.
- Le calculateur ne traite que le cas où toutes les barres sont recouvertes dans la même section ; les autres dispositions sont à relire dans chaque génération.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs de $k_{cp}$ selon les conditions d’adhérence.
- La valeur de $k_{ls}$.
- Les valeurs de $k_{lb}$ et de l’exposant de la contrainte, ainsi que le tableau simplifié de longueurs rapportées au diamètre pour une barre plastifiée.
