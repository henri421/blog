# Validation : torsion

Calcul indépendant (Python), optimum par balayage de cot θ au pas de 4 × 10⁻⁶.

## Poutre 300 × 500, a = 45, c = 30 mm, cadres HA10/150, ΣA_sl = 679 mm², C30/37

t_ef = 150 000 / 1600 = 93,75 mm ; A_k = 206,25 × 406,25 = 83 789 mm² ; u_k = 1225 mm.

| | ν | f_cd | cot θ | T_Rd |
|---|---|---|---|---|
| 2004 | 0,528 | 20,0 | 1,029 (cadres = longitudinales) | **39,25 kN·m** |
| 2023, cot θ = 1 | 0,60 | 17,0 | 1 | **38,15 kN·m** |
| 2023, cot θ variable | 0,4 | 17,0 | 1,029 | **39,25 kN·m** |

## Section 400 × 400, a = 50, c = 40 mm, ΣA_sl = 904 mm²

2023 : b_max/b_min = 1 < 1,5 et c = 40 > 0,07 × 400 = 28 : section réduite de
2 × 12 mm, soit 376 × 376 mm.

| | t_ef | A_k | T_Rd |
|---|---|---|---|
| 2004 | 100 | 90 000 | **49,15 kN·m** (cot θ = 1,199) |
| 2023, cot θ = 1 | 94 | 79 524 | **36,21 kN·m** |
| 2023, cot θ variable | 94 | 79 524 | **44,8 kN·m** (cot θ = 1,237 ; optimum à 44,795, à la limite d’arrondi) |
