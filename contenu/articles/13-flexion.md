---
titre: Flexion simple à l’état-limite ultime
ordre: 13
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Une seule loi parabole-rectangle pour tous les bétons, la fragilité des hautes résistances passant dans fcd ; pour une poutre courante, le moment résistant ne change presque pas.
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

La loi de comportement du béton comprimé devient unique : parabole jusqu’à 2 ‰, palier jusqu’à 3,5 ‰, quelle que soit la classe. En 2004, ces paramètres variaient au-delà de C50/60 pour traduire la fragilité des bétons à haute résistance ; en 2023, cette fragilité est portée par $\eta_{cc}$ dans la résistance de calcul elle-même. Pour une poutre armée normalement, le moment résistant change à peine.

## Pourquoi

Un béton à haute résistance casse plus brutalement, avec un raccourcissement ultime plus faible. La première génération l’exprimait par la forme du diagramme : pic plus tardif, raccourcissement ultime plus court, parabole plus raide, ou, pour le bloc rectangulaire, des coefficients $\lambda$ et $\eta$ réduits. La deuxième génération exprime le même phénomène par une réduction de la résistance, $\eta_{cc} = (40/f_{ck})^{1/3}$, et garde un diagramme unique. Les deux approches visent le même effort résultant, mais par des voies différentes, et leur écart dépend de la hauteur comprimée.

Pour une poutre armée normalement, l’axe neutre est haut et le bras de levier proche de $d$ : une baisse de la résistance du béton ne fait qu’abaisser légèrement l’axe neutre, et le moment résistant varie peu. L’écart grandit quand la section est fortement armée et que le béton comprimé travaille vraiment.

## Le calcul dans les deux générations

Loi parabole-rectangle (3.1.7 ; 8.1.2) :

$$
\sigma_c = f_{cd}\left[1 - \left(1 - \frac{\varepsilon_c}{\varepsilon_{c2}}\right)^n\right] \quad \text{pour} \quad 0 \le \varepsilon_c \le \varepsilon_{c2}, \qquad \sigma_c = f_{cd} \quad \text{jusqu’à} \quad \varepsilon_{cu}
$$

| | $\varepsilon_{c2}$ | $\varepsilon_{cu}$ | $n$ | $f_{cd}$ |
|---|---|---|---|---|
| 2004, jusqu’à C50/60 | 2 ‰ | 3,5 ‰ | 2 | $f_{ck}/\gamma_c$ |
| 2004, au-delà | croît avec $f_{ck}$ | décroît avec $f_{ck}$ | décroît | $f_{ck}/\gamma_c$ |
| 2023, toutes classes | 2 ‰ | 3,5 ‰ | 2 | $\eta_{cc}\,k_{tc}\,f_{ck}/\gamma_C$ |

Le calculateur rend aussi le bloc rectangulaire de 2004 ; celui de 2023 n’est défini que par une figure dont les paramètres ne sont pas repris ici.

## L’exemple type : poutre de plancher

Poutre de 30 × 60 cm, $d$ = 550 mm, 4 HA20, béton C30/37, $M_{Ed}$ = 250 kN·m.

```exemple
{
  "nom": "poutre-flexion",
  "mecanisme": "flexion",
  "entree": { "b": 300, "d": 550, "As": 1257, "fck": 30, "fyk": 500, "MEd": 250, "chargeTardive": "non" },
  "attendus": {
    "ec2-2004/rectangle.resistance": "275,7",
    "ec2-2004/parabole.resistance": "275,0",
    "ec2-2004/parabole.x": "112,5",
    "ec2-2023/parabole.x": "132,4",
    "ec2-2023/parabole.resistance": "270,5",
    "ec2-2023/parabole.taux": "0,924"
  }
}
```

$f_{cd}$ baisse de 15 % ($k_{tc}$ = 0,85), l’axe neutre descend de {{poutre-flexion:ec2-2004/parabole.x}} à {{poutre-flexion:ec2-2023/parabole.x}} mm, et le moment résistant passe de {{poutre-flexion:ec2-2004/parabole.resistance}} à {{poutre-flexion:ec2-2023/parabole.resistance}} kN·m : moins de 2 %. Le bloc rectangulaire de 2004 donne {{poutre-flexion:ec2-2004/rectangle.resistance}} kN·m.

{{calculateur:poutre-flexion}}

## Second exemple : C70/85 fortement armé

La même poutre en C70/85, armée de 4909 mm², sous 900 kN·m.

```exemple
{
  "nom": "poutre-c70",
  "mecanisme": "flexion",
  "entree": { "b": 300, "d": 550, "As": 4909, "fck": 70, "fyk": 500, "MEd": 900, "chargeTardive": "non" },
  "attendus": {
    "ec2-2004/parabole.ε_cu2": "2,66",
    "ec2-2004/parabole.resistance": "987,1",
    "ec2-2023/parabole.resistance": "936,8"
  }
}
```

En 2004, le diagramme du C70/85 a un raccourcissement ultime réduit à {{poutre-c70:ec2-2004/parabole.ε_cu2}} ‰ ; en 2023, le diagramme reste standard mais $f_{cd}$ est réduit de près de 30 %. Le moment résistant passe de {{poutre-c70:ec2-2004/parabole.resistance}} à {{poutre-c70:ec2-2023/parabole.resistance}} kN·m, soit 5 % de moins : l’écart se creuse avec la classe et le taux d’armature, mais reste modéré en flexion.

{{calculateur:poutre-c70}}

## L’effet sur une note de calcul existante

- Pour les poutres et dalles **normalement armées**, le moment résistant change de un à deux pour cent : les notes de flexion se transposent sans surprise.
- Les sections **fortement armées** ou en béton à **haute résistance** perdent davantage ; la vérification de la ductilité (hauteur comprimée) devient aussi plus contraignante, puisque l’axe neutre descend.
- Les tableaux de paramètres du diagramme de 2004 au-delà de C50/60 disparaissent de la note.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les paramètres de $f_{cd}$ ($f_{ck,ref}$, $k_{tc}$), qui gouvernent ici tout l’écart.
