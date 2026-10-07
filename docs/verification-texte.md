# Vérification des expressions sur le texte (EN 1992-1-1:2023)

Vérification faite le 2026-10-04 sur la NBN EN 1992-1-1:2023 (version
française) détenue par l'auteur, texte non amendé. Chaque ligne indique le
renvoi lu et, le cas échéant, la correction apportée au code. Aucun extrait du
texte n'est conservé dans le dépôt.

Les sources d'appoint utilisées avant cette vérification (PR ouvertes de
`fib-international/structuralcodes`, Gołdyn & Michalak 2025) se sont révélées
fausses sur trois points, signalés ci-dessous.

## Première génération (EN 1992-1-1:2004, corrigendum 2010 intégré, + A1:2014)

Vérifiée le 2026-10-04 sur l'EN 1992-1-1:2004 (version anglaise, repères du
corrigendum de 2010) et sur l'amendement NBN EN 1992-1-1/A1:2014.

- [x] fcd = α_cc fck/γ_c, α_cc = 1,0 ; fctd = α_ct fctk,0,05/γ_c, α_ct = 1,0 (3.1.6).
- [x] fctm, fctk,0,05 = 0,7 fctm, Ecm = 22 (fcm/10)^0,3 (tableau 3.1).
- [x] Enrobage : (4.1), (4.2), c_min,b = φ (+5 mm au-delà de 32 mm), Δc_dur,γ =
  Δc_dur,st = Δc_dur,add = 0, Δc_dev = 10 mm (4.4.1).
- [x] **Corrigé** : la couche d'abrasion augmente c_min (4.4.1.2(13)) ; elle
  était placée dans le max avec c_min,dur.
- [x] Effort tranchant : (6.2.a), (6.2.b), (6.3N), C_Rd,c = 0,18/γ_c, k ≤ 2,
  ρ_l ≤ 0,02 ; 1 ≤ cot θ ≤ 2,5 (6.7N), (6.8), (6.9), ν_1 = ν (6.6N), α_cw = 1.
- [x] Poinçonnement : (6.47), C_Rd,c, v_min, k_1 = 0,1 ; v_Rd,max = **0,4** ν fcd
  (6.4.5(3), note introduite par le corrigendum). Le dépôt `poinconnement`
  retient encore 0,5.
- [x] A1:2014 : ne touche aucune formule codée ici (poinçonnement avec
  armatures, précontrainte, béton non armé, annexe H).
- [x] Fissuration : (7.8), (7.9), (7.11), k_1 = 0,8, k_2 = 0,5, k_3 = 3,4,
  k_4 = 0,425, espacement ≤ 5(c + φ/2), (7.14) ; h_c,ef (7.3.2(3)).
- [x] **Corrigé** : le plancher de (7.9) vaut 0,6 σ_s/E_s quelle que soit la
  durée ; il était codé (1 − k_t), faux en courte durée.
- [x] Ancrage : (8.2) avec plafond C60/75, η_1, η_2, (8.3), (8.4), α_2 et
  c_d (tableau 8.2, figure 8.3), l_b,min (8.6).
- [x] Recouvrement : (8.10), l_0,min (8.11), α_6 = (ρ_1/25)^0,5 ∈ [1 ; 1,5].

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

## Redistribution des moments (7.3.2 ; 5.5)

- [x] δ_M ≥ 1/(1 + 0,7 ε_cu E_s/f_yd) + x_u/d (7.16) : relu sur l’exemplaire
  fourni par l’utilisateur le 2026-10-04 (l’extraction ne rendait pas la fraction).
- [x] Bornes ≥ 0,7 (classes B, C) et ≥ 0,8 (classe A), tableau 5.5 ; portées
  adjacentes dans un rapport de 0,5 à 2 ; flexion dominante (7.3.2(3)).
- [x] Précontrainte : f_yd remplacé par (7.17) ; non codé.
- [x] 2004 : k1 = 0,44, k3 = 0,54, k2 = k4 = 1,25 (0,6 + 0,0014/ε_cu2), k5 = 0,7,
  k6 = 0,8 (5.5(4), note).
- [ ] Vérification explicite de la rotation (7.18) à (7.24) : non codée, article
  à venir.

## Effort tranchant sans armature, effort normal (8.2.2(4) et (5) ; 6.2.2(1))

- [x] Convention de signe de 3.10 : traction positive.
- [x] k_vp = 1 + N_Ed/|V_Ed| · d/(3 a_cs) ≥ 0,1 (8.31), multiplie d dans (8.27)
  ou a_v dans (8.29) ; ρ_l reste celui de (8.28).
