---
titre: Combinaisons d’actions à l’ELU
ordre: 47
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), sans autre amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-09 ; EN 1990:2002 (version française), 6.4.3.2 et tableaux A1.1, A1.2(B), lue sur le texte le 2026-10-19, sans l’A1:2005 ; AN-LU:2020 de l’EN 1990:2002+A1:2005 (A1.2.2, A1.3.1(1)) lue sur le texte le 2026-10-19 ; état d’amendement non encore vérifié.
redige: 2026-10-09
revise: 2026-10-19
resume: Les combinaisons fondamentales gardent leurs coefficients 1,35 et 1,5, mais ceux-ci dépendent désormais de la classe de conséquences, et une troisième méthode apparaît, où les actions permanentes seules forment une combinaison à part.
motscles: combinaisons, actions, elu
historique:
  - 2026-10-09 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (6.4.3.2, tableaux A1.1 et A1.2(B)) : valeurs et expressions confirmées ; origine de (8.14) dans la NOTE 1 du tableau A1.2(B).
  - 2026-10-19 : section sur l’annexe nationale luxembourgeoise (AN-LU:2020, A1.2.2 et A1.3.1(1)) et niveau AN-LU du calculateur.
---

## Ce qui change

Pour un bâtiment, la vérification de la résistance structurale combine les actions permanentes, une action variable dominante et les actions variables d’accompagnement, chacune multipliée par un coefficient partiel. Trois changements :

- **le facteur de conséquence $k_F$** multiplie les coefficients des actions défavorables : $\gamma_G = 1.35\,k_F$, $\gamma_Q = 1.5\,k_F$, avec $k_F$ = 0,9 pour la classe CC1, 1,0 pour CC2 et 1,1 pour CC3 (tableaux A.1.8 et A.1.9). En 2002, ce facteur ($K_{FI}$) existait seulement dans l’annexe B informative ;
- **trois méthodes au lieu de deux** : (8.12) reprend (6.10), (8.13) reprend la paire (6.10a), (6.10b), et (8.14) devient une méthode du texte, alors qu’en 2002 elle n’était qu’une variante ouverte à l’annexe nationale (tableau A1.2(B), NOTE 1 : (6.10a) réduite aux seules actions permanentes) ;
- **la méthode par défaut** est (8.12), sauf choix contraire de l’annexe nationale. En 2002, le choix entre (6.10) et (6.10a/b) relevait de l’annexe nationale.

$$
\sum F_d = \gamma_G\,G_k + \gamma_Q\,Q_{k,1} + \gamma_Q\,\psi_0\,Q_{k,2} \qquad \text{(8.12)}
$$

$$
\sum F_d = \max\left\{\gamma_G\,G_k + \gamma_Q\,\psi_{0,1}\,Q_{k,1} + \gamma_Q\,\psi_0\,Q_{k,2} \,;\, \xi\,\gamma_G\,G_k + \gamma_Q\,Q_{k,1} + \gamma_Q\,\psi_0\,Q_{k,2}\right\} \qquad \text{(8.13)}
$$

$$
\sum F_d = \max\left\{\gamma_G\,G_k \,;\, \xi\,\gamma_G\,G_k + \gamma_Q\,Q_{k,1} + \gamma_Q\,\psi_0\,Q_{k,2}\right\} \qquad \text{(8.14)}
$$

avec $\xi$ = 0,85, et $\xi\,\gamma_G \ge 1.0$ (A.1.7(3)).

## Pourquoi

La formule (8.12) applique le coefficient 1,35 à toute la charge permanente, même quand l’action variable domine : elle est simple mais pénalise les structures lourdes. Les variantes réduisent ce coefficient par $\xi$ quand une action variable est à sa pleine valeur. (8.13) garde un cas où les actions permanentes dominent, avec les actions variables à leur valeur de combinaison. (8.14) va plus loin : dans ce cas, les actions permanentes sont considérées seules. Ses deux expressions sont chacune au plus égales à celles de (8.13), qui ne dépassent pas (8.12) : pour un même cas de charge, (8.14) ≤ (8.13) ≤ (8.12).

