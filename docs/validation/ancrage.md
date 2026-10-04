# Validation : longueurs d’ancrage et de recouvrement

Calcul indépendant du code (Python).

Données : HA16, C25/30, B500, bonne adhérence, $c_s$ = 100 mm,
$c_x = c_y$ = 30 mm, $\sigma_{sd}$ = 300 MPa (niveau à contrainte réelle).

## Première génération

| Grandeur | Calcul | Valeur |
|---|---|---|
| $f_{ctd}$ | 0,7 × 0,3 × 25^(2/3) / 1,5 | 1,1970 MPa |
| $f_{bd}$ | 2,25 × 1 × 1 × 1,1970 | 2,6932 MPa |
| $c_d$ | min(100/2 ; 30 ; 30) | 30 mm |
| $\alpha_2$ | 1 − 0,15 × (30 − 16)/16 | 0,86875 |
| $l_{b,rqd}$, barre plastifiée | 16/4 × 434,78 / 2,6932 | 645,75 mm |
| $l_{bd}$, barre plastifiée | 0,86875 × 645,75 (> $l_{b,min}$ = 193,7) | **560,99 mm** |
| $l_{bd}$, 300 MPa | 0,86875 × 16/4 × 300 / 2,6932 | **387,08 mm** |
| $l_0$, barre plastifiée | 1,5 × 560,99 | **841,49 mm** |
| $l_0$, 300 MPa | 1,5 × 387,08 | **580,63 mm** |

## Deuxième génération

$c_d$ = min(50 ; 30 ; 30 ; 3,75 × 16) = 30 mm.

| Grandeur | Calcul | Valeur |
|---|---|---|
| $l_{bd}$, barre plastifiée | 50 × 16 × (434,78/435)^1,5 × 1 × (0,8)^(1/3) × (24/30)^(1/2) | **663,75 mm** |
| $l_{bd}$, 300 MPa | 50 × 16 × (300/435)^1,5 × 1 × 0,9283 × 0,8944 | **380,43 mm** |
| $l_{sd}$, barre plastifiée | 1,2 × 663,75 | **796,50 mm** |
| $l_{sd}$, 300 MPa | 1,2 × 380,43 | **456,52 mm** |

Avec $(\phi/20)^{1/3}$ = 0,8^(1/3) = 0,9283 et $(1,5\,\phi/c_d)^{1/2}$ = (24/30)^(1/2) = 0,8944.