- [ ] Le symbole devant « /3 » dans (8.31) et (8.34) est perdu à l’extraction ;
  lu « d » par élimination (seule lecture homogène), à confirmer.
- [x] Compression : τ_Rdc,min ≤ τ_Rdc,0 − k_1 σ_cp ≤ τ_Rdc,max (8.32),
  τ_Rdc,0 = (8.27) sans plancher (8.33), σ_cp = N_Ed/A_c,
  k_1 = 0,5 a_cs,0/(e_p + d/3) · A_c/(b_w d) ≤ 0,18 A_c/(b_w d) (8.34, NOTE),
  τ_Rdc,max = 2,15 τ_Rdc,0 (a_cs,0/d)^(1/6) ≤ 2,7 τ_Rdc,0 (8.35).
- [x] 2004 : terme k_1 σ_cp, k_1 = 0,15, σ_cp = N_Ed/A_c < 0,2 f_cd, compression
  positive ; l’outil plafonne σ_cp à 0,2 f_cd.

## Effort tranchant sans armature, annexe I.8.3.1

- [x] τ_Rd,c = 0,33/γ_V · γ_def^(2/3)/γ_V² · √f_ck / (1 + 24 γ_def ε_v d/d_dg) (I.7) :
  relu sur l’exemplaire fourni par l’utilisateur le 2026-10-05.
- [x] γ_def = 1,33 recommandé (NOTE) ; ε_v selon les hypothèses de 8.1.1 (I.8.3.1(2)).
- [x] k_vd = 1,35 (100 ρ_l d_dg/d)^(1/10) ≤ 1,0 (I.8), éléments linéaires de
  d > 500 mm : relu sur l’exemplaire le 2026-10-05 (capture de l’utilisateur).
- [ ] k_vd multiplie « la résistance selon (8.27) » : l’outil l’applique à la
  valeur de la formule et conserve le plancher τ_Rdc,min ; à confirmer.

## Ancrage et recouvrement (11.4.2, 11.5.2)

- [x] l_bd = k_lb k_cp φ (σ_sd/435)^n_σ (25/fck)^(1/2) (φ/20)^(1/3) (1,5 φ/c_d)^(1/2) ≥ 10 φ
  (11.3), k_lb = 50, n_σ = 3/2.
- [x] Bornes φ/20 ≥ 0,6 et 25/fck ≥ 0,3 ; c_d = min(0,5 c_s ; c_x ; c_y ; 3,75 φ)
  (11.4.2(3), figure 11.3). Domaine de l'outil étendu à 90 MPa.
- [x] k_cp = 1,0 en bonne adhérence, 1,2 sinon (11.4.2(3)).
- [x] l_sd = k_ls l_bd ≥ 15 φ, k_ls = 1,2 (11.5.2(2), tableau 11.3) ; 100 % de
  barres recouvertes admis hors rotules plastiques (11.5.2(4)).

## Espacement et paquets de barres (11.2, 11.4.3, 11.5.3)

- [x] Barres isolées : c_s ≥ max(φ ; D_upper + 5 mm ; 20 mm) (11.2(2)).
- [x] Paquets : au plus 3 barres, 4 pour des barres verticales comprimées et
  dans un recouvrement ; chaque barre d'un paquet de 3 ou 4 en contact avec au
  moins deux autres (11.2(3)).
- [x] φ_b = √(4 A_s/π) (11.6), A_s aire totale du paquet (11.4.3(1)) ; aucun
  plafond relevé (le 55 mm de (8.14) n'apparaît pas).
- [ ] Distance libre entre paquets : 11.2(3) ne cite que φ_b ; l'outil n'y
  ajoute ni D_upper + 5 mm ni 20 mm. Lecture à confirmer.
- [x] Recouvrement : paquets de 2 barres sans décalage avec φ_b ; 3 barres
  seulement décalées d'au moins 0,3 l_sd ou avec barre supplémentaire, longueur
  avec φ ; 4 barres interdites (11.5.3).
- [x] 2004 : c_s ≥ max(k_1 φ ; d_g + k_2 ; 20 mm), k_1 = 1, k_2 = 5 mm (8.2(2)) ;
  φ_n remplace φ pour un paquet (8.9.1(3)).
- [ ] 2004 : φ_n = φ √n_b ≤ 55 mm (8.14) : formule non extraite (image),
  expression usuelle retenue, à confirmer sur l'exemplaire.

## Ancrage par barres transversales soudées et par boucles (11.4.5, 11.4.6)

- [x] 2023 barres soudées : l_bd de 11.4.2 réduite de 15 φ, l_bd ≥ 5 φ ; une
  barre si φ_t ≥ 0,6 φ ; sinon deux barres, 50 mm ≤ s ≤ 100 mm, φ ≤ 16 mm
  (11.4.5(1)). Le texte écrit « ≥ 0,6 φ » et « ≤ 0,6 φ » : l'égalité est
  rattachée au cas d'une barre.
- [x] 2023 boucles : réduction de 20 φ, l_bd ≥ 10 φ, mandrin minimal
  (11.4.6(2)) ; boucle en traction pure conforme à 11.3 ancrée sans longueur
  (11.4.6(1)), non codé.
- [x] 2004 : α_4 = 0,7 pour une barre soudée φ_t > 0,6 φ sur l_bd (8.4.4,
  tableau 8.2, figure 8.1 e)) ; α_1 = 0,7 si c_d > 3 φ et α_2 non droit pour une
  boucle, c_d = c (figure 8.3 c)) ; (α_2 α_3 α_5) ≥ 0,7 (8.5).
