/**
 * Profondeur d appui des elements prefabriques sur appui simple.
 *
 * Unites : mm, kN, MPa ; portee de l element supporte en m.
 *
 * Resistance de l appui (10.9.5.2(2) ; 12.10(7)) : f_Rd = 0,4 f_cd pour un
 *   joint sec, f_Rd = f_bed <= 0,85 f_cd dans les autres cas, f_cd la plus
 *   faible des deux elements ; f_cd = f_ck/gamma_c (2004), f_cd de 5.1.6
 *   (2023).
 * Longueur nette : a_1 = F_Ed / (b_1 f_Rd) ; en 2004, au moins le minimum du
 *   tableau 10.2, lu et saisi par l ingenieur (le tableau n est pas reproduit).
 * Longueur nominale, 2004 (10.6) : a = a_1 + a_2 + a_3 + racine(Delta a_2^2 +
 *   Delta a_3^2), a_2, a_3 et Delta a_2 lus dans les tableaux 10.3 a 10.5 et
 *   saisis, Delta a_3 = l_n/2500 ; + 20 mm pour un element isole (10.9.5.3(1)).
 * Deuxieme generation (12.10(5)) : la profondeur nominale doit tenir compte
 *   des memes termes, sans expression de combinaison ni valeurs minimales ;
 *   seule la longueur nette est calculee.
 * Choix de l outil : la limite b_1 <= 600 mm de 2004 sans repartition
 *   uniforme (10.9.5.2(3)) est laissee a l ingenieur, qui saisit b_1.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { estAbsente } from '../../moteur/niveaux';
import { fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeAppuiPrefabrique {
  /** Reaction d appui de calcul (kN). */
  FEd?: number;
  /** Largeur nette d appui b_1 (mm). */
  b1?: number;
  /** Plus faible resistance caracteristique des deux elements (MPa). */
  fck?: number;
  /** 'sec' ou 'lit' (mortier, elastomere ou autre materiau de liaison). */
  joint?: string;
  /** Resistance de calcul du materiau de liaison (MPa), exigee pour un lit. */
  fbed?: number;
  /** Longueur nette prevue (mm). */
  a1Prevu?: number;
  /** 2004 : minimum de a_1 lu dans le tableau 10.2 (mm). */
  a1Min2004?: number;
  /** 2004 : distances inefficaces a_2, a_3 et tolerance Delta a_2 lues dans les tableaux 10.3 a 10.5 (mm). */
  a2?: number;
  a3?: number;
  deltaA2?: number;
  /** Longueur de l element supporte (m). */
  ln?: number;
  /** Element isole : 'oui' ou 'non'. */
  isole?: string;
  /** Profondeur d appui nominale prevue (mm). */
  aPrevu?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAppuiPrefabrique>;
type Generation = '2004' | '2023';

const R = {
  FEd: { champ: 'FEd', libelle: 'champ.FEd-appui' },
  b1: { champ: 'b1', libelle: 'champ.b1-appui' },
  fck: { champ: 'fck', libelle: 'champ.fck-appui' },
  joint: { champ: 'joint', libelle: 'champ.joint-appui' },
  a1Prevu: { champ: 'a1Prevu', libelle: 'champ.a1-prevu' },
  a1Min2004: { champ: 'a1Min2004', libelle: 'champ.a1-min-2004' },
  a2: { champ: 'a2', libelle: 'champ.a2-appui' },
  a3: { champ: 'a3', libelle: 'champ.a3-appui' },
  deltaA2: { champ: 'deltaA2', libelle: 'champ.delta-a2' },
  ln: { champ: 'ln', libelle: 'champ.ln-appui' },
  isole: { champ: 'isole', libelle: 'champ.isole-appui' },
  aPrevu: { champ: 'aPrevu', libelle: 'champ.a-prevu' },
} as const satisfies Record<string, { champ: keyof EntreeAppuiPrefabrique; libelle: Cle }>;

const requisNette = [R.FEd, R.b1, R.fck, R.joint, R.a1Prevu];

function lit(e: EntreeAppuiPrefabrique): Cle | null {
  return e.joint === 'lit' && estAbsente(e.fbed) ? 'motif.fbed-manquant' : null;
}

/** f_Rd et f_cd de la generation. */
export function resistanceAppui(gen: Generation, e: Complete): { fcd: number; fRd: number } {
  const fcd = gen === '2004' ? fcd2004(e.fck) : fcd2023(e.fck);
  if (e.joint === 'sec') return { fcd, fRd: 0.4 * fcd };
  positif(e.fbed, 'f_bed', 'MPa');
  return { fcd, fRd: Math.min(e.fbed, 0.85 * fcd) };
}

function longueurNette(gen: Generation, e: Complete): { fcd: number; fRd: number; a1calc: number; a1: number } {
  positif(e.FEd, 'F_Ed', 'kN');
  positif(e.b1, 'b_1', 'mm');
  const { fcd, fRd } = resistanceAppui(gen, e);
  const a1calc = (e.FEd * 1000) / (e.b1 * fRd);
  const a1 = gen === '2004' ? Math.max(a1calc, e.a1Min2004) : a1calc;
  return { fcd, fRd, a1calc, a1 };
}

