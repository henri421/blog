---
titre: Effort tranchant sans armature d’âme
ordre: 1
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS ; niveaux 4 et 5 tirés de l’annexe I (informative), I.8.3.1, formules (I.7) et (I.8) relues sur l’exemplaire le 2026-10-05.
redige: 2026-10-04
revise: 2026-10-05
resume: Une expression empirique cède la place à un modèle de fissure critique ; la granulométrie entre dans le calcul, et un plancher de résistance gouverne souvent les dalles courantes.
motscles: effort-tranchant, elu, dalle, niveaux-approximation
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-04 : vérification sur le texte ; le niveau 3 n’est permis que si a_cs < 4 d (8.2.2(3)), second exemple réécrit.
  - 2026-10-05 : quatrième niveau (annexe I.8.3.1) ajouté avec sa réserve ; moment du second exemple ramené à 800 kN·m/m, l’ancienne valeur dépassant la capacité en flexion de la section.
  - 2026-10-05 : cinquième niveau (coefficient k_vd, annexe I.8.3.1(3)) et troisième exemple, poutre existante de grande hauteur.
  - 2026-10-05 : effort normal (6.2.2(1) ; 8.2.2(4) et (5)), exemple de poutre comprimée.
---

## Ce qui change

La résistance des dalles et des poutres sans armature d’effort tranchant ne dépend plus d’un facteur d’échelle empirique, mais du rapport entre la rugosité de la fissure, fixée par les granulats, et une longueur caractéristique de l’élément. Une résistance minimale, fonction du rapport entre béton et acier, dispense souvent de tout autre calcul pour une dalle courante.

## Pourquoi

La première génération repose sur une expression de régression : une résistance proportionnelle à la racine cubique de $100\,\rho_l\,f_{ck}$, corrigée par un facteur d’échelle $k$ plafonné à 2. Elle reproduit bien les essais dont elle est issue, mais n’explique pas pourquoi la résistance baisse quand la hauteur croît.

La deuxième génération reprend la **théorie de la fissure critique** développée à l’EPFL par Muttoni, Fernández Ruiz et Cavagnis. Une fissure de flexion devient fissure d’effort tranchant ; l’effort transmis à travers elle dépend de son ouverture et de sa rugosité. L’ouverture croît avec la déformation de l’armature longitudinale et avec la distance sur laquelle cette déformation s’accumule ; la rugosité dépend de la taille des granulats. Le terme $d_{dg}/d$ résume cet équilibre, et la taille des granulats entre ainsi dans le calcul de l’effort tranchant.

Au-delà de $f_{ck}$ = 60 MPa, la fissure traverse les granulats au lieu de les contourner : sa rugosité diminue, ce que traduit la réduction de $d_{dg}$.

## Les niveaux d’approximation

La première génération offre une seule expression (6.2.2(1)), écrite ici sans effort normal (voir plus bas) :

$$
V_{Rd,c} = \max\left(C_{Rd,c}\,k\,(100\,\rho_l\,f_{ck})^{1/3} \; ; \; v_{min}\right) b_w\,d
$$

La deuxième génération travaille en contrainte, $\tau_{Ed} = V_{Ed}/(b_w\,z)$ avec $z = 0.9\,d$, et en propose trois dans le corps du texte, puis deux variantes en annexe.

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

avec $\gamma_{def}$ = 1,33 (valeur recommandée), coefficient qui couvre l’incertitude sur le calcul de $\varepsilon_v$. C’est la forme la plus directe de la théorie de la fissure critique : $\varepsilon_v$ prend implicitement en compte la portée mécanique, l’effort normal et les autres effets que les niveaux 2 et 3 traitent par des longueurs. Le calculateur obtient $\varepsilon_v$ par l’équilibre de la section fissurée sous $M_{Ed}$, avec les hypothèses de 8.1.1 (parabole-rectangle sur $f_{cd}$, acier élastique parfaitement plastique), sans plancher $\tau_{Rdc,min}$, que la formule (I.7) ne mentionne pas. **Niveau 5 : coefficient de hauteur** (annexe I, I.8.3.1(3), formule (I.8)). Pour les éléments linéaires de hauteur utile supérieure à 500 mm, l’annexe demande soit le niveau 4, soit la résistance du niveau 2 multipliée par

