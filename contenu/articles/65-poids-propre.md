---
titre: Poids volumiques et poids propre
ordre: 65
statut: publie
texte: EN 1991-1-1:2025 (NBN, version française), articles 4 et 5 et annexe A lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-1:2002 (4, 5) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Le poids propre se calcule comme avant, mais la deuxième génération renvoie à l’EN 1990 pour décider entre valeur unique et valeurs haute et basse, traite le poids propre total comme une action de source unique et parle d’éléments non structuraux plutôt que d’éléments non porteurs.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Poids volumiques (4, annexe A).** Les valeurs moyennes de l’annexe A servent de valeurs caractéristiques. Pour un matériau nouveau ou très dispersé (provenance, teneur en eau), la valeur caractéristique se détermine selon l’EN 1990, 6.1.2.2 ; des mesures et essais sont admis. L’annexe A reste informative et ses valeurs ne sont pas reproduites ici.

**Poids propre (5).**

- Le poids propre total, éléments structuraux et non structuraux, est traité comme **une seule action** dans les combinaisons, selon le principe de la source unique (5.1(2)).
- Les éléments non structuraux sont des actions permanentes, fixes ou libres ; les cloisons peuvent rester traitées comme des charges d’exploitation (article 48).
- Le poids propre se représente par une valeur unique, sauf si sa variabilité dépasse les seuils de l’EN 1990 (5 % pour l’équilibre, 10 % sinon ; article 58).
- La teneur en eau des matériaux en vrac et l’évolution de l’humidité et de l’épaisseur du ballast et des terres sont à considérer.
- Pour les éléments manufacturés (planchers, façades, ascenseurs), on utilise les données du fabricant.

**Ponts (5.4.3).** Les écarts recommandés sur les éléments non structuraux sont ceux de 2002 :

| Élément | Écart sur la valeur nominale |
|---|---|
| Ballast | ± 30 % |
| Étanchéité et revêtements, rechargement ultérieur inclus | ± 20 % |
| Étanchéité et revêtements, rechargement non inclus | + 40 % / − 20 % |
| Câbles, tuyaux, gaines | ± 20 % |
| Garde-corps, barrières, bordures, joints | valeur nominale |

## Pourquoi

Traiter tout le poids propre comme une seule action évite de combiner séparément ossature et finitions avec des coefficients différents, ce qui n’a pas de sens physique. Le renvoi à l’EN 1990 aligne la décision « valeur unique ou valeurs haute et basse » sur un critère chiffré.

## L’exemple type : chaussée d’un tablier de pont

Enrobé de 8 cm à 24 kN/m³, soit 1,92 kN/m² nominal ; aucun rechargement ultérieur n’est pris en compte dans la valeur nominale.

```exemple
{
  "nom": "chaussee",
  "mecanisme": "poids-propre-pont",
  "entree": { "gnom": 1.92, "element": "revetement-sans" },
  "attendus": {
    "en1991-1-1-2002/superieure.sollicitation": "2,69",
    "en1991-1-1-2025/superieure.sollicitation": "2,69",
    "en1991-1-1-2025/inferieure.sollicitation": "1,54"
  }
}
```

La valeur haute, {{chaussee:en1991-1-1-2025/superieure.sollicitation}} kN/m², sert quand la chaussée est défavorable ; la valeur basse, {{chaussee:en1991-1-1-2025/inferieure.sollicitation}} kN/m², quand elle est favorable (soulèvement d’appui, par exemple). Rien ne change par rapport à 2002.

{{calculateur:chaussee}}

## L’effet sur une note de calcul existante

- Aucun sur les valeurs.
- Vocabulaire : « éléments non structuraux » remplace « éléments non porteurs ».

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les écarts sur le ballast et les revêtements, l’épaisseur de ballast, les poids volumiques haut et bas des éléments propres aux ponts.
