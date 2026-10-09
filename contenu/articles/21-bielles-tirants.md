---
titre: Bielles et nœuds
ordre: 21
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-05 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-05
revise: 2026-10-09
resume: La résistance d’une bielle fissurée ne dépend plus de la seule classe de béton mais de l’angle que fait la bielle avec le tirant qui la traverse ; les nœuds dont le tirant est ancré hors de la région nodale retrouvent toute la résistance du béton.
motscles: bielles-tirants, treillis, elu
historique:
  - 2026-10-05 : première rédaction.
  - 2026-10-05 : diffusion d’une force concentrée (6.5.3(3) ; 8.5.5).
  - 2026-10-09 : formule (8.124) relue sur le texte ; réserve retirée.
---

## Ce qui change

La première génération réduisait la résistance d’une bielle fissurée par un coefficient fonction de la seule résistance du béton, $0.6\,\nu'$ avec $\nu' = 1 - f_{ck}/250$, et celle des nœuds par trois coefficients fixes selon le nombre de tirants. La deuxième génération fait dépendre la réduction de l’**angle** $\theta_{cs}$ entre la bielle et le tirant qui la croise, et de la manière dont le tirant est **ancré** dans le nœud. La réduction liée à la classe de béton disparaît de cette clause : elle est portée par $f_{cd}$ lui-même, via $\eta_{cc}$.

## Pourquoi

Une bielle traversée par un tirant est fissurée parallèlement à sa direction et soumise à une traction transversale : sa résistance baisse d’autant plus que la déformation du tirant est grande. Or, à effort égal, la déformation transversale imposée à la bielle croît quand l’angle entre bielle et tirant diminue. La relation $\nu = 1/(1 + 110\,\varepsilon_1)$ traduit directement cet effet ; les paliers et la formule en $\cot^2\theta_{cs}$ en sont des simplifications pour une déformation de tirant correspondant à sa plastification.

Pour les nœuds, ce qui compte est la présence d’une traction dans la région nodale elle-même. Si le tirant est ancré au-delà du nœud (plaque, tête d’ancrage, boucle), le béton du nœud n’est que comprimé et sa résistance n’est pas réduite.

## Le calcul dans les deux générations

La contrainte dans la bielle se calcule sur sa section : $\sigma_{cd} = F_{cd}/(b_c\,t)$ (8.113).

| | 2004 (6.5.2, 6.5.4) | 2023 (8.5.2, 8.5.4) |
|---|---|---|
| Bielle sans traction transversale | $f_{cd}$ | $\nu$ = 1,0 |
| Bielle traversée par un tirant | $0.6\,\nu'\,f_{cd}$ | $\nu(\theta_{cs})\,f_{cd}$ |
| Nœud CCC | $1.0\,\nu'\,f_{cd}$ | $\nu$ = 1,0 |
| Nœud CCT | $0.85\,\nu'\,f_{cd}$ | $\nu(\theta_{cs})$ si ancré dans le nœud, 1,0 si ancré hors du nœud |
| Nœud CTT | $0.75\,\nu'\,f_{cd}$ | idem |

En 2023, $\nu(\theta_{cs})$ se lit par paliers, 0,40 de 20° à 30°, 0,55 jusqu’à 40°, 0,70 jusqu’à 60°, 0,85 au-delà (8.115 à 8.118), ou se calcule de façon continue :

$$
\nu = \frac{1}{1.11 + 0.22\,\cot^2\theta_{cs}} \quad (8.119), \qquad \nu = \frac{1}{1.0 + 110\,\varepsilon_1} \le 1.0 \quad (8.121)
$$

la seconde à partir de la déformation principale de traction $\varepsilon_1$ tirée d’une analyse de l’élément fissuré. Les angles inférieurs à 20° ne sont pas couverts. Pour un ancrage en partie dans le nœud, le texte prévoit une interpolation que le calculateur ne traite pas.

## L’exemple type : bielle d’une poutre-cloison

Bielle inclinée à 45° d’une poutre-cloison de 300 mm d’épaisseur, largeur 250 mm, effort 900 kN, C30/37, traversée par les armatures de répartition.

```exemple
{
  "nom": "bielle-fissuree",
  "mecanisme": "bielles",
  "entree": { "Fcd": 900, "bc": 250, "t": 300, "fck": 30, "element": "bielle-fissuree", "ancrage": "interieur", "theta": 45, "eps1": 0.002 },
  "attendus": {
    "ec2-2004/base.sollicitation": "12,00",
    "ec2-2004/base.ν'": "0,880",
    "ec2-2004/base.resistance": "10,56",
    "ec2-2004/base.taux": "1,137",
    "ec2-2023/paliers.resistance": "11,90",
    "ec2-2023/paliers.taux": "1,009",
    "ec2-2023/continu.ν": "0,752",
    "ec2-2023/continu.resistance": "12,78",
    "ec2-2023/continu.taux": "0,938",
    "ec2-2023/deformation.resistance": "13,93"
  }
}
```

