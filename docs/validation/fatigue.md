# Validation : fatigue, vérifications simplifiées

## Armatures

| Barre | Δσ | 2004 (6.8.6) | 2023 (10.4) |
|---|---:|---:|---:|
| HA16 non soudée | 72 | 70 (taux 1,029) | 73 (taux 0,986) |
| HA12 non soudée | — | 70 | 90 |
| HA10 soudée | 30 | 35 | 40 |
| HA16 soudée | 30 | 35 | 30 |
| Coupleur | 15 | pas de règle simplifiée | 19 |

## Béton comprimé

La compression maximale admise vaut f_cd,fat × min(0,5 + 0,45 σ_min/f_cd,fat ; plafond),
soit 0,5 f_cd,fat + 0,45 σ_min sous le plafond.

C30/37, β_cc(t_0) = 1, σ_max = 8 MPa, σ_min = 3 MPa :

- 2004 : f_cd = 20 MPa ; f_cd,fat = 0,85 × 1 × 20 × (1 − 30/250) = **14,96 MPa** ;
  admis 0,5 × 14,96 + 0,45 × 3 = **8,83 MPa** ; taux 8/8,83 = 0,906.
- 2023 : η_cc = 1, η_cc,fat = min(0,85 ; 0,8) = 0,8 ; f_cd,fat = 1 × 30/1,5 × 0,85 × 0,8
  = **13,6 MPa** ; admis 6,8 + 1,35 = **8,15 MPa** ; taux 8/8,15 = 0,981.
- σ_min = −1 MPa (traction) : prise nulle, 2023 admis 6,8 MPa.

C60/75, σ_max = 15, σ_min = 10 MPa :

- 2004 : f_cd,fat = 0,85 × 40 × 0,76 = 25,84 MPa ; 0,5 + 0,45 × 10/25,84 = 0,674 < 0,8 ;
  admis 12,92 + 4,5 = 17,42 MPa.
- 2023 : η_cc = (40/60)^(1/3) = 0,87358, η_cc,fat = 0,85 × 0,87358 = 0,742539 ;
  f_cd,fat = 40 × 0,85 × 0,742539 = 25,2463 MPa ; admis 12,6232 + 4,5 = 17,1232 MPa.

## Effort tranchant sans armature

| Cycle | V_Rd,c | Rapport limite | V admis |
|---|---:|---|---:|
| 100 / 40 kN, C30 | 200 | 0,5 + 0,45 × 0,2 = 0,59 | 118,0 |
| 100 / −30 kN, C30 | 200 | 0,5 − 0,15 = 0,35 | 70,0 |
| 150 / 140 kN, C60, 2004 | 170 | 0,8706 → plafond 0,8 | 136,0 |
| 150 / 140 kN, C60, 2023 | 170 | 0,8706 < 0,9 | 148,0 |
