---
titre: Analyse plastique sans vérification de la capacité de rotation
ordre: 41
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: L’analyse plastique d’une poutre ou d’une dalle sans calcul de la capacité de rotation reste soumise à une limite de hauteur d’axe neutre ; la limite plus sévère des bétons à haute résistance disparaît.
motscles: analyse-structurale, ductilite, dalle
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Une analyse plastique (lignes de rupture d’une dalle, mécanisme d’une poutre continue) suppose que les rotules puissent tourner assez pour que le mécanisme se forme. Les deux générations dispensent de vérifier cette capacité de rotation sous trois conditions ((5.6.2(2)) ; (7.3.3.2(1)), 7.3.3.1(5)) :

- une **hauteur d’axe neutre limitée** dans toute section où une rotule peut se former ;
- un **acier de classe B ou C** ;
- un **rapport des moments** sur appuis intermédiaires aux moments en travée compris entre 0,5 et 2.

La limite d’axe neutre change. En 2004, $x_u/d \le$ 0,25 jusqu’au C50/60 et 0,15 à partir du C55/67. En 2023, $x_u/d \le$ 0,25 pour toutes les classes. Le texte de 2023 précise aussi que la résistance des sections se calcule avec la branche horizontale du diagramme de l’acier, et que l’acier de précontrainte peut être considéré comme un acier de classe B.

## Pourquoi

Le texte ne donne pas de motif, mais il est cohérent avec le diagramme de calcul du béton. En 2004, la déformation ultime décroissait au-delà de 50 MPa ($\varepsilon_{cu2}$ de 3,5 ‰ à 2,6 ‰), d’où une limite plus sévère pour les bétons à haute résistance. En 2023, le diagramme parabole-rectangle prend $\varepsilon_{c2}$ = 2 ‰ et $\varepsilon_{cu}$ = 3,5 ‰ pour toutes les classes (8.1.2) : une limite unique de hauteur d’axe neutre en découle naturellement.

## L’exemple type : dalle continue en béton à haute résistance

Dalle continue de 200 mm de hauteur utile en C60/75, acier B, axe neutre à 40 mm dans les rotules, rapport des moments de 1,2.

```exemple
{
  "nom": "dalle-c60",
  "mecanisme": "analyse-plastique",
  "entree": { "fck": 60, "xu": 40, "d": 200, "rapportMoments": 1.2, "classe": "B" },
  "attendus": {
    "ec2-2004/sans-rotation.resistance": "0,15",
    "ec2-2004/sans-rotation.taux": "1,334",
    "ec2-2023/sans-rotation.resistance": "0,25",
    "ec2-2023/sans-rotation.taux": "0,800"
  }
}
```

Avec $x_u/d$ = 0,20, l’analyse plastique sans vérification de rotation était exclue en 2004, la limite étant de {{dalle-c60:ec2-2004/sans-rotation.resistance}} (taux {{dalle-c60:ec2-2004/sans-rotation.taux}}). Elle est admise en 2023, avec un taux de {{dalle-c60:ec2-2023/sans-rotation.taux}}.

{{calculateur:dalle-c60}}

## L’effet sur une note de calcul existante

- Pour les **bétons courants** (jusqu’au C50/60), rien ne change.
- Pour les **bétons à haute résistance**, l’analyse plastique sans vérification de rotation devient possible avec un axe neutre jusqu’à 0,25 $d$.
- Les **aciers de classe A** restent exclus.
