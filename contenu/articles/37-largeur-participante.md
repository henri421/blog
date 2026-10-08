---
titre: Largeur participante des tables de compression
ordre: 37
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: L’expression de la largeur participante ne change pas, mais elle ne s’impose plus à tous les états limites ; à l’ELU, elle ne sert que si un comportement fragile est à craindre, et la table entière peut sinon être prise en compte.
motscles: analyse-structurale, flexion, poutre
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Dans une poutre en T, la table comprimée ne travaille pas uniformément : les contraintes décroissent en s’éloignant de l’âme. C’est le traînage de cisaillement. Les deux générations le représentent par une largeur participante, de même expression ((5.7) ; (7.11), (7.12)) :

$$
b_{eff} = b_{eff,1} + b_{eff,2} + b_w \le b, \qquad b_{eff,i} = \min\left(0.2\,b_i + 0.1\,l_0 \;;\; 0.2\,l_0 \;;\; b_i\right)
$$

avec $l_0$ la distance entre points de moment nul, lue sur la figure 5.2 ou 7.2, sous les mêmes conditions : charge à peu près uniforme, section constante, console de moins de la moitié de la travée voisine, rapport des portées entre 2/3 et 1,5.

Ce qui change, c’est le **domaine d’emploi**. En 2004, la largeur participante valait pour tous les états limites (5.3.2.1). En 2023 (7.2.3(1)), il faut en tenir compte :

- à l’**ELU**, seulement lorsqu’un comportement fragile peut être attendu ;
- à l’**ELS**, le cas échéant : limites de contrainte, flèches.

À l’ELU d’une section ductile, la table entière peut donc être retenue.

## Pourquoi

Le texte ne donne pas de motif ; l’explication usuelle est la suivante. Le traînage de cisaillement est un effet élastique. À la ruine d’une section ductile, l’acier plastifie et le béton de la table se plastifie à son tour au-delà de la zone proche de l’âme : les contraintes se redistribuent sur toute la largeur. La réduction n’a donc de sens à l’ELU que si cette redistribution ne peut pas se produire, par exemple dans une section fragile.

## L’exemple type : poutre en T de rive

Âme de 300 mm, poutres espacées de 3 m, débords de 1350 mm de chaque côté, travée de rive de 8 m ($l_0$ = 0,85 × 8 = 6,8 m).

```exemple
{
  "nom": "poutre-t",
  "mecanisme": "largeur-participante",
  "entree": { "bw": 300, "b1": 1350, "b2": 1350, "l0": 6800 },
  "attendus": {
    "ec2-2004/reduite.b_eff,1": "950",
    "ec2-2004/reduite.resistance": "2200",
    "ec2-2023/reduite.resistance": "2200",
    "ec2-2023/elu-ductile.resistance": "3000"
  }
}
```

Chaque débord contribue pour {{poutre-t:ec2-2004/reduite.b_eff,1}} mm. La largeur participante vaut {{poutre-t:ec2-2004/reduite.resistance}} mm dans les deux générations, pour l’ELS et pour l’ELU d’une section fragile. Pour la flexion ductile à l’ELU, la deuxième génération permet de retenir les {{poutre-t:ec2-2023/elu-ductile.resistance}} mm de la table entière. L’écart sur le bras de levier est faible tant que l’axe neutre reste dans la table, ce qui est le cas courant.

{{calculateur:poutre-t}}

## L’effet sur une note de calcul existante

- **ELS** (flèches, contraintes, fissuration) : rien ne change.
- **ELU en flexion** de sections ductiles : la largeur entière est admise ; l’écart de résistance est en général faible.
- **Effort tranchant âme-table**, ancrage des armatures de table : la répartition des efforts dans la table reste à justifier par ailleurs ([article 08](ame-table.html)).

## Ce qu’il faudra vérifier

- Les valeurs de $l_0$ de la figure 7.2 n’ont pas pu être comparées à celles de la figure 5.2 : la figure n’est pas extractible. Le calculateur demande $l_0$.
