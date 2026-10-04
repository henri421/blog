/**
 * Moment resistant a l ELU d une section rectangulaire a armatures tendues
 * seules, sans effort normal.
 *
 * Unites : mm, MPa, kN.m.
 *
 * Beton :
 *   - 2004 (3.1.7) : parabole-rectangle avec epsilon_c2, epsilon_cu2 et n
 *     fonctions de f_ck au-dela de 50 MPa (tableau 3.1) ; ou bloc
 *     rectangulaire lambda = 0,8 - (fck - 50)/400, eta = 1 - (fck - 50)/200
 *     (3.1.7(3)) ;
 *   - 2023 (8.1.2) : parabole-rectangle unique, epsilon_c2 = 2 pour mille,
 *     epsilon_cu = 3,5 pour mille, exposant 2, sur f_cd (5.1.6). Le bloc
 *     rectangulaire de la figure 8.2 d) n est pas code : ses parametres ne
 *     figurent que sur la figure.
 * Acier : palier horizontal a f_yd, E_s = 200 000 MPa ; si l acier n est pas
 * plastifie a epsilon_cu, sa contrainte est calculee par compatibilite.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { ES, GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeFlexion {
  b?: number;
  d?: number;
  As?: number;
  fck?: number;
  fyk?: number;
  /** Moment de calcul (kN.m). */
  MEd?: number;
  /** 'non' si la charge de calcul peut s appliquer avant 3 mois (k_tc = 0,85). */
  chargeTardive?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFlexion>;
const NMM_PAR_KNM = 1e6;

const R = {
  b: { champ: 'b', libelle: 'champ.b' },
  d: { champ: 'd', libelle: 'champ.d' },
  As: { champ: 'As', libelle: 'champ.As' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  MEd: { champ: 'MEd', libelle: 'champ.MEd-flexion' },
  chargeTardive: { champ: 'chargeTardive', libelle: 'champ.chargeTardive' },
} as const satisfies Record<string, { champ: keyof EntreeFlexion; libelle: Cle }>;

const communs = [R.b, R.d, R.As, R.fck, R.fyk, R.MEd];

function domaine(e: EntreeFlexion): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

export interface Loi {
  /** Raccourcissement au pic (sans unite). */
  ec2: number;
  /** Raccourcissement ultime (sans unite). */
  ecu: number;
  n: number;
}

/** Tableau 3.1 de 2004 : epsilon_c2, epsilon_cu2 et n. */
export function loi2004(fck: number): Loi {
  if (fck <= 50) return { ec2: 0.002, ecu: 0.0035, n: 2 };
  return {
    ec2: (2 + 0.085 * (fck - 50) ** 0.53) / 1000,
    ecu: (2.6 + 35 * ((90 - fck) / 100) ** 4) / 1000,
    n: 1.4 + 23.4 * ((90 - fck) / 100) ** 4,
  };
}

/** Loi unique de 2023 (8.1.2). */
export const LOI_2023: Loi = { ec2: 0.002, ecu: 0.0035, n: 2 };

/**
 * Coefficients de remplissage alpha et de position beta de la resultante
 * d un diagramme parabole-rectangle quand la fibre extreme atteint
 * epsilon_cu : C = alpha b x f_cd, a la distance beta x de la fibre extreme.
 * Integration exacte de la parabole, rectangle en complement.
 */
export function remplissage(loi: Loi): { alpha: number; beta: number } {
  const { ec2, ecu, n } = loi;
  const k = ec2 / ecu; // part de la hauteur comprimee occupee par la parabole
  // Parabole sur u = y / (k x) de 0 (axe neutre) a 1 : sigma = 1 - (1 - u)^n.
  const aireParabole = k * (1 - 1 / (n + 1));
  const momentParabole = k * k * (0.5 - 1 / (n + 1) + 1 / (n + 2)); // par rapport a l axe neutre
  const aireRect = 1 - k;
  const momentRect = (1 - k * k) / 2;
  const alpha = aireParabole + aireRect;
  const brasDepuisAxe = (momentParabole + momentRect) / alpha;
  return { alpha, beta: 1 - brasDepuisAxe };
}

interface Equilibre {
  x: number;
  sigmaS: number;
  epsS: number;
  MRd: number;
}

/**
 * Equilibre A_s sigma_s = alpha b x f_c avec la fibre extreme a epsilon_cu.
 * Si l acier n est pas plastifie, sigma_s = E_s epsilon_cu (d - x)/x et
 * l equation devient du second degre en x.
 */
function equilibre(e: Complete, fc: number, fyd: number, alpha: number, beta: number, ecu: number): Equilibre {
  let x = (e.As * fyd) / (alpha * e.b * fc);
  let epsS = (ecu * (e.d - x)) / x;
  let sigmaS = fyd;
  if (epsS < fyd / ES) {
    // alpha b fc x^2 + A_s E_s ecu x - A_s E_s ecu d = 0
    const A = alpha * e.b * fc;
    const B = e.As * ES * ecu;
    x = (-B + Math.sqrt(B * B + 4 * A * B * e.d)) / (2 * A);
    epsS = (ecu * (e.d - x)) / x;
    sigmaS = ES * epsS;
  }
  return { x, sigmaS, epsS, MRd: (e.As * sigmaS * (e.d - beta * x)) / NMM_PAR_KNM };
}

function verifier(e: Complete): void {
  positif(e.b, 'b', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.As, 'As', 'mm2');
  positif(e.fyk, 'fyk', 'MPa');
  positif(e.MEd, 'MEd', 'kN.m');
}

function cellule(e: Complete, eq: Equilibre, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.MEd,
    resistance: eq.MRd,
    intermediaires: {
      ...inter,
      x: calculee(eq.x, 'mm'),
      'x / d': calculee(eq.x / e.d, '-'),
      'ε_s': calculee(eq.epsS, '-'),
      'σ_s': calculee(eq.sigmaS, 'MPa'),
      M_Rd: calculee(eq.MRd, 'kN·m'),
    },
    clauses,
  };
}

