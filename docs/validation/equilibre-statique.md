# Validation : équilibre statique d’une poutre à console (EN 1990)

Calcul indépendant du code (Python). Travée $L$ = 5 m entre A et B, console
$a$ = 3,6 m, poids propre $g_k$ = 10 kN/m sur toute la longueur, charge variable
$q_k$ = 5 kN/m sur la console. Moments autour de B :

- stabilisant : $g\,L^2/2$ = 125 kN·m (caractéristique) ;
- déstabilisant : $g\,a^2/2$ = 64,8 kN·m et $q\,a^2/2$ = 32,4 kN·m.

| Cas | $\gamma_{G,dst}$ | $\gamma_{G,stb}$ | $\gamma_Q$ | $M_{dst,d}$ | $M_{stb,d}$ | Rapport | Ancrage (kN) |
|---|---|---|---|---|---|---|---|
| 2002 EQU | 1,10 | 0,90 | 1,5 | 119,88 | 112,5 | 1,066 | 1,476 |
| 2002 NOTE 2 (a) | 1,35 | 1,15 | 1,5 | 136,08 | 143,75 | 0,947 | 0 |
| 2002 NOTE 2 (b) | 1,00 | 1,00 | 1,5 | 113,4 | 125 | 0,907 | 0 |
| 2023 CC2 VC2(a) | 1,35 | 1,15 | 1,5 | 136,08 | 143,75 | 0,947 | 0 |
| 2023 CC2 VC2(b) | 1,0 | 1,0 | 1,5 | 113,4 | 125 | 0,907 | 0 |
| 2023 CC3 VC2(a) | 1,485 | 1,15 | 1,65 | 149,688 | 143,75 | 1,041 | 1,1876 |
| 2023 CC3 VC2(b) | 1,0 | 1,0 | 1,65 | 118,26 | 125 | 0,946 | 0 |
| 2023 CC1 VC2(a) | 1,215 | 1,15 | 1,35 | 122,472 | 143,75 | 0,852 | 0 |
| 2023 CC1 VC2(b) | 1,0 | 1,0 | 1,35 | 108,54 | 125 | 0,868 | 0 |

Variante non retenue par l’outil : si (8.8) s’appliquait à $\gamma_G$ = 1,35 $k_F$,
$\gamma_{G,stb}$ vaudrait 1,265 en CC3, $M_{stb,d}$ = 158,125 kN·m et le rapport
0,947 : pas d’ancrage.

Niveau AN-LU (A1.3.1(1)) : tableau A1.2(A) seul, la NOTE 2 n'étant pas
applicable ; mêmes valeurs que la vérification EQU de 2002 : 119,88 contre
112,50 kN·m, ancrage de 1,48 kN.
