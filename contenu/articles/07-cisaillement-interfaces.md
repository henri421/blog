---
titre: Cisaillement aux interfaces entre bétons d’âges différents
ordre: 7
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: La cohésion n’est plus proportionnelle à la résistance en traction mais à la racine de fck, une classe « très rugueuse » apparaît, et un second niveau traite les armatures d’interface mal ancrées par l’effet de goujon.
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

La résistance d’une reprise de bétonnage garde la même structure, cohésion plus frottement plus couture, mais la cohésion devient proportionnelle à $\sqrt{f_{ck}}$ et le plafond passe de $0.5\,\nu\,f_{cd}$ à $0.30\,f_{cd}$. La deuxième génération ajoute une classe de surface très rugueuse, et un second niveau pour les armatures qui traversent l’interface sans pouvoir y être plastifiées, par exemple dans une dalle rapportée mince.

## Pourquoi

Une interface transmet le cisaillement par trois mécanismes : l’adhérence du béton neuf sur l’ancien (cohésion), le frottement sous une compression normale, et les armatures qui la traversent. Quand le glissement s’amorce, les aspérités font s’écarter les deux faces ; les armatures tendues par cet écartement serrent l’interface et y créent du frottement, d’où le terme $\rho\,f_{yd}\,\mu$.

Ce serrage suppose que les armatures soient ancrées des deux côtés au point d’atteindre leur limite d’élasticité. Dans une dalle rapportée de quelques centimètres, ce n’est souvent pas le cas. La deuxième génération distingue alors un second mécanisme : la barre, qui ne peut pas être tendue jusqu’à $f_{yd}$, travaille en **goujon**, fléchie entre les deux bétons, avec une cohésion réduite. C’est l’objet de la formule (8.77), issue des travaux de la *fib* sur les interfaces repris dans le Model Code.

## Les niveaux d’approximation

Dans les deux générations, la contrainte agissante est (6.24), (8.75) :

$$
\tau_{Edi} = \frac{\beta\,V_{Ed}}{z\,b_i}
$$

Première génération (6.2.5) :

$$
v_{Rdi} = c\,f_{ctd} + \mu\,\sigma_n + \rho\,f_{yd}\left(\mu\,\sin\alpha + \cos\alpha\right) \le 0.5\,\nu\,f_{cd}
$$

Deuxième génération, **niveau 1**, armatures absentes ou ancrées pour $f_{yd}$ (8.76) :

$$
\tau_{Rdi} = \frac{c_{v1}\,\sqrt{f_{ck}}}{\gamma_C} + \mu_v\,\sigma_n + \rho_i\,f_{yd}\left(\mu_v\,\sin\alpha + \cos\alpha\right) \le 0.30\,f_{cd} + \rho_i\,f_{yd}\,\cos\alpha
$$

Deuxième génération, **niveau 2**, armatures dont l’ancrage ne permet pas la plastification (8.77) :

$$
\tau_{Rdi} = \frac{c_{v2}\,\sqrt{f_{ck}}}{\gamma_C} + \mu_v\,\sigma_n + k_v\,\rho_i\,f_{yd}\,\mu_v + k_{dowel}\,\rho_i\,\sqrt{f_{yd}\,f_{cd}} \le 0.25\,f_{cd}
$$

Les coefficients $c$, $\mu$, $c_{v1}$, $c_{v2}$, $k_v$ et $k_{dowel}$ dépendent de la rugosité (6.2.5(2) ; tableau 8.2) ; le calculateur affiche, pour la rugosité choisie, la valeur qu’il emploie. Le niveau 2 n’est pas un raffinement du niveau 1 : il couvre une autre situation d’ancrage, et c’est la disposition constructive qui désigne le bon niveau.

## L’exemple type : dalle rapportée sur prédalle

Plancher de 20 cm sur prédalles, béton de prédalle C30/37 et béton coulé en place C25/30 ; la résistance de l’interface est celle du béton le plus faible. Près de l’appui, $V_{Ed}$ = 45 kN/m, bras de levier de la section composite 153 mm, tout l’effort de compression dans le béton coulé ($\beta$ = 1). Surface de prédalle laissée brute après vibration : interface **lisse**.

