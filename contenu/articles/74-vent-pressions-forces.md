---
titre: Vent, pressions, forces et pression intérieure
ordre: 74
statut: publie
texte: EN 1991-1-4:2026 (NBN, version française), article 7, formules (7.1) à (7.6), annexes B (dont B.6, (B.16) à (B.21), tableau B.18), C et D lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-4:2005 (NF EN, novembre 2005) : 5, 7.2.9 (figure 7.13 lue sur la page rendue) et 7.9.1 lus sur le texte le 2026-10-19, A1:2010 et AC:2010 non détenus ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: Les coefficients aérodynamiques passent dans des annexes normatives et s’enrichissent de coefficients globaux pour les bâtiments. La pression intérieure due à des ouvertures permanentes se calcule désormais par une formule, et non plus sur une figure.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : 1re génération relue sur le texte de 2005 ; figure 7.13 codée, exemple complété.
---

## Ce qui change

**Pressions et forces (7).** Les principes ne changent pas : pression extérieure $p_e = q_p(z_e)\,c_{pe}$ (7.2), intérieure $p_i = q_p(z_i)\,c_{pi}$ (7.3), force sur une surface $F_p = (p_e - p_i)\,A$ (7.4), pression nette $p_{net} = q_p\,c_{p,net}$ pour les auvents et murs isolés (7.5), forces par coefficients de force (annexe D) ou de frottement.

**Coefficients aérodynamiques.** Ils quittent le corps du texte pour trois annexes **normatives** : B (bâtiments et autres structures, pressions extérieures et intérieures), C (pressions nettes : toitures isolées, auvents, balcons, murs isolés, panneaux), D (forces et frottement : éléments linéaires, sphères, treillis, drapeaux, ponts). Beaucoup de formes nouvelles s’y ajoutent. Pour les bâtiments, des **coefficients globaux** $c_{peg}$ complètent les coefficients locaux $c_{pe,1}$ et $c_{pe,10}$, pour le chargement d’ensemble.

**Pression intérieure (B.6).** Par défaut (perméabilité de fond ou ouvertures régulièrement réparties), $c_{pi}$ prend la plus défavorable des valeurs +0,2 et −0,3 ; en 2005, ces valeurs ne servaient que si le rapport d’ouvertures ne pouvait pas être évalué (7.2.9(6), NOTE 2). Face dominante : $c_{pi}$ = 0,75 ou 0,90 $c_{pe}$ selon le rapport des ouvertures, comme en 2005 ((7.1), (7.2)). Nouveau : pour des ouvertures permanentes sans face dominante, au lieu de lire $c_{pi}$ sur une figure en fonction du rapport d’ouvertures $\mu$ (aire des ouvertures en dépression sur aire totale) et de l’élancement $h/d$ du bâtiment (figure 7.13 de 2005),

$$
c_{pi} = \frac{A_p^2\,c_{pe,p} + A_n^2\,c_{pe,n}}{A_p^2 + A_n^2} \qquad \text{(B.18)}
$$

où $A_p$ et $A_n$ sont les aires d’ouvertures des faces en pression et en dépression. Des perméabilités types sont données (tableau B.18), ainsi que $c_{pi}$ = ±0,4 pour les cloisons intérieures et −0,6 pour les silos ouverts et cheminées (valeur déjà présente en 2005, (7.4)).

**Nombre de Reynolds (7.1).** La formule $Re = b\,v/\nu$ précise s’il faut prendre la vitesse moyenne ou de pointe, avec $\nu$ = 15 × 10⁻⁶ m²/s ; en 2005, (7.15) ne visait que les cylindres et prenait la vitesse de pointe.

## Pourquoi

La formule (B.18) traduit la conservation du débit à travers les ouvertures : la pression intérieure s’équilibre entre les faces en pression et en dépression, pondérées par le carré des aires. Elle remplace une lecture graphique imprécise.

## L’exemple type : toiture d’un hall avec ouvertures permanentes

Hall bas ($h/d$ = 0,2) à ouvertures permanentes : 4 m² sur la façade au vent ($c_{pe}$ = +0,8), 6 m² sur les autres façades ($c_{pe}$ = −0,5). Toiture en zone courante, $c_{pe}$ = −1,2, $q_p$ = 700 Pa.

```exemple
{
  "nom": "hall-ouvert",
  "mecanisme": "pression-interieure",
  "entree": { "qp": 700, "cpe": -1.2, "Ap": 4, "An": 6, "cpep": 0.8, "cpen": -0.5, "hd": 0.2 },
  "attendus": {
    "en1991-1-4-2005/defaut.sollicitation": "980",
    "en1991-1-4-2005/ouvertures.c_pi": "0,04",
    "en1991-1-4-2005/ouvertures.sollicitation": "869",
    "en1991-1-4-2026/ouvertures.c_pi": "-0,10",
    "en1991-1-4-2026/ouvertures.sollicitation": "770"
  }
}
```

Avec la valeur par défaut, la toiture subit {{hall-ouvert:en1991-1-4-2005/defaut.sollicitation}} Pa d’arrachement. En 2005, les ouvertures étant connues, il fallait lire la figure 7.13 : $\mu$ = 0,6, $c_{pi}$ = {{hall-ouvert:en1991-1-4-2005/ouvertures.c_pi}} et {{hall-ouvert:en1991-1-4-2005/ouvertures.sollicitation}} Pa. En 2026, la formule (B.18) donne $c_{pi}$ = {{hall-ouvert:en1991-1-4-2026/ouvertures.c_pi}} et la pression nette tombe à {{hall-ouvert:en1991-1-4-2026/ouvertures.sollicitation}} Pa. Les deux règles ne pondèrent pas les ouvertures de la même façon : la figure de 2005 ne retient que la part des ouvertures en dépression, la formule de 2026 aussi les $c_{pe}$ de chaque face.

{{calculateur:hall-ouvert}}

## L’effet sur une note de calcul existante

- Les coefficients $c_{pe}$ se lisent dans l’annexe B ; de nombreuses valeurs ont été revues, il faut les reprendre avec la nouvelle $q_p$ (article 53).
- Les bâtiments à ouvertures permanentes bénéficient d’une règle explicite.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les éventuels choix nationaux des annexes B à D et la viscosité de l’air.
