# Validation : ouverture de fissure

Calcul indépendant du code (Python).

Données : $b$ = 1000 mm, $h$ = 220 mm, $d$ = 190 mm, HA12 tous les 150 mm,
$c$ = 24 mm, $M_{qp}$ = 25 kN·m, C25/30, $\alpha_e$ = 15, longue durée
($k_t$ = 0,4), $w_{max}$ = 0,3 mm.

## Section fissurée, commune

| Grandeur | Calcul | Valeur |
|---|---|---|
| $A_s$ | 1000/150 × π × 12²/4 | 753,98 mm² |
| $\alpha_e \rho$ | 15 × 753,98 / (1000 × 190) | 0,059525 |
| $x$ | 190 × (−0,059525 + √(0,059525² + 2 × 0,059525)) | 55,216 mm |
| $\sigma_s$ | 25 × 10⁶ / (753,98 × (190 − 55,216/3)) | 193,23 MPa |
| plancher | 0,6 × 193,23 / 200 000 | 0,00057969 |

## Première génération (7.3.4)

$h_{c,ef}$ = min(2,5 × 30 ; (220 − 55,216)/3 ; 110) = 54,928 mm ;
$\rho_{p,eff}$ = 753,98 / 54 928 = 0,013727 ;
$E_{cm}$ = 22 000 × 3,3^0,3 = 31 476 MPa, $\alpha_e$ = 6,354 ;
écart de déformation : (193,23 − 0,4 × 2,565 / 0,013727 × (1 + 6,354 × 0,013727)) / 200 000 = 0,00056 < plancher, donc 0,00057969 ;
espacement 150 ≤ 5 × (24 + 6) = 150 : $s_{r,max}$ = 3,4 × 24 + 0,17 × 12 / 0,013727 = 230,22 mm ;
$w_k$ = 230,22 × 0,00057969 = **0,1335 mm**.

## Deuxième génération (9.2.3)

$a_y$ = 30 mm ; $h_{c,eff}$ = min(30 + 60 ; 120 ; 105 ; 164,8 ; 110) = 90 mm ;
espacement 150 > 10 φ = 120 : $b_{c,eff}$ = 1000 × 120/150 = 800 mm ;
$\rho_{eff}$ = 753,98 / (800 × 90) = 0,010472 ;
$k_{fl}$ = 0,5 × (1 + (220 − 110 − 90)/(220 − 110)) = 0,59091 ;
$s_{r,m,cal}$ = 1,5 × 24 + 0,59091 × 0,9 / 7,2 × 12 / 0,010472 = 120,64 mm ;
$k_{1/r}$ = (220 − 55,216)/(190 − 55,216) = 1,22258 ;
écart de déformation au plancher : 0,00057969 ;
plafond 1,3 × (220 − 55,216) / 1,7 = 126,0 mm > 120,64 mm ;
$w_{k,cal}$ = 1,7 × 1,22258 × 120,64 × 0,00057969 = **0,1454 mm** ($k_w$ = 1,7, 9.2.3(2)).

## Annexe S.4, maîtrise simplifiée (2023, informative)

Formule (S.6) inversée : l’ouverture simplifiée est celle pour laquelle le
diamètre réel atteint la limite de (S.6).

$a$ = $h - d$ = 30 mm ; $\rho_p$ = 753,98 / (1000 × 190) = 0,0039683 ;
$k_{1/r,simpl}$ = 25 × (220/190 − 1) × 0,0039683 + 1,15 × 220/190 − 0,15 = 1,19724 ;
$k_{fl,simpl}$ = 1 − 3,5 × 30 / 220 = 0,52273 ; $k_{b,simpl}$ = 0,9 ; $k_w$ = 1,7 ;
$K$ = 1,7 × 1,19724 × 0,9 × 193,23 / 200 000 = 0,0017698 ;
espacement équivalent = 1,5 × 24 + 12 × (30/190) × 0,52273 × 0,9 / (2,1 × 0,0039683) = 142,96 mm ;
$w_{simpl}$ = 0,0017698 × 142,96 = **0,2530 mm** (taux 0,843 pour 0,3 mm).

Pour $w_{lim,cal}$ = 0,3 mm : 0,3 / 0,0017698 − 36 = 133,51 mm ;
$\phi_{max}$ (S.6) = 2,1 × 0,0039683 / (0,15789 × 0,52273 × 0,9) × 133,51 = **14,98 mm** ;
$s_{max}$ (S.7) = 3,45 × 0,0039683 / (30²/190 × 0,52273² × 0,9²) × 133,51² = **232,8 mm**.

Contrôle de cohérence : avec $h_{c,eff}$ = 3,5 $a$, $\rho_{eff}$ = $\rho_p d / (3,5 a)$ et
$\phi/(7,2\,\rho_{eff})$ = $\phi\,a / (2,06\,\rho_p d)$, d’où le 2,1 de (S.6).
