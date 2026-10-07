---
titre: Espacement des barres et paquets de barres
ordre: 24
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-07 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-07
revise: 2026-10-07
resume: La distance libre entre barres isolées ne change pas ; pour les paquets, le diamètre équivalent se définit par l’aire, n’est plus plafonné à 55 mm, et le texte de 2023 ne cite plus que lui comme distance minimale entre paquets.
motscles: dispositions-constructives, ancrage, recouvrement
historique:
  - 2026-10-07 : première rédaction.
---

## Ce qui change

Pour des **barres isolées**, rien : la distance libre minimale reste le plus grand de trois termes, le diamètre, le granulat augmenté de 5 mm et 20 mm. Les coefficients $k_1$ et $k_2$, paramètres nationaux en 2004, sont désormais écrits en dur avec leurs anciennes valeurs recommandées.

Pour les **paquets**, trois changements :

- le diamètre équivalent est défini par l’aire totale du paquet, ce qui couvre directement des barres de diamètres différents ;
- le plafond de 55 mm de la première génération disparaît : un paquet de trois HA40 devient possible ;
- la distance libre entre paquets n’est plus que le diamètre équivalent, sans rappel du granulat ni du minimum de 20 mm (voir la réserve plus bas).

Le nombre de barres par paquet ne change pas : trois, quatre pour des barres verticales comprimées et dans un recouvrement. La deuxième génération ajoute une règle de disposition : dans un paquet de trois ou quatre barres, chaque barre touche au moins deux autres. Elle ajoute aussi une distance libre d’au moins 5 mm entre une barre et une surface de béton déjà coulé, si cette surface est rugueuse (11.2(4)).

## Pourquoi

L’espacement sert au bétonnage : le béton doit passer entre les barres et s’y compacter, sinon l’adhérence n’existe pas. C’est pourquoi le granulat entre dans la règle. Pour un paquet, l’adhérence se fait sur le contour extérieur, plus petit que la somme des contours des barres : d’où la barre fictive de même aire, dont le diamètre sert ensuite pour l’ancrage, le recouvrement et l’enrobage. Définir ce diamètre par l’aire plutôt que par $\varphi\sqrt{n_b}$ revient au même pour des barres égales et généralise la règle aux paquets mixtes.

## Le calcul dans les deux générations

**Première génération** (8.2(2), 8.9.1, valeurs recommandées $k_1$ = 1, $k_2$ = 5 mm) :

$$
c_{s,min} = \max\left(k_1\,\varphi_n \;;\; d_g + k_2 \;;\; 20\ \text{mm}\right), \qquad \varphi_n = \varphi\,\sqrt{n_b} \le 55\ \text{mm}
$$

avec $\varphi_n = \varphi$ pour une barre isolée.

**Deuxième génération** (11.2(2), 11.2(3), 11.4.3(1)) :

$$
c_{s,min} = \max\left(\varphi \;;\; D_{upper} + 5\ \text{mm} \;;\; 20\ \text{mm}\right) \quad \text{(barres isolées)}, \qquad c_{s,min} = \varphi_b = \sqrt{\frac{4\,A_s}{\pi}} \quad \text{(entre paquets)}
$$

avec $A_s$ l’aire totale des barres du paquet. Le calculateur suppose des barres de même diamètre.

## L’exemple type : paquet de deux HA25 en travée

Poutre de bâtiment, armatures inférieures en paquets de deux HA25, granulat de 20 mm, 40 mm de distance libre entre paquets.

```exemple
{
  "nom": "paquet-2ha25",
  "mecanisme": "espacement",
  "entree": { "phi": 25, "nb": 2, "disposition": "courant", "Dupper": 20, "csPrevu": 40 },
  "attendus": {
    "ec2-2004/base.φ_n": "35,36",
    "ec2-2004/base.sollicitation": "35,36",
    "ec2-2004/base.taux": "0,883",
    "ec2-2023/base.φ_b": "35,36",
    "ec2-2023/base.sollicitation": "35,36",
    "ec2-2023/base.taux": "0,883"
  }
}
```

```exemple
{
  "nom": "paquet-3ha40",
  "mecanisme": "espacement",
  "entree": { "phi": 40, "nb": 3, "disposition": "courant", "Dupper": 20, "csPrevu": 80 },
  "attendus": {
    "ec2-2023/base.φ_b": "69,28",
    "ec2-2023/base.taux": "0,866"
  }
}
```

