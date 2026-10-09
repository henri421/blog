/**
 * Recouvrements par boucles en U (11.5.4) et par barres a tete d ancrage
 * (11.5.5) : resistance du beton a l ecrasement entre les boucles ou les tetes,
 * pour un recouvrement unique.
 *
 * Unites : mm, MPa, kN pour les efforts.
 *
 * Premiere generation : pas de regle propre a ces recouvrements.
 * Deuxieme generation, boucles (11.5.4(2) a (4)), c_s <= 0,5 l_s :
 *   T_Rd,c = 0,2 f_cd A_c (d_dg/l_sd)^(1/3) (racine(k_st + (c_s/l_sd)^2) - c_s/l_sd) (11.13),
 *   A_c = (phi_mand + phi) (l_s - 0,21 (phi_mand + phi)) (11.14),
 *   k_st = 1 si omega >= 0,5, sinon 4 omega (1 - omega),
 *   omega = A_st f_yd / (0,85 (d_dg/l_sd)^(1/3) A_c f_cd) (11.15),
 *   A_st >= 0,5 racine(f_ck) A_c / f_yk (11.16).
 * Tetes (11.5.5(4) a (7)), 0 <= c_s <= 0,5 l_sd :
 *   T_Rd,c = 0,6 f_cd A_c (d_dg/(l_sd - 2 phi))^(1/3)
 *            (racine(k_st + (c_s/(l_sd - 2 phi))^2) - c_s/(l_sd - 2 phi)) (11.17),
 *   A_c = (l_sd - 2 phi) b_h1 (11.18), b_h1 = 0,5 phi_h racine(pi) pour une tete
 *   circulaire (11.19), omega = A_st f_yd / (1,3 (d_dg/(l_sd - 2 phi))^(1/3) A_c f_cd)
 *   (11.20), A_st >= max(0,75 A_c racine(f_ck)/f_yk ; pi/8 phi^2) (11.21),
 *   A_std >= 0,12 phi^2 (11.22).
 * Choix de l outil : T est le plus grand des efforts T1, T2 d un brin (boucle)
 *   ou l effort d une barre (tete) ; l_s = l_sd pour les boucles ; tete
 *   circulaire ; recouvrements multiples ((n_s - 1) T_Rd,c) decrits, non codes ;
 *   f_cd de 2023 avec k_tc = 0,85 ; l armature minimale est une condition.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee } from '../../moteur/grandeurs';
import { GAMMA_S_2023, ddg2023, fcd2023, positif } from '../../materiaux';

export interface EntreeRecouvrementBoucleTete {
  phi?: number;
  /** Boucles : diametre du mandrin (mm). */
  phiMand?: number;
  /** Tetes : diametre de la tete (mm). */
  phiH?: number;
  /** Longueur de recouvrement (mm). */
  lsd?: number;
  /** Espacement libre entre boucles ou entre barres a tete (mm). */
  cs?: number;
  /** Armatures transversales ancrees dans A_c (mm2). */
  Ast?: number;
  fck?: number;
  fyk?: number;
  Dlower?: number;
  /** Effort de calcul d un brin ou d une barre (kN). */
  T?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeRecouvrementBoucleTete>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  phiMand: { champ: 'phiMand', libelle: 'champ.phiMand' },
  phiH: { champ: 'phiH', libelle: 'champ.phiH' },
  lsd: { champ: 'lsd', libelle: 'champ.lsd' },
  cs: { champ: 'cs', libelle: 'champ.cs-recouvrement' },
  Ast: { champ: 'Ast', libelle: 'champ.Ast-confinement' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Dlower: { champ: 'Dlower', libelle: 'champ.Dlower' },
  T: { champ: 'T', libelle: 'champ.T-recouvrement' },
} as const satisfies Record<string, { champ: keyof EntreeRecouvrementBoucleTete; libelle: Cle }>;

/** k_st = 1 si omega >= 0,5, sinon 4 omega (1 - omega) ((11.15) ; (11.20)). */
export function kst(omega: number): number {
  return omega >= 0.5 ? 1 : 4 * omega * (1 - omega);
}

