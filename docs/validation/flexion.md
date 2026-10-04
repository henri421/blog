# Validation : flexion simple à l’ELU

Poutre b = 300, d = 550 mm, B500 (f_yd = 434,78 MPa). Calcul indépendant :
intégration numérique de la parabole (200 000 tranches), puis équilibre
A_s f_yd = α b x f_c et M_Rd = A_s f_yd (d − β x).

| Cas | 2004 rectangle | 2004 parabole | 2023 parabole |
|---|---|---|---|
| C30/37, 4 HA20 (1257 mm²) | λ = 0,8 : x = 113,86 mm, **275,70 kN·m** | α = 0,8095, β = 0,4160 : **275,01 kN·m** | f_cd = 17,0 : x = 132,38 mm, **270,49 kN·m** |
| C70/85, 4909 mm² | λ = 0,75, η = 0,90 : **993,12 kN·m** | ε_c2 = 2,42 ‰, ε_cu2 = 2,66 ‰, n = 1,44 ; α = 0,6268, β = 0,3599 : **987,08 kN·m** | f_cd = 32,92 : **936,85 kN·m** |
