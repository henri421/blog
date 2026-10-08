---
titre: Compression avec flexion déviée
ordre: 38
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les critères de dispense et la formule d’interaction de la flexion déviée sont repris à l’identique ; seule change la résistance à l’effort normal qui fixe l’exposant, avec le nouveau fcd.
motscles: stabilite, flexion, elu
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Presque rien. Un poteau fléchi selon ses deux axes peut toujours être vérifié séparément dans chaque direction, sans vérification supplémentaire, si ses élancements et ses excentricités relatives restent dans les mêmes bornes ((5.38) ; (7.29), (7.30)) :

$$
0.5 \le \frac{\lambda_y}{\lambda_z} \le 2 \qquad \text{et} \qquad \frac{e'_y}{e'_z} \le 0.2 \ \text{ou} \ \ge 5, \qquad e'_z = \frac{M_{Edy}}{N_{Ed}\,b}, \quad e'_y = \frac{M_{Edz}}{N_{Ed}\,h}
$$

Sinon, le critère simplifié d’interaction garde la même forme ((5.39) ; (8.2)) :

$$
\left(\frac{|M_{Edz}|}{M_{Rdz}}\right)^{a} + \left(\frac{|M_{Edy}|}{M_{Rdy}}\right)^{a} \le 1
$$

avec, pour une section rectangulaire, $a$ = 1,0, 1,5 et 2,0 pour $N_{Ed}/N_{Rd}$ = 0,1, 0,7 et 1,0, interpolé linéairement. En 2023, cette formule passe du chapitre du second ordre (5.8.9) à celui de la flexion (8.1.1(8)). Elle précise aussi que $N_{Rd,0}$ se calcule avec la résistance du béton confiné $f_{cd,c}$ lorsque l’élément est fretté.

La différence vient du calcul de $N_{Rd} = A_c\,f_{cd} + A_s\,f_{yd}$ : avec le $f_{cd}$ de 2023, plus faible ([article 35](coefficients-partiels.html)), le rapport $N_{Ed}/N_{Rd}$ augmente, donc l’exposant aussi, ce qui est favorable. Les moments résistants $M_{Rd}$ baissent, ce qui est défavorable.

## Pourquoi

La surface d’interaction réelle d’une section rectangulaire est d’autant plus « bombée » que l’effort normal est élevé : l’exposant traduit cette forme. La formule n’a pas été modifiée ; seule la résistance du béton qui y entre a été redéfinie.

## L’exemple type : poteau d’angle

Poteau de 400 × 400 mm, 8 HA20, C30/37, élancement 40 dans les deux directions, 1500 kN de compression, moments de 120 et 90 kN·m second ordre compris. Les moments résistants à 1500 kN, à calculer par ailleurs, sont pris ici à titre d’exemple à 250 kN·m en 2004 et 235 kN·m en 2023.

```exemple
{
  "nom": "poteau-angle",
  "mecanisme": "flexion-deviee",
  "entree": { "b": 400, "h": 400, "lambdaY": 40, "lambdaZ": 40, "NEd": 1500, "MEdy": 90, "MEdz": 120, "fck": 30, "fyk": 500, "As": 2513, "MRdy2004": 250, "MRdz2004": 250, "MRdy2023": 235, "MRdz2023": 235 },
  "attendus": {
    "ec2-2004/interaction.a": "1,208",
    "ec2-2023/interaction.a": "1,245",
    "ec2-2004/interaction.sollicitation": "0,703",
    "ec2-2023/interaction.sollicitation": "0,736"
  }
}
```

Le rapport des excentricités vaut 1,33 : la dispense ne s’applique dans aucune des deux générations. L’exposant passe de {{poteau-angle:ec2-2004/interaction.a}} à {{poteau-angle:ec2-2023/interaction.a}}, ce qui compense en partie la baisse des moments résistants. La somme d’interaction passe de {{poteau-angle:ec2-2004/interaction.sollicitation}} à {{poteau-angle:ec2-2023/interaction.sollicitation}}.

{{calculateur:poteau-angle}}

## L’effet sur une note de calcul existante

- Les **critères de dispense** sont inchangés.
- Le **critère d’interaction** se recalcule avec les moments résistants et le $N_{Rd}$ de 2023. L’effet net dépend surtout de la baisse de $f_{cd}$ sur les moments résistants.
- Pour un **poteau fretté**, $N_{Rd,0}$ peut désormais intégrer le gain de résistance du béton confiné.
