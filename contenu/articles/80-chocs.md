---
titre: Actions accidentelles dues aux chocs
ordre: 80
statut: publie
texte: EN 1991-1-7:2025 (NBN, version française), articles 4 et 5, tableaux 4.1, 4.2, 5.1 et 5.2, figure 5.2 et annexe C (formules (C.1) à (C.4)) lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-7:2006 + A1:2014 (3, 4, annexe C) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les forces de choc des véhicules ne changent pas. L’EN 1991-1-7 réorganise ses classes de conséquences, renvoie la robustesse à l’EN 1990, précise les chocs de bateaux et sort de son domaine l’accostage, l’amarrage et les détonations.
motscles: actions, robustesse
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Stratégies (4).** Les situations accidentelles se traitent selon la classe de conséquences (tableau 4.2) : CC1 sans considération particulière au-delà des règles de robustesse ; CC2 par forces statiques équivalentes ou règles prescriptives ; CC3 par une étude spécifique (analyse de risque, calcul dynamique, non linéaire). Les mesures de prévention ou de protection peuvent abaisser la classe ou les forces. Les stratégies pour les actions non identifiées sont passées dans l’EN 1990 (article 56).

**Chocs (5).** Domaine : véhicules routiers, chariots élévateurs, trains, bateaux, hélicoptères (atterrissage brutal). Les structures légères, l’accostage et l’amarrage des navires, et les détonations sont exclus.

- Véhicules contre éléments porteurs (tableau 5.1) et contre superstructures (tableau 5.2) : forces statiques équivalentes par catégorie de route, inchangées ; nouvelles lignes pour les parcs de stationnement distinguant voitures et camions.
- Barrières de parcs de stationnement : 40 kN à 0,5 m, ou une énergie de 5,5 kNm.
- Réduction pour une hauteur libre $h$ entre $h_0$ = 5 m et $h_1$ = 6 m :

$$
F = r_F\,F_{dx}, \qquad r_F = \frac{h_1 - h}{h_1 - h_0}
$$

- Chocs de bateaux : formules ajoutées pour les navires non renforcés pour les glaces.

**Annexe C (calcul dynamique).** Choc dur, $F = v_r\,\sqrt{k\,m}$ (C.1) ; choc mou, $\frac{1}{2}\,m\,v_r^2 \le F_0\,u_0$ (C.2) ; vitesse d’impact décroissant avec la distance parcourue hors voie (C.3). Annexe E nouvelle : actions dues aux débris.

## Pourquoi

Le transfert de la robustesse vers l’EN 1990 laisse à l’EN 1991-1-7 les seules actions accidentelles identifiées. Les exclusions (opérations portuaires, détonations) relèvent de normes ou d’études spécialisées.

## L’exemple type : choc sur un tablier de passage supérieur

Un camion heurte l’intrados d’un pont au-dessus d’une autoroute ; l’annexe nationale donne $F_{dx}$ = 500 kN pour cette catégorie (valeur du tableau 5.2 lue par l’ingénieur). Hauteur libre 5,4 m.

```exemple
{
  "nom": "intrados-5m4",
  "mecanisme": "choc-vehicule",
  "entree": { "Fdx": 500, "h": 5.4, "m": 1500, "v": 13.9, "k": 300 },
  "attendus": {
    "en1991-1-7-2006/superstructure.sollicitation": "300",
    "en1991-1-7-2025/superstructure.r_F": "0,60",
    "en1991-1-7-2025/superstructure.sollicitation": "300",
    "en1991-1-7-2025/dur.sollicitation": "295"
  }
}
```

Avec $r_F$ = {{intrados-5m4:en1991-1-7-2025/superstructure.r_F}}, la force à appliquer vaut {{intrados-5m4:en1991-1-7-2025/superstructure.sollicitation}} kN, comme en 2006. Pour un choc de voiture (1,5 t à 50 km/h, raideur 300 kN/m), le modèle de choc dur donne {{intrados-5m4:en1991-1-7-2025/dur.sollicitation}} kN.

{{calculateur:intrados-5m4}}

## L’effet sur une note de calcul existante

- Forces inchangées ; vérifier la nouvelle classification des stratégies (tableau 4.2) et les parcs de stationnement.
- Robustesse : renvoyer à l’EN 1990, annexe E.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les tableaux 4.1, 4.2, 5.1 et 5.2, $h_0$, $h_1$, les structures légères et les éléments dispensés.
