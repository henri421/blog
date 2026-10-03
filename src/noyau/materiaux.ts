/**
 * Proprietes des materiaux et coefficients partiels, valeurs recommandees des
 * deux generations (aucune annexe nationale).
 *
 * Unites : MPa, mm.
 */

/** Module d elasticite de l acier de beton arme, identique dans les deux generations. */
export const ES = 200000;

// ---------------------------------------------------------------------------
// Premiere generation : EN 1992-1-1:2004 + A1:2014
// ---------------------------------------------------------------------------

export const GAMMA_C_2004 = 1.5;
export const GAMMA_S_2004 = 1.15;

/** fcd = alpha_cc fck / gamma_c, alpha_cc = 1,0 recommande (3.1.6(1)). */
export function fcd2004(fck: number): number {
  positif(fck, 'fck', 'MPa');
  return fck / GAMMA_C_2004;
}

/** fctm du tableau 3.1 : 0,30 fck^(2/3) jusqu a C50/60, 2,12 ln(1 + fcm/10) au-dela. */
export function fctm2004(fck: number): number {
  positif(fck, 'fck', 'MPa');
  return fck <= 50 ? 0.3 * fck ** (2 / 3) : 2.12 * Math.log(1 + (fck + 8) / 10);
}

/** Ecm du tableau 3.1 : 22 000 (fcm/10)^0,3, fcm = fck + 8. */
export function ecm2004(fck: number): number {
  positif(fck, 'fck', 'MPa');
  return 22000 * ((fck + 8) / 10) ** 0.3;
}

// ---------------------------------------------------------------------------
// Deuxieme generation : EN 1992-1-1:2023
// ---------------------------------------------------------------------------

export const GAMMA_C_2023 = 1.5;
export const GAMMA_S_2023 = 1.15;
/** Coefficient partiel propre a l effort tranchant et au poinconnement (4.3.3). */
export const GAMMA_V_2023 = 1.4;
/**
 * k_tc pour une mise en charge avant 90 jours (5.1.6, valeur recommandee 0,85).
 * Choix de l outil : c est le cas courant d un batiment ; la valeur 1,0 d une
 * mise en charge tardive n est pas proposee en version 1.
 */
export const K_TC_2023 = 0.85;

/** eta_cc = (fck,ref / fck)^(1/3) <= 1, fck,ref = 40 MPa (5.1.6). */
export function etaCc2023(fck: number): number {
  positif(fck, 'fck', 'MPa');
  return Math.min((40 / fck) ** (1 / 3), 1);
}

/** fcd = eta_cc k_tc fck / gamma_C (5.1.6). */
export function fcd2023(fck: number): number {
  return (etaCc2023(fck) * K_TC_2023 * fck) / GAMMA_C_2023;
}

/** fctm du tableau 5.1 : 0,30 fck^(2/3) jusqu a 50 MPa, 1,1 fck^(1/3) au-dela. */
export function fctm2023(fck: number): number {
  positif(fck, 'fck', 'MPa');
  return fck <= 50 ? 0.3 * fck ** (2 / 3) : 1.1 * fck ** (1 / 3);
}

/** Ecm = k_E fcm^(1/3), k_E = 9500 (granulats quartzitiques), fcm = fck + 8 (5.1.4). */
export function ecm2023(fck: number): number {
  positif(fck, 'fck', 'MPa');
  return 9500 * (fck + 8) ** (1 / 3);
}

/**
 * Parametre de rugosite de la zone de rupture d_dg (8.2.1, note de (8.20)).
 *
 * d_dg = 16 + D_lower <= 40 mm pour fck <= 60 MPa ;
 * d_dg = 16 + D_lower (60/fck)^2 <= 40 mm au-dela : la fissure traverse alors
 * les granulats et sa rugosite decroit avec la resistance.
 */
export function ddg2023(fck: number, dLower: number): number {
  positif(fck, 'fck', 'MPa');
  positif(dLower, 'D_lower', 'mm');
  return fck <= 60 ? Math.min(16 + dLower, 40) : Math.min(16 + dLower * (60 / fck) ** 2, 40);
}

/** Leve une erreur nommant la grandeur si elle n est pas strictement positive. */
export function positif(valeur: number, nom: string, unite: string): void {
  if (!(Number.isFinite(valeur) && valeur > 0)) {
    throw new Error(`${nom} doit etre un nombre strictement positif (${unite}).`);
  }
}
