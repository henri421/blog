/**
 * Effort tranchant hors plan des dalles sans armature d effort tranchant,
 * avec des efforts et des ferraillages differents dans les deux directions.
 *
 * Unites : kN/m, mm, MPa.
 *
 * Deuxieme generation :
 *   - v_Ed = sqrt(v_Ed,x^2 + v_Ed,y^2) (8.21) ;
 *   - niveau 1 « paliers » : d selon (8.22) a (8.24), rho_l selon (8.38) a
 *     (8.40), en fonction de v_Ed,y / v_Ed,x ;
 *   - niveau 2 « angle » : d = d_x cos^2 alpha_v + d_y sin^2 alpha_v (8.25),
 *     alpha_v = arctan(v_Ed,y / v_Ed,x) (8.26), rho_l comme au niveau 1 ;
 *   - dans les deux cas, tau_Rd,c (8.27) >= tau_Rdc,min (8.20), z = 0,9 d.
 * Premiere generation : aucune regle equivalente (verification direction par
 * direction laissee a l ingenieur) ; le niveau est rendu non applicable avec
 * ce motif, jamais calcule par extrapolation.
 *
 * Domaine : D_lower >= 8 mm (1.1(3)), fck <= 90 MPa.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_S_2023, GAMMA_V_2023, ddg2023, positif } from '../../materiaux';

export interface EntreeDalleBidirectionnelle {
  /** Efforts tranchants par unite de longueur (kN/m), valeurs absolues. */
  vx?: number;
  vy?: number;
  dx?: number;
  dy?: number;
  /** Armatures tendues par metre dans chaque direction (mm2/m). */
  Asx?: number;
  Asy?: number;
  fck?: number;
  fyk?: number;
  Dlower?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeDalleBidirectionnelle>;
const N_PAR_KN = 1000;
const LARGEUR = 1000;

