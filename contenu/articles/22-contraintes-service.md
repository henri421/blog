---
titre: Limitation des contraintes en service
ordre: 22
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-06 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-06
revise: 2026-10-06
resume: Les limites de contrainte de l’acier et du béton sous combinaison caractéristique sont conservées ; le seuil du fluage non linéaire passe de 0,45 fck à 0,40 fcm, plus haut pour les bétons courants, et le module effectif du béton gagne 5 %.
motscles: els, fissuration, poutre
historique:
  - 2026-10-06 : première rédaction.
---

## Ce qui change

Les deux limites principales restent : $\sigma_s \le 0.8\,f_{yk}$ pour l’acier et, dans les classes d’exposition XD, XS et XF, $\sigma_c \le 0.6\,f_{ck}$ pour le béton, sous combinaison caractéristique. Sous combinaison quasi permanente, les deux générations fixent un seuil, et non une limite : au-delà, le fluage non linéaire doit être pris en compte. Ce seuil passe de $0.45\,f_{ck}$ à $0.40\,f_{cm}$, soit plus haut jusqu’à C64 (15,2 MPa contre 13,5 MPa en C30/37). Le module effectif du béton s’écrit $E_{c,eff} = 1.05\,E_{cm}/(1 + \varphi)$, au lieu de $E_{cm}/(1 + \varphi)$.

## Pourquoi

Le seuil sous charges quasi permanentes ne protège pas la sécurité mais la validité du calcul : au-delà, le fluage n’est plus proportionnel à la contrainte, et les flèches calculées avec un coefficient de fluage linéaire sont sous-estimées. La deuxième génération l’exprime par rapport à la résistance moyenne $f_{cm}$, grandeur qui gouverne réellement le comportement du béton en place, plutôt que par rapport à la résistance caractéristique. Le coefficient 1,05 corrige le module $E_{cm}$, défini comme module sécant à 0,4 $f_{cm}$, pour en faire le module tangent à l’origine sur lequel se fonde le coefficient de fluage.

## Le calcul dans les deux générations

Les contraintes se calculent sur la section fissurée élastique, avec $\alpha_e = E_s/E_c$ :

$$
\frac{b\,x^2}{2} = \alpha_e\,A_s\,(d - x), \qquad \sigma_c = \frac{M\,x}{I}, \qquad \sigma_s = \alpha_e\,\frac{M\,(d - x)}{I}
$$

| | 2004 (7.2) | 2023 (9.1, 9.2.1) |
|---|---|---|
| Acier, combinaison caractéristique | $\sigma_s \le 0.8\,f_{yk}$ | $\sigma_s \le 0.8\,f_{yk}$ |
| Béton, caractéristique, XD, XS, XF | $\sigma_c \le 0.6\,f_{ck}$ | $\sigma_c \le 0.6\,f_{ck}$ |
| Béton, quasi permanente : seuil du fluage non linéaire | $0.45\,f_{ck}$ | $0.40\,f_{cm}$ |
| Module effectif | $E_{cm}/(1 + \varphi)$ | $1.05\,E_{cm}/(1 + \varphi)$ |

Le calculateur prend le module $E_{cm}$ de chaque génération sous combinaison caractéristique, et le module effectif sous combinaison quasi permanente.

## L’exemple type : poutre de parking

Poutre de 300 × 600 mm en ambiance de sels de déverglaçage (XD3), $d$ = 550 mm, 3 HA25 ($A_s$ = 1473 mm²), C30/37, B500. Moments de service : 220 kN·m sous combinaison caractéristique, 150 kN·m sous combinaison quasi permanente ; $\varphi$ = 2,0.

```exemple
{
  "nom": "poutre-parking",
  "mecanisme": "contraintes-els",
  "entree": { "b": 300, "d": 550, "As": 1473, "fck": 30, "fyk": 500, "Mcar": 220, "Mqp": 150, "phi": 2.0, "exposition": "oui" },
  "attendus": {
    "ec2-2004/acier.sollicitation": "299,5",
    "ec2-2004/acier.taux": "0,748",
    "ec2-2004/beton-caracteristique.sollicitation": "19,11",
    "ec2-2004/beton-caracteristique.taux": "1,062",
    "ec2-2004/beton-quasi-permanent.sollicitation": "8,96",
    "ec2-2004/beton-quasi-permanent.resistance": "13,50",
    "ec2-2023/beton-caracteristique.sollicitation": "18,91",
    "ec2-2023/beton-caracteristique.taux": "1,051",
    "ec2-2023/beton-quasi-permanent.sollicitation": "9,02",
    "ec2-2023/beton-quasi-permanent.resistance": "15,20"
  }
}
```

**Acier.** $\sigma_s$ = {{poutre-parking:ec2-2004/acier.sollicitation}} MPa, sous la limite de 400 MPa (taux {{poutre-parking:ec2-2004/acier.taux}}), à peu près à l’identique dans les deux générations.

**Béton, combinaison caractéristique.** {{poutre-parking:ec2-2004/beton-caracteristique.sollicitation}} MPa en 2004 et {{poutre-parking:ec2-2023/beton-caracteristique.sollicitation}} MPa en 2023, au-dessus de 0,6 $f_{ck}$ = 18 MPa dans les deux cas (taux {{poutre-parking:ec2-2004/beton-caracteristique.taux}} et {{poutre-parking:ec2-2023/beton-caracteristique.taux}}) : la limite de durabilité gouverne, et la section doit être revue en XD.

**Béton, combinaison quasi permanente.** {{poutre-parking:ec2-2004/beton-quasi-permanent.sollicitation}} MPa en 2004, sous le seuil {{poutre-parking:ec2-2004/beton-quasi-permanent.resistance}} MPa ; {{poutre-parking:ec2-2023/beton-quasi-permanent.sollicitation}} MPa en 2023, sous le seuil {{poutre-parking:ec2-2023/beton-quasi-permanent.resistance}} MPa. Le fluage reste linéaire dans les deux générations ; un dépassement n’aurait pas rendu la section non conforme, mais aurait imposé un calcul de fluage non linéaire.

{{calculateur:poutre-parking}}

## L’effet sur une note de calcul existante

- Les vérifications de **contraintes sous combinaison caractéristique** se reportent telles quelles.
- Le **seuil du fluage non linéaire** passe de 0,45 $f_{ck}$ à 0,40 $f_{cm}$ : un peu plus de marge pour les bétons courants, un peu moins au-delà de C64.
- Le **module effectif** est majoré de 5 % : les contraintes et flèches à long terme varient légèrement.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les limites des tableaux 9.1 et 9.2, paramètres nationaux, et les classes d’exposition auxquelles elles s’appliquent.
