# Validation : effort tranchant avec armatures d’âme

Calcul indépendant du code (Python). Le niveau à $\nu$ variable a été vérifié
par un balayage de $\cot\theta$ sur [1 ; 2,5] au pas de 10⁻⁶, sans recourir à
la section dorée du code.

## Poutre, bielle déterminante

Données : $V_{Ed}$ = 550 kN, $M_{Ed}$ = 300 kN·m, $b_w$ = 300 mm,
$d$ = 550 mm, $A_{sw}$ = 157 mm², $s$ = 125 mm, C30/37, B500,
$A_{st}$ = 1963 mm².

Communs : $z$ = 495 mm, $\rho_w$ = 157 / (125 × 300) = 0,0041867,
$f_{ywd}$ = 434,78 MPa, $\rho_w f_{ywd}$ = 1,8203 MPa.

| Cellule | $\nu$ | $f_{cd}$ (MPa) | $\cot\theta$ | $V_{Rd}$ (kN) |
|---|---|---|---|---|
| 2004 | 0,528 | 20,0 | √(0,528 × 20 / 1,8203 − 1) = 2,1912 | 592,31 |
| 2023, niveau 1 | 0,5 | 1 × 0,85 × 30 / 1,5 = 17,0 | √(0,5 × 17 / 1,8203 − 1) = 1,9156 | 517,82 |
| 2023, niveau 2 | 0,47963 | 17,0 | 1,8653 (balayage) | 504,22 |

Niveau 2 à l’optimum : $F_{td}$ = 300 000/495 + 550 × 1,8653/2 = 1119,0 kN,
$\varepsilon_x$ = 1119,0 × 1000 / (200 000 × 1963) / 2 = 0,0014251.

## Poutre, cadres déterminants

Cadres HA8 ($A_{sw}$ = 100,5 mm²) tous les 200 mm : $\rho_w f_{ywd}$ = 0,7283 MPa.
Dans les trois cellules, $\cot\theta$ = 2,5 et
$V_{Rd}$ = 0,7283 × 2,5 × 300 × 495 / 1000 = **270,37 kN**.
