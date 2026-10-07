---
titre: Fatigue, vérifications simplifiées
ordre: 28
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-08 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-08
revise: 2026-10-08
resume: Les étendues de contrainte admises dans les armatures deviennent des valeurs par diamètre et par type, tirées des courbes S-N à 10⁸ cycles. La résistance du béton à la fatigue baisse un peu, et le plafond de 0,9 vaut désormais pour toutes les classes.
motscles: fatigue, elu
historique:
  - 2026-10-08 : première rédaction.
---

## Ce qui change

Le chapitre de la fatigue devient un chapitre propre (10), avec ses vérifications simplifiées en tête. Les méthodes par endommagement passent dans l’annexe E.

**Armatures** (10.4). En 2004, une seule limite s’appliquait à toutes les barres non soudées : $\Delta\sigma_s \le$ 70 MPa, et 35 MPa pour les barres soudées (valeurs recommandées). En 2023, la limite dépend du diamètre et du type, et les coupleurs et la précontrainte reçoivent leur propre valeur :

| Armature | 2004 (MPa) | 2023 (MPa) |
|---|---:|---:|
| Non soudée, φ ≤ 12 mm | 70 | 90 |
| Non soudée, φ > 12 mm | 70 | 73 |
| Soudée bout à bout ou par points, φ ≤ 12 mm | 35 | 40 |
| Soudée bout à bout ou par points, φ > 12 mm | 35 | 30 |
| Coupleur | — | 19 |

Ces limites sont des valeurs de calcul : elles incluent le coefficient partiel sur l’action, et elles se déduisent des courbes S-N de l’annexe E à 10⁸ cycles avec $\gamma_S$ = 1,15.

**Béton comprimé** (10.5). La forme de la vérification ne change pas, mais la résistance de fatigue $f_{cd,fat}$ se calcule autrement. Le plafond de 0,9 vaut désormais pour toutes les classes, au lieu de 0,8 au-delà de 50 MPa.

**Béton cisaillé sans armature d’âme** (10.6(2)). Même forme qu’en 2004. La vérification passe des efforts aux contraintes, et le plafond de 0,9 est lui aussi étendu à toutes les classes.

La note de 10.1 rappelle quand la vérification n’est en général pas nécessaire : bâtiments courants soumis à au plus 2·10⁴ cycles significatifs, sections restant comprimées sous combinaison fréquente, précontrainte extérieure.

## Pourquoi

Une limite unique de 70 MPa était trop sévère pour les petits diamètres et peu sûre pour les soudures de gros diamètre : la résistance en fatigue d’une barre décroît avec son diamètre, et une soudure est d’autant plus nocive que la barre est grosse. Les nouvelles valeurs suivent les courbes S-N au lieu d’un seuil forfaitaire. Pour le béton, $f_{cd,fat}$ s’aligne sur la nouvelle définition de $f_{cd}$, avec $\eta_{cc}$ qui traduit la fragilité des bétons à haute résistance. Ce coefficient joue le rôle du terme $(1 - f_{ck}/250)$ de 2004, et le plafond de 0,8 propre aux bétons à haute résistance devient inutile.

## Le calcul dans les deux générations

**Béton comprimé**, première génération (6.8.7(2), (6.76), (6.77)) :

$$
\frac{\sigma_{c,max}}{f_{cd,fat}} \le 0.5 + 0.45\,\frac{\sigma_{c,min}}{f_{cd,fat}} \le 0.9\ (f_{ck} \le 50\ \text{MPa}),\ 0.8\ \text{sinon}, \qquad f_{cd,fat} = 0.85\,\beta_{cc}(t_0)\,f_{cd}\left(1 - \frac{f_{ck}}{250}\right)
$$

**Deuxième génération** (10.5, (10.4), (10.5)) :

$$
\frac{|\sigma_{cd,max}|}{f_{cd,fat}} \le 0.5 + 0.45\,\frac{|\sigma_{cd,min}|}{f_{cd,fat}} \le 0.9, \qquad f_{cd,fat} = \beta_{cc}(t_0)\,\frac{f_{ck}}{\gamma_C}\,k_{tc}\,\eta_{cc,fat}, \quad \eta_{cc,fat} = \min(0.85\,\eta_{cc} \;;\; 0.8)
$$

Une compression minimale de traction est prise nulle. Le calculateur prend $k_{tc}$ = 0,85, valeur d’une mise en charge avant 90 jours. Le coefficient $\beta_{cc}(t_0)$ se saisit : il vaut 1 pour une charge cyclique appliquée à 28 jours.

**Effort tranchant sans armature d’âme** ((6.78), (6.79) ; (10.6), (10.7)) :

