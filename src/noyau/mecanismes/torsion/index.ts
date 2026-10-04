/**
 * Torsion pure d une section rectangulaire pleine, modele de section
 * creuse equivalente.
 *
 * Unites : kN.m, mm, MPa.
 *
 * Section equivalente (6.3.2 ; 8.3.2) : t_ef = A/u, au moins deux fois la
 * distance du parement a l axe des barres longitudinales ; A_k et u_k au
 * feuillet moyen.
 * Resistances, exprimees en moment :
 *   cadres          T_s   = 2 A_k A_sw f_ywd cot(theta) / s ;
 *   longitudinales  T_l   = 2 A_k sum(A_sl) f_yd / (u_k cot(theta)) ;
 *   bielles         T_max = 2 A_k t_ef nu f_cd / (cot(theta) + tan(theta)).
 * Premiere generation (6.3.2) : nu = 0,6 (1 - fck/250), 1 <= cot <= 2,5,
 *   f_cd = f_ck / gamma_c.
 * Deuxieme generation (8.3.4), deux niveaux :
 *   1. cot(theta) = 1, nu = 0,60 (8.3.4(3)) ;
 *   2. 1/2,5 <= cot(theta) <= 2,5 (8.85), nu = 0,4 (G.8) faute de
 *      deformations connues.
 *   Si b_max/b_min < 1,5 et c > 0,07 b_min, la section est reduite en
 *   ramenant l enrobage des cadres a 0,07 b_min (8.3.4(5)).
 * L angle optimal est cherche par la section doree, iterations visibles.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, maximiserSectionDoree, recommandee } from '../../moteur/grandeurs';
import { GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeTorsion {
  TEd?: number;
  b?: number;
  h?: number;
  /** Distance du parement a l axe des barres longitudinales (mm). */
  a?: number;
  /** Enrobage des cadres (mm). */
  c?: number;
  /** Section d un brin de cadre ferme (mm2). */
  Asw?: number;
  /** Espacement des cadres (mm). */
  s?: number;
  /** Armatures longitudinales de torsion, total (mm2). */
  Asl?: number;
  fck?: number;
  fyk?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeTorsion>;
const NMM_PAR_KNM = 1e6;

const R = {
  TEd: { champ: 'TEd', libelle: 'champ.TEd' },
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  a: { champ: 'a', libelle: 'champ.a-axe' },
  c: { champ: 'c', libelle: 'champ.c-cadres' },
  Asw: { champ: 'Asw', libelle: 'champ.Asw-brin' },
  s: { champ: 's', libelle: 'champ.s' },
  Asl: { champ: 'Asl', libelle: 'champ.Asl-torsion' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
} as const satisfies Record<string, { champ: keyof EntreeTorsion; libelle: Cle }>;

const requises = [R.TEd, R.b, R.h, R.a, R.c, R.Asw, R.s, R.Asl, R.fck, R.fyk];

function domaine(e: EntreeTorsion): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function verifier(e: Complete): void {
  for (const [v, nom, u] of [
    [e.TEd, 'TEd', 'kN.m'],
    [e.b, 'b', 'mm'],
    [e.h, 'h', 'mm'],
    [e.a, 'a', 'mm'],
    [e.c, 'c', 'mm'],
    [e.Asw, 'Asw', 'mm2'],
    [e.s, 's', 'mm'],
    [e.Asl, 'Asl', 'mm2'],
    [e.fyk, 'fyk', 'MPa'],
  ] as const) {
    positif(v, nom, u);
  }
}

export interface SectionCreuse {
  b: number;
  h: number;
  tef: number;
  Ak: number;
  uk: number;
}

/** Section creuse equivalente d un rectangle plein b x h. */
export function sectionCreuse(b: number, h: number, a: number): SectionCreuse {
  const tef = Math.max((b * h) / (2 * (b + h)), 2 * a);
  const Ak = (b - tef) * (h - tef);
  const uk = 2 * (b - tef + (h - tef));
  if (!(Ak > 0)) throw new Error('Section trop mince pour le modele de section creuse (mm).');
  return { b, h, tef, Ak, uk };
}

interface Moments {
  Ts: (cot: number) => number;
  Tl: (cot: number) => number;
  Tmax: (cot: number) => number;
}

function moments(e: Complete, sc: SectionCreuse, fyd: number, nu: number, fcd: number): Moments {
  return {
    Ts: (cot) => (2 * sc.Ak * e.Asw * fyd * cot) / e.s / NMM_PAR_KNM,
    Tl: (cot) => (2 * sc.Ak * e.Asl * fyd) / (sc.uk * cot) / NMM_PAR_KNM,
    Tmax: (cot) => (2 * sc.Ak * sc.tef * nu * fcd) / (cot + 1 / cot) / NMM_PAR_KNM,
  };
}

function resultat(e: Complete, sc: SectionCreuse, m: Moments, cot: number, nu: number, fcd: number, extra: Cellule['intermediaires'], clauses: string[], iterations?: number): Calcul {
  const Ts = m.Ts(cot);
  const Tl = m.Tl(cot);
  const Tmax = m.Tmax(cot);
  const TRd = Math.min(Ts, Tl, Tmax);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.TEd,
    resistance: TRd,
    intermediaires: {
      ...extra,
      t_ef: calculee(sc.tef, 'mm'),
      A_k: calculee(sc.Ak, 'mm²'),
      u_k: calculee(sc.uk, 'mm'),
      f_cd: calculee(fcd, 'MPa'),
      'ν': recommandee(nu, '-'),
      'cot θ': calculee(cot, '-'),
      'T_Rd (cadres)': calculee(Ts, 'kN·m'),
      'T_Rd (longitudinales)': calculee(Tl, 'kN·m'),
      'T_Rd,max (bielles)': calculee(Tmax, 'kN·m'),
      T_Rd: calculee(TRd, 'kN·m'),
    },
    clauses,
    ...(iterations !== undefined ? { iterations } : {}),
  };
}

