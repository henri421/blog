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

## Niveau AN-LU (AN-LU:2020, A1.2.2 et A1.3.1(1))

Effets d'un moment fléchissant : $G$ = 100 kN·m, vent dominant $W$ = 40 kN·m
($\psi_0$ = 0,6), neige d'accompagnement $S$ = 30 kN·m ($\psi_0$ = 0,5, altitude
inférieure à 1 000 m). Vent et neige sont deux actions de courte durée.

| Cas | (6.10a) | (6.10b) | Retenu |
|---|---|---|---|
| Recommandé, (6.10) | | | 135 + 60 + 22,5 = **217,5** |
| Recommandé, $\xi$ = 0,85 | 135 + 36 + 22,5 = 193,5 | 114,75 + 60 + 22,5 = 197,25 | **197,25** |
| LU, non certifié ($\xi$ = 1,00), $\psi_{0,2}$ = 0,3 | 135 + 36 + 13,5 = 184,5 | 135 + 60 + 13,5 = 208,5 | **208,5** |
| LU, certifié ($\xi$ = 0,85), $\psi_{0,2}$ = 0,3 | 184,5 | 114,75 + 60 + 13,5 = 188,25 | **188,25** |
| LU, non certifié, actions non de courte durée | 193,5 | 217,5 | **217,5** = (6.10) |

La règle des 0,3 vise l'action qui en accompagne une autre de courte durée :
elle s'applique à $\psi_{0,2}$, pas au $\psi_{0,1}$ de l'action dominante dans
(6.10a) (AN-LU, A1.2.2, lu sur la page rendue).
