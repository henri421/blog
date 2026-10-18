---
titre: Actions thermiques dans les bâtiments
ordre: 77
statut: publie
texte: EN 1991-1-5:2025 (NBN, version française), articles 4 à 7, formule (7.1), tableau 7.1 et annexes A et C lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-5:2003 (4, 5, tableaux 5.1 à 5.3) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les températures des bâtiments tiennent désormais dans un seul tableau, avec une température de refroidissement nocturne pour les éléments légers et l’obligation de tenir compte du changement climatique.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Représentation (6).** Inchangée : température uniforme $\Delta T_N$, gradients linéaires $\Delta T_{My}$ et $\Delta T_{Mz}$, part non linéaire $\Delta T_E$. Les actions thermiques sont variables et indirectes ; une période de retour autre que 50 ans se traite par l’annexe A.

**Bâtiments (7).**

- Un **tableau unique** (7.1) remplace les trois tableaux de 2003 pour les températures intérieures et extérieures : en été, la surface extérieure dépasse la température maximale de l’air de 0 à 4 °C au nord-est et de 18 à 42 °C au sud-ouest, selon la couleur.
- Pour un élément à une couche, $T_N = (T_{in} + T_{out})/2$ et $\Delta T_N = T_N - T_0$ (7.1), comme en 2003.
- **Refroidissement nocturne** : pour les éléments de faible inertie thermique, une température $T_{N,night}$ (8 °C par défaut) s’applique (7.3(6)).
- **Changement climatique** : il doit être pris en compte, par défaut avec le terme $\Delta T_{cc}$ des ponts (7.3(9)).
- Les parties enterrées ont leurs propres valeurs, définies par l’annexe nationale.

## Pourquoi

Le tableau unique simplifie la lecture. Le refroidissement nocturne vise les éléments légers (bardages, toitures métalliques) qui se refroidissent bien en dessous de la température de l’air par rayonnement vers le ciel.

## L’exemple type : poutre de rive en façade

Poutre en acier IPE 300 (5380 mm²) en façade sud-ouest sombre, bridée à ses extrémités. L’ingénieur lit dans le tableau 7.1 $T_{out} = T_{max} + 42$, soit 72 °C pour $T_{max}$ = 30 °C ; intérieur à 20 °C ; montage à 10 °C.

```exemple
{
  "nom": "poutre-facade",
  "mecanisme": "temperature-batiment",
  "entree": { "Tin": 20, "Tout": 72, "T0": 10, "E": 210000, "A": 5380, "alpha": 0.000012 },
  "attendus": {
    "en1991-1-5-2003/bridage.ΔT_N": "36",
    "en1991-1-5-2025/bridage.ΔT_N": "36",
    "en1991-1-5-2025/bridage.sollicitation": "488"
  }
}
```

La variation uniforme vaut {{poutre-facade:en1991-1-5-2025/bridage.ΔT_N}} °C : sous bridage total, l’effort atteindrait {{poutre-facade:en1991-1-5-2025/bridage.sollicitation}} kN. C’est la même valeur en 2003 ; les joints ou la souplesse des attaches réduisent cet effort en pratique.

{{calculateur:poutre-facade}}

## L’effet sur une note de calcul existante

- Valeurs inchangées à températures d’air égales ; vérifier les éléments légers sous refroidissement nocturne.
- Les cartes de températures et le terme climatique de l’annexe nationale peuvent changer $T_{max}$ et $T_{min}$.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Le tableau 7.1, $T_{N,night}$, les valeurs des parties enterrées et le traitement du changement climatique pour les bâtiments.