$$
k_{vd} = 1.35\left(100\,\rho_l\,\frac{d_{dg}}{d}\right)^{1/10} \le 1.0
$$

Même réserve que le niveau 4. Le calculateur applique $k_{vd}$ à la valeur de la formule (8.27) et conserve le plancher $\tau_{Rdc,min}$ ; il affiche le niveau non applicable si $d$ ne dépasse pas 500 mm. Le texte vise les éléments linéaires, ce que l’outil ne peut pas vérifier.

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

## L’effort normal

Les deux générations font intervenir l’effort normal concomitant $N_{Ed}$, mais de façon différente.

**Première génération** (6.2.2(1)) : la résistance reçoit un terme additif $k_1\,\sigma_{cp}\,b_w\,d$, avec $k_1$ = 0,15 et $\sigma_{cp} = N_{Ed}/A_c$ (compression positive), plafonnée à $0.2\,f_{cd}$. Une traction diminue la résistance du même terme.

**Deuxième génération**, première voie (8.2.2(4)) : l’effort normal modifie la longueur d’échelle. La hauteur utile $d$ de la formule (8.27), ou la portée $a_v$ de la formule (8.29), est multipliée par

$$
k_{vp} = 1 + \frac{N_{Ed}}{|V_{Ed}|}\,\frac{d}{3\,a_{cs}} \ge 0.1
$$

avec la convention de signe de la norme, traction positive (3.10). Une compression raccourcit la longueur d’échelle et relève la résistance ; une traction l’allonge.

**Deuxième génération**, seconde voie, en compression seulement (8.2.2(5)) : la résistance devient $\tau_{Rdc,0} - k_1\,\sigma_{cp}$, bornée inférieurement par $\tau_{Rdc,min}$ et supérieurement par $\tau_{Rdc,max}$ :

$$
k_1 = \frac{0.5\,a_{cs,0}}{e_p + d/3}\,\frac{A_c}{b_w\,d} \le 0.18\,\frac{A_c}{b_w\,d}, \qquad \tau_{Rdc,max} = 2.15\,\tau_{Rdc,0}\left(\frac{a_{cs,0}}{d}\right)^{1/6} \le 2.7\,\tau_{Rdc,0}
$$

$\tau_{Rdc,0}$ est la formule (8.27) sans plancher, $e_p$ l’excentricité de l’effort de compression (positive vers la face tendue). Le coefficient $k_1$ est donné en note, l’annexe nationale pouvant le modifier. Le calculateur traite un élément non précontraint : $a_{cs,0}$ est pris égal à $a_{cs}$, et $A_c = b_w\,h$.

Le niveau de l’annexe I n’est pas calculé quand un effort normal est saisi : l’outil ne détermine $\varepsilon_v$ que sous le moment seul.

## Exemple avec effort normal : poutre comprimée

Poutre de 300 × 500 mm, C30/37, granulats 0/16, 3 HA25 tendus ($A_{sl}$ = 1473 mm²), $d$ = 450 mm, sans étriers dans la zone vérifiée. Section : $V_{Ed}$ = 150 kN, $M_{Ed}$ = 120 kN·m, compression centrée $N_{Ed}$ = −600 kN ($e_p$ = 0).

