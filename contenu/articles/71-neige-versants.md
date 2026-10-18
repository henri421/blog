---
titre: Neige sur les toitures à versants, cylindriques et attenantes
ordre: 71
statut: publie
texte: EN 1991-1-3:2025 (NBN, version française), 7.1, 7.3 à 7.5.7, formules (7.7) à (7.16), tableaux 7.2 et 7.3, figure 7.3 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-3:2003 + A1:2015 (5.2, 5.3) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: La charge non uniforme d’une toiture à deux versants n’est plus la moitié de la charge uniforme sur un versant : un versant est déchargé, l’autre reçoit en plus la neige apportée par le vent, d’autant plus que le site est exposé.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Toitures à deux versants (7.5.3).** Le coefficient de base dépend désormais de l’exposition et va jusqu’à 70° (60° en 2003) :

| Pente | 2003, $\mu_1$ | 2025, $\mu_{2,b}$ |
|---|---|---|
| 5° à 30° | 0,8 | $0.8\,C_e$ |
| 30° à 60° (2003) ou 70° (2025) | $0.8\,(60 - \alpha)/30$ | $0.8\,C_e\,(70 - \alpha)/40$ |
| au-delà | 0 | 0 |

La disposition non uniforme change de forme. En 2003, un versant portait $\mu_1$ et l’autre $0.5\,\mu_1$. En 2025, un versant ne porte rien ; l’autre porte

$$
\mu_2 = \mu_{2,b} + \mu_{2,w} \qquad \text{(7.7)}
$$

où $\mu_{2,w} = \delta_w\,(6 - 5\,C_e)\,(\alpha - 5)/25$ entre 5° et 30° (et $\delta_w\,(6 - 5\,C_e)\,(70 - \alpha)/40$ au-delà), avec $\delta_w$ = 0,16 : c’est la neige transportée par le vent d’un versant à l’autre, plus importante en site balayé. Un dispositif de retenue limite le coefficient à $\mu_{2,p} = \gamma\,h_p/(C_t\,s_k)$.

**Toitures à versants multiples (7.5.4).** Dans les noues, $\mu_3 = 0.9 + 0.7\,\alpha/30$, ($\alpha$ étant la pente moyenne des deux versants), plafonné par $\gamma\,h/(C_t\,s_k)$ (la noue ne se remplit pas au-dessus du faîtage) et par $\mu_{3,max}$ = 1,6.

**Toitures cylindriques et dômes (7.5.5, 7.5.6).** $\mu_4 = (0.2 + 10\,h/b)\,C_e$, plafonné ; un modèle nouveau pour les dômes sphériques.

**Toitures attenantes à une construction plus haute (7.5.7).** Le modèle est refait : $\mu_5 = 0.8\,C_e\,\mu_L + \mu_s + \mu_w$, somme de la charge propre de la toiture basse, de la neige glissant de la toiture haute et de la congère due au vent, avec une longueur de congère $l_s = 4\,h/C_e$ entre 5 et 15 m. Des règles d’interpolation traitent les bâtiments voisins séparés d’un vide.

## Pourquoi

Les mesures récentes montrent que le vent vide un versant et charge l’autre ; la répartition de 2003 (100 % et 50 %) ne représentait pas ce transport. Le coefficient $\mu_{2,w}$ croît quand $C_e$ diminue : plus le site est balayé, plus le vent déplace de neige. Le modèle des toitures attenantes corrige des incohérences relevées dans la version de 2003.

## L’exemple type : maison à toiture à deux versants

Pente de 20°, $s_k$ = 0,5 kN/m², $C_t$ = 1, site normal.

```exemple
{
  "nom": "toiture-20deg",
  "mecanisme": "neige-versants",
  "entree": { "sk": 0.5, "alpha": 20, "exposition": "normal", "Ct": 1 },
  "attendus": {
    "en1991-1-3-2003/non-uniforme.sollicitation": "0,400",
    "en1991-1-3-2025/non-uniforme.sollicitation": "0,448",
    "en1991-1-3-2025/non-uniforme.μ_2,w": "0,096"
  }
}
```

La charge uniforme reste 0,40 kN/m². Pour la charge non uniforme, le versant chargé passe de {{toiture-20deg:en1991-1-3-2003/non-uniforme.sollicitation}} à {{toiture-20deg:en1991-1-3-2025/non-uniforme.sollicitation}} kN/m² ($\mu_{2,w}$ = {{toiture-20deg:en1991-1-3-2025/non-uniforme.μ_2,w}}) et l’autre versant n’est plus chargé du tout. En site balayé, l’écart grandit : 0,32 en 2003, 0,42 en 2025.

{{calculateur:toiture-20deg}}

## L’effet sur une note de calcul existante

- Charpentes et pannes sous charge non uniforme : + 12 % (site normal) à + 30 % (site balayé) sur le versant chargé, et un cas dissymétrique plus marqué.
- Toitures de 60° à 70° : une charge de neige apparaît là où il n’y en avait plus.
- Noues, toitures attenantes et dômes : modèles nouveaux à reprendre entièrement.

## Ce qu’il faudra vérifier dans l’annexe nationale

- $\delta_w$, $\mu_{3,max}$, $\mu_{w,M}$, les bornes de $l_s$ et le poids volumique de la neige.
