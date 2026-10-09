# Validation : ancrage par tête d’ancrage

HA20 à tête circulaire φ_h = 64 mm, t_h = 16 mm, C30/37, D_lower = 16 mm,
béton non fissuré, a_y = 60 mm, a_x = 200 mm, groupe espacé de s_x = 250 mm,
σ_sd = 400 MPa.

| Condition de 11.4.7(1) | Valeur | Limite | |
|---|---:|---:|---|
| φ_h ≥ 3 φ | 64 | 60 | oui |
| φ_h ≤ 4 t_h | 64 | 64 | oui |
| f_ck ≥ 25 MPa | 30 | 25 | oui |
| φ ≤ 25 mm | 20 | 25 | oui |
| d_dg = 16 + D_lower ≥ 32 mm | 32 | 32 | oui |
| a_y ≥ 3 φ (non fissuré) | 60 | 60 | oui |
| a_x ≥ 2 a_y + 1,2 φ_h | 200 | 196,8 | oui |
| s_x ≥ 4 a_y | 250 | 240 | oui |

La tête développe **435 MPa** ; taux 400/435 = **0,919** (arrondi vers le verdict).

Variantes : béton fissuré, a_y,min = 80 mm > 60 mm, non applicable ; D_lower = 8 mm,
d_dg = 24 mm, non applicable ; φ_h = 56 mm < 60 mm ou t_h = 15 mm (4 t_h = 60 < 64),
non applicable ; a_x = 150 mm < 196,8 mm, non applicable ; s_x = 200 mm < 240 mm,
non applicable ; a_x = 60, a_y = 200 : permutés, conditions remplies.

## Vérification générale (11.4.7(2))

Même tête, $f_{cd}$ = 0,85 × 30/1,5 = 17 MPa, $d_{dg}$ = 32 mm,
$k_{h,A}$ = (64/20)² − 1 = 9,24 ; plafond 9,24 × $\nu_{part}$ × 17.

- Béton fissuré ($\nu_{part}$ = 8), $s_x$ = 250 ≥ 240 et $a_x$ = 200 ≥ 120 : $a_d$ = $a_y$ = 60 mm ;
  9,24 × 17 + 8 × √30/1,5 × 3 × 3,2^(5/6) × 1,6^(1/3) = 157,08 + 270,20 = **427,28 MPa** (taux 0,936).
- Béton non fissuré ($\nu_{part}$ = 11) : **528,60 MPa**.
- Barre isolée, $a_x$ = 150 < 196,8 : $a_d$ = 30 + 37,5 − 19,2 = 48,3 mm ; **374,59 MPa** (fissuré).
- Groupe, $s_x$ = 150 < 240 : $a_d$ = 60 × 86/176 + 0,23 × 28 × 90/176 × (1 − 1/10,24) = 29,318 + 2,972 = 32,290 mm ; **302,49 MPa** (fissuré).
