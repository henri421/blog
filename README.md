# ec2-2e-generation

Articles de référence en français sur la deuxième génération de l'Eurocode 2
(EN 1992-1-1:2023), avec exemples types chiffrés et mini-calculateurs embarqués.

Pour chaque mécanisme : ce qui change, pourquoi, les niveaux d'approximation,
un exemple type, un calculateur qui rend côte à côte la première et la deuxième
génération, et ce que cela implique pour une note de calcul existante.

> **État : brouillons.** Six articles sont rédigés, vérifiés sur le texte (`docs/verification-texte.md`) ; aucun n'est publié. Un
> article n'est publié qu'une fois vérifié l'état d'amendement du texte pour
> les clauses qu'il traite (`docs/amendements.md`), et les expressions codées
> contrôlées sur le texte (`docs/verification-texte.md`).

## Articles

| Article | Calculateur | Niveaux 2004 / 2023 |
|---|---|---|
| Cadrage : calendrier, périmètre, niveaux d'approximation | aucun | — |
| Effort tranchant sans armature d'âme | `tranchant-sans-armature` | 1 / 3 |
| Effort tranchant avec armatures d'âme | `tranchant-avec-armature` | 1 / 2 |
| Poinçonnement, poteau intérieur | `poinconnement` | 1 / 3 |
| Ouverture de fissure | `fissuration` | 1 / 1 |
| Longueurs d'ancrage et de recouvrement | `ancrage` | 2 / 2 |
| Durabilité et enrobage | `enrobage` | 1 / 1 |
| Cisaillement aux interfaces | `interface` | 1 / 2 |
| Cisaillement âme-table | `ame-table` | 2 / 2 |
| Poinçonnement avec armatures | `poinconnement-arme` | 1 / 1 |
| Flèche à long terme | `fleche` | 1 / 2 |
| Propriétés du béton | `materiaux` | 1 / 1 |
| Flexion simple à l'ELU | `flexion` | 2 / 1 |
| Pressions localisées | `pression-localisee` | 1 / 1 |
| Torsion | `torsion` | 1 / 2 |
| Ancrage par coude ou crochet | `ancrage-crochet` | 2 / 2 |
| Élancement portée / hauteur | `elancement` | 1 / 1 |
| Redistribution des moments | `redistribution` | 1 / 1 |
| Imperfections géométriques | `imperfections` | 3 / 4 |
| Bielles et nœuds | `bielles` | 1 / 3 |
| Limitation des contraintes en service | `contraintes-els` | 3 / 3 |
| Chaînages de robustesse | `chainages` | 1 / 1 |
| Espacement des barres et paquets | `espacement` | 1 / 1 |
| Ancrage par barres soudées et boucles en U | `ancrage-soude`, `ancrage-boucle` | 2 / 2 |
| Ancrage par tête d'ancrage | `tete-ancrage` | 0 / 1 |
| Diamètre des mandrins de cintrage | `mandrin` | 2 / 1 |
| Fatigue, vérifications simplifiées | `fatigue-acier`, `fatigue-beton`, `fatigue-tranchant` | 1 / 1 chacun |
| Béton non armé | `non-arme-compression`, `non-arme-tranchant`, `semelle-non-armee` | 1 / 1, 1 / 1 et 2 / 2 |
| Appuis des éléments préfabriqués | `appui-prefabrique` | 2 / 1 |
| Transmission de la précontrainte par pré-tension | `pretension` | 2 / 2 |
| Fondations en encuvement | `encuvement` | 1 / 1 |
| Post-tension : gaines et rayon de courbure | `post-tension` | 2 / 3 |
| Planchers préfabriqués | `joint-plancher` | 1 / 1 |
| Coefficients partiels des matériaux | `coefficients-partiels` | 1 / 1 |
| Déversement des poutres élancées | `deversement` | 1 / 1 |
| Largeur participante des tables | `largeur-participante` | 1 / 2 |
| Compression avec flexion déviée | `flexion-deviee` | 2 / 2 |
| Coefficient de fluage effectif | `fluage-effectif` | 2 / 2 |
| Diagramme de calcul de l’acier | `acier-calcul` | 1 / 1 |
| Analyse plastique sans vérification de rotation | `analyse-plastique` | 1 / 1 |
| Ancrage des armatures scellées | `armature-scellee` | 0 / 2 |
| Précontrainte : mise en tension, frottement et pertes différées | `precontrainte-tension`, `pertes-differees` | 2 / 2 et 1 / 1 |
| Armatures d’intégrité des planchers-dalles | `integrite` | 0 / 2 |
| Efforts de déviation des barres courbes | `deviation` | 0 / 2 |
| Recouvrements par boucles et par barres à tête | `recouvrement-boucle`, `recouvrement-tete` | 0 / 1 et 0 / 1 |
| Combinaisons d’actions à l’ELU (EN 1990) | `combinaison-elu` | 2 / 3 |
| Second ordre des poteaux isolés | `elancement-limite`, `courbure-nominale`, `rigidite-nominale` | 1 / 1, 1 / 2 et 2 / 1 |
| Armatures minimales | `non-fragilite`, `fissuration-minimale`, `armature-tranchant-minimale` | 1 / 2, 1 / 1 et 1 / 2 |

## Principes

- Contenu entièrement rédigé par l'auteur : aucun texte, tableau ni figure de la
  norme ou du Model Code n'est reproduit ; renvois de clause uniquement.
- Valeurs recommandées des deux générations, sans annexe nationale.
- Tous les niveaux d'approximation sont rendus ; un niveau non applicable est
  affiché avec son motif et ses données manquantes, jamais masqué. Un niveau
  plus fin moins favorable est montré tel quel.
- Chaque chiffre cité par un article est recalculé par le noyau à chaque
  test : un article ne peut pas afficher un chiffre que le code ne produit plus.
- Le site fonctionne hors ligne ; aucune donnée ne quitte le navigateur.

Exception aux conventions communes de la suite : ce dépôt code aussi la
deuxième génération, c'est son objet.

## Structure

- `src/noyau/` : noyau de calcul, indépendant du rendu, réutilisable ailleurs
  (moteur de niveaux, matrice, balayage, cinq mécanismes).
- `src/i18n/` : dictionnaire ; aucune chaîne visible n'est écrite en dur.
- `src/ilots/` : calculateur embarqué (formulaire, matrice, détail, courbes).
- `src/contenu/` : exemples des articles et leur vérification.
- `contenu/articles/` : articles en Markdown, avec leurs blocs ```` ```exemple ````.
- `app/construire/` : Markdown et TeX vers HTML et MathML, sans dépendance,
  à la construction ; les pages produites dans `app/` ne sont pas suivies.
- `docs/validation/` : calculs à la main des exemples.

## Écrire un article

En-tête entre `---` : `titre`, `ordre`, `statut` (`brouillon` ou `publie`),
`texte` (texte de référence et état d'amendement), `redige`, `revise`,
`resume`, `historique` (liste). Formules en TeX entre `$` ou entre lignes `$$`.
Un exemple se déclare dans un bloc ```` ```exemple ```` (JSON : `nom`,
`mecanisme`, `entree`, `attendus`) ; le texte cite une valeur par
`{{nom:generation/niveau.grandeur}}` et embarque le calculateur par
`{{calculateur:nom}}` seul sur sa ligne.

## Développement

```
npm ci
npm run typecheck
npm test
npm run dev
```

Licence MIT, voir `LICENSE`. Conventions : `CONVENTIONS.md`.