```exemple
{
  "nom": "poutre-comprimee",
  "mecanisme": "tranchant-sans-armature",
  "entree": { "VEd": 150, "MEd": 120, "NEd": -600, "bw": 300, "d": 450, "h": 500, "ep": 0, "Asl": 1473, "fck": 30, "fyk": 500, "Dlower": 16 },
  "attendus": {
    "ec2-2004/base.resistance": "86,37",
    "ec2-2004/effort-normal.σ_cp": "4,00",
    "ec2-2004/effort-normal.resistance": "167,37",
    "ec2-2004/effort-normal.taux": "0,896",
    "ec2-2023/hauteur-utile.resistance": "75,91",
    "ec2-2023/kvp.k_vp": "0,250",
    "ec2-2023/kvp.resistance": "120,50",
    "ec2-2023/kvp-portee.resistance": "137,94",
    "ec2-2023/compression.k_1": "0,200",
    "ec2-2023/compression.τ_Rdc,max": "1,478",
    "ec2-2023/compression.τ_Rd,c": "1,425",
    "ec2-2023/compression.resistance": "173,11",
    "ec2-2023/compression.taux": "0,866"
  }
}
```

| Génération et niveau | Résistance (kN) |
|---|---:|
| 2004, sans effort normal | {{poutre-comprimee:ec2-2004/base.resistance}} |
| 2004, avec $k_1\,\sigma_{cp}$ ($\sigma_{cp}$ = {{poutre-comprimee:ec2-2004/effort-normal.σ_cp}} MPa) | {{poutre-comprimee:ec2-2004/effort-normal.resistance}} |
| 2023, niveau 2, sans effort normal | {{poutre-comprimee:ec2-2023/hauteur-utile.resistance}} |
| 2023, $d$ multiplié par $k_{vp}$ = {{poutre-comprimee:ec2-2023/kvp.k_vp}} | {{poutre-comprimee:ec2-2023/kvp.resistance}} |
| 2023, $a_v$ multiplié par $k_{vp}$ | {{poutre-comprimee:ec2-2023/kvp-portee.resistance}} |
| 2023, compression ($k_1$ = {{poutre-comprimee:ec2-2023/compression.k_1}}, $\tau_{Rd,c}$ = {{poutre-comprimee:ec2-2023/compression.τ_Rd,c}} MPa ≤ $\tau_{Rdc,max}$ = {{poutre-comprimee:ec2-2023/compression.τ_Rdc,max}} MPa) | {{poutre-comprimee:ec2-2023/compression.resistance}} |

La compression double la résistance dans les deux générations. En 2023, les deux voies ne donnent pas le même résultat : avec $k_{vp}$ = {{poutre-comprimee:ec2-2023/kvp.k_vp}}, la première voie relève la résistance de moitié environ, et la variante (8.32) rend la résistance la plus élevée ({{poutre-comprimee:ec2-2023/compression.resistance}} kN, taux de travail {{poutre-comprimee:ec2-2023/compression.taux}}), voisine de celle de 2004 (taux {{poutre-comprimee:ec2-2004/effort-normal.taux}}). Le calculateur affiche toutes les voies ; le choix appartient à l’ingénieur.

{{calculateur:poutre-comprimee}}

## Troisième exemple : poutre existante de grande hauteur

Poutre existante de 400 × 700 mm, sans étriers dans la zone vérifiée, C30/37, granulats 0/16, 4 HA25 tendus ($A_{sl}$ = 1963 mm²), $d$ = 650 mm. Section courante : $V_{Ed}$ = 100 kN et $M_{Ed}$ = 250 kN·m. C’est le cas que vise l’annexe I : $d$ dépasse 500 mm.

```exemple
{
  "nom": "poutre-existante",
  "mecanisme": "tranchant-sans-armature",
  "entree": { "VEd": 100, "MEd": 250, "bw": 400, "d": 650, "Asl": 1963, "fck": 30, "fyk": 500, "Dlower": 16 },
  "attendus": {
    "ec2-2023/tau-min.resistance": "107,16",
    "ec2-2023/hauteur-utile.τ_Rd,c (8.27)": "0,489",
    "ec2-2023/hauteur-utile.resistance": "114,39",
    "ec2-2023/portee-mecanique.a_v": "637",
    "ec2-2023/annexe-i.ε_v": "1,116",
    "ec2-2023/annexe-i.τ_Rd,c (I.7)": "0,462",
    "ec2-2023/annexe-i.resistance": "108,14",
    "ec2-2023/annexe-i-kvd.k_vd": "0,971",
    "ec2-2023/annexe-i-kvd.k_vd τ_Rd,c": "0,475",
    "ec2-2023/annexe-i-kvd.resistance": "111,11"
  }
}
```