Le facteur $k_F$ module la fiabilité visée selon les conséquences d’une défaillance. Il agit sur les actions, et non plus sur les matériaux.

## L’exemple type : poteau de bureaux sous toiture

Poteau intérieur, charges cumulées : $G_k$ = 800 kN ; exploitation des bureaux $Q_{k,1}$ = 300 kN, $\psi_0$ = 0,7 ; neige $Q_{k,2}$ = 100 kN, $\psi_0$ = 0,5 (site à moins de 1000 m). Bâtiment de classe CC2. Les coefficients $\psi_0$ sont saisis par l’ingénieur, qui permute lui-même l’action dominante.

```exemple
{
  "nom": "poteau-bureaux",
  "mecanisme": "combinaison-elu",
  "entree": { "G": 800, "Q1": 300, "psi01": 0.7, "Q2": 100, "psi02": 0.5, "cc": "CC2" },
  "attendus": {
    "en1990-2002/e610.sollicitation": "1605",
    "en1990-2002/e610ab.(6.10a)": "1470",
    "en1990-2002/e610ab.(6.10b)": "1443",
    "en1990-2002/e610ab.sollicitation": "1470",
    "en1990-2023/e812.sollicitation": "1605",
    "en1990-2023/e813.sollicitation": "1470",
    "en1990-2023/e814.(8.14) haut": "1080",
    "en1990-2023/e814.sollicitation": "1443"
  }
}
```

| Méthode | 2002 | 2023 (CC2) |
|---|---:|---:|
| Coefficient unique | (6.10) : {{poteau-bureaux:en1990-2002/e610.sollicitation}} kN | (8.12) : {{poteau-bureaux:en1990-2023/e812.sollicitation}} kN |
| Paire avec $\psi_0$ et $\xi$ | (6.10a/b) : {{poteau-bureaux:en1990-2002/e610ab.sollicitation}} kN | (8.13) : {{poteau-bureaux:en1990-2023/e813.sollicitation}} kN |
| Permanentes seules ou avec $\xi$ | sans objet | (8.14) : {{poteau-bureaux:en1990-2023/e814.sollicitation}} kN |

En classe CC2, les deux générations donnent les mêmes valeurs pour les méthodes communes. (8.14) donne {{poteau-bureaux:en1990-2023/e814.sollicitation}} kN : son expression haute, les permanentes seules ({{poteau-bureaux:en1990-2023/e814.(8.14) haut}} kN), ne gouverne pas ici, et le résultat est 10 % sous (8.12).

```exemple
{
  "nom": "poteau-cc3",
  "mecanisme": "combinaison-elu",
  "entree": { "G": 800, "Q1": 300, "psi01": 0.7, "Q2": 100, "psi02": 0.5, "cc": "CC3" },
  "attendus": {
    "en1990-2023/e812.sollicitation": "1765,5",
    "en1990-2023/e812.k_F": "1,1"
  }
}
```

Le même poteau dans un bâtiment de classe CC3 (grande hauteur, établissement recevant beaucoup de public) passe à {{poteau-cc3:en1990-2023/e812.sollicitation}} kN avec $k_F$ = {{poteau-cc3:en1990-2023/e812.k_F}} : 10 % de plus sur tous les effets défavorables.

{{calculateur:poteau-bureaux}}

## Au Luxembourg : l’annexe nationale de 2020

L’annexe nationale luxembourgeoise de l’EN 1990 (AN-LU:2020) rend normatives les valeurs recommandées des tableaux A1.2, mais réécrit la NOTE 2 du tableau A1.2(B) et touche aux coefficients $\psi_0$.

