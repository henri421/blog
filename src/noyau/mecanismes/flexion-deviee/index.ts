/**
 * Flexion deviee des elements comprimes : dispense de verification et critere
 * d interaction simplifie.
 *
 * Unites : mm, mm2, kN, kN.m, MPa.
 *
 * Dispense, memes conditions dans les deux generations ((5.38a), (5.38b) ;
 *   (7.29), (7.30)) : 0,5 <= lambda_y/lambda_z <= 2 et e'_y/e'_z <= 0,2 ou >= 5,
 *   e'_z = M_Edy/(N_Ed b), e'_y = M_Edz/(N_Ed h), section rectangulaire.
 * Interaction, meme forme ((5.39) ; (8.2)) :
 *   (|M_Edz|/M_Rdz)^a + (|M_Edy|/M_Rdy)^a <= 1, a = 1 pour N_Ed/N_Rd <= 0,1,
 *   1,5 pour 0,7, 2 pour 1,0, interpolation lineaire ; N_Rd = A_c f_cd + A_s f_yd
 *   ((5.39) ; (8.3)), f_cd de chaque generation.
 * Les moments resistants a l effort normal donne sont saisis, calcules par
 *   l ingenieur pour chaque generation. Choix de l outil : sections
 *   rectangulaires seulement (a = 2 des sections circulaires non traite) ; le
 *   beton confine (f_cd,c) n est pas traite.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { GAMMA_S_2004, GAMMA_S_2023, fcd2004, fcd2023, positif } from '../../materiaux';

export interface EntreeFlexionDeviee {
  /** Largeur b (direction z) et hauteur h (direction y) de la section (mm). */
  b?: number;
  h?: number;
  /** Elancements selon les deux axes. */
  lambdaY?: number;
  lambdaZ?: number;
  /** Effort normal de compression et moments de calcul, second ordre compris. */
  NEd?: number;
  MEdy?: number;
  MEdz?: number;
  fck?: number;
  fyk?: number;
  /** Aire totale des armatures longitudinales (mm2). */
  As?: number;
  /** Moments resistants a N_Ed donne, par generation (kN.m). */
  MRdy2004?: number;
  MRdz2004?: number;
  MRdy2023?: number;
  MRdz2023?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFlexionDeviee>;
type Generation = '2004' | '2023';

