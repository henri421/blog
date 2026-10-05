---
titre: Durabilité et enrobage des armatures
ordre: 6
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-06
resume: L’enrobage ne se déduit plus d’une classe structurale fondée sur la résistance du béton, mais d’une classe de résistance à l’exposition qui mesure directement la tenue du béton à la carbonatation ou aux chlorures.
motscles: enrobage, durabilite
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-06 : annexe P, autre approche de l’enrobage (niveau en réserve).
---

## Ce qui change

L’enrobage minimal de durabilité dépend désormais d’une **classe de résistance à l’exposition** (ERC), qui caractérise la vitesse de carbonatation ou la diffusion des chlorures du béton réellement employé, et non plus d’une classe structurale ajustée selon la classe de résistance mécanique. Les classes d’exposition XC, XD, XS restent les mêmes ; c’est le béton qui entre dans le calcul de l’enrobage, par sa performance.

## Pourquoi

En première génération, l’enrobage minimal de durabilité se lit dans un tableau à deux entrées : la classe d’exposition et une **classe structurale** S1 à S6. La classe de départ est S4 pour 50 ans ; on la relève pour 100 ans, on l’abaisse pour une géométrie de dalle, un contrôle de qualité particulier ou une classe de résistance suffisante. La résistance en compression y sert d’indicateur indirect de la compacité, donc de la protection des armatures. L’indicateur est commode mais imparfait : deux bétons de même classe de résistance, à liants différents, ne carbonatent pas à la même vitesse.

La deuxième génération mesure directement ce qui protège l’acier :

- une classe **XRC**, exprimée comme une vitesse de carbonatation, déduite de la profondeur carbonatée atteinte au bout de 50 ans dans des conditions de référence ;
- une classe **XRDS**, exprimée comme un coefficient de diffusion des chlorures.

Le tableau d’enrobage croise alors la classe d’exposition, la classe ERC et la durée d’utilisation de projet (50 ou 100 ans) (tableaux 6.3 et 6.4). Les ERC sont définies et justifiées dans le cadre de l’EN 206 : c’est la spécification du béton, et non la note de calcul, qui garantit la classe retenue.

L’annexe P offre une voie alternative fondée sur l’approche de 2004, si l’annexe nationale la désigne.

## Le calcul dans les deux générations

Dans les deux générations, l’enrobage nominal est l’enrobage minimal augmenté d’une tolérance d’exécution :

$$
c_{nom} = c_{min} + \Delta c_{dev}
$$

Première génération (4.4.1.2) :

$$
c_{min} = \max\left(c_{min,b} \; ; \; c_{min,dur} + \Delta c_{dur,\gamma} - \Delta c_{dur,st} - \Delta c_{dur,add} \; ; \; 10\right)
$$

avec des ajustements nuls en valeur recommandée, puis une couche sacrificielle de 5, 10 ou 15 mm ajoutée à $c_{min}$ en cas d’abrasion XM1 à XM3.

Deuxième génération (6.5.2.1, formule (6.2)) :

$$
c_{min} = \max\left(c_{min,dur} + \Delta c \; ; \; c_{min,b} \; ; \; 10\right)
$$

où $\Delta c$ rassemble des réductions plafonnées (durée de 30 ans au plus, compacité améliorée ou cure de classe 3, protections supplémentaires) et les majorations (abrasion, précontrainte). Une face verticale coulée contre le sol reçoit 5 mm de plus. La tolérance $\Delta c_{dev}$ dépend du cas d’exécution (tableau 6.7) : 10 mm en général, moins sous assurance qualité ou en classe de tolérance 2, davantage contre un sol.

L’enrobage d’adhérence $c_{min,b}$ reste le diamètre de la barre, majoré de 5 mm au-delà d’un granulat de 32 mm.

Le calculateur demande $c_{min,dur}$ **lu dans votre norme** pour chaque génération : les tableaux d’enrobage ne sont pas reproduits ici. Il assemble ensuite l’enrobage nominal et le compare à celui des plans.

## L’exemple type : balcon en façade

