---
titre: Combinaisons accidentelles et incendie
ordre: 54
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 8.3.4.3 et tableau A.1.3 ; EN 1991-1-2:2024, 6.3, formules (6.1) à (6.4) ; EN 1991-1-7:2025, avant-propos et domaine ; textes lus le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1990:2002 (6.11b) et EN 1991-1-2:2002 (4.3) cités selon leurs formules usuelles, les textes de première génération n’étant pas détenus ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: La combinaison accidentelle ne change pas, ni le coefficient ηfi de la vérification simplifiée au feu. Mais ηfi se rapporte maintenant à des coefficients modulés par kF, et l’EN 1991-1-7 renvoie la robustesse à l’EN 1990.
motscles: combinaisons, actions, robustesse
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**La combinaison accidentelle est la même.** La formule (8.15) reprend (6.11b) de 2002 :

$$
\sum F_d = \sum_i G_{k,i} + P_k + A_d + (\psi_{1,1}\ \text{ou}\ \psi_{2,1})\,Q_{k,1} + \sum_{j>1} \psi_{2,j}\,Q_{k,j} \qquad \text{(8.15)}
$$

Elle couvre une action accidentelle explicite (choc, explosion, neige exceptionnelle) ou la situation qui suit l’événement ($A_d$ = 0). Pour l’incendie, l’EN 1991-1-2:2024 recommande toujours la valeur quasi permanente $\psi_{2,1}\,Q_{k,1}$, sauf choix de la valeur fréquente par l’annexe nationale (6.3.1(2)).

**Le coefficient $\eta_{fi}$ est le même, mais ses coefficients changent.** La méthode simplifiée déduit l’effet au feu de l’effet à froid, $E_{d,fi} = \eta_{fi}\,E_d$, avec

$$
\eta_{fi} = \frac{G_k + \psi_{fi}\,Q_{k,1}}{\gamma_G\,G_k + \gamma_{Q,1}\,Q_{k,1}} \qquad \text{(6.2)}
$$

En 2023, $\gamma_G = 1.35\,k_F$ et $\gamma_Q = 1.5\,k_F$. Pour un même bâtiment, $\eta_{fi}$ baisse donc de 10 % en CC3 et monte de 11 % en CC1, alors que $E_{d,fi}$ reste le même. Les tableaux de l’EN 1992-1-2, établis pour $\eta_{fi}$ = 0,7, deviennent un peu plus prudents en CC3.

**L’EN 1991-1-7 s’allège.** Les stratégies de robustesse et les règles associées passent dans l’EN 1990 (4.4 et annexe E). L’annexe A se limite aux chaînages et aux éléments clés. Les actions dues aux opérations des navires (accostage, amarrage) et aux détonations sont exclues du domaine, et une annexe E nouvelle traite des débris.

**Neige exceptionnelle.** Elle se traite en situation accidentelle, avec $s_{Ad} = C_{esl}\,s_k$ et $C_{esl}$ = 2,0 (EN 1991-1-3:2025, 6.2) ; voir l’article sur la neige.

## Pourquoi

La combinaison accidentelle était déjà stable ; la deuxième génération la reformule sans en changer le fond. Le déplacement de la robustesse vers l’EN 1990 la rend applicable à tous les ouvrages et à tous les matériaux, et non plus seulement aux actions accidentelles identifiées. Le lien entre $\eta_{fi}$ et $k_F$ découle mécaniquement de l’article 49 : le facteur de conséquence agit sur les coefficients à froid, pas sur les actions au feu.

## L’exemple type : poteau de bureaux en situation d’incendie

Le poteau de l’article 47 : $G_k$ = 800 kN ; bureaux $Q_{k,1}$ = 300 kN, $\psi_1$ = 0,5, $\psi_2$ = 0,3 ; neige $Q_{k,2}$ = 100 kN, $\psi_2$ = 0. Incendie, valeur quasi permanente, classe CC2.

```exemple
{
  "nom": "poteau-feu",
  "mecanisme": "combinaison-accidentelle",
  "entree": { "G": 800, "Ad": 0, "Q1": 300, "psi11": 0.5, "psi21": 0.3, "Q2": 100, "psi22": 0, "valeur": "quasi-permanente", "cc": "CC2" },
  "attendus": {
    "en1990-2002/acc.sollicitation": "890",
    "en1990-2023/acc.sollicitation": "890",
    "en1990-2023/acc.η_fi": "0,582"
  }
}
```

```exemple
{
  "nom": "poteau-feu-cc3",
  "mecanisme": "combinaison-accidentelle",
  "entree": { "G": 800, "Ad": 0, "Q1": 300, "psi11": 0.5, "psi21": 0.3, "Q2": 100, "psi22": 0, "valeur": "quasi-permanente", "cc": "CC3" },
  "attendus": {
    "en1990-2023/acc.sollicitation": "890",
    "en1990-2023/acc.η_fi": "0,529"
  }
}
```

L’effort au feu vaut {{poteau-feu:en1990-2023/acc.sollicitation}} kN dans les deux générations, et $\eta_{fi}$ = {{poteau-feu:en1990-2023/acc.η_fi}} en CC2. En CC3, l’effort au feu est le même ({{poteau-feu-cc3:en1990-2023/acc.sollicitation}} kN), mais $\eta_{fi}$ tombe à {{poteau-feu-cc3:en1990-2023/acc.η_fi}}, parce que l’effort à froid a augmenté de 10 %.

{{calculateur:poteau-feu}}

## L’effet sur une note de calcul existante

- Les **combinaisons accidentelles** d’une note de 2002 restent valables.
- Si la note calculait $E_{d,fi}$ par $\eta_{fi}\,E_d$, il faut prendre $\eta_{fi}$ et $E_d$ avec les mêmes coefficients : un $E_d$ de 2023 en CC3 avec un $\eta_{fi}$ de 2002 surestime l’effet au feu de 10 %.
- La réduction des charges d’exploitation ($\alpha_A$, $\alpha_n$) est interdite en situation accidentelle et au feu (EN 1991-1-1:2025, 6.5.3.2(3)) ; voir l’article 48.
- Les mesures de robustesse (chaînages, éléments clés, chemins de charge alternatifs) se cherchent désormais dans l’EN 1990, annexe E.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Le choix entre $\psi_{1,1}$ et $\psi_{2,1}$ en situation accidentelle et au feu.
- Les valeurs de $A_d$ (chocs, explosions) de l’EN 1991-1-7 et de $C_{esl}$.
