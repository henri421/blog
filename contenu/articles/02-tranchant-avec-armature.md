---
titre: Effort tranchant avec armatures d’âme
ordre: 2
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Le treillis à inclinaison variable demeure ; la bielle perd de la résistance, et un niveau plus fin la relie à la déformation longitudinale, donc à la sollicitation.
motscles: effort-tranchant, treillis, elu, poutre
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-04 : vérification sur le texte ; au niveau 2, cot θ peut dépasser 2,5 (8.2.3(7)), second exemple recalculé.
---

## Ce qui change

Le modèle reste le treillis à inclinaison variable, avec la même résistance des armatures d’âme. La résistance de la bielle comprimée baisse à la deuxième génération, par le coefficient $\nu$ et par une nouvelle définition de $f_{cd}$ ; un niveau plus fin fait dépendre $\nu$ de la déformation longitudinale de l’élément.

## Pourquoi

Dans un treillis, l’effort tranchant est porté par des bielles de béton inclinées d’un angle $\theta$ et par des armatures d’âme tendues. Plus les bielles sont couchées ($\cot\theta$ grand), plus chaque cadre est mobilisé, mais plus la bielle est comprimée. L’optimum est atteint quand les deux ruptures arrivent ensemble, dans la limite $1 \le \cot\theta \le 2.5$ pour des armatures de ductilité B ou C (8.2.3(4)) ; en classe A, la borne supérieure est réduite de 20 %.

Le béton d’une bielle traversée par des fissures et tendu transversalement résiste moins qu’en compression simple : c’est l’**adoucissement en compression** mis en évidence par Vecchio et Collins, repris par le Model Code 2010 à ses niveaux d’approximation supérieurs. La première génération le traduit par un coefficient forfaitaire qui ne dépend que de $f_{ck}$. La deuxième génération propose un coefficient forfaitaire plus bas et, en option, un coefficient qui dépend de la déformation longitudinale $\varepsilon_x$ : plus l’armature tendue s’allonge, plus la bielle est fissurée et moins elle porte.

La résistance de calcul du béton change aussi : $f_{cd}$ intègre un coefficient $\eta_{cc}$, qui réduit la résistance des bétons au-delà de 40 MPa pour tenir compte de leur fragilité, et un coefficient $k_{tc}$ = 0,85 pour une mise en charge avant 90 jours.

## Les niveaux d’approximation

Les deux générations partagent la forme de la résistance en contrainte sur $b_w\,z$, cadres verticaux :

$$
\tau_{Rd} = \min\left(\rho_w\,f_{ywd}\,\cot\theta \; ; \; \nu\,f_{cd}\,\frac{\cot\theta}{1 + \cot^2\theta}\right), \quad \rho_w = \frac{A_{sw}}{s\,b_w}
$$

et retiennent l’angle qui maximise cette résistance. Ce qui distingue les cellules :

| Génération et niveau | $\nu$ | $f_{cd}$ |
|---|---|---|
| 2004 (6.2.3) | $0.6\,(1 - f_{ck}/250)$ | $f_{ck}/\gamma_c$ |
| 2023, niveau 1 (8.2.3) | 0,5 | $\eta_{cc}\,k_{tc}\,f_{ck}/\gamma_C$ |
| 2023, niveau 2 (8.2.3, (8.45)) | fonction de $\varepsilon_x$ et de $\cot\theta$ | $\eta_{cc}\,k_{tc}\,f_{ck}/\gamma_C$ |

Au niveau 2, la déformation $\varepsilon_x$ est la moyenne des déformations des deux membrures ; celle de la membrure tendue découle de l’effort $F_{td} = M_{Ed}/z + V_{Ed}\cot\theta/2$. Ce niveau autorise des inclinaisons plus couchées que $\cot\theta$ = 2,5 (8.2.3(7)), toujours pour des armatures de ductilité B ou C : la réduction de $\nu$ avec $\cot^2\theta$ suffit à limiter l’angle. Comme $\nu$ dépend de $\cot\theta$ et $\cot\theta$ de $\nu$, l’optimum se cherche par itération : le calculateur affiche le nombre d’itérations. Il néglige le raccourcissement de la membrure comprimée, ce qui majore $\varepsilon_x$ et va dans le sens de la sécurité.

## L’exemple type : poutre de plancher

Poutre de 30 × 60 cm, $d$ = 550 mm, béton C30/37, cadres HA10 à deux brins ($A_{sw}$ = 157 mm²) tous les 125 mm, membrure tendue 4 HA25 ($A_{st}$ = 1963 mm²). Section à proximité de l’appui : $V_{Ed}$ = 550 kN, $M_{Ed}$ = 300 kN·m.

```exemple
{
  "nom": "poutre",
  "mecanisme": "tranchant-avec-armature",
  "entree": { "VEd": 550, "MEd": 300, "bw": 300, "d": 550, "Asw": 157, "s": 125, "fck": 30, "fyk": 500, "Ast": 1963 },
  "attendus": {
    "ec2-2004/base.ν_1": "0,528",
    "ec2-2004/base.cot θ": "2,19",
    "ec2-2004/base.resistance": "592,3",
    "ec2-2004/base.taux": "0,928",
    "ec2-2023/nu-constant.f_cd": "17,0",
    "ec2-2023/nu-constant.cot θ": "1,92",
    "ec2-2023/nu-constant.resistance": "517,8",
    "ec2-2023/nu-constant.taux": "1,063",
    "ec2-2023/nu-variable.ε_x": "0,00143",
    "ec2-2023/nu-variable.ν": "0,480",
    "ec2-2023/nu-variable.cot θ": "1,87",
    "ec2-2023/nu-variable.resistance": "504,2",
    "ec2-2023/nu-variable.taux": "1,091"
  }
}
```

