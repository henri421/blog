---
titre: Ouverture de fissure calculée
ordre: 4
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-09
resume: L’espacement maximal devient un espacement moyen converti par un coefficient, l’enrobage pèse moins, et la courbure de la section augmente l’ouverture en surface.
motscles: fissuration, els
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-04 : vérification sur le texte ; k_w = 1,7 (9.2.3(2)) au lieu de 1,3, exemple recalculé ; limite liée à k_surf.
  - 2026-10-09 : maîtrise simplifiée de l’annexe S (S.6, S.7) ajoutée au calculateur.
---

## Ce qui change

L’ouverture se calcule à partir d’un espacement **moyen** des fissures, multiplié par un coefficient qui le convertit en valeur caractéristique, et non plus d’un espacement maximal. Un facteur de courbure ramène l’ouverture du niveau de l’armature à la surface tendue, le terme d’enrobage pèse moins de moitié de ce qu’il pesait, et les ouvertures limites dépendent désormais de l’enrobage réel.

## Pourquoi

Dans les deux générations, l’ouverture d’une fissure est le produit d’une longueur, l’espacement des fissures, par une déformation moyenne, l’écart entre l’allongement de l’acier et celui du béton entre deux fissures. Cette déformation moyenne est calculée de la même manière : la contrainte de l’acier dans la fissure, diminuée de la participation du béton tendu entre fissures, avec un plancher.

L’espacement change de nature. La première génération donne directement un espacement **maximal**, dont le terme d’enrobage (3,4 $c$) est volontairement lourd. La deuxième génération reprend la démarche du Model Code : un espacement **moyen**, fondé sur la longueur de transfert par adhérence, avec un terme d’enrobage plus faible (1,5 $c$), puis un coefficient $k_w$ = 1,7 qui convertit l’ouverture moyenne en ouverture calculée.

Enfin, une fissure de flexion s’ouvre en coin : elle est plus large en surface qu’au niveau de l’armature. La première génération l’ignore ; la deuxième le prend en compte par le rapport $k_{1/r}$ entre les distances à l’axe neutre de la fibre extrême et de l’armature.

## Le calcul dans les deux générations

La contrainte de l’acier $\sigma_s$ est commune : section fissurée élastique, béton tendu négligé, coefficient d’équivalence $\alpha_e$ saisi. Le calculateur ne compare que la traduction de cette contrainte en ouverture.

Première génération (7.3.4), barres espacées d’au plus $5\,(c + \phi/2)$ :

$$
w_k = s_{r,max}\,(\varepsilon_{sm} - \varepsilon_{cm}), \quad s_{r,max} = 3.4\,c + 0.425\,k_1\,k_2\,\frac{\phi}{\rho_{p,eff}}
$$

Deuxième génération (9.2.3) :

$$
w_{k,cal} = k_w\,k_{1/r}\,s_{r,m,cal}\,(\varepsilon_{sm} - \varepsilon_{cm}), \quad s_{r,m,cal} = 1.5\,c + \frac{k_{fl}\,k_b}{7.2}\,\frac{\phi}{\rho_{eff}}
$$

$$
k_{1/r} = \frac{h - x}{h - a_y - x}
$$

La hauteur de la zone tendue effective change aussi : la deuxième génération la limite en fonction du diamètre des barres et de leur distance au parement, et réduit la largeur effective quand les barres sont très espacées.

La vérification sans calcul direct change aussi de forme. La première génération la donne par des tableaux de diamètres et d’espacements maximaux (7.3.3). La deuxième la remplace, dans son annexe S (informative), par deux formules : l’une borne le diamètre des barres, l’autre leur espacement, pour une ouverture limite donnée.

$$
\phi \le \frac{2.1\,\rho_p\,d}{a\,k_{fl,simpl}\,k_{b,simpl}} \left( \frac{w_{lim,cal}}{0.9\,k_w\,k_{1/r,simpl}\,\sigma_s/E_s} - 1.5\,c \right)
$$

Ce n’est pas une méthode nouvelle : c’est la formule générale où la zone tendue effective vaut 3,5 fois la distance $a$ du parement au centre des barres, et où l’écart de déformation est pris forfaitairement à 90 % de $\sigma_s/E_s$. Le coefficient 2,1 vient de là (7,2/3,5). Le calculateur inverse cette formule : il affiche l’ouverture pour laquelle le diamètre réel atteindrait la borne, puis le diamètre et l’espacement maximaux pour l’ouverture limite saisie.

## L’exemple type : dalle de logement en service

Dalle de 22 cm, $d$ = 190 mm, nappe inférieure HA12 tous les 15 cm, enrobage 24 mm, béton C25/30. Moment quasi permanent $M_{qp}$ = 25 kN·m/m, charges de longue durée, coefficient d’équivalence 15 pour le calcul de $\sigma_s$, ouverture limite 0,3 mm.