const R = {
  b: { champ: 'b', libelle: 'champ.b' },
  h: { champ: 'h', libelle: 'champ.h' },
  lambdaY: { champ: 'lambdaY', libelle: 'champ.lambda-y' },
  lambdaZ: { champ: 'lambdaZ', libelle: 'champ.lambda-z' },
  NEd: { champ: 'NEd', libelle: 'champ.NEd-compression' },
  MEdy: { champ: 'MEdy', libelle: 'champ.MEdy' },
  MEdz: { champ: 'MEdz', libelle: 'champ.MEdz' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  As: { champ: 'As', libelle: 'champ.As-total' },
  MRdy2004: { champ: 'MRdy2004', libelle: 'champ.MRdy2004' },
  MRdz2004: { champ: 'MRdz2004', libelle: 'champ.MRdz2004' },
  MRdy2023: { champ: 'MRdy2023', libelle: 'champ.MRdy2023' },
  MRdz2023: { champ: 'MRdz2023', libelle: 'champ.MRdz2023' },
} as const satisfies Record<string, { champ: keyof EntreeFlexionDeviee; libelle: Cle }>;

function excentricites(e: EntreeFlexionDeviee): { ey: number; ez: number } {
  const N = e.NEd as number;
  return {
    ez: Math.abs(e.MEdy as number) / (N * ((e.b as number) / 1000)),
    ey: Math.abs(e.MEdz as number) / (N * ((e.h as number) / 1000)),
  };
}

function conditionsDispense(e: EntreeFlexionDeviee): Cle | null {
  const rl = (e.lambdaY as number) / (e.lambdaZ as number);
  if (rl < 0.5 || rl > 2) return 'motif.flexion-deviee-requise';
  const { ey, ez } = excentricites(e);
  if (ez === 0 || ey === 0) return null;
  const r = ey / ez;
  return r <= 0.2 || r >= 5 ? null : 'motif.flexion-deviee-requise';
}

export function dispense(e: Complete, clauses: string[]): Calcul {
  positif(e.NEd, 'N_Ed', 'kN');
  positif(e.lambdaY, 'lambda_y', '-');
  positif(e.lambdaZ, 'lambda_z', '-');
  const { ey, ez } = excentricites(e);
  const inter: Cellule['intermediaires'] = {
    'λ_y/λ_z': calculee(e.lambdaY / e.lambdaZ, '-'),
    "e'_y": calculee(ey, '-'),
    "e'_z": calculee(ez, '-'),
  };
  if (ey > 0 && ez > 0) inter["e'_y/e'_z"] = calculee(ey / ez, '-');
  return { statut: { etat: 'calcule' }, intermediaires: inter, clauses };
}

/** Exposant a des sections rectangulaires selon N_Ed/N_Rd. */
export function exposant(r: number): number {
  if (r <= 0.1) return 1;
  if (r <= 0.7) return 1 + (0.5 * (r - 0.1)) / 0.6;
  if (r < 1) return 1.5 + (0.5 * (r - 0.7)) / 0.3;
  return 2;
}

export function interaction(gen: Generation, e: Complete): Calcul {
  positif(e.b, 'b', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.NEd, 'N_Ed', 'kN');
  positif(e.As, 'A_s', 'mm2');
  const mrdy = gen === '2004' ? e.MRdy2004 : e.MRdy2023;
  const mrdz = gen === '2004' ? e.MRdz2004 : e.MRdz2023;
  positif(mrdy, 'M_Rdy', 'kN.m');
  positif(mrdz, 'M_Rdz', 'kN.m');
  const fcd = gen === '2004' ? fcd2004(e.fck) : fcd2023(e.fck);
  const fyd = e.fyk / (gen === '2004' ? GAMMA_S_2004 : GAMMA_S_2023);
  const NRd = (e.b * e.h * fcd + e.As * fyd) / 1000;
  const r = e.NEd / NRd;
  const a = exposant(r);
  const somme = (Math.abs(e.MEdz) / mrdz) ** a + (Math.abs(e.MEdy) / mrdy) ** a;
  return {
    statut: { etat: 'calcule' },
    sollicitation: somme,
    resistance: 1,
    intermediaires: {
      f_cd: calculee(fcd, 'MPa'),
      N_Rd: calculee(NRd, 'kN'),
      'N_Ed/N_Rd': calculee(r, '-'),
      a: calculee(a, '-'),
      M_Rdy: saisie(mrdy, 'kN·m'),
      M_Rdz: saisie(mrdz, 'kN·m'),
    },
    clauses: gen === '2004' ? ['5.8.9(4)', '(5.39)'] : ['7.4.4(5)', '8.1.1(8)', '(8.2)', '(8.3)'],
  };
}

function niveaux(gen: Generation): DefinitionNiveau<EntreeFlexionDeviee>[] {
  return [
    {
      id: 'dispense',
      ordre: 1,
      position: 'corps',
      clause: gen === '2004' ? '5.8.9(3)' : '7.4.4(4)',
      hypothese: 'niveau.fd.dispense',
      donneesRequises: [R.b, R.h, R.lambdaY, R.lambdaZ, R.NEd, R.MEdy, R.MEdz],
      conditions: conditionsDispense,
      calculer: (e) => dispense(e as Complete, gen === '2004' ? ['5.8.9(3)', '(5.38a)', '(5.38b)'] : ['7.4.4(4)', '(7.29)', '(7.30)']),
    },
    {
      id: 'interaction',
      ordre: 2,
      position: 'corps',
      clause: gen === '2004' ? '5.8.9(4)' : '8.1.1(8)',
      hypothese: 'niveau.fd.interaction',
      donneesRequises: [R.b, R.h, R.NEd, R.MEdy, R.MEdz, R.fck, R.fyk, R.As, ...(gen === '2004' ? [R.MRdy2004, R.MRdz2004] : [R.MRdy2023, R.MRdz2023])],
      domaine: (e) => ((e.fck as number) > 90 ? 'motif.fck-sup-90' : null),
      conditions: () => null,
      calculer: (e) => interaction(gen, e as Complete),
    },
  ];
}

export const flexionDeviee: Mecanisme<EntreeFlexionDeviee> = {
  id: 'flexion-deviee',
  version: '0.1.0',
  titre: 'meca.fd.titre',
  champs: [
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'lambdaY', libelle: 'champ.lambda-y', symbole: 'λ_y', unite: '-' },
    { type: 'nombre', id: 'lambdaZ', libelle: 'champ.lambda-z', symbole: 'λ_z', unite: '-' },
    { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-compression', symbole: 'N_Ed', unite: 'kN' },
    { type: 'nombre', id: 'MEdy', libelle: 'champ.MEdy', symbole: 'M_Edy', unite: 'kN·m' },
    { type: 'nombre', id: 'MEdz', libelle: 'champ.MEdz', symbole: 'M_Edz', unite: 'kN·m' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'As', libelle: 'champ.As-total', symbole: 'A_s', unite: 'mm²' },
    { type: 'nombre', id: 'MRdy2004', libelle: 'champ.MRdy2004', symbole: 'M_Rdy 2004', unite: 'kN·m', facultatif: true },
    { type: 'nombre', id: 'MRdz2004', libelle: 'champ.MRdz2004', symbole: 'M_Rdz 2004', unite: 'kN·m', facultatif: true },
    { type: 'nombre', id: 'MRdy2023', libelle: 'champ.MRdy2023', symbole: 'M_Rdy 2023', unite: 'kN·m', facultatif: true },
    { type: 'nombre', id: 'MRdz2023', libelle: 'champ.MRdz2023', symbole: 'M_Rdz 2023', unite: 'kN·m', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.interaction-deviee', unite: '-' },
  resistance: { libelle: 'grandeur.unite', unite: '-' },
  niveaux: { 'ec2-2004': niveaux('2004'), 'ec2-2023': niveaux('2023') },
};
