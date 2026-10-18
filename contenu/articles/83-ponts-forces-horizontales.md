---
titre: Ponts routiers, forces horizontales et groupes de charges
ordre: 83
statut: publie
texte: EN 1991-2:2023 (NBN, version française), 6.4 et 6.5, formules (6.5) et (6.6), tableaux 6.4 à 6.6 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-2:2003 (4.4, 4.5) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les forces de freinage, d’accélération et centrifuges, ainsi que les groupes de charges de trafic, sont repris de 2003 sans changement de valeur ; seule la présentation est alignée sur l’EN 1990, annexe A.2.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

Sur le fond, rien.

**Freinage et accélération (6.4.1).**

$$
Q_{Lk} = 0.6\,\alpha_{Q1}\,(2\,Q_{1k}) + 0.10\,\alpha_{q1}\,q_{1k}\,w_1\,L, \qquad 180\,\alpha_{Q1} \le Q_{Lk} \le 900\ \text{kN} \qquad \text{(6.5)}
$$

soit 360 + 2,7 $L$ kN pour une voie de 3 m et des coefficients égaux à 1. L’accélération a la même intensité, en sens contraire. Sur un joint de dilatation ou un élément chargé par un seul essieu, $Q_{Lk} = 0.6\,\alpha_{Q1}\,Q_{1k}$ (6.6). La note rappelle que le plafond de 900 kN couvre le freinage des véhicules militaires (accords STANAG).

**Force centrifuge (6.4.2, tableau 6.4).** $Q_{tk} = 0.2\,Q_v$ pour un rayon inférieur à 200 m, $40\,Q_v/r$ jusqu’à 1500 m, nulle au-delà ; freinage en biais : 25 % de la force longitudinale.

**Groupes de charges (6.5).** Les groupes gr1a à gr5 (tableau 6.5) restent mutuellement exclusifs ; leurs coefficients ψ sont dans l’EN 1990, A.2 (article 61). En situation transitoire, les tandems peuvent être réduits à 0,8 $\alpha_{Qi}\,Q_{ik}$.

## Pourquoi

Ces valeurs, calibrées en 2003, n’ont pas été remises en cause par la révision, centrée sur la cohérence avec l’EN 1990 et sur le rail.

## L’exemple type : point fixe d’un viaduc de 60 m

Tablier de 60 m, voie de 3 m, coefficients égaux à 1.

```exemple
{
  "nom": "freinage-60m",
  "mecanisme": "freinage",
  "entree": { "L": 60, "r": 500, "Qv": 1200 },
  "attendus": {
    "en1991-2-2003/freinage.sollicitation": "522",
    "en1991-2-2023/freinage.sollicitation": "522",
    "en1991-2-2023/centrifuge.sollicitation": "96"
  }
}
```

Le point fixe reprend {{freinage-60m:en1991-2-2023/freinage.sollicitation}} kN de freinage, dans les deux générations. Si le tablier est courbe (rayon 500 m, tandems totalisant 1200 kN), la force centrifuge vaut {{freinage-60m:en1991-2-2023/centrifuge.sollicitation}} kN.

{{calculateur:freinage-60m}}

## L’effet sur une note de calcul existante

- Aucun sur les valeurs.

## Ce qu’il faudra vérifier dans l’annexe nationale

- $Q_{Lk,max}$, les forces horizontales associées à LM3, la force transversale minimale, le tableau 6.5.