export function flexion2004Parabole(e: Complete): Calcul {
  verifier(e);
  const loi = loi2004(e.fck);
  const { alpha, beta } = remplissage(loi);
  const fcd = fcd2004(e.fck);
  const eq = equilibre(e, fcd, e.fyk / GAMMA_S_2004, alpha, beta, loi.ecu);
  return cellule(
    e,
    eq,
    {
      f_cd: calculee(fcd, 'MPa'),
      'ε_c2': calculee(loi.ec2 * 1000, '‰'),
      'ε_cu2': calculee(loi.ecu * 1000, '‰'),
      n: calculee(loi.n, '-'),
      'α (remplissage)': calculee(alpha, '-'),
      'β (position)': calculee(beta, '-'),
    },
    ['3.1.7(1)', '(3.17)', 'tableau 3.1', '6.1'],
  );
}

export function flexion2004Rectangle(e: Complete): Calcul {
  verifier(e);
  const lambda = e.fck <= 50 ? 0.8 : 0.8 - (e.fck - 50) / 400;
  const eta = e.fck <= 50 ? 1 : 1 - (e.fck - 50) / 200;
  const fcd = fcd2004(e.fck);
  const ecu = loi2004(e.fck).ecu; // epsilon_cu3 = epsilon_cu2 (tableau 3.1)
  const eq = equilibre(e, eta * fcd, e.fyk / GAMMA_S_2004, lambda, lambda / 2, ecu);
  return cellule(
    e,
    eq,
    { f_cd: calculee(fcd, 'MPa'), 'λ': recommandee(lambda, '-'), 'η': recommandee(eta, '-') },
    ['3.1.7(3)', '(3.19)', '(3.21)', '6.1'],
  );
}

export function flexion2023Parabole(e: Complete): Calcul {
  verifier(e);
  const { alpha, beta } = remplissage(LOI_2023);
  const fcd = fcd2023(e.fck) * (e.chargeTardive === 'oui' ? 1 / 0.85 : 1);
  const eq = equilibre(e, fcd, e.fyk / GAMMA_S_2023, alpha, beta, LOI_2023.ecu);
  return cellule(
    e,
    eq,
    { f_cd: calculee(fcd, 'MPa'), 'α (remplissage)': calculee(alpha, '-'), 'β (position)': calculee(beta, '-') },
    ['8.1.2(1)', '(8.4)', '5.1.6'],
  );
}

const niveaux2004: DefinitionNiveau<EntreeFlexion>[] = [
  {
    id: 'rectangle',
    ordre: 1,
    clause: '3.1.7(3)',
    hypothese: 'niveau.flx.2004.rectangle',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => flexion2004Rectangle(e as Complete),
  },
  {
    id: 'parabole',
    ordre: 2,
    clause: '3.1.7(1)',
    hypothese: 'niveau.flx.2004.parabole',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => flexion2004Parabole(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeFlexion>[] = [
  {
    id: 'parabole',
    ordre: 1,
    clause: '8.1.2(1)',
    hypothese: 'niveau.flx.2023.parabole',
    donneesRequises: [...communs, R.chargeTardive],
    domaine,
    conditions: () => null,
    calculer: (e) => flexion2023Parabole(e as Complete),
  },
];

export const flexion: Mecanisme<EntreeFlexion> = {
  id: 'flexion',
  version: '0.1.0',
  titre: 'meca.flx.titre',
  champs: [
    { type: 'nombre', id: 'MEd', libelle: 'champ.MEd-flexion', symbole: 'M_Ed', unite: 'kN·m' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'As', libelle: 'champ.As', symbole: 'A_s', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    {
      type: 'choix',
      id: 'chargeTardive',
      libelle: 'champ.chargeTardive',
      options: [
        { valeur: 'non', libelle: 'option.non' },
        { valeur: 'oui', libelle: 'option.oui' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.moment', unite: 'kN·m' },
  resistance: { libelle: 'grandeur.moment-resistant', unite: 'kN·m' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
