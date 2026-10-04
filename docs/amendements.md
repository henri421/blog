# Registre des amendements et corrigenda (lot 4)

Le cahier des charges (§2) interdit de publier un article tant que l’état
d’amendement des clauses qu’il traite n’a pas été vérifié auprès de l’ILNAS.
Ce registre consigne cette vérification. Tant qu’une ligne n’est pas remplie,
l’article correspondant reste au statut `brouillon` ; un test le garantit.

Texte détenu : EN 1992-1-1:2023, sans amendement ni corrigendum.

## Vérification auprès de l’ILNAS

| Date | Interlocuteur ou source | Amendements publiés | Corrigenda publiés |
|---|---|---|---|
| à faire | | | |

## Effet par article

| Article | Clauses traitées | Touchées par un amendement ou corrigendum ? | Vérifié le | Peut passer à `publie` |
|---|---|---|---|---|
| Cadrage | aucune expression | sans objet | | oui, après relecture |
| Effort tranchant sans armature | 8.2.1, 8.2.2, (8.20), (8.27) à (8.30) | | | |
| Effort tranchant avec armatures | 8.2.3, (8.42) à (8.51) | | | |
| Poinçonnement | 8.4.3, (8.91) à (8.98), tableau 8.3 | | | |
| Fissuration | 9.2.3, (9.8) à (9.17) | | | |
| Ancrages et recouvrements | 11.4.2, (11.3), 11.5.2 | | | |

Les expressions codées et leurs points de doute sont listés dans
`verification-texte.md`, à cocher sur le texte détenu en même temps.

Pour publier un article : remplir sa ligne, passer `statut: publie` dans son
en-tête, ajouter une ligne à son historique, et adapter le test
`tests/contenu/articles.test.ts` qui exige aujourd’hui le statut `brouillon`.
