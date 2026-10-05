/**
 * Redistribution limitee des moments sans verification explicite de la
 * capacite de rotation (poutres et dalles continues).
 *
 * Unites : mm, MPa, kN.m.
 *
 * Premiere generation (5.5(4)) : delta >= k1 + k2 x_u/d pour fck <= 50 MPa
 *   (5.10a), k3 + k4 x_u/d au-dela (5.10b), et >= k5 = 0,7 (classes B, C)
 *   ou k6 = 0,8 (classe A). Valeurs recommandees : k1 = 0,44, k3 = 0,54,
 *   k2 = k4 = 1,25 (0,6 + 0,0014/epsilon_cu2), epsilon_cu2 du tableau 3.1.
 * Deuxieme generation (7.3.2(3)) : delta_M >= 1/(1 + 0,7 epsilon_cu E_s/f_yd)
 *   + x_u/d (7.16), avec les memes bornes 0,7 et 0,8 (tableau 5.5).
 * Conditions communes : flexion dominante, rapport des portees adjacentes
 *   entre 0,5 et 2.
 *
 * Choix de l outil : x_u est la profondeur de l axe neutre a l ELU de la
 * section armee pour le moment redistribue, obtenue par l equilibre de la
 * flexion simple (section rectangulaire, armatures tendues seules,
 * parabole-rectangle ; voir le mecanisme `flexion`). En 2023, f_cd retient
 * k_tc = 0,85 (mise en charge avant 90 jours), ce qui donne un x_u plus grand.
 * Les elements precontraints (7.17) et la verification explicite de la
 * rotation (7.3.2(5)) ne sont pas codes.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { ES, GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, positif } from '../../materiaux';
import { LOI_2023, equilibre, loi2004, remplissage } from '../flexion/index';

export interface EntreeRedistribution {
  /** Moment elastique a l appui (kN.m, valeur absolue). */
  Mel?: number;
  /** Moment retenu apres redistribution (kN.m, valeur absolue). */
  Mred?: number;
  /** Portees adjacentes (mm). */
  L1?: number;
  L2?: number;
  b?: number;
  d?: number;
  /** Armatures tendues de la section redistribuee (mm2). */
  As?: number;
  fck?: number;
  fyk?: number;
  /** Classe de ductilite de l acier : 'A', 'B' ou 'C'. */
  classe?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeRedistribution>;

