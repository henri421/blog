---
titre: Armatures minimales de flexion et de fissuration
ordre: 11
statut: publie
texte: EN 1992-1-1:2023 (NBN, version française), sans amendement ni corrigendum pris en compte ; expressions vérifiées sur le texte le 2026-10-04 ; état d’amendement non encore vérifié auprès de l’ILNAS.
redige: 2026-10-04
revise: 2026-10-04
resume: L’armature de non-fragilité découle désormais d’un principe, le moment résistant au moins égal au moment de fissuration, et le coefficient d’épaisseur de l’armature de fissuration se règle sur la plus petite dimension de la section.
motscles: armatures-minimales, fissuration, dispositions-constructives
historique:
  - 2026-10-04 : première rédaction.
---

## Ce qui change

L’armature minimale de non-fragilité n’est plus une formule empirique en $0.26\,f_{ctm}/f_{yk}$ : la deuxième génération énonce le principe dont elle découlait, un moment résistant au moins égal au moment de fissuration. L’armature minimale de maîtrise de la fissuration garde sa forme, mais son coefficient d’effet d’échelle se règle sur la plus petite dimension de la section et plafonne à 0,8, ce qui la réduit pour les dalles minces.

## Pourquoi

Deux exigences distinctes portent le même nom d’armature minimale.

La **non-fragilité** demande qu’à l’apparition de la première fissure, l’acier reprenne l’effort que libère le béton tendu : sinon, la section casse d’un coup. La première génération en donnait une traduction forfaitaire, valable pour une section rectangulaire usuelle. La deuxième génération écrit le principe lui-même, $M_{R,min} \ge M_{cr}$ (12.1), qui s’applique à toute forme de section et à tout effort normal.

La **maîtrise de la fissuration** demande assez d’acier pour que les fissures se répartissent au lieu de se concentrer en une seule. Elle s’écrit dans les deux générations comme l’équilibre entre l’effort de traction du béton juste avant fissuration et l’acier à sa limite d’élasticité. Le coefficient qui réduit cet effort dans les sections épaisses, où les contraintes auto-équilibrées abaissent la résistance apparente, change de définition.

## Le calcul dans les deux générations

Non-fragilité :

$$
A_{s,min} = \max\left(0.26\,\frac{f_{ctm}}{f_{yk}}\,b\,d \; ; \; 0.0013\,b\,d\right) \quad \text{(2004)}, \qquad M_{R,min} \ge M_{cr} = \frac{f_{ctm}\,b\,h^2}{6} \quad \text{(2023)}
$$

Le moment résistant $M_{R,min}$ se calcule avec l’acier à $f_{yk}$. Le calculateur propose deux bras de levier : 0,9 $d$, forfaitaire, et le bras de levier d’équilibre, obtenu avec un bloc rectangulaire sur $f_{ck}$.

Maîtrise de la fissuration, flexion simple d’une section rectangulaire :

$$
A_{s,min} = \frac{0.4\,k\,f_{ct,eff}\,b\,h/2}{f_{yk}} \quad \text{(2004)}, \qquad A_{s,min} = \frac{0.2\,k_h\,f_{ct,eff}\,b\,h}{f_{yk}} \quad \text{(2023)}
$$

Les deux expressions coïncident à $k = k_h$ près. En 2004, $k$ vaut 1 jusqu’à 300 mm de hauteur et 0,65 au-delà de 800 mm. En 2023, $k_h = 0.8 - 0.6\,(\min(b ; h) - 0.3)$, en mètres, est borné entre 0,5 et 0,8 (9.5) : il ne dépasse jamais 0,8.

L’armature minimale d’effort tranchant garde la même expression, $\rho_{w,min} = 0.08\,\sqrt{f_{ck}}/f_{yk}$ (12.4), mais la deuxième génération permet de la réduire de 10 % pour un acier de ductilité B et de 20 % pour un acier de ductilité C.

## L’exemple type : dalle de logement

Dalle de 20 cm, $d$ = 172 mm, C25/30, B500, HA12 tous les 20 cm (565 mm²/m).

```exemple
{
  "nom": "dalle-nf",
  "mecanisme": "non-fragilite",
  "entree": { "b": 1000, "h": 200, "d": 172, "fck": 25, "fyk": 500, "As": 565 },
  "attendus": {
    "ec2-2004/base.sollicitation": "229",
    "ec2-2023/z-forfaitaire.M_cr": "17,1",
    "ec2-2023/z-forfaitaire.sollicitation": "221",
    "ec2-2023/z-equilibre.sollicitation": "201"
  }
}
```

**Non-fragilité.** 2004 : {{dalle-nf:ec2-2004/base.sollicitation}} mm²/m. 2023 : avec $M_{cr}$ = {{dalle-nf:ec2-2023/z-forfaitaire.M_cr}} kN·m, {{dalle-nf:ec2-2023/z-forfaitaire.sollicitation}} mm²/m au bras de levier forfaitaire et {{dalle-nf:ec2-2023/z-equilibre.sollicitation}} mm²/m au bras de levier d’équilibre. Avec le bras de levier forfaitaire, le principe de 2023 retrouve la formule de 2004 à quelques pour cent près pour une section rectangulaire ; avec le bras de levier d’équilibre, il donne environ 12 % de moins. Sa portée tient surtout à ce qu’il s’applique aussi aux sections en T, creuses ou comprimées.

{{calculateur:dalle-nf}}

```exemple
{
  "nom": "dalle-fm",
  "mecanisme": "fissuration-minimale",
  "entree": { "b": 1000, "h": 200, "d": 172, "fck": 25, "fyk": 500, "As": 565 },
  "attendus": {
    "ec2-2004/base.k": "1,00",
    "ec2-2004/base.sollicitation": "205",
    "ec2-2023/base.k_h": "0,80",
    "ec2-2023/base.sollicitation": "164"
  }
}
```

**Maîtrise de la fissuration.** Pour cette dalle mince, $k$ = {{dalle-fm:ec2-2004/base.k}} en 2004 mais $k_h$ = {{dalle-fm:ec2-2023/base.k_h}} en 2023 : {{dalle-fm:ec2-2004/base.sollicitation}} contre {{dalle-fm:ec2-2023/base.sollicitation}} mm²/m. Pour une poutre de 30 × 60 cm, l’écart disparaît (le calculateur le montre en saisissant la section) : c’est la largeur de 30 cm qui fixe $k_h$, alors que la hauteur de 60 cm fixait $k$.

{{calculateur:dalle-fm}}

## L’effet sur une note de calcul existante

- La non-fragilité se vérifie désormais par un **moment** ; pour les sections non rectangulaires ou soumises à un effort normal, la formule de 2004 n’a plus d’équivalent direct et la vérification doit être refaite.
- Pour les **dalles minces**, l’armature minimale de fissuration baisse d’environ 20 % ; pour les éléments épais, $k_h$ descend jusqu’à 0,5 selon la plus petite dimension, et non plus selon la hauteur.
- L’armature minimale d’**effort tranchant** peut être réduite selon la ductilité de l’acier, à condition que celle-ci soit spécifiée.

## Ce qu’il faudra vérifier dans l’annexe nationale

- Les valeurs du tableau 12.1 (armatures des poutres) et les exigences de 12.2 que l’annexe nationale modifierait.
- Les limites d’ouverture de fissure qui conditionnent l’usage de l’armature minimale de fissuration (tableaux 9.1 et 9.2).
