---
titre: Armatures d’intégrité des planchers-dalles
ordre: 44
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-09 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-09
revise: 2026-10-09
resume: Les deux barres inférieures qui traversaient le poteau deviennent des armatures d’intégrité dimensionnées pour suspendre la dalle après un poinçonnement, en situation accidentelle.
motscles: robustesse, poinconnement, dispositions-constructives
historique:
  - 2026-10-09 : première rédaction.
---

## Ce qui change

Un plancher-dalle qui poinçonne au droit d’un poteau peut entraîner les poteaux voisins : la charge se reporte, les poinçonnements s’enchaînent et l’effondrement progresse. Les deux générations demandent des barres inférieures qui traversent le poteau, pour retenir la dalle après la rupture. Elles ne les traitent pas de la même façon.

- **2004** (9.4.1(3)) : au moins deux barres inférieures dans chaque direction orthogonale traversent les poteaux intérieurs. C’est une règle de moyens, sans calcul.
- **2023** (12.5.2) : pour les bâtiments de classe de conséquences CC2 et au-delà, ces armatures d’intégrité sont **dimensionnées**. Elles doivent reprendre l’effort tranchant de la situation accidentelle :

$$
V_{Rd,int} = \sum A_{s,int}\,f_{yd}\,k_{int} \ge V_{Ed}
$$

avec $k_{int}$ = 0,37 pour un acier de classe B et 0,49 pour la classe C. La classe A est exclue. Les barres sont ancrées dans le poteau ou le traversent, et sont placées dans la partie comprimée de la dalle, à l’intérieur des armatures verticales du poteau. $\sum A_{s,int}$ compte chaque barre qui traverse un bord du poteau : une barre continue, ancrée des deux côtés, compte deux fois.

Pour une dalle sans armature transversale, les barres supérieures sur appui retiennent aussi la dalle, par l’éclatement de leur enrobage. Leur contribution peut s’ajouter (12.5.2(3)) :

$$
V_{Rd,hog} = n_{hog}\,\frac{\sqrt{f_{ck}}}{\gamma_C}\,\varphi\,b_{ef,hog}, \qquad b_{ef,hog} = \min\{s - \varphi \,;\, 6\,\varphi \,;\, 4\,c\}
$$

où $n_{hog}$ est le nombre de barres sur appui qui traversent le contour de contrôle $b_{0,5}$ et sont ancrées de part et d’autre.

Une dalle munie d’armatures d’effort tranchant doit aussi en recevoir si ces armatures ne reprennent pas seules l’effort accidentel, $\rho_w\,f_{ywd}\,b_{0,5}\,d_v < V_{Ed}$ (12.11). L’effort à reprendre par les barres d’intégrité est alors $V_{Ed} - V_{Rd,w,int}$. Le calculateur ne traite pas ce cas.

## Pourquoi

Après poinçonnement, le cône de béton s’est détaché : il ne reste que l’acier pour suspendre la dalle. Les barres supérieures, proches de la face tendue, s’arrachent en faisant éclater leur enrobage. Les barres inférieures, qui passent sous le poteau, travaillent en membrane : elles se déforment fortement, prennent une inclinaison et retiennent la dalle par effet de chaînette. Le coefficient $k_{int}$ traduit cet effet de membrane : une partie seulement de la résistance de la barre devient verticale, et cette part croît avec la ductilité de l’acier. D’où la valeur plus élevée pour la classe C et l’exclusion de la classe A.

La vérification se fait en situation accidentelle, avec ses coefficients partiels : $\gamma_S$ = 1,0 et $\gamma_C$ = 1,15 (tableau 4.3).

## L’exemple type : poteau intérieur de plancher-dalle

Dalle de 25 cm, trame de 7 × 7 m, poteau intérieur. En situation accidentelle, avec 1,5 kN/m² de charges permanentes ajoutées et 3 kN/m² d’exploitation ($\psi_2$ = 0,3) : $(6.25 + 1.5 + 0.3 \times 3) \times 49 \approx$ 424 kN. Les barres d’intégrité sont 3 HA16 de classe B par direction, continues à travers le poteau : 12 traversées de bord, soit 2413 mm². Les barres sur appui sont des HA12 à 15 cm, enrobage 30 mm, C30/37 ; on en compte 16 qui traversent $b_{0,5}$ et sont ancrées.

```exemple
{
  "nom": "poteau-plancher-dalle",
  "mecanisme": "integrite",
  "entree": { "VEd": 424, "AsInt": 2413, "fyk": 500, "classe": "B", "fck": 30, "nHog": 16, "phiHog": 12, "sHog": 150, "cHog": 30 },
  "attendus": {
    "ec2-2023/base.V_Rd,int (12.10)": "446,4",
    "ec2-2023/base.taux": "0,949",
    "ec2-2023/appui.b_ef,hog": "72",
    "ec2-2023/appui.V_Rd,hog (12.12)": "65,8",
    "ec2-2023/appui.resistance": "512,2",
    "ec2-2023/appui.taux": "0,827"
  }
}
```

Les barres inférieures seules donnent {{poteau-plancher-dalle:ec2-2023/base.V_Rd,int (12.10)}} kN (taux {{poteau-plancher-dalle:ec2-2023/base.taux}}). Avec 2 HA16 par direction, la règle de 2004, on n’obtiendrait que 298 kN : la règle de moyens ne suffit plus. Les barres sur appui ajoutent {{poteau-plancher-dalle:ec2-2023/appui.V_Rd,hog (12.12)}} kN, avec une largeur efficace de {{poteau-plancher-dalle:ec2-2023/appui.b_ef,hog}} mm limitée par 6 φ. Ensemble : {{poteau-plancher-dalle:ec2-2023/appui.resistance}} kN, taux {{poteau-plancher-dalle:ec2-2023/appui.taux}}.

{{calculateur:poteau-plancher-dalle}}

## L’effet sur une note de calcul existante

- Dans un bâtiment de classe CC2 ou plus, les barres inférieures traversant les poteaux de plancher-dalle se **dimensionnent** désormais, sur l’effort tranchant accidentel. Deux barres par direction ne suffisent plus pour des trames courantes.
- La **classe de ductilité** de ces barres doit être B ou C, et elle compte : la classe C reprend un tiers d’effort en plus.
- La note doit fixer la **combinaison accidentelle** retenue pour $V_{Ed}$ et le décompte des barres qui traversent les bords du poteau.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La classe de conséquences à partir de laquelle les armatures d’intégrité sont exigées (CC2 dans le texte).
- Les coefficients partiels de la situation accidentelle.
