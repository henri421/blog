---
titre: Diagramme de calcul de l’acier
ordre: 40
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les deux diagrammes de calcul de l’acier sont conservés ; seule la déformation limite de la branche inclinée change, de 0,9 εuk à εuk/γS, ce qui la réduit de 3 %.
motscles: materiaux-beton, flexion, ductilite
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Pour le calcul d’une section, on peut toujours choisir entre deux diagrammes de l’acier (3.2.7(2) ; 5.2.4(2)) :

- une **branche horizontale** à $f_{yd}$, sans limite de déformation ;
- une **branche inclinée**, de $f_{yd}$ à $k\,f_{yk}/\gamma_S$ pour $\varepsilon_{uk}$, utilisée jusqu’à une déformation limite $\varepsilon_{ud}$.

Seule cette limite change. En 2004, sa valeur recommandée était $\varepsilon_{ud}$ = 0,9 $\varepsilon_{uk}$, paramètre national. En 2023, elle vaut $\varepsilon_{ud} \le \varepsilon_{uk}/\gamma_S$, soit 0,87 $\varepsilon_{uk}$ avec $\gamma_S$ = 1,15. Le module d’élasticité (200 000 MPa) et la masse volumique (78,5 kN/m³) ne changent pas.

## Pourquoi

Le texte n’en donne pas le motif. La deuxième génération lie la déformation limite au coefficient partiel de l’acier, comme la contrainte, au lieu d’un coefficient national indépendant. La branche de calcul est ainsi l’image de la branche caractéristique réduite par le même coefficient.

## L’exemple type : acier B500B

$f_{yk}$ = 500 MPa, $k$ = 1,08, $\varepsilon_{uk}$ = 5 %.

```exemple
{
  "nom": "b500b",
  "mecanisme": "acier-calcul",
  "entree": { "fyk": 500, "k": 1.08, "epsUk": 50 },
  "attendus": {
    "ec2-2004/inclinee.ε_ud": "45,0",
    "ec2-2023/inclinee.ε_ud": "43,5",
    "ec2-2004/inclinee.resistance": "465,9",
    "ec2-2023/inclinee.resistance": "464,8"
  }
}
```

La déformation limite passe de {{b500b:ec2-2004/inclinee.ε_ud}} à {{b500b:ec2-2023/inclinee.ε_ud}} ‰. La contrainte atteinte en fin de branche passe de {{b500b:ec2-2004/inclinee.resistance}} à {{b500b:ec2-2023/inclinee.resistance}} MPa : l’écart est négligeable pour la résistance en flexion. Il ne compte que dans les calculs où la déformation limite gouverne, comme les sections très armées ou la capacité de rotation.

{{calculateur:b500b}}

## L’effet sur une note de calcul existante

- **Flexion** avec branche horizontale : aucun changement.
- **Flexion** avec branche inclinée : gain de résistance un peu plus faible, de l’ordre de 1 MPa sur la contrainte de l’acier.
- **Programmes de calcul de sections** : remplacer le paramètre 0,9 $\varepsilon_{uk}$ par $\varepsilon_{uk}/\gamma_S$.
