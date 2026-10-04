# Vérification des expressions sur le texte (EN 1992-1-1:2023)

Vérification faite le 2026-10-04 sur la NBN EN 1992-1-1:2023 (version
française) détenue par l'auteur, texte non amendé. Chaque ligne indique le
renvoi lu et, le cas échéant, la correction apportée au code. Aucun extrait du
texte n'est conservé dans le dépôt.

Les sources d'appoint utilisées avant cette vérification (PR ouvertes de
`fib-international/structuralcodes`, Gołdyn & Michalak 2025) se sont révélées
fausses sur trois points, signalés ci-dessous.

## Première génération (EN 1992-1-1:2004 + A1:2014)

- [ ] v_Rd,max = 0,4 ν fcd au nu du poteau (6.4.5(3)) : texte de 2004 non relu
  dans cette passe.

## Matériaux et coefficients partiels

- [x] γ_S = 1,15, γ_C = 1,50, γ_V = 1,40 en situation durable (tableau 4.3).
- [x] fcd = η_cc k_tc fck / γ_C, η_cc = (40/fck)^(1/3) ≤ 1 (5.1.6(1)).
- [x] k_tc = 0,85 si la charge de calcul peut s'appliquer avant 3 mois ; 1,00
  sinon, pour les classes CR et CN (5.1.6(1), NOTE). L'outil retient 0,85.
- [x] fctm = 0,3 fck^(2/3) jusqu'à 50 MPa, 1,1 fck^(1/3) au-delà (tableau 5.1).
- [x] Ecm = k_E fcm^(1/3), k_E = 9500 pour les granulats quartzitiques (5.1.4(2)).
- [x] d_dg = 16 + D_lower ≤ 40 (fck ≤ 60) ; 16 + D_lower (60/fck)² ≤ 40 au-delà
  (8.2.1(4), NOTE 1).
- [x] **Ajouté** : bétons à D_lower < 8 mm hors du domaine de la norme (1.1(3)),
  refusés par l'outil en deuxième génération.

## Effort tranchant sans armature (8.2.1, 8.2.2)

- [x] τ_Ed = V_Ed / (b_w z), z = 0,9 d (8.2.1(3)).
- [x] τ_Rdc,min = (11/γ_V) √(fck/fyd · d_dg/d) (8.20).
- [x] τ_Rd,c = (0,66/γ_V)(100 ρ_l fck d_dg/d)^(1/3) ≥ τ_Rdc,min (8.27), ρ_l = A_sl/(b_w d) (8.28).
- [x] a_v = √(a_cs d / 4), a_cs = |M_Ed/V_Ed| ≥ d ((8.29), (8.30)).
- [x] **Corrigé** : le remplacement de d par a_v n'est permis que si a_cs < 4 d
  (8.2.2(3)). Le niveau 3 est désormais non applicable au-delà ; l'exemple du
  radier, présenté comme non monotone, a été réécrit.
- [ ] Hors périmètre : effort normal (k_vp, (8.31) à (8.35)), précontrainte,
  dalles à deux directions ((8.21) à (8.26), (8.38) à (8.40)).

## Effort tranchant avec armatures (8.2.3)

- [x] τ_Rd,sy = ρ_w f_ywd cot θ (8.42), ρ_w = A_sw/(b_w s) (8.43).
- [x] σ_cd = τ_Ed (cot θ + tan θ) ≤ ν fcd (8.44) ; solution simultanée et
  cot θ = √(ν fcd/(ρ_w f_ywd) − 1) (NOTE de 8.2.3(5)).
- [x] 1 ≤ cot θ ≤ 2,5 sans effort normal, ductilité B ou C ; −20 % en classe A
  (8.2.3(4)). L'outil suppose B ou C et le déclare.
- [x] ν = 0,5 (8.2.3(6)).
- [x] ν = 1/(1 + 110(ε_x + (ε_x + 0,001) cot²θ)) ≤ 1 (8.45), ε_x = (ε_xt + ε_xc)/2 ≥ 0
  (8.46), F_td = M_Ed/z + (N_Vd + N_Ed)/2 (8.51), N_Vd = |V_Ed| cot θ (8.50).
  L'outil néglige ε_xc, ce qui est sécuritaire.
