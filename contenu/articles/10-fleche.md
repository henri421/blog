---
titre: Flèche à long terme par le calcul
ordre: 10
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Un calcul simplifié sur section brute fait son entrée, et la méthode générale tient compte de la charge la plus forte déjà subie, ce qui augmente la flèche des éléments qui ont fissuré sous charge caractéristique.
motscles: fleche, els, dalle
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

La méthode générale reste une interpolation entre l’état non fissuré et l’état fissuré, mais le degré de fissuration se règle désormais sur la **charge la plus forte déjà subie**, et non sur la charge considérée. Un élément qui a fissuré sous charge caractéristique reste fissuré sous charge quasi permanente, et sa flèche à long terme augmente. Un calcul simplifié sur section brute, corrigé par deux coefficients forfaitaires, rejoint les outils de la note.

## Pourquoi

Une section fissurée ne se referme pas : les fissures ouvertes par une charge élevée restent présentes quand la charge redescend. La première génération mesurait la participation du béton tendu entre fissures par le rapport entre le moment de fissuration et le moment **sous la charge étudiée** (7.19) ; pour une flèche quasi permanente, c’est le moment quasi permanent. La deuxième génération précise que la contrainte de référence est la plus élevée subie jusqu’au moment de l’analyse (9.29) : pour un plancher de logement, c’est celle de la charge caractéristique. Le coefficient $\zeta$ augmente, et avec lui la part de comportement fissuré.

Le calcul simplifié de 9.3.3 répond à un besoin pratique : la plupart des logiciels donnent une flèche élastique sur section brute. La norme fournit un coefficient $k_I$ qui passe de cette flèche à la flèche fissurée, à partir d’une approximation fermée du rapport des inerties, et un coefficient $k_s$ qui fait de même pour le retrait.

## Les niveaux d’approximation

Méthode générale (7.4.3 ; 9.3.4) :

$$
\delta = \zeta\,\delta_{II} + \left(1 - \zeta\right)\delta_I, \quad \zeta = 1 - \beta\left(\frac{M_{cr}}{M}\right)^2, \quad E_{c,eff} = \frac{E_{cm}}{1 + \varphi}
$$

avec $\beta$ = 0,5 pour une charge de longue durée, la courbure de retrait $\varepsilon_{cs}\,\alpha_e\,S/I$ dans chaque état, et $M$ le moment quasi permanent en 2004, le moment caractéristique en 2023.

Calcul simplifié de deuxième génération (9.3.3), sur section brute :

$$
\delta = k_I\left(\delta_{loads} + k_s\,\delta_{\varepsilon cs}\right), \quad k_I = \zeta\,\frac{I_g}{I_{cr}} + \left(1 - \zeta\right)
$$

$$
\frac{I_g}{I_{cr}} = \frac{1}{2.7\left(\alpha_{e,ef}\,\rho\right)^{0.6}\left(d/h\right)^3}, \quad k_s = 455\,\rho^2 - 35\,\rho + 1.6
$$

Le calculateur traite une travée sur appuis simples sous charge répartie ; la flèche est tirée de la courbure à mi-portée.

## L’exemple type : dalle de logement

Dalle de 20 cm portant sur 5 m, HA12 tous les 20 cm ($d$ = 172 mm), béton C25/30. Charges : 6,6 kN/m quasi permanents, 8 kN/m caractéristiques. Fluage $\varphi$ = 2,5, retrait 0,4 ‰. Limite $L$/250 = 20 mm.

```exemple
{
  "nom": "dalle-fleche",
  "mecanisme": "fleche",
  "entree": { "L": 5000, "b": 1000, "h": 200, "d": 172, "As": 565, "fck": 25, "qqp": 6.6, "qk": 8, "phi": 2.5, "epsCs": 0.4, "rapport": 250 },
  "attendus": {
    "ec2-2004/generale.ζ": "0,553",
    "ec2-2004/generale.δ_I": "9,67",
    "ec2-2004/generale.δ_II": "34,38",
    "ec2-2004/generale.sollicitation": "23,3",
    "ec2-2004/generale.taux": "1,167",
    "ec2-2023/generale.ζ": "0,693",
    "ec2-2023/generale.sollicitation": "27,0",
    "ec2-2023/generale.taux": "1,353",
    "ec2-2023/simplifiee.k_I": "2,34",
    "ec2-2023/simplifiee.k_s": "1,49",
    "ec2-2023/simplifiee.sollicitation": "27,7",
    "ec2-2023/simplifiee.taux": "1,387"
  }
}
```

| | $\zeta$ | Flèche (mm) | Rapport à la limite |
|---|---:|---:|---:|
| 2004, méthode générale | {{dalle-fleche:ec2-2004/generale.ζ}} | {{dalle-fleche:ec2-2004/generale.sollicitation}} | {{dalle-fleche:ec2-2004/generale.taux}} |
| 2023, calcul simplifié | — | {{dalle-fleche:ec2-2023/simplifiee.sollicitation}} | {{dalle-fleche:ec2-2023/simplifiee.taux}} |
| 2023, méthode générale | {{dalle-fleche:ec2-2023/generale.ζ}} | {{dalle-fleche:ec2-2023/generale.sollicitation}} | {{dalle-fleche:ec2-2023/generale.taux}} |

Les états limites encadrent la réponse : {{dalle-fleche:ec2-2004/generale.δ_I}} mm non fissuré, {{dalle-fleche:ec2-2004/generale.δ_II}} mm entièrement fissuré. Réglé sur la charge caractéristique, $\zeta$ passe de {{dalle-fleche:ec2-2004/generale.ζ}} à {{dalle-fleche:ec2-2023/generale.ζ}}, et la flèche gagne près de 4 mm. Le calcul simplifié, avec $k_I$ = {{dalle-fleche:ec2-2023/simplifiee.k_I}} et $k_s$ = {{dalle-fleche:ec2-2023/simplifiee.k_s}}, retrouve la méthode générale à quelques pour cent. La dalle ne respecte $L$/250 dans aucune des trois cellules ; le balayage sur l’épaisseur montre l’épaisseur à partir de laquelle elle le respecte.

{{calculateur:dalle-fleche}}

## L’effet sur une note de calcul existante

- Les flèches calculées en 2004 avec $\zeta$ réglé sur la charge quasi permanente sont **sous-estimées** au regard de la deuxième génération dès que la charge caractéristique fissure davantage l’élément.
- Le calcul simplifié permet d’exploiter directement une flèche élastique de logiciel : il suffit de la multiplier par $k_I$ et d’ajouter le retrait corrigé par $k_s$.
- La vérification par rapport portée/hauteur change aussi (tableau 9.3, fonction du pourcentage mécanique d’armature et de la part de charge d’exploitation) ; elle fera l’objet d’un article distinct.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les limites de flèche, qui relèvent de l’EN 1990.
- Le coefficient de fluage et le retrait, si l’annexe nationale en précise l’évaluation.
