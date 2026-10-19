---
titre: Ponts routiers, collisions, garde-corps et ouvrages géotechniques
ordre: 85
statut: publie
texte: EN 1991-2:2023 (NBN, version française), 6.7 à 6.9 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-2:2003 (4.7 à 4.9) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Pour les culées, murs et remblais sous trafic routier, l’EN 1991-2 propose désormais des modèles de charge propres, dont une charge uniforme simplifiée de 20 kN/m² sur une voie. Les garde-corps renvoient à des classes de chargement.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Collisions (6.7).** Chocs de véhicules sur les piles et le tablier, sur les bordures et les dispositifs de retenue : renvoi à l’EN 1991-1-7 (article 80) et règles propres au tablier ; des forces plus faibles peuvent être convenues pour des éléments dont la perte ne provoque pas l’effondrement (suspentes, haubans).

**Garde-corps (6.8).** Les forces transmises au tablier dépendent de la **classe de chargement** du garde-corps (CEN/TR 16949), au moins la classe C pour les ponts ; minimum 1,0 kN/m horizontal ou vertical sur les trottoirs et passerelles, 0,8 kN/m sur les passages de service. Si le garde-corps n’est pas protégé des chocs de véhicules, son support doit résister à 1,25 fois sa résistance caractéristique en situation accidentelle.

**Ouvrages géotechniques (6.9, nouveau).** Pour les culées, murs en aile et remblais, sous réserve d’un modèle géotechnique validé (EN 1997-1) :

- charges réparties non superposées : $Q_{ek}$ = 600 kN sur 3 × 5 m (40 kN/m²) et $q_{ek}$ = 9 kN/m² sur le reste (6.9.2) ;
- charge uniforme simplifiée si le sol redistribue les charges : $q_{ek,l}$ = 20 kN/m² sur une voie de 3 m, 9 kN/m² sur les autres, 5 kN/m² pour les zones d’entretien (6.9.3), sauf à moins de 1,0 m de la structure ;
- murs garde-grève : freinage d’un essieu (6.6), simultanément avec l’essieu de LM1 et la poussée du remblai non chargé (6.9.4).

## Pourquoi

Les modèles LM1, conçus pour les tabliers, s’appliquaient mal aux ouvrages en terre. Le texte indique que la charge simplifiée de 6.9.3 provient d’une répartition uniforme du poids d’un véhicule type sur 14 m, et qu’elle est plus prudente que l’application directe de LM1.

## L’exemple type : mur de soutènement le long d’une route

Mur de 4 m, coefficient de poussée 0,33 ; la voie la plus chargée est à 2 m du mur.

```exemple
{
  "nom": "mur-route",
  "mecanisme": "remblai-trafic",
  "entree": { "zone": "voie1", "K": 0.33, "H": 4, "d": 2 },
  "attendus": {
    "en1991-2-2023/poussee.sollicitation": "26,4"
  }
}
```

La surcharge de trafic ajoute une poussée de {{mur-route:en1991-2-2023/poussee.sollicitation}} kN par mètre de mur. La première génération traitait les charges sur remblais en 4.9 ; ce texte reste à relire.

{{calculateur:mur-route}}

## L’effet sur une note de calcul existante

- Culées et murs : les modèles de 6.9 remplacent les pratiques nationales ou de projet, sous réserve de l’annexe nationale.
- Garde-corps : vérifier la classe de chargement et la résistance du support.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs de $Q_{ek}$, $q_{ek}$, $q_{ek,l}$, la distance minimale, la classe minimale de garde-corps et le facteur 1,25.