La contrainte vaut {{bielle-fissuree:ec2-2004/base.sollicitation}} MPa.

**Première génération.** $\nu'$ = {{bielle-fissuree:ec2-2004/base.ν'}} : la limite est {{bielle-fissuree:ec2-2004/base.resistance}} MPa, dépassée (taux de travail {{bielle-fissuree:ec2-2004/base.taux}}).

**Deuxième génération.** Avec $f_{cd}$ = 17 MPa ($k_{tc}$ = 0,85), le palier de 40° à 60° donne {{bielle-fissuree:ec2-2023/paliers.resistance}} MPa (taux {{bielle-fissuree:ec2-2023/paliers.taux}}) ; la formule continue, $\nu$ = {{bielle-fissuree:ec2-2023/continu.ν}}, donne {{bielle-fissuree:ec2-2023/continu.resistance}} MPa et la bielle passe (taux {{bielle-fissuree:ec2-2023/continu.taux}}). Avec une déformation de tirant connue de 2 ‰, la limite monte à {{bielle-fissuree:ec2-2023/deformation.resistance}} MPa.

{{calculateur:bielle-fissuree}}

## Second exemple : nœud d’appui à tirant ancré hors du nœud

Nœud CCT au droit de l’appui de la même poutre-cloison, même effort, tirant ancré par des barres à tête au-delà de la plaque d’appui.

```exemple
{
  "nom": "noeud-cct",
  "mecanisme": "bielles",
  "entree": { "Fcd": 900, "bc": 250, "t": 300, "fck": 30, "element": "noeud-cct", "ancrage": "exterieur" },
  "attendus": {
    "ec2-2004/base.resistance": "14,96",
    "ec2-2004/base.taux": "0,802",
    "ec2-2023/paliers.resistance": "17,00",
    "ec2-2023/paliers.taux": "0,705"
  }
}
```

En 2004, le nœud CCT est limité à $0.85\,\nu'\,f_{cd}$ = {{noeud-cct:ec2-2004/base.resistance}} MPa, quel que soit l’ancrage. En 2023, le tirant ancré hors de la région nodale laisse au nœud toute la résistance $f_{cd}$ = {{noeud-cct:ec2-2023/paliers.resistance}} MPa (taux de travail {{noeud-cct:ec2-2023/paliers.taux}}).

{{calculateur:noeud-cct}}

## Diffusion d’une force concentrée

Une force concentrée $F_d$ appliquée sur une largeur $a$ s’étale dans l’élément et crée une traction transversale à reprendre par des armatures. Pour une diffusion limitée (largeur disponible $b$ au plus égale à $a + H/2$), les deux générations donnent le même effort, $F_d\,(1 - a/b)/4$ ((6.58) ; (8.123), (8.124)). Pour un élément large, la première génération réduisait l’effort selon le rapport $a/h$ (6.59) ; la deuxième retient $\tan\theta_{cf}$ = 0,5, soit $F_d/4$.

```exemple
{
  "nom": "diffusion-large",
  "mecanisme": "diffusion",
  "entree": { "Fd": 1000, "a": 200, "b": 1500, "H": 1200 },
  "attendus": {
    "ec2-2004/base.resistance": "191,7",
    "ec2-2023/base.resistance": "250,0"
  }
}
```

Pour une force de 1 000 kN sur 200 mm, dans un élément de 1 500 mm de large et une région de diffusion de 1 200 mm : {{diffusion-large:ec2-2004/base.resistance}} kN en 2004, {{diffusion-large:ec2-2023/base.resistance}} kN en 2023.

{{calculateur:diffusion-large}}

## L’effet sur une note de calcul existante

- Les **bielles fissurées** à angle moyen (40° à 60°) gagnent un peu de résistance relative ; les bielles plates (moins de 40°) en perdent : à 30°, $\nu$ tombe à 0,55 contre $0.6\,\nu'$ ≈ 0,53 auparavant, mais à 25° il tombe à 0,40.
- La note doit indiquer l’**angle** entre bielle et tirant et le **mode d’ancrage** des tirants dans les nœuds.
- Un tirant ancré hors du nœud (plaque, tête, boucle) devient un levier pour soulager les nœuds d’appui.

## Ce qu’il faudra vérifier dans l’annexe nationale

- D’éventuels choix nationaux sur $\nu$ ; en 2004, les coefficients $k_1$ à $k_4$ des nœuds étaient des paramètres nationaux.
