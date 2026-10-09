---
titre: Second ordre des poteaux isolés
ordre: 20
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-05 ; état d’amendement non encore vérifié auprès de l’ILNAS ; méthodes de calcul tirées de l’annexe O (informative).
redige: 2026-10-05
revise: 2026-10-09
resume: Les méthodes simplifiées du second ordre quittent le corps du texte pour une annexe informative ; la courbure nominale d’un poteau contreventé prend une distribution constante, et le moment du second ordre augmente d’un quart.
motscles: stabilite, analyse-structurale, elu
historique:
  - 2026-10-05 : première rédaction (critère d’élancement et courbure nominale).
  - 2026-10-05 : rigidité nominale et majoration des moments (5.8.7 ; O.8).
  - 2026-10-09 : troisième terme de l’enveloppe (O.13), relu sur le texte, ajouté au calculateur.
---

## Ce qui change

Le corps du texte (7.4) ne garde que les principes : effets du second ordre négligeables sous 10 % des effets du premier ordre, critère global sur la charge de flambement du contreventement, coefficient de fluage effectif. Les méthodes simplifiées, critère d’élancement, courbure nominale, rigidité nominale et majoration des moments, passent dans l’**annexe O, informative**, dont l’emploi dépend de l’annexe nationale. Le calculateur affiche ces niveaux avec cette réserve.

Dans la méthode de la courbure nominale, deux changements de fond pour les poteaux contreventés : le coefficient de distribution de la courbure passe de 10 à 8, et la courbure de base s’écrit avec le bras $d - d'$ au lieu de $0.45\,d$.

## Pourquoi

Pour un poteau contreventé, la méthode remplace les moments d’extrémité par un moment équivalent constant $C_m\,M_{02}$. Un moment constant donne une courbure constante, dont la flèche vaut $l_0^2/8$ fois la courbure et non $l_0^2/10$, valeur d’une distribution sinusoïdale. La première génération signalait déjà que 8 était la borne inférieure pour un moment constant, mais retenait 10 dans le cas courant ; la deuxième met la méthode en cohérence avec son hypothèse.

