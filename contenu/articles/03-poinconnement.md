---
titre: Poinçonnement des dalles sans armature de poinçonnement
ordre: 3
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: Le périmètre de contrôle se rapproche du poteau, la résistance s’exprime avec un facteur de gradient et la granulométrie, et la distance au moment nul ouvre un niveau plus fin.
motscles: poinconnement, elu, dalle
historique:
  - 2026-10-04 : première rédaction.
  - 2026-10-04 : vérification sur le texte ; ajout du niveau de résistance minimale (8.4.1(2)), condition a_p < 8 d_v, conditions de β_e.
---

## Ce qui change

Le périmètre de contrôle passe de $2\,d$ à $d_v/2$ du nu du poteau, et la contrainte résistante y est nettement plus élevée, si bien qu’une comparaison de contraintes entre générations n’a pas de sens : seule la comparaison en effort en a un. La résistance dépend désormais de la taille des granulats, de la forme du poteau par un facteur de gradient, et, au niveau le plus fin, de la distance aux lignes de moment nul.

## Pourquoi

L’expression de la première génération est de la même famille que celle de l’effort tranchant sans armature : une régression en $(100\,\rho_l\,f_{ck})^{1/3}$, appliquée sur un périmètre éloigné de $2\,d$ choisi pour que la contrainte y paraisse uniforme.

La deuxième génération dérive ses expressions de la **théorie de la fissure critique** (Muttoni, Fernández Ruiz, Simões), déjà employée par le Model Code 2010 pour le poinçonnement avec quatre niveaux d’approximation fondés sur la rotation de la dalle. L’Eurocode en tire des expressions fermées : la rotation n’apparaît plus explicitement, elle est remplacée par des grandeurs géométriques.

Deux idées en ressortent.

- **Le périmètre proche** ($d_v/2$) est celui où la fissure critique se forme réellement. La concentration de l’effort près d’un petit poteau est prise en compte par le facteur $k_{pb}$, qui croît quand le rapport entre le périmètre du poteau $b_0$ et le périmètre de contrôle $b_{0,5}$ diminue.
- **La longueur d’échelle** : l’ouverture de la fissure critique dépend de la rotation de la dalle, elle-même liée à la distance entre le poteau et la ligne de moment nul. Au niveau forfaitaire, cette distance est implicitement rapportée à $d_v$ ; au niveau fin, elle est saisie.

## Les niveaux d’approximation

Première génération, poteau intérieur, $\beta$ = 1,15 (6.4.4 et 6.4.5) :

$$
V_{Rd} = \frac{1}{\beta}\min\left(v_{Rd,c}\,u_1\,d \; ; \; v_{Rd,max}\,u_0\,d\right), \quad u_1 = 2\,(c_1 + c_2) + 4\,\pi\,d
$$

Deuxième génération, poteau intérieur, $\beta_e$ = 1,15 (8.4.3) :

$$
\tau_{Rd,c} = \frac{0.6}{\gamma_V}\,k_{pb}\left(100\,\rho_l\,f_{ck}\,\frac{d_{dg}}{d_v}\right)^{1/3} \le \frac{0.5}{\gamma_V}\sqrt{f_{ck}}
$$

$$
k_{pb} = 3.6\,\sqrt{1 - \frac{b_0}{b_{0,5}}}, \quad 1 \le k_{pb} \le 2.5, \quad V_{Rd} = \frac{\tau_{Rd,c}\,b_{0,5}\,d_v}{\beta_e}
$$

**Niveau 1 : résistance minimale.** Si $\tau_{Ed}$ reste sous $\tau_{Rdc,min}$ au contour $b_{0,5}$, calculé comme pour l’effort tranchant avec $d = d_v$, la vérification avancée peut être omise (8.4.1(2)). Ni le ferraillage ni le facteur de gradient n’interviennent.

**Niveau 2 :** $d_v$ dans le terme d’échelle.

**Niveau 3 :** $d_v$ y est remplacé par $a_{pd} = \sqrt{a_p\,d_v/8}$, où $a_p$ est la moyenne géométrique des distances du centre du poteau aux lignes de moment nul dans les deux directions, au moins égale à $d_v$ (formules (8.97) et (8.98)). Ce remplacement n’est permis que si $a_p < 8\,d_v$.

La valeur forfaitaire $\beta_e$ = 1,15 du poteau intérieur suppose que la stabilité latérale ne repose pas sur le fonctionnement en portique des dalles et des poteaux, que les travées voisines ne diffèrent pas de plus de 25 % et que la dalle ne porte que des charges réparties.

## L’exemple type : plancher-dalle de bureaux