Balcon en XC4 (exposé à la pluie), béton C30/37, barres HA12, granulat 0/20, durée d’utilisation 50 ans, tolérance d’exécution 10 mm. Les plans prévoient 35 mm.

- **2004** : classe structurale S4, sans réduction (la classe de résistance n’atteint pas le seuil de réduction pour XC4), d’où $c_{min,dur}$ = 30 mm.
- **2023** : le béton est spécifié en XRC 3, d’où $c_{min,dur}$ = 20 mm en XC4 pour 50 ans.

```exemple
{
  "nom": "balcon",
  "mecanisme": "enrobage",
  "entree": { "phi": 12, "Dupper": 20, "cminDur2004": 30, "cminDur2023": 20, "cminDurP": 30, "abrasion": "aucune", "duree30": "non", "compacite": "non", "contactSol": "non", "deltaCdev": 10, "cnomPrevu": 35 },
  "attendus": {
    "ec2-2004/base.c_min": "30",
    "ec2-2004/base.sollicitation": "40",
    "ec2-2004/base.taux": "1,143",
    "ec2-2023/base.c_min": "20",
    "ec2-2023/base.sollicitation": "30",
    "ec2-2023/base.taux": "0,857",
    "ec2-2023/annexe-p.sollicitation": "40",
    "ec2-2023/annexe-p.taux": "1,143"
  }
}
```

| | 2004 | 2023 |
|---|---:|---:|
| Enrobage minimal (mm) | {{balcon:ec2-2004/base.c_min}} | {{balcon:ec2-2023/base.c_min}} |
| Enrobage nominal (mm) | {{balcon:ec2-2004/base.sollicitation}} | {{balcon:ec2-2023/base.sollicitation}} |
| Rapport à l’enrobage prévu de 35 mm | {{balcon:ec2-2004/base.taux}} | {{balcon:ec2-2023/base.taux}} |

Les 35 mm prévus ne suffisaient pas en première génération ; ils suffisent en deuxième, **à condition** que le béton livré soit effectivement de classe XRC 3. Avec un béton moins performant vis-à-vis de la carbonatation, la valeur lue dans le tableau 6.3 croît, et l’écart peut s’inverser. Le balayage du calculateur sur $c_{min,dur}$ (2023) montre à partir de quelle valeur les 35 mm ne suffisent plus.

L’**annexe P** (informative) offre une autre voie, sans classe de résistance à l’exposition : $c_{min,dur}$ se lit selon la classe structurale, comme en 2004 (30 mm en S4 et XC4), et l’enrobage nominal revient à {{balcon:ec2-2023/annexe-p.sollicitation}} mm (rapport {{balcon:ec2-2023/annexe-p.taux}}). Les réductions pour une durée de 30 ans ou une compacité améliorée (6.5.2.2) ne s’y appliquent pas. Le calculateur affiche ce niveau avec la réserve d’emploi de l’annexe.

{{calculateur:balcon}}

## L’effet sur une note de calcul existante

- La note doit désormais **citer la classe ERC** du béton à côté de la classe d’exposition, et la spécification du béton doit l’imposer au fournisseur. Sans ERC connue, l’enrobage de deuxième génération ne peut pas être fixé.
- La **durée d’utilisation** de 100 ans n’est plus une majoration de classe structurale : elle a sa propre colonne dans les tableaux.
- Les tolérances d’exécution sont détaillées par cas (tableau 6.7) ; une note qui prenait 10 mm partout reste du côté de la sécurité dans les cas courants, mais doit relever la tolérance contre un sol.
- L’ouverture de fissure limite de durabilité est liée à l’enrobage réel par le facteur $k_{surf}$ (9.2) : augmenter l’enrobage n’est plus neutre pour la vérification de fissuration.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs des tableaux 6.3, 6.4 et 6.7, toutes paramètres nationaux.
- Le choix entre les classes ERC (6.4) et l’approche alternative de l’annexe P.
- Le document d’application national de l’EN 206, qui dira comment un béton est classé en ERC et comment cette classe est justifiée.
