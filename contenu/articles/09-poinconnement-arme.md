---
titre: Poinçonnement avec armatures de poinçonnement
ordre: 9
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: La part du béton n’est plus un forfait de 75 % mais dépend de la sollicitation, l’efficacité des armatures est réduite selon leur diamètre et l’ouverture de la fissure, et le plafond dépend du système d’armatures.
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

En 2004, l’armature de poinçonnement s’ajoute à 75 % de la résistance du béton seul, avec un plafond fixe de 1,5 fois cette résistance (amendement de 2014). En 2023, la part du béton et l’efficacité des armatures dépendent toutes deux de la sollicitation, et le plafond dépend du système : les goujons à double tête autorisent davantage que les cadres.

## Pourquoi

La théorie de la fissure critique, qui fonde le poinçonnement de deuxième génération, donne une lecture simple de l’armature de poinçonnement. Plus la dalle tourne autour du poteau, plus la fissure critique s’ouvre : le béton porte moins, et les armatures, qui traversent la fissure, s’allongent davantage et se mobilisent mieux. Les deux contributions évoluent donc en sens inverse avec la charge.

La formule (8.104) traduit cet équilibre par deux coefficients. $\eta_c = \tau_{Rd,c}/\tau_{Ed}$ réduit la part du béton à mesure que la sollicitation dépasse sa résistance propre. $\eta_s$ réduit l’efficacité des armatures quand la fissure reste peu ouverte, d’autant plus que les barres sont de gros diamètre, car elles demandent plus d’ouverture pour se mettre en charge.

Le plafond $\tau_{Rd,max}$ traduit l’écrasement du béton près du poteau. Il dépend de la qualité d’ancrage du système : un goujon à double tête ancre sa barre aux deux extrémités sans glissement, un cadre moins bien. Le Model Code 2010 distinguait déjà les systèmes par un coefficient de même nature.

## Le calcul dans les deux générations

Première génération, poteau intérieur (6.4.5, A1:2014) :

$$
v_{Rd,cs} = 0.75\,v_{Rd,c} + 1.5\,\frac{d}{s_r}\,\frac{A_{sw}\,f_{ywd,ef}}{u_1\,d} \le k_{max}\,v_{Rd,c}, \quad f_{ywd,ef} = 250 + 0.25\,d \le f_{ywd}
$$

Deuxième génération (8.4.4) :

$$
\tau_{Rd,cs} = \eta_c\,\tau_{Rd,c} + \eta_s\,\rho_w\,f_{ywd} \ge \rho_w\,f_{ywd}, \quad \eta_c = \frac{\tau_{Rd,c}}{\tau_{Ed}}
$$

$$
\eta_s = \frac{d_v}{150\,\phi_w} + \left(\frac{15\,d_{dg}}{d_v}\right)^{1/2}\left(\frac{1}{\eta_c\,k_{pb}}\right)^{3/2} \le 0.8, \quad \tau_{Rd,max} = \eta_{sys}\,\tau_{Rd,c}
$$

Le calculateur vérifie le premier contour de contrôle et le plafond ; le contour extérieur, au-delà duquel les armatures ne sont plus nécessaires, n’est pas traité.

## L’exemple type : plancher-dalle chargé

Le plancher-dalle de l’article sur le poinçonnement sans armature, avec une réaction portée à 480 kN : la dalle seule ne suffit plus. On dispose dix files de goujons $\phi$10 autour du poteau, avec un espacement radial de 140 mm.

