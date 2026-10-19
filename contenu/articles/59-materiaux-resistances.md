---
titre: Propriétés des matériaux, géométrie et résistances de calcul
ordre: 59
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 6.2, 6.3, 8.3.5 à 8.3.7 et 8.4.5, formules (8.18) à (8.23) lues sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; EN 1990:2002 (version française), 4.2, 4.3, 6.3.3 à 6.3.5, lue sur le texte le 2026-10-19, sans l’A1:2005 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: La deuxième génération nomme les deux façons d’appliquer le coefficient partiel de résistance, sur la propriété du matériau (MFA) ou sur la résistance (RFA), et ajoute une formule pour les éléments multi-matériaux analysés de façon non linéaire. Le choix compte quand la résistance n’est pas proportionnelle à la propriété.
motscles: elu, materiaux-beton
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (6.3.3, 6.3.5) : **corrigé** : (6.6d) existait en 2002, (8.21) la reprend et ne l’ajoute pas.
---

## Ce qui change

**Valeurs caractéristiques (6.2).** Fractile à 5 % si une faible valeur est défavorable, à 95 % si une forte valeur l’est, moyenne si la vérification n’est pas sensible à la variabilité. Les propriétés viennent d’essais normalisés ; un coefficient de conversion $\eta$ passe de l’essai à l’ouvrage. Ce sont les règles de 2002, réécrites ; la deuxième génération précise que des valeurs nominales choisies doivent conduire au moins à la fiabilité visée.

**Géométrie (6.3, 8.3.7).** Valeurs nominales, sauf si le calcul est sensible aux écarts : les imperfections viennent alors des autres Eurocodes. À l’ELS, l’écart $\Delta a$ peut être pris nul (8.4.6(2)).

**Résistance de calcul (8.3.5).** La formule générale sépare l’incertitude du matériau ($\gamma_m$) et celle du modèle ($\gamma_{Rd}$) :

$$
R_d = \frac{1}{\gamma_{Rd}}\,R\left\{\eta\,\frac{X_k}{\gamma_m} \,;\, a_d \,;\, F_{Ed}\right\} \qquad \text{(8.18)}
$$

Deux simplifications, avec $\gamma_M = \gamma_R = \gamma_m\,\gamma_{Rd}$ :

$$
R_d = R\left\{\eta\,\frac{X_k}{\gamma_M}\right\} \quad \text{(8.19, MFA)} \qquad\qquad R_d = \frac{R\left\{\eta\,X_k\right\}}{\gamma_R} \quad \text{(8.20, RFA)}
$$

Elles existaient en 2002 ((6.6) et (6.6a) à (6.6c)), avec la même séparation de $\gamma_m$ et $\gamma_{Rd}$ ; la deuxième génération les nomme (« approche du facteur de matériau », « approche du facteur de résistance ») et renvoie leur choix aux Eurocodes de matériau. La formule (8.21), pour les éléments en plusieurs matériaux analysés de façon non linéaire, reprend (6.6d) de 2002. La fatigue a sa formule propre, $R_{fat,d} = R_{fat}/\gamma_{Mf}$ (8.22).

## Pourquoi

Quand la résistance n’est pas proportionnelle à la propriété, les deux approches ne donnent pas la même valeur. L’EN 1992-1-1 l’illustre : la résistance au cisaillement sans armatures varie comme $f_{ck}^{1/3}$, et le coefficient $\gamma_V$ s’applique à la contrainte résistante, pas à $f_{ck}$ (approche RFA). Diviser $f_{ck}$ par $\gamma_C$ sous la racine cubique réduirait beaucoup moins la résistance.

## L’exemple type : une résistance en racine cubique

$R = 0.66\,X^{1/3}$ avec $X_k$ = 30 MPa et $\gamma$ = 1,5.

```exemple
{
  "nom": "racine-cubique",
  "mecanisme": "resistance-calcul",
  "entree": { "Xk": 30, "eta": 1, "k": 0.66, "q": 0.3333333333, "gamma": 1.5 },
  "attendus": {
    "en1990-2023/mfa.resistance": "1,792",
    "en1990-2023/rfa.resistance": "1,367",
    "en1990-2023/rfa.R_k": "2,051"
  }
}
```

La résistance caractéristique vaut {{racine-cubique:en1990-2023/rfa.R_k}}. Avec le coefficient sur le matériau, $R_d$ = {{racine-cubique:en1990-2023/mfa.resistance}} ; sur la résistance, $R_d$ = {{racine-cubique:en1990-2023/rfa.resistance}}, soit 31 % de moins. Le même $\gamma$ ne donne donc pas la même sécurité selon l’approche : c’est pourquoi chaque Eurocode de matériau calibre son coefficient pour l’approche qu’il retient.

{{calculateur:racine-cubique}}

## L’effet sur une note de calcul existante

- Aucun pour les formules des Eurocodes de matériau, qui fixent l’approche.
- Pour une résistance obtenue par essais ou par un modèle propre, préciser l’approche (MFA ou RFA) et le coefficient associé.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Rien de propre à ces clauses : les coefficients $\gamma_M$, $\gamma_R$ et $\eta$ viennent des autres Eurocodes.
