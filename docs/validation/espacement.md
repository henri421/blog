# Validation : espacement des barres et paquets

Calcul à la main indépendant du noyau. Granulat D_upper = d_g = 20 mm ;
k_1 = 1, k_2 = 5 mm (valeurs recommandées de 2004, fixées en 2023).

| Cas | φ_b (mm) | 2004 c_s,min (mm) | 2023 c_s,min (mm) | c_s prévu | taux 2004 / 2023 |
|---|---:|---:|---:|---:|---|
| Paquet 2 HA25 | 25 √2 = 35,36 | max(35,36 ; 25 ; 20) = **35,36** | φ_b = **35,36** | 40 | 0,883 / 0,883 |
| HA25 isolé | — | max(25 ; 25 ; 20) = **25** | max(25 ; 25 ; 20) = **25** | 40 | 0,625 / 0,625 |
| Paquet 3 HA40 | 40 √3 = 69,28 | φ_n > 55 mm : **non applicable** | **69,28** | 80 | — / 0,866 |
| Paquet 2 HA10 | 10 √2 = 14,14 | max(14,14 ; 25 ; 20) = **25** | φ_b = **14,14** | 20 | 1,250 / 0,707 |
| Paquet 4 HA20, cas courant | 40 | n_b > 3 : **non applicable** | **non applicable** | 60 | — |
| Paquet 4 HA20, recouvrement | 40 | **40** | **40** | 60 | 0,666 / 0,666 |

Vérification de (11.6) : A_s = 2 × π × 25²/4 = 981,7 mm² ; √(4 × 981,7/π) = 35,36 mm,
identique à φ √n_b (8.14).

Le cas 2 HA10 repose sur la lecture littérale de 11.2(3), qui ne donne que φ_b
comme distance minimale entre paquets (voir l’article).
