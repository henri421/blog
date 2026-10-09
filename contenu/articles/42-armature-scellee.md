---
titre: Ancrage des armatures scellées
ordre: 42
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-09 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-09
revise: 2026-10-09
resume: Les barres d’armature scellées dans un béton existant entrent dans l’Eurocode 2 ; leur longueur d’ancrage se déduit de celle d’une barre coulée en place, divisée par un facteur d’efficacité propre au produit de scellement.
motscles: ancrage, dispositions-constructives
historique:
  - 2026-10-09 : première rédaction.
  - 2026-10-09 : forme de (11.12), k_b,pi au diviseur, relue sur le texte ; réserve retirée.
---

## Ce qui change

En 2004, les barres scellées dans un forage (reprises, extensions, renforcements) n’avaient pas de règle dans l’Eurocode 2. On les justifiait par l’agrément technique européen du produit de scellement. En 2023, la clause 11.4.8 leur est consacrée :

- **longueur d’ancrage** : $l_{bd,pi} = l_{bd}/k_{b,pi} \ge 10\,\varphi\,\alpha_{lb}$ (11.12). $l_{bd}$ est celle d’une barre droite coulée en place (11.4.2), calculée avec $f_{ck}$ limitée à 50 MPa, sauf valeur plus élevée admise par la spécification du produit, et une contrainte d’au plus 435 MPa, sauf essais ;
- **facteur d’efficacité** $k_{b,pi}$ : propre au produit et au mode de forage, donné par sa spécification technique selon l’annexe C.8 ;
- **plancher** : $\alpha_{lb}$ = 1,5 tient compte des fissures le long de la barre. La longueur minimale passe donc à 15 φ, au lieu de 10 φ pour une barre coulée en place ;
- **enrobage minimal** : il dépend de la méthode de forage et de l’emploi d’un guide (tableau 11.2) et croît avec la longueur scellée ;
- **espacement** : au moins max(4 φ ; 40 mm) entre barres scellées, et max(2 φ ; 20 mm) avec les barres existantes ;
- **recouvrement** avec une barre existante : selon 11.5.2, en remplaçant $l_{bd}$ par $l_{bd,pi}$.

## Pourquoi

Une barre scellée transmet son effort par le produit de scellement, puis par l’interface entre ce produit et le béton foré. Son adhérence dépend donc du produit, du forage et du nettoyage. Le facteur $k_{b,pi}$ mesuré par essais ramène cette adhérence à celle d’une barre coulée en place, ce qui permet de réutiliser l’expression générale de 11.4.2. Le facteur $\alpha_{lb}$ tient en outre compte des fissures le long de la barre (11.4.8(4)).

## L’exemple type : reprise d’un voile existant

Attentes HA16 scellées dans un voile en C30/37, espacées de 200 mm, à 50 mm des parements, plastifiées. Le produit de scellement a un facteur $k_{b,pi}$ = 0,8, valeur d’exemple. 600 mm de forage sont possibles.

```exemple
{
  "nom": "reprise-voile",
  "mecanisme": "armature-scellee",
  "entree": { "phi": 16, "fck": 30, "fyk": 500, "sigmaSd": 250, "adherence": "bonne", "cs": 200, "cx": 50, "cy": 50, "kbpi": 0.8, "lDispo": 600 },
  "attendus": {
    "ec2-2023/barre-plastifiee.l_bd": "469,3",
    "ec2-2023/barre-plastifiee.sollicitation": "586,7",
    "ec2-2023/barre-plastifiee.taux": "0,977",
    "ec2-2023/contrainte-reelle.sollicitation": "255,8"
  }
}
```

La même barre coulée en place demanderait {{reprise-voile:ec2-2023/barre-plastifiee.l_bd}} mm. Scellée, elle en demande {{reprise-voile:ec2-2023/barre-plastifiee.sollicitation}}, juste dans les 600 mm disponibles (taux {{reprise-voile:ec2-2023/barre-plastifiee.taux}}). Si elle ne travaille qu’à 250 MPa, la longueur tombe à {{reprise-voile:ec2-2023/contrainte-reelle.sollicitation}} mm.

{{calculateur:reprise-voile}}

## L’effet sur une note de calcul existante

- Les **reprises par scellement** justifiées par un agrément peuvent l’être par l’Eurocode 2, à condition de disposer du $k_{b,pi}$ du produit selon C.8.
- Le **plancher de 15 φ** et la limite de 435 MPa s’appliquent sans exception courante.
- L’**enrobage minimal** dépend du forage : la note doit préciser la méthode de forage et l’emploi d’un guide.
