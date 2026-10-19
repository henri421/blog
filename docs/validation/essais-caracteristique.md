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
| $V_x$ de l’échantillon : 4,5735 / 306,75 | 0,0149 < 0,10 |
| $X_k$, $V_x$ inconnu, plancher 0,10 (D.7.1(5)) : 306,75 × (1 − 2,6311 × 0,10) | 226,04 |
| $X_k$ sans plancher : 306,75 − 2,6311 × 4,5735 | 294,72 |

Contrôles de $k_n$ ($V_x$ inconnu) : $n$ = 3 : 3,372 (tableau 3,37) ; $n$ = 10 :
1,923 (tableau 1,92).

L’exemple de l’atelier donne $f_{yk}$ = 299 MPa avec $V$ = 0,01 et la ligne
« inconnu » ($k_n$ = 2,63) : 307 × (1 − 0,0263) ≈ 299. Le coefficient de
variation de l’échantillon vaut en fait 0,0149.

Cas au-dessus du plancher : essais 100, 80, 120 ; $m_x$ = 100, $s_x$ = 20,
$V_x$ = 0,20 ; $k_n$ = 2,9200 × √(4/3) = 3,3717 ; $X_k$ = 100 − 3,3717 × 20 =
32,57, identique à $m_x (1 − k_n V_x)$.
