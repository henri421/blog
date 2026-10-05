---
titre: Effort tranchant sans armature d’âme
ordre: 1
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS ; quatrième niveau tiré de l’annexe I (informative), I.8.3.1, formule relue sur l’exemplaire le 2026-10-05.
redige: 2026-10-04
revise: 2026-10-05
resume: Une expression empirique cède la place à un modèle de fissure critique ; la granulométrie entre dans le calcul, et un plancher de résistance gouverne souvent les dalles courantes.
motscles: effort-tranchant, elu, dalle, niveaux-approximation
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-04 : vérification sur le texte ; le niveau 3 n’est permis que si a_cs < 4 d (8.2.2(3)), second exemple réécrit.
  - 2026-10-05 : quatrième niveau (annexe I.8.3.1) ajouté avec sa réserve ; moment du second exemple ramené à 800 kN·m/m, l’ancienne valeur dépassant la capacité en flexion de la section.
---

## Ce qui change

La résistance des dalles et des poutres sans armature d’effort tranchant ne dépend plus d’un facteur d’échelle empirique, mais du rapport entre la rugosité de la fissure, fixée par les granulats, et une longueur caractéristique de l’élément. Une résistance minimale, fonction du rapport entre béton et acier, dispense souvent de tout autre calcul pour une dalle courante.

## Pourquoi

La première génération repose sur une expression de régression : une résistance proportionnelle à la racine cubique de $100\,\rho_l\,f_{ck}$, corrigée par un facteur d’échelle $k$ plafonné à 2. Elle reproduit bien les essais dont elle est issue, mais n’explique pas pourquoi la résistance baisse quand la hauteur croît.

La deuxième génération reprend la **théorie de la fissure critique** développée à l’EPFL par Muttoni, Fernández Ruiz et Cavagnis. Une fissure de flexion devient fissure d’effort tranchant ; l’effort transmis à travers elle dépend de son ouverture et de sa rugosité. L’ouverture croît avec la déformation de l’armature longitudinale et avec la distance sur laquelle cette déformation s’accumule ; la rugosité dépend de la taille des granulats. Le terme $d_{dg}/d$ résume cet équilibre, et la taille des granulats entre ainsi dans le calcul de l’effort tranchant.

Au-delà de $f_{ck}$ = 60 MPa, la fissure traverse les granulats au lieu de les contourner : sa rugosité diminue, ce que traduit la réduction de $d_{dg}$.

## Les niveaux d’approximation

La première génération offre une seule expression (6.2.2(1)) :

$$
V_{Rd,c} = \max\left(C_{Rd,c}\,k\,(100\,\rho_l\,f_{ck})^{1/3} \; ; \; v_{min}\right) b_w\,d
$$

La deuxième génération travaille en contrainte, $\tau_{Ed} = V_{Ed}/(b_w\,z)$ avec $z = 0.9\,d$, et en propose trois dans le corps du texte, puis un quatrième en annexe.

**Niveau 1 : résistance minimale** (8.2.1, formule (8.20)). Elle ne demande ni le ferraillage longitudinal ni le moment :

$$
\tau_{Rdc,min} = \frac{11}{\gamma_V}\sqrt{\frac{f_{ck}}{f_{yd}}\,\frac{d_{dg}}{d}}
$$

Si $\tau_{Ed}$ reste sous cette valeur, l’élément n’a pas besoin d’armature d’effort tranchant de calcul.

**Niveau 2 : hauteur utile comme longueur d’échelle** (8.2.2, formule (8.27)) :

$$
\tau_{Rd,c} = \frac{0.66}{\gamma_V}\left(100\,\rho_l\,f_{ck}\,\frac{d_{dg}}{d}\right)^{1/3} \ge \tau_{Rdc,min}
$$

**Niveau 3 : portée mécanique**. La hauteur utile est remplacée par $a_v$, tirée du rapport entre moment et effort tranchant dans la section (formules (8.29) et (8.30)) :

