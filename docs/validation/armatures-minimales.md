# Validation : armatures minimales

Calcul indépendant (Python).

| | Dalle 1000 × 200, d = 172, C25/30 | Poutre 300 × 600, d = 550, C30/37 |
|---|---|---|
| f_ctm | 2,565 MPa | 2,896 MPa |
| Non-fragilité 2004 : max(0,26 f_ctm/f_yk b d ; 0,0013 b d) | 229,4 mm² | 248,5 mm² |
| M_cr = f_ctm b h²/6 | 17,10 kN·m | 52,14 kN·m |
| 2023, z = 0,9 d | 17,10 × 10⁶ / (500 × 154,8) = 220,9 mm² | 210,7 mm² |
| 2023, z d’équilibre (A_s f_yk d − (A_s f_yk)²/(2 b f_ck) = M_cr) | 201,2 mm² | 191,4 mm² |
| Fissuration 2004 : 0,4 k f_ctm (b h/2) / f_yk | k = 1 → 205,2 mm² | k = 0,79 → 164,8 mm² |
| Fissuration 2023 : 0,2 k_h f_ctm b h / f_yk | k_h = 0,8 → 164,2 mm² | k_h = 0,8 → 166,8 mm² |

## Armatures minimales d'effort tranchant

A_sw = 100,5 mm², s = 400 mm, b_w = 300 mm, α = 90°, C30/37, B500 classe B.
ρ_w = 100,5/(400 × 300) = 0,0008375 ; 0,08 √30/500 = 0,0008764.
- 2004 et 2023 sans réduction : taux 0,0008764/0,0008375 = 1,0464 (arrondi vers le verdict : 1,047).
- 2023 classe B : ρ_w,min = 0,9 × 0,0008764 = 0,0007888 ; taux 0,9418 (0,941).

## Non-fragilité, alternative 12.2(3)

Dalle b = 1 000, h = 200, d = 172 mm, C25/30, B500 classe B, M_Ed = 12 kN·m/m.
f_ctm = 0,3 × 25^(2/3) = 2,565 MPa ; M_cr = 2,565 × 1 000 × 200²/6 = 17,10 kN·m > M_Ed.
k_dc = 1,1 ; A_s = 1,1 × 12 × 10⁶/(434,78 × 154,8) = **196,1 mm²** ; (12.1) : 17,10 × 10⁶/(500 × 154,8) = 220,9 mm² ;
A_s,min = min = **196,1 mm²**.
