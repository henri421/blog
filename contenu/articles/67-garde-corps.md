---
titre: Charges sur les garde-corps et barrières
ordre: 67
statut: publie
texte: EN 1991-1-1:2025 (NBN, version française), 6.6 et tableau 6.5 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-1:2002 (6.4, tableau 6.12) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: La charge horizontale des garde-corps reste appliquée à leur hauteur, au plus 1,2 m. La deuxième génération ajoute une charge verticale sur la main courante et une charge locale pour les garde-corps d’entretien.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Charge horizontale (6.6.2).** Une charge linéique $q_k$, fonction de la catégorie d’usage (tableau 6.5), s’applique à la hauteur de la barrière, sans dépasser 1,2 m. Le tableau couvre maintenant toutes les catégories du tableau 6.1, y compris les toitures K et les escaliers S ; les garages renvoient à l’EN 1991-1-7 (chocs de véhicules).

**Nouveau :**

- une **charge verticale** sur la main courante, $Q_k$ = 1 kN ou $q_k$ = 0,6 kN/m, la plus défavorable, combinée avec la charge horizontale (6.6.3) ;
- une charge locale $Q_k$ = 0,3 kN pour les **garde-corps d’entretien** (6.6.2(2)) ;
- pour les tribunes, stades et salles de spectacle, des zones particulières à considérer (première rangée, arrière de tribune, zone debout).

## Pourquoi

Le texte ne justifie pas la charge verticale. Elle correspond à une personne qui s’assoit ou s’appuie sur la main courante, situation que la seule charge horizontale ne couvrait pas.

## L’exemple type : garde-corps de balcon

Balcon d’habitation, garde-corps de 1,1 m, poteaux tous les 1,5 m. L’ingénieur lit $q_k$ dans le tableau 6.5 pour sa catégorie (ici 1,0 kN/m, par exemple).

```exemple
{
  "nom": "balcon",
  "mecanisme": "garde-corps",
  "entree": { "qk": 1.0, "h": 1.1, "s": 1.5 },
  "attendus": {
    "en1991-1-1-2002/horizontal.sollicitation": "1,65",
    "en1991-1-1-2025/horizontal.sollicitation": "1,65",
    "en1991-1-1-2025/vertical.sollicitation": "1,00"
  }
}
```

Chaque poteau reprend à sa base un moment de {{balcon:en1991-1-1-2025/horizontal.sollicitation}} kN·m, comme en 2002. La main courante doit en plus porter une charge verticale de {{balcon:en1991-1-1-2025/vertical.sollicitation}} kN entre deux poteaux.

{{calculateur:balcon}}

## L’effet sur une note de calcul existante

- La vérification horizontale ne change pas, à valeur de $q_k$ égale.
- Il faut ajouter la vérification de la main courante et des fixations sous la charge verticale.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Le tableau 6.5, les charges verticales et la charge des garde-corps d’entretien ; les éventuelles charges concentrées et chocs de corps durs ou mous.