```exemple
{
  "nom": "plancher-arme",
  "mecanisme": "poinconnement-arme",
  "entree": { "VEd": 480, "c1": 300, "c2": 300, "dx": 205, "dy": 190, "Asx": 1026, "Asy": 1026, "fck": 30, "fyk": 500, "Dlower": 16, "systeme": "goujons", "phiW": 10, "nBrins": 10, "sr": 140 },
  "attendus": {
    "ec2-2004/base.v_Rd,cs (6.52)": "1,134",
    "ec2-2004/base.v_Rd,cs": "0,899",
    "ec2-2004/base.resistance": "568,7",
    "ec2-2004/base.taux": "0,843",
    "ec2-2023/base.η_c": "0,799",
    "ec2-2023/base.η_s": "0,80",
    "ec2-2023/base.τ_Rd,cs": "2,052",
    "ec2-2023/base.τ_Rd,max": "2,072",
    "ec2-2023/base.resistance": "641,6",
    "ec2-2023/base.taux": "0,748"
  }
}
```

**Première génération.** L’expression (6.52) donnerait {{plancher-arme:ec2-2004/base.v_Rd,cs (6.52)}} MPa, mais le plafond de l’A1:2014 la ramène à {{plancher-arme:ec2-2004/base.v_Rd,cs}} MPa : $V_{Rd}$ = {{plancher-arme:ec2-2004/base.resistance}} kN, taux de travail {{plancher-arme:ec2-2004/base.taux}}. Ajouter des goujons ne changerait rien : c’est le plafond qui gouverne.

**Deuxième génération.** La sollicitation dépasse la résistance du béton seul, d’où $\eta_c$ = {{plancher-arme:ec2-2023/base.η_c}} ; $\eta_s$ atteint son plafond de {{plancher-arme:ec2-2023/base.η_s}}. La résistance avec armatures vaut {{plancher-arme:ec2-2023/base.τ_Rd,cs}} MPa, juste sous le plafond des goujons, {{plancher-arme:ec2-2023/base.τ_Rd,max}} MPa : $V_{Rd}$ = {{plancher-arme:ec2-2023/base.resistance}} kN, taux de travail {{plancher-arme:ec2-2023/base.taux}}.

{{calculateur:plancher-arme}}

## Second exemple : cadres au lieu de goujons

Même dalle, mêmes armatures, mais sous forme de cadres.

```exemple
{
  "nom": "plancher-cadres",
  "mecanisme": "poinconnement-arme",
  "entree": { "VEd": 480, "c1": 300, "c2": 300, "dx": 205, "dy": 190, "Asx": 1026, "Asy": 1026, "fck": 30, "fyk": 500, "Dlower": 16, "systeme": "etriers", "phiW": 10, "nBrins": 10, "sr": 140 },
  "attendus": {
    "ec2-2023/base.η_sys": "1,49",
    "ec2-2023/base.τ_Rd,max": "1,827",
    "ec2-2023/base.resistance": "571,2",
    "ec2-2023/base.taux": "0,840"
  }
}
```

Avec des cadres, $\eta_{sys}$ tombe à {{plancher-cadres:ec2-2023/base.η_sys}} et le plafond, {{plancher-cadres:ec2-2023/base.τ_Rd,max}} MPa, gouverne : {{plancher-cadres:ec2-2023/base.resistance}} kN, taux de travail {{plancher-cadres:ec2-2023/base.taux}}. La deuxième génération rejoint alors la première ; c’est le choix du système, plus que la quantité d’acier, qui fait l’écart.

{{calculateur:plancher-cadres}}

## L’effet sur une note de calcul existante

- Le **système d’armatures** (goujons à double tête ou cadres) devient une donnée du calcul, et non plus seulement un choix d’exécution.
- La résistance avec armatures **dépend de la charge** par $\eta_c$ : une note qui calcule une résistance une fois pour toutes et la compare à plusieurs cas de charge doit la recalculer pour chacun.
- Le **diamètre** des armatures intervient dans $\eta_s$ : à section égale, des barres plus fines sont plus efficaces tant que $\eta_s$ n’atteint pas son plafond.
- La vérification du contour extérieur change aussi (8.4.4(7)) ; elle n’est pas reprise ici.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs de $\eta_{sys}$ selon les systèmes, et l’éventuel coefficient $\eta_{pm}$ d’effet de membrane.
- La définition de $c_v$ pour les différents types d’ancrage des armatures.
