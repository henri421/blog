---
titre: Propriétés de calcul du béton
ordre: 12
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: La résistance de calcul en compression intègre la fragilité des bétons à haute résistance et la durée de chargement ; la résistance de calcul en traction est réduite ; le module d’élasticité change de formule.
motscles: materiaux-beton
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

La résistance de calcul en compression n’est plus $f_{ck}/\gamma_c$ multiplié par une constante : un coefficient $\eta_{cc}$ la réduit au-delà de 40 MPa, et un coefficient $k_{tc}$ la réduit de 15 % quand la charge de calcul peut s’appliquer avant trois mois. La résistance de calcul en traction est réduite par $k_{tt}$, et le module d’élasticité suit une loi en racine cubique de $f_{cm}$.

## Pourquoi

Le coefficient $\alpha_{cc}$ de la première génération recouvrait deux effets différents, laissés au choix national entre 0,8 et 1,0 : la perte de résistance sous charge soutenue, et l’écart entre l’éprouvette et la structure. La deuxième génération les sépare.

- $\eta_{cc}$ traduit la **fragilité** croissante des bétons à haute résistance : plus le béton est résistant, moins il redistribue avant rupture, et moins la résistance de l’éprouvette est atteinte dans la structure. La réduction commence à 40 MPa.
- $k_{tc}$ traduit l’effet des **charges soutenues** : la résistance d’un béton chargé longtemps est inférieure à sa résistance instantanée, sauf si la charge arrive assez tard pour que le gain de résistance après 28 jours compense cette perte.

Le module d’élasticité adopte la forme du Model Code, proportionnelle à la racine cubique de la résistance moyenne, avec un coefficient qui dépend de la nature des granulats.

## Le calcul dans les deux générations

$$
f_{cd} = \alpha_{cc}\,\frac{f_{ck}}{\gamma_c} \quad (2004), \qquad f_{cd} = \eta_{cc}\,k_{tc}\,\frac{f_{ck}}{\gamma_C}, \quad \eta_{cc} = \left(\frac{40}{f_{ck}}\right)^{1/3} \le 1 \quad (2023)
$$

$$
f_{ctd} = \alpha_{ct}\,\frac{f_{ctk,0.05}}{\gamma_c} \quad (2004), \qquad f_{ctd} = k_{tt}\,\frac{f_{ctk,0.05}}{\gamma_C} \quad (2023)
$$

Valeurs recommandées : $\alpha_{cc} = \alpha_{ct}$ = 1,0 ; $k_{tc}$ = 1,00 si la charge de calcul n’est pas attendue avant 3 mois (classes de montée en résistance CR et CN, $t_{ref}$ ≤ 28 jours), 0,85 sinon ; $k_{tt}$ = 0,80 dans les mêmes conditions de classe, 0,70 sinon.

## L’exemple type : C30/37 et C70/85

```exemple
{
  "nom": "c30",
  "mecanisme": "materiaux",
  "entree": { "fck": 30, "chargeTardive": "non" },
  "attendus": {
    "ec2-2004/base.f_cd": "20,0",
    "ec2-2023/base.f_cd": "17,0",
    "ec2-2004/base.f_ctd": "1,35",
    "ec2-2023/base.f_ctd": "1,08",
    "ec2-2004/base.E_cm": "32837",
    "ec2-2023/base.E_cm": "31939"
  }
}
```

```exemple
{
  "nom": "c70",
  "mecanisme": "materiaux",
  "entree": { "fck": 70, "chargeTardive": "non" },
  "attendus": {
    "ec2-2004/base.f_cd": "46,7",
    "ec2-2023/base.η_cc": "0,830",
    "ec2-2023/base.f_cd": "32,9"
  }
}
```

| | C30/37, 2004 | C30/37, 2023 | C70/85, 2004 | C70/85, 2023 |
|---|---:|---:|---:|---:|
| $f_{cd}$ (MPa) | {{c30:ec2-2004/base.f_cd}} | {{c30:ec2-2023/base.f_cd}} | {{c70:ec2-2004/base.f_cd}} | {{c70:ec2-2023/base.f_cd}} |
| $f_{ctd}$ (MPa) | {{c30:ec2-2004/base.f_ctd}} | {{c30:ec2-2023/base.f_ctd}} | | |
| $E_{cm}$ (MPa) | {{c30:ec2-2004/base.E_cm}} | {{c30:ec2-2023/base.E_cm}} | | |

Pour un C30/37 chargé tôt, seul $k_{tc}$ joue : $f_{cd}$ baisse de 15 %. Si la charge de calcul n’arrive pas avant trois mois, $f_{cd}$ revient à {{c30:ec2-2004/base.f_cd}} MPa. Pour un C70/85, $\eta_{cc}$ = {{c70:ec2-2023/base.η_cc}} s’ajoute : $f_{cd}$ passe de {{c70:ec2-2004/base.f_cd}} à {{c70:ec2-2023/base.f_cd}} MPa, près de 30 % de moins. Le balayage sur $f_{ck}$ montre où commence la réduction.

{{calculateur:c30}}

## L’effet sur une note de calcul existante

- Toutes les vérifications où la **résistance du béton comprimé** gouverne sont touchées : bielles d’effort tranchant, flexion à forte compression, poteaux, pressions localisées. La note doit indiquer l’âge de mise en charge pour justifier $k_{tc}$.
- Les bétons à **haute résistance** perdent une part notable de leur avantage en résistance de calcul.
- Les vérifications qui utilisent $f_{ctd}$ (ancrage de 2004, interfaces de 2004) n’ont pas d’équivalent direct en 2023, dont les expressions emploient plutôt $\sqrt{f_{ck}}$.

## Ce qu’il faudra vérifier dans l’annexe nationale

- $f_{ck,ref}$, $k_{tc}$ et $k_{tt}$, tous paramètres nationaux.
- La valeur de $k_E$ selon les granulats locaux.
