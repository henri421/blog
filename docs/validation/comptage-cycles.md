# Validation : comptage des cycles (EN 1990, annexe F)

Calcul indépendant en Python (algorithme à trois points sur l’historique
réordonné à partir de son maximum absolu).

| Historique (MPa) | Cycles | $\Delta\sigma_E$ ($m$ = 3, $n_{rep}$ = 10⁶) |
|---|---|---|
| 0, 10, 2, 8, 4, 12, 0 | 12, 8, 4 | (10⁶ × (1728 + 512 + 64)/2 × 10⁶)^(1/3) = 10,48 |
| 20, 60, 30, 80, 10, 50, 40, 90 | 80, 60, 30, 10 | (0,5 × (512 000 + 216 000 + 27 000 + 1000))^(1/3) = 72,30 |

Contrôle à la main du second historique : réordonné 90, 20, 60, 30, 80, 10,
50, 40, 90 ; cycles 30–60 (30), 40–50 (10), 20–80 (60), 10–90 (80).
