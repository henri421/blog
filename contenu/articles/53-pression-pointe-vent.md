---
titre: Pression dynamique de pointe du vent
ordre: 53
statut: publie
texte: EN 1991-1-4:2026 (NBN, version française), sans amendement ni corrigendum pris en compte ; 6.2, 6.3.1, 6.3.2, 6.4 et 6.5, formules (6.3) à (6.13) lues sur le texte le 2026-10-18 ; EN 1991-1-4:2005 (NF EN, novembre 2005) : 4.2 à 4.5, formules (4.1) à (4.10) et tableau 4.1 lus sur le texte le 2026-10-19, A1:2010 et AC:2010 non détenus ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: Le profil moyen du vent ne change pas, mais la pression de pointe devient quadratique en intensité de turbulence. Elle augmente fortement près du sol en terrain rugueux, de 26 % pour un petit immeuble en ville, et un facteur de changement climatique s’ajoute.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : 1re génération relue sur le texte de 2005 ; origine du 7 de (4.8) ajoutée.
---

## Ce qui change

**Le vent moyen est inchangé.** Vitesse de référence, coefficient de rugosité $c_r(z) = k_r \ln(z/z_0)$ avec $k_r = 0.19\,(z_0/0.05)^{0.07}$, longueurs de rugosité et hauteurs minimales des cinq catégories de terrain, intensité de turbulence $I(z) = 1/\ln(z/z_0)$ en terrain plat : les formules de 2005 sont reprises, renumérotées dans les articles 6.2 à 6.4.

**La pointe change de forme.** En 2005, la pression de pointe ajoutait à la pression moyenne un terme linéaire en turbulence, le 7 venant d’un facteur de pointe de 3,5 (4.5, NOTE 3) :

$$
q_p(z) = \left[1 + 7\,I_v(z)\right]\,\frac{1}{2}\,\rho\,v_m^2(z) \qquad \text{(4.8)}
$$

En 2026, c’est la vitesse de pointe $v_p = v_m\,(1 + g_u\,I_u)$ qu’on élève au carré :

$$
q_p(z) = c_r^2(z)\,c_o^2(z)\,\left[1 + g_u\,I_u(z)\right]^2\,q_b \qquad \text{(6.13)}
$$

avec $g_u$ = 2,9. Les deux formules coïncident pour $I \approx 0.14$. Au-delà, c’est-à-dire près du sol ou en terrain rugueux, la formule de 2026 donne plus ; en dessous (grande hauteur en terrain lisse), légèrement moins.

| | 2005 | 2026 |
|---|---|---|
| Pointe | $1 + 7\,I_v$ sur $q_m$ | $(1 + 2.9\,I_u)^2$ sur $c_r^2\,q_b$ |
| Changement climatique | non | $v_{b,0}$ multipliée par $f_{w,cc} \ge 1$ (6.2(2)) |
| $k_r$ | formule | formule (6.7) et valeurs arrondies au tableau 6.1 |
| Organisation | sections 4 à 8 | sections 6 à 8, coefficients en annexes B, C, D normatives |

**Un piège d’arrondi.** Le tableau 6.1 donne $k_r$ arrondi à deux décimales. En catégorie III, la formule (6.7) donne 0,2154, et le tableau 0,22 : la différence relève $q_p$ d’environ 4 %. L’outil applique la formule, comme l’exemple de l’atelier JRC de juin 2025, qu’il retrouve exactement.

## Pourquoi

Une pression varie comme le carré d’une vitesse. Appliquer le carré à la vitesse de pointe est plus juste physiquement que d’ajouter un terme linéaire à la pression moyenne, surtout quand la turbulence est forte. Le facteur $g_u$ = 2,9 a été recalé avec les coefficients aérodynamiques des nouvelles annexes B à D, qui vont avec : on ne mélange pas une $q_p$ de 2026 avec des $c_{pe}$ de 2005.

## L’exemple type : un immeuble de grande hauteur et un petit immeuble en ville

L’immeuble de 100 m présenté à l’atelier JRC de juin 2025 (catégorie III, $v_{b,0}$ = 27 m/s), à 100 m de hauteur :

```exemple
{
  "nom": "tour-100m",
  "mecanisme": "pression-pointe",
  "entree": { "vb0": 27, "z0": 0.3, "zmin": 5, "z": 100 },
  "attendus": {
    "en1991-1-4-2005/qp.sollicitation": "1573",
    "en1991-1-4-2026/qp.sollicitation": "1603"
  }
}
```

$q_p$ passe de {{tour-100m:en1991-1-4-2005/qp.sollicitation}} à {{tour-100m:en1991-1-4-2026/qp.sollicitation}} Pa (+2 %), les valeurs de l’atelier. Un petit immeuble de 8 m en centre-ville (catégorie IV, $z_{min}$ = 10 m, $v_{b,0}$ = 26 m/s) :

```exemple
{
  "nom": "immeuble-ville",
  "mecanisme": "pression-pointe",
  "entree": { "vb0": 26, "z0": 1.0, "zmin": 10, "z": 8 },
  "attendus": {
    "en1991-1-4-2005/qp.sollicitation": "497",
    "en1991-1-4-2026/qp.sollicitation": "628",
    "en1991-1-4-2026/qp.I(z)": "0,434"
  }
}
```

Avec une intensité de turbulence de {{immeuble-ville:en1991-1-4-2026/qp.I(z)}}, $q_p$ passe de {{immeuble-ville:en1991-1-4-2005/qp.sollicitation}} à {{immeuble-ville:en1991-1-4-2026/qp.sollicitation}} Pa : **+26 %**. Un facteur climatique $f_{w,cc}$ = 1,05 porterait la pression à 692 Pa, +39 % sur 2005.

{{calculateur:immeuble-ville}}

**Coefficient structural.** Pour le même immeuble de 100 m, l’atelier montre aussi que les deux procédures de 2005 pour $c_s c_d$ (0,924 et 0,955) sont remplacées par une seule, en annexe E, avec de nouvelles fonctions de réponse quasi statique et résonante et une échelle de turbulence portée à 300 m : $c_{sd}$ = 0,913. L’effort tranchant à la base reste dans la même fourchette (7,7 à 8,0 MN). Ce calcul n’est pas encore codé ici.

## L’effet sur une note de calcul existante

- **Bâtiments bas en ville ou en banlieue** : à la hauteur $z_{min}$, $q_p$ augmente d’environ 18 % en catégorie III et 26 % en catégorie IV ; l’écart diminue avec la hauteur (+4 % à 40 m en catégorie III).
- **Grande hauteur, terrain dégagé** : quasi inchangé, parfois en légère baisse.
- **Changement climatique** : $f_{w,cc}$ multiplie la vitesse, donc agit au carré sur la pression.
- Les coefficients de pression de 2005 ne se combinent pas avec la $q_p$ de 2026 : reprendre les deux ensemble.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La carte de $v_{b,0}$, $f_{w,cc}$ et sa valeur minimale.
- Le tableau 6.1 (catégories, $z_0$, $z_{min}$, $k_r$) et l’éventuelle méthode propre de $q_p$.
- La valeur de $g_u$ et du coefficient de turbulence $k_I$.
