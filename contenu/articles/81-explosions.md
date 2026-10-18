---
titre: Explosions intérieures et débris
ordre: 81
statut: publie
texte: EN 1991-1-7:2025 (NBN, version française), article 6, tableau 4.1, annexes D (formules (D.1) à (D.3)) et E lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-7:2006 + A1:2014 (5, annexe D) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: La pression de calcul d’une explosion de gaz dans un local muni d’évents ne change pas. La deuxième génération exclut les détonations et les explosions en cascade, précise les classes de conséquences des bâtiments et ajoute une annexe sur les débris.
motscles: actions, robustesse
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Domaine (6.1).** Les explosions sont à considérer partout où un gaz est brûlé ou régulé, où des matières explosives sont stockées ou transportées (installations chimiques, réservoirs, égouts, conduites, tunnels), et où des poussières combustibles peuvent s’accumuler. Les explosions en cascade dans des locaux reliés et les détonations sont hors du domaine.

**Classes de conséquences (tableau 4.1).** Les bâtiments sont classés CC1, CC2a, CC2b et CC3 par usage, nombre de niveaux et surface (par exemple, immeubles de bureaux de 4 à 15 niveaux en CC2b) ; ce classement commande les tirants et éléments clés (article 56).

**Explosion de gaz naturel (D.4).** Pour un local unique de 1000 m³ au plus :

$$
p_d = \max\left\{3 + p_{stat} \,;\, 3 + \frac{p_{stat}}{2} + \frac{0.04}{(A_v/V)^2}\right\} \qquad \text{(D.1), (D.2)}
$$

avec $0.05 \le A_v/V \le 0.15$ m⁻¹ (D.3) ; une pression supérieure à 50 kN/m² peut être ignorée. La pression agit simultanément sur toutes les parois. L’annexe D traite aussi les poussières, les tunnels et les conduites de transport d’énergie.

**Débris (annexe E, nouvelle).** Actions dues aux débris projetés.

## Pourquoi

Les formules de l’annexe D ne valent que pour des déflagrations limitées par la rupture des évents ; les détonations et les propagations en cascade sortent de ce cadre et relèvent d’études spécialisées ou de la robustesse de l’EN 1990.

## L’exemple type : chaufferie au gaz

Local de 50 m³, évents (fenêtres) de 4 m² cédant à 3 kN/m².

```exemple
{
  "nom": "chaufferie",
  "mecanisme": "explosion-gaz",
  "entree": { "pstat": 3, "Av": 4, "V": 50 },
  "attendus": {
    "en1991-1-7-2006/pd.sollicitation": "10,75",
    "en1991-1-7-2025/pd.sollicitation": "10,75",
    "en1991-1-7-2025/pd.A_v / V": "0,080"
  }
}
```

Avec $A_v/V$ = {{chaufferie:en1991-1-7-2025/pd.A_v / V}} m⁻¹, les parois et planchers de la chaufferie doivent résister à {{chaufferie:en1991-1-7-2025/pd.sollicitation}} kN/m² en situation accidentelle, dans les deux générations. Avec 7 m² d’évents, la pression tomberait à 6,5 kN/m².

{{calculateur:chaufferie}}

## L’effet sur une note de calcul existante

- Formules inchangées ; vérifier que l’explosion envisagée reste dans le domaine (pas de cascade, pas de détonation).
- Classement CC2a, CC2b, CC3 à vérifier dans le tableau 4.1.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application de l’annexe D et les valeurs de son paragraphe D.4 ; le tableau 4.1.
