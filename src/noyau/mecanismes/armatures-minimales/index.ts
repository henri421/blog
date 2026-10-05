/**
 * Armatures longitudinales minimales d une section rectangulaire en flexion
 * simple, sans effort normal. Deux exigences de natures differentes, rendues
 * par deux mecanismes distincts :
 *
 * 1. Non-fragilite (rupture a la fissuration) :
 *    - 2004 (9.2.1.1, 9.3.1.1) : A_s,min = 0,26 f_ctm / f_yk b d >= 0,0013 b d (9.1N) ;
 *    - 2023 (12.2(2)) : M_R,min >= M_cr (12.1), M_cr = f_ctm b h^2 / 6 ;
 *      niveau 1 : bras de levier z = 0,9 d ;
 *      niveau 2 : bras de levier d equilibre, bloc rectangulaire lambda = 0,8,
 *      eta = 1 sur f_ck (choix de l outil : resistance nominale, valeurs
 *      caracteristiques des deux materiaux) ;
 *      niveau 3 : element isostatique ou M_Ed < M_cr (12.2(3)) :
 *      M_Rd,min >= k_dc M_Ed (12.3), k_dc = 1,3 ; 1,1 ; 1,0 pour les classes
 *      A, B, C, sans depasser le resultat de (12.1) ; z = 0,9 d, f_yd.
 * 2. Maitrise de la fissuration :
 *    - 2004 (7.3.2) : A_s,min sigma_s = k_c k f_ct,eff A_ct (7.1), k_c = 0,4,
 *      A_ct = b h / 2, sigma_s = f_yk, k = 1,0 (h <= 300) a 0,65 (h >= 800) ;
 *    - 2023 (9.2.2) : A_s,min,w1 >= 0,2 k_h f_ct,eff A_c / f_yk (9.2),
 *      k_h = 0,8 - 0,6 (min(b ; h) - 0,3) borne a [0,5 ; 0,8], dimensions en m (9.5).
 *
 * Unites : mm, MPa, kN.m ; armatures en mm2.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_S_2023, fctm2004, fctm2023, positif } from '../../materiaux';

export interface EntreeArmaturesMinimales {
  b?: number;
  h?: number;
  d?: number;
  fck?: number;
  fyk?: number;
  /** Armatures tendues en place (mm2). */
  As?: number;
  /** Moment de calcul a l ELU (kN.m), pour 12.2(3). */
  MEd?: number;
  /** Classe de ductilite : 'A', 'B' ou 'C', pour 12.2(3). */
  classe?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeArmaturesMinimales>;
const NMM_PAR_KNM = 1e6;
const MM_PAR_M = 1000;

