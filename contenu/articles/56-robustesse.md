---
titre: Robustesse et tirants
ordre: 56
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), 4.4 et annexe E ; EN 1991-1-7:2025, 4.1, 4.2, tableau 4.1 et annexe A, formules (A.1) à (A.5) ; textes lus le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-7:2006 + A1:2014 (3, annexe A) citée de mémoire, le texte de première génération n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: La robustesse devient une exigence de l’EN 1990 et ses stratégies quittent l’EN 1991-1-7. Les efforts de calcul des tirants restent ceux de 2006 ; l’annexe A de l’EN 1991-1-7 se limite désormais aux tirants et aux éléments clés.
motscles: robustesse, actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Une exigence de l’EN 1990.** La robustesse est définie (3.1.2.33) comme l’aptitude d’une structure à résister à des événements imprévus sans dommages disproportionnés par rapport à la cause initiale. 4.4 en fait une exigence de base : pour la plupart des structures, l’application des Eurocodes suffit ; des mesures de renforcement s’appliquent quand l’autorité ou le projet les demandent.

**Les stratégies changent de norme.** En 2006, l’EN 1991-1-7 (chapitre 3 et annexe A) portait à la fois les actions accidentelles identifiées et les stratégies pour les actions non identifiées. En 2023, l’EN 1991-1-7 garde les actions (chocs, explosions, débris) et l’EN 1990 (annexe E) reçoit les stratégies :

- **chemins de charge alternatifs**, par ductilité, résistance et redondance, ou par des règles prescriptives (tirants) ;
- **éléments principaux** (« éléments clés »), calculés pour une action théorique, $A_d$ = 34 kN/m² pour les bâtiments ;
- **segmentation** de la structure en parties qui peuvent s’effondrer indépendamment.

Les stratégies peuvent se combiner. L’annexe E propose les méthodes selon la classe de conséquences (tableau E.2) et un exemple de dommage tolérable après la suppression d’un poteau : 15 % de la surface du plancher ou 100 m², dans chacun des deux niveaux adjacents.

**Les classes de l’EN 1991-1-7.** Pour les explosions intérieures et les tirants, les bâtiments restent classés CC1, CC2a, CC2b et CC3 avec des exemples par usage et nombre de niveaux (tableau 4.1), comme en 2006.

**Les tirants.** Les expressions de l’annexe A sont reprises :

$$
T_i = \max\left\{0.8\,(g_k + \psi\,q_k)\,s_t\,L_t \,;\, 75\ \text{kN}\right\} \qquad \text{(A.1)}
$$

$$
T_p = \max\left\{0.4\,(g_k + \psi\,q_k)\,s_t\,L_t \,;\, 75\ \text{kN}\right\} \qquad \text{(A.2)}
$$

pour les ossatures, et, pour les murs porteurs de classe 2b, $F_t = \min\{60 ; 20 + 4\,n_s\}$ kN/m, $T_i = \max\{F_t\,(g_k + \psi q_k)/7.5 \cdot z/5 \,;\, F_t\}$ et $T_p = F_t$. La deuxième génération ajoute des valeurs explicites pour les tirants de façade (20 kN/m) et de poteaux (150 kN).

## Pourquoi

Placer la robustesse dans l’EN 1990 la rend applicable à tous les ouvrages et à tous les matériaux, y compris les ponts, et la distingue nettement du calcul pour une action accidentelle connue. Le rapport du JRC sur la robustesse (2024) sert de document d’accompagnement.

## L’exemple type : immeuble de bureaux à ossature

Ossature en béton, trame 7,2 × 7,2 m, $g_k$ = 6,5 kN/m², $q_k$ = 3 kN/m², $\psi$ = 0,3 en situation accidentelle.

```exemple
{
  "nom": "tirants-bureaux",
  "mecanisme": "tirants-robustesse",
  "entree": { "type": "ossature", "gk": 6.5, "qk": 3, "psi": 0.3, "st": 7.2, "Lt": 7.2 },
  "attendus": {
    "en1991-1-7-2006/internes.sollicitation": "307",
    "en1991-1-7-2025/internes.sollicitation": "307",
    "en1991-1-7-2025/peripheriques.sollicitation": "153"
  }
}
```

Chaque tirant interne doit reprendre {{tirants-bureaux:en1991-1-7-2025/internes.sollicitation}} kN et chaque tirant périphérique {{tirants-bureaux:en1991-1-7-2025/peripheriques.sollicitation}} kN, dans les deux générations.

{{calculateur:tirants-bureaux}}

## L’effet sur une note de calcul existante

- Les efforts de tirants ne changent pas.
- La note doit justifier la stratégie de robustesse retenue en renvoyant à l’EN 1990, annexe E, et non plus à l’EN 1991-1-7.
- Pour un bâtiment CC3, l’annexe E demande d’étudier les défaillances initiales, leur propagation et les risques, si l’autorité ou le projet le prévoient.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application des annexes E de l’EN 1990 et A de l’EN 1991-1-7.
- Les valeurs de $A_d$, des tirants (A.1 à A.5) et la classification du tableau 4.1.
- Les limites de dommage tolérable.
