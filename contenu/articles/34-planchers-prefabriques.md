---
titre: Planchers préfabriqués
ordre: 34
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les règles des planchers préfabriqués changent peu ; la principale évolution touche les diaphragmes, dont les joints ne sont plus limités à une contrainte forfaitaire mais vérifiés par frottement-cisaillement, comme les interfaces.
motscles: prefabrication, dalle, interface
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

La clause 13.6 reprend presque mot pour mot les règles de 2004 (10.9.3) :

- **cisaillement entre éléments adjacents** sous charge uniforme, à défaut d’analyse plus précise : $v_{Ed} = q_{Ed}\,b_e/3$ par unité de longueur de joint, avec $q_{Ed}$ la charge variable de calcul et $b_e$ la largeur de l’élément ((10.4) ; (13.13)) ;
- **dalle rapportée** d’au moins 40 mm : l’élément peut être calculé comme mixte si l’interface est vérifiée (6.2.5 ; 8.2.6) ;
- **planchers à poutrelles et entrevous sans dalle rapportée** : calculés comme des dalles pleines si les nervures transversales coulées en place sont armées en continu et espacées selon le même tableau (10.1 ; 13.2) ;
- **chaînages** des structures préfabriquées : mêmes dispositions (10.9.7 ; 13.6.3). En 2023, on ne doit pas recouvrir les chaînages dans les joints étroits, mais recourir à un ancrage mécanique.

Deux évolutions :

- **joints en diaphragme** : en 2004, la contrainte de cisaillement longitudinale moyenne des joints bétonnés ou coulés au mortier était plafonnée à 0,10 MPa pour une surface très lisse et 0,15 MPa sinon. En 2023, la résistance se détermine par frottement-cisaillement, en tenant compte de la compression transversale et de la rugosité ou des clés, selon 8.2.6 ou des essais (13.6.2(4)) ;
- **flexion négative au droit d’un joint** : la zone comprimée est supposée dans la dalle rapportée, sauf si le joint est rempli d’un béton suffisamment compacté. C’est le cas si sa largeur dépasse à la fois $D_{upper}$ et la hauteur de l’élément préfabriqué (13.6.1(6)). Les tirants ancrés dans un joint longitudinal demandent une largeur de joint d’au moins 3 φ à leur niveau (13.6.2(2)).

## L’exemple type : plancher en dalles alvéolaires

Dalles alvéolaires de 1,2 m de large, charge d’exploitation de bureaux de 3 kN/m², soit $q_{Ed}$ = 1,5 × 3 = 4,5 kN/m². La résistance du joint clavé, établie par ailleurs, est de 10 kN/m.

```exemple
{
  "nom": "joint-alveolaire",
  "mecanisme": "joint-plancher",
  "entree": { "qEd": 4.5, "be": 1.2, "vRd": 10 },
  "attendus": {
    "ec2-2004/base.sollicitation": "1,80",
    "ec2-2023/base.sollicitation": "1,80",
    "ec2-2023/base.taux": "0,180"
  }
}
```

Le cisaillement du joint vaut {{joint-alveolaire:ec2-2023/base.sollicitation}} kN/m dans les deux générations, soit un taux de {{joint-alveolaire:ec2-2023/base.taux}}.

{{calculateur:joint-alveolaire}}

## Pourquoi

Un plafond forfaitaire de 0,1 MPa ignorait la compression transversale qui serre souvent le joint, et l’état de sa surface. Le renvoi au modèle des interfaces (8.2.6) unifie le traitement de tous les joints entre bétons d’âges différents, déjà présenté dans l’[article 07](cisaillement-interfaces.html).

## L’effet sur une note de calcul existante

- Le **cisaillement entre éléments** ($q_{Ed}\,b_e/3$) et les dispositions de dalle rapportée restent valables.
- Les **diaphragmes** justifiés par le plafond de 0,1 ou 0,15 MPa doivent être repris avec 8.2.6. La résistance peut être plus élevée sous compression transversale ou avec un joint à clés, plus faible pour un joint lisse sans compression.
- Les **recouvrements de chaînages** dans des joints étroits doivent être remplacés par des ancrages mécaniques.