```exemple
{
  "nom": "predalle",
  "mecanisme": "interface",
  "entree": { "VEd": 45, "beta": 1, "z": 153, "bi": 1000, "rugosite": "lisse", "fck": 25, "fyk": 500, "Asi": 0, "alpha": 90, "sigmaN": 0 },
  "attendus": {
    "ec2-2004/base.sollicitation": "0,294",
    "ec2-2004/base.resistance": "0,239",
    "ec2-2004/base.taux": "1,229",
    "ec2-2023/armatures-ancrees.resistance": "0,267",
    "ec2-2023/armatures-ancrees.taux": "1,103"
  }
}
```

Sans armature d’interface, la contrainte de {{predalle:ec2-2004/base.sollicitation}} MPa dépasse la résistance dans les deux générations : {{predalle:ec2-2004/base.resistance}} MPa en 2004 (taux de travail {{predalle:ec2-2004/base.taux}}), {{predalle:ec2-2023/armatures-ancrees.resistance}} MPa en 2023 (taux de travail {{predalle:ec2-2023/armatures-ancrees.taux}}). Il faut une surface traitée ou des armatures de couture. Le choix « rugueuse » dans le calculateur montre l’effet d’un striage : la cohésion double environ.

{{calculateur:predalle}}

## Second exemple : armatures de couture

Les raidisseurs de la prédalle apportent 300 mm²/m d’armatures verticales traversant l’interface.

```exemple
{
  "nom": "predalle-armee",
  "mecanisme": "interface",
  "entree": { "VEd": 45, "beta": 1, "z": 153, "bi": 1000, "rugosite": "lisse", "fck": 25, "fyk": 500, "Asi": 300, "alpha": 90, "sigmaN": 0 },
  "attendus": {
    "ec2-2004/base.resistance": "0,318",
    "ec2-2004/base.taux": "0,925",
    "ec2-2023/armatures-ancrees.resistance": "0,345",
    "ec2-2023/armatures-ancrees.taux": "0,852",
    "ec2-2023/ancrage-insuffisant.resistance": "0,065",
    "ec2-2023/ancrage-insuffisant.taux": "4,523"
  }
}
```

| | Résistance (MPa) | Taux de travail |
|---|---:|---:|
| 2004 | {{predalle-armee:ec2-2004/base.resistance}} | {{predalle-armee:ec2-2004/base.taux}} |
| 2023, armatures ancrées | {{predalle-armee:ec2-2023/armatures-ancrees.resistance}} | {{predalle-armee:ec2-2023/armatures-ancrees.taux}} |
| 2023, ancrage insuffisant | {{predalle-armee:ec2-2023/ancrage-insuffisant.resistance}} | {{predalle-armee:ec2-2023/ancrage-insuffisant.taux}} |

Si les raidisseurs sont ancrés de part et d’autre pour atteindre $f_{yd}$, l’interface est vérifiée dans les deux générations. S’ils ne le sont pas, la deuxième génération retire la cohésion d’une surface lisse et ne garde que le goujon et un frottement réduit : la résistance s’effondre. La première génération ne faisait pas cette distinction ; elle supposait implicitement l’ancrage. C’est une question de disposition constructive que la note doit désormais trancher explicitement.

{{calculateur:predalle-armee}}

## L’effet sur une note de calcul existante

- La note doit **justifier l’ancrage** des armatures de couture de part et d’autre de l’interface ; à défaut, c’est la formule (8.77) qui s’applique.
- Une surface **très rugueuse** (aspérités d’au moins 6 mm) devient une classe à part, plus favorable que « rugueuse » ; elle doit être prescrite et contrôlée sur chantier.
- En traction normale à l’interface, la cohésion et le frottement disparaissent en deuxième génération ; la première génération gardait le frottement négatif.
- Les angles d’armatures admis s’élargissent (35° à 135° au lieu de 45° à 90°), ce qui autorise les raidisseurs inclinés dans les deux sens.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les coefficients de rugosité, si l’annexe nationale les modifie.
- Les règles d’espacement des armatures d’interface des dalles composites et l’armature minimale de rive (8.2.6(9)).