export function nette(gen: Generation, e: Complete): Calcul {
  positif(e.a1Prevu, 'a_1 prevu', 'mm');
  const { fcd, fRd, a1calc, a1 } = longueurNette(gen, e);
  const inter: Cellule['intermediaires'] = {
    f_cd: calculee(fcd, 'MPa'),
    f_Rd: calculee(fRd, 'MPa'),
    'σ_Ed / f_cd': calculee((e.FEd * 1000) / (e.b1 * e.a1Prevu) / fcd, '-'),
    'F_Ed / (b_1 f_Rd)': calculee(a1calc, 'mm'),
  };
  if (gen === '2004') inter['a_1,min'] = saisie(e.a1Min2004, 'mm');
  inter.a_1 = calculee(a1, 'mm');
  return {
    statut: { etat: 'calcule' },
    sollicitation: a1,
    resistance: e.a1Prevu,
    intermediaires: inter,
    clauses: gen === '2004' ? ['10.9.5.2(1)', '10.9.5.2(2)', 'tableau 10.2'] : ['12.10(5)', '12.10(7)', '(12.13)', '(12.14)'],
  };
}

export function nominale2004(e: Complete): Calcul {
  positif(e.aPrevu, 'a prevu', 'mm');
  positif(e.ln, 'l_n', 'm');
  for (const [v, nom] of [
    [e.a2, 'a_2'],
    [e.a3, 'a_3'],
    [e.deltaA2, 'Delta a_2'],
  ] as const) {
    if (!(Number.isFinite(v) && v >= 0)) throw new Error(`${nom} doit etre positif ou nul (mm).`);
  }
  const { a1 } = longueurNette('2004', e);
  const da3 = (e.ln * 1000) / 2500;
  const tol = Math.sqrt(e.deltaA2 ** 2 + da3 ** 2);
  const isole = e.isole === 'oui' ? 20 : 0;
  const a = a1 + e.a2 + e.a3 + tol + isole;
  return {
    statut: { etat: 'calcule' },
    sollicitation: a,
    resistance: e.aPrevu,
    intermediaires: {
      a_1: calculee(a1, 'mm'),
      a_2: saisie(e.a2, 'mm'),
      a_3: saisie(e.a3, 'mm'),
      'Δa_2': saisie(e.deltaA2, 'mm'),
      'Δa_3': calculee(da3, 'mm'),
      '√(Δa_2² + Δa_3²)': calculee(tol, 'mm'),
      'élément isolé': recommandee(isole, 'mm'),
      a: calculee(a, 'mm'),
    },
    clauses: ['10.9.5.2(1)', '(10.6)', 'tableaux 10.2 à 10.5', '10.9.5.3(1)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeAppuiPrefabrique>[] = [
  {
    id: 'nette',
    ordre: 1,
    position: 'corps',
    clause: '10.9.5.2',
    hypothese: 'niveau.app.2004.nette',
    donneesRequises: [...requisNette, R.a1Min2004],
    conditions: lit,
    calculer: (e) => nette('2004', e as Complete),
  },
  {
    id: 'nominale',
    ordre: 2,
    position: 'corps',
    clause: '10.9.5.2',
    hypothese: 'niveau.app.2004.nominale',
    donneesRequises: [R.FEd, R.b1, R.fck, R.joint, R.a1Min2004, R.a2, R.a3, R.deltaA2, R.ln, R.isole, R.aPrevu],
    conditions: lit,
    calculer: (e) => nominale2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeAppuiPrefabrique>[] = [
  {
    id: 'nette',
    ordre: 1,
    position: 'corps',
    clause: '12.10',
    hypothese: 'niveau.app.2023.nette',
    donneesRequises: requisNette,
    conditions: lit,
    calculer: (e) => nette('2023', e as Complete),
  },
];

export const appuiPrefabrique: Mecanisme<EntreeAppuiPrefabrique> = {
  id: 'appui-prefabrique',
  version: '0.1.0',
  titre: 'meca.app.titre',
  champs: [
    { type: 'nombre', id: 'FEd', libelle: 'champ.FEd-appui', symbole: 'F_Ed', unite: 'kN' },
    { type: 'nombre', id: 'b1', libelle: 'champ.b1-appui', symbole: 'b_1', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck-appui', symbole: 'f_ck', unite: 'MPa' },
    {
      type: 'choix',
      id: 'joint',
      libelle: 'champ.joint-appui',
      options: [
        { valeur: 'sec', libelle: 'option.app.sec' },
        { valeur: 'lit', libelle: 'option.app.lit' },
      ],
    },
    { type: 'nombre', id: 'fbed', libelle: 'champ.fbed', symbole: 'f_bed', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'a1Prevu', libelle: 'champ.a1-prevu', symbole: 'a_1,prévu', unite: 'mm' },
    { type: 'nombre', id: 'a1Min2004', libelle: 'champ.a1-min-2004', symbole: 'a_1,min 2004', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'a2', libelle: 'champ.a2-appui', symbole: 'a_2', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'a3', libelle: 'champ.a3-appui', symbole: 'a_3', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'deltaA2', libelle: 'champ.delta-a2', symbole: 'Δa_2', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'ln', libelle: 'champ.ln-appui', symbole: 'l_n', unite: 'm', facultatif: true },
    {
      type: 'choix',
      id: 'isole',
      libelle: 'champ.isole-appui',
      options: [
        { valeur: 'non', libelle: 'option.non' },
        { valeur: 'oui', libelle: 'option.oui' },
      ],
    },
    { type: 'nombre', id: 'aPrevu', libelle: 'champ.a-prevu', symbole: 'a_prévu', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.longueur-appui-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-appui-prevue', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
