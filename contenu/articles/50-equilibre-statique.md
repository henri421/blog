---
titre: Équilibre statique et principe de la source unique
ordre: 50
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), sans autre amendement ni corrigendum pris en compte ; clauses 6.1.1(3) et (4), 8.3.3.1, formule (8.8) et tableau A.1.8 lus sur le texte le 2026-10-18 ; EN 1990:2002 + A1:2005, tableau A1.2(A), citée selon les valeurs recommandées usuelles, le texte complet de 2002 n’étant pas détenu ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les coefficients 1,10 et 0,90 de la vérification EQU disparaissent. Le cas VC2 les remplace et reprend la vérification combinée que la première génération ne proposait qu’en note, avec 1,35 et 1,15 sur les parties d’une même action permanente.
motscles: combinaisons, actions, elu, stabilite
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

Quand une même action permanente a une partie qui stabilise et une partie qui déstabilise (le poids propre d’une poutre à console, par exemple), les deux parties sont fortement corrélées : elles ne peuvent pas être à la fois plus lourdes et plus légères que prévu. C’est le **principe de la source unique** (6.1.1(3)). Il était déjà présent en 2002 ; la deuxième génération le nomme, le définit et l’étend aux actions climatiques qui agissent sur plusieurs parties d’une structure (6.1.1(4)).

| | 2002 (tableau A1.2(A)) | 2023 (8.3.3.1, tableau A.1.8) |
|---|---|---|
| Vérification de l’équilibre seul | EQU : $\gamma_{G,sup}$ = 1,10, $\gamma_{G,inf}$ = 0,90, $\gamma_Q$ = 1,5 | supprimée |
| Vérification combinée équilibre et résistance | NOTE 2 : 1,35 et 1,15, puis contrôle avec 1,00 sur les deux parties | VC2(a) : $1.35\,k_F$ et $\gamma_{G,stb}$ = 1,15 ; VC2(b) : 1,0 et 1,0 ; la moins favorable |
| Action variable défavorable | 1,5 | $1.5\,k_F$ |
| Source unique hors équilibre (VC1) | usage courant, peu codifié | un seul coefficient, (8.6) si l’effet net est défavorable, (8.7) s’il est favorable (8.3.3.1(4)) |

Le coefficient de la partie stabilisatrice est donné par

$$
\gamma_{G,stb} = \gamma_G\,\rho \qquad \text{(8.8)}
$$

avec $\rho$ = 0,85, d’où $0.85 \times 1.35 \approx 1.15$.

**Ce qui n’est plus permis.** En situation d’équilibre ou de soulèvement, on ne peut plus appliquer un coefficient unique à toute l’action de source unique (8.3.3.1(5)) : chaque partie a son propre coefficient.

## Pourquoi

Les coefficients 1,10 et 0,90 de l’ancienne vérification EQU ne suivaient pas la méthode de calibration des autres états-limites ultimes. Ils conduisaient aussi à des résultats incohérents quand un élément de structure assure lui-même l’équilibre (un tirant, un ancrage) : l’équilibre se vérifiait avec un jeu de coefficients, l’élément avec un autre. VC2 traite les deux d’un coup. Un $\gamma_{G,stb}$ supérieur à 1 peut surprendre. Il est compensé par le $\gamma_G$ = 1,35 de la partie déstabilisatrice, et c’est le rapport des deux qui compte : 1,35/1,15 ≈ 1,17, contre 1,10/0,90 ≈ 1,22 en 2002. Le cas VC2(b), avec 1,0 partout, protège les structures où la charge variable domine.

## L’exemple type : poutre à console

Poutre sur deux appuis A et B, portée $L$ = 5 m, prolongée au-delà de B par une console de $a$ = 3,6 m. Poids propre $g_k$ = 10 kN/m sur toute la longueur ; charge variable $q_k$ = 5 kN/m sur la console seule. L’appui A se soulève-t-il ? Les moments sont pris autour de B.

```exemple
{
  "nom": "console",
  "mecanisme": "equilibre-statique",
  "entree": { "L": 5, "a": 3.6, "g": 10, "q": 5, "cc": "CC2" },
  "attendus": {
    "en1990-2002/equ.sollicitation": "119,88",
    "en1990-2002/equ.resistance": "112,50",
    "en1990-2002/equ.F_ancrage": "1,48",
    "en1990-2002/equ-str.sollicitation": "136,08",
    "en1990-2023/vc2.sollicitation": "136,08",
    "en1990-2023/vc2.resistance": "143,75",
    "en1990-2023/vc2.F_ancrage": "0,00"
  }
}
```

En 2002, la vérification EQU donne un moment déstabilisant de {{console:en1990-2002/equ.sollicitation}} kN·m contre {{console:en1990-2002/equ.resistance}} kN·m stabilisants : il faut ancrer l’appui A pour {{console:en1990-2002/equ.F_ancrage}} kN. Avec VC2, en classe CC2, le cas (a) gouverne : {{console:en1990-2023/vc2.sollicitation}} kN·m contre {{console:en1990-2023/vc2.resistance}} kN·m, et l’équilibre est assuré sans ancrage. La vérification combinée de la NOTE 2 de 2002 donnait déjà ce résultat.

```exemple
{
  "nom": "console-cc3",
  "mecanisme": "equilibre-statique",
  "entree": { "L": 5, "a": 3.6, "g": 10, "q": 5, "cc": "CC3" },
  "attendus": {
    "en1990-2023/vc2.sollicitation": "149,69",
    "en1990-2023/vc2.F_ancrage": "1,19"
  }
}
```

En classe CC3, $k_F$ = 1,1 multiplie la partie déstabilisatrice ({{console-cc3:en1990-2023/vc2.sollicitation}} kN·m), mais pas $\gamma_{G,stb}$, que le tableau A.1.8 fixe à 1,15 : il faut un ancrage de {{console-cc3:en1990-2023/vc2.F_ancrage}} kN. **Point à surveiller** : si l’on appliquait la formule (8.8) à $\gamma_G = 1.35\,k_F$, on obtiendrait $\gamma_{G,stb}$ = 1,265 en CC3, et plus d’ancrage. L’outil suit le tableau, qui donne une valeur chiffrée ; l’annexe nationale devra lever l’ambiguïté.

{{calculateur:console}}

## L’effet sur une note de calcul existante

- Une note qui vérifiait l’équilibre avec 1,10 et 0,90 doit être reprise avec VC2 ; pour une console en béton, le résultat est souvent **moins sévère**.
- Une note qui appliquait déjà la vérification combinée de la NOTE 2 reste valable en CC2.
- En **CC3**, la partie déstabilisatrice est majorée de 10 % et la stabilisatrice ne l’est pas : un équilibre juste en CC2 peut demander un ancrage.
- Le principe de la source unique ne s’applique pas aux structures sensibles à la variation spatiale des actions permanentes ; il demande du jugement.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs de $\rho$, de $\gamma_{G,stb}$ et du tableau A.1.8.
- Si $k_F$ s’applique ou non à $\gamma_{G,stb}$ en CC1 et en CC3.