export function torsion2004(e: Complete): Calcul {
  verifier(e);
  const sc = sectionCreuse(e.b, e.h, e.a);
  const nu = 0.6 * (1 - e.fck / 250);
  const fcd = fcd2004(e.fck);
  const m = moments(e, sc, e.fyk / GAMMA_S_2004, nu, fcd);
  const opt = maximiserSectionDoree((c) => Math.min(m.Ts(c), m.Tl(c), m.Tmax(c)), 1, 2.5);
  return resultat(e, sc, m, opt.x, nu, fcd, {}, ['6.3.2', '(6.26)', '(6.28)', '(6.30)'], opt.iterations);
}

/** Reduction de section de 8.3.4(5) : enrobage des cadres ramene a 0,07 b_min. */
export function sectionReduite2023(e: Complete): { b: number; h: number; a: number; reduite: boolean } {
  const bmin = Math.min(e.b, e.h);
  const bmax = Math.max(e.b, e.h);
  if (bmax / bmin < 1.5 && e.c > 0.07 * bmin) {
    const delta = e.c - 0.07 * bmin;
    return { b: e.b - 2 * delta, h: e.h - 2 * delta, a: Math.max(e.a - delta, 0.5), reduite: true };
  }
  return { b: e.b, h: e.h, a: e.a, reduite: false };
}

function torsion2023(e: Complete, optimise: boolean): Calcul {
  verifier(e);
  const red = sectionReduite2023(e);
  const sc = sectionCreuse(red.b, red.h, red.a);
  const nu = optimise ? 0.4 : 0.6;
  const fcd = fcd2023(e.fck);
  const m = moments(e, sc, e.fyk / GAMMA_S_2023, nu, fcd);
  const extra = { 'section réduite (8.3.4(5))': calculee(red.reduite ? 1 : 0, '-') };
  if (!optimise) return resultat(e, sc, m, 1, nu, fcd, extra, ['8.3.4', '(8.81)', '(8.82)', '(8.83)', '(8.84)']);
  const opt = maximiserSectionDoree((c) => Math.min(m.Ts(c), m.Tl(c), m.Tmax(c)), 1 / 2.5, 2.5);
  return resultat(e, sc, m, opt.x, nu, fcd, extra, ['8.3.4', '(8.81)', '(8.85)', '(G.8)'], opt.iterations);
}

export const torsion2023Cot1 = (e: Complete): Calcul => torsion2023(e, false);
export const torsion2023Optimise = (e: Complete): Calcul => torsion2023(e, true);

const niveaux2004: DefinitionNiveau<EntreeTorsion>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '6.3.2',
    hypothese: 'niveau.tor.2004.base',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => torsion2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeTorsion>[] = [
  {
    id: 'cot-1',
    ordre: 1,
    clause: '8.3.4(3)',
    hypothese: 'niveau.tor.2023.cot-1',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => torsion2023Cot1(e as Complete),
  },
  {
    id: 'cot-variable',
    ordre: 2,
    clause: '8.3.4(4)',
    hypothese: 'niveau.tor.2023.cot-variable',
    donneesRequises: requises,
    domaine,
    conditions: () => null,
    calculer: (e) => torsion2023Optimise(e as Complete),
  },
];

export const torsion: Mecanisme<EntreeTorsion> = {
  id: 'torsion',
  version: '0.1.0',
  titre: 'meca.tor.titre',
  champs: [
    { type: 'nombre', id: 'TEd', libelle: 'champ.TEd', symbole: 'T_Ed', unite: 'kN·m' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'a', libelle: 'champ.a-axe', symbole: 'a', unite: 'mm' },
    { type: 'nombre', id: 'c', libelle: 'champ.c-cadres', symbole: 'c', unite: 'mm' },
    { type: 'nombre', id: 'Asw', libelle: 'champ.Asw-brin', symbole: 'A_sw', unite: 'mm²' },
    { type: 'nombre', id: 's', libelle: 'champ.s', symbole: 's', unite: 'mm' },
    { type: 'nombre', id: 'Asl', libelle: 'champ.Asl-torsion', symbole: 'ΣA_sl', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.torsion', unite: 'kN·m' },
  resistance: { libelle: 'grandeur.resistance-torsion', unite: 'kN·m' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