const R = {
  vx: { champ: 'vx', libelle: 'champ.vx' },
  vy: { champ: 'vy', libelle: 'champ.vy' },
  dx: { champ: 'dx', libelle: 'champ.dx' },
  dy: { champ: 'dy', libelle: 'champ.dy' },
  Asx: { champ: 'Asx', libelle: 'champ.Asx-tendue' },
  Asy: { champ: 'Asy', libelle: 'champ.Asy-tendue' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
} as const satisfies Record<string, { champ: keyof EntreeDalleBidirectionnelle; libelle: Cle }>;

const requises = [R.vx, R.vy, R.dx, R.dy, R.Asx, R.Asy, R.fck, R.fyk, R.Dlower];

function domaine(e: EntreeDalleBidirectionnelle): Cle | null {
  if ((e.Dlower as number) < 8) return 'motif.dlower-inf-8';
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function verifier(e: Complete): void {
  positif(e.vx, 'v_Ed,x', 'kN/m');
  if (!(e.vy >= 0)) throw new Error('v_Ed,y doit etre un nombre positif ou nul (kN/m).');
  positif(e.dx, 'd_x', 'mm');
  positif(e.dy, 'd_y', 'mm');
  positif(e.Asx, 'A_s,x', 'mm2');
  positif(e.Asy, 'A_s,y', 'mm2');
  positif(e.fyk, 'fyk', 'MPa');
}

/** rho_l selon le rapport v_Ed,y / v_Ed,x ((8.38) a (8.40)). */
export function rhoBidirectionnel(e: Complete): number {
  const rx = e.Asx / (LARGEUR * e.dx);
  const ry = e.Asy / (LARGEUR * e.dy);
  const r = e.vy / e.vx;
  if (r <= 0.5) return rx;
  if (r >= 2) return ry;
  const a = Math.atan(r);
  return rx * Math.cos(a) ** 4 + ry * Math.sin(a) ** 4;
}

/** d selon les paliers (8.22) a (8.24). */
export function dPaliers(e: Complete): number {
  const r = e.vy / e.vx;
  if (r <= 0.5) return e.dx;
  if (r >= 2) return e.dy;
  return 0.5 * (e.dx + e.dy);
}

function calcul(e: Complete, d: number, extra: Cellule['intermediaires'], clauses: string[]): Calcul {
  verifier(e);
  const vEd = Math.hypot(e.vx, e.vy);
  const alpha = Math.atan(e.vy / e.vx);
  const rho = rhoBidirectionnel(e);
  const ddg = ddg2023(e.fck, e.Dlower);
  const fyd = e.fyk / GAMMA_S_2023;
  const z = 0.9 * d;
  const tauEd = (vEd * N_PAR_KN) / (LARGEUR * z);
  const tauMin = (11 / GAMMA_V_2023) * Math.sqrt(((e.fck / fyd) * ddg) / d);
  const brut = (0.66 / GAMMA_V_2023) * ((100 * rho * e.fck * ddg) / d) ** (1 / 3);
  const tau = Math.max(brut, tauMin);
  const vRd = (tau * LARGEUR * z) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: vEd,
    resistance: vRd,
    intermediaires: {
      'γ_V': recommandee(GAMMA_V_2023, '-'),
      v_Ed: calculee(vEd, 'kN/m'),
      'α_v': calculee((alpha * 180) / Math.PI, '°'),
      ...extra,
      d: calculee(d, 'mm'),
      'ρ_l': calculee(rho, '-'),
      d_dg: calculee(ddg, 'mm'),
      'τ_Ed': calculee(tauEd, 'MPa'),
      'τ_Rdc,min': calculee(tauMin, 'MPa'),
      'τ_Rd,c (8.27)': calculee(brut, 'MPa'),
      'τ_Rd,c': calculee(tau, 'MPa'),
      'v_Rd,c': calculee(vRd, 'kN/m'),
    },
    clauses,
  };
}

export function paliers2023(e: Complete): Calcul {
  verifier(e);
  return calcul(e, dPaliers(e), {}, ['8.2.1(5)', '(8.21) à (8.24)', '8.2.2(7)', '(8.38) à (8.40)']);
}

export function angle2023(e: Complete): Calcul {
  verifier(e);
  const a = Math.atan(e.vy / e.vx);
  const d = e.dx * Math.cos(a) ** 2 + e.dy * Math.sin(a) ** 2;
  return calcul(e, d, {}, ['8.2.1(5)', '(8.21)', '(8.25)', '(8.26)', '8.2.2(7)', '(8.38) à (8.40)']);
}

const niveaux2004: DefinitionNiveau<EntreeDalleBidirectionnelle>[] = [
  {
    id: 'sans-equivalent',
    ordre: 1,
    position: 'corps',
    clause: '6.2.2',
    hypothese: 'niveau.tdb.2004.sans-equivalent',
    donneesRequises: [],
    conditions: () => 'motif.sans-equivalent-2004',
    calculer: () => {
      throw new Error('Niveau sans equivalent : jamais calcule.');
    },
  },
];

const niveaux2023: DefinitionNiveau<EntreeDalleBidirectionnelle>[] = [
  {
    id: 'paliers',
    ordre: 1,
    position: 'corps',
    clause: '8.2.1(5)',
    hypothese: 'niveau.tdb.2023.paliers',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => paliers2023(e as Complete),
  },
  {
    id: 'angle',
    ordre: 2,
    position: 'corps',
    clause: '8.2.1(5)',
    hypothese: 'niveau.tdb.2023.angle',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => angle2023(e as Complete),
  },
];

export const tranchantDalleBidirectionnelle: Mecanisme<EntreeDalleBidirectionnelle> = {
  id: 'tranchant-dalle-bidirectionnelle',
  version: '0.1.0',
  titre: 'meca.tdb.titre',
  champs: [
    { type: 'nombre', id: 'vx', libelle: 'champ.vx', symbole: 'v_Ed,x', unite: 'kN/m' },
    { type: 'nombre', id: 'vy', libelle: 'champ.vy', symbole: 'v_Ed,y', unite: 'kN/m' },
    { type: 'nombre', id: 'dx', libelle: 'champ.dx', symbole: 'd_x', unite: 'mm' },
    { type: 'nombre', id: 'dy', libelle: 'champ.dy', symbole: 'd_y', unite: 'mm' },
    { type: 'nombre', id: 'Asx', libelle: 'champ.Asx-tendue', symbole: 'A_s,x', unite: 'mm²/m' },
    { type: 'nombre', id: 'Asy', libelle: 'champ.Asy-tendue', symbole: 'A_s,y', unite: 'mm²/m' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.effort-tranchant-lineique', unite: 'kN/m' },
  resistance: { libelle: 'grandeur.resistance-tranchant-lineique', unite: 'kN/m' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
