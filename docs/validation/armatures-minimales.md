# Validation : armatures minimales

Calcul indépendant (Python).

| | Dalle 1000 × 200, d = 172, C25/30 | Poutre 300 × 600, d = 550, C30/37 |
|---|---|---|
| f_ctm | 2,565 MPa | 2,896 MPa |
| Non-fragilité 2004 : max(0,26 f_ctm/f_yk b d ; 0,0013 b d) | 229,4 mm² | 248,5 mm² |
| M_cr = f_ctm b h²/6 | 17,10 kN·m | 52,14 kN·m |
| 2023, z = 0,9 d | 17,10 × 10⁶ / (500 × 154,8) = 220,9 mm² | 210,7 mm² |
| 2023, z d’équilibre (A_s f_yk d − (A_s f_yk)²/(2 b f_ck) = M_cr) | 201,2 mm² | 191,4 mm² |
| Fissuration 2004 : 0,4 k f_ctm (b h/2) / f_yk | k = 1 → 205,2 mm² | k = 0,79 → 164,8 mm² |
| Fissuration 2023 : 0,2 k_h f_ctm b h / f_yk | k_h = 0,8 → 164,2 mm² | k_h = 0,8 → 166,8 mm² |
