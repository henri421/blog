---
titre: Charge calorifique et feux naturels
ordre: 69
statut: publie
texte: EN 1991-1-2:2024 (NBN, version française), 5.3 et annexes A, C, D, E et F (formule (E.1), tableaux E.1 à E.3) lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-2:2002 (3.3, annexes A à F) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: La densité de charge calorifique de calcul reçoit un coefficient nouveau, δq3, qui la module selon la classe de conséquences du bâtiment, et le tableau des mesures actives de lutte contre le feu est revu.
motscles: actions, fiabilite
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Feux naturels (5.3).** Les modèles d’incendie fondés sur la physique (feux de compartiment simplifiés ou avancés, feux localisés) restent permis ; ils s’appuient sur les annexes informatives : courbes paramétrées (A), feux localisés (C, étendue), modèles avancés (D), charges calorifiques (E), durée équivalente (F).

**Charge calorifique de calcul (annexe E).**

$$
q_{d,fi} = q_{k,fi}\,m\,\delta_{q1}\,\delta_{q2}\,\delta_n\,\delta_{q3} \qquad \text{(E.1)}
$$

| Facteur | Rôle | 2002 | 2024 |
|---|---|---|---|
| $m$ | combustion | oui | oui |
| $\delta_{q1}$, $\delta_{q2}$ | risque d’activation selon la surface et l’occupation | tableau E.1 | tableau E.1 |
| $\delta_n$, produit des $\delta_{ni}$ | mesures actives (sprinkleurs, détection, transmission, pompiers, accès, désenfumage) | tableau E.2 | tableau E.2 revu |
| $\delta_{q3}$ | classe de conséquences | absent | 0,83 (CC1), 1,0 (CC2), 1,19 (CC3), tableau E.3 |

Les mesures normales exigées par la réglementation comptent pour 1,0 ; si elles manquent alors qu’elles sont exigées, 1,5. Une brigade de pompiers hors site compte 0,78 ou 0,84 selon qu’elle intervient en 20 ou 30 minutes.

## Pourquoi

La fiabilité visée par l’EN 1990 dépend de la classe de conséquences (article 49). À froid, $k_F$ module les actions ; au feu, c’est $\delta_{q3}$ qui joue ce rôle sur la charge calorifique, l’un des principaux paramètres de la sévérité d’un feu naturel.

## L’exemple type : plateau de bureaux sprinklé

Compartiment de bureaux ; densité caractéristique de projet 500 MJ/m², $m$ = 0,8 ; l’ingénieur lit $\delta_{q1}$ = 1,5 et $\delta_{q2}$ = 1,0 dans le tableau E.1, et retient sprinkleurs (0,61), détection de fumée (0,73) et transmission automatique de l’alarme (0,87) dans le tableau E.2.

```exemple
{
  "nom": "plateau-bureaux",
  "mecanisme": "charge-calorifique",
  "entree": { "qk": 500, "m": 0.8, "dq1": 1.5, "dq2": 1.0, "dn": 0.387411, "cc": "CC2" },
  "attendus": {
    "en1991-1-2-2002/qd.sollicitation": "232",
    "en1991-1-2-2024/qd.sollicitation": "232"
  }
}
```

En classe CC2, la charge de calcul reste {{plateau-bureaux:en1991-1-2-2024/qd.sollicitation}} MJ/m², comme en 2002 à coefficients égaux. Le même plateau dans un bâtiment de classe CC3 (immeuble de grande hauteur) passe à 277 MJ/m² ; dans un bâtiment CC1, à 193 MJ/m².

{{calculateur:plateau-bureaux}}

## L’effet sur une note de calcul existante

- Un calcul en feu naturel d’un bâtiment CC3 doit être repris : la charge calorifique augmente de 19 %.
- Les coefficients $\delta_{ni}$ sont à relire dans le tableau E.2 de 2024.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application de l’annexe E et les valeurs des tableaux E.1 à E.3 ; le classement national des charges calorifiques selon l’occupation.