function verifier(e: Complete): void {
  for (const [v, nom] of [
    [e.phi, 'phi'],
    [e.lsd, 'l_sd'],
    [e.fck, 'fck'],
    [e.fyk, 'fyk'],
    [e.T, 'T'],
  ] as const) {
    positif(v, nom, 'mm, MPa ou kN');
  }
  if (!(e.cs >= 0)) throw new Error('c_s doit etre positif ou nul.');
  if (!(e.Ast >= 0)) throw new Error('A_st doit etre positif ou nul.');
}

function resistance(fcd: number, coef: number, Ac: number, facteur: number, k: number, x: number): number {
  return (coef * fcd * Ac * facteur * (Math.sqrt(k + x * x) - x)) / 1000;
}

export function boucle2023(e: Complete): Calcul {
  verifier(e);
  positif(e.phiMand, 'phi_mand', 'mm');
  const fcd = fcd2023(e.fck);
  const fyd = e.fyk / GAMMA_S_2023;
  const ddg = ddg2023(e.fck, e.Dlower);
  const Ac = (e.phiMand + e.phi) * (e.lsd - 0.21 * (e.phiMand + e.phi));
  positif(Ac, 'A_c', 'mm2');
  const facteur = (ddg / e.lsd) ** (1 / 3);
  const omega = (e.Ast * fyd) / (0.85 * facteur * Ac * fcd);
  const k = kst(omega);
  const x = e.cs / e.lsd;
  const T = resistance(fcd, 0.2, Ac, facteur, k, x);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.T,
    resistance: T,
    intermediaires: {
      f_cd: calculee(fcd, 'MPa'),
      d_dg: calculee(ddg, 'mm'),
      A_c: calculee(Ac, 'mm²'),
      'ω (11.15)': calculee(omega, '-'),
      k_st: calculee(k, '-'),
      'A_st,min (11.16)': calculee((0.5 * Math.sqrt(e.fck) * Ac) / e.fyk, 'mm²'),
      'T_Rd,c': calculee(T, 'kN'),
    },
    clauses: ['11.5.4(2)', '(11.13)', '(11.14)', '(11.15)', '(11.16)'],
  };
}

export function tete2023(e: Complete): Calcul {
  verifier(e);
  positif(e.phiH, 'phi_h', 'mm');
  const fcd = fcd2023(e.fck);
  const fyd = e.fyk / GAMMA_S_2023;
  const ddg = ddg2023(e.fck, e.Dlower);
  const L = e.lsd - 2 * e.phi;
  positif(L, 'l_sd - 2 phi', 'mm');
  const bh1 = 0.5 * e.phiH * Math.sqrt(Math.PI);
  const Ac = L * bh1;
  const facteur = (ddg / L) ** (1 / 3);
  const omega = (e.Ast * fyd) / (1.3 * facteur * Ac * fcd);
  const k = kst(omega);
  const T = resistance(fcd, 0.6, Ac, facteur, k, e.cs / L);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.T,
    resistance: T,
    intermediaires: {
      f_cd: calculee(fcd, 'MPa'),
      d_dg: calculee(ddg, 'mm'),
      b_h1: calculee(bh1, 'mm'),
      A_c: calculee(Ac, 'mm²'),
      'ω (11.20)': calculee(omega, '-'),
      k_st: calculee(k, '-'),
      'A_st,min (11.21)': calculee(Math.max((0.75 * Ac * Math.sqrt(e.fck)) / e.fyk, (Math.PI / 8) * e.phi ** 2), 'mm²'),
      'A_std,min (11.22)': calculee(0.12 * e.phi ** 2, 'mm²'),
      'T_Rd,c': calculee(T, 'kN'),
    },
    clauses: ['11.5.5(4)', '(11.17)', '(11.18)', '(11.19)', '(11.20)', '(11.21)', '(11.22)'],
  };
}

