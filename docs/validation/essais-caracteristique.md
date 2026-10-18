# Validation : valeur caractéristique à partir d’essais (EN 1990, annexe D)

Calcul indépendant en Python. Essais de traction de l’exemple de l’atelier JRC
(EN 1990-2, poutre de 1940) : 312, 301, 308, 306 MPa.

| Grandeur | Valeur |
|---|---|
| $m_x$ | 306,75 |
| $s_x$ | 4,5735 |
| $k_n$, $V_x$ connu, $n$ = 4 : 1,6449 × √1,25 | 1,8390 (tableau D.1 : 1,83) |
| $k_n$, $V_x$ inconnu : $t_{3;0,95}$ = 2,3534, × √1,25 | 2,6311 (tableau : 2,63) |
| $X_k$, $V_x$ = 0,01 connu : 306,75 × (1 − 0,01839) | 301,11 |
| $X_k$, $V_x$ inconnu : 306,75 − 2,6311 × 4,5735 | 294,72 |

Contrôles de $k_n$ ($V_x$ inconnu) : $n$ = 3 : 3,372 (tableau 3,37) ; $n$ = 10 :
1,923 (tableau 1,92).

L’exemple de l’atelier donne $f_{yk}$ = 299 MPa avec $V$ = 0,01 et la ligne
« inconnu » ($k_n$ = 2,63) : 307 × (1 − 0,0263) ≈ 299. Le coefficient de
variation de l’échantillon vaut en fait 0,0149.
