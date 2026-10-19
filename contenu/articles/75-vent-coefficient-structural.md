---
titre: Vent, coefficient structural
ordre: 75
statut: publie
texte: EN 1991-1-4:2026 (NBN, version française), 7.6, article 8 et annexes E, F et H lus sur le texte le 2026-10-18, sans amendement ni corrigendum pris en compte ; EN 1991-1-4:2005 + A1:2010 (6, annexes B, C et F) citée de mémoire, le texte complet n’étant pas détenu et restant à relire ; valeurs de l’exemple tirées de l’atelier JRC de juin 2025 ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-18
resume: Les deux procédures de 2005 pour le coefficient structural sont fusionnées en une seule, avec de nouvelles fonctions de réponse. Les cheminées ne sont plus dispensées de calcul dynamique, mais les tabliers de ponts courants le sont.
motscles: actions
historique:
  - 2026-10-18 : première rédaction.
---

## Ce qui change

**Une notation unique.** Le coefficient structural s’écrit $c_{sd}$ ; on peut encore le séparer en coefficient de dimension $c_s$ et coefficient dynamique $c_d$ (7.6).

**Une seule procédure (annexe E).** En 2005, l’annexe B (procédure 1) et l’annexe C (procédure 2) donnaient deux méthodes, au choix de l’annexe nationale, qui pouvaient différer sensiblement. L’annexe E de 2026 n’en garde qu’une, avec de nouvelles formules pour la réponse quasi statique ($B^2$) et résonante ($R^2$), une échelle de turbulence portée à 300 m et deux facteurs de pointe séparés ($g_B$, $g_R$). Le vent transversal et la torsion des bâtiments sensibles ont leur annexe propre (F), les caractéristiques dynamiques passent en annexe H.

**Les dispenses (8.2).** $c_{sd}$ = 1,0 est admis pour :

| Cas | 2005 | 2026 |
|---|---|---|
| Bâtiments de moins de 15 m | oui | oui |
| Façades et toitures de fréquence propre > 5 Hz | oui | oui |
| Bâtiments contreventés, $h$ < 100 m et $h$ < 4 $d$ | oui | oui |
| Cheminées circulaires, $h$ < 60 m et $h$ < 6,5 $d$ | oui | **non** |
| Tabliers de ponts courants sans calcul dynamique | non | **oui** |

**Forces moyennes.** La force moyenne s’obtient avec $q_m$ et $c_{sd}$ = 1, ou en remplaçant $c_{sd}$ par $1/(1 + g_u I_u)^2$ (7.6(6)).

## Pourquoi

Deux procédures pour la même grandeur donnaient des résultats différents selon le pays. L’atelier JRC de juin 2025 l’illustre sur un immeuble de 100 m : procédure 1 de 2005, $c_s c_d$ = 0,924 ; procédure 2, 0,955 ; procédure unique de 2026, $c_{sd}$ = 0,913. L’effort tranchant à la base passe de 7,72 ou 7,97 MN à 7,81 MN : la nouvelle méthode se situe entre les deux anciennes.

## L’exemple type : une cheminée industrielle

Cheminée circulaire de 40 m, diamètre 8 m.

```exemple
{
  "nom": "cheminee",
  "mecanisme": "csd-simplifie",
  "entree": { "type": "cheminee", "h": 40, "d": 8 },
  "attendus": {
    "en1991-1-4-2005/dispense.resistance": "1,0"
  }
}
```

En 2005, la cheminée entrait dans les dispenses : $c_s c_d$ = {{cheminee:en1991-1-4-2005/dispense.resistance}}. En 2026, elle n’y entre plus : il faut calculer $c_{sd}$ par l’annexe E, et vérifier les tourbillons (article 76). Un immeuble contreventé de 33 m sur 21 m reste dispensé dans les deux générations.

{{calculateur:cheminee}}

## L’effet sur une note de calcul existante

- Cheminées et structures élancées : calcul dynamique désormais obligatoire.
- Bâtiments hauts : reprendre $c_{sd}$ avec l’annexe E ; l’écart avec 2005 dépend de la procédure utilisée.
- Tabliers de ponts courants : simplification possible.

## Ce qu’il faudra vérifier dans l’annexe nationale

- La méthode de détermination de $c_{sd}$ ou de $c_s$ et $c_d$ séparément (8.1, NOTE 2).