function conditionsBoucle(e: EntreeRecouvrementBoucleTete): Cle | null {
  const lsd = e.lsd as number;
  if ((e.cs as number) > 0.5 * lsd) return 'motif.recouvrement-cs';
  const Ac = ((e.phiMand as number) + (e.phi as number)) * (lsd - 0.21 * ((e.phiMand as number) + (e.phi as number)));
  return (e.Ast as number) < (0.5 * Math.sqrt(e.fck as number) * Ac) / (e.fyk as number) ? 'motif.recouvrement-ast-min' : null;
}

function conditionsTete(e: EntreeRecouvrementBoucleTete): Cle | null {
  const lsd = e.lsd as number;
  const phi = e.phi as number;
  if ((e.cs as number) > 0.5 * lsd) return 'motif.recouvrement-cs';
  const Ac = (lsd - 2 * phi) * 0.5 * (e.phiH as number) * Math.sqrt(Math.PI);
  const min = Math.max((0.75 * Ac * Math.sqrt(e.fck as number)) / (e.fyk as number), (Math.PI / 8) * phi ** 2);
  return (e.Ast as number) < min ? 'motif.recouvrement-ast-min' : null;
}

const sansEquivalent: DefinitionNiveau<EntreeRecouvrementBoucleTete> = {
  id: 'sans-equivalent',
  ordre: 1,
  position: 'corps',
  clause: '8.7',
  hypothese: 'niveau.rbt.2004',
  donneesRequises: [],
  conditions: () => 'motif.sans-equivalent-2004',
  calculer: () => {
    throw new Error('Niveau sans equivalent : jamais calcule.');
  },
};

const communs = [R.phi, R.lsd, R.cs, R.Ast, R.fck, R.fyk, R.Dlower, R.T];

const champsCommuns = [
  { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
  { type: 'nombre', id: 'lsd', libelle: 'champ.lsd', symbole: 'l_sd', unite: 'mm' },
  { type: 'nombre', id: 'cs', libelle: 'champ.cs-recouvrement', symbole: 'c_s', unite: 'mm' },
  { type: 'nombre', id: 'Ast', libelle: 'champ.Ast-confinement', symbole: 'A_st', unite: 'mm²' },
  { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
  { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
  { type: 'nombre', id: 'Dlower', libelle: 'champ.Dlower', symbole: 'D_lower', unite: 'mm' },
  { type: 'nombre', id: 'T', libelle: 'champ.T-recouvrement', symbole: 'T', unite: 'kN' },
] as const;

export const recouvrementBoucle: Mecanisme<EntreeRecouvrementBoucleTete> = {
  id: 'recouvrement-boucle',
  version: '0.1.0',
  titre: 'meca.rbt.boucle.titre',
  champs: [...champsCommuns, { type: 'nombre', id: 'phiMand', libelle: 'champ.phiMand', symbole: 'φ_mand', unite: 'mm' }],
  sollicitation: { libelle: 'grandeur.effort-brin', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-ecrasement-recouvrement', unite: 'kN' },
  niveaux: {
    'ec2-2004': [sansEquivalent],
    'ec2-2023': [
      {
        id: 'base',
        ordre: 1,
        position: 'corps',
        clause: '11.5.4(2)',
        hypothese: 'niveau.rbt.boucle',
        donneesRequises: [...communs, R.phiMand],
        conditions: conditionsBoucle,
        calculer: (e) => boucle2023(e as Complete),
      },
    ],
  },
};

export const recouvrementTete: Mecanisme<EntreeRecouvrementBoucleTete> = {
  id: 'recouvrement-tete',
  version: '0.1.0',
  titre: 'meca.rbt.tete.titre',
  champs: [...champsCommuns, { type: 'nombre', id: 'phiH', libelle: 'champ.phiH', symbole: 'φ_h', unite: 'mm' }],
  sollicitation: { libelle: 'grandeur.effort-barre-tete', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-ecrasement-recouvrement', unite: 'kN' },
  niveaux: {
    'ec2-2004': [sansEquivalent],
    'ec2-2023': [
      {
        id: 'base',
        ordre: 1,
        position: 'corps',
        clause: '11.5.5(4)',
        hypothese: 'niveau.rbt.tete',
        donneesRequises: [...communs, R.phiH],
        conditions: conditionsTete,
        calculer: (e) => tete2023(e as Complete),
      },
    ],
  },
};
