# Validation : ancrage par barres transversales soudées et par boucles en U

HA16, C25/30, B500, bonne adhérence, longueur disponible 450 mm. Calcul à la
main indépendant du noyau ; l_b,rqd et la longueur droite de 2023 sont ceux de
la validation du crochet (`ancrage-crochet.md`).

Poutre : c_s = 100, c_x = c_y = 30 mm. Massif : c_s = 150, c_x = c_y = 60 mm.

## Barres transversales soudées (φ_t = 10 mm ≥ 0,6 × 16 = 9,6 mm, une barre)

| | Poutre, σ_sd = f_yd | Poutre, σ_sd = 300 | Massif, f_yd | Massif, 300 |
|---|---:|---:|---:|---:|
| 2004 : c_d = min(a/2 ; c_1 ; c) | 30 | 30 | 60 | 60 |
| α_2 = 1 − 0,15 (c_d − φ)/φ, borné | 0,86875 | 0,86875 | 0,7 | 0,7 |
| 2004 : l_bd = α_2 × 0,7 × l_b,rqd | **392,7** | **271,0** | **316,4** | **218,3** |
| 2023 : longueur droite (11.3) | 663,8 | 380,4 | 469,3 | 269,0 |
| 2023 : − 15φ = − 240, au moins 5φ = 80 | **423,8** | **140,4** | **229,3** | **80** |

Avec φ_t = 8 mm < 9,6 mm : 2004 non applicable (α_4 exige φ_t ≥ 0,6 φ) ; 2023
exige deux barres espacées de 50 à 100 mm et φ ≤ 16 mm, résultat inchangé.

## Boucles en U (2004 : c_d = c = c_y)

| | Poutre, f_yd | Poutre, 300 | Massif, f_yd | Massif, 300 |
|---|---:|---:|---:|---:|
| 2004 : α_1 (c_d > 3φ = 48 ?) | 1 | 1 | 0,7 | 0,7 |
| α_2 = 1 − 0,15 (c_d − 3φ)/φ, borné | 1 | 1 | 0,8875 | 0,8875 |
| 2004 : l_bd | **645,7** | **445,6** | **401,2** | **276,8** |
| 2023 : − 20φ = − 320, au moins 10φ = 160 | **343,8** | **160** | **160** | **160** |