const R = {
  Mel: { champ: 'Mel', libelle: 'champ.Mel' },
  Mred: { champ: 'Mred', libelle: 'champ.Mred' },
  L1: { champ: 'L1', libelle: 'champ.L1' },
  L2: { champ: 'L2', libelle: 'champ.L2' },
  b: { champ: 'b', libelle: 'champ.b' },
  d: { champ: 'd', libelle: 'champ.d' },
  As: { champ: 'As', libelle: 'champ.As' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  classe: { champ: 'classe', libelle: 'champ.classe-ductilite' },
} as const satisfies Record<string, { champ: keyof EntreeRedistribution; libelle: Cle }>;

const requises = [R.Mel, R.Mred, R.L1, R.L2, R.b, R.d, R.As, R.fck, R.fyk, R.classe];

function domaine(e: EntreeRedistribution): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

/** Rapport des portees adjacentes entre 0,5 et 2 (5.5(4) ; 7.3.2(3)). */
function conditions(e: EntreeRedistribution): Cle | null {
  const r = (e.L1 as number) / (e.L2 as number);
  return r < 0.5 || r > 2 ? 'motif.portees-adjacentes' : null;
}

function verifier(e: Complete): void {
  positif(e.Mel, 'M_el', 'kN.m');
  positif(e.Mred, 'M_red', 'kN.m');
  positif(e.L1, 'L1', 'mm');
  positif(e.L2, 'L2', 'mm');
  positif(e.b, 'b', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.As, 'As', 'mm2');
  positif(e.fyk, 'fyk', 'MPa');
}

/** Borne inferieure selon la classe de ductilite (k5, k6 ; tableau 5.5). */
function borne(classe: string): number {
  return classe === 'A' ? 0.8 : 0.7;
}

function cellule(e: Complete, deltaMin: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  const delta = e.Mred / e.Mel;
  return {
    statut: { etat: 'calcule' },
    sollicitation: deltaMin,
    resistance: delta,
    intermediaires: {
      ...inter,
      'borne de ductilité': recommandee(borne(e.classe), '-'),
      'δ minimal': calculee(deltaMin, '-'),
      'δ retenu': calculee(delta, '-'),
      'taux de redistribution': calculee(1 - delta, '-'),
    },
    clauses,
  };
}

export function redistribution2004(e: Complete): Calcul {
  verifier(e);
  const loi = loi2004(e.fck);
  const { alpha, beta } = remplissage(loi);
  const eq = equilibre(e, fcd2004(e.fck), e.fyk / GAMMA_S_2004, alpha, beta, loi.ecu);
  const xd = eq.x / e.d;
  const k1 = e.fck <= 50 ? 0.44 : 0.54;
  const k2 = 1.25 * (0.6 + 0.0014 / loi.ecu);
  const formule = k1 + k2 * xd;
  return cellule(
    e,
    Math.max(formule, borne(e.classe)),
    {
      x_u: calculee(eq.x, 'mm'),
      'x_u / d': calculee(xd, '-'),
      'ε_cu2': calculee(loi.ecu * 1000, '‰'),
      [e.fck <= 50 ? 'k1' : 'k3']: recommandee(k1, '-'),
      [e.fck <= 50 ? 'k2' : 'k4']: recommandee(k2, '-'),
      '(5.10)': calculee(formule, '-'),
    },
    ['5.5(4)', e.fck <= 50 ? '(5.10a)' : '(5.10b)', 'tableau 3.1'],
  );
}

export function redistribution2023(e: Complete): Calcul {
  verifier(e);
  const { alpha, beta } = remplissage(LOI_2023);
  const fyd = e.fyk / GAMMA_S_2023;
  const eq = equilibre(e, fcd2023(e.fck), fyd, alpha, beta, LOI_2023.ecu);
  const xd = eq.x / e.d;
  const terme = 1 / (1 + (0.7 * LOI_2023.ecu * ES) / fyd);
  const formule = terme + xd;
  return cellule(
    e,
    Math.max(formule, borne(e.classe)),
    {
      x_u: calculee(eq.x, 'mm'),
      'x_u / d': calculee(xd, '-'),
      '1/(1 + 0,7 ε_cu E_s/f_yd)': calculee(terme, '-'),
      '(7.16)': calculee(formule, '-'),
    },
    ['7.3.2(3)', '(7.16)', 'tableau 5.5'],
  );
}

const niveaux2004: DefinitionNiveau<EntreeRedistribution>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '5.5(4)',
    hypothese: 'niveau.red.2004.base',
    donneesRequises: requises,
    domaine,
    conditions,
    calculer: (e) => redistribution2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeRedistribution>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '7.3.2(3)',
    hypothese: 'niveau.red.2023.base',
    donneesRequises: requises,
    domaine,
    conditions,
    calculer: (e) => redistribution2023(e as Complete),
  },
];

export const redistribution: Mecanisme<EntreeRedistribution> = {
  id: 'redistribution',
  version: '0.1.0',
  titre: 'meca.red.titre',
  champs: [
    { type: 'nombre', id: 'Mel', libelle: 'champ.Mel', symbole: 'M_el', unite: 'kN·m' },
    { type: 'nombre', id: 'Mred', libelle: 'champ.Mred', symbole: 'M_red', unite: 'kN·m' },
    { type: 'nombre', id: 'L1', libelle: 'champ.L1', symbole: 'L_1', unite: 'mm' },
    { type: 'nombre', id: 'L2', libelle: 'champ.L2', symbole: 'L_2', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'As', libelle: 'champ.As', symbole: 'A_s', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
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
  ],
  sollicitation: { libelle: 'grandeur.delta-minimal', unite: '-' },
  resistance: { libelle: 'grandeur.delta-retenu', unite: '-' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
