# Validation : fréquence propre des planchers (EN 1990, vibrations)

Calcul à la main. La relation entre flèche et fréquence vient de la mécanique,
non de la norme ; $g$ = 9810 mm/s².

Coefficient de la poutre isostatique à masse uniformément répartie : premier
mode $n = (\pi/2)\sqrt{EI/(m L^4)}$ ; flèche sous son poids
$f = 5\,m g L^4/(384\,EI)$ ; d'où $n = (\pi/2)\sqrt{5/384}\,\sqrt{g/f}$ et
$\lambda = \pi^2\sqrt{5/384}$ = 9,8696 × 0,114109 = 1,12621.

Poutre de plancher, $f$ = 12 mm : $\sqrt{9810/12}$ = $\sqrt{817,5}$ = 28,592.

| Grandeur | Masse concentrée ($\lambda$ = 1) | Masse répartie ($\lambda$ = 1,12621) |
|---|---|---|
| $n$ = $\lambda$ × 28,592 / 6,2832 | 4,5506 Hz | 5,1249 Hz |
| Taux pour 3,5 Hz | 3,5 / 4,5506 = 0,769 | 0,683 |
| Taux pour 7 Hz | 7 / 4,5506 = 1,538 (affiché 1,539, arrondi vers le verdict) | 1,366 |

Contrôle inverse, $f = g\,(\lambda / 2\pi n)^2$, $\lambda$ = 1 :
3,5 Hz donne 9810 × (1/21,991)² = 20,28 mm ; 7 Hz donne 5,07 mm.

Ordre de grandeur pour une dalle carrée simplement appuyée (non codée) :
$\lambda \approx$ 1,26, d'après la flèche centrale 0,00406 $q a^4/D$ et le
premier mode $(\pi/a^2)\sqrt{D/m}$.

## Niveaux AN-LU (NBN B 03-003, 8, tableau 6)

La NBN pose $(2\pi n/\lambda)^2 = 9,81/f$ ($f$ en m), $\lambda$ = 1 pour les
éléments linéaires et 1,126 pour les dalles isostatiques portant dans les deux
sens.

$f$ = 12 mm : élément linéaire 4,5506 Hz ; dalle 1,126 × 4,5506 = 5,1239 Hz.

Contrôle des flèches équivalentes de la NBN : dalle à 3,5 Hz,
9810 × (1,126 / 21,991)² = 25,72 mm ; dalle à 7 Hz, 6,43 mm ; élément
linéaire à 3,5 Hz, 20,28 mm ; à 7 Hz, 5,07 mm. La NBN arrondit à 25,7, 6,4, 20
et 5 mm.
