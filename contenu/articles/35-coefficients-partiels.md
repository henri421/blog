---
titre: Coefficients partiels des matériaux
ordre: 35
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les coefficients γC = 1,5 et γS = 1,15 ne changent pas, mais deux nouveaux apparaissent, γV pour l’effort tranchant sans armature et γCE pour la rigidité, et la résistance de calcul du béton intègre désormais la durée du chargement et la fragilité des hautes résistances.
motscles: materiaux-beton, elu
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Les valeurs recommandées des **situations durables et transitoires** restent $\gamma_C$ = 1,5 pour le béton et $\gamma_S$ = 1,15 pour l’acier. Plusieurs choses changent autour d’elles (4.3.3, tableau 4.3) :

- un coefficient **$\gamma_V$ = 1,4** s’applique aux résistances à l’effort tranchant et au poinçonnement sans armature d’effort tranchant ([article 01](tranchant-sans-armature.html)) ;
- un coefficient **$\gamma_{CE}$** s’applique au module d’élasticité dans les calculs de rigidité (second ordre, [article 20](second-ordre.html)) : 1,5 avec la valeur indicative du module, 1,3 avec un module mesuré ;
- en **situation accidentelle**, $\gamma_C$ passe de 1,2 à 1,15, et $\gamma_V$ vaut aussi 1,15 ;
- les **éléments coulés dans le sol sans tubage permanent** voient $\gamma_C$ multiplié par $k_{cip}$ = 1,1, comme le $k_f$ des pieux en 2004. La valeur 1,0 s’applique aux pieux exécutés selon les normes d’exécution EN 1536, EN 1538 ou EN 14199 ;
- les valeurs **réduites** de l’annexe A, informative, sont liées à des mesures qui réduisent l’incertitude sur la résistance calculée. C’est le cas, par exemple, de la prise en compte d’une hauteur utile de calcul $d_d$ (4.3.3(2) et (3)).

Surtout, la **résistance de calcul du béton** n’est plus $f_{ck}/\gamma_c$. Elle devient $f_{cd} = \eta_{cc}\,k_{tc}\,f_{ck}/\gamma_C$ (5.1.6). $\eta_{cc} = (40/f_{ck})^{1/3} \le 1$ traduit la fragilité des bétons de plus de 40 MPa, et $k_{tc}$ = 0,85 l’effet d’une charge appliquée avant 90 jours. Le coefficient $\alpha_{cc}$ de 2004, recommandé à 1,0 mais souvent fixé à 0,85 par les annexes nationales, disparaît.

## Pourquoi

En 2004, le seul coefficient $\alpha_{cc}$ devait couvrir à la fois les effets de durée du chargement et ceux du diagramme de calcul, et chaque pays le fixait à sa manière, de 0,85 à 1,0. La deuxième génération les sépare : $k_{tc}$ pour la durée du chargement, $\eta_{cc}$ pour la fragilité des hautes résistances. La résistance à l’effort tranchant sans armature reçoit son propre coefficient $\gamma_V$, parce que son expression est calée directement sur des essais.

## Le calcul dans les deux générations

**Première génération** (2.4.2.4, 3.1.6(1)) : $f_{cd} = \alpha_{cc}\,f_{ck}/\gamma_c$ avec $\alpha_{cc}$ = 1,0 recommandé.

**Deuxième génération** (4.3.3, 5.1.6) :

$$
f_{cd} = \eta_{cc}\,k_{tc}\,\frac{f_{ck}}{\gamma_C}, \qquad \eta_{cc} = \min\left(\left(\frac{40}{f_{ck}}\right)^{1/3} \;;\; 1\right)
$$

Dans les deux générations, $f_{yd} = f_{yk}/\gamma_S$.

## L’exemple type : C30/37 et B500

```exemple
{
  "nom": "c30-durable",
  "mecanisme": "coefficients-partiels",
  "entree": { "fck": 30, "fyk": 500, "situation": "durable", "sansTubage": "non" },
  "attendus": {
    "ec2-2004/base.resistance": "20,00",
    "ec2-2023/base.resistance": "17,00",
    "ec2-2023/base.f_yd": "434,8"
  }
}
```

```exemple
{
  "nom": "c30-accidentelle",
  "mecanisme": "coefficients-partiels",
  "entree": { "fck": 30, "fyk": 500, "situation": "accidentelle", "sansTubage": "non" },
  "attendus": {
    "ec2-2004/base.resistance": "25,00",
    "ec2-2023/base.resistance": "22,17"
  }
}
```

```exemple
{
  "nom": "c30-pieu",
  "mecanisme": "coefficients-partiels",
  "entree": { "fck": 30, "fyk": 500, "situation": "durable", "sansTubage": "oui" },
  "attendus": {
    "ec2-2004/base.resistance": "18,18",
    "ec2-2023/base.resistance": "15,45"
  }
}
```

| $f_{cd}$ du C30/37 (MPa) | 2004 ($\alpha_{cc}$ = 1) | 2023 |
|---|---:|---:|
| Situation durable | {{c30-durable:ec2-2004/base.resistance}} | {{c30-durable:ec2-2023/base.resistance}} |
| Situation accidentelle | {{c30-accidentelle:ec2-2004/base.resistance}} | {{c30-accidentelle:ec2-2023/base.resistance}} |
| Pieu coulé sans tubage | {{c30-pieu:ec2-2004/base.resistance}} | {{c30-pieu:ec2-2023/base.resistance}} |

Avec les valeurs recommandées, la résistance de calcul du béton baisse de 15 %. Par rapport à un pays qui retenait $\alpha_{cc}$ = 0,85, elle ne change pas pour un béton de 40 MPa au plus. Au-delà, $\eta_{cc}$ la réduit encore. La résistance de calcul de l’acier, {{c30-durable:ec2-2023/base.f_yd}} MPa, est inchangée.

{{calculateur:c30-durable}}

## L’effet sur une note de calcul existante

- **Béton comprimé** : vérifier quelle valeur de $\alpha_{cc}$ la note utilisait. Avec 1,0, la résistance de calcul en compression diminue de 15 % dans toutes les vérifications. Avec 0,85, seuls les bétons de plus de 40 MPa sont touchés.
- **Effort tranchant sans armature** : $\gamma_V$ = 1,4 s’applique à une expression nouvelle ; la comparaison se fait sur la résistance, pas sur le coefficient.
- **Pieux** : $k_{cip}$ remplace $k_f$, avec la même valeur.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs du tableau 4.3, de $k_{cip}$ et de $k_{tc}$ sont des paramètres nationaux.
- L’emploi des coefficients réduits de l’annexe A, informative.