| Génération et niveau | Résistance (kN) |
|---|---:|
| 2023, niveau 1 | {{poutre-existante:ec2-2023/tau-min.resistance}} |
| 2023, niveau 2 ($\tau_{Rd,c}$ = {{poutre-existante:ec2-2023/hauteur-utile.τ_Rd,c (8.27)}} MPa) | {{poutre-existante:ec2-2023/hauteur-utile.resistance}} |
| 2023, niveau 4, sous réserve ($\varepsilon_v$ = {{poutre-existante:ec2-2023/annexe-i.ε_v}} ‰, $\tau_{Rd,c}$ = {{poutre-existante:ec2-2023/annexe-i.τ_Rd,c (I.7)}} MPa) | {{poutre-existante:ec2-2023/annexe-i.resistance}} |
| 2023, niveau 5, sous réserve ($k_{vd}$ = {{poutre-existante:ec2-2023/annexe-i-kvd.k_vd}}, {{poutre-existante:ec2-2023/annexe-i-kvd.k_vd τ_Rd,c}} MPa) | {{poutre-existante:ec2-2023/annexe-i-kvd.resistance}} |

Pour cette poutre existante, l’annexe I remplace le niveau 2 par le niveau 4 ou le niveau 5 : la réduction est de quelques pour cent, et les deux variantes encadrent le plancher du niveau 1. Le niveau 3 ($a_v$ = {{poutre-existante:ec2-2023/portee-mecanique.a_v}} mm, à peine inférieur à $d$) reste ouvert pour une structure neuve.

{{calculateur:poutre-existante}}

## L’effet sur une note de calcul existante

- La **granulométrie** devient une donnée d’entrée du calcul. Une note qui ne la mentionne pas ne peut pas être transposée telle quelle : il faut connaître la fraction la plus grosse prévue au cahier des charges du béton.
- L’**effort normal** n’entre plus seulement comme un terme additif : il modifie la longueur d’échelle ($k_{vp}$) ou, en compression, suit une variante bornée. La note doit indiquer la convention de signe, inversée par rapport à 2004.
- Le **moment concomitant** devient utile, au niveau 3, alors que la première génération ne le demandait pas. Les extractions de logiciel par section devront fournir le couple $(M_{Ed}, V_{Ed})$.
- La vérification se fait en **contrainte** sur $b_w\,z$ et non en effort sur $b_w\,d$ : les valeurs intermédiaires d’une note de 2004 ne se comparent pas directement.
- Pour les dalles de bâtiment faiblement armées, la résistance minimale du niveau 1 peut suffire à conclure.
- Pour une **structure existante**, l’annexe I ouvre un quatrième niveau fondé sur la déformation de l’armature ; il demande un calcul de section sous $M_{Ed}$ et n’est pas nécessairement plus favorable.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\gamma_V$ (1,4 recommandé).
- La valeur de $k_1$ de la formule (8.34), donnée en note.
- L’emploi de l’annexe I, la valeur de $\gamma_{def}$ (1,33 recommandé) et celle du coefficient $k_{vd}$.
- Les éventuelles conditions nationales sur l’emploi de $a_v$ en lieu et place de $d$.
- La limite inférieure de granulométrie : la norme ne couvre pas les bétons dont $D_{lower}$ est inférieur à 8 mm, que le calculateur refuse en deuxième génération.
- La définition de $D_{lower}$ retenue pour les granulats concassés ou recyclés.
