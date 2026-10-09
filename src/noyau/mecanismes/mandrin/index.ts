/**
 * Diametre minimal des mandrins de cintrage des barres faconnees.
 *
 * Unites : mm, MPa, N pour l effort F_bt.
 *
 * Endommagement de l armature, memes valeurs dans les deux generations :
 *   phi_m,min = 4 phi pour phi <= 16 mm, 7 phi au-dela (tableau 8.1N a),
 *   valeurs recommandees ; 11.3(2), barres non soudees ou soudures a au
 *   moins 3 phi de la courbure).
 * Rupture du beton dans la courbure, premiere generation (8.3(3), (8.1)) :
 *   phi_m,min >= F_bt (1/a_b + 1/(2 phi)) / f_cd, F_bt = sigma_sd A_s,
 *   f_cd plafonnee a celle du C55/67 ; a_b demi-entraxe des barres
 *   perpendiculairement au plan du coude, ou enrobage + phi/2 en rive.
 * Rupture du beton dans la courbure, deuxieme generation (11.3(4), (11.1)) :
 *   sigma_sd <= 0,65 f_cd phi_mand/phi + sqrt(f_ck)/gamma_C (d_dg/phi)^(1/3)
 *   (c_d/phi + 1/2) (k_bend + 0,7 phi_mand/phi), k_bend = 32 (45 deg/alpha_bend) ;
 *   barres transversales dans la courbure (11.3(5), (11.2)) : limite multipliee
 *   par k_trans = 1 + 4 n_trans (phi/phi_mand) (phi_trans/phi)^2 (45 deg/alpha_bend),
 *   phi_trans plafonne a 1,35 phi.
 * Choix de l outil : les dispenses de verification du beton (8.3(3) ;
 *   11.3(3)) sont decrites dans l article, pas evaluees ; f_cd de 2023 avec
 *   k_tc = 0,85 ; les barres soudees et treillis cintres apres soudage
 *   (tableau 8.1N b)) ne sont pas traites.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_C_2023, ddg2023, fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeMandrin {
  phi?: number;
  /** Diametre du mandrin prevu (mm). */
  phiMand?: number;
  fck?: number;
  /** Contrainte de calcul dans la barre au debut du coude (MPa). */
  sigmaSd?: number;
  /** Demi-entraxe perpendiculaire au plan du coude, ou enrobage + phi/2 en rive (mm). */
  ab?: number;
  /** 2023 : min(c_x ; c_s/2), distances libres au bord et entre barres (mm). */
  cd?: number;
  /** Dimension superieure de la plus grosse fraction de granulats (mm). */
  Dlower?: number;
  /** Angle du coude (degres). */
  alphaBend?: number;
  /** Nombre de barres transversales dans la courbure. */
  nTrans?: number;
  /** Diametre des barres transversales (mm). */
  phiTrans?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeMandrin>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  phiMand: { champ: 'phiMand', libelle: 'champ.phiMand' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
  ab: { champ: 'ab', libelle: 'champ.ab-mandrin' },
  cd: { champ: 'cd', libelle: 'champ.cd-mandrin' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
  alphaBend: { champ: 'alphaBend', libelle: 'champ.alphaBend' },
  nTrans: { champ: 'nTrans', libelle: 'champ.nTrans' },
  phiTrans: { champ: 'phiTrans', libelle: 'champ.phiTrans' },
} as const satisfies Record<string, { champ: keyof EntreeMandrin; libelle: Cle }>;

/** Rapport phi_m,min / phi contre l endommagement de l armature. */
export function rapportMandrin(phi: number): number {
  return phi <= 16 ? 4 : 7;
}

export function mandrinDommage(e: Complete, clauses: string[]): Calcul {
  positif(e.phi, 'phi', 'mm');
  positif(e.phiMand, 'phi_mand', 'mm');
  const k = rapportMandrin(e.phi);
  return {
    statut: { etat: 'calcule' },
    sollicitation: k * e.phi,
    resistance: e.phiMand,
    intermediaires: {
      'φ_m,min / φ': recommandee(k, '-'),
      'φ_m,min': calculee(k * e.phi, 'mm'),
      φ_mand: saisie(e.phiMand, 'mm'),
    },
    clauses,
  };
}

export function mandrinBeton2004(e: Complete): Calcul {
  positif(e.phi, 'phi', 'mm');
  positif(e.phiMand, 'phi_mand', 'mm');
  positif(e.sigmaSd, 'sigma_sd', 'MPa');
  positif(e.ab, 'a_b', 'mm');
  const As = (Math.PI * e.phi ** 2) / 4;
  const Fbt = e.sigmaSd * As;
  const fcd = fcd2004(Math.min(e.fck, 55));
  const phim = (Fbt * (1 / e.ab + 1 / (2 * e.phi))) / fcd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: phim,
    resistance: e.phiMand,
    intermediaires: {
      F_bt: calculee(Fbt / 1000, 'kN'),
      f_cd: calculee(fcd, 'MPa'),
      'φ_m,min': calculee(phim, 'mm'),
      φ_mand: saisie(e.phiMand, 'mm'),
    },
    clauses: ['8.3(3)', '(8.1)'],
  };
}

