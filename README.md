# ec2-2e-generation

Articles de référence en français sur la deuxième génération de l'Eurocode 2
(EN 1992-1-1:2023), avec exemples types chiffrés et mini-calculateurs embarqués.

Pour chaque mécanisme : ce qui change, pourquoi, les niveaux d'approximation,
un exemple type, un calculateur qui rend côte à côte la première et la deuxième
génération, et ce que cela implique pour une note de calcul existante.

> **État : en préparation.** Aucun article n'est publié. Un article n'est publié
> qu'une fois vérifié l'état d'amendement du texte pour les clauses qu'il traite.

## Principes

- Contenu entièrement rédigé par l'auteur : aucun texte, tableau ni figure de la
  norme ou du Model Code n'est reproduit ; renvois de clause uniquement.
- Valeurs recommandées des deux générations, sans annexe nationale.
- Tous les niveaux d'approximation sont rendus ; un niveau non applicable est
  affiché avec son motif et ses données manquantes, jamais masqué.
- Le site fonctionne hors ligne ; aucune donnée ne quitte le navigateur.

Exception aux conventions communes de la suite : ce dépôt code aussi la
deuxième génération, c'est son objet.

## Structure

- `src/noyau/` : noyau de calcul, indépendant du rendu, réutilisable ailleurs.
- `src/i18n/` : dictionnaire ; aucune chaîne visible n'est écrite en dur.
- `contenu/articles/` : articles en Markdown.
- `app/` : pages et îlots de calcul.

## Développement

```
npm ci
npm run typecheck
npm test
npm run dev
```

Licence MIT, voir `LICENSE`. Conventions : `CONVENTIONS.md`.
