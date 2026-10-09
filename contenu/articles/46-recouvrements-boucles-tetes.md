---
titre: Recouvrements par boucles et par barres à tête
ordre: 46
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-09 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-09
revise: 2026-10-09
resume: Les joints coulés entre éléments préfabriqués, par boucles en U ou par barres à tête, reçoivent une vérification propre. Le béton entre les boucles ou les têtes est une bielle confinée, dont la résistance dépend fortement des armatures transversales qui la traversent.
motscles: recouvrement, prefabrication, dispositions-constructives
historique:
  - 2026-10-09 : première rédaction.
---

## Ce qui change

Les joints étroits entre éléments préfabriqués (prédalles, voiles, poutres) se font souvent par **boucles en U** qui s’imbriquent, ou par **barres à tête** qui se chevauchent, avec quelques barres transversales enfilées dans le joint. Le recouvrement est court : l’effort ne passe pas par adhérence le long des barres, mais par une bielle de béton comprimée entre deux boucles ou deux têtes.

- **2004** : aucune règle propre. Les boucles relevaient de 8.4 et 8.7 (ancrages et recouvrements par adhérence) ou d’un agrément, les barres à tête d’un agrément.
- **2023** : deux clauses donnent la résistance à l’écrasement du béton d’un recouvrement unique, sous la même forme.

Boucles en U (11.5.4), pour un espacement libre $c_s \le 0.5\,l_s$ :

$$
T_{Rd,c} = 0.2\,f_{cd}\,A_c\left(\frac{d_{dg}}{l_{sd}}\right)^{1/3}\left(\sqrt{k_{st} + \left(\frac{c_s}{l_{sd}}\right)^2} - \frac{c_s}{l_{sd}}\right), \qquad A_c = (\varphi_{mand} + \varphi)\,\left(l_s - 0.21\,(\varphi_{mand} + \varphi)\right)
$$

Barres à tête (11.5.5), avec $A_c = (l_{sd} - 2\,\varphi)\,b_{h1}$ et $b_{h1} = 0.5\,\varphi_h\sqrt{\pi}$ pour une tête circulaire :

$$
T_{Rd,c} = 0.6\,f_{cd}\,A_c\left(\frac{d_{dg}}{l_{sd} - 2\varphi}\right)^{1/3}\left(\sqrt{k_{st} + \left(\frac{c_s}{l_{sd} - 2\varphi}\right)^2} - \frac{c_s}{l_{sd} - 2\varphi}\right)
$$

Dans les deux cas, $k_{st}$ mesure le confinement par les armatures transversales $A_{st}$ qui traversent la zone $A_c$ : $k_{st}$ = 1 si $\omega \ge 0.5$, sinon $4\,\omega\,(1 - \omega)$, avec $\omega$ le rapport entre la force des armatures transversales et celle du béton de la bielle (11.15 ; 11.20). Un minimum d’armatures transversales est exigé contre une rupture fragile (11.16 ; 11.21). Les efforts comparés sont celui du brin le plus chargé d’une boucle, ou celui d’une barre à tête.

Pour plusieurs boucles ou têtes alternées, la résistance se multiplie par $(n_s - 1)$, avec l’espacement moyen. Le calculateur ne traite que le recouvrement unique.

## Pourquoi

Entre deux boucles imbriquées, l’effort passe d’une boucle à l’autre par une bielle inclinée dans le plan du joint. Elle s’appuie sur l’intérieur des courbures des deux boucles. Le béton de cette bielle ne résiste que s’il est confiné : sans barre transversale, $\omega$ = 0, $k_{st}$ = 0 et la résistance s’annule. Plus les boucles sont écartées ($c_s$), plus la bielle est inclinée et moins elle porte. Le terme $(d_{dg}/l_{sd})^{1/3}$ est l’effet d’échelle habituel de la deuxième génération : une bielle longue porte moins par unité de surface.

## L’exemple type : joint de prédalles par boucles