**(6.10) en général.** Les expressions (6.10a) et (6.10b) restent permises si la variabilité du poids propre est faible, mais le coefficient $\xi$ = 0,85 n’est accordé que si la valeur caractéristique supérieure du poids propre du composant est certifiée sur une base statistique, avec un coefficient de variation inférieur à 10 %. Sinon $\xi$ = 1,00 : (6.10b) redevient (6.10), qui domine (6.10a). En géotechnique, $\xi$ vaut toujours 1,00 (A1.3.1(1)).

**$\psi_0$ = 0,3 entre actions de courte durée.** Quand une action variable de moins d’un mois, la neige ou le vent par exemple, en accompagne une autre de courte durée, son $\psi_0$ est remplacé par 0,3 (A1.2.2). La règle vise l’action qui accompagne, pas l’action dominante.

L’outil calcule ce niveau **à côté** des valeurs recommandées, sans les remplacer ; ses paramètres portent la provenance « annexe nationale (LU) ». La deuxième génération n’a pas encore d’annexe nationale luxembourgeoise.

Moment fléchissant d’une poutre de toiture : $G_k$ = 100 kN·m ; vent dominant 40 kN·m ($\psi_0$ = 0,6) ; neige d’accompagnement 30 kN·m ($\psi_0$ = 0,5). Poids propre non certifié.

```exemple
{
  "nom": "toiture-vent-neige-lu",
  "mecanisme": "combinaison-elu",
  "entree": { "G": 100, "Q1": 40, "psi01": 0.6, "Q2": 30, "psi02": 0.5, "cc": "CC2", "certifie": "non", "courteDuree": "oui" },
  "attendus": {
    "en1990-2002/e610.sollicitation": "217,5",
    "en1990-2002/e610ab.sollicitation": "197,25",
    "en1990-2002/lu.sollicitation": "208,5",
    "en1990-2002/lu.(6.10a)": "184,5"
  }
}
```

```exemple
{
  "nom": "toiture-vent-neige-lu-certifie",
  "mecanisme": "combinaison-elu",
  "entree": { "G": 100, "Q1": 40, "psi01": 0.6, "Q2": 30, "psi02": 0.5, "cc": "CC2", "certifie": "oui", "courteDuree": "oui" },
  "attendus": {
    "en1990-2002/lu.sollicitation": "188,25"
  }
}
```

Sans certification, le niveau luxembourgeois donne {{toiture-vent-neige-lu:en1990-2002/lu.sollicitation}} kN·m : c’est (6.10), allégée de 4 % par $\psi_0$ = 0,3 sur la neige, mais 6 % au-dessus de l’enveloppe recommandée ({{toiture-vent-neige-lu:en1990-2002/e610ab.sollicitation}} kN·m). Avec un poids propre certifié, il tombe à {{toiture-vent-neige-lu-certifie:en1990-2002/lu.sollicitation}} kN·m, 5 % sous cette enveloppe.

{{calculateur:toiture-vent-neige-lu}}

## L’effet sur une note de calcul existante

- Pour un **bâtiment courant (CC2)**, les combinaisons de 2002 restent valables : mêmes coefficients, mêmes expressions.
- Au **Luxembourg**, une note de 2002 qui appliquait (6.10a) et (6.10b) avec $\xi$ = 0,85 sans certification du poids propre n’était pas conforme à l’AN-LU : elle devait revenir à (6.10).
- La note doit désormais indiquer la **classe de conséquences**. En CC3, les effets de calcul augmentent de 10 % ; en CC1, ils diminuent de 10 %.
- Les coefficients des matériaux de l’Eurocode 2 ne changent pas avec la classe de conséquences : la modulation porte sur les actions.
- La méthode (8.14) peut alléger les structures où les actions variables sont importantes, si l’annexe nationale la retient.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La méthode retenue parmi (8.12), (8.13) et (8.14).
- Les valeurs de $k_F$, $\xi$, $\gamma_G$, $\gamma_Q$ et des coefficients $\psi$.
