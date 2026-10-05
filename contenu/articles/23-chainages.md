---
titre: Chaînages de robustesse
ordre: 23
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française) et EN 1991-1-7:2025, annexe A (informative), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-06 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-06
revise: 2026-10-06
resume: Les efforts des chaînages périphériques et intérieurs ne sont plus des valeurs forfaitaires propres au béton ; ils renvoient à l’EN 1991-1-7 et croissent avec les charges du plancher, avec un minimum de 75 kN.
motscles: robustesse, dispositions-constructives
historique:
  - 2026-10-06 : première rédaction.
---

## Ce qui change

En 2004, l’Eurocode 2 fixait lui-même les efforts des chaînages, par des valeurs forfaitaires : 20 kN par mètre de largeur pour les chaînages intérieurs, au plus 70 kN pour le chaînage périphérique. En 2023, il renvoie à l’**EN 1991-1-7**, annexe A, commune à tous les matériaux : les efforts deviennent proportionnels à la charge du plancher reprise par le chaînage, avec un minimum de 75 kN. Les chaînages horizontaux des poteaux (150 kN) et des voiles (20 kN/m) ne changent pas. L’annexe A de l’EN 1991-1-7 est informative.

## Pourquoi

Un chaînage sert de cheminement de secours après la perte d’un appui : le plancher qui n’est plus porté doit être retenu en chaînette par les armatures continues. L’effort à reprendre dépend donc de la charge présente au moment de l’accident et de la portée franchie, ce que traduit l’expression de l’EN 1991-1-7. Une valeur forfaitaire propre au béton ne pouvait pas suivre cette dépendance ; la mettre dans l’Eurocode des actions permet aussi d’appliquer la même règle aux ossatures en acier ou en bois.

## Le calcul dans les deux générations

**Première génération** (9.10.2, valeurs recommandées) :

$$
F_{tie,per} = \min(10\,l_i \;;\; 70\,\text{kN}), \qquad F_{tie,int} = 20\ \text{kN/m}
$$

avec $l_i$ la longueur de la travée de rive en mètres.

**Deuxième génération** (12.9.3 ; EN 1991-1-7, A.3.1, ossatures) :

$$
T_i = \max\left(0.8\,(g_k + \psi\,q_k)\,s_t\,L_t \;;\; 75\,\text{kN}\right), \qquad T_p = \max\left(0.4\,(g_k + \psi\,q_k)\,s_t\,L_t \;;\; 75\,\text{kN}\right)
$$

avec $s_t$ l’espacement des chaînages, $L_t$ leur portée et $\psi$ le coefficient de combinaison de la situation accidentelle. Dans les deux cas, les armatures travaillent à $f_{yk}$ ; la deuxième génération exige un acier de classe de ductilité B ou C. Les murs porteurs relèvent d’autres expressions (A.3.2), que le calculateur ne traite pas.

## L’exemple type : immeuble de bureaux à ossature

Portiques tous les 6 m, poutres de 7,5 m, plancher de bureaux : $g_k$ = 6 kN/m², $q_k$ = 3 kN/m², $\psi$ = 0,5, B500.

```exemple
{
  "nom": "chainage-interieur",
  "mecanisme": "chainages",
  "entree": { "type": "interieur", "gk": 6, "qk": 3, "psi": 0.5, "st": 6, "Lt": 7.5, "fyk": 500 },
  "attendus": {
    "ec2-2004/base.resistance": "120,0",
    "ec2-2004/base.A_s": "240",
    "ec2-2023/ossature.resistance": "270,0",
    "ec2-2023/ossature.A_s": "540"
  }
}
```

```exemple
{
  "nom": "chainage-peripherique",
  "mecanisme": "chainages",
  "entree": { "type": "peripherique", "gk": 6, "qk": 3, "psi": 0.5, "st": 6, "Lt": 7.5, "fyk": 500 },
  "attendus": {
    "ec2-2004/base.resistance": "70,0",
    "ec2-2023/ossature.resistance": "135,0"
  }
}
```

| Chaînage | 2004 (kN) | 2023, sous réserve (kN) |
|---|---:|---:|
| Intérieur, par ligne de portique | {{chainage-interieur:ec2-2004/base.resistance}} | {{chainage-interieur:ec2-2023/ossature.resistance}} |
| Périphérique | {{chainage-peripherique:ec2-2004/base.resistance}} | {{chainage-peripherique:ec2-2023/ossature.resistance}} |

Les efforts doublent environ. Pour le chaînage intérieur, la section d’acier passe de {{chainage-interieur:ec2-2004/base.A_s}} à {{chainage-interieur:ec2-2023/ossature.A_s}} mm² par ligne de portique, soit, en pratique, de 2 HA14 à 3 HA16 si les armatures existantes des poutres ne sont pas déjà continues.

{{calculateur:chainage-interieur}}

## L’effet sur une note de calcul existante

- Les **chaînages intérieurs et périphériques** des bâtiments à ossature doivent être recalculés avec les charges du plancher ; pour des portées et des charges courantes de bureaux, l’effort double.
- Les armatures continues des poutres comptent dans le chaînage : la vérification porte surtout sur leur **continuité** (recouvrements, ancrages aux nœuds).
- La note doit indiquer la **classe de ductilité** de l’acier, B ou C exigée.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’emploi de l’annexe A de l’EN 1991-1-7, informative, et les valeurs du tableau 12.5 de l’EN 1992-1-1, paramètres nationaux.
