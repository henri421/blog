---
titre: Béton non armé
ordre: 29
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les règles du béton non armé gardent leur forme, mais ses résistances de calcul baissent, de 15 % en compression et de 20 % en traction pour un béton courant. Une semelle non armée justifiée en 2004 peut ne plus l’être.
motscles: beton-non-arme, fondations, elu
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Le chapitre (14 en 2023, 12 en 2004) garde ses expressions : effort normal excentré, effort tranchant sous compression, semelles non armées. Ce qui change, ce sont les **résistances de calcul** auxquelles elles s’appliquent :

- en compression, $f_{cd,pl} = 0.8\,f_{cd}$, et $f_{cd}$ de 2023 contient déjà $k_{tc}$ = 0,85 et $\eta_{cc}$. En 2004, $f_{cd,pl} = 0.8\,f_{ck}/\gamma_c$ ;
- en traction, $f_{ctd,pl} = 0.8\,f_{ctd}$, et $f_{ctd}$ de 2023 contient $k_{tt}$ = 0,8 (14.2, 5.1.6(2)). En 2004, $f_{ctd,pl} = 0.8\,f_{ctk,0.05}/\gamma_c$.

Pour un béton courant chargé avant 90 jours, la résistance en compression du béton non armé baisse donc de 15 %, celle en traction de 20 %. Le coefficient $\eta$ des bétons de plus de 50 MPa disparaît de l’expression de l’effort normal, $\eta_{cc}$ jouant ce rôle dans $f_{cd}$.

Le domaine reste le même : voiles, poteaux, arcs, semelles, murs poids, pieux d’au moins 600 mm peu comprimés. L’élancement des voiles reste limité à $l_0/h$ = 25. La méthode simplifiée des voiles élancés change de forme : le facteur $\Phi$ tient compte en 2023 du fluage et de la résistance du béton.

## Pourquoi

Le béton non armé ne prévient pas avant de rompre. La réduction de 0,8 sur ses résistances, déjà présente en 2004, traduit ce manque de ductilité. En 2023, elle s’ajoute aux nouveaux coefficients de durée de chargement ($k_{tc}$ en compression, $k_{tt}$ en traction), qui s’appliquent à tout béton. Le cumul n’est pas une volonté propre au béton non armé : il découle de la nouvelle définition des résistances de calcul du chapitre 5.

## Le calcul dans les deux générations

**Effort normal excentré** d’une section rectangulaire ((12.2) ; (14.3)) :

$$
N_{Rd} = \eta\,f_{cd,pl}\,b\,h\left(1 - \frac{2\,e}{h}\right) \ \text{(2004)}, \qquad N_{Rd} = f_{cd,pl}\,b\,h\left(1 - \frac{2\,e}{h}\right) \ \text{(2023)}
$$

**Effort tranchant** sous un effort normal de compression ((12.3) à (12.7) ; (14.4) à (14.8)) :

$$
\tau_{cp} = \frac{1.5\,V_{Ed}}{A_{cc}} \le \tau_{Rd} = \sqrt{f_{ctd,pl}^2 + \sigma_{cp}\,f_{ctd,pl}}, \qquad \sigma_{cp} = \frac{|N_{Ed}|}{A_{cc}} \le \sigma_{c,lim} = f_{cd,pl} - 2\sqrt{f_{ctd,pl}\,(f_{ctd,pl} + f_{cd,pl})}
$$

au-delà de $\sigma_{c,lim}$, $\tau_{Rd}^2$ est diminué de $\left((\sigma_{cp} - \sigma_{c,lim})/2\right)^2$.

**Semelles superficielles** sous charge axiale ((12.13), (12.14) ; (14.13), (14.14)) :

$$
0.85\,\frac{h_F}{a_F} \ge \sqrt{\frac{3\,\sigma_{gd}}{f_{ctd,pl}}}, \qquad \text{ou simplement} \quad \frac{h_F}{a_F} \ge 2
$$

## L’exemple type : semelle filante sous voile

Semelle non armée en C25/30, débord de 400 mm de part et d’autre du voile, 500 mm d’épaisseur, pression de calcul du sol de 300 kN/m².

```exemple
{
  "nom": "semelle-filante",
  "mecanisme": "semelle-non-armee",
  "entree": { "fck": 25, "sigmaGd": 300, "aF": 400, "hF": 500 },
  "attendus": {
    "ec2-2004/pression.sollicitation": "456,2",
    "ec2-2004/pression.taux": "0,912",
    "ec2-2023/pression.sollicitation": "510,1",
    "ec2-2023/pression.taux": "1,021",
    "ec2-2023/simplifie.sollicitation": "800"
  }
}
```

```exemple
{
  "nom": "voile-excentre",
  "mecanisme": "non-arme-compression",
  "entree": { "fck": 25, "b": 1000, "h": 200, "e": 20, "NEd": 1500 },
  "attendus": {
    "ec2-2004/base.resistance": "2133,3",
    "ec2-2023/base.resistance": "1813,3",
    "ec2-2023/base.taux": "0,827"
  }
}
```

```exemple
{
  "nom": "voile-tranchant",
  "mecanisme": "non-arme-tranchant",
  "entree": { "fck": 25, "NEd": 500, "VEd": 100, "Acc": 200000 },
  "attendus": {
    "ec2-2004/base.resistance": "1,820",
    "ec2-2023/base.resistance": "1,582"
  }
}
```

La semelle qui demandait {{semelle-filante:ec2-2004/pression.sollicitation}} mm en 2004 en demande {{semelle-filante:ec2-2023/pression.sollicitation}} en 2023. Les 500 mm prévus ne suffisent plus : taux {{semelle-filante:ec2-2023/pression.taux}}. La règle simplifiée en demande toujours {{semelle-filante:ec2-2023/simplifie.sollicitation}}. Le voile de 200 mm, chargé avec 20 mm d’excentricité, passe de {{voile-excentre:ec2-2004/base.resistance}} à {{voile-excentre:ec2-2023/base.resistance}} kN de résistance. Son effort tranchant résistant passe de {{voile-tranchant:ec2-2004/base.resistance}} à {{voile-tranchant:ec2-2023/base.resistance}} MPa.

{{calculateur:semelle-filante}}

{{calculateur:voile-excentre}}

{{calculateur:voile-tranchant}}

## L’effet sur une note de calcul existante

- Les **semelles non armées** dimensionnées au plus juste par (12.13) sont à reprendre : l’épaisseur requise augmente d’environ 12 %, comme $\sqrt{1/0.8}$.
- Les **voiles et murs non armés** perdent environ 15 % de résistance à l’effort normal.
- La **règle simplifiée** $h_F \ge 2\,a_F$ ne change pas et reste du côté de la sécurité pour des pressions courantes.

## Ce qu’il faudra vérifier

- **Voiles élancés** : le facteur $\Phi$ de (14.11) se lit mal sur l’exemplaire disponible. La méthode simplifiée n’est pas codée, ni en 2004 ((12.11)) ni en 2023.
- **$k_{tt}$** : le calculateur retient 0,8, valeur d’une sollicitation à 28 jours au plus pour les ciments CN et CR (56 jours pour CS). La valeur pour une sollicitation tardive n’est pas proposée.
