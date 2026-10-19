---
titre: Ponts ferroviaires, forces horizontales et autres actions
ordre: 87
statut: publie
texte: EN 1991-2:2023 (NBN, version française), 8.5 à 8.10 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-2:2003 (6.5 à 6.9 et 6.3.6.4) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Force centrifuge, lacet, accélération et freinage gardent leurs formules. Le déraillement, les groupes de charges et la fatigue sont reconduits sous une numérotation nouvelle. Les ouvrages géotechniques reçoivent un modèle simplifié de 100 kN/m pour LM71.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Force centrifuge (8.5.1).** Formule et coefficient de réduction inchangés :

$$Q_{tk} = \frac{V^2}{127\,r}\,f\,Q_{vk} \qquad \text{(8.14)}$$

$$f = 1 - \frac{V - 120}{1000}\left(\frac{814}{V} + 1{,}75\right)\left(1 - \sqrt{\frac{2{,}88}{L_f}}\right) \ge 0{,}35 \qquad \text{(8.16)}$$

Au-delà de 120 km/h, deux cas restent à envisager : $V$ = 120 km/h avec $f$ = 1, et la vitesse maximale avec $f$. La hauteur d’application de 1,80 m peut être majorée, par exemple pour les conteneurs sur deux niveaux. L’effet vertical de la force centrifuge est désormais explicitement à prendre en compte. Le trafic marchandises lourd au-delà de 120 km/h est renvoyé à des exigences particulières.

**Lacet (8.5.2).** $Q_{sk}$ = 100 kN, multiplié par $\alpha$ seulement si $\alpha \ge 1$.

**Accélération et freinage (8.5.3).** $Q_{lak}$ = 33 kN/m × $L_{a,b}$ ≤ 1 000 kN. $Q_{lbk}$ = 20 kN/m × $L_{a,b}$ ≤ 6 000 kN, ou 35 kN/m pour SW/2. L’annexe nationale peut relever ces valeurs pour suivre l’évolution des systèmes de freinage. Avec deux voies dans le même sens, la seconde est prise avec $\psi_0$ = 0,5.

**Interaction voie-ouvrage (8.5.4).** Ses exigences s’étendent explicitement aux voies sans ballast. Le CEN/TR 17231 complète le texte.

**Autres actions (8.6 à 8.9).** Les effets aérodynamiques du passage des trains (8.6) couvrent aussi les surfaces enveloppant la voie sur une longueur limitée, comme les échafaudages. Le déraillement (8.7) garde deux situations de projet : véhicules restant sur le tablier ($\alpha$ × 1,4 × LM71 sans coefficient dynamique) et véhicules en équilibre sur le bord. Les groupes de charges (8.8) et les charges de fatigue (8.9, annexe D) sont reconduits.

**Ouvrages géotechniques (8.10).** Le modèle de 2003 (6.3.6.4) est remplacé par un dispositif complet :

- LM71 appliqué à 0,70 m sous le plan de roulement. Charge concentrée de 1 000 kN sur 6,4 m × 3 m (52 kN/m²) et charge répartie de 80 kN/m sur 3 m.
- Une charge linéaire simplifiée $q_{ek,l}$ de 100 kN/m (LM71) ou 150 kN/m (SW/2) au centre de la voie, quand le sol redistribue les charges. Elle ne s’applique pas à moins de 1,0 m de la traverse.

## Pourquoi

Comme pour les ponts routiers (article 85), les modèles conçus pour les tabliers s’appliquaient mal aux remblais et aux murs ; le texte précise que la charge linéaire simplifiée est voulue plus prudente que l’application de 8.3. Pour les forces horizontales, la révision ne change pas les valeurs.

## L’exemple type : pont en courbe sur ligne à 200 km/h

Rayon de 1 500 m, longueur d’influence de 20 m, essieu de LM71 de 250 kN ($\alpha$ = 1).

```exemple
{
  "nom": "courbe-200",
  "mecanisme": "centrifuge-rail",
  "entree": { "V": 200, "r": 1500, "Lf": 20, "Qvk": 250 },
  "attendus": {
    "en1991-2-2003/centrifuge.sollicitation": "37,3",
    "en1991-2-2023/centrifuge.f": "0,711",
    "en1991-2-2023/centrifuge.sollicitation": "37,3"
  }
}
```

Avec $f$ = {{courbe-200:en1991-2-2023/centrifuge.f}}, chaque essieu produit une force centrifuge de {{courbe-200:en1991-2-2023/centrifuge.sollicitation}} kN, comme en 2003 (formule citée de mémoire, à relire). Le cas à 120 km/h donne 18,9 kN par essieu avec la charge pleine.

{{calculateur:courbe-200}}

## L’effet sur une note de calcul existante

- Forces horizontales : pas de changement numérique attendu, seulement des références de clauses (6.5 devient 8.5).
- Murs et remblais sous voie ferrée : le modèle de 8.10 peut changer les poussées par rapport à la pratique de 6.3.6.4 ; à recalculer.
- Effet vertical de la force centrifuge : à vérifier s’il était omis.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La hauteur $h_t$, les valeurs de freinage, les lignes à trafic spécialisé et les règles pour plus de 300 m de longueur chargée.
- Les situations de déraillement et les valeurs du modèle géotechnique (largeur, charges, distance minimale).