Plancher-dalle de 24 cm, portées de 6 m, poteau intérieur de 30 × 30 cm, béton C30/37, granulats 0/16. Nappes supérieures HA14 tous les 15 cm dans les deux directions ($A_s$ = 1026 mm²/m), $d_x$ = 205 mm, $d_y$ = 190 mm. Réaction de calcul $V_{Ed}$ = 360 kN. Les lignes de moment nul sont prises à 0,22 fois la portée, soit 1320 mm : c’est l’approximation que le texte autorise pour un plancher-dalle courant contreventé par ailleurs (8.4.3(3)). Acier B500 pour la résistance minimale.

```exemple
{
  "nom": "plancher",
  "mecanisme": "poinconnement",
  "entree": { "VEd": 360, "c1": 300, "c2": 300, "dx": 205, "dy": 190, "Asx": 1026, "Asy": 1026, "fck": 30, "fyk": 500, "Dlower": 16, "apx": 1320, "apy": 1320 },
  "attendus": {
    "ec2-2004/base.u_1": "3682",
    "ec2-2004/base.v_Rd,c": "0,600",
    "ec2-2004/base.resistance": "379,2",
    "ec2-2004/base.taux": "0,949",
    "ec2-2023/tau-min.τ_Rdc,min": "0,831",
    "ec2-2023/tau-min.τ_Ed": "1,151",
    "ec2-2023/tau-min.resistance": "259,7",
    "ec2-2023/tau-min.taux": "1,387",
    "ec2-2023/hauteur-utile.b_0,5": "1820",
    "ec2-2023/hauteur-utile.k_pb": "2,10",
    "ec2-2023/hauteur-utile.τ_Rd,c": "1,227",
    "ec2-2023/hauteur-utile.resistance": "383,6",
    "ec2-2023/hauteur-utile.taux": "0,938",
    "ec2-2023/moment-nul.a_pd": "181",
    "ec2-2023/moment-nul.τ_Rd,c": "1,264",
    "ec2-2023/moment-nul.resistance": "395,2",
    "ec2-2023/moment-nul.taux": "0,910"
  }
}
```

| | 2004 | 2023, niveau 2 | 2023, niveau 3 |
|---|---:|---:|---:|
| Périmètre de contrôle (mm) | {{plancher:ec2-2004/base.u_1}} | {{plancher:ec2-2023/hauteur-utile.b_0,5}} | {{plancher:ec2-2023/hauteur-utile.b_0,5}} |
| Contrainte résistante (MPa) | {{plancher:ec2-2004/base.v_Rd,c}} | {{plancher:ec2-2023/hauteur-utile.τ_Rd,c}} | {{plancher:ec2-2023/moment-nul.τ_Rd,c}} |
| Résistance $V_{Rd}$ (kN) | {{plancher:ec2-2004/base.resistance}} | {{plancher:ec2-2023/hauteur-utile.resistance}} | {{plancher:ec2-2023/moment-nul.resistance}} |
| Taux de travail | {{plancher:ec2-2004/base.taux}} | {{plancher:ec2-2023/hauteur-utile.taux}} | {{plancher:ec2-2023/moment-nul.taux}} |

Le niveau 1 ne suffit pas ici : $\tau_{Ed}$ = {{plancher:ec2-2023/tau-min.τ_Ed}} MPa dépasse $\tau_{Rdc,min}$ = {{plancher:ec2-2023/tau-min.τ_Rdc,min}} MPa (résistance {{plancher:ec2-2023/tau-min.resistance}} kN, taux de travail {{plancher:ec2-2023/tau-min.taux}}), et la vérification avancée est nécessaire.

Le périmètre de contrôle est deux fois plus court, la contrainte résistante deux fois plus élevée ($k_{pb}$ = {{plancher:ec2-2023/hauteur-utile.k_pb}}), et les résistances en effort restent très proches pour ce cas courant. Au niveau 3, $a_{pd}$ = {{plancher:ec2-2023/moment-nul.a_pd}} mm, un peu moins que $d_v$, ce qui relève légèrement la résistance.

{{calculateur:plancher}}

Le balayage sur le côté du poteau montre l’effet du facteur de gradient : pour un petit poteau, $k_{pb}$ atteint son plafond de 2,5 ; pour un poteau large, il diminue.

## L’effet sur une note de calcul existante

- Les **contraintes** de poinçonnement des deux générations ne se comparent pas : elles ne sont pas rapportées au même périmètre. Une note qui conclut sur « $v_{Ed}$ contre $v_{Rd,c}$ » doit être relue en effort.
- La **granulométrie** entre dans la résistance, comme pour l’effort tranchant.
- Le niveau 3 demande la position des lignes de moment nul : une donnée que le modèle de calcul aux éléments finis fournit, mais qui n’apparaissait pas jusqu’ici dans la note.
- Les poteaux allongés (un côté au-delà de $3\,d$), les poteaux de rive et d’angle, les ouvertures et les armatures de poinçonnement relèvent de règles non traitées ici.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs forfaitaires de $\beta_e$ selon la position du poteau, et leurs conditions d’emploi.
- La valeur de $\gamma_V$.
- Les éventuelles règles nationales d’estimation de $a_p$.
