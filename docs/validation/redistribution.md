# Validation : redistribution des moments

Poutre continue sur deux travées de 7 m, q_Ed = 50 kN/m : M_el = 50 × 7² / 8 =
306,25 kN·m, M_red = 245 kN·m, δ = 0,80. b = 300 mm, d = 540 mm, A_s = 1473 mm²
(3 HA25), B500 classe B, f_yd = 434,78 MPa.

Calcul indépendant (intégration numérique du parabole-rectangle, acier plastifié
vérifié) ; x_u = A_s f_yd / (α b f_cd).

## C30/37

### 2004 (5.5(4))

f_cd = 20 MPa, α = 0,8095 : x_u = 1473 × 434,78 / (0,8095 × 300 × 20) = **131,85** mm ;
x_u/d = 0,2442 ; ε_cu2 = 3,5 ‰, k2 = 1,25 (0,6 + 0,4) = 1,25 ;
δ_min = 0,44 + 1,25 × 0,2442 = **0,7452** ≥ 0,7. Taux 0,7452 / 0,80 = 0,931.

### 2023 (7.3.2(3))

f_cd = 1,0 × 0,85 × 30 / 1,5 = 17 MPa : x_u = **155,12** mm ; x_u/d = 0,2873 ;
1 / (1 + 0,7 × 0,0035 × 200 000 / 434,78) = 1 / 2,1270 = **0,4701** ;
δ_min = 0,4701 + 0,2873 = **0,7574**. Taux 0,947 (arrondi vers le verdict : 0,946).

## C60/75

### 2004

ε_cu2 = 2,6 + 35 × 0,3⁴ = 2,8835 ‰, n = 1,5895, ε_c2 = 2,288 ‰ : x_u = 76,95 mm,
x_u/d = 0,1425 ; k3 = 0,54, k4 = 1,25 (0,6 + 0,0014/0,0028835) = 1,3569 ;
δ_min = 0,54 + 1,3569 × 0,1425 = **0,7334**.

### 2023

η_cc = (40/60)^(1/3) = 0,8736, f_cd = 29,70 MPa : x_u = 88,79 mm ; x_u/d = 0,1644 ;
(7.16) = 0,4701 + 0,1644 = 0,6346 < 0,7 : δ_min = **0,70** (borne de la classe B).

## Capacité de rotation (7.3.2(5), 2023)

Calcul indépendant en Python : béton parabole-rectangle intégré analytiquement,
dichotomies sur $x$ (le code intègre par Simpson).

Données : $b$ = 300, $h$ = 600, $d$ = 540 mm, 4 HA20 ($A_s$ = π × 20² = 1256,64 mm²
dans les tests, 1257 mm² dans l’article), $c$ = 50 mm, $\rho_w$ = 0,17 %, C30/37,
B500, $k$ = 1,08, $\varepsilon_{uk}$ = 50 ‰, $\theta_{Ed}$ = 2 mrad.

| Grandeur | Calcul | Valeur |
|---|---|---|
| $f_{yd}$, $\varepsilon_{yd}$, $\varepsilon_{ud}$ | 500/1,15 ; /200 000 ; 50/1,15 | 434,78 MPa ; 2,174 ‰ ; 43,48 ‰ |
| $f_{cd}$ | 1,0 × 0,85 × 30 / 1,5 | 17,0 MPa |
| $x_u$ (béton à 3,5 ‰) | 0,80952 × 300 × 17 $x$ = $A_s\,\sigma_s(\varepsilon_s)$ | 134,199 mm |
| $\varepsilon_s$, $f_{s,ef}$ | 3,5 × (540 − 134,2)/134,2 ; branche inclinée | 10,584 ‰ ; 440,899 MPa |
| $M_{Rd}$ | 1256,64 × 440,90 × (540 − 0,41597 × 134,2) | 268,259 kN·m |
| $x_y$, $M_y$ | acier à $\varepsilon_{yd}$, béton à 1,340 ‰ | 205,901 mm ; 254,842 kN·m |
| $M_{cr}$ | 2,8965 × 300 × 600²/6 | 52,136 kN·m |
| $TS_{My}$ | 1 − 0,6 × 52,136/254,842 | 0,87725 |
| $h_{c,eff}$ | min(60 + 100 ; 200 ; 210 ; 394,1 ; 300) | 160 mm |
| $s_{r,m,cal}$ | 1,5 × 50 + 0,73333 × 0,9/7,2 × 20/0,026180 | 145,028 mm |
| $\alpha$ (7.24) | (440,90 − 434,78)/(0,6 × 38^(2/3)) × 20/145,03 | 0,12437 |
| $TS_{Mu}$ (7.22) | $\alpha$ < 1 | 0,23700 |
| $\varepsilon_{cu,d,\rho_w}$ | 0,002 + 1,35/540 + 3 × 0,0017 | 9,60 ‰ |
| $(1/r)_{u,m}$ | 0,23700 × min(0,043478/405,8 ; 0,0096/134,2) | 1,69541 × 10⁻⁵ /mm |
| $\theta_{Rd}$ | 1,3 × 540/3 × (1,69541 × 10⁻⁵ − 0,87725 × 0,0021739/334,1) | **2,6316 mrad** |

Taux pour 2 mrad : 0,760.

Rupture côté acier (classe A, 4 HA12, $c$ = 54 mm, $k$ = 1,05, $\varepsilon_{uk}$ = 25 ‰) :
l’acier atteint $\varepsilon_{ud}$ = 21,74 ‰ avant l’écrasement du béton
(raccourcissement 2,470 ‰) ; $x_u$ = 55,090 mm, $M_{Rd}$ = 106,358 kN·m,
$M_y$ = 97,532 kN·m, $\theta_{Rd}$ = **0,9325 mrad**.

Ordre de grandeur de la demande (article) : $2\,\Delta M\,L/(3\,E_{cm} I)$ avec
$\Delta M$ = 61,25 kN·m, $L$ = 7 m, $E_{cm}$ = 31 939 MPa : 1,66 mrad avec
$I$ = 5,4 × 10⁹ mm⁴ (brute), 5,84 mrad avec $I_{cr}$ = 1,533 × 10⁹ mm⁴
(fissurée, $\alpha_e$ = 6,26, $x$ = 144,1 mm).
