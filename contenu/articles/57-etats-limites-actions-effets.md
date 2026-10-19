---
titre: États-limites, analyse et coefficients sur les actions ou les effets
ordre: 57
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 5.1 à 5.5, 7.1, 7.2, 8.1 à 8.3.2 et 8.4.1, 8.4.2, formules (8.1) à (8.5) lues sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; EN 1990:2002 (version française), sections 3 et 5, 6.3.2, lue sur le texte le 2026-10-19, sans l’A1:2005 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-19
resume: Le principe des états-limites ne change pas, mais la deuxième génération ajoute un état-limite ultime de déformation excessive et précise quand appliquer les coefficients partiels aux actions ou aux effets. Le choix compte pour les câbles et membranes.
motscles: elu, analyse-structurale
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (3.2, 6.3.2) : situations de projet, (6.2a) et règles de 6.3.2(4) confirmées.
---

## Ce qui change

**Situations de projet (5.2).** Durable, transitoire, accidentelle, sismique : la liste de 2002 reçoit une cinquième situation, **la fatigue**, avec ses exemples (trafic sur un pont, vibrations de cheminées, machines).

**États-limites ultimes (5.3).** La liste s’allonge : défaillance du terrain par gradient hydraulique (soulèvement, érosion interne), fatigue, vibrations et autres effets dépendant du temps. Un état précédant l’effondrement peut servir d’état-limite ultime quand la ruine est ductile et difficile à définir.

**Deux inégalités de vérification.** À côté de $E_d \le R_d$ (8.1), la formule (8.2) vérifie un état-limite ultime de **déformation excessive** :

$$
E_d \le C_{d,ELU} \qquad \text{(8.2)}
$$

où $E_d$ est un déplacement ou une déformation. L’EN 1998 s’en sert pour éviter les ruptures fragiles.

**Analyse (7.2).** La deuxième génération distingue analyse linéaire et non linéaire et nomme les quatre sources de non-linéarité : contact, matériau, géométrie, fonction d’état-limite. Les modèles non linéaires doivent être validés.

**Coefficients sur les actions ou sur les effets (8.3.2).** La formule générale (8.3) sépare l’incertitude sur l’action ($\gamma_f$) et sur le modèle ($\gamma_{Sd}$). Deux simplifications :

$$
E_d = E\left\{\gamma_F\,F_{rep}\right\} \qquad \text{(8.4)}
$$

$$
E_d = \gamma_E\,E\left\{F_{rep}\right\} \qquad \text{(8.5)}
$$

| | 2002 | 2023 |
|---|---|---|
| Règle par défaut | (6.2a), coefficients sur les actions | (8.4), pour les systèmes linéaires **et non linéaires** |
| Effet qui croît moins vite que l’action | coefficient sur l’effet (6.3.2(4)) | (8.5) seulement pour les câbles, membranes et certains ouvrages géotechniques (VC4) |
| $\gamma_E$ | — | peut être pris égal au plus grand $\gamma_F$ |

## Pourquoi

Pour une structure dont l’effet croît moins vite que la charge (câble tendu, membrane), appliquer le coefficient à l’action sous-estime l’effet de calcul : $(\gamma F)^p < \gamma\,F^p$ si $p < 1$. Retenir systématiquement la plus défavorable des deux formules conduirait toutefois à des projets peu économiques, d’après les rédacteurs. La deuxième génération limite donc (8.5) aux cas où l’écart est connu et significatif, et fait de (8.4) la règle, y compris pour l’analyse non linéaire.

## L’exemple type : câble d’une toiture suspendue

La tension d’un câble sous charge transversale croît comme $q^{2/3}$ : $T = 50\,q^{2/3}$, avec $q$ = 2 kN/m et $\gamma$ = 1,5.

```exemple
{
  "nom": "cable-toiture",
  "mecanisme": "actions-effets",
  "entree": { "F": 2, "k": 50, "p": 0.6666666667, "gamma": 1.5 },
  "attendus": {
    "en1990-2023/actions.sollicitation": "104,0",
    "en1990-2023/effets.sollicitation": "119,1",
    "en1990-2023/actions.E_k": "79,4"
  }
}
```

La tension caractéristique vaut {{cable-toiture:en1990-2023/actions.E_k}} kN. Avec le coefficient sur l’action (8.4), $T_d$ = {{cable-toiture:en1990-2023/actions.sollicitation}} kN ; avec le coefficient sur l’effet (8.5), $T_d$ = {{cable-toiture:en1990-2023/effets.sollicitation}} kN, soit 14 % de plus. Pour un câble, c’est (8.5) qui s’impose en 2023, comme en 2002.

{{calculateur:cable-toiture}}

## L’effet sur une note de calcul existante

- Pour une ossature courante, rien ne change : (8.4) reprend (6.2a).
- Pour une analyse non linéaire géométrique (second ordre, par exemple), le coefficient s’applique désormais aux actions, même si l’effet croît moins vite que la charge, sauf câbles et membranes.
- Un état-limite de déformation excessive peut être exigé par un Eurocode de matériau ou par l’EN 1998.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les cas supplémentaires où les coefficients s’appliquent aux effets (8.3.2.1(4), NOTE 2).
- Les valeurs de $\gamma_E$ et de $C_{d,ELU}$ fixées par les autres Eurocodes.
