# Validation : effort tranchant des dalles portant dans deux directions

v_Ed,x = 80 kN/m, v_Ed,y = 60 kN/m, d_x = 190 mm, d_y = 178 mm, A_s,x = 754 mm²/m,
A_s,y = 565 mm²/m, C30/37, B500, D_lower = 16 mm (d_dg = 32 mm).

- v_Ed = √(80² + 60²) = **100 kN/m** (8.21) ; v_y/v_x = 0,75 ; α_v = arctan 0,75 = 36,87° (8.26).
- ρ_l,x = 0,0039684 ; ρ_l,y = 0,0031742 ; cos⁴α_v = 0,4096, sin⁴α_v = 0,1296 :
  ρ_l = 0,0016254 + 0,0004114 = **0,0020368** (8.39).
- Paliers : d = 0,5 (190 + 178) = **184 mm** (8.23) ; τ_Rdc,min = 11/1,4 √(30/434,78 × 32/184) = 0,8607 MPa ;
  τ (8.27) = 0,66/1,4 (100 × 0,0020368 × 30 × 32/184)^(1/3) = 0,4811 MPa < τ_Rdc,min →
  v_Rd,c = 0,8607 × 0,9 × 184 = **142,53 kN/m**.
- Angle : d = 190 × 0,64 + 178 × 0,36 = **185,68 mm** (8.25) ; τ_Rdc,min = 0,8568 MPa → **143,18 kN/m**.
- Première génération : pas de règle équivalente, cellule non applicable.