- [ ] 2004 : c de la figure 8.3 c) pris égal à l'enrobage perpendiculaire au
  plan de la boucle (lecture du dessin à confirmer).

## Ancrage par tête d'ancrage (11.4.7)

- [x] Règle de moyens (11.4.7(1)) : σ_sd = 435 MPa sans longueur
  supplémentaire si φ_h ≥ 3 φ, f_ck ≥ 25 MPa, φ ≤ 25 mm, d_dg ≥ 32 mm,
  a_y ≥ 3 φ (non fissuré) ou 4 φ (fissuré), a_x ≥ 2 a_y + 1,2 φ_h,
  s_x ≥ 4 a_y ; φ_h ≤ 4 t_h ; a_x et a_y permutés si a_x < a_y ;
  φ_h = 2 √(A_h/π) (11.7).
- [ ] (11.8) : contrainte développée par la tête, structure lue
  k_h,A f_cd + κ_part √f_ck/γ_C (a_d/φ)(φ_h/φ)^(5/6)(d_dg/φ)^(1/3), plafond
  illisible ; k_h,A = (φ_h/φ)² − 1 (11.9) ; κ_part = 11,0 (non fissuré) ou
  8,0 (fissuré) ; (11.10) illisible. Non codé.
- [x] (11.11) : l_bd = 1,1 (l_bd(σ_sd) − l_bd(σ'_sd)).

## Diamètre des mandrins (11.3)

- [x] φ_mand,min = 4 φ (φ ≤ 16 mm), 7 φ (φ > 16 mm), barres non soudées ou
  soudures à au moins 3 φ de la courbure (11.3(2)) ; mêmes valeurs que le
  tableau 8.1N a) de 2004.
- [x] Dispenses (11.3(3)) sous f_yd ≤ 25 f_cd et γ_C ≤ 1,5 : cadres selon
  12.3.3 ; crochets et coudes standard (figure 11.6) avec ≤ 5 φ d'ancrage
  au-delà de la courbure, c_x ≥ 1,5 φ, c_s ≥ 3 φ ; coudes ≤ 45° avec
  c_x ≥ 2,5 φ, c_s ≥ 5 φ, segments droits ≥ 4 φ, f_yk ≤ 500, f_ck ≥ 25.
- [ ] (11.1) : lecture σ_sd ≤ 0,65 f_cd φ_mand/φ + √f_ck/γ_C (d_dg/φ)^(1/3)
  (c_d/φ + 1/2)(k_bend + 0,7 φ_mand/φ), k_bend = 32 (45°/α_bend) ; somme ou
  produit à confirmer (question 10). (11.2) k_trans également. Non codés.
- [x] 2004 (8.1) : φ_m,min ≥ F_bt (1/a_b + 1/(2 φ))/f_cd, f_cd au plus celle
  du C55/67 ; dispense de 8.3(3).

## Fatigue, vérifications simplifiées (10.4 à 10.6)

- [x] 10.4(1) a) : 90 / 73 MPa (non soudées, φ ≤ / > 12 mm), 40 / 30 MPa
  (soudées bout à bout et par points), 19 MPa (coupleurs), 10⁸ cycles ; NOTE :
  valeurs de calcul tirées des tableaux E.1 et E.2 (NDP), γ_S = 1,15.
- [x] (10.4) : |σ_cd,max|/f_cd,fat ≤ 0,5 + 0,45 |σ_cd,min|/f_cd,fat ≤ 0,90 ;
  (10.5) f_cd,fat = β_cc(t_0) f_ck/γ_C k_tc η_cc,fat, η_cc,fat = min(0,85 η_cc ; 0,8).
