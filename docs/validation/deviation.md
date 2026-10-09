# Validation : efforts de déviation des barres courbes (11.7)

Calcul indépendant du code (Python).

Données : HA20 plastifié, $F_{td}$ = π × 10² × 500/1,15 = 136,591 kN, $r$ = 2500 mm,
$c_s$ = 100 mm, $c_y$ = 35 mm, C30/37, B500 ; recouvrement $l_{sd}$ = 600 mm,
$l_s$ = 750 mm.

| Grandeur | Calcul | Valeur |
|---|---|---|
| $c_u$ | min(100 ; 2√3 × (35 + 10) = 155,9) | 100 mm |
| $F_{td}/(r\,c_u)$ | 136 591 / (2500 × 100) | 0,54636 MPa |
| limite | 0,125/1,5 × √30 | 0,45644 MPa |
| taux (11.24) | | **1,1970** |
| armature transversale | 136 591 / (2500 × 434,78) × 1000 | 125,66 mm²/m |
| (11.25) | 1,5 × 8 × 136 591 / (2500 × 100 × √30) + 600/750 | 1,1970 + 0,8 = **1,9970** |

Enrobage gouvernant ($c_s$ = 200, $c_y$ = 20) : $c_u$ = 2√3 × 30 = 103,92 mm.
