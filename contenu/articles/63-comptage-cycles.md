---
titre: Actions de fatigue et comptage des cycles
ordre: 63
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 5.2, 6.1.3.3, 8.3.3.6, 8.3.4.5, 8.3.5.4 et annexe F lus sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; EN 1990:2002 (version française), 3.1(5), 4.1.4 et 6.4.1, lue sur le texte le 2026-10-19, sans l’A1:2005 ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-19
resume: La fatigue devient une situation de projet de l’EN 1990, avec ses actions, sa combinaison et sa résistance de calcul. Une annexe nouvelle décrit les deux méthodes de comptage des cycles, par demi-cycles et par réservoir.
motscles: fatigue
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : première génération lue sur le texte de 2002 (3.1(5), 4.1.4, 6.4.1) : conforme ; renvois précisés.
---

## Ce qui change

En 2002, l’EN 1990 mentionnait la fatigue parmi les états-limites ultimes (6.4.1, FAT), demandait d’associer les effets dépendant du temps à la durée d’utilisation de projet (3.1(5)) et renvoyait pour le reste aux Eurocodes d’actions et de matériaux, y compris pour les modèles d’actions de fatigue (4.1.4). La deuxième génération lui donne une place à chaque étape :

- une **situation de projet** de fatigue (5.2, tableau 5.1) ;
- des **actions de fatigue** (6.1.3.3), définies par leur amplitude et leur nombre de répétitions, effets dynamiques compris ;
- une **combinaison** avec les autres actions, seulement si un Eurocode le demande (8.3.4.5, formule (8.17)), l’action de même type n’étant pas reprise comme variable ;
- une **résistance de calcul** $R_{fat,d} = R_{fat}/\gamma_{Mf}$ (8.22) ;
- l’**annexe F**, informative et nouvelle, qui décrit le comptage des plages de contraintes par la méthode des demi-cycles (« rainflow ») et par la méthode du réservoir. Ces méthodes figuraient auparavant dans l’EN 1993-1-9.

La méthode des demi-cycles coupe l’historique à son maximum absolu, reporte la partie gauche à la fin pour fermer la boucle, puis suit les « gouttes d’eau » qui tombent des pics et des vallées ; chaque trajet définit un demi-cycle, et les demi-cycles se couplent en cycles. La méthode du réservoir donne le même résultat en vidant un réservoir dont le fond a la forme de l’historique.

## Pourquoi

Regrouper les règles de fatigue dans l’EN 1990 rend la démarche commune à tous les matériaux : mêmes situations de projet, même comptage, même format de vérification. Seules les courbes de résistance et les coefficients $\gamma_{Mf}$ restent propres à chaque Eurocode de matériau.

## L’exemple type : un historique de contraintes

Un détail soudé voit, à chaque passage d’un convoi, l’historique de contraintes 20, 60, 30, 80, 10, 50, 40, 90 MPa. On compte les cycles, puis on calcule la plage équivalente à 2 × 10⁶ cycles pour une courbe de pente $m$ = 3 et 10⁶ passages :

$$
\Delta\sigma_E = \left(\frac{n_{rep}\,\sum_i \Delta\sigma_i^m}{2 \times 10^6}\right)^{1/m}
$$

```exemple
{
  "nom": "convoi",
  "mecanisme": "comptage-cycles",
  "entree": { "s1": 20, "s2": 60, "s3": 30, "s4": 80, "s5": 10, "s6": 50, "s7": 40, "s8": 90, "m": 3, "nrep": 1000000 },
  "attendus": {
    "en1990-2023/rainflow.Δσ_1": "80",
    "en1990-2023/rainflow.Δσ_2": "60",
    "en1990-2023/rainflow.sollicitation": "72,3"
  }
}
```

Le comptage donne quatre cycles, de {{convoi:en1990-2023/rainflow.Δσ_1}}, {{convoi:en1990-2023/rainflow.Δσ_2}}, 30 et 10 MPa. La plage équivalente vaut {{convoi:en1990-2023/rainflow.sollicitation}} MPa, à comparer à la catégorie de détail de l’Eurocode du matériau, divisée par $\gamma_{Mf}$.

{{calculateur:convoi}}

## L’effet sur une note de calcul existante

- Aucun sur les résultats : les méthodes de comptage sont celles qu’on utilisait déjà.
- La note peut désormais renvoyer à l’EN 1990 pour la situation de projet, la combinaison et le comptage.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application de l’annexe F, informative.
