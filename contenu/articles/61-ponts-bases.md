---
titre: Bases de calcul des ponts (EN 1990, annexe A.2)
ordre: 61
statut: publie
texte: EN 1990-1:2023+A1:2026 (NBN, version française), annexe A.2 (A.2.3 à A.2.9, tableaux A.2.1, A.2.2, A.2.7, A.2.10 et A.2.11) lue sur le texte le 2026-10-18, sans autre amendement ni corrigendum pris en compte ; EN 1990:2002 (version française) lue sur le texte le 2026-10-19, mais l’annexe A2 relève de l’A1:2005, non détenu : elle reste citée de mémoire et à relire ; AN-LU:2020 de l’EN 1990:2002+A1:2005 (A2.1.1, A2.2.6, A2.3.1) lue sur le texte le 2026-10-19, l’annexe A2 elle-même restant citée de mémoire ; état d’amendement non encore vérifié.
redige: 2026-10-18
revise: 2026-10-19
resume: Pour les ponts, coefficients partiels et coefficients ψ restent ceux de l’A1:2005, mais une classe CC3 dédoublée (CC3a, CC3b) module désormais les actions, et la vérification de l’équilibre adopte un γG,stb de 1,25 propre aux ponts.
motscles: combinaisons, actions, elu
historique:
  - 2026-10-18 : première rédaction.
  - 2026-10-19 : corps de l’EN 1990:2002 lu sur le texte ; l’annexe A2 (A1:2005), non détenue, reste citée de mémoire.
  - 2026-10-19 : section sur l’annexe nationale luxembourgeoise (durée de 100 ans, ψ0 = 0,3 facultatif, approche 2).
---

## Ce qui change

**Classes de conséquences.** Le tableau A.2.1 donne des exemples propres aux ponts : CC1 pour les ponts de courte portée sur des routes locales peu fréquentées, CC3a pour les ponts sur ou sous les lignes ferroviaires principales et les grands axes, CC2 pour les autres. CC3b, avec $k_F$ = 1,1, est réservée aux cas où l’autorité ou le projet demandent une fiabilité accrue ; en CC3a, $k_F$ reste égal à 1,0 (tableau A.2.11). Les fondations d’un pont sont au moins dans la classe du pont.

**Coefficients partiels (tableau A.2.10).** Ce sont ceux de 2005, multipliés par $k_F$ :

| Action défavorable (VC1) | 2005 | 2023 |
|---|---|---|
| Permanente | 1,35 | 1,35 $k_F$ |
| Trafic routier et piéton | 1,35 | 1,35 $k_F$ |
| Trafic ferroviaire | 1,45 | 1,45 $k_F$ |
| Autres actions variables | 1,5 | 1,5 $k_F$ |
| Eau, tassements | — | lignes propres ($\gamma_{Gw}$, $\gamma_{G,set}$) |

Pour l’équilibre statique (VC2(a)), la partie stabilisatrice d’une action de source unique prend $\gamma_{G,stb}$ = **1,25** pour les ponts, contre 1,15 pour les bâtiments.

**Coefficients ψ (tableau A.2.7).** Inchangés pour le groupe gr1a : 0,75 pour le tandem TS, 0,40 pour la charge répartie UDL, 0 en quasi permanent ; 0,6 pour le vent et la température en $\psi_0$. Les notes précisent qu’un $\psi_2$ non nul de l’UDL peut se justifier pour un trafic dense (situations sismiques en CC3). Les passerelles (A.2.8) et les ponts ferroviaires (A.2.9) ont leurs propres tableaux.

**Durée d’utilisation de projet (tableau A.2.2)** : 100 ans pour les ponts, comme en 2005 ; la deuxième génération ajoute 50 ans pour les ponts dont les éléments principaux ont une protection réduite, 25 ans pour les parties remplaçables et au plus 10 ans pour les ouvrages provisoires.

**Critères de service (A.2.9).** La deuxième génération réunit les critères des ponts routiers, des passerelles (confort, tableau A.2.14) et des ponts ferroviaires (gauche du tablier, rotations), et ajoute les mouvements des fondations.

## Pourquoi

La subdivision de CC3 permet de classer en conséquences élevées les ponts au-dessus des grands axes sans leur appliquer d’office la majoration de 10 % : le texte la réserve aux ouvrages pour lesquels une fiabilité accrue est explicitement demandée. Le texte ne justifie pas la valeur de 1,25 retenue pour $\gamma_{G,stb}$ ; elle est à confirmer dans l’annexe nationale.

## L’exemple type : poutre principale d’un pont au-dessus d’une autoroute

Moments à mi-travée : poids propre 4000 kN·m, tandem TS 2500 kN·m, charge UDL 1500 kN·m, gradient thermique 600 kN·m. Le pont franchit un grand axe : CC3a.

```exemple
{
  "nom": "pont-autoroute",
  "mecanisme": "combinaison-pont",
  "entree": { "G": 4000, "TS": 2500, "UDL": 1500, "T": 600, "cc": "CC3a" },
  "attendus": {
    "en1990-2002/str.sollicitation": "11340",
    "en1990-2023/str.sollicitation": "11340",
    "en1990-2023/str.thermique dominante": "9641"
  }
}
```

Le trafic domine ({{pont-autoroute:en1990-2023/str.sollicitation}} kN·m, contre {{pont-autoroute:en1990-2023/str.thermique dominante}} kN·m quand la température domine). En CC3a, le résultat est celui de 2005. Le même pont classé CC3b par le maître d’ouvrage passerait à 12 474 kN·m.

{{calculateur:pont-autoroute}}

## Au Luxembourg : l’annexe nationale de 2020

L’AN-LU:2020 fixe la durée d’utilisation de projet des ponts à 100 ans, rend normatives les valeurs recommandées des coefficients partiels et des coefficients $\psi$ des tableaux A2.1 à A2.3, et retient l’approche 2 pour la géotechnique. Elle ajoute aux ponts routiers et ferroviaires une règle de courte durée : quand une action de moins d’un mois est suivie dans la combinaison d’une autre action de courte durée, $\psi_0$ = 0,3 **peut** être utilisé pour la seconde si c’est la neige, le vent ou une variation de température de l’air. La règle est facultative pour les ponts, alors qu’elle s’impose aux bâtiments (article 47). Comme pour les bâtiments, la NOTE 2 du tableau A1.2(B) modifiée s’applique au tableau A2.4(B) : (6.10) en général, $\xi$ = 0,85 seulement avec un poids propre certifié. Ces règles ne sont pas codées dans le calculateur des ponts, l’annexe A2 n’étant pas détenue.

## L’effet sur une note de calcul existante

- Un pont **CC2 ou CC3a** garde ses combinaisons et ses coefficients.
- Un pont **CC3b** voit ses actions défavorables majorées de 10 %.
- Les vérifications d’équilibre (soulèvement d’appui, console de tablier) se font avec VC2, avec $\gamma_{G,stb}$ = 1,25.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les tableaux A.2.1, A.2.7, A.2.10 et A.2.11, et le choix entre (8.12), (8.13) et (8.14).
- Les règles de combinaison avec les véhicules spéciaux.
