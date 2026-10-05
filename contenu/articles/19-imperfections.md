---
titre: Imperfections géométriques
ordre: 19
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-05 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-05
revise: 2026-10-05
resume: L’inclinaison de calcul garde sa forme, mais sa réduction avec la hauteur descend plus bas ; les forces horizontales équivalentes sur les contreventements des bâtiments hauts baissent nettement.
motscles: analyse-structurale, stabilite, elu
historique:
  - 2026-10-05 : première rédaction.
---

## Ce qui change

L’imperfection d’aplomb se calcule toujours par une inclinaison de base de 1/200, réduite selon la hauteur et selon le nombre d’éléments. La réduction en hauteur peut maintenant descendre jusqu’à 0,4, contre 2/3 auparavant : pour un bâtiment de plus de 9 m, l’inclinaison retenue pour le contreventement diminue, jusqu’à 40 % au-delà de 25 m. La valeur de base n’est plus un paramètre national. Deux dispositions apparaissent : l’imperfection en forme de mode de flambement et la majoration de 1,2 quand des tolérances plus strictes sont spécifiées.

## Pourquoi

L’inclinaison de 1/200 représente le défaut d’aplomb d’un élément d’un étage. Sur une grande hauteur, les défauts des étages successifs ne s’additionnent pas tous dans le même sens : le défaut moyen de l’ensemble est plus faible, d’où le coefficient $\alpha_h$ décroissant avec la hauteur. De même, plusieurs poteaux qui contribuent au même effet n’ont pas tous le même défaut, d’où $\alpha_m$. La première génération plafonnait la réduction en hauteur à 2/3 ; la deuxième laisse la loi en $2/\sqrt{l}$ porter jusqu’à 0,4, ce qui correspond à $l$ = 25 m.

## Le calcul dans les deux générations

Dans les deux générations (5.1 ; 7.1 à 7.3), avec $l$ en mètres :

$$
\theta_i = \theta_0\,\alpha_h\,\alpha_m, \quad \alpha_h = \frac{2}{\sqrt{l}}, \quad \alpha_m = \sqrt{0.5\left(1 + \frac{1}{m}\right)}
$$

avec $\theta_0$ = 1/200 et $\alpha_h$ borné à $[2/3 ; 1]$ en 2004, à $[0.4 ; 1]$ en 2023. $l$ et $m$ dépendent de l’effet étudié : longueur de l’élément et $m$ = 1 pour un élément isolé ; hauteur du bâtiment et nombre d’éléments verticaux pour le contreventement ; hauteur d’étage pour un diaphragme.

L’effet se représente par une force transversale équivalente, identique dans les deux textes : $\theta_i\,N$ pour un élément non contreventé et $2\,\theta_i\,N$ pour un élément contreventé ; $\theta_i\,(N_b - N_a)$ pour le contreventement ; $\theta_i\,(N_a + N_b)/2$ pour un diaphragme intermédiaire et $\theta_i\,N_a$ pour le diaphragme supérieur. Pour un élément isolé, une excentricité $e_i = \theta_i\,l_0/2$ convient aussi, et pour les voiles et poteaux contreventés, $e_i = l_0/400$ reste admis.

La deuxième génération ajoute une imperfection en forme de mode de flambement, utile pour les arcs et les voûtes, d’amplitude $a_i = \theta_i\,l_{aw}/2$, où $l_{aw}$ est la demi-longueur d’onde du mode (7.4). Elle demande aussi de majorer de 1,2 l’effet des tolérances maximales quand le projet en spécifie de plus strictes que celles de l’EN 13670 (7.2.1.1(3)) ; le calculateur ne traite pas ce cas.

## L’exemple type : contreventement d’un immeuble de bureaux

Immeuble de dix niveaux, hauteur 30 m, dix poteaux contribuant à l’effet sur le noyau de contreventement, charge verticale de 8 000 kN transmise par étage.

```exemple
{
  "nom": "contreventement",
  "mecanisme": "imperfections",
  "entree": { "effet": "contreventement", "l": 30000, "m": 10, "N": 8000, "contrevente": "non" },
  "attendus": {
    "ec2-2004/inclinaison.α_h": "0,667",
    "ec2-2004/inclinaison.α_m": "0,742",
    "ec2-2004/inclinaison.1/θ_i": "405",
    "ec2-2004/inclinaison.H_i": "19,8",
    "ec2-2023/inclinaison.α_h": "0,400",
    "ec2-2023/inclinaison.1/θ_i": "674",
    "ec2-2023/inclinaison.H_i": "11,9"
  }
}
```

$\alpha_m$ vaut {{contreventement:ec2-2004/inclinaison.α_m}} dans les deux générations. La loi $2/\sqrt{30}$ donnerait 0,37.

**Première génération.** $\alpha_h$ est bloqué à {{contreventement:ec2-2004/inclinaison.α_h}} : $\theta_i$ = 1/{{contreventement:ec2-2004/inclinaison.1/θ_i}} et une force de {{contreventement:ec2-2004/inclinaison.H_i}} kN par étage.

**Deuxième génération.** $\alpha_h$ descend à {{contreventement:ec2-2023/inclinaison.α_h}} : $\theta_i$ = 1/{{contreventement:ec2-2023/inclinaison.1/θ_i}} et {{contreventement:ec2-2023/inclinaison.H_i}} kN par étage, soit 40 % de moins.

{{calculateur:contreventement}}

## Second exemple : poteau d’un étage

Poteau contreventé de 3,20 m, charge verticale 1 500 kN, longueur efficace prise égale à la hauteur.

```exemple
{
  "nom": "poteau-imperfection",
  "mecanisme": "imperfections",
  "entree": { "effet": "element", "l": 3200, "m": 1, "N": 1500, "contrevente": "oui", "l0": 3200 },
  "attendus": {
    "ec2-2004/excentricite.1/θ_i": "200",
    "ec2-2004/excentricite.H_i": "15,0",
    "ec2-2004/excentricite.e_i": "8,00",
    "ec2-2023/excentricite.1/θ_i": "200",
    "ec2-2023/excentricite.e_i": "8,00"
  }
}
```

Pour un élément de moins de 4 m, $\alpha_h$ est plafonné à 1 dans les deux textes : $\theta_i$ = 1/{{poteau-imperfection:ec2-2023/excentricite.1/θ_i}}, $e_i$ = {{poteau-imperfection:ec2-2023/excentricite.e_i}} mm et une force équivalente de {{poteau-imperfection:ec2-2004/excentricite.H_i}} kN. Rien ne change pour le dimensionnement courant des poteaux.

{{calculateur:poteau-imperfection}}

## L’effet sur une note de calcul existante

- Les **forces d’imperfection sur les contreventements** des bâtiments de plus de 9 m de hauteur diminuent ; au-delà de 25 m, la baisse atteint 40 %.
- Les **éléments isolés** d’un étage ne changent pas.
- Une note qui fixait $\theta_0$ par l’annexe nationale de 2004 doit revenir à 1/200, qui n’est plus un paramètre national.
- Les **tolérances plus strictes** spécifiées au projet (ou relevées sur une structure existante) entraînent une majoration de 1,2 de leur effet.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Le texte détenu ne laisse pas de paramètre national dans cette clause ; vérifier que l’annexe nationale ne fixe pas de tolérances d’exécution propres, qui commanderaient la majoration de 7.2.1.1(3).