const R = {
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  d: { champ: 'd', libelle: 'champ.d' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  As: { champ: 'As', libelle: 'champ.As-place' },
  MEd: { champ: 'MEd', libelle: 'champ.MEd-flexion' },
  classe: { champ: 'classe', libelle: 'champ.classe-ductilite' },
} as const satisfies Record<string, { champ: keyof EntreeArmaturesMinimales; libelle: Cle }>;

const requises = [R.b, R.h, R.d, R.fck, R.fyk, R.As];

function domaine(e: EntreeArmaturesMinimales): Cle | null {
  if ((e.fck as number) > 90) return 'motif.fck-sup-90';
  if ((e.d as number) >= (e.h as number)) return 'motif.d-sup-h';
  return null;
}

function verifier(e: Complete): void {
  positif(e.b, 'b', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.fyk, 'fyk', 'MPa');
  positif(e.As, 'As', 'mm2');
}

function cellule(e: Complete, Asmin: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  return {
    statut: { etat: 'calcule' },
    sollicitation: Asmin,
    resistance: e.As,
    intermediaires: { ...inter, 'A_s,min': calculee(Asmin, 'mm²') },
    clauses,
  };
}

// ---------------------------------------------------------------------------
// Non-fragilite
// ---------------------------------------------------------------------------

export function nonFragilite2004(e: Complete): Calcul {
  verifier(e);
  const fctm = fctm2004(e.fck);
  const a = ((0.26 * fctm) / e.fyk) * e.b * e.d;
  const plancher = 0.0013 * e.b * e.d;
  return cellule(
    e,
    Math.max(a, plancher),
    {
      f_ctm: calculee(fctm, 'MPa'),
      '0,26 f_ctm / f_yk b d': calculee(a, 'mm²'),
      '0,0013 b d': calculee(plancher, 'mm²'),
    },
    ['9.2.1.1(1)', '(9.1N)'],
  );
}

/** M_cr = f_ctm b h^2 / 6 (kN.m), section brute, sans effort normal. */
function momentFissuration2023(e: Complete): number {
  return (fctm2023(e.fck) * e.b * e.h ** 2) / 6 / NMM_PAR_KNM;
}

export function nonFragilite2023Approchee(e: Complete): Calcul {
  verifier(e);
  const Mcr = momentFissuration2023(e);
  const z = 0.9 * e.d;
  const Asmin = (Mcr * NMM_PAR_KNM) / (e.fyk * z);
  return cellule(e, Asmin, { M_cr: calculee(Mcr, 'kN·m'), z: calculee(z, 'mm') }, ['12.2(2)', '(12.1)']);
}

/**
 * Bras de levier d equilibre : A_s f_yk (d - 0,4 x) = M_cr avec
 * x = A_s f_yk / (0,8 b f_ck), soit A_s f_yk d - (A_s f_yk)^2 / (2 b f_ck) = M_cr.
 */
export function nonFragilite2023Equilibre(e: Complete): Calcul {
  verifier(e);
  const Mcr = momentFissuration2023(e) * NMM_PAR_KNM;
  const a = 1 / (2 * e.b * e.fck);
  // a F^2 - d F + M_cr = 0, F = A_s f_yk ; racine la plus petite.
  const disc = e.d ** 2 - 4 * a * Mcr;
  if (disc < 0) throw new Error('M_cr depasse le moment resistant maximal de la section (bloc rectangulaire).');
  const F = (e.d - Math.sqrt(disc)) / (2 * a);
  const Asmin = F / e.fyk;
  const x = F / (0.8 * e.b * e.fck);
  return cellule(
    e,
    Asmin,
    {
      M_cr: calculee(Mcr / NMM_PAR_KNM, 'kN·m'),
      'λ': recommandee(0.8, '-'),
      x: calculee(x, 'mm'),
      z: calculee(e.d - 0.4 * x, 'mm'),
    },
    ['12.2(2)', '(12.1)'],
  );
}

/** k_dc selon la classe de ductilite (12.2(3)). */
export function coefficientKdc(classe: string): number {
  if (classe === 'A') return 1.3;
  if (classe === 'B') return 1.1;
  return 1.0;
}

/** 12.2(3) : M_Rd,min = k_dc M_Ed, plafonne au resultat de (12.1), z = 0,9 d. */
export function nonFragilite2023Kdc(e: Complete): Calcul {
  verifier(e);
  positif(e.MEd, 'M_Ed', 'kN.m');
  const kdc = coefficientKdc(e.classe);
  const z = 0.9 * e.d;
  const fyd = e.fyk / GAMMA_S_2023;
  const AsKdc = (kdc * e.MEd * NMM_PAR_KNM) / (fyd * z);
  const As121 = nonFragilite2023Approchee(e).sollicitation as number;
  return cellule(
    e,
    Math.min(AsKdc, As121),
    {
      M_cr: calculee(momentFissuration2023(e), 'kN·m'),
      k_dc: recommandee(kdc, '-'),
      'A_s (k_dc M_Ed)': calculee(AsKdc, 'mm²'),
      'A_s (12.1)': calculee(As121, 'mm²'),
    },
    ['12.2(3)', '(12.3)'],
  );
}

/** 12.2(3) ne vaut que si M_Ed < M_cr. */
function conditionKdc(e: EntreeArmaturesMinimales): Cle | null {
  return (e.MEd as number) < momentFissuration2023(e as Complete) ? null : 'motif.med-sup-mcr';
}

// ---------------------------------------------------------------------------
// Maitrise de la fissuration
// ---------------------------------------------------------------------------

/** k de 7.3.2 : 1,0 jusqu a 300 mm, 0,65 au-dela de 800 mm, interpolation entre. */
export function k2004(h: number): number {
  if (h <= 300) return 1;
  if (h >= 800) return 0.65;
  return 1 - (0.35 * (h - 300)) / 500;
}

/** k_h de (9.5), dimensions en metres. */
export function kh2023(b: number, h: number): number {
  return Math.min(Math.max(0.8 - 0.6 * (Math.min(b, h) / MM_PAR_M - 0.3), 0.5), 0.8);
}

export function fissurationMin2004(e: Complete): Calcul {
  verifier(e);
  const k = k2004(e.h);
  const fct = fctm2004(e.fck);
  const Act = (e.b * e.h) / 2;
  const Asmin = (0.4 * k * fct * Act) / e.fyk;
  return cellule(
    e,
    Asmin,
    { k_c: recommandee(0.4, '-'), k: calculee(k, '-'), 'f_ct,eff': calculee(fct, 'MPa'), A_ct: calculee(Act, 'mm²') },
    ['7.3.2(2)', '(7.1)'],
  );
}

export function fissurationMin2023(e: Complete): Calcul {
  verifier(e);
  const kh = kh2023(e.b, e.h);
  const fct = fctm2023(e.fck);
  const Ac = e.b * e.h;
  const Asmin = (0.2 * kh * fct * Ac) / e.fyk;
  return cellule(
    e,
    Asmin,
    { k_h: calculee(kh, '-'), 'f_ct,eff': calculee(fct, 'MPa'), A_c: calculee(Ac, 'mm²') },
    ['9.2.2(2)', '(9.2)', '(9.5)'],
  );
}

function niveau(
  id: string,
  ordre: number,
  clause: string,
  hypothese: Cle,
  f: (e: Complete) => Calcul,
): DefinitionNiveau<EntreeArmaturesMinimales> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requises, domaine, conditions: () => null, calculer: (e) => f(e as Complete) };
}

