# Validation : neige sur le sol (EN 1991-1-3)

Calcul indépendant en Python, loi de Gumbel, $P_n = 1/n$,
$s_n/s_k = [1 - V\sqrt6/\pi\,(\ln(-\ln(1 - P_n)) + 0{,}57722)]/(1 + 2{,}5923\,V)$.

| $V$ | $n$ (ans) | $s_n/s_k$ |
|---|---|---|
| 0,5 | 10 | 0,71959 |
| 0,3 | 10 | 0,78268 |
| 0,5 | 50 | 1,00000 |
| 0,5 | 100 | 1,11855 |

Charge exceptionnelle : $s_{Ad}$ = 2,0 × 0,5 = 1,0 kN/m².
