---
titre: Ancrage par tête d’ancrage
ordre: 26
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les barres à tête entrent dans l’Eurocode 2. Sous des conditions simples de géométrie, de béton et de distances aux bords, la tête suffit à ancrer une barre plastifiée, sans aucune longueur d’adhérence.
motscles: ancrage, dispositions-constructives
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

La première génération ne traitait pas les barres à tête : elle renvoyait les dispositifs mécaniques à leur norme de produit ou à un agrément technique (8.4.1(5)). La deuxième génération leur consacre une clause (11.4.7), avec deux voies :

- une **règle de moyens** (11.4.7(1)). Si la tête, le béton et les distances aux bords respectent des minima, la barre développe 435 MPa **sans aucune longueur d’ancrage supplémentaire** ;
- une **vérification générale** (11.4.7(2) et (3)), qui donne la contrainte que peut développer la tête en fonction de sa taille, de la distance au bord, du granulat et de l’état de fissuration du béton. Si l’effort dépasse cette contrainte, une longueur d’adhérence complète la tête. Cette longueur résiduelle est majorée de 10 % (11.11).

Pour les armatures d’effort tranchant et de confinement, l’ancrage repose sur la tête seule (11.4.7(4)). Les recouvrements de barres à tête relèvent de 11.5.5.

## Pourquoi

Une tête transmet l’effort par **butée** sur le béton, et non par adhérence. Sa résistance est celle d’un poinçonnement local du béton sous la tête, puis d’un éclatement vers le bord le plus proche. D’où les paramètres retenus : l’aire nette de la tête pour la butée, la distance au bord et à l’angle pour l’éclatement, le granulat ($d_{dg}$) pour la rugosité de la fissure, la fissuration du béton qui réduit la capacité.

## Les conditions de la règle de moyens

Toutes doivent être remplies (11.4.7(1)) :

- **tête** : $\varphi_h \ge 3\,\varphi$, avec $\varphi_h \le 4\,t_h$ ; pour une tête non circulaire, $\varphi_h = 2\sqrt{A_h/\pi}$ (11.7) ;
- **matériaux** : $f_{ck} \ge 25$ MPa, $\varphi \le 25$ mm, $d_{dg} \ge 32$ mm, c’est-à-dire $D_{lower} \ge 16$ mm pour un béton courant ;
- **distance au bord** : $a_y \ge 3\,\varphi$ en béton non fissuré, $a_y \ge 4\,\varphi$ en béton fissuré ;
- **distance à l’angle** : $a_x \ge 2\,a_y + 1.2\,\varphi_h$ ; si $a_x < a_y$, les deux valeurs se permutent ;
- **groupe de barres le long d’un bord** : $s_x \ge 4\,a_y$.

## L’exemple type : HA20 à tête en rive de voile

HA20 à tête circulaire de 64 mm et 16 mm d’épaisseur, C30/37 avec un granulat 16/22 ($d_{dg}$ = 32 mm), béton non fissuré. Les barres sont à 60 mm du bord et à 200 mm de l’angle, espacées de 250 mm. La contrainte de calcul est de 400 MPa.

```exemple
{
  "nom": "tete-voile",
  "mecanisme": "tete-ancrage",
  "entree": { "phi": 20, "fck": 30, "Dlower": 16, "phiH": 64, "th": 16, "fissuration": "non-fissure", "ay": 60, "ax": 200, "sx": 250, "sigmaSd": 400 },
  "attendus": {
    "ec2-2023/simplifie.resistance": "435",
    "ec2-2023/simplifie.taux": "0,919",
    "ec2-2023/simplifie.a_x,min": "196,8",
    "ec2-2023/simplifie.s_x,min": "240"
  }
}
```

```exemple
{
  "nom": "droit-voile",
  "mecanisme": "ancrage",
  "entree": { "phi": 20, "fck": 30, "fyk": 500, "adherence": "bonne", "cs": 230, "cx": 50, "cy": 50, "type": "ancrage", "lDispo": 300 },
  "attendus": {
    "ec2-2004/barre-plastifiee.sollicitation": "554,0",
    "ec2-2023/barre-plastifiee.sollicitation": "706,6"
  }
}
```

Toutes les conditions sont remplies, de justesse pour deux d’entre elles. La tête de 64 mm vaut juste 4 fois son épaisseur. La distance à l’angle de 200 mm dépasse à peine le minimum de {{tete-voile:ec2-2023/simplifie.a_x,min}} mm. La tête développe {{tete-voile:ec2-2023/simplifie.resistance}} MPa : taux de {{tete-voile:ec2-2023/simplifie.taux}}. La même barre droite, plastifiée, demanderait {{droit-voile:ec2-2023/barre-plastifiee.sollicitation}} mm d’ancrage en 2023 ({{droit-voile:ec2-2004/barre-plastifiee.sollicitation}} mm en 2004), longueur que l’épaisseur d’un voile ne permet souvent pas.

Si le béton est fissuré dans la zone de la tête (rive tendue, par exemple), le minimum de distance au bord passe à 4 φ = 80 mm : la règle de moyens ne s’applique plus, et il faut passer à la vérification générale.

{{calculateur:tete-voile}}

## L’effet sur une note de calcul existante

- Les barres à tête, justifiées jusqu’ici par l’agrément du fabricant, peuvent l’être directement par l’Eurocode. La règle de moyens couvre les cas courants de diamètre 25 mm au plus.
- La note doit établir l’**état de fissuration** du béton autour de la tête. Il change le minimum de distance au bord de 3 φ à 4 φ.
- Le **granulat** devient une donnée de l’ancrage : un béton à granulat de moins de 16 mm ne relève pas de la règle de moyens.

## Ce qu’il faudra vérifier

- **Vérification générale** : la formule (11.8) de la contrainte développée par la tête, son plafond, et la distance nominale $a_d$ d’un groupe de barres (11.10) sont mal restituées par l’extraction du texte. Elles ne sont pas codées en attendant leur lecture sur l’exemplaire papier. Le calculateur déclare alors le cas non applicable, en nommant la condition en défaut.
