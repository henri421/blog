---
titre: Ponts ferroviaires, charges verticales et coefficient dynamique
ordre: 86
statut: publie
texte: EN 1991-2:2023 (NBN, version française), 8.1 à 8.4 lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-2:2003 (6.1 à 6.4) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-18
revise: 2026-10-18
resume: Les modèles ferroviaires LM71, SW/0, SW/2 et le coefficient dynamique Φ2 ou Φ3 passent de la section 6 à la section 8 sans changer de forme. Les choix laissés aux parties sont mieux encadrés, et Φ3 devient la valeur par défaut.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Renumérotation.** Le trafic ferroviaire passe de la section 6 à la section 8 (les sections 6 et 7 traitent désormais des ponts routiers et des passerelles).

**Charges verticales (8.3).** LM71 (quatre charges concentrées et une charge répartie), SW/0, SW/2 et « train à vide » sont reconduits. Les charges classifiées sont multipliées par $\alpha$, choisi parmi 0,75 à 1,46 ($\alpha \ge 1{,}00$ sur les lignes internationales). Le texte énumère les actions qui suivent $\alpha$ : forces centrifuges, lacet ($\alpha \ge 1$ seulement), accélération et freinage, interaction voie-ouvrage, déraillement, SW/0 et charges sur ouvrages géotechniques. Une note dispense de SW/2 si $\alpha \ge 1{,}33$, compte tenu des coefficients partiels de l’EN 1990:2023.

**Coefficient dynamique (8.4.5).** Les formules sont inchangées :

$$\Phi_2 = \frac{1{,}44}{\sqrt{L_\Phi} - 0{,}2} + 0{,}82 \quad (1{,}00 \le \Phi_2 \le 1{,}67) \qquad \text{(8.4)}$$

$$\Phi_3 = \frac{2{,}16}{\sqrt{L_\Phi} - 0{,}2} + 0{,}73 \quad (1{,}00 \le \Phi_3 \le 2{,}00) \qquad \text{(8.5)}$$

avec une réduction de $(h - 1{,}0)/10$ pour une couverture de plus de 1,0 m (8.6). Nouveau : si rien n’est spécifié, **$\Phi_3$ s’applique par défaut**. Les longueurs déterminantes $L_\Phi$ sont un paramètre déterminé nationalement (tableau 8.2, non reproduit ici). Le texte rappelle aussi que $\Phi$ ne couvre pas la résonance : au-delà des critères de 8.4.4, une analyse dynamique (HSLM, trains réels) est obligatoire.

## Pourquoi

Le contenu technique, éprouvé, est conservé. La révision porte sur la lisibilité et la répartition des choix entre l’autorité compétente, le projet et l’annexe nationale.

## L’exemple type : tablier de 20 m sur appuis simples

Voie normalement entretenue, portée déterminante de 20 m, sans couverture.

```exemple
{
  "nom": "tablier-20m",
  "mecanisme": "coefficient-dynamique-rail",
  "entree": { "entretien": "normal", "L": 20 },
  "attendus": {
    "en1991-2-2003/phi.sollicitation": "1,24",
    "en1991-2-2023/phi.sollicitation": "1,24"
  }
}
```

$\Phi_3$ = {{tablier-20m:en1991-2-2023/phi.sollicitation}} dans les deux générations (formule de 2003 citée de mémoire, à relire). Une voie soigneusement entretenue donnerait $\Phi_2$ = 1,16.

{{calculateur:tablier-20m}}

## L’effet sur une note de calcul existante

- Aucun changement numérique attendu pour LM71 et $\Phi$ : seules les références de clauses changent (6.x devient 8.x).
- Si le projet ne précise pas $\Phi_2$, retenir $\Phi_3$.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La valeur de $\alpha$, le choix entre $\Phi_2$ et $\Phi_3$ et le tableau 8.2 des longueurs déterminantes.
- Les lignes où SW/2 s’applique.
