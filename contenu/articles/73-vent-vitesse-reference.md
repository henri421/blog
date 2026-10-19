---
titre: Vent, vitesse de référence et organisation de la norme
ordre: 73
statut: publie
texte: EN 1991-1-4:2026 (NBN, version française), articles 4 et 5, 6.2 à 6.4, formules (6.1) à (6.10), figure 5.1, annexes A, J, K et L lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-4:2005 + A1:2010 (3, 4.1 à 4.4) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: L’EN 1991-1-4 est réorganisée autour d’un logigramme, ses coefficients aérodynamiques passent dans des annexes normatives, et la vitesse de référence reçoit un coefficient d’altitude et un facteur de changement climatique.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Organisation.** La norme suit un logigramme (figure 5.1) : vitesse et pression de pointe (article 6), coefficients aérodynamiques (annexes **B** pour les pressions, **C** pour les pressions nettes et les auvents, **D** pour les forces et le frottement, toutes **normatives**), pressions et forces (article 7), coefficient structural (article 8), aéroélasticité (article 9). En 2005, ces coefficients se trouvaient dans les sections 7 et 8.

| Sujet | 2005 | 2026 |
|---|---|---|
| Vitesse et pression | section 4 | article 6 |
| Coefficients aérodynamiques | sections 7 et 8 | annexes B, C, D |
| Coefficient structural | section 6, annexes B et C | article 8, annexe E |
| Caractéristiques dynamiques | annexe F | annexe H |

**Domaine étendu** aux structures élancées jusqu’à 300 m, aux mâts haubanés et pylônes en treillis (annexe I, reprise de l’EN 1993-3-1), aux silos et réservoirs, aux structures givrées. Trois annexes informatives nouvelles : essais en soufflerie et mécanique des fluides numérique (J), vitesses tirées de mesures (K), modèles probabilistes (L).

**Ponts.** Une catégorisation nouvelle (5.4) classe les ponts selon leur susceptibilité à l’excitation aérodynamique : négligeable, vulnérable, très susceptible (essais en soufflerie).

**Vitesse de référence (6.2).**

$$
v_b = c_{dir}\,c_{season}\,c_{prob}\,c_{alt}\,v_{b0} \qquad \text{(6.1)}
$$

Le coefficient de probabilité entre dans la formule de base (il était en note en 2005), un coefficient d’altitude $c_{alt}$ (1,0 par défaut) apparaît, et **les effets du changement climatique doivent être pris en compte**, par défaut en multipliant $v_{b0}$ par $f_{w,cc} \ge 1$. Le coefficient de probabilité garde sa forme :

$$
c_{prob} = \left(\frac{1 - K\,\ln(-\ln(1 - p))}{1 - K\,\ln(-\ln 0.98)}\right)^n \qquad \text{(6.2)}
$$

avec $K$ = 0,2 et $n$ = 0,5.

**Rugosité et turbulence (6.3, 6.4).** Inchangées sur le fond ; les catégories de terrain s’évaluent dans un secteur de 30° autour de la direction du vent, sur une distance au vent qui dépend de la hauteur de l’ouvrage (6.8). Voir l’article sur la pression de pointe pour l’effet de la nouvelle formule de $q_p$.

## Pourquoi

Le logigramme et le report des coefficients en annexes rendent la partie principale plus courte et plus facile à suivre ; la plupart des projets courants ne consultent que l’article 6, l’annexe B et l’article 8.

## L’exemple type : ouvrage provisoire de chantier

Un échafaudage reste en place un an ; l’EN 1991-1-6 permet alors une période de retour réduite, par exemple 5 ans. Site à $v_{b0}$ = 26 m/s.

```exemple
{
  "nom": "provisoire-5ans",
  "mecanisme": "vitesse-reference",
  "entree": { "vb0": 26, "cdir": 1, "cseason": 1, "T": 5 },
  "attendus": {
    "en1991-1-4-2005/qb.c_prob": "0,855",
    "en1991-1-4-2026/qb.c_prob": "0,855",
    "en1991-1-4-2026/qb.sollicitation": "308"
  }
}
```

$c_{prob}$ = {{provisoire-5ans:en1991-1-4-2026/qb.c_prob}} ramène la pression de référence de 422 à {{provisoire-5ans:en1991-1-4-2026/qb.sollicitation}} Pa, dans les deux générations. Avec un facteur climatique de 1,05, elle remonterait à 340 Pa.

{{calculateur:provisoire-5ans}}

## L’effet sur une note de calcul existante

- Renvois à mettre à jour : les numéros de sections et d’annexes changent presque tous.
- Le facteur climatique et le coefficient d’altitude, fixés par l’annexe nationale, peuvent modifier $v_b$.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La carte de $v_{b0}$, $c_{dir}$, $c_{season}$, $c_{alt}$, $f_{w,cc}$, $K$ et $n$.
