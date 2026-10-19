---
titre: Dimensionnement assisté par l’expérimentation
ordre: 60
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 7.3 et annexe D (D.7, tableaux D.1 et D.2) lus sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; EN 1990:2002 (version française), 5.2 et annexe D (D.7, tableaux D.1 et D.2), lue sur le texte le 2026-10-19, sans l’A1:2005 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: L’évaluation statistique des essais ne change pas. Comme en 2002, le texte recommande d’utiliser un coefficient de variation connu, estimé prudemment, plutôt que celui d’un petit échantillon, et de ne pas le supposer inférieur à 0,10 quand il est inconnu.
motscles: materiaux-beton, fiabilite
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (annexe D) : **corrigé** : les hypothèses des tableaux, la préférence pour « Vx connu » et le plancher Vx ≥ 0,10 figuraient déjà en D.7.1(5) de 2002 ; écart d’arrondi entre k_n calculé et tableau D.1 signalé. L’application du plancher par l’outil attend la décision de l’auteur.
---

## Ce qui change

**Le principe (7.3).** On peut établir une résistance, une action ou un modèle à partir d’essais, à condition d’atteindre le niveau de fiabilité visé par les Eurocodes. L’annexe D décrit la planification, l’exécution et l’évaluation des essais.

**La valeur caractéristique (D.7.2).** Pour une propriété $X$ mesurée $n$ fois :

$$
X_k = m_x\,(1 - k_n\,V_x) \quad \text{(}V_x\text{ connu)} \qquad\qquad X_k = m_x - k_n\,s_x \quad \text{(}V_x\text{ inconnu)}
$$

$$
X_d = \eta_d\,\frac{X_k}{\gamma_m} \qquad \text{(D.1)}
$$

Le tableau D.1 donne $k_n$ ; ses valeurs sont celles de 2002. Elles se recalculent : $k_n = 1.645\,\sqrt{1 + 1/n}$ si $V_x$ est connu, $k_n = t_{n-1;0.95}\,\sqrt{1 + 1/n}$ sinon. L’outil calcule $k_n$ au lieu de le lire : le tableau tronque plutôt qu’il n’arrondit, d’où un écart de 0,01 à 0,02 (2,33 contre 2,31 pour un essai, 1,84 contre 1,83 pour quatre essais avec $V_x$ connu, 2,01 contre 2,00 pour huit essais avec $V_x$ inconnu), sans effet sur $X_k$ au-delà du centième. Le tableau D.2 donne de même $k_{d,n}$ pour une évaluation directe de la valeur de calcul (méthode B), avec $\alpha_R\,\beta$ = 0,8 × 3,8 = 3,04.

**Ce qui est reconduit.** Les hypothèses des tableaux (lois normale ou log-normale, aucune connaissance préalable de la moyenne, $V_x$ parfaitement connu ou totalement inconnu), la préférence pour le cas « $V_x$ connu » avec une estimation prudente de $V_x$, et la règle selon laquelle $V_x$ inconnu ne doit pas être supposé inférieur à 0,10 figuraient déjà en D.7.1(5) de 2002. La deuxième génération les garde. La méthode A (valeur caractéristique puis coefficient partiel de l’Eurocode) est préférable à la méthode B si les essais ressemblent au domaine d’emploi habituel du coefficient.

## Pourquoi

Avec quatre essais, l’écart type de l’échantillon est très incertain : $k_n$ passe de 1,84 à 2,63 selon que $V_x$ est connu ou non. Un $V_x$ issu de la littérature ou d’essais antérieurs comparables est souvent plus fiable qu’un écart type calculé sur quatre valeurs.

## L’exemple type : acier d’armature d’une poutre de 1940

L’exemple d’évaluation présenté à l’atelier JRC de juin 2025 (EN 1990-2) : quatre éprouvettes taillées dans une même barre, limites d’élasticité 312, 301, 308 et 306 MPa. On suppose $V_x$ = 0,01 connu.

```exemple
{
  "nom": "acier-1940",
  "mecanisme": "essais-caracteristique",
  "entree": { "x1": 312, "x2": 301, "x3": 308, "x4": 306, "Vx": 0.01 },
  "attendus": {
    "en1990-2023/v-connu.resistance": "301,1",
    "en1990-2023/v-inconnu.resistance": "294,7",
    "en1990-2023/v-inconnu.k_n": "2,631"
  }
}
```

Avec $V_x$ connu, $f_{yk}$ = {{acier-1940:en1990-2023/v-connu.resistance}} MPa ; avec $V_x$ estimé sur l’échantillon ($k_n$ = {{acier-1940:en1990-2023/v-inconnu.k_n}}), $f_{yk}$ = {{acier-1940:en1990-2023/v-inconnu.resistance}} MPa. L’atelier retenait 299 MPa, en combinant $k_n$ = 2,63 et un $V_x$ arrondi à 0,01, alors que celui de l’échantillon vaut 0,015. Les deux générations donnent les mêmes valeurs.

{{calculateur:acier-1940}}

## L’effet sur une note de calcul existante

- Aucun sur les formules ; une note d’essais doit dire si $V_x$ est connu ou estimé, et justifier une valeur connue.
- Pour les structures existantes, l’EN 1990-2 complète cette annexe par la mise à jour bayésienne des propriétés.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application de l’annexe D, informative.
