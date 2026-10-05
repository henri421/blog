---
titre: Cisaillement entre l’âme et la table
ordre: 8
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Le seuil de dispense ne dépend plus de la résistance en traction du béton mais de l’armature transversale minimale en place, et les bielles de la table comprimée peuvent se coucher davantage.
motscles: cisaillement, treillis, poutre, elu
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

Le modèle reste un treillis dans la table, mais le seuil en dessous duquel aucune armature de couture n’est ajoutée change de nature : en 2004, une fraction de la résistance en traction du béton ; en 2023, la capacité de l’armature transversale minimale déjà présente. Dans une table comprimée, l’inclinaison des bielles peut descendre jusqu’à $\cot\theta_f$ = 3 au lieu de 2, avec en contrepartie un coefficient $\nu$ plus bas.

## Pourquoi

Dans une poutre en T, l’effort de compression de la table croît de l’appui vers la section de moment maximal. Les parties de table en débord reçoivent leur part de cet effort par cisaillement à la jonction avec l’âme. Ce cisaillement est porté, comme dans l’âme, par des bielles inclinées dans le plan de la table, retenues par les armatures transversales.

La première génération dispensait de toute armature supplémentaire tant que la contrainte restait sous $0.4\,f_{ctd}$ : le béton non fissuré suffisait. La deuxième génération raisonne autrement : la table contient de toute façon une armature transversale minimale (pour la flexion transversale et la maîtrise de la fissuration) ; tant que cette armature, travaillant à $f_{yd}$, couvre le cisaillement, rien d’autre n’est nécessaire. Le seuil devient une capacité d’acier, et non plus une résistance du béton.

L’élargissement de la plage de $\cot\theta_f$ en table comprimée suit la même logique que dans l’âme : la compression longitudinale de la table retarde la fissuration et autorise des bielles plus couchées, à condition de réduire la résistance admise de la bielle.

## Les niveaux d’approximation

Dans les deux générations, la contrainte est $\tau_{Ed} = \Delta F_d / (h_f\,\Delta x)$ (6.20), (8.65), avec $\Delta x$ au plus égal à la moitié de la distance entre moment nul et moment maximal.

| | Niveau 1 : dispense | Niveau 2 : treillis dans la table |
|---|---|---|
| 2004 | $v_{Ed} \le 0.4\,f_{ctd}$ (6.2.4(6)) | $1 \le \cot\theta_f \le 2$ (comprimée), $\nu$ selon (6.6N) |
| 2023 | $\tau_{Ed} \le A_{st,min}\,f_{yd}/(s_f\,h_f)$ (8.66) | $1 \le \cot\theta_f \le 3$ (comprimée), $\nu$ = 0,5 |

Dans une table tendue, les deux générations limitent $\cot\theta_f$ à 1,25. La deuxième permet d’aller au-delà avec un $\nu$ calculé à partir de la déformation de la table (8.2.5(5)), niveau que le calculateur ne traite pas.

$$
\tau_{Ed} \le \frac{A_{sf}}{s_f\,h_f}\,f_{yd}\,\cot\theta_f, \quad \tau_{Ed}\left(\cot\theta_f + \tan\theta_f\right) \le \nu\,f_{cd}
$$

## L’exemple type : poutre en T de parking

Poutre en T, table comprimée de 15 cm, béton C30/37, armatures transversales HA10 tous les 20 cm (393 mm²/m), qui constituent aussi l’armature minimale. Sur la longueur $\Delta x$ = 1,5 m, l’effort de compression de la partie de table en débord varie de 267 kN.

```exemple
{
  "nom": "poutre-t",
  "mecanisme": "ame-table",
  "entree": { "dFd": 267, "dx": 1500, "hf": 150, "membrure": "comprimee", "fck": 30, "fyk": 500, "asf": 393, "astMin": 393 },
  "attendus": {
    "ec2-2004/seuil.sollicitation": "1,187",
    "ec2-2004/seuil.resistance": "0,541",
    "ec2-2004/seuil.taux": "2,195",
    "ec2-2004/treillis.cot θ_f": "2,00",
    "ec2-2004/treillis.resistance": "2,278",
    "ec2-2004/treillis.taux": "0,520",
    "ec2-2023/seuil.resistance": "1,139",
    "ec2-2023/seuil.taux": "1,042",
    "ec2-2023/treillis.cot θ_f": "2,54",
    "ec2-2023/treillis.resistance": "2,896",
    "ec2-2023/treillis.taux": "0,409"
  }
}
```

La contrainte vaut $\tau_{Ed}$ = {{poutre-t:ec2-2004/seuil.sollicitation}} MPa.

| | 2004 | 2023 |
|---|---:|---:|
| Niveau 1, seuil (MPa) | {{poutre-t:ec2-2004/seuil.resistance}} (taux de travail {{poutre-t:ec2-2004/seuil.taux}}) | {{poutre-t:ec2-2023/seuil.resistance}} (taux de travail {{poutre-t:ec2-2023/seuil.taux}}) |
| Niveau 2, $\cot\theta_f$ | {{poutre-t:ec2-2004/treillis.cot θ_f}} | {{poutre-t:ec2-2023/treillis.cot θ_f}} |
| Niveau 2, résistance (MPa) | {{poutre-t:ec2-2004/treillis.resistance}} (taux de travail {{poutre-t:ec2-2004/treillis.taux}}) | {{poutre-t:ec2-2023/treillis.resistance}} (taux de travail {{poutre-t:ec2-2023/treillis.taux}}) |

Le seuil de 2023 est deux fois plus élevé que celui de 2004 : dans cet exemple, il manque de peu, alors que celui de 2004 était dépassé de plus du double. Au niveau 2, la table de 2023 couche ses bielles jusqu’à $\cot\theta_f$ = {{poutre-t:ec2-2023/treillis.cot θ_f}} et dépasse la résistance de 2004, malgré un $\nu$ plus faible. Dans les deux générations, les HA10 tous les 20 cm suffisent.

{{calculateur:poutre-t}}

## L’effet sur une note de calcul existante

- Le seuil de dispense demande désormais l’**armature transversale minimale** de la table (12.2, tableau 12.1) ; une note qui se contentait de comparer la contrainte à $0.4\,f_{ctd}$ doit être reprise.
- Le cumul avec la **flexion transversale** suit une règle différente : en 2023, l’aire retenue est la plus grande des deux, ou, avec des armatures sur les deux faces, la plus grande des deux pour chaque face (8.2.5(6)) ; la règle de 2004 du « demi plus flexion » disparaît.
- Les tables tendues peuvent bénéficier d’un $\nu$ calculé, au prix d’une donnée de plus (la déformation de la table).

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les bornes de $\cot\theta_f$.
- L’armature transversale minimale des tables (tableau 12.1).
