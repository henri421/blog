/**
 * Pourcentage minimal d armatures d effort tranchant des poutres.
 *
 * Unites : mm, MPa.
 *
 * rho_w = A_sw / (s b_w sin alpha) ((9.4) ; (12.4)).
 * Premiere generation (9.2.2(5)) : rho_w,min = 0,08 sqrt(fck) / fyk (9.5N).
 * Deuxieme generation (12.2(4)) : meme minimum (12.4) ; il est permis de le
 *   reduire de 10 % pour un acier de classe B et de 20 % pour la classe C.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeArmatureTranchantMinimale {
  /** Section d un cours d armatures d effort tranchant (mm2). */
  Asw?: number;
  /** Espacement des cours (mm). */
  s?: number;
  bw?: number;
  /** Angle des armatures sur l axe de la poutre (degres). */
  alpha?: number;
  fck?: number;
  fyk?: number;
  /** Classe de ductilite : 'A', 'B' ou 'C'. */
  classe?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeArmatureTranchantMinimale>;

const R = {
  Asw: { champ: 'Asw', libelle: 'champ.Asw' },
  s: { champ: 's', libelle: 'champ.s-cours' },
  bw: { champ: 'bw', libelle: 'champ.bw' },
  alpha: { champ: 'alpha', libelle: 'champ.alpha-armatures' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  classe: { champ: 'classe', libelle: 'champ.classe-ductilite' },
} as const satisfies Record<string, { champ: keyof EntreeArmatureTranchantMinimale; libelle: Cle }>;

const communs = [R.Asw, R.s, R.bw, R.alpha, R.fck, R.fyk];

function domaine(e: EntreeArmatureTranchantMinimale): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function rhoW(e: Complete): number {
  positif(e.Asw, 'A_sw', 'mm2');
  positif(e.s, 's', 'mm');
  positif(e.bw, 'b_w', 'mm');
  positif(e.fyk, 'fyk', 'MPa');
  if (!(e.alpha >= 45 && e.alpha <= 90)) throw new Error('alpha doit etre compris entre 45 et 90 degres.');
  return e.Asw / (e.s * e.bw * Math.sin((e.alpha * Math.PI) / 180));
}

function cellule(e: Complete, reduction: number, clauses: string[]): Calcul {
  const rho = rhoW(e);
  const base = (0.08 * Math.sqrt(e.fck)) / e.fyk;
  const min = base * (1 - reduction);
  return {
    statut: { etat: 'calcule' },
    sollicitation: min,
    resistance: rho,
    intermediaires: {
      'ρ_w': calculee(rho, '-'),
      '0,08 √f_ck / f_yk': calculee(base, '-'),
      ...(reduction > 0 ? { 'réduction de ductilité': recommandee(reduction, '-') } : {}),
      'ρ_w,min': calculee(min, '-'),
    },
    clauses,
  };
}

/** Reduction permise selon la classe de ductilite (12.2(4)). */
export function reductionDuctilite(classe: string): number {
  if (classe === 'C') return 0.2;
  if (classe === 'B') return 0.1;
  return 0;
}

const niveaux2004: DefinitionNiveau<EntreeArmatureTranchantMinimale>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '9.2.2(5)',
    hypothese: 'niveau.atm.2004.base',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => cellule(e as Complete, 0, ['9.2.2(5)', '(9.4)', '(9.5N)']),
  },
];

const niveaux2023: DefinitionNiveau<EntreeArmatureTranchantMinimale>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '12.2(4)',
    hypothese: 'niveau.atm.2023.base',
    donneesRequises: communs,
    domaine,
    conditions: () => null,
    calculer: (e) => cellule(e as Complete, 0, ['12.2(4)', '(12.4)']),
  },
  {
    id: 'ductilite',
    ordre: 2,
    position: 'corps',
    clause: '12.2(4)',
    hypothese: 'niveau.atm.2023.ductilite',
    donneesRequises: [...communs, R.classe],
    domaine,
    conditions: () => null,
    calculer: (e) => cellule(e as Complete, reductionDuctilite((e as Complete).classe), ['12.2(4)', '(12.4)']),
  },
];

export const armatureTranchantMinimale: Mecanisme<EntreeArmatureTranchantMinimale> = {
  id: 'armature-tranchant-minimale',
  version: '0.1.0',
  titre: 'meca.atm.titre',
  champs: [
    { type: 'nombre', id: 'Asw', libelle: 'champ.Asw', symbole: 'A_sw', unite: 'mm²' },
    { type: 'nombre', id: 's', libelle: 'champ.s-cours', symbole: 's', unite: 'mm' },
    { type: 'nombre', id: 'bw', libelle: 'champ.bw', symbole: 'b_w', unite: 'mm' },
    { type: 'nombre', id: 'alpha', libelle: 'champ.alpha-armatures', symbole: 'α', unite: '°' },
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
  sollicitation: { libelle: 'grandeur.rho-w-min', unite: '-' },
  resistance: { libelle: 'grandeur.rho-w', unite: '-' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
