/**
 * Pression localisee sur une surface rectangulaire (appareil d appui,
 * platine), sans composante horizontale, sans risque de poinconnement.
 *
 * Unites : kN, mm, MPa.
 *
 * Premiere generation (6.7) : F_Rdu = A_c0 f_cd sqrt(A_c1/A_c0) <= 3 f_cd A_c0 (6.63),
 *   A_c1 homothetique de A_c0 et centree sur la ligne d action (figure 6.29) :
 *   l outil retient le plus grand rectangle homothetique contenu dans le bloc
 *   a_1 x b, d echelle au plus 3. La premiere generation ne donne pas de
 *   regle pour une charge excentree : le niveau est alors non applicable.
 * Deuxieme generation (8.6) : sigma_Rdu = f_cd sqrt(A_c1/A_c0) <= nu_part f_cd (8.126),
 *   nu_part = 3,0 ; A_c0 reduite pour une charge excentree,
 *   A_c0,red = (a_0 - 2 e_a)(b_0 - 2 e_b) (8.128) ; A_c1 = a_1 b_1 (8.129),
 *   b_1 = min(b_0 + (a_1 - a_0) ; b) ; hauteur du bloc h >= a_1.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreePressionLocalisee {
  FEd?: number;
  /** Dimension de la zone chargee perpendiculaire au bord le plus proche (mm). */
  a0?: number;
  /** Autre dimension de la zone chargee (mm). */
  b0?: number;
  /** Excentricites de la charge (mm). */
  ea?: number;
  eb?: number;
  /** Longueur du bloc d introduction parallele a a_0 (mm). */
  a1?: number;
  /** Largeur du bloc d introduction (mm). */
  b?: number;
  /** Hauteur du bloc d introduction dans la direction de la charge (mm). */
  hBloc?: number;
  fck?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePressionLocalisee>;
const N_PAR_KN = 1000;
export const NU_PART = 3;

const R = {
  FEd: { champ: 'FEd', libelle: 'champ.FEd' },
  a0: { champ: 'a0', libelle: 'champ.a0' },
  b0: { champ: 'b0', libelle: 'champ.b0' },
  ea: { champ: 'ea', libelle: 'champ.ea' },
  eb: { champ: 'eb', libelle: 'champ.eb' },
  a1: { champ: 'a1', libelle: 'champ.a1' },
  b: { champ: 'b', libelle: 'champ.b-bloc' },
  hBloc: { champ: 'hBloc', libelle: 'champ.hBloc' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
} as const satisfies Record<string, { champ: keyof EntreePressionLocalisee; libelle: Cle }>;

const requises = [R.FEd, R.a0, R.b0, R.ea, R.eb, R.a1, R.b, R.hBloc, R.fck];

function domaine(e: EntreePressionLocalisee): Cle | null {
  if ((e.fck as number) > 90) return 'motif.fck-sup-90';
  if ((e.a1 as number) < (e.a0 as number) || (e.b as number) < (e.b0 as number)) return 'motif.bloc-trop-petit';
  return null;
}

function verifier(e: Complete): void {
  for (const [v, nom] of [
    [e.FEd, 'F_Ed'],
    [e.a0, 'a_0'],
    [e.b0, 'b_0'],
    [e.a1, 'a_1'],
    [e.b, 'b'],
    [e.hBloc, 'h'],
  ] as const) {
    positif(v, nom, nom === 'F_Ed' ? 'kN' : 'mm');
  }
  if (!(e.ea >= 0 && e.eb >= 0)) throw new Error('Les excentricites doivent etre positives ou nulles (mm).');
}

export function pression2004(e: Complete): Calcul {
  verifier(e);
  const Ac0 = e.a0 * e.b0;
  const k = Math.min(e.a1 / e.a0, e.b / e.b0, 3);
  const Ac1 = k * k * Ac0;
  const fcd = fcd2004(e.fck);
  const brut = fcd * Math.sqrt(Ac1 / Ac0);
  const sigma = Math.min(brut, 3 * fcd);
  const FRdu = (sigma * Ac0) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.FEd,
    resistance: FRdu,
    intermediaires: {
      A_c0: calculee(Ac0, 'mm²'),
      'échelle de A_c1': calculee(k, '-'),
      A_c1: calculee(Ac1, 'mm²'),
      f_cd: calculee(fcd, 'MPa'),
      'f_cd √(A_c1/A_c0)': calculee(brut, 'MPa'),
      F_Rdu: calculee(FRdu, 'kN'),
    },
    clauses: ['6.7(2)', '(6.63)', 'figure 6.29'],
  };
}

export function pression2023(e: Complete): Calcul {
  verifier(e);
  const a0r = e.a0 - 2 * e.ea;
  const b0r = e.b0 - 2 * e.eb;
  if (!(a0r > 0 && b0r > 0)) throw new Error('Excentricite trop forte : A_c0,red est nulle ou negative (mm).');
  const Ac0 = a0r * b0r;
  const b1 = Math.min(e.b0 + (e.a1 - e.a0), e.b);
  const Ac1 = e.a1 * b1;
  const fcd = fcd2023(e.fck);
  const brut = fcd * Math.sqrt(Ac1 / Ac0);
  const sigma = Math.min(brut, NU_PART * fcd);
  const FRdu = (sigma * Ac0) / N_PAR_KN;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.FEd,
    resistance: FRdu,
    intermediaires: {
      'A_c0 (réduite)': calculee(Ac0, 'mm²'),
      b_1: calculee(b1, 'mm'),
      A_c1: calculee(Ac1, 'mm²'),
      f_cd: calculee(fcd, 'MPa'),
      'ν_part': recommandee(NU_PART, '-'),
      'σ_Rdu': calculee(sigma, 'MPa'),
      F_Rdu: calculee(FRdu, 'kN'),
    },
    clauses: ['8.6(2)', '(8.126)', '(8.127)', '(8.128)', '(8.129)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreePressionLocalisee>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '6.7',
    hypothese: 'niveau.pl.2004.base',
    donneesRequises: requises,
    domaine,
    conditions: (e) => ((e.ea as number) > 0 || (e.eb as number) > 0 ? 'motif.excentrement-2004' : null),
    calculer: (e) => pression2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreePressionLocalisee>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '8.6',
    hypothese: 'niveau.pl.2023.base',
    donneesRequises: requises,
    domaine,
    conditions: (e) => ((e.hBloc as number) < (e.a1 as number) ? 'motif.hauteur-bloc' : null),
    calculer: (e) => pression2023(e as Complete),
  },
];

export const pressionLocalisee: Mecanisme<EntreePressionLocalisee> = {
  id: 'pression-localisee',
  version: '0.1.0',
  titre: 'meca.pl.titre',
  champs: [
    { type: 'nombre', id: 'FEd', libelle: 'champ.FEd', symbole: 'F_Ed', unite: 'kN' },
    { type: 'nombre', id: 'a0', libelle: 'champ.a0', symbole: 'a_0', unite: 'mm' },
    { type: 'nombre', id: 'b0', libelle: 'champ.b0', symbole: 'b_0', unite: 'mm' },
    { type: 'nombre', id: 'ea', libelle: 'champ.ea', symbole: 'e_a', unite: 'mm' },
    { type: 'nombre', id: 'eb', libelle: 'champ.eb', symbole: 'e_b', unite: 'mm' },
    { type: 'nombre', id: 'a1', libelle: 'champ.a1', symbole: 'a_1', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b-bloc', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'hBloc', libelle: 'champ.hBloc', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.effort-localise', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-localisee', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
