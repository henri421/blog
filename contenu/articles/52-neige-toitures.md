---
titre: Neige sur les toitures terrasses
ordre: 52
statut: publie
texte: EN 1991-1-3:2025 (NBN, version française), sans amendement ni corrigendum pris en compte ; 6.1, 6.2, 7.2 à 7.5.2.2 et 8.3, formules (7.1), (7.3), (7.4) et (8.3) lus sur le texte le 2026-10-18 ; EN 1991-1-3:2003 + A1:2015 citée selon ses formules usuelles (5.2, 5.3.2, 6.2), le texte complet de 2003 n’étant pas détenu ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: La charge de neige sur une toiture terrasse dépend désormais de la taille de la toiture, d’un facteur de changement climatique et, pour les sites peu enneigés, d’une surcharge de pluie sur la neige. Les congères le long des acrotères sont nettement relevées.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**La formule de base.** En 2003, $s = \mu_i\,C_e\,C_t\,s_k$. En 2025, le coefficient d’exposition passe dans le coefficient de forme :

$$
s = \mu_i\,C_t\,s_k \qquad \text{(7.1)}
$$

Pour une toiture terrasse, $\mu_1 = 0.8\,C_{e,F}$ (7.3), où $C_{e,F}$ croît avec la longueur effective de la toiture $L_c = 2\,W - W^2/L$ ($W$ petit côté, $L$ grand côté) :

$$
C_{e,F} = C_e + (1.25 - C_e)\,\frac{L_c - 50}{350} \quad \text{pour } 50 < L_c < 400\ \text{m} \qquad \text{(7.4)}
$$

avec $C_{e,F} = C_e$ pour $L_c$ ≤ 50 m et $C_{e,F}$ = 1,25 pour $L_c$ ≥ 400 m.

Le vent emporte moins de neige d’une grande toiture que d’une petite. Pour les toitures de moins de 50 m environ, rien ne change ; au-delà, une toiture balayée par le vent perd une partie de son abattement.

| | 2003 | 2025 |
|---|---|---|
| Toiture terrasse | $\mu_1$ = 0,8, $C_e$ séparé | $\mu_1 = 0.8\,C_{e,F}$, selon $L_c$ |
| Changement climatique | non | $s_k$ multiplié par $f_{s,cc} \ge 1$ (6.1(3)) |
| Pluie sur la neige | non | $s_R$ ajoutée si $s_k \le$ 1,0 kN/m² (7.2(4)) |
| Neige exceptionnelle sur le sol | 4.3, $C_{esl}$ = 2,0 | 6.2, $C_{esl}$ = 2,0, situation accidentelle |
| Termes | « sans accumulation », « avec accumulation » | « uniforme », « non uniforme » |
| Panneaux solaires | non traités | coefficient $\mu_P$ et congères entre rangées (7.5.2.2) |

**Pluie sur la neige.** Dans les régions peu enneigées, la pluie tombée sur la neige alourdit la couche. La surcharge vaut 0,25 kN/m² pour $s_k$ ≤ 0,75 kN/m², puis $1.0 - s_k$ jusqu’à 1,0 kN/m². Elle s’applique à la disposition uniforme sur les toitures terrasses. Elle peut être ignorée si les cartes de neige reposent sur l’équivalent en eau de la neige.

**Acrotères.** La congère le long d’un acrotère a désormais sa propre règle (8.3) :

$$
\mu_7 = \frac{0.8}{C_e}\,\frac{2\,b}{l_s} \quad \text{avec} \quad \mu_7 \le \min\left\{\frac{0.8\,\gamma\,h_p}{C_e\,s_k} \,;\, \mu_{7,max}\right\}, \qquad l_s = \frac{4\,h_p}{C_e}, \quad 5\ \text{m} \le l_s \le 15\ \text{m}
$$

avec $\gamma$ = 2 kN/m³ et $\mu_{7,max}$ = 4,0. En 2003, la congère le long d’un obstacle était plafonnée à $\mu_2$ = 2,0.