$$
a_v = \sqrt{\frac{a_{cs}\,d}{4}} \quad \text{avec} \quad a_{cs} = \left|\frac{M_{Ed}}{V_{Ed}}\right| \ge d
$$

Ce remplacement n’est permis que si $a_{cs} < 4\,d$ (8.2.2(3)). C’est exactement le domaine où $a_v$ reste inférieur à $d$ : près d’un appui ou d’une charge concentrée, le niveau 3 relève la résistance. Au-delà, le texte ferme la porte, et le calculateur affiche le niveau 3 non applicable avec ce motif. Le second exemple le montre.

**Niveau 4 : déformation de l’armature** (annexe I, I.8.3.1, formule (I.7)). L’annexe I est **informative** et vise l’**évaluation des structures existantes** ; son emploi dépend de l’annexe nationale, non publiée. Le calculateur affiche ce niveau avec cette réserve. Il remplace la longueur d’échelle par la déformation $\varepsilon_v$ de l’armature longitudinale tendue dans la section de contrôle :

$$
\tau_{Rd,c} = \frac{0.33}{\gamma_V}\,\frac{\gamma_{def}^{2/3}}{\gamma_V^{2}}\,\frac{\sqrt{f_{ck}}}{1 + 24\,\gamma_{def}\,\varepsilon_v\,d/d_{dg}}
$$

avec $\gamma_{def}$ = 1,33 (valeur recommandée), coefficient qui couvre l’incertitude sur le calcul de $\varepsilon_v$. C’est la forme la plus directe de la théorie de la fissure critique : $\varepsilon_v$ prend implicitement en compte la portée mécanique, l’effort normal et les autres effets que les niveaux 2 et 3 traitent par des longueurs. Le calculateur obtient $\varepsilon_v$ par l’équilibre de la section fissurée sous $M_{Ed}$, avec les hypothèses de 8.1.1 (parabole-rectangle sur $f_{cd}$, acier élastique parfaitement plastique), sans plancher $\tau_{Rdc,min}$, que la formule (I.7) ne mentionne pas. Pour les éléments linéaires de hauteur utile supérieure à 500 mm, l’annexe prévoit en outre un coefficient $k_{vd}$ sur la formule (8.27) (formule (I.8)), pas encore traité ici.

Le coefficient partiel $\gamma_V$ = 1,4 est propre à l’effort tranchant ; il remplace la combinaison de $\gamma_c$ et du coefficient 0,18 de la première génération.

## L’exemple type : dalle de logement

Dalle pleine de 22 cm portant dans un sens, béton C25/30, granulats 0/16, nappe inférieure HA12 tous les 15 cm ($A_{sl}$ = 754 mm²/m) ancrée sur l’appui, $d$ = 190 mm. Section à $d$ du nu d’appui : $V_{Ed}$ = 60 kN/m, moment concomitant $M_{Ed}$ = 15 kN·m/m.

```exemple
{
  "nom": "dalle",
  "mecanisme": "tranchant-sans-armature",
  "entree": { "VEd": 60, "MEd": 15, "bw": 1000, "d": 190, "Asl": 754, "fck": 25, "fyk": 500, "Dlower": 16 },
  "attendus": {
    "ec2-2004/base.k": "2",
    "ec2-2004/base.v_Rd,c": "0,516",
    "ec2-2004/base.v_min": "0,495",
    "ec2-2004/base.resistance": "97,98",
    "ec2-2004/base.taux": "0,612",
    "ec2-2023/tau-min.d_dg": "32",
    "ec2-2023/tau-min.τ_Ed": "0,351",
    "ec2-2023/tau-min.τ_Rdc,min": "0,773",
    "ec2-2023/tau-min.resistance": "132,22",
    "ec2-2023/tau-min.taux": "0,453",
    "ec2-2023/hauteur-utile.τ_Rd,c (8.27)": "0,559",
    "ec2-2023/hauteur-utile.resistance": "132,22",
    "ec2-2023/portee-mecanique.a_v": "109",
    "ec2-2023/portee-mecanique.τ_Rd,c (a_v)": "0,673",
    "ec2-2023/portee-mecanique.resistance": "132,22",
    "ec2-2023/annexe-i.ε_v": "0,580",
    "ec2-2023/annexe-i.τ_Rd,c (I.7)": "0,655",
    "ec2-2023/annexe-i.resistance": "112,04",
    "ec2-2023/annexe-i.taux": "0,535"
  }
}
```