```exemple
{
  "nom": "paquet-2ha10",
  "mecanisme": "espacement",
  "entree": { "phi": 10, "nb": 2, "disposition": "courant", "Dupper": 20, "csPrevu": 20 },
  "attendus": {
    "ec2-2004/base.sollicitation": "25,00",
    "ec2-2023/base.sollicitation": "14,14"
  }
}
```

| Paquet | Diamètre équivalent (mm) | 2004 : distance minimale (mm) | 2023 : distance minimale (mm) |
|---|---:|---:|---:|
| 2 HA25 | {{paquet-2ha25:ec2-2023/base.φ_b}} | {{paquet-2ha25:ec2-2004/base.sollicitation}} | {{paquet-2ha25:ec2-2023/base.sollicitation}} |
| 3 HA40 | {{paquet-3ha40:ec2-2023/base.φ_b}} | non admis (plus de 55 mm) | {{paquet-3ha40:ec2-2023/base.φ_b}} |
| 2 HA10 | 14,14 | {{paquet-2ha10:ec2-2004/base.sollicitation}} | {{paquet-2ha10:ec2-2023/base.sollicitation}} |

Pour les deux HA25, les deux générations donnent le même résultat : {{paquet-2ha25:ec2-2023/base.sollicitation}} mm, soit un taux de {{paquet-2ha25:ec2-2023/base.taux}} pour 40 mm prévus. Le paquet de trois HA40, interdit en 2004, est admis en 2023 avec {{paquet-3ha40:ec2-2023/base.φ_b}} mm entre paquets. Pour de petites barres, la lecture littérale de 2023 laisse le diamètre équivalent seul gouverner, en dessous du granulat.

{{calculateur:paquet-2ha25}}

## Ancrage et recouvrement des paquets

Le diamètre équivalent se reporte dans le calculateur de l’[article sur l’ancrage](ancrage.html) à la place de $\varphi$. Les règles de disposition ne se chiffrent pas, et le calculateur ne les traite pas :

- **ancrage** : en 2004, un paquet de diamètre équivalent d’au moins 32 mm ancré près d’un appui doit avoir ses barres décalées ; une barre ancrée avec un décalage de plus de 1,3 $l_{b,rqd}$ s’ancre avec son propre diamètre (8.9.2). En 2023, une barre ancrée seule dans un paquet s’ancre avec son diamètre et son enrobage, plusieurs barres ancrées ensemble avec le diamètre équivalent (11.4.3(2)). Le seuil de 32 mm disparaît ;
- **recouvrement** : en 2004, un paquet de deux barres de moins de 32 mm se recouvre sans décalage avec $\varphi_n$, sinon avec un décalage de 1,3 $l_0$ (8.9.3). En 2023, un paquet de deux barres se recouvre sans décalage avec $\varphi_b$, quel que soit son diamètre. Un paquet de trois barres se recouvre seulement avec un décalage d’au moins 0,3 $l_{sd}$ ou une barre supplémentaire, la longueur se calculant alors avec le diamètre d’une barre (11.5.3). Les paquets de quatre barres ne se recouvrent dans aucune des deux générations.

L’enrobage d’un paquet se mesure depuis son contour réel et vaut au moins le diamètre équivalent : le [calculateur d’enrobage](durabilite-enrobage.html) accepte $\varphi_b$ à la place de $\varphi$.

## L’effet sur une note de calcul existante

- Pour des **barres isolées**, aucun changement.
- Un **paquet de deux barres de 32 mm de diamètre équivalent ou plus** peut désormais se recouvrir ou s’ancrer sans décalage, mais sa longueur se calcule avec $\varphi_b$, donc nettement plus longue qu’avec le diamètre d’une barre.
- Les **gros paquets** (3 HA40) deviennent possibles. Au-delà de 32 mm de diamètre équivalent, l’annexe S (S.5, informative) permet de remplacer le calcul des ouvertures de fissure par une armature de peau.

## Ce qu’il faudra vérifier

- **Distance entre paquets** : 11.2(3) ne cite que $\varphi_b$. L’outil n’y ajoute ni $D_{upper}$ + 5 mm ni 20 mm. Il paraît prudent de garder ces deux termes, que la règle générale de bétonnage (11.2(1)) justifie. Cette lecture est à confirmer.
- Le rapport des diamètres de 1,7 au plus dans un paquet (8.9.1(1)) n’a pas d’équivalent relevé en 2023.