**Première génération.** Avec $\nu_1$ = {{poutre:ec2-2004/base.ν_1}}, l’égalité entre cadres et bielle donne $\cot\theta$ = {{poutre:ec2-2004/base.cot θ}} et $V_{Rd}$ = {{poutre:ec2-2004/base.resistance}} kN : taux de travail {{poutre:ec2-2004/base.taux}}.

**Deuxième génération, niveau 1.** Pour un C30/37, $\eta_{cc}$ = 1 et $f_{cd}$ = {{poutre:ec2-2023/nu-constant.f_cd}} MPa. Avec $\nu$ = 0,5, l’optimum tombe à $\cot\theta$ = {{poutre:ec2-2023/nu-constant.cot θ}} et $V_{Rd}$ = {{poutre:ec2-2023/nu-constant.resistance}} kN : taux de travail {{poutre:ec2-2023/nu-constant.taux}}.

**Deuxième génération, niveau 2.** À l’optimum, $\varepsilon_x$ = {{poutre:ec2-2023/nu-variable.ε_x}}, $\nu$ = {{poutre:ec2-2023/nu-variable.ν}} et $\cot\theta$ = {{poutre:ec2-2023/nu-variable.cot θ}} : $V_{Rd}$ = {{poutre:ec2-2023/nu-variable.resistance}} kN, taux de travail {{poutre:ec2-2023/nu-variable.taux}}.

La même section, conforme en première génération, ne l’est plus en deuxième. L’écart vient entièrement de la bielle : dans les trois cellules, c’est elle qui fixe l’angle optimal. Le niveau 2 rend ici une résistance légèrement inférieure au niveau 1 : avec un moment notable, la membrure tendue s’allonge et $\nu$ descend sous 0,5.

{{calculateur:poutre}}

## Second exemple : cadres espacés

La même poutre, avec des cadres HA8 tous les 200 mm, sous $V_{Ed}$ = 250 kN et $M_{Ed}$ = 150 kN·m.

```exemple
{
  "nom": "cadres-espaces",
  "mecanisme": "tranchant-avec-armature",
  "entree": { "VEd": 250, "MEd": 150, "bw": 300, "d": 550, "Asw": 100.5, "s": 200, "fck": 30, "fyk": 500, "Ast": 1257 },
  "attendus": {
    "ec2-2004/base.cot θ": "2,50",
    "ec2-2004/base.resistance": "270,4",
    "ec2-2023/nu-constant.resistance": "270,4",
    "ec2-2023/nu-variable.cot θ": "2,66",
    "ec2-2023/nu-variable.ν": "0,345",
    "ec2-2023/nu-variable.resistance": "287,3",
    "ec2-2023/nu-variable.taux": "0,870"
  }
}
```

Quand les cadres gouvernent à $\cot\theta$ = {{cadres-espaces:ec2-2004/base.cot θ}}, la première génération et le niveau 1 de la deuxième coïncident : {{cadres-espaces:ec2-2004/base.resistance}} kN. Pour une poutre de bâtiment modérément sollicitée, le niveau forfaitaire ne change rien ; l’écart n’apparaît que lorsque la bielle devient déterminante, c’est-à-dire avec un ferraillage d’âme dense ou une âme mince.

Le niveau 2 va plus loin : libéré de la borne 2,5, il couche la bielle jusqu’à $\cot\theta$ = {{cadres-espaces:ec2-2023/nu-variable.cot θ}}, avec $\nu$ = {{cadres-espaces:ec2-2023/nu-variable.ν}}, et rend {{cadres-espaces:ec2-2023/nu-variable.resistance}} kN (taux de travail {{cadres-espaces:ec2-2023/nu-variable.taux}}). Ici, le niveau le plus fin est le plus favorable ; dans l’exemple précédent, il l’était moins. C’est le même mécanisme, avec des données différentes.

{{calculateur:cadres-espaces}}

## L’effet sur une note de calcul existante

- Toute vérification où la **bielle** gouverne est à reprendre : sections fortement sollicitées près des appuis, âmes minces, bétons de haute résistance (où $\eta_{cc}$ intervient).
- Les vérifications gouvernées par les **cadres** se transposent sans écart, à $f_{ywd}$ égal.
- Le niveau 2 demande le **moment concomitant** et la section de la membrure tendue, comme pour l’effort tranchant sans armature.
- Le coefficient $k_{tc}$ suppose une mise en charge avant 90 jours ; pour un ouvrage mis en charge tardivement, la valeur diffère et n’est pas traitée par ce calculateur.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\nu$ au niveau forfaitaire (0,5 recommandé).
- Les bornes de $\cot\theta$ et leur modulation par l’effort normal ou la classe de ductilité.
- Les conditions d’emploi de $\nu$ calculé, qui autorise de dépasser la borne forfaitaire de $\cot\theta$.
- La valeur de $k_{tc}$ et ses conditions d’emploi.
