/**
 * Pression de reference du vent pour une phase d execution, selon sa duree.
 *
 * Unites : jours, m/s, Pa.
 *
 * Premiere generation (EN 1991-1-6:2005, 3.1(5), tableau 3.1, texte non
 *   detenu, a relire) : periode de retour de 2 ans (<= 3 jours), 5 ans
 *   (<= 3 mois), 10 ans (<= 1 an), 50 ans au-dela ; c_prob de l EN 1991-1-4.
 * Deuxieme generation (EN 1991-1-6:2026, 6.1, tableau 6.1) : <= 5 jours,
 *   donnees meteorologiques fiables sur la duree ; <= 1 an, probabilite
 *   annuelle 0,02 avec coefficient de saison ; > 1 an, 0,02 sans coefficient
 *   de saison.
 * Choix de l outil : c_dir = 1 ; rho = 1,25 kg/m3 ; c_season saisi (2026).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { RHO_AIR } from '../pression-pointe/index';
import { cprob } from '../vitesse-reference/index';

export interface EntreeExecutionClimat {
  duree?: number;
  vb0?: number;
  cseason?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  duree: { champ: 'duree', libelle: 'champ.duree-execution' },
  vb0: { champ: 'vb0', libelle: 'champ.vb0' },
} as const satisfies Record<string, { champ: keyof EntreeExecutionClimat; libelle: Cle }>;

export function retour2005(duree: number): number {
  return duree <= 3 ? 2 : duree <= 91 ? 5 : duree <= 365 ? 10 : 50;
}

function q(vb: number): number {
  return 0.5 * RHO_AIR * vb * vb;
}

function calcul2005(e: EntreeExecutionClimat): Calcul {
  positif(e.duree as number, 'duree', 'j');
  positif(e.vb0 as number, 'vb0', 'm/s');
  const T = retour2005(e.duree as number);
  const cp = cprob(T);
  const vb = cp * (e.vb0 as number);
  return { statut: { etat: 'calcule' }, sollicitation: q(vb), intermediaires: { T: recommandee(T, 'ans'), c_prob: calculee(cp, '-'), v_b: calculee(vb, 'm/s'), q_b: calculee(q(vb), 'Pa') }, clauses: ['3.1(5)', 'tableau 3.1'] };
}

function calcul2026(e: EntreeExecutionClimat): Calcul {
  positif(e.duree as number, 'duree', 'j');
  positif(e.vb0 as number, 'vb0', 'm/s');
  const cs = (e.duree as number) <= 365 ? (e.cseason ?? 1) : 1;
  if (!(cs > 0 && cs <= 1)) throw new Error('cseason doit etre compris entre 0 et 1.');
  const vb = cs * (e.vb0 as number);
  return { statut: { etat: 'calcule' }, sollicitation: q(vb), intermediaires: { T: recommandee(50, 'ans'), c_season: saisie(cs, '-'), v_b: calculee(vb, 'm/s'), q_b: calculee(q(vb), 'Pa') }, clauses: ['6.1', 'tableau 6.1'] };
}

const niveau2005: DefinitionNiveau<EntreeExecutionClimat> = { id: 'qb', ordre: 1, position: 'corps', clause: '3.1', hypothese: 'niveau.exec.2005', donneesRequises: [R.duree, R.vb0], conditions: () => null, calculer: calcul2005 };
const niveau2026: DefinitionNiveau<EntreeExecutionClimat> = {
  id: 'qb',
  ordre: 1,
  position: 'corps',
  clause: '6.1',
  hypothese: 'niveau.exec.2026',
  donneesRequises: [R.duree, R.vb0],
  conditions: (e) => (e.duree !== undefined && e.duree <= 5 ? 'motif.exec-meteo' : null),
  calculer: calcul2026,
};

export const executionClimat: Mecanisme<EntreeExecutionClimat> = {
  id: 'execution-climat',
  version: '0.1.0',
  titre: 'meca.exec.titre',
  generations: ['en1991-1-6-2005', 'en1991-1-6-2026'],
  champs: [
    { type: 'nombre', id: 'duree', libelle: 'champ.duree-execution', symbole: 'd', unite: 'jours' },
    { type: 'nombre', id: 'vb0', libelle: 'champ.vb0', symbole: 'v_b,0', unite: 'm/s' },
    { type: 'nombre', id: 'cseason', libelle: 'champ.cseason', symbole: 'c_season', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.qb', unite: 'Pa' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-6-2005': [niveau2005], 'en1991-1-6-2026': [niveau2026] },
};
