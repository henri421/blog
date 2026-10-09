# Validation : combinaisons d’actions à l’ELU (EN 1990)

Calcul indépendant du code (Python). Poteau : $G_k$ = 800 kN, $Q_{k,1}$ = 300 kN
(bureaux, $\psi_0$ = 0,7), $Q_{k,2}$ = 100 kN (neige, $\psi_0$ = 0,5).

| Expression | Calcul | Valeur (kN) |
|---|---|---|
| (6.10), (8.12) CC2 | 1,35 × 800 + 1,5 × 300 + 1,5 × 0,5 × 100 | 1605 |
| (6.10a), (8.13) haut | 1080 + 1,5 × 0,7 × 300 + 75 | 1470 |
| (6.10b), (8.13) bas, (8.14) bas | 0,85 × 1080 + 450 + 75 | 1443 |
| (8.14) haut | 1,35 × 800 | 1080 |
| (8.13) retenue | max(1470 ; 1443) | **1470** |
| (8.14) retenue | max(1080 ; 1443) | **1443** |
| (8.12) CC3, $k_F$ = 1,1 | 1,1 × 1605 | 1765,5 |
| (8.12) CC1, $k_F$ = 0,9 | 0,9 × 1605 | 1444,5 |

Rapport $E_d/(G + Q_1 + Q_2)$ pour (8.12) CC2 : 1605/1200 = 1,3375.
