---
titre: Ponts routiers, voies conventionnelles et modèle de charge 1
ordre: 82
statut: publie
texte: EN 1991-2:2023 (NBN, version française), articles 4 et 5, 6.1 à 6.3, tableaux 6.1 et 6.2, formules (6.1) à (6.4) lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-2:2003 (2 à 4.3) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les modèles de trafic routier ne changent pas : mêmes voies conventionnelles, même modèle LM1. L’EN 1991-2 étend son domaine aux ouvrages géotechniques sous trafic et s’aligne sur l’annexe A.2 de l’EN 1990.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Domaine et titre.** L’EN 1991-2 couvre désormais le trafic sur les ponts **et sur les autres ouvrages de génie civil**, notamment les ouvrages géotechniques (remblais, culées, murs) avec des modèles statiques propres (6.9 pour la route, 8.10 pour le rail). Les anciennes annexes F et G sont supprimées, l’annexe E (validité du modèle HSLM) est mise à jour, les passerelles ont un article 7 et une annexe G refondus (article 62).

**Classification et situations (4, 5).** Inchangées sur le fond ; le vocabulaire et les renvois sont alignés sur l’EN 1990, annexe A.2 (article 61).

**Voies conventionnelles (6.2.3).** Mêmes règles qu’en 2003 : une voie de 3 m si la chaussée fait moins de 5,4 m, deux voies de $w/2$ entre 5,4 et 6 m, sinon Int($w$/3) voies de 3 m et une aire résiduelle. La voie numéro 1 est celle qui donne l’effet le plus défavorable.

**Modèle de charge 1 (6.3.2).** Tandem TS de $\alpha_Q\,Q_k$ par essieu et charge répartie UDL $\alpha_q\,q_k$ par voie, avec les mêmes valeurs caractéristiques qu’en 2003 et les mêmes minima d’ajustement ($\alpha_{Q1} \ge 0.8$ ; $\alpha_{qi} \ge 1$ pour $i \ge 2$). Roues de 0,40 × 0,40 m, essieux à 1,2 m. LM2 (essieu unique de 400 $\beta_Q$ kN), LM3 (véhicules spéciaux, annexe A) et LM4 (foule, 5 kN/m²) restent disponibles.

## Pourquoi

Les modèles routiers avaient été calibrés sur des mesures de trafic européennes ; la révision s’est concentrée sur la cohérence avec l’EN 1990, sur le rail (interopérabilité) et sur les passerelles.

## L’exemple type : tablier isostatique de 20 m

Chaussée de 11 m, coefficients d’ajustement égaux à 1, toutes voies chargées, moment global à mi-portée.

```exemple
{
  "nom": "tablier-20m",
  "mecanisme": "lm1",
  "entree": { "w": 11, "L": 20 },
  "attendus": {
    "en1991-2-2003/moment.n_l": "3",
    "en1991-2-2003/moment.sollicitation": "7990",
    "en1991-2-2023/moment.sollicitation": "7990"
  }
}
```

La chaussée compte {{tablier-20m:en1991-2-2003/moment.n_l}} voies et 2 m d’aire résiduelle ; le moment caractéristique global vaut {{tablier-20m:en1991-2-2023/moment.sollicitation}} kN·m, identique en 2003.

{{calculateur:tablier-20m}}

## L’effet sur une note de calcul existante

- Aucun pour les charges routières verticales.
- Ouvrages géotechniques sous trafic : appliquer les modèles nouveaux de 6.9.
- Combinaisons : reprendre les coefficients de l’EN 1990, annexe A.2.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les coefficients $\alpha_Q$, $\alpha_q$, $\beta_Q$, les véhicules spéciaux (LM3), la hauteur de bordure prise en compte.