**Première génération.** Pour $d$ = 190 mm, le facteur d’échelle vaut $k$ = {{dalle:ec2-2004/base.k}} (plafond atteint). L’expression principale donne {{dalle:ec2-2004/base.v_Rd,c}} MPa, au-dessus du minimum {{dalle:ec2-2004/base.v_min}} MPa : $V_{Rd,c}$ = {{dalle:ec2-2004/base.resistance}} kN/m, taux de travail {{dalle:ec2-2004/base.taux}}.

**Deuxième génération.** Avec des granulats 0/16, $d_{dg}$ = {{dalle:ec2-2023/tau-min.d_dg}} mm. La contrainte agissante vaut $\tau_{Ed}$ = {{dalle:ec2-2023/tau-min.τ_Ed}} MPa.

| Niveau | Contrainte calculée (MPa) | Résistance retenue (kN/m) |
|---|---:|---:|
| 1, résistance minimale | {{dalle:ec2-2023/tau-min.τ_Rdc,min}} | {{dalle:ec2-2023/tau-min.resistance}} |
| 2, longueur $d$ | {{dalle:ec2-2023/hauteur-utile.τ_Rd,c (8.27)}} | {{dalle:ec2-2023/hauteur-utile.resistance}} |
| 3, longueur $a_v$ = {{dalle:ec2-2023/portee-mecanique.a_v}} mm | {{dalle:ec2-2023/portee-mecanique.τ_Rd,c (a_v)}} | {{dalle:ec2-2023/portee-mecanique.resistance}} |
| 4, annexe I, $\varepsilon_v$ = {{dalle:ec2-2023/annexe-i.ε_v}} ‰ | {{dalle:ec2-2023/annexe-i.τ_Rd,c (I.7)}} | {{dalle:ec2-2023/annexe-i.resistance}} |

Les niveaux 2 et 3 rendent une contrainte inférieure au minimum du niveau 1, et c’est donc ce minimum qui s’applique aux trois. La résistance vaut {{dalle:ec2-2023/tau-min.resistance}} kN/m, pour un taux de travail de {{dalle:ec2-2023/tau-min.taux}}. Pour cette dalle faiblement armée, le niveau le plus simple donne déjà le résultat des deux autres : le moment concomitant et le ferraillage n’apportent rien.

Le niveau 4 rend une résistance **plus faible** que les trois autres ({{dalle:ec2-2023/annexe-i.resistance}} kN/m, taux de travail {{dalle:ec2-2023/annexe-i.taux}}) : la formule (I.7) ne connaît pas le plancher $\tau_{Rdc,min}$. Le niveau le plus exigeant en données n’est donc pas le plus favorable ; le calculateur le montre tel quel, et le choix du niveau reste celui de l’ingénieur, sous la réserve d’emploi de l’annexe I.

{{calculateur:dalle}}

## Second exemple : quand le raffinement n’est pas permis

Radier de 50 cm fortement armé, HA25 tous les 10 cm ($A_{sl}$ = 4909 mm²/m), $d$ = 450 mm, C30/37, granulats 0/16, dans une section éloignée de l’appui : $V_{Ed}$ = 400 kN/m et $M_{Ed}$ = 800 kN·m/m, proche de la capacité en flexion de la section.