```exemple
{
  "nom": "dalle-service",
  "mecanisme": "fissuration",
  "entree": { "b": 1000, "h": 220, "d": 190, "phi": 12, "s": 150, "c": 24, "Mqp": 25, "fck": 25, "alphaE": 15, "duree": "longue", "wmax": 0.3 },
  "attendus": {
    "ec2-2004/base.x": "55,2",
    "ec2-2004/base.σ_s": "193,2",
    "ec2-2004/base.ε_sm − ε_cm": "0,000580",
    "ec2-2004/base.s_r,max": "230",
    "ec2-2004/base.sollicitation": "0,133",
    "ec2-2004/base.taux": "0,444",
    "ec2-2023/base.h_c,eff": "90",
    "ec2-2023/base.s_r,m,cal": "121",
    "ec2-2023/base.k_1/r": "1,22",
    "ec2-2023/base.sollicitation": "0,145",
    "ec2-2023/base.taux": "0,484",
    "ec2-2023/annexe-s.sollicitation": "0,253",
    "ec2-2023/annexe-s.taux": "0,843",
    "ec2-2023/annexe-s.φ_max (S.6)": "15,0",
    "ec2-2023/annexe-s.s_max (S.7)": "233"
  }
}
```

La section fissurée donne $x$ = {{dalle-service:ec2-2004/base.x}} mm et $\sigma_s$ = {{dalle-service:ec2-2004/base.σ_s}} MPa. Dans les deux générations, l’écart de déformation est gouverné par son plancher : {{dalle-service:ec2-2004/base.ε_sm − ε_cm}}.

| | 2004 | 2023 |
|---|---:|---:|
| Espacement des fissures (mm) | {{dalle-service:ec2-2004/base.s_r,max}} (maximal) | {{dalle-service:ec2-2023/base.s_r,m,cal}} (moyen) |
| Facteur de courbure | sans objet | {{dalle-service:ec2-2023/base.k_1/r}} |
| Ouverture calculée (mm) | {{dalle-service:ec2-2004/base.sollicitation}} | {{dalle-service:ec2-2023/base.sollicitation}} |
| Taux de travail pour 0,3 mm | {{dalle-service:ec2-2004/base.taux}} | {{dalle-service:ec2-2023/base.taux}} |

La voie simplifiée de l’annexe S donne {{dalle-service:ec2-2023/annexe-s.sollicitation}} mm (taux {{dalle-service:ec2-2023/annexe-s.taux}}) : elle reste vérifiée, avec un diamètre maximal de {{dalle-service:ec2-2023/annexe-s.φ_max (S.6)}} mm pour des HA12, ou un espacement maximal de {{dalle-service:ec2-2023/annexe-s.s_max (S.7)}} mm pour 15 cm, mais avec une marge bien moindre que le calcul complet. C’est le prix de la zone tendue prise forfaitairement.

L’espacement moyen est près de deux fois plus court que l’espacement maximal, mais la conversion par $k_w$ = 1,7 et la courbure font plus que compenser : l’ouverture calculée de deuxième génération est ici supérieure à celle de la première. Les deux termes de l’espacement diminuent : le terme d’enrobage, par son coefficient, et le terme d’adhérence, qui intègre $k_{fl}$ et $k_b$ et une zone tendue effective calculée autrement. Le détail de chacun est affiché par le calculateur.

{{calculateur:dalle-service}}

Le balayage sur l’enrobage montre la différence de sensibilité : en première génération, chaque millimètre d’enrobage ajoute 3,4 mm à l’espacement ; en deuxième génération, 1,5 mm avant conversion. Le résultat se compare en outre à une limite elle-même liée à l’enrobage : pour les classes XC2 à XC4, la limite de durabilité de 0,3 mm est multipliée par un facteur $k_{surf}$ compris entre 1,0 et 1,5, qui croît avec l’enrobage réel rapporté à l’enrobage minimal de durabilité. Le calculateur prend la limite saisie telle quelle ; c’est à l’ingénieur d’y intégrer $k_{surf}$.

## L’effet sur une note de calcul existante

- Les ouvrages à **fort enrobage** (fondations, parois enterrées, classes d’exposition sévères) sont les plus touchés par le changement du terme d’enrobage.
- Le facteur de courbure dépend de la **hauteur totale** et de la position de l’armature : une note qui ne travaillait qu’avec $d$ doit aussi fournir $h$.
- La contrainte de l’acier se calcule comme avant ; le coefficient d’équivalence retenu pour la section fissurée reste un choix de l’ingénieur.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les ouvertures limites selon les classes d’exposition, et la définition de $k_{surf}$.
- La valeur de $k_w$ (1,7 recommandé).
- Les valeurs de $k_b$ selon les conditions d’adhérence.
