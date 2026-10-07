---
titre: Fondations en encuvement
ordre: 32
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: La profondeur minimale d’un encuvement à parois lisses ne vaut plus 1,2 fois le côté du poteau dans tous les cas ; elle croît avec l’excentricité de l’effort, jusqu’à 2 fois le côté. Le coefficient de frottement suit désormais la rugosité de la surface.
motscles: prefabrication, fondations
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Un poteau préfabriqué scellé dans un encuvement transmet son moment par deux réactions horizontales opposées sur les parois, $F_1$ en haut et $F_2$ en bas, et son effort normal par la base ($F_3$), avec les frottements associés. En 2004, ce modèle exigeait une profondeur de réservation d’au moins 1,2 fois le côté du poteau, quels que soient les efforts, et limitait le frottement à $\mu$ = 0,3.

En 2023 (13.8.3) :

- la **profondeur minimale** dépend de l’excentricité $M_{Ed}/N_{Ed}$ : 1,2 $h_{col}$ tant qu’elle ne dépasse pas 0,15 $h_{col}$, 2,0 $h_{col}$ au-delà de 2 $h_{col}$, avec une interpolation linéaire entre les deux ;
- le **coefficient de frottement** $\mu_v$ se lit dans le tableau 8.2 selon la rugosité de la surface, comme pour les interfaces ([article 07](cisaillement-interfaces.html)) ;
- la réaction haute $F_1$ se place à au moins 0,1 $l$ sous le bord de la réservation ;
- le cheminement des efforts vers la semelle se vérifie par bielles et tirants (8.5).

Pour les encuvements **à clés**, la règle est inchangée : le recouvrement entre les armatures du poteau et celles de l’encuvement est augmenté d’au moins la distance entre les barres en recouvrement.

## Pourquoi

Plus le moment domine, plus les réactions $F_1$ et $F_2$ grandissent, et plus leur bras de levier, lié à la profondeur de réservation, doit être grand pour les garder raisonnables. Un minimum unique de 1,2 $h$ convenait à un poteau surtout comprimé, mais laissait des réactions très fortes pour un poteau de portique encastré en pied.

## Le calcul dans les deux générations

**Première génération** (10.9.6.3(1)) : $l \ge 1.2\,h$.

**Deuxième génération** (13.8.3(2)) :

$$
\frac{l}{h_{col}} \ge 1.2 + 0.8\,\frac{M_{Ed}/(N_{Ed}\,h_{col}) - 0.15}{1.85}, \qquad \text{borné à } [1.2 \;;\; 2.0]
$$

avec $h_{col}$ le plus grand côté du poteau. Un effort normal nul ou de traction conduit à 2,0 $h_{col}$.

## L’exemple type : pied de poteau de portique

Poteau de 400 mm, moment de 200 kN·m sous 800 kN de compression en pied, réservation prévue de 600 mm.

```exemple
{
  "nom": "pied-portique",
  "mecanisme": "encuvement",
  "entree": { "hcol": 400, "MEd": 200, "NEd": 800, "lPrevu": 600 },
  "attendus": {
    "ec2-2004/base.sollicitation": "480",
    "ec2-2023/base.l / h_col": "1,405",
    "ec2-2023/base.sollicitation": "562,2",
    "ec2-2023/base.taux": "0,936"
  }
}
```

L’excentricité vaut 250 mm, soit 0,625 $h_{col}$. La profondeur minimale passe de {{pied-portique:ec2-2004/base.sollicitation}} mm en 2004 à {{pied-portique:ec2-2023/base.sollicitation}} mm en 2023, soit {{pied-portique:ec2-2023/base.l / h_col}} fois le côté du poteau. La réservation de 600 mm convient encore, avec un taux de {{pied-portique:ec2-2023/base.taux}}.

{{calculateur:pied-portique}}

## L’effet sur une note de calcul existante

- Les **poteaux surtout comprimés** (excentricité d’au plus 0,15 $h_{col}$) gardent 1,2 $h_{col}$.
- Les **poteaux de portique encastrés en pied** demandent une réservation plus profonde, jusqu’à 2 fois le côté pour un poteau fléchi peu comprimé, en particulier sous vent ou séisme.
- Le **frottement** ne se limite plus à un plafond unique de 0,3 : sa valeur se lit dans le tableau 8.2 selon la rugosité de la surface, qu’il faut alors spécifier.

## Ce qu’il faudra vérifier

- Les efforts $F_1$ à $F_3$ et la vérification des parois et de la semelle ne sont pas calculés par l’outil.
