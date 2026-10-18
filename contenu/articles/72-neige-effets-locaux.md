---
titre: Neige, effets locaux (acrotères, obstacles, débords)
ordre: 72
statut: publie
texte: EN 1991-1-3:2025 (NBN, version française), article 8, formules (8.1) à (8.7) lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-3:2003 + A1:2015 (article 6) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les effets locaux de la neige distinguent désormais les acrotères (allongés) et les obstructions (compactes). Le coefficient d’accumulation le long d’un acrotère peut atteindre 4, contre 2 en première génération, et une noue d’intersection de toitures reçoit son propre cas de charge.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Acrotères ou obstructions.** En 2003, une même règle (6.2) traitait les obstacles et les acrotères, avec $\mu_2 = \gamma\,h/s_k$ borné entre 0,8 et 2,0 et une congère de longueur $2\,h$. En 2025 :

- **obstruction** (largeur $w$ < 2 $h$, par exemple une cheminée) : $\mu_6 = 0.8\,\gamma\,h/(C_e\,s_k)$ (8.1) ; les obstructions de moins de 1 m² ou de 0,5 m de haut peuvent être négligées ;
- **acrotère** ($w$ ≥ 2 $h$) :

$$
\mu_7 = \frac{0.8}{C_e}\,\frac{2\,b}{l_s} \le \min\left\{\frac{0.8\,\gamma\,h_p}{C_e\,s_k} \,;\, \mu_{7,max}\right\} \qquad \text{(8.3)}
$$

avec $l_s = 4\,h_p/C_e$ entre 5 et 15 m (8.4), $\gamma$ = 2 kN/m³ et $\mu_{7,max}$ = 4,0. La quantité de neige amenée par le vent dépend maintenant de la longueur de toiture $b$.

**Débords de toiture (8.4)**, au-dessus de 800 m d’altitude : $s_e = k\,s^2/\gamma$ par mètre de rive, avec $\gamma$ = 3 kN/m³ et $k = 3/d \le d\,\gamma$.

**Barres à neige (8.5)**, inchangé : $F_s = s\,b\,\sin\alpha$, sans frottement.

**Intersection de toitures à deux versants (8.6)**, nouveau : dans la noue, $\mu_8 = 0.9 + 0.7\,\alpha/30$, plafonné par $\gamma\,h/(C_t\,s_k)$ et par 1,6.

## Pourquoi

La règle de 2003, plafonnée à 2,0, ne tenait compte ni de la taille de la toiture ni de l’exposition au vent ; celle de 2025 fait dépendre la congère de la neige que le vent peut déplacer. Le plafond physique $0.8\,\gamma\,h_p/(C_e\,s_k)$ correspond à un acrotère rempli de neige ; le facteur $2\,b/l_s$ représente la neige disponible.

## L’exemple type : acrotère d’un bâtiment de bureaux

Le bâtiment de 21 × 45 m de l’atelier JRC de juin 2025 : acrotère de 1,1 m, $b$ = 45 m, $s_k$ = 0,5 kN/m², site normal.

```exemple
{
  "nom": "acrotere-jrc",
  "mecanisme": "neige-acrotere",
  "entree": { "sk": 0.5, "hp": 1.1, "b": 45, "exposition": "normal", "Ct": 1 },
  "attendus": {
    "en1991-1-3-2003/acrotere.sollicitation": "1,00",
    "en1991-1-3-2025/acrotere.μ_7": "3,52",
    "en1991-1-3-2025/acrotere.sollicitation": "1,76"
  }
}
```

$\mu_7$ = {{acrotere-jrc:en1991-1-3-2025/acrotere.μ_7}} : la charge de pointe au pied de l’acrotère vaut {{acrotere-jrc:en1991-1-3-2025/acrotere.sollicitation}} kN/m², contre {{acrotere-jrc:en1991-1-3-2003/acrotere.sollicitation}} kN/m² en 2003. L’atelier retient $l_s$ = 4,4 m sans la borne de 5 m ; comme le plafond gouverne, le résultat est le même.

{{calculateur:acrotere-jrc}}

## L’effet sur une note de calcul existante

- Bacs, pannes et chevêtres en rive de toiture terrasse derrière un acrotère : charge locale jusqu’à doubler.
- Obstructions compactes : règle propre, souvent moins sévère.
- Noues d’intersection : cas de charge nouveau.

## Ce qu’il faudra vérifier dans l’annexe nationale

- $\mu_{7,max}$, $\mu_{8,max}$, $\gamma$, l’altitude des débords et les situations de projet des effets locaux.
