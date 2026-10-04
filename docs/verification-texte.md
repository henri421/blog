# Points à vérifier dans le texte détenu (EN 1992-1-1:2023)

Expressions de deuxième génération retenues pour le code, avec leur source
d'appoint. Chaque ligne est à confirmer sur le texte avant publication de
l'article concerné (CDC §2). Sources : PR ouvertes de `fib-international/structuralcodes`
(n° 121 tranchant, 123 poinçonnement, 134 ancrages, 254 fissuration), et
Gołdyn & Michalak, *Archives of Civil Engineering* LXXI/3 (2025).

## Première génération (EN 1992-1-1:2004 + A1:2014)
- [ ] v_Rd,max = 0,4 ν fcd au nu du poteau (6.4.5(3), valeur recommandée retenue).

## Matériaux
- [ ] fcd = η_cc k_tc fck / γ_C, η_cc = (40/fck)^(1/3) ≤ 1, k_tc = 0,85 (mise en charge avant 90 j).
- [ ] fctm = 1,1 fck^(1/3) au-delà de 50 MPa ; Ecm = 9500 fcm^(1/3).
- [ ] γ_V = 1,4.
- [ ] d_dg = 16 + D_lower ≤ 40 (fck ≤ 60) ; 16 + D_lower (60/fck)² ≤ 40 au-delà. Exposant 2 confirmé par deux sources.

## Effort tranchant sans armature (8.2.1, 8.2.2)
- [ ] τ_Ed = V_Ed / (b_w z), z = 0,9 d.
- [ ] τ_Rdc,min = (11/γ_V) √(fck/fyd · d_dg/d) (8.20).
- [ ] τ_Rd,c = (0,66/γ_V)(100 ρ_l fck d_dg/d)^(1/3) ≥ τ_Rdc,min (8.27) ; pas de plafond de ρ_l.
- [ ] a_v = √(a_cs d/4), a_cs = |M_Ed/V_Ed| ≥ d (8.29), (8.30) : d remplacé par a_v.
  **À trancher** : le remplacement est-il facultatif même quand a_v > d (niveau 3 moins favorable que le niveau 2) ?

## Effort tranchant avec armature (8.2.3)
- [ ] τ_Rd = min(ρ_w fywd cotθ ; ν fcd cotθ/(1+cot²θ)), 1 ≤ cotθ ≤ 2,5 sans effort normal.
- [ ] ν = 0,5 (simplifié).
- [ ] ν = 1/(1 + 110(ε_x + (ε_x + 0,001) cot²θ)) ≤ 1 (8.45), ε_x = (ε_xt + ε_xc)/2,
  F_td = M_Ed/z + V_Ed cotθ/2. Choix de l'outil : ε_xc négligé (sécuritaire).

## Poinçonnement (8.4), poteau intérieur
- [ ] β_e = 1,15 (tableau 8.3).
- [ ] b_0,5 à d_v/2 du nu ; τ_Ed = β_e V_Ed /(b_0,5 d_v).
- [ ] k_pb = 3,6 √(1 − b_0/b_0,5) ≤ 2,5 (racine confirmée par l'article ; **la PR fib l'omet**). Borne inférieure 1,0 à confirmer.
- [ ] τ_Rd,c = (0,6/γ_V) k_pb (100 ρ_l fck d_dg/d_v)^(1/3) ≤ (0,5/γ_V)√fck, ρ_l = √(ρ_x ρ_y).
- [ ] Niveau affiné : d_v remplacé par a_pd = √(a_p d_v/8), a_p = √(a_px a_py) ≥ d_v.

## Fissuration (9.2)
- [ ] w_k,cal = k_w k_1/r s_r,m,cal (ε_sm − ε_cm), k_w = 1,3 ; k_1/r = (h − x)/(h − a_y − x).
- [ ] s_r,m,cal = 1,5 c + k_fl k_b/7,2 · φ/ρ_eff ≤ 1,3(h − x)/k_w ; **k_b = 0,9** (bonne adhérence) à confirmer.
- [ ] k_fl = 0,5(1 + (h − x_g − h_c,eff)/(h − x_g)) ≥ 0,5.
- [ ] h_c,eff = min(a_y + 5φ ; 10φ ; 3,5 a_y ; h − x ; h/2) ; b_c,eff réduit si espacement > 10φ.

## Ancrage et recouvrement (11.4, 11.5)
- [ ] l_bd = 50 k_cp φ (σ_sd/435)^1,5 (25/fck)^0,5 (φ/20)^(1/3) (1,5φ/c_d)^0,5 ≥ 10φ ; k_cp = 1,0 / 1,2.
- [ ] Bornes : φ/20 ≥ 0,6 ? c_d ≤ 3,75φ ? plafond de fck ? (la PR fib est confuse sur ces trois points).
- [ ] l_sd = k_ls l_bd ≥ 15φ, k_ls = 1,2.