## Pourquoi

Les modèles de 2003 venaient de campagnes de mesures des années 1990. La deuxième génération s’appuie sur des données plus récentes et sur l’ISO 4355:2013 : l’effet du vent dépend de la taille de la toiture, et les congères derrière les obstacles sont plus lourdes que ne le prévoyait le plafond de 2,0. Le facteur $f_{s,cc}$ prépare l’évolution des cartes de neige avec le climat ; sa valeur relève de l’annexe nationale.

## L’exemple type : entrepôt logistique

Toiture terrasse de 100 × 200 m, site balayé par le vent ($C_e$ = 0,8), $s_k$ = 0,5 kN/m², $C_t$ = 1,0, sans facteur climatique.

```exemple
{
  "nom": "entrepot",
  "mecanisme": "neige-toiture",
  "entree": { "sk": 0.5, "exposition": "balaye", "Ct": 1, "W": 100, "L": 200 },
  "attendus": {
    "en1991-1-3-2003/uniforme.sollicitation": "0,320",
    "en1991-1-3-2025/uniforme.L_c": "150,0",
    "en1991-1-3-2025/uniforme.C_e,F": "0,929",
    "en1991-1-3-2025/uniforme.sollicitation": "0,371",
    "en1991-1-3-2025/pluie.sollicitation": "0,621"
  }
}
```

En 2003, $s$ = {{entrepot:en1991-1-3-2003/uniforme.sollicitation}} kN/m². En 2025, la longueur effective vaut {{entrepot:en1991-1-3-2025/uniforme.L_c}} m, d’où $C_{e,F}$ = {{entrepot:en1991-1-3-2025/uniforme.C_e,F}} et $s$ = {{entrepot:en1991-1-3-2025/uniforme.sollicitation}} kN/m² (+16 %). Avec la surcharge de pluie sur la neige, la charge uniforme atteint {{entrepot:en1991-1-3-2025/pluie.sollicitation}} kN/m², presque le double de 2003.

Pour le bâtiment de 21 × 45 m de l’atelier JRC de juin 2025 (exposition normale), $L_c$ = 32,2 m : $C_{e,F} = C_e$ et la charge uniforme ne change pas.

{{calculateur:entrepot}}

**Acrotère de 1,1 m sur ce même bâtiment de 45 m** ($C_e$ = 1,0, $s_k$ = 0,5 kN/m²), calculé à la main. En 2025, $l_s$ = 4,4 m, porté au minimum de 5 m ; $0.8 \times 2 \times 45 / 5 = 14.4$, plafonné à $0.8 \times 2 \times 1.1 / 0.5 = 3.52$ : la congère atteint $3.52 \times 0.5 = 1.76$ kN/m². En 2003, $\mu_2 = \gamma\,h/s_k = 4.4$ était plafonné à 2,0, soit 1,0 kN/m². La charge locale augmente de 76 %.

## L’effet sur une note de calcul existante

- Petites toitures (moins de 50 m de longueur effective) : charge uniforme inchangée, sauf facteur climatique et pluie sur la neige.
- **Grandes toitures** en site balayé : jusqu’à +56 % sur $\mu_1$ (de 0,64 à 1,0 au-delà de 400 m).
- **Pluie sur la neige** : +0,25 kN/m² dans les régions où $s_k$ ≤ 0,75 kN/m², ce qui concerne la plupart des sites de plaine.
- **Acrotères et obstacles** : les congères locales peuvent presque doubler ; à vérifier pour les bacs acier et les pannes de rive.
- Les panneaux solaires sur toiture terrasse ont désormais leur propre cas de charge.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La carte de $s_k$, le facteur $f_{s,cc}$ et sa valeur minimale.
- Les valeurs de $C_e$ (tableau 7.1), de $s_R$, de $\gamma$ et de $\mu_{7,max}$.
- Les régions où s’appliquent les conditions exceptionnelles.