- [x] (10.6), (10.7) : en contraintes τ, plafond 0,90 ; τ_Rd,c selon (8.27) ou (8.94).
- [x] 2004 6.8.6(1) : k_1 = 70 MPa, k_2 = 35 MPa (recommandées) ; (6.77) plafond
  0,9 (f_ck ≤ 50) ou 0,8, σ_c,min de traction prise nulle ; (6.78), (6.79).
- [ ] 2004 (6.76) : f_cd,fat = k_1 β_cc(t_0) f_cd (1 − f_ck/250), k_1 = 0,85 :
  formule non extraite (image), expression usuelle retenue.

## Béton non armé (14 ; 12)

- [x] f_cd,pl = k_c,pl f_cd (14.1), f_ctd,pl = k_t,pl f_ctd (14.2), k = 0,8 (NOTE) ;
  f_ctd = k_tt f_ctk;0.05/γ_C (5.5), k_tt = 0,80 pour t_ref ≤ 28 j (CN, CR).
- [x] N_Rd = f_cd,pl b h (1 − 2e/h) (14.3).
- [x] σ_cp = |N_Ed|/A_cc (14.4), τ_cp = 1,5 V_Ed/A_cc (14.5) ; (14.6), (14.7), (14.8).
- [x] 0,85 h_F/a_F ≥ √(3 σ_gd/f_ctd,pl) (14.13) ; h_F/a_F ≥ 2 (14.14).
- [x] 2004 : (12.1), (12.2) avec η de 3.1.7(3), (12.3) à (12.7) (k = 1,5), (12.13), (12.14).
- [ ] (14.11), facteur Φ des voiles élancés : structure illisible à l'extraction ;
  non codé (ni (12.11) de 2004, par symétrie).

## Appuis des éléments préfabriqués (12.10, 13.7.2 ; 10.9.5)

- [x] 12.10(5) : profondeur nominale « en tenant compte » de a_1, des
  mouvements, des distances inefficaces et des tolérances Δa_2, Δa_3, sans
  expression de combinaison ni tableau relevés ; d_i = c_h,i + Δa_i (+ r_i).
- [x] 12.10(7) : f_Rd = 0,4 f_cd (joints secs) (12.13), f_Rd = f_bed ≤ 0,85 f_cd (12.14).
- [x] 13.7.2 : renvoi à 12.10 ; élément isolé, longueur nette majorée pour les
  mouvements et la rotation, sans supplément forfaitaire relevé.
- [x] 2004 : a = a_1 + a_2 + a_3 + √(Δa_2² + Δa_3²) (10.6), a_1 = F_Ed/(b_1 f_Rd)
  au moins le tableau 10.2, Δa_3 = l_n/2500 ; + 20 mm élément isolé (10.9.5.3(1)).

## Pré-tension (13.5.3, 13.5.4 ; 8.10.2)

- [x] (13.4) l_pt = (γ_C/1,5) α_1 α_2 σ_pm0 φ_p/(η_1 √f_ck(t)) ; α_1 = 1,0/1,25 ;
  α_2 = 0,40 fils crantés, 0,26 torons 3 ou 7 fils ; η_1 = 1,0/0,7.
- [x] (13.6), (13.7) l_pt1 = 0,8 l_pt, l_pt2 = 1,2 l_pt ; (13.8) l_disp = √(l_pt² + d²).
- [x] (13.9) l_bpd = l_pt2 + (γ_C/1,5) 2 α_2 α_3 (σ_pd − σ_pm∞)/(η_1 √f_ck) φ_p,
  α_3 = 1,5 sous fatigue.
- [ ] (13.5) f_ck(t) = [β_cc(t)]^(2/3) f_ck : lecture littérale de l'extraction,
  non employée (f_ck(t) saisie).
- [x] 2004 : (8.15) à (8.21), η_p1 = 2,7/3,2, α_2 = 0,25/0,19, η_p2 = 1,4/1,2,
  f_ctd(t) = α_ct 0,7 f_ctm(t)/γ_c, f_ctk,0.05 plafonnée au C60/75 pour l'ancrage.

## Fondations en encuvement (13.8 ; 10.9.6)

- [x] (13.17) l ≥ 1,2 h_col pour M_Ed/N_Ed ≤ 0,15 h_col ; (13.18) l ≥ 2,0 h_col pour
  M_Ed/N_Ed ≥ 2,0 h_col ; interpolation permise ; h_col plus grand côté.
- [x] μ_v du tableau 8.2 ; a ≥ 0,1 l pour F_1 (13.8.3(5)).
- [x] 2004 : l ≥ 1,2 h, μ ≤ 0,3 (10.9.6.3).