- [x] **Corrigé** : avec ν calculé, cot θ peut dépasser 2,5 (8.2.3(7)).
  L'outil cherche l'optimum jusqu'à cot θ = 10 et signale une non-convergence
  s'il atteint cette borne.

## Poinçonnement (8.4), poteau intérieur

- [x] d_v = (d_vx + d_vy)/2 (8.91) ; b_0,5 à 0,5 d_v du nu, segments droits
  limités à 3 d_v (8.4.2(2), (3)).
- [x] τ_Ed = β_e V_Ed / (b_0,5 d_v) (8.92) ; β_e = 1,15 (tableau 8.3).
- [x] **Ajouté** : conditions d'emploi de β_e approché (8.4.2(6)), déclarées
  dans l'hypothèse du niveau.
- [x] τ_Rd,c = (0,6/γ_V) k_pb (100 ρ_l fck d_dg/d_v)^(1/3) ≤ (0,5/γ_V) √fck (8.94),
  ρ_l = √(ρ_x ρ_y) (8.95).
- [x] k_pb = 3,6 √(1 − b_0/b_0,5), 1 ≤ k_pb ≤ 2,5 (8.96). La racine, absente de
  la PR fib, est confirmée ; la borne inférieure 1 aussi.
- [x] a_pd = √(a_p d_v/8), a_p = √(a_px a_py) ≥ d_v ((8.97), (8.98)).
- [x] **Corrigé** : a_pd n'est permis que si a_p < 8 d_v (8.4.3(2)).
- [x] **Ajouté** : niveau de résistance minimale τ_Ed ≤ τ_Rdc,min au contour
  b_0,5 (8.4.1(2) a), (8.87)).
- [x] a_p ≈ 0,22 L pour un plancher-dalle courant (8.4.3(3)) : règle du texte,
  employée dans l'exemple.

## Fissuration (9.2.3)

- [x] w_k,cal = k_w k_1/r s_r,m,cal (ε_sm − ε_cm) (9.8), k_1/r = (h − x)/(h − a_y − x) (9.9).
- [x] **Corrigé** : k_w = 1,7 (9.2.3(2), NOTE 1), et non 1,3 comme dans la PR fib.
- [x] ε_sm − ε_cm selon (9.11), k_t = 0,4 ou 0,6.
- [x] s_r,m,cal = 1,5 c + k_fl k_b/7,2 · φ/ρ_p,eff ≤ 1,3 (h − x)/k_w (9.15).
- [x] k_fl = (h − h_c,eff)/h en flexion simple d'une section rectangulaire (9.16).
- [x] k_b = 0,9 en bonne adhérence, 1,2 sinon (9.18).
- [x] h_c,eff = min(a_y + 5φ ; 10φ ; 3,5 a_y ; h − x ; h/2) pour un lit (figure 9.3).
- [ ] Largeur b_c,eff réduite pour des barres « isolées » (figure 9.3 b)) : le
  critère d'isolement figure sur un dessin non lisible par extraction ; l'outil
  réduit la largeur à 10 φ par barre au-delà d'un espacement de 10 φ, à
  confirmer sur la figure.
- [x] Limites w_lim,cal (tableaux 9.1 et 9.2) avec k_surf : signalées dans
  l'article, la limite reste une saisie.

## Ancrage et recouvrement (11.4.2, 11.5.2)

- [x] l_bd = k_lb k_cp φ (σ_sd/435)^n_σ (25/fck)^(1/2) (φ/20)^(1/3) (1,5 φ/c_d)^(1/2) ≥ 10 φ
  (11.3), k_lb = 50, n_σ = 3/2.
- [x] Bornes φ/20 ≥ 0,6 et 25/fck ≥ 0,3 ; c_d = min(0,5 c_s ; c_x ; c_y ; 3,75 φ)
  (11.4.2(3), figure 11.3). Domaine de l'outil étendu à 90 MPa.
- [x] k_cp = 1,0 en bonne adhérence, 1,2 sinon (11.4.2(3)).
- [x] l_sd = k_ls l_bd ≥ 15 φ, k_ls = 1,2 (11.5.2(2), tableau 11.3) ; 100 % de
  barres recouvertes admis hors rotules plastiques (11.5.2(4)).
