---
titre: Diamètre des mandrins de cintrage
ordre: 27
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les diamètres minimaux contre l’endommagement des barres ne changent pas. La vérification du béton dans la courbure, très pénalisante en 2004 dès qu’une barre plastifiée est coudée près d’une paroi, est remplacée par des dispenses élargies et une nouvelle formule.
motscles: dispositions-constructives, ancrage
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Le mandrin doit éviter deux ruptures : celle de **l’acier**, fissuré par un cintrage trop serré, et celle du **béton** à l’intérieur du coude, écrasé ou fendu par la pression de la barre.

Pour l’acier, rien ne change : 4 φ jusqu’à 16 mm, 7 φ au-delà. Elles valent aussi pour les barres soudées dont les soudures sont à au moins 3 φ de la courbure.

Pour le béton, la deuxième génération change l’approche :

- les **dispenses** sont élargies et précisées (11.3(3)), sous réserve que $f_{yd} \le 25\,f_{cd}$ et $\gamma_C \le 1.5$ :
  - les cadres, étriers et épingles conformes à 12.3.3 ;
  - les crochets et coudes standard qui n’ont pas besoin de plus de 5 φ d’ancrage au-delà de la courbure, à au moins 1,5 φ d’un bord parallèle au coude et à au moins 3 φ de la barre voisine ;
  - avec $f_{yk} \le 500$ MPa et $f_{ck} \ge 25$ MPa, les coudes d’au plus 45°, à 2,5 φ du bord et 5 φ de la barre voisine, avec au moins 4 φ de partie droite entre deux coudes ;
- en dehors de ces cas, une **nouvelle vérification** (11.1) compare la contrainte dans la barre à une limite. Cette limite croît avec le diamètre du mandrin, la résistance du béton, le granulat et l’enrobage, et elle dépend de l’angle du coude. Des barres transversales placées dans le coude la majorent (11.2).

En 2004, la dispense tenait en une condition : une barre ancrée sur au plus 5 φ après le coude, ou une barre éloignée de la paroi avec une barre transversale dans le coude. Il fallait de plus un mandrin conforme au tableau 8.1N. Sinon, le mandrin découlait de l’expression (8.1).

## Pourquoi

La barre tendue presse le béton contre la face intérieure du coude, comme un câble sur une poulie : la pression vaut l’effort divisé par le rayon. L’expression de 2004 traduisait ce seul équilibre, avec une diffusion limitée par l’entraxe ou l’enrobage. Elle ignorait le confinement, l’angle du coude et l’effet favorable des barres transversales, d’où des mandrins très grands pour une barre plastifiée en rive. La formule de 2023 intègre ces paramètres.

## Le calcul dans les deux générations

**Endommagement de l’acier**, identique (tableau 8.1N a) ; 11.3(2)) :

$$
\varphi_{m,min} = 4\,\varphi \ (\varphi \le 16\ \text{mm}), \qquad \varphi_{m,min} = 7\,\varphi \ (\varphi > 16\ \text{mm})
$$

**Béton dans la courbure, première génération** (8.3(3)) :

$$
\varphi_{m,min} \ge \frac{F_{bt}}{f_{cd}}\left(\frac{1}{a_b} + \frac{1}{2\,\varphi}\right)
$$

avec $F_{bt}$ l’effort de la barre au début du coude, $a_b$ le demi-entraxe perpendiculairement au plan du coude, ou l’enrobage plus φ/2 pour une barre de rive, et $f_{cd}$ plafonnée à celle du C55/67.

La vérification de 2023 (11.1) n’est pas codée : sa structure se lit mal sur l’exemplaire disponible.

## L’exemple type : crosse d’un HA20 en rive

HA20 plastifié, coudé sur le mandrin minimal de 7 φ = 140 mm, avec 50 mm d’enrobage latéral ($a_b$ = 60 mm), dans un C30/37.

```exemple
{
  "nom": "crosse-ha20",
  "mecanisme": "mandrin",
  "entree": { "phi": 20, "phiMand": 140, "fck": 30, "sigmaSd": 434.78, "ab": 60 },
  "attendus": {
    "ec2-2004/dommage.sollicitation": "140",
    "ec2-2023/dommage.sollicitation": "140",
    "ec2-2004/beton.F_bt": "136,6",
    "ec2-2004/beton.sollicitation": "284,6",
    "ec2-2004/beton.taux": "2,033"
  }
}
```

Le mandrin de {{crosse-ha20:ec2-2004/dommage.sollicitation}} mm suffit pour l’acier dans les deux générations. En 2004, si la barre a besoin de plus de 5 φ d’ancrage après le coude, le béton impose {{crosse-ha20:ec2-2004/beton.sollicitation}} mm, soit {{crosse-ha20:ec2-2004/beton.taux}} fois le mandrin prévu. C’est le cas typique d’une crosse en about de poutre ou en tête de poteau, où ce mandrin est irréalisable. En 2023, la même crosse sort des dispenses dès qu’elle a besoin de plus de 5 φ après la courbure. Elle relève alors de la formule (11.1), qui tient compte du granulat, de l’angle du coude et des barres transversales.

{{calculateur:crosse-ha20}}

## L’effet sur une note de calcul existante

- Les **mandrins courants** (4 φ, 7 φ) ne changent pas, ni pour les cadres ni pour les crochets standard.
- Les **coudes de barres tendues en rive** (crosses, attentes coudées, nœuds de portique) sont à reprendre avec (11.1) : en 2004, l’expression (8.1) y conduisait souvent à un mandrin irréalisable.
- La note doit préciser l’**angle du coude** et la **distance au bord parallèle** au coude, qui entrent dans les dispenses de 2023.

## Ce qu’il faudra vérifier

- **Formule (11.1)** et facteur $k_{trans}$ (11.2) : à relire sur l’exemplaire papier avant de les coder.
- Les mandrins des barres soudées près de la courbure et des treillis cintrés après soudage (tableau 8.1N b)) ne sont pas traités.
