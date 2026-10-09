# Validation : armatures d’intégrité des planchers-dalles

Calcul indépendant du code (Python).

Données : $V_{Ed}$ = 424 kN (situation accidentelle), 12 traversées de bord en
HA16 ($\sum A_{s,int}$ = 12 × π × 8² = 2412,74 mm²), B500 classe B, C30/37 ;
barres sur appui HA12 à 150 mm, enrobage 30 mm, $n_{hog}$ = 16.

Situation accidentelle : $\gamma_S$ = 1,0, $\gamma_C$ = 1,15.

| Grandeur | Calcul | Valeur |
|---|---|---|
| $V_{Rd,int}$ (12.10), classe B | 2412,74 × 500 × 0,37 | **446,36 kN** (taux 0,949) |
| $V_{Rd,int}$, classe C | 2412,74 × 500 × 0,49 | 591,12 kN |
| $b_{ef,hog}$ | min(150 − 12 ; 72 ; 120) | 72 mm |
| $V_{Rd,hog}$ (12.12) | 16 × √30/1,15 × 12 × 72 | 65,84 kN |
| total | 446,36 + 65,84 | **512,20 kN** (taux 0,827) |

Avec 2 HA16 par direction (8 traversées, 1608,5 mm²) : 297,57 kN.

Charge de l’exemple : (0,25 × 25 + 1,5 + 0,3 × 3) × 49 = 423,85 kN, arrondie à 424 kN.
