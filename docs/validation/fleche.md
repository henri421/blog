# Validation : flèche à long terme

Dalle sur appuis simples, L = 5000 mm, b = 1000, h = 200, d = 172 mm,
A_s = 565 mm², C25/30, q_qp = 6,6 kN/m, q_k = 8 kN/m, φ = 2,5,
ε_cs = 0,4 ‰, limite L/250 = 20 mm. Calcul indépendant (Python).

M_qp = 6,6 × 5² / 8 = 20,625 kN·m ; M_k = 25,0 kN·m.

## 2004 (7.4.3)

E_cm = 22 000 × 3,3^0,3 = 31 476 MPa ; E_c,eff = 8993 MPa ; α_e = 22,24.
Section non fissurée homogénéisée : M_cr = 19,50 kN·m ; fissurée sous M_qp :
ζ = 1 − 0,5 × (19,50/20,625)² = 0,5530.
δ_I = 9,666 mm ; δ_II = 34,383 mm ; δ = 0,5530 × 34,383 + 0,4470 × 9,666 = **23,33 mm**.

## 2023, méthode générale (9.3.4)

E_cm = 9500 × 33^(1/3) = 30 472 MPa ; E_c,eff = 8706 MPa ; α_e = 22,97 ;
M_cr = 19,58 kN·m ; ζ sur M_k : 1 − 0,5 × (19,58/25)² = 0,6933 ;
δ = **27,04 mm**.

## 2023, calcul simplifié (9.3.3)

Section brute : I_g = 666,7 × 10⁶ mm⁴ ; M_cr = 2,565 × I_g / 100 = 17,10 kN·m ;
ζ = 1 − 0,5 × (17,10/25)² = 0,7661 ; ρ = 0,003285 ;
I_g/I_cr = 1 / (2,7 × (22,97 × 0,003285)^0,6 × 0,86³) = 2,7448 ;
k_I = 0,7661 × 2,7448 + 0,2339 = 2,3366 ; k_s = 455ρ² − 35ρ + 1,6 = 1,4899 ;
δ_loads = 9,254 mm ; δ_εcs = 1,752 mm ;
δ = 2,3366 × (9,254 + 1,4899 × 1,752) = **27,72 mm**.
