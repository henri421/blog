---
titre: Neige sur le sol, période de retour et neige exceptionnelle
ordre: 70
statut: publie
texte: EN 1991-1-3:2025 (NBN, version française), articles 4 à 6, formule (6.1), annexes A et B (formule (B.1)) et C lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-3:2003 + A1:2015 (2 à 4, annexes C et D) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: La charge de neige sur le sol se définit comme avant, mais elle doit désormais tenir compte du changement climatique. L’ajustement à une autre période de retour et la neige exceptionnelle gardent leurs formules.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Situations de projet (4).** Conditions normales : situation fondamentale, dispositions uniforme et non uniforme. Conditions exceptionnelles (régions définies par l’annexe nationale) : en plus, situation accidentelle avec la neige exceptionnelle. Les effets locaux se vérifient en situation fondamentale. C’est le schéma de 2003, avec la nouvelle terminologie « uniforme / non uniforme ».

**Modélisation (5).** La neige est une action variable fixe et statique ; les essais en soufflerie, en canal hydraulique et la mécanique des fluides numérique sont admis pour les formes non couvertes, à condition d’être calibrés sur le terrain (5.2, nouveau).

**Charge sur le sol (6.1).** $s_k$ correspond toujours à une période de retour de 50 ans (probabilité annuelle de 2 %), jusqu’à 1500 m d’altitude dans les cartes nationales. Deux nouveautés :

- les **effets du changement climatique doivent être pris en compte** (6.1(3)), par défaut en multipliant $s_k$ par un facteur $f_{s,cc} \ge 1$ (article 52) ; l’annexe A explique comment établir les cartes et ce facteur ;
- $s_k$ peut venir d’une analyse statistique de mesures, si l’autorité ou le projet le prévoit.

**Neige exceptionnelle (6.2)**, inchangée : $s_{Ad} = C_{esl}\,s_k$ avec $C_{esl}$ = 2,0.

**Autre période de retour (annexe B, ex-annexe D)**, inchangée, pour une loi de Gumbel :

$$
s_n = s_k\,\frac{1 - V\,\frac{\sqrt 6}{\pi}\left[\ln\left(-\ln(1 - P_n)\right) + 0.577\right]}{1 + 2.59\,V} \qquad \text{(B.1)}
$$

applicable pour des périodes de retour supérieures à 5 ans. Le poids volumique de la neige (annexe C) va de 1,0 kN/m³ (neige fraîche) à 4,0 kN/m³ (neige mouillée).

## Pourquoi

Les cartes de neige reposent sur des séries de mesures passées ; le facteur climatique les prolonge pour la durée de vie des ouvrages. Les autres règles, éprouvées, n’ont pas été modifiées.

## L’exemple type : abri provisoire de chantier

Un abri doit servir 3 ans ; on retient une période de retour de 10 ans. Site à $s_k$ = 0,5 kN/m², coefficient de variation des maxima annuels $V$ = 0,5.

```exemple
{
  "nom": "abri-chantier",
  "mecanisme": "neige-sol",
  "entree": { "sk": 0.5, "V": 0.5, "n": 10 },
  "attendus": {
    "en1991-1-3-2003/retour.sollicitation": "0,36",
    "en1991-1-3-2025/retour.sollicitation": "0,36",
    "en1991-1-3-2025/retour.s_n / s_k": "0,720",
    "en1991-1-3-2025/exceptionnelle.sollicitation": "1,00"
  }
}
```

Pour 10 ans, la charge sur le sol tombe à {{abri-chantier:en1991-1-3-2025/retour.sollicitation}} kN/m² ({{abri-chantier:en1991-1-3-2025/retour.s_n / s_k}} $s_k$). Si le site relève des conditions exceptionnelles, la situation accidentelle prend $s_{Ad}$ = {{abri-chantier:en1991-1-3-2025/exceptionnelle.sollicitation}} kN/m².

{{calculateur:abri-chantier}}

## L’effet sur une note de calcul existante

- Les formules ne changent pas ; la valeur de $s_k$ peut changer avec la nouvelle carte et le facteur climatique de l’annexe nationale.
- Pour les ouvrages provisoires, l’EN 1991-1-6 fixe les périodes de retour à retenir (article sur l’exécution).

## Ce qu’il faudra vérifier dans l’annexe nationale

- La carte de $s_k$, $f_{s,cc}$, les régions à neige exceptionnelle et $C_{esl}$ ; l’application des annexes A à C.
