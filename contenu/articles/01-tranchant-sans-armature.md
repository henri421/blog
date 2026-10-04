---
titre: Effort tranchant sans armature d’âme
ordre: 1
statut: brouillon
texte: EN 1992-1-1:2023 sans amendement ni corrigendum pris en compte ; état d’amendement à vérifier auprès de l’ILNAS avant publication.
redige: 2026-10-04
revise: 2026-10-04
resume: Une expression empirique cède la place à un modèle de fissure critique ; la granulométrie entre dans le calcul, et un plancher de résistance gouverne souvent les dalles courantes.
historique:
  - 2026-10-04 : première rédaction.
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

La deuxième génération travaille en contrainte, $\tau_{Ed} = V_{Ed}/(b_w\,z)$ avec $z = 0.9\,d$, et en propose trois.

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

Près d’un appui, $a_{cs}$ est petit, $a_v$ est inférieur à $d$ et la résistance augmente. Loin de l’appui, quand $a_{cs}$ dépasse $4\,d$, $a_v$ devient supérieur à $d$ : le niveau 3 rend alors une résistance **plus faible** que le niveau 2. Le second exemple le montre.

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
    "ec2-2023/portee-mecanique.resistance": "132,22"
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

Les niveaux 2 et 3 rendent une contrainte inférieure au minimum du niveau 1, et c’est donc ce minimum qui s’applique aux trois. La résistance vaut {{dalle:ec2-2023/tau-min.resistance}} kN/m, pour un taux de travail de {{dalle:ec2-2023/tau-min.taux}}. Pour cette dalle faiblement armée, le niveau le plus simple donne déjà le résultat des deux autres : le moment concomitant et le ferraillage n’apportent rien.

{{calculateur:dalle}}

## Second exemple : quand affiner coûte

Radier de 50 cm fortement armé, HA25 tous les 10 cm ($A_{sl}$ = 4909 mm²/m), $d$ = 450 mm, C30/37, granulats 0/16, dans une section éloignée de l’appui : $V_{Ed}$ = 400 kN/m et $M_{Ed}$ = 1000 kN·m/m.

```exemple
{
  "nom": "radier",
  "mecanisme": "tranchant-sans-armature",
  "entree": { "VEd": 400, "MEd": 1000, "bw": 1000, "d": 450, "Asl": 4909, "fck": 30, "fyk": 500, "Dlower": 16 },
  "attendus": {
    "ec2-2004/base.resistance": "287,88",
    "ec2-2004/base.taux": "1,390",
    "ec2-2023/tau-min.τ_Rdc,min": "0,550",
    "ec2-2023/tau-min.resistance": "222,90",
    "ec2-2023/hauteur-utile.τ_Rd,c (8.27)": "0,625",
    "ec2-2023/hauteur-utile.resistance": "253,02",
    "ec2-2023/portee-mecanique.a_cs": "2500",
    "ec2-2023/portee-mecanique.a_v": "530",
    "ec2-2023/portee-mecanique.τ_Rd,c (a_v)": "0,591",
    "ec2-2023/portee-mecanique.resistance": "239,54"
  }
}
```

Ici $a_{cs}$ = {{radier:ec2-2023/portee-mecanique.a_cs}} mm dépasse $4\,d$ = 1800 mm, et la portée mécanique vaut $a_v$ = {{radier:ec2-2023/portee-mecanique.a_v}} mm, plus que $d$.

| Génération et niveau | Résistance (kN/m) |
|---|---:|
| 2004 | {{radier:ec2-2004/base.resistance}} |
| 2023, niveau 1 ($\tau_{Rdc,min}$ = {{radier:ec2-2023/tau-min.τ_Rdc,min}} MPa) | {{radier:ec2-2023/tau-min.resistance}} |
| 2023, niveau 2 ($\tau_{Rd,c}$ = {{radier:ec2-2023/hauteur-utile.τ_Rd,c (8.27)}} MPa) | {{radier:ec2-2023/hauteur-utile.resistance}} |
| 2023, niveau 3 ($\tau_{Rd,c}$ = {{radier:ec2-2023/portee-mecanique.τ_Rd,c (a_v)}} MPa) | {{radier:ec2-2023/portee-mecanique.resistance}} |

Le niveau 3, qui exige une donnée de plus, rend une résistance inférieure à celle du niveau 2. Le calculateur l’affiche tel quel : il ne retient pas silencieusement le niveau le plus favorable. Savoir si le niveau 2 reste utilisable quand le niveau 3 est moins favorable est une question de lecture du texte ; elle figure dans la liste des points à vérifier du projet.

Dans les deux générations, cette section exige des armatures d’effort tranchant (taux de travail {{radier:ec2-2004/base.taux}} en 2004).

{{calculateur:radier}}

## L’effet sur une note de calcul existante

- La **granulométrie** devient une donnée d’entrée du calcul. Une note qui ne la mentionne pas ne peut pas être transposée telle quelle : il faut connaître la fraction la plus grosse prévue au cahier des charges du béton.
- Le **moment concomitant** devient utile, au niveau 3, alors que la première génération ne le demandait pas. Les extractions de logiciel par section devront fournir le couple $(M_{Ed}, V_{Ed})$.
- La vérification se fait en **contrainte** sur $b_w\,z$ et non en effort sur $b_w\,d$ : les valeurs intermédiaires d’une note de 2004 ne se comparent pas directement.
- Pour les dalles de bâtiment faiblement armées, la résistance minimale du niveau 1 peut suffire à conclure.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\gamma_V$ (1,4 recommandé).
- Les éventuelles conditions nationales sur l’emploi de $a_v$ en lieu et place de $d$.
- La définition de $D_{lower}$ retenue pour les granulats concassés ou recyclés.
