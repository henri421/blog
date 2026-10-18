---
titre: Actions thermiques sur les ponts
ordre: 78
statut: publie
texte: EN 1991-1-5:2025 (NBN, version française), article 8 (8.1.1 à 8.1.4, tableau 8.1, formules (8.1) à (8.6)) et annexe B lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-5:2003 (6.1, figure 6.1) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les températures extrêmes des tabliers se déduisent toujours des températures de l’air sous abri, mais la température initiale du pont devient incertaine, avec une plage ΔT0, et les températures de l’air reçoivent un terme de changement climatique.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Températures du tablier (tableau 8.1).** Les relations linéaires de la figure 6.1 de 2003 deviennent un tableau :

| Tablier | $T_{N,max}$ | $T_{N,min}$ |
|---|---|---|
| Type 1, acier | $T_{max}$ + 16 | $T_{min}$ − 3 |
| Type 2, mixte | $T_{max}$ + 4 | $T_{min}$ + 4 |
| Type 3, béton | $T_{max}$ + 2 (+ 1,5 en 2003) | $T_{min}$ + 8 |

Pour les poutres en treillis et profilés en acier, $T_{N,max}$ peut être réduit de 3 °C.

**Changement climatique (8.1.3.2(4)).** Les températures de l’air sous abri doivent en tenir compte : $T'_{max} = T_{max} + \Delta T_{cc,max}$ et $T'_{min} = T_{min} + \Delta T_{cc,min}$ (8.1), (8.2).

**Température initiale incertaine (8.1.3.3).** En 2003, l’étendue se calculait à partir d’une température initiale $T_0$ unique (une marge forfaitaire étant prévue pour les appareils d’appui). En 2025, $T_0$ est encadrée par $T_{0,sup} = T_0 + \Delta T_0$ et $T_{0,inf} = T_0 - \Delta T_0$ :

$$
\Delta T_{N,con} = T_{0,sup} - T_{N,min} \qquad \text{(8.5)} \qquad\qquad \Delta T_{N,exp} = T_{N,max} - T_{0,inf} \qquad \text{(8.6)}
$$

$\Delta T_0$ est fixé par l’annexe nationale, ou par le projet si la température de clavage est contrôlée.

**Gradients (8.1.4).** Méthode 1 (composante linéaire) ou méthode 2 (non linéaire), avec des tableaux et figures améliorés et quelques valeurs corrigées pour les gradients non linéaires ; coefficient $k_{sur}$ pour l’épaisseur de revêtement.

## Pourquoi

L’incertitude sur la température au moment du blocage du tablier pèse directement sur le dimensionnement des appareils d’appui et des joints de dilatation. La deuxième génération la rend explicite plutôt que de l’absorber dans une marge.

## L’exemple type : viaduc en béton

Tablier en béton, $T_{max}$ = 35 °C, $T_{min}$ = −20 °C, $T_0$ = 10 °C. On suppose $\Delta T_0$ = 5 °C (valeur d’exemple, à fixer par l’annexe nationale).

```exemple
{
  "nom": "viaduc-beton",
  "mecanisme": "temperature-pont",
  "entree": { "type": "beton", "Tmax": 35, "Tmin": -20, "T0": 10, "dT0": 5 },
  "attendus": {
    "en1991-1-5-2003/contraction.sollicitation": "22,0",
    "en1991-1-5-2003/dilatation.sollicitation": "26,5",
    "en1991-1-5-2025/contraction.sollicitation": "27,0",
    "en1991-1-5-2025/dilatation.sollicitation": "32,0"
  }
}
```

L’étendue de contraction passe de {{viaduc-beton:en1991-1-5-2003/contraction.sollicitation}} à {{viaduc-beton:en1991-1-5-2025/contraction.sollicitation}} °C, celle de dilatation de {{viaduc-beton:en1991-1-5-2003/dilatation.sollicitation}} à {{viaduc-beton:en1991-1-5-2025/dilatation.sollicitation}} °C. Un terme climatique de 2 °C ajouterait encore 2 °C à la dilatation.

{{calculateur:viaduc-beton}}

## L’effet sur une note de calcul existante

- Course des appareils d’appui et des joints : à reprendre avec $\Delta T_0$ et le terme climatique.
- Tabliers en béton : + 0,5 °C sur la température maximale.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les cartes de $T_{max}$ et $T_{min}$, $\Delta T_{cc}$, $\Delta T_0$, $T_0$ par défaut, et les valeurs des gradients.
