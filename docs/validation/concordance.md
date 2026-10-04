# Concordance de la première génération avec les outils de la suite

Test 7 du cahier des charges. Le code réel des dépôts a été exécuté sur les
données des exemples le 2026-10-04 ; les valeurs rendues sont écrites en dur
dans `tests/concordance/premiere-generation.test.ts` (tolérance relative 10⁻⁶).

| Cas | Outil de la suite | Valeur de l’outil | ec2-2e-generation |
|---|---|---|---|
| Dalle, tranchant sans armature | section-uls 6a7a897 | 97,983006 kN | identique |
| Radier, tranchant sans armature | section-uls 6a7a897 | 287,878855 kN | identique |
| Poutre, cadres HA10/125, cot θ = 2,191181 | section-uls 6a7a897 | 592,304775 kN | identique |
| Poutre, cadres HA8/200, cot θ = 2,5 | section-uls 6a7a897 | 270,366848 kN | identique |
| Plancher-dalle, v_Rd,c | poinconnement ed211ef | 0,59962933 MPa | identique |

## Différences de modèle, sans écart de résultat

- `section-uls` prend cot θ en **entrée** (2,5 par défaut) ; ec2-2e-generation
  cherche l’angle qui maximise la résistance. Les deux coïncident quand on
  donne à `section-uls` l’angle optimal.

## Divergence à trancher

- **v_Rd,max au nu du poteau** (6.4.5(3)) : `poinconnement` retient
  0,5 ν f_cd, ec2-2e-generation 0,4 ν f_cd. La valeur 0,5 est celle de la
  rédaction initiale de 2004 ; la valeur 0,4 est la valeur recommandée
  introduite ensuite par corrigendum. À vérifier sur le texte de 2004 en
  vigueur et sur l’annexe nationale belge, puis à aligner dans l’un des deux
  dépôts. Sans effet sur les exemples publiés : ce plafond n’y gouverne pas
  (870 kN contre 379 kN au contour u_1).