La courbure de base $2\,\varepsilon_{yd}/(d - d')$ est celle d’une section dont les deux nappes atteignent la plastification ; $0.45\,d$ en était une approximation qui suppose $d' \approx 0.1\,d$.

## Le calcul dans les deux générations

**Critère d’élancement** (5.8.3.1 ; O.6), identique dans sa forme :

$$
\lambda = \frac{l_0}{i}, \qquad \lambda_{lim} = \frac{20\,A\,B\,C}{\sqrt{n}}, \quad A = \frac{1}{1 + 0.2\,\varphi_{eff}}, \quad B = \sqrt{1 + 2\,\omega}, \quad C = 1.7 - r_m
$$

avec $n = N_{Ed}/(A_c\,f_{cd})$ et $\omega = A_s\,f_{yd}/(A_c\,f_{cd})$. En 2023, $f_{cd}$ inclut $k_{tc}$ = 0,85 : $n$ augmente et $\lambda_{lim}$ baisse légèrement.

**Courbure nominale** (5.8.8 ; O.7) :

$$
M_{Ed} = M_{0Ed} + M_2, \qquad M_2 = N_{Ed}\,\frac{l_0^2}{c}\,\frac{1}{r}, \qquad \frac{1}{r} = k_r\,k_\varphi\,\frac{1}{r_0}
$$

| | 2004 | 2023 (annexe O) |
|---|---|---|
| Moment équivalent, contreventé | $0.6\,M_{02} + 0.4\,M_{01} \ge 0.4\,M_{02}$ | $C_m\,M_{02}$, $C_m = 0.6 + 0.4\,r_m \ge 0.4$ |
| $c$ | 10 | 8 contreventé, 10 non contreventé |
| $1/r_0$ | $\varepsilon_{yd}/(0.45\,d)$ | $2\,\varepsilon_{yd}/(d - d')$ |
| $k_r$ | $(n_u - n)/(n_u - n_{bal}) \le 1$ | 1 en première approximation, ou la même expression |
| $k_\varphi$ | $1 + \beta\,\varphi_{eff} \ge 1$, $\beta = 0.35 + f_{ck}/200 - \lambda/150$ | identique |

Le calculateur prend l’imperfection $e_i = l_0/400$ pour un élément contreventé et $e_i = \theta_i\,l_0/2$ sinon (voir l’article sur les imperfections), l’ajoute aux deux moments d’extrémité et retient $M_{Ed} = \max(M_{0Ed} + M_2 ; M_{02})$ en 2004. En 2023, l’enveloppe (O.13) ajoute un troisième terme, $|M_{01} - 0.5\,M_2 - 2\,|N_{Ed}|\,e_i|$ : l’extrémité la moins sollicitée, avec l’imperfection prise dans l’autre sens. Il gouverne pour un poteau en double courbure dont le second ordre reste modéré.

**Rigidité nominale et majoration des moments** (5.8.7 ; O.8) : le moment du premier ordre est amplifié par

$$
M_{Ed} = M_{0Ed}\left[1 + \frac{\beta}{N_B/N_{Ed} - 1}\right], \qquad N_B = \frac{\pi^2\,EI}{l_0^2}
$$

avec $\beta = \pi^2/8$ pour le moment équivalent constant d’un élément contreventé, et $\beta$ = 1 sinon. La différence porte sur la rigidité. La première génération l’écrit $EI = K_c\,E_{cd}\,I_c + K_s\,E_s\,I_s$, avec $K_c = k_1\,k_2/(1 + \varphi_{ef})$, $k_1 = \sqrt{f_{ck}/20}$, $k_2 = n\,\lambda/170 \le 0.2$ et $K_s$ = 1, ou, pour $\rho \ge$ 1 %, la forme simplifiée $K_s$ = 0 et $K_c = 0.3/(1 + 0.5\,\varphi_{ef})$. La deuxième génération renvoie à la rigidité de plastification (7.4.3.2) et donne, pour l’analyse globale, la valeur forfaitaire $EI = 0.4\,E_{cd}\,I_c$ pour les poteaux (O.8.1(5)), que le calculateur retient. Le module de calcul change aussi : $E_{cd} = E_{cm}/\gamma_{cE}$ avec $\gamma_{cE}$ = 1,2 en 2004 et 1,5 en 2023 (tableau 4.3).

## L’exemple type : poteau de bâtiment contreventé

Poteau de 400 × 400 mm, 8 HA20 ($A_s$ = 2513 mm²), $d$ = 350 mm, C30/37, B500, longueur efficace 6 m, contreventé. $N_{Ed}$ = 2 000 kN, moments du premier ordre 80 et 40 kN·m tendant la même face, $\varphi_{eff}$ = 1,2.

```exemple
{
  "nom": "poteau-elancement",
  "mecanisme": "elancement-limite",
  "entree": { "b": 400, "h": 400, "As": 2513, "fck": 30, "fyk": 500, "l0": 6000, "NEd": 2000, "M01": 40, "M02": 80, "phiEff": 1.2, "contrevente": "oui" },
  "attendus": {
    "ec2-2004/base.sollicitation": "52,0",
    "ec2-2004/base.n": "0,625",
    "ec2-2004/base.resistance": "31,8",
    "ec2-2023/base.n": "0,735",
    "ec2-2023/base.resistance": "30,3"
  }
}
```

L’élancement vaut {{poteau-elancement:ec2-2004/base.sollicitation}}, au-delà de la limite dans les deux générations ({{poteau-elancement:ec2-2004/base.resistance}} en 2004, {{poteau-elancement:ec2-2023/base.resistance}} en 2023, où $n$ passe de {{poteau-elancement:ec2-2004/base.n}} à {{poteau-elancement:ec2-2023/base.n}}) : le second ordre doit être calculé.

{{calculateur:poteau-elancement}}

```exemple
{
  "nom": "poteau-courbure",
  "mecanisme": "courbure-nominale",
  "entree": { "b": 400, "h": 400, "d": 350, "As": 2513, "fck": 30, "fyk": 500, "l": 6000, "l0": 6000, "NEd": 2000, "M01": 40, "M02": 80, "phiEff": 1.2, "contrevente": "oui" },
  "attendus": {
    "ec2-2004/courbure.e_i": "15,0",
    "ec2-2004/courbure.M_0Ed": "94,0",
    "ec2-2004/courbure.K_r": "0,761",
    "ec2-2004/courbure.e_2": "44,8",
    "ec2-2004/courbure.M_2": "89,6",
    "ec2-2004/courbure.resistance": "183,6",
    "ec2-2023/kr-1.e_2": "77,2",
    "ec2-2023/kr-1.resistance": "248,5",
    "ec2-2023/kr-precis.k_r": "0,665",
    "ec2-2023/kr-precis.e_2": "51,4",
    "ec2-2023/kr-precis.M_2": "102,8",
    "ec2-2023/kr-precis.resistance": "196,8"
  }
}
```

Avec $e_i$ = {{poteau-courbure:ec2-2004/courbure.e_i}} mm, le moment équivalent vaut {{poteau-courbure:ec2-2004/courbure.M_0Ed}} kN·m dans les deux textes.

| | $e_2$ (mm) | $M_2$ (kN·m) | $M_{Ed}$ (kN·m) |
|---|---:|---:|---:|
| 2004, $K_r$ = {{poteau-courbure:ec2-2004/courbure.K_r}}, $c$ = 10 | {{poteau-courbure:ec2-2004/courbure.e_2}} | {{poteau-courbure:ec2-2004/courbure.M_2}} | {{poteau-courbure:ec2-2004/courbure.resistance}} |
| 2023, $k_r$ = 1, $c$ = 8, sous réserve | {{poteau-courbure:ec2-2023/kr-1.e_2}} | — | {{poteau-courbure:ec2-2023/kr-1.resistance}} |
| 2023, $k_r$ = {{poteau-courbure:ec2-2023/kr-precis.k_r}}, $c$ = 8, sous réserve | {{poteau-courbure:ec2-2023/kr-precis.e_2}} | {{poteau-courbure:ec2-2023/kr-precis.M_2}} | {{poteau-courbure:ec2-2023/kr-precis.resistance}} |

À calcul égal de $k_r$, le moment de calcul augmente d’environ 7 % : le passage de $c$ = 10 à 8 compte pour +25 % sur $M_2$, la nouvelle courbure de base pour +5 %, et le $k_r$ plus faible de 2023 (dû au $n$ plus grand) en reprend une partie. La première approximation $k_r$ = 1, plus simple, coûte ici 26 % de plus sur le moment total que le calcul de $k_r$.

{{calculateur:poteau-courbure}}

Le même poteau par la rigidité nominale :

```exemple
{
  "nom": "poteau-rigidite",
  "mecanisme": "rigidite-nominale",
  "entree": { "b": 400, "h": 400, "d": 350, "As": 2513, "fck": 30, "fyk": 500, "l": 6000, "l0": 6000, "NEd": 2000, "M01": 40, "M02": 80, "phiEff": 1.2, "contrevente": "oui" },
  "attendus": {
    "ec2-2004/base.E_cd": "27364",
    "ec2-2004/base.N_B": "4802",
    "ec2-2004/base.facteur de majoration": "1,88",
    "ec2-2004/base.resistance": "176,8",
    "ec2-2004/simplifiee.N_B": "3001",
    "ec2-2004/simplifiee.resistance": "325,8",
    "ec2-2023/base.E_cd": "21293",
    "ec2-2023/base.N_B": "4981",
    "ec2-2023/base.facteur de majoration": "1,83",
    "ec2-2023/base.resistance": "171,8"
  }
}
```

| | $E_{cd}$ (MPa) | $N_B$ (kN) | Majoration | $M_{Ed}$ (kN·m) |
|---|---:|---:|---:|---:|
| 2004, $K_c$ et $K_s$ | {{poteau-rigidite:ec2-2004/base.E_cd}} | {{poteau-rigidite:ec2-2004/base.N_B}} | {{poteau-rigidite:ec2-2004/base.facteur de majoration}} | {{poteau-rigidite:ec2-2004/base.resistance}} |
| 2004, forme simplifiée | | {{poteau-rigidite:ec2-2004/simplifiee.N_B}} | | {{poteau-rigidite:ec2-2004/simplifiee.resistance}} |
| 2023, $0.4\,E_{cd}\,I_c$, sous réserve | {{poteau-rigidite:ec2-2023/base.E_cd}} | {{poteau-rigidite:ec2-2023/base.N_B}} | {{poteau-rigidite:ec2-2023/base.facteur de majoration}} | {{poteau-rigidite:ec2-2023/base.resistance}} |

Le module de calcul baisse d’un cinquième, mais la rigidité forfaitaire $0.4\,E_{cd}\,I_c$ compense : la charge de flambement et le moment de calcul restent voisins de ceux de 2004. La forme simplifiée de 2004, prévue comme étape préliminaire, double presque le moment. Les deux méthodes simplifiées de 2023 ne donnent pas le même résultat sur ce poteau ({{poteau-rigidite:ec2-2023/base.resistance}} kN·m par la rigidité, {{poteau-courbure:ec2-2023/kr-precis.resistance}} kN·m par la courbure) : le calculateur affiche les deux, le choix appartient à l’ingénieur.

{{calculateur:poteau-rigidite}}

## L’effet sur une note de calcul existante

- Les **poteaux contreventés élancés** voient leur moment du second ordre augmenter, d’un quart environ à $k_r$ égal ; le ferraillage peut en être affecté.
- Le **module de calcul** $E_{cd}$ baisse de 20 % ($\gamma_{cE}$ = 1,5) ; une rigidité recalculée par l’expression de 2004 avec ce module serait sous-estimée.
- La note doit citer l’**annexe O** et son statut national pour chaque méthode simplifiée employée.
- Le **coefficient de fluage effectif** se définit désormais par les déformations ou les moments quasi permanents rapportés à ceux de calcul (7.4.2), avec une distinction entre effets globaux et locaux.

## Ce qu’il faudra vérifier dans l’annexe nationale

- L’emploi de l’annexe O, informative, qui porte toutes les méthodes simplifiées.
