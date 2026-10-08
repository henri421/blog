---
titre: Précontrainte, mise en tension et frottement
ordre: 43
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-09 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-09
revise: 2026-10-09
resume: Les contraintes limites de mise en tension et l’expression des pertes par frottement sont reprises sans changement ; les coefficients nationaux de 2004 deviennent des valeurs fixes.
motscles: precontrainte, materiaux-beton
historique:
  - 2026-10-09 : première rédaction.
---

## Ce qui change

Pour la mise en tension et les pertes par frottement, la deuxième génération reprend la première :

- **contrainte de mise en tension maximale** : $\sigma_{p,max} \le \min(0.8\,f_{pk} \;;\; 0.9\,f_{p0,1k})$, surtension admise jusqu’à 0,95 $f_{p0,1k}$ (5.10.2.1 ; tableau 7.1) ;
- **contrainte après transfert** : $\sigma_{p,m}(x, 0) \le \min(0.75\,f_{pk} \;;\; 0.85\,f_{p0,1k})$ (5.10.3(2) ; tableau 7.1) ;
- **pertes par frottement** : $\Delta\sigma_{p,\mu}(x) = \sigma_{p,max}\left[1 - e^{-\mu(\theta + k\,x)}\right]$ ((5.45) ; (7.34)), avec une déviation parasite comprise en général entre 0,005 et 0,01 par mètre pour les câbles intérieurs.

Les coefficients $k_1$, $k_2$, $k_7$, $k_8$ de 2004, paramètres nationaux, deviennent des valeurs du tableau 7.1. Celles-ci peuvent être convenues pour un projet donné entre les parties. Le tableau 7.2 donne des valeurs de $\mu$ à défaut de données du procédé.

## Pourquoi

Le texte ne donne pas de motif. Ces règles dépendent surtout des procédés de précontrainte, sur lesquels l’Eurocode renvoie à la documentation technique du système.

## L’exemple type : câble de pont

Torons Y1860S7 ($f_{pk}$ = 1860 MPa, $f_{p0,1k}$ = 1640 MPa), tendus à 1450 MPa ; à 30 m de l’ancrage actif, déviation cumulée de 0,30 rad, $\mu$ = 0,19, $k$ = 0,007 par mètre.

```exemple
{
  "nom": "cable-pont",
  "mecanisme": "precontrainte-tension",
  "entree": { "fpk": 1860, "fp01k": 1640, "sigmaPmax": 1450, "mu": 0.19, "theta": 0.3, "k": 0.007, "x": 30 },
  "attendus": {
    "ec2-2004/limite.resistance": "1476",
    "ec2-2023/limite.taux": "0,982",
    "ec2-2004/frottement.sollicitation": "133,9",
    "ec2-2023/frottement.sollicitation": "133,9"
  }
}
```

La contrainte de 1450 MPa reste sous la limite de {{cable-pont:ec2-2004/limite.resistance}} MPa (taux {{cable-pont:ec2-2023/limite.taux}}). La perte par frottement atteint {{cable-pont:ec2-2023/frottement.sollicitation}} MPa à 30 m, identique dans les deux générations.

{{calculateur:cable-pont}}

## L’effet sur une note de calcul existante

- Aucun changement pour la mise en tension et le frottement.
- Les autres pertes (rentrée d’ancrage, déformation instantanée du béton, pertes différées) restent à comparer clause par clause.