/** (11.1), multipliee par k_trans (11.2) si des barres transversales sont prises en compte. */
export function mandrinBeton2023(e: Complete, transversales: boolean): Calcul {
  positif(e.phi, 'phi', 'mm');
  positif(e.phiMand, 'phi_mand', 'mm');
  positif(e.sigmaSd, 'sigma_sd', 'MPa');
  positif(e.cd, 'c_d', 'mm');
  positif(e.alphaBend, 'alpha_bend', 'degres');
  if (e.alphaBend > 180) throw new Error('alpha_bend doit etre au plus 180 degres.');
  const fcd = fcd2023(e.fck);
  const ddg = ddg2023(e.fck, e.Dlower);
  const kbend = 32 * (45 / e.alphaBend);
  const terme1 = 0.65 * fcd * (e.phiMand / e.phi);
  const terme2 = (Math.sqrt(e.fck) / GAMMA_C_2023) * (ddg / e.phi) ** (1 / 3) * (e.cd / e.phi + 0.5) * (kbend + 0.7 * (e.phiMand / e.phi));
  const limite = terme1 + terme2;
  const inter: Cellule['intermediaires'] = {
    f_cd: calculee(fcd, 'MPa'),
    d_dg: calculee(ddg, 'mm'),
    k_bend: calculee(kbend, '-'),
    '0,65 f_cd φ_mand/φ': calculee(terme1, 'MPa'),
    'terme du béton confiné': calculee(terme2, 'MPa'),
    '(11.1)': calculee(limite, 'MPa'),
  };
  let ktrans = 1;
  if (transversales) {
    if (!(Number.isInteger(e.nTrans) && e.nTrans >= 1)) throw new Error('n_trans doit etre un entier au moins egal a 1.');
    positif(e.phiTrans, 'phi_trans', 'mm');
    const phiT = Math.min(e.phiTrans, 1.35 * e.phi);
    ktrans = 1 + 4 * e.nTrans * (e.phi / e.phiMand) * (phiT / e.phi) ** 2 * (45 / e.alphaBend);
    inter['φ_trans retenu'] = calculee(phiT, 'mm');
    inter.k_trans = calculee(ktrans, '-');
  }
  inter['σ_lim'] = calculee(limite * ktrans, 'MPa');
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.sigmaSd,
    resistance: limite * ktrans,
    intermediaires: inter,
    clauses: transversales ? ['11.3(4)', '(11.1)', '11.3(5)', '(11.2)'] : ['11.3(4)', '(11.1)'],
  };
}

const grandeursContrainte = {
  sollicitation: { libelle: 'grandeur.contrainte-barre-coude', unite: 'MPa' },
  resistance: { libelle: 'grandeur.contrainte-courbure', unite: 'MPa' },
} as const;

const requisesBeton2023 = [R.phi, R.phiMand, R.fck, R.sigmaSd, R.cd, R.Dlower, R.alphaBend];

const niveaux2004: DefinitionNiveau<EntreeMandrin>[] = [
  {
    id: 'dommage',
    ordre: 1,
    position: 'corps',
    clause: '8.3(2)',
    hypothese: 'niveau.man.dommage',
    donneesRequises: [R.phi, R.phiMand],
    conditions: () => null,
    calculer: (e) => mandrinDommage(e as Complete, ['8.3(2)', 'tableau 8.1N a)']),
  },
  {
    id: 'beton',
    ordre: 2,
    position: 'corps',
    clause: '8.3(3)',
    hypothese: 'niveau.man.2004.beton',
    donneesRequises: [R.phi, R.phiMand, R.fck, R.sigmaSd, R.ab],
    conditions: () => null,
    calculer: (e) => mandrinBeton2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeMandrin>[] = [
  {
    id: 'dommage',
    ordre: 1,
    position: 'corps',
    clause: '11.3(2)',
    hypothese: 'niveau.man.dommage',
    donneesRequises: [R.phi, R.phiMand],
    conditions: () => null,
    calculer: (e) => mandrinDommage(e as Complete, ['11.3(2)']),
  },
  {
    id: 'beton',
    ordre: 2,
    position: 'corps',
    clause: '11.3(4)',
    hypothese: 'niveau.man.2023.beton',
    grandeurs: grandeursContrainte,
    donneesRequises: requisesBeton2023,
    conditions: () => null,
    calculer: (e) => mandrinBeton2023(e as Complete, false),
  },
  {
    id: 'beton-trans',
    ordre: 3,
    position: 'corps',
    clause: '11.3(5)',
    hypothese: 'niveau.man.2023.beton-trans',
    grandeurs: grandeursContrainte,
    donneesRequises: [...requisesBeton2023, R.nTrans, R.phiTrans],
    conditions: () => null,
    calculer: (e) => mandrinBeton2023(e as Complete, true),
  },
];

export const mandrin: Mecanisme<EntreeMandrin> = {
  id: 'mandrin',
  version: '0.2.0',
  titre: 'meca.man.titre',
  champs: [
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'phiMand', libelle: 'champ.phiMand', symbole: 'φ_mand', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'sigmaSd', libelle: 'champ.sigmaSd', symbole: 'σ_sd', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'ab', libelle: 'champ.ab-mandrin', symbole: 'a_b', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'cd', libelle: 'champ.cd-mandrin', symbole: 'c_d', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'alphaBend', libelle: 'champ.alphaBend', symbole: 'α_bend', unite: '°', facultatif: true },
    { type: 'nombre', id: 'nTrans', libelle: 'champ.nTrans', symbole: 'n_trans', unite: '-', facultatif: true },
    { type: 'nombre', id: 'phiTrans', libelle: 'champ.phiTrans', symbole: 'φ_trans', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.mandrin-requis', unite: 'mm' },
  resistance: { libelle: 'grandeur.mandrin-prevu', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
