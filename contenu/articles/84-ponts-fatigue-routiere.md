---
titre: Ponts routiers, modèles de charge de fatigue
ordre: 84
statut: publie
texte: EN 1991-2:2023 (NBN, version française), 6.6, formule (6.7), tableaux 6.7 à 6.10 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-2:2003 (4.6) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les cinq modèles de charge de fatigue routiers et les catégories de trafic sont repris de 2003 ; la majoration dynamique près des joints est réécrite sous une forme équivalente.
motscles: fatigue, actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Les modèles (6.6.1).** Cinq modèles, inchangés : FLM1 (LM1 avec 0,7 $Q_{ik}$ et 0,3 $q_{ik}$) et FLM2 (camions « fréquents ») pour vérifier une durée de vie illimitée, surtout pour l’acier ; FLM3 (véhicule unique), FLM4 (camions « équivalents ») et FLM5 (enregistrements de trafic) pour estimer la durée de vie avec les courbes de résistance des EN 1992 à EN 1999.

**Trafic (6.6.4).** La catégorie de trafic se définit par le nombre de voies lentes et le nombre $N_{obs}$ de poids lourds (plus de 100 kN) par an et par voie lente ; valeurs indicatives de 2 millions (catégorie 1, autoroutes à fort trafic de camions) à 50 000 (catégorie 4, routes locales). Chaque voie rapide ajoute 10 % de $N_{obs}$.

**Joints de dilatation (6.6.2).** La majoration dynamique supplémentaire s’écrit

$$
\Delta\varphi_{fat} = 1.0 + 0.3\left(1 - \frac{D}{6}\right) \ge 1 \qquad \text{(6.7)}
$$

au lieu de $1.30\,(1 - D/26) \ge 1$ en 2003. Les deux valent $1.30 - 0.05\,D$ : c’est la même droite, écrite pour faire apparaître la distance de 6 m au-delà de laquelle la majoration disparaît.

**Position transversale (6.6.3).** Pour les effets locaux (dalles orthotropes), une distribution statistique de la position des véhicules est donnée (figure 6.7).

## Pourquoi

Les modèles de fatigue routiers ont été calibrés lors de la première génération sur des enregistrements de trafic européens ; la deuxième génération n’en modifie pas les valeurs.

## L’exemple type : autoroute à deux voies lentes

Autoroute de catégorie 1, deux voies lentes et une voie rapide ; section située à 2 m d’un joint de dilatation.

```exemple
{
  "nom": "autoroute-fatigue",
  "mecanisme": "fatigue-routiere",
  "entree": { "D": 2, "categorie": "1", "ns": 2, "nf": 1 },
  "attendus": {
    "en1991-2-2003/majoration.sollicitation": "1,20",
    "en1991-2-2023/majoration.sollicitation": "1,20",
    "en1991-2-2023/trafic.N total": "4200000"
  }
}
```

À 2 m du joint, la majoration vaut {{autoroute-fatigue:en1991-2-2023/majoration.sollicitation}} dans les deux générations. Le pont voit {{autoroute-fatigue:en1991-2-2023/trafic.N total}} poids lourds par an.

{{calculateur:autoroute-fatigue}}

## L’effet sur une note de calcul existante

- Aucun sur les valeurs.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les catégories de trafic et $N_{obs}$, les conditions d’emploi de FLM1 et FLM2, $\Delta\varphi_{fat}$.
