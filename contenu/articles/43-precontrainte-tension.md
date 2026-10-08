---
titre: Précontrainte, mise en tension, frottement et pertes différées
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

## Les pertes différées

L’expression simplifiée des pertes par fluage, retrait et relaxation est elle aussi reprise à l’identique ((5.46) ; (7.35)) :

$$
\Delta\sigma_{p,c+s+r} = \frac{\varepsilon_{cs}\,E_p + 0.8\,\Delta\sigma_{pr} + \frac{E_p}{E_{cm}}\,\varphi\,\sigma_{c,QP}}{1 + \frac{E_p}{E_{cm}}\,\frac{A_p}{A_c}\left(1 + \frac{A_c}{I_c}\,z_{cp}^2\right)\left(1 + 0.8\,\varphi\right)}
$$

Ce qui change, ce sont les données d’entrée. Le module $E_{cm}$ suit une nouvelle expression ([article 12](materiaux.html)). Le retrait, le fluage et la relaxation se calculent avec les lois de la deuxième génération (5.1.5, annexe B), que le calculateur ne traite pas : il les demande.

Poutre en C35/45, $A_p$ = 2800 mm², $A_c$ = 0,48 m², $I_c$ = 6,4·10¹⁰ mm⁴, câble à 450 mm du centre de gravité, $\varepsilon_{cs}$ = 0,3 ‰, $\varphi$ = 2, perte par relaxation de 60 MPa, compression du béton au niveau du câble de 8 MPa.

```exemple
{
  "nom": "pertes-poutre",
  "mecanisme": "pertes-differees",
  "entree": { "fck": 35, "epsCs": 0.3, "phi": 2, "dSigmaPr": 60, "sigmaCQP": 8, "Ep": 195000, "Ap": 2800, "Ac": 480000, "Ic": 64000000000, "zcp": 450 },
  "attendus": {
    "ec2-2004/simplifiee.sollicitation": "162,5",
    "ec2-2023/simplifiee.sollicitation": "163,6"
  }
}
```

À données égales, les pertes passent de {{pertes-poutre:ec2-2004/simplifiee.sollicitation}} à {{pertes-poutre:ec2-2023/simplifiee.sollicitation}} MPa, du seul fait du module : l’écart réel viendra du retrait et du fluage de la deuxième génération.

{{calculateur:pertes-poutre}}

## L’effet sur une note de calcul existante

- Aucun changement pour la mise en tension et le frottement.
- Pour les pertes différées, l’expression est inchangée, mais le retrait, le fluage et la relaxation sont à recalculer avec les lois de 2023.
- La rentrée d’ancrage et la déformation instantanée du béton restent à comparer clause par clause.
