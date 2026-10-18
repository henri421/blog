# Validation : passerelle sous flux de piétons (EN 1991-2, annexe G)

Calcul indépendant en Python. Mode sinusoïdal, $a = 2\,p\,b/(\pi\,\xi\,m)$,
$p = 280\,n'\,\psi_w$, $S = L\,b$, $n = d\,S$.

| Cas | $n'$ (1/m²) | $p$ (N/m²) | $a$ (m/s²) |
|---|---|---|---|
| Béton, $L$ = 40, $b$ = 3, $m$ = 6000, $\xi$ = 0,015, $d$ = 0,5 | 10,8 √(0,015 × 60)/120 = 0,08538 | 23,907 | 0,5073 |
| Acier, $m$ = 2000, $\xi$ = 0,005, $d$ = 0,5 | 0,04930 | 13,803 | 2,6361 |
| Acier, $d$ = 1,0 | 1,85 √120/120 = 0,16888 | 47,287 | 9,0311 |