const champs: Mecanisme<EntreeArmaturesMinimales>['champs'] = [
  { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
  { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
  { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
  { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
  { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
  { type: 'nombre', id: 'As', libelle: 'champ.As-place', symbole: 'A_s', unite: 'mm²' },
];

const champsNonFragilite: Mecanisme<EntreeArmaturesMinimales>['champs'] = [
  ...champs,
  { type: 'nombre', id: 'MEd', libelle: 'champ.MEd-flexion', symbole: 'M_Ed', unite: 'kN·m', facultatif: true },
  {
    type: 'choix',
    id: 'classe',
    libelle: 'champ.classe-ductilite',
    options: [
      { valeur: 'A', libelle: 'option.ductilite.A' },
      { valeur: 'B', libelle: 'option.ductilite.B' },
      { valeur: 'C', libelle: 'option.ductilite.C' },
    ],
  },
];

export const nonFragilite: Mecanisme<EntreeArmaturesMinimales> = {
  id: 'non-fragilite',
  version: '0.2.0',
  titre: 'meca.nf.titre',
  champs: champsNonFragilite,
  sollicitation: { libelle: 'grandeur.as-min', unite: 'mm²' },
  resistance: { libelle: 'grandeur.as-place', unite: 'mm²' },
  niveaux: {
    'ec2-2004': [niveau('base', 1, '9.2.1.1', 'niveau.nf.2004.base', nonFragilite2004)],
    'ec2-2023': [
      niveau('z-forfaitaire', 1, '12.2(2)', 'niveau.nf.2023.z-forfaitaire', nonFragilite2023Approchee),
      niveau('z-equilibre', 2, '12.2(2)', 'niveau.nf.2023.z-equilibre', nonFragilite2023Equilibre),
      {
        id: 'kdc',
        ordre: 3,
        position: 'corps',
        clause: '12.2(3)',
        hypothese: 'niveau.nf.2023.kdc',
        donneesRequises: [...requises, R.MEd, R.classe],
        domaine,
        conditions: conditionKdc,
        calculer: (e) => nonFragilite2023Kdc(e as Complete),
      },
    ],
  },
};

export const fissurationMinimale: Mecanisme<EntreeArmaturesMinimales> = {
  id: 'fissuration-minimale',
  version: '0.1.0',
  titre: 'meca.fm.titre',
  champs,
  sollicitation: { libelle: 'grandeur.as-min', unite: 'mm²' },
  resistance: { libelle: 'grandeur.as-place', unite: 'mm²' },
  niveaux: {
    'ec2-2004': [niveau('base', 1, '7.3.2', 'niveau.fm.2004.base', fissurationMin2004)],
    'ec2-2023': [niveau('base', 1, '9.2.2', 'niveau.fm.2023.base', fissurationMin2023)],
  },
};
