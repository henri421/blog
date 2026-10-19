# Validation : pression intérieure et pression nette (EN 1991-1-4)

Calcul à la main, $q_p$ = 700 Pa. Ouvertures permanentes : 4 m² au vent
($c_{pe}$ = +0,8), 6 m² sous le vent et en pignons ($c_{pe}$ = −0,5).

$c_{pi} = (4^2 \times 0{,}8 + 6^2 \times (-0{,}5))/(16 + 36) = (12{,}8 - 18)/52 = -0{,}1$.

| Paroi | $c_{pe}$ | Défaut (+0,2 / −0,3) | Ouvertures ($c_{pi}$ = −0,1) |
|---|---|---|---|
| Toiture | −1,2 | 700 × (−1,2 − 0,2) = −980 → 980 Pa | 700 × (−1,2 + 0,1) = −770 → 770 Pa |
| Mur au vent | +0,8 | 700 × (0,8 + 0,3) = 770 Pa | 700 × (0,8 + 0,1) = 630 Pa |

## Figure 7.13 de 2005 (sans face dominante)

La figure est faite de segments droits, lus le 19/10/2026 : pour $h/d \le 0{,}25$,
de (0,33 ; +0,35) à (0,90 ; −0,30), puis −0,30 ; pour $h/d \ge 1$, de
(0,33 ; +0,35) à (0,95 ; −0,50), puis −0,50 ; interpolation linéaire en $h/d$
entre les deux (NOTE de 7.2.9(6)).

Rapport d'ouvertures (7.3) : $\mu = 6/(4 + 6) = 0{,}6$.

| $h/d$ | $c_{pi}$ | Toiture ($c_{pe}$ = −1,2) | Mur au vent ($c_{pe}$ = +0,8) |
|---|---|---|---|
| 0,2 | 0,35 − 0,65 × 0,27/0,57 = +0,0421 | 700 × (−1,2 − 0,0421) → 869,5 Pa | 700 × (0,8 − 0,0421) = 530,5 Pa |
| 1,0 | 0,35 − 0,85 × 0,27/0,62 = −0,0202 | 700 × (−1,2 + 0,0202) → 825,9 Pa | — |
| 0,625 | 0,0421 + 0,5 × (−0,0202 − 0,0421) = +0,0110 | — | — |

Avec 7 m² en pression et 3 m² en dépression, $\mu$ = 0,3 < 1/3 : la face au
vent est dominante (7.2.9(4)), la figure ne s'applique pas.

Script de contrôle indépendant (interpolation sur les points lus) : mêmes
valeurs à 10⁻⁶ près.