```exemple
{
  "nom": "radier",
  "mecanisme": "tranchant-sans-armature",
  "entree": { "VEd": 400, "MEd": 800, "bw": 1000, "d": 450, "Asl": 4909, "fck": 30, "fyk": 500, "Dlower": 16 },
  "attendus": {
    "ec2-2004/base.resistance": "287,88",
    "ec2-2004/base.taux": "1,390",
    "ec2-2023/tau-min.τ_Rdc,min": "0,550",
    "ec2-2023/tau-min.resistance": "222,90",
    "ec2-2023/hauteur-utile.τ_Rd,c (8.27)": "0,625",
    "ec2-2023/hauteur-utile.resistance": "253,02",
    "ec2-2023/annexe-i.ε_v": "2,168",
    "ec2-2023/annexe-i.τ_Rd,c (I.7)": "0,404",
    "ec2-2023/annexe-i.resistance": "163,52"
  }
}
```

Ici $a_{cs} = M_{Ed}/V_{Ed}$ = 2000 mm dépasse $4\,d$ = 1800 mm : le niveau 3 n’est pas permis.

| Génération et niveau | Résistance (kN/m) |
|---|---:|
| 2004 | {{radier:ec2-2004/base.resistance}} |
| 2023, niveau 1 ($\tau_{Rdc,min}$ = {{radier:ec2-2023/tau-min.τ_Rdc,min}} MPa) | {{radier:ec2-2023/tau-min.resistance}} |
| 2023, niveau 2 ($\tau_{Rd,c}$ = {{radier:ec2-2023/hauteur-utile.τ_Rd,c (8.27)}} MPa) | {{radier:ec2-2023/hauteur-utile.resistance}} |
| 2023, niveau 3 | non applicable : $a_{cs} \ge 4\,d$ |
| 2023, niveau 4, sous réserve ($\varepsilon_v$ = {{radier:ec2-2023/annexe-i.ε_v}} ‰, $\tau_{Rd,c}$ = {{radier:ec2-2023/annexe-i.τ_Rd,c (I.7)}} MPa) | {{radier:ec2-2023/annexe-i.resistance}} |

Si le texte autorisait $a_v$ ici, il vaudrait 474 mm, plus que $d$, et rendrait une résistance plus faible que celle du niveau 2. La condition $a_{cs} < 4\,d$ écarte justement ce cas : dans le domaine où il est permis, le niveau 3 ne peut pas être moins favorable que le niveau 2. Le balayage du calculateur sur le moment le montre : le niveau 3 disparaît dès que $M_{Ed}/V_{Ed}$ atteint $4\,d$.

Près de la plastification de l’armature, la déformation $\varepsilon_v$ est grande et le niveau 4 tombe sous le plancher du niveau 1.

Dans les deux générations, cette section exige des armatures d’effort tranchant (taux de travail {{radier:ec2-2004/base.taux}} en 2004).

{{calculateur:radier}}

## L’effet sur une note de calcul existante

- La **granulométrie** devient une donnée d’entrée du calcul. Une note qui ne la mentionne pas ne peut pas être transposée telle quelle : il faut connaître la fraction la plus grosse prévue au cahier des charges du béton.
- Le **moment concomitant** devient utile, au niveau 3, alors que la première génération ne le demandait pas. Les extractions de logiciel par section devront fournir le couple $(M_{Ed}, V_{Ed})$.
- La vérification se fait en **contrainte** sur $b_w\,z$ et non en effort sur $b_w\,d$ : les valeurs intermédiaires d’une note de 2004 ne se comparent pas directement.
- Pour les dalles de bâtiment faiblement armées, la résistance minimale du niveau 1 peut suffire à conclure.
- Pour une **structure existante**, l’annexe I ouvre un quatrième niveau fondé sur la déformation de l’armature ; il demande un calcul de section sous $M_{Ed}$ et n’est pas nécessairement plus favorable.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\gamma_V$ (1,4 recommandé).
- L’emploi de l’annexe I et la valeur de $\gamma_{def}$ (1,33 recommandé).
- Les éventuelles conditions nationales sur l’emploi de $a_v$ en lieu et place de $d$.
- La limite inférieure de granulométrie : la norme ne couvre pas les bétons dont $D_{lower}$ est inférieur à 8 mm, que le calculateur refuse en deuxième génération.
- La définition de $D_{lower}$ retenue pour les granulats concassés ou recyclés.
