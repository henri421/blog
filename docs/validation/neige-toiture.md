# Validation : neige sur toiture terrasse (EN 1991-1-3)

Calcul indépendant du code (Python).

| Cas | $L_c$ (m) | $C_{e,F}$ | $\mu_1$ (2025) | $s$ 2003 | $s$ 2025 | $s_R$ | $s + s_R$ |
|---|---|---|---|---|---|---|---|
| Entrepôt 100 × 200 m, balayé, $s_k$ = 0,5 | 2 × 100 − 100²/200 = 150 | 0,8 + 0,45 × 100/350 = 0,92857 | 0,74286 | 0,8 × 0,8 × 0,5 = 0,32 | 0,37143 | 0,25 | 0,62143 |
| Atelier JRC 21 × 45 m, normal, $s_k$ = 0,5 | 42 − 441/45 = 32,2 | 1,0 | 0,8 | 0,40 | 0,40 | 0,25 | 0,65 |
| 300 × 600 m, protégé, $s_k$ = 0,9 | 450 | 1,25 | 1,0 | 0,864 | 0,90 | 0,10 | 1,00 |
| Entrepôt avec $f_{s,cc}$ = 1,1 | 150 | 0,92857 | 0,74286 | — | 0,40857 | — | — |

L’exemple de l’atelier JRC (juin 2025) donne bien $L_c$ = 32,2 m et
$s$ = 0,4 kN/m² ; il n’ajoute pas de surcharge de pluie.
