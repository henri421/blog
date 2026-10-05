---
titre: Flèches par le rapport portée / hauteur utile
ordre: 17
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: La formule d’élancement limite cède la place à un tableau à deux entrées, pourcentage mécanique d’armature et part de charge d’exploitation, nettement plus sévère pour les dalles faiblement armées de logement.
motscles: fleche, els, dalle
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

L’élancement limite ne se calcule plus par une formule en fonction du pourcentage d’armature : il se lit dans un tableau qui croise le pourcentage **mécanique** d’armature et la part de la charge d’exploitation dans la charge totale. Pour une dalle de logement faiblement armée, la limite baisse fortement.

## Pourquoi

La flèche à long terme d’un élément en béton armé dépend surtout de deux choses : son degré de fissuration, lié au taux d’armature, et la part de la charge qui agit en permanence, donc qui flue. La formule de 2004 ne voyait que la première ; la part de charge permanente y était figée par hypothèse (une charge quasi permanente égale à la moitié de la charge de calcul).

Le tableau de 2023 rend les deux paramètres explicites. Une dalle de logement porte surtout son poids propre et ses finitions : sa charge d’exploitation ne représente qu’une petite part du total, et la part qui flue est grande. C’est exactement le cas où la règle de 2004 était la plus permissive, comme le montre l’article sur le calcul des flèches : la même dalle y dépasse $L$/250 dans les deux générations.

## Le calcul dans les deux générations

Première génération, pour $\rho \le \rho_0$ (7.16.a) :

$$
\frac{l}{d} = K\left[11 + 1.5\,\sqrt{f_{ck}}\,\frac{\rho_0}{\rho} + 3.2\,\sqrt{f_{ck}}\left(\frac{\rho_0}{\rho} - 1\right)^{3/2}\right], \quad \rho_0 = \sqrt{f_{ck}}\cdot 10^{-3}
$$

multiplié par $310/\sigma_s \approx 500\,A_{s,prov}/(f_{yk}\,A_{s,req})$ et, au-delà de 7 m avec des cloisons fragiles, par $7/l_{eff}$.

Deuxième génération : la limite se lit dans le tableau 9.3 en fonction de

$$
\omega_r = \frac{A_{s,req}}{b_w\,d}\,\frac{f_{yd}}{f_{cd}} \quad \text{et} \quad \frac{LL}{TL}
$$

puis se multiplie par $250/a$ pour une limite de flèche $l/a$ autre que $l$/250. Le tableau n’est pas reproduit ici : le calculateur en calcule les deux entrées et demande la valeur lue.

## L’exemple type : dalle de logement

La dalle de 20 cm sur 5 m de l’article sur les flèches : $d$ = 172 mm, 520 mm²/m requis, 565 mm²/m en place, C25/30. Charges : 5,6 kN/m permanents, 2,4 kN/m d’exploitation.

```exemple
{
  "nom": "dalle-ld",
  "mecanisme": "elancement",
  "entree": { "L": 5000, "b": 1000, "d": 172, "AsReq": 520, "AsProv": 565, "AsComp": 0, "fck": 25, "fyk": 500, "systeme": "isostatique", "cloisons": "non", "gk": 5.6, "qk": 2.4, "lSurDLu": 17, "rapport": 250 },
  "attendus": {
    "ec2-2004/base.sollicitation": "29,1",
    "ec2-2004/base.l/d (7.16)": "31,9",
    "ec2-2004/base.resistance": "34,6",
    "ec2-2004/base.taux": "0,839",
    "ec2-2023/base.ω_r (entrée du tableau 9.3)": "0,093",
    "ec2-2023/base.LL/TL (entrée du tableau 9.3)": "0,30",
    "ec2-2023/base.resistance": "17,0",
    "ec2-2023/base.taux": "1,710"
  }
}
```

L’élancement réel vaut $L/d$ = {{dalle-ld:ec2-2004/base.sollicitation}}.

**Première génération.** La formule donne {{dalle-ld:ec2-2004/base.l/d (7.16)}}, porté à {{dalle-ld:ec2-2004/base.resistance}} par le facteur d’acier : la dalle passe (taux de travail {{dalle-ld:ec2-2004/base.taux}}).

**Deuxième génération.** Avec $\omega_r$ = {{dalle-ld:ec2-2023/base.ω_r (entrée du tableau 9.3)}} et $LL/TL$ = {{dalle-ld:ec2-2023/base.LL/TL (entrée du tableau 9.3)}}, la ligne des travées sur appuis simples donne une limite de {{dalle-ld:ec2-2023/base.resistance}} (colonne $\omega_r$ = 0,1, conservatoire puisque l’élancement admis croît quand $\omega_r$ baisse). La dalle ne passe pas (taux de travail {{dalle-ld:ec2-2023/base.taux}}) : il faut soit l’épaissir, soit justifier la flèche par le calcul.

{{calculateur:dalle-ld}}

## L’effet sur une note de calcul existante

- Les **dalles de logement** dimensionnées par élancement en 2004 risquent de ne plus passer la règle simplifiée de 2023 ; le calcul explicite des flèches (9.3.3) devient souvent le chemin le plus court.
- La note doit fournir la **part de charge d’exploitation** et le **pourcentage mécanique** d’armature requis, au lieu du seul pourcentage géométrique.
- Les coefficients d’extrapolation pour les planchers-dalles et les dalles portant dans deux directions (9.21), (9.22) remplacent le choix de la portée de référence.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Le tableau 9.3 et la limite de flèche de référence, qui conditionnent toute la vérification.