$$
\frac{|V_{Ed,max}|}{V_{Rd,c}} \le 0.5 + 0.45\,\frac{|V_{Ed,min}|}{V_{Rd,c}} \le 0.9 \ \text{si}\ \frac{V_{Ed,min}}{V_{Ed,max}} \ge 0, \qquad \frac{|V_{Ed,max}|}{V_{Rd,c}} \le 0.5 - \frac{|V_{Ed,min}|}{V_{Rd,c}} \ \text{sinon}
$$

avec 0,8 au lieu de 0,9 au-delà du C50/60 en 2004. La résistance $V_{Rd,c}$ se saisit pour chaque génération : (6.2.a) en 2004, (8.27) ou (8.94) en 2023, voir l’[article 01](tranchant-sans-armature.html).

## L’exemple type : poutre de pont roulant

Armatures inférieures HA16, étendue de contrainte de 72 MPa sous la combinaison de fatigue ; béton C30/37 chargé à 28 jours, fibre supérieure entre 3 et 8 MPa de compression.

```exemple
{
  "nom": "fatigue-ha16",
  "mecanisme": "fatigue-acier",
  "entree": { "type": "non-soudee", "phi": 16, "deltaSigma": 72 },
  "attendus": {
    "ec2-2004/simplifie.resistance": "70",
    "ec2-2004/simplifie.taux": "1,029",
    "ec2-2023/simplifie.resistance": "73",
    "ec2-2023/simplifie.taux": "0,986"
  }
}
```

```exemple
{
  "nom": "fatigue-c30",
  "mecanisme": "fatigue-beton",
  "entree": { "fck": 30, "betaCc": 1, "sigmaMax": 8, "sigmaMin": 3 },
  "attendus": {
    "ec2-2004/simplifie.f_cd_fat": "14,96",
    "ec2-2004/simplifie.resistance": "8,83",
    "ec2-2004/simplifie.taux": "0,906",
    "ec2-2023/simplifie.f_cd_fat": "13,60",
    "ec2-2023/simplifie.resistance": "8,15",
    "ec2-2023/simplifie.taux": "0,981"
  }
}
```

Pour les armatures, le verdict s’inverse : {{fatigue-ha16:ec2-2004/simplifie.taux}} en 2004, refusé, {{fatigue-ha16:ec2-2023/simplifie.taux}} en 2023. Pour le béton, la résistance de fatigue passe de {{fatigue-c30:ec2-2004/simplifie.f_cd_fat}} à {{fatigue-c30:ec2-2023/simplifie.f_cd_fat}} MPa. La compression maximale admise baisse de {{fatigue-c30:ec2-2004/simplifie.resistance}} à {{fatigue-c30:ec2-2023/simplifie.resistance}} MPa, et le taux monte de {{fatigue-c30:ec2-2004/simplifie.taux}} à {{fatigue-c30:ec2-2023/simplifie.taux}}.

La dalle de roulement, sans armature d’âme, voit son effort tranchant changer de signe au passage du pont roulant : de +100 à −30 kN, pour $V_{Rd,c}$ = 200 kN dans les deux générations.

```exemple
{
  "nom": "fatigue-tranchant-alterne",
  "mecanisme": "fatigue-tranchant",
  "entree": { "fck": 30, "vMax": 100, "vMin": -30, "vRdc2004": 200, "vRdc2023": 200 },
  "attendus": {
    "ec2-2004/simplifie.resistance": "70,0",
    "ec2-2023/simplifie.resistance": "70,0",
    "ec2-2023/simplifie.taux": "1,429"
  }
}
```

Le changement de signe coûte cher : l’effort admis tombe à {{fatigue-tranchant-alterne:ec2-2023/simplifie.resistance}} kN, soit un taux de {{fatigue-tranchant-alterne:ec2-2023/simplifie.taux}}. Dans les deux générations, il faudrait épaissir la dalle ou l’armer à l’effort tranchant.

{{calculateur:fatigue-ha16}}

{{calculateur:fatigue-c30}}

{{calculateur:fatigue-tranchant-alterne}}

## L’effet sur une note de calcul existante

- **Petits diamètres** (φ ≤ 12 mm) non soudés : marge nettement accrue, 90 MPa au lieu de 70.
- **Treillis et barres soudés de gros diamètre** : limite abaissée de 35 à 30 MPa.
- **Coupleurs** soumis à la fatigue : 19 MPa, valeur faible qu’il faut désormais justifier explicitement.
- **Béton comprimé** de résistance courante : environ 8 % de compression admise en moins. Pour un béton de plus de 50 MPa, le plafond relevé à 0,9 peut compenser.

## Ce qu’il faudra vérifier

- Le facteur 0,85 et le terme $(1 - f_{ck}/250)$ de (6.76), formule non extraite du texte de 2004 : expression usuelle retenue, à confirmer sur l’exemplaire.
- Les limites de 10.4 dépendent des tableaux E.1 et E.2, paramètres nationaux : une annexe nationale qui les modifie modifie ces limites.
