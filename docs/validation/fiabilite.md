# Validation : indice de fiabilité (EN 1990, annexe C)

Calcul indépendant en Python (`statistics.NormalDist`). Conversion :
$P_{f,T} = 1 - (1 - P_{f,1})^T$, $\beta_T = -\Phi^{-1}(P_{f,T})$.

| Classe | $\beta_1$ | $T$ (ans) | $\beta_T$ | $P_{f,T}$ |
|---|---|---|---|---|
| CC1 | 4,2 | 50 | 3,2085 | 6,7 × 10⁻⁴ |
| CC2 | 4,7 | 50 | 3,8263 | 6,5 × 10⁻⁵ |
| CC3 | 5,2 | 50 | 4,4179 | 5,0 × 10⁻⁶ |
| CC2 | 4,7 | 100 | 3,6521 | 1,3 × 10⁻⁴ |
| CC2 | 4,7 | 25 | 3,9937 | 3,3 × 10⁻⁵ |

Les valeurs sur 50 ans du tableau C.3 (3,3 ; 3,8 ; 4,3) sont arrondies : la
conversion exacte donne 3,21 ; 3,83 ; 4,42.
