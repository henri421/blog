---
titre: Actions thermiques du feu, courbes nominales
ordre: 68
statut: publie
texte: EN 1991-1-2:2024 (NBN, version française), articles 4, 5.1 et 5.2, formules (5.1) à (5.6), annexes B et G lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-2:2002 (2, 3.1, 3.2) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les trois courbes de feu nominales et le flux thermique net ne changent pas. La deuxième génération réorganise la procédure de calcul au feu, précise son domaine et étend les annexes sur les feux localisés et le facteur de forme.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Procédure (4).** Le calcul au feu enchaîne quatre étapes : choix des scénarios de feu, feux de calcul correspondants, évolution des températures dans les éléments, comportement mécanique. Le domaine est précisé : l’EN 1991-1-2 ne traite ni de l’installation des sprinklers, ni des conditions d’occupation, ni de l’agrément des isolants et revêtements.

**Flux thermique net (5.1)**, inchangé :

$$
h_{net} = \alpha_c\,(\Theta_g - \Theta_m) + \Phi\,\varepsilon_m\,\varepsilon_f\,\sigma\left[(\Theta_r + 273)^4 - (\Theta_m + 273)^4\right]
$$

avec $\varepsilon_m$ = 0,8 sauf indication de l’Eurocode du matériau, $\varepsilon_f$ = 1,0, et sur la face non exposée $\alpha_c$ = 4 W/(m²K), ou 9 si l’on y inclut le rayonnement.

**Courbes nominales (5.2)**, inchangées :

$$
\Theta_g = 20 + 345\,\log_{10}(8\,t + 1) \qquad \text{(5.4, feu normalisé, } \alpha_c = 25\text{)}
$$

$$
\Theta_g = 660\left(1 - 0.687\,e^{-0.32 t} - 0.313\,e^{-3.8 t}\right) + 20 \qquad \text{(5.5, feu extérieur, } \alpha_c = 25\text{)}
$$

$$
\Theta_g = 1080\left(1 - 0.325\,e^{-0.167 t} - 0.675\,e^{-2.5 t}\right) + 20 \qquad \text{(5.6, hydrocarbures, } \alpha_c = 50\text{)}
$$

**Annexes.** L’annexe C (feu localisé, flamme virtuelle) est étendue ; l’annexe G (facteur de forme) reçoit un modèle de flamme solide virtuelle ; une annexe H nouvelle traite des actions thermiques propres aux structures en bois, à utiliser avec l’EN 1995-1-2. Toutes restent informatives.

## Pourquoi

Les courbes nominales sont des conventions d’essai, communes à toute l’Europe : les modifier aurait remis en cause les classements de résistance au feu existants. Les évolutions portent sur les feux réels (annexes), où la recherche a progressé.

## L’exemple type : flux reçu par une poutre à 60 minutes

Feu normalisé, 60 minutes, surface de l’élément à 500 °C.

```exemple
{
  "nom": "poutre-60min",
  "mecanisme": "feu-nominal",
  "entree": { "courbe": "normalisee", "t": 60, "thetam": 500 },
  "attendus": {
    "en1991-1-2-2002/flux.Θ_g": "945",
    "en1991-1-2-2024/flux.Θ_g": "945",
    "en1991-1-2-2024/flux.sollicitation": "94,9"
  }
}
```

Les gaz sont à {{poutre-60min:en1991-1-2-2024/flux.Θ_g}} °C ; la surface reçoit un flux net de {{poutre-60min:en1991-1-2-2024/flux.sollicitation}} kW/m², dont l’essentiel par rayonnement. Les deux générations donnent le même résultat.

{{calculateur:poutre-60min}}

## L’effet sur une note de calcul existante

- Aucun pour un calcul sous feu normalisé.
- Pour un feu localisé ou un élément extérieur, reprendre les annexes C, B et G révisées.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’application des annexes informatives et les éventuels choix de $\varepsilon_m$.
