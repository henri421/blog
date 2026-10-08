---
titre: Coefficient de fluage effectif
ordre: 39
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Le coefficient de fluage effectif garde son expression pour les poteaux isolés, mais la dispense de 2004 qui permettait de l’annuler disparaît, et un coefficient propre aux effets globaux, fondé sur les déplacements, apparaît.
motscles: stabilite, materiaux-beton
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Le second ordre d’un poteau dépend de sa courbure, que le fluage augmente. Pour ne pas mener une analyse dans le temps, les deux générations ramènent l’effet du fluage à un **coefficient effectif** appliqué à la charge de calcul :

- **éléments isolés et effets locaux** : même expression qu’en 2004, $\varphi_{eff,b} = \varphi(t_{DL}, t_0)\,M_{0Eqp}/M_{0Ed}$ ((5.19) ; (7.27)). Le coefficient de fluage est pris à la durée d’utilisation de projet, et non plus à l’infini. Le moment quasi permanent inclut l’effet des imperfections. Le rapport des moments peut être remplacé par celui des charges verticales ;
- **effets globaux**, nouveauté : $\varphi_{eff,s} = \varphi(t_{DL}, t_0)\,\delta_{0Eqp}/\delta_{Ed}$ (7.26), avec les déplacements horizontaux à court terme de la structure, en sections non fissurées, sous la combinaison quasi permanente et sous la combinaison de calcul. Au moins deux combinaisons sont à considérer : à charge dominante horizontale et à charge dominante verticale. Lorsqu’on combine analyses globale et locale, on retient le plus grand des deux coefficients.

La **dispense** de 2004 disparaît. On pouvait prendre $\varphi_{ef}$ = 0 si $\varphi(\infty, t_0) \le 2$, $\lambda \le 75$ et $M_{0Ed}/N_{Ed} \ge h$ (5.8.4(4)), ce qui couvrait beaucoup de poteaux de bâtiment très excentrés. Le texte de 2023 ne la reprend pas.

## Pourquoi

Le texte ne donne pas de motif. On peut penser que, pour un effet global comme le déplacement d’ensemble d’un bâtiment sous le vent, le moment d’un élément ne représente pas bien la part quasi permanente du chargement : alors que les déplacements y sont plus directement liés. Quant à la dispense de 2004, sa propre note signalait déjà qu’elle pouvait être insuffisamment sûre lorsqu’on négligeait en même temps le second ordre.

## L’exemple type : poteau de bâtiment excentré

Coefficient de fluage de 2,0, moment du premier ordre de 100 kN·m dont 60 sous charges quasi permanentes, élancement 60, poteau de 400 mm peu comprimé (200 kN). Pour l’analyse globale, la structure se déplace de 8 mm sous la combinaison quasi permanente et de 20 mm sous la combinaison de calcul.

```exemple
{
  "nom": "poteau-excentre",
  "mecanisme": "fluage-effectif",
  "entree": { "phi": 2, "M0Eqp": 60, "M0Ed": 100, "lambda": 60, "NEd": 200, "h": 400, "delta0Eqp": 8, "deltaEd": 20 },
  "attendus": {
    "ec2-2004/moments.sollicitation": "1,20",
    "ec2-2004/negligeable.sollicitation": "0",
    "ec2-2023/moments.sollicitation": "1,20",
    "ec2-2023/global.sollicitation": "0,80"
  }
}
```

En 2004, l’excentricité de 500 mm dépassait la hauteur du poteau : le fluage pouvait être négligé ($\varphi_{ef}$ = {{poteau-excentre:ec2-2004/negligeable.sollicitation}}). En 2023, il faut retenir {{poteau-excentre:ec2-2023/moments.sollicitation}} pour le poteau isolé et {{poteau-excentre:ec2-2023/global.sollicitation}} pour les effets globaux.

{{calculateur:poteau-excentre}}

## L’effet sur une note de calcul existante

- Les **poteaux excentrés** justifiés avec $\varphi_{ef}$ = 0 sont à reprendre avec le coefficient effectif : la rigidité nominale baisse et le second ordre augmente ([article 20](second-ordre.html)).
- Les **analyses globales** du second ordre utilisent désormais le rapport des déplacements.
- Le **coefficient de fluage** à saisir est celui de la durée d’utilisation de projet.

## Ce qu’il faudra vérifier

- L’absence de dispense est un constat de lecture : aucune formulation équivalente n’a été trouvée dans le reste du texte de 2023.
