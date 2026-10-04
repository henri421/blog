# Validation : redistribution des moments

Poutre continue sur deux travées de 7 m, q_Ed = 50 kN/m : M_el = 50 × 7² / 8 =
306,25 kN·m, M_red = 245 kN·m, δ = 0,80. b = 300 mm, d = 540 mm, A_s = 1473 mm²
(3 HA25), B500 classe B, f_yd = 434,78 MPa.

Calcul indépendant (intégration numérique du parabole-rectangle, acier plastifié
vérifié) ; x_u = A_s f_yd / (α b f_cd).

## C30/37

### 2004 (5.5(4))

f_cd = 20 MPa, α = 0,8095 : x_u = 1473 × 434,78 / (0,8095 × 300 × 20) = **131,85** mm ;
x_u/d = 0,2442 ; ε_cu2 = 3,5 ‰, k2 = 1,25 (0,6 + 0,4) = 1,25 ;
δ_min = 0,44 + 1,25 × 0,2442 = **0,7452** ≥ 0,7. Taux 0,7452 / 0,80 = 0,931.

### 2023 (7.3.2(3))

f_cd = 1,0 × 0,85 × 30 / 1,5 = 17 MPa : x_u = **155,12** mm ; x_u/d = 0,2873 ;
1 / (1 + 0,7 × 0,0035 × 200 000 / 434,78) = 1 / 2,1270 = **0,4701** ;
δ_min = 0,4701 + 0,2873 = **0,7574**. Taux 0,947 (arrondi vers le verdict : 0,946).

## C60/75

### 2004

ε_cu2 = 2,6 + 35 × 0,3⁴ = 2,8835 ‰, n = 1,5895, ε_c2 = 2,288 ‰ : x_u = 76,95 mm,
x_u/d = 0,1425 ; k3 = 0,54, k4 = 1,25 (0,6 + 0,0014/0,0028835) = 1,3569 ;
δ_min = 0,54 + 1,3569 × 0,1425 = **0,7334**.

### 2023

η_cc = (40/60)^(1/3) = 0,8736, f_cd = 29,70 MPa : x_u = 88,79 mm ; x_u/d = 0,1644 ;
(7.16) = 0,4701 + 0,1644 = 0,6346 < 0,7 : δ_min = **0,70** (borne de la classe B).