Joint coulé entre deux éléments de dalle, boucles HA12 sur mandrin de 160 mm, recouvrement de 300 mm, espacement libre de 50 mm entre boucles, 4 HA10 enfilés dans les boucles (314 mm²), C30/37, granulat 0/16. Chaque brin est plastifié : 49,2 kN.

```exemple
{
  "nom": "joint-boucles",
  "mecanisme": "recouvrement-boucle",
  "entree": { "phi": 12, "phiMand": 160, "lsd": 300, "cs": 50, "Ast": 314, "fck": 30, "fyk": 500, "Dlower": 16, "T": 49.2 },
  "attendus": {
    "ec2-2023/base.A_c": "45387",
    "ec2-2023/base.ω (11.15)": "0,439",
    "ec2-2023/base.k_st": "0,985",
    "ec2-2023/base.A_st,min (11.16)": "249",
    "ec2-2023/base.resistance": "61,5",
    "ec2-2023/base.taux": "0,800"
  }
}
```

La bielle a une aire de {{joint-boucles:ec2-2023/base.A_c}} mm². Les quatre HA10 donnent $\omega$ = {{joint-boucles:ec2-2023/base.ω (11.15)}}, d’où $k_{st}$ = {{joint-boucles:ec2-2023/base.k_st}}, presque le confinement complet. Le joint résiste à {{joint-boucles:ec2-2023/base.resistance}} kN par brin, taux {{joint-boucles:ec2-2023/base.taux}}. Le minimum d’armatures transversales vaut {{joint-boucles:ec2-2023/base.A_st,min (11.16)}} mm² : trois HA10 ne suffiraient pas.

Le mandrin compte beaucoup : la largeur de la bielle est $\varphi_{mand} + \varphi$. Sur le mandrin minimal de 4 φ (48 mm), l’aire et la résistance tombent à 40 % environ (23,5 kN par brin). Les joints par boucles demandent des boucles larges.

{{calculateur:joint-boucles}}

## Le même joint par barres à tête

HA12 à tête circulaire de 40 mm, même recouvrement de 300 mm et même espacement, 2 HA8 transversaux (100,5 mm²). Les barres travaillent à 300 MPa : 33,9 kN.

```exemple
{
  "nom": "joint-tetes",
  "mecanisme": "recouvrement-tete",
  "entree": { "phi": 12, "phiH": 40, "lsd": 300, "cs": 50, "Ast": 100.5, "fck": 30, "fyk": 500, "Dlower": 16, "T": 33.9 },
  "attendus": {
    "ec2-2023/base.b_h1": "35,4",
    "ec2-2023/base.A_c": "9784",
    "ec2-2023/base.k_st": "0,971",
    "ec2-2023/base.A_st,min (11.21)": "80,4",
    "ec2-2023/base.resistance": "39,9",
    "ec2-2023/base.taux": "0,848"
  }
}
```

La bielle entre deux têtes est étroite, $b_{h1}$ = {{joint-tetes:ec2-2023/base.b_h1}} mm, et son aire de {{joint-tetes:ec2-2023/base.A_c}} mm² est près de cinq fois plus faible que pour les boucles. Le coefficient 0,6 au lieu de 0,2 compense en partie : {{joint-tetes:ec2-2023/base.resistance}} kN, taux {{joint-tetes:ec2-2023/base.taux}} pour des barres à 300 MPa. Pour des barres plastifiées, il faudrait des têtes plus grandes ou un recouvrement multiple. La contrainte développée par chaque tête reste par ailleurs limitée par 11.4.7(2) (article sur les têtes d’ancrage).

{{calculateur:joint-tetes}}

## L’effet sur une note de calcul existante

- Les joints par boucles ou par têtes, justifiés jusqu’ici par agrément ou par essais, peuvent l’être par l’Eurocode 2.
- Les **armatures transversales** du joint ne sont plus seulement constructives : elles entrent dans la résistance par $k_{st}$, avec un minimum. Une note doit en donner la section et l’ancrage.
- Le **diamètre du mandrin** des boucles et la **taille des têtes** deviennent des paramètres de résistance.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\gamma_C$, qui entre par $f_{cd}$.
