# Validation : charge répartie équivalente aux cloisons (EN 1991-1-1)

Calcul indépendant du code (Python).

| $Q_{k,p}$ (kN/m) | 2002, classe | 2002, $q_k$ (kN/m²) | 2025, $\max\{0{,}35 ; 0{,}4\,Q_{k,p}\}$ (kN/m²) |
|---|---|---|---|
| 0,5 | ≤ 1,0 | 0,5 | max(0,35 ; 0,20) = 0,35 |
| 1,0 | ≤ 1,0 | 0,5 | max(0,35 ; 0,40) = 0,40 |
| 1,5 | ≤ 2,0 | 0,8 | max(0,35 ; 0,60) = 0,60 |
| 2,0 | ≤ 2,0 | 0,8 | max(0,35 ; 0,80) = 0,80 |
| 3,0 | ≤ 3,0 | 1,2 | max(0,35 ; 1,20) = 1,20 |
| 3,5 | — | non applicable | non applicable |

Les deux règles coïncident aux bornes hautes 2 et 3 kN/m. Entre deux bornes, la
formule de 2025 suit le poids réel, alors que la classe de 2002 arrondit à la valeur
supérieure. L'exemple de bâtiment de l'atelier JRC (juin 2025) retient 0,4 kN/m²
pour une cloison de 1 kN/m au plus, ce qui concorde.
