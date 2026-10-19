---
titre: Vent, tourbillons et phénomènes aéroélastiques
ordre: 76
statut: publie
texte: EN 1991-1-4:2026 (NBN, version française), article 9 et annexe G (G.5, formules (G.15) à (G.18)) lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-4:2005 + A1:2010 (7.13, 8, annexe E) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Le critère de vérification des tourbillons ne change pas, mais le nombre de Scruton est généralisé aux sections rectangulaires, ce qui peut le diviser par deux pour une section allongée dans le sens du vent. Galop, divergence, flottement et effets de sillage sont réorganisés en annexe G.
motscles: actions, stabilite
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Tourbillons (9.3).** La vérification reste exigée si $v_{crit}/v_m \le 1.25$, avec $v_{crit} = b\,n/St$. L’annexe G regroupe la vitesse critique, le nombre de Strouhal, le nombre de Reynolds à la vitesse critique (G.17) et l’amplitude de réponse.

**Nombre de Scruton généralisé (G.18).**

$$
Sc_G = \frac{2\,\delta_s\,m_{i,e}}{\rho\,b\,d} \qquad \text{(G.18)}
$$

En 2005, le dénominateur était $\rho\,b^2$. Pour un cylindre ($d = b$), rien ne change ; pour une section rectangulaire plus profonde que large, $Sc$ diminue, et la structure paraît plus sensible.

**Autres phénomènes.** Galop (9.4) : négligeable pour les cylindres isolés, sauf givre asymétrique ; les sections en L, I, U, T y sont sujettes. Divergence et flottement (9.5) : à éviter, critères en annexe G. Effets de sillage (9.6) : à considérer pour les bâtiments très élancés, les cheminées et les ponts en tandem, sauf distance de plus de 15 fois la largeur ou fréquence supérieure à 1 Hz.

**Ponts.** Les tabliers relèvent désormais d’une catégorisation de susceptibilité aérodynamique (5.4) : les portées de moins de 25 m sont négligeables, celles de plus de 250 m demandent des essais en soufflerie.

## Pourquoi

La masse et l’amortissement s’opposent à la vibration. Le texte ne justifie pas le changement de dénominateur ; le produit $b\,d$ tient compte de la profondeur de la section, que $b^2$ ignorait.

## L’exemple type : tour à section rectangulaire

Section de 2 m perpendiculairement au vent et 4 m dans le sens du vent, fréquence 1,2 Hz, nombre de Strouhal lu dans l’annexe G (0,06), vitesse moyenne au sommet 30 m/s ; masse équivalente 4000 kg/m, décrément logarithmique 0,05.

```exemple
{
  "nom": "tour-rectangulaire",
  "mecanisme": "tourbillons",
  "entree": { "b": 2, "d": 4, "n": 1.2, "St": 0.06, "vm": 30, "m": 4000, "deltas": 0.05 },
  "attendus": {
    "en1991-1-4-2026/critere.v_crit": "40,0",
    "en1991-1-4-2005/scruton.resistance": "80",
    "en1991-1-4-2026/scruton.resistance": "40"
  }
}
```

$v_{crit}$ = {{tour-rectangulaire:en1991-1-4-2026/critere.v_crit}} m/s dépasse 1,25 $v_m$ = 37,5 m/s : la vérification des tourbillons n’est pas exigée, dans les deux générations. Si elle l’était, le nombre de Scruton passerait de {{tour-rectangulaire:en1991-1-4-2005/scruton.resistance}} à {{tour-rectangulaire:en1991-1-4-2026/scruton.resistance}}, et l’amplitude calculée augmenterait.

{{calculateur:tour-rectangulaire}}

## L’effet sur une note de calcul existante

- Cylindres : pas de changement sur $Sc$.
- Sections rectangulaires allongées : reprendre l’amplitude des tourbillons avec $Sc_G$.
- Tabliers de ponts : appliquer la catégorisation de 5.4.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les nombres de Strouhal, la masse volumique de l’air et les éventuelles règles propres aux ponts.
