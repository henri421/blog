# Validation : effort tranchant sans armature d’âme

Calcul à la main, indépendant du code TypeScript (script Python ligne à ligne),
dont les valeurs sont écrites en dur dans
`tests/noyau/mecanismes/tranchant-sans-armature.test.ts`.

## Dalle de logement

Données : $V_{Ed}$ = 60 kN/m, $M_{Ed}$ = 15 kN·m/m, $b_w$ = 1000 mm,
$d$ = 190 mm, $A_{sl}$ = 754 mm²/m, C25/30, B500, $D_{lower}$ = 16 mm.

### Première génération (6.2.2(1))

| Grandeur | Calcul | Valeur |
|---|---|---|
| $k$ | min(1 + √(200/190) ; 2) = min(2,026 ; 2) | 2 |
| $\rho_l$ | 754 / (1000 × 190) | 0,003968 |
| $v_{Rd,c}$ | 0,12 × 2 × (100 × 0,003968 × 25)^(1/3) = 0,24 × 9,921^(1/3) | 0,5157 MPa |
| $v_{min}$ | 0,035 × 2^1,5 × √25 | 0,4950 MPa |
| $V_{Rd,c}$ | 0,5157 × 1000 × 190 / 1000 | **97,98 kN/m** |

### Deuxième génération (8.2.1, 8.2.2)

| Grandeur | Calcul | Valeur |
|---|---|---|
| $z$ | 0,9 × 190 | 171 mm |
| $\tau_{Ed}$ | 60 000 / (1000 × 171) | 0,3509 MPa |
| $d_{dg}$ | 16 + 16 | 32 mm |
| $f_{yd}$ | 500 / 1,15 | 434,8 MPa |
| $\tau_{Rdc,min}$ | (11/1,4) × √(25/434,8 × 32/190) = 7,857 × √0,009684 | 0,7732 MPa |
| $\tau_{Rd,c}$ niveau 2 | (0,66/1,4) × (100 × 0,003968 × 25 × 32/190)^(1/3) = 0,4714 × 1,6709^(1/3) | 0,5594 MPa |
| $a_{cs}$ | max(15 000 / 60 ; 190) | 250 mm |
| $a_v$ | √(250 × 190 / 4) | 108,97 mm |
| $\tau_{Rd,c}$ niveau 3 | 0,4714 × (100 × 0,003968 × 25 × 32/108,97)^(1/3) | 0,6733 MPa |
| $V_{Rd,c}$, trois niveaux | 0,7732 × 1000 × 171 / 1000 (le minimum gouverne) | **132,22 kN/m** |

## Radier, niveau 3 non applicable

Données : $V_{Ed}$ = 400 kN/m, $M_{Ed}$ = 1000 kN·m/m, $d$ = 450 mm,
$A_{sl}$ = 4909 mm²/m, C30/37, $D_{lower}$ = 16 mm.

| Grandeur | Valeur |
|---|---|
| $V_{Rd,c}$ 2004 ($k$ = 1,667, $\rho_l$ = 0,01091) | 287,88 kN/m |
| $\tau_{Rdc,min}$ | 0,5504 MPa → 222,90 kN/m |
| $\tau_{Rd,c}$ niveau 2 | 0,6247 MPa → 253,02 kN/m |
| $a_{cs}$ = 2500 mm ≥ 4 d = 1800 mm | niveau 3 non applicable (8.2.2(3)) |
