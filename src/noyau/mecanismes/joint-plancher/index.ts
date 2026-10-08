/**
 * Cisaillement dans les joints longitudinaux entre elements de plancher
 * prefabriques sous charge uniforme.
 *
 * Unites : kN/m2, m, kN/m.
 *
 * Meme expression dans les deux generations, a defaut d analyse plus precise :
 *   v_Ed = q_Ed b_e / 3 ((10.4) ; (13.13)), q_Ed la charge variable de calcul,
 *   b_e la largeur de l element. La resistance du joint v_Rd est saisie,
 *   determinee par l ingenieur selon le type de joint (6.2.5 ; 8.2.6).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeJointPlancher {
  /** Charge variable de calcul (kN/m2). */
  qEd?: number;
  /** Largeur de l element (m). */
  be?: number;
  /** Resistance du joint par unite de longueur (kN/m). */
  vRd?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeJointPlancher>;

const R = {
  qEd: { champ: 'qEd', libelle: 'champ.qEd-plancher' },
  be: { champ: 'be', libelle: 'champ.be-element' },
  vRd: { champ: 'vRd', libelle: 'champ.vRd-joint' },
} as const satisfies Record<string, { champ: keyof EntreeJointPlancher; libelle: Cle }>;

export function jointPlancher(e: Complete, clauses: string[]): Calcul {
  positif(e.qEd, 'q_Ed', 'kN/m2');
  positif(e.be, 'b_e', 'm');
  positif(e.vRd, 'v_Rd', 'kN/m');
  const vEd = (e.qEd * e.be) / 3;
  return {
    statut: { etat: 'calcule' },
    sollicitation: vEd,
    resistance: e.vRd,
    intermediaires: { v_Ed: calculee(vEd, 'kN/m'), v_Rd: saisie(e.vRd, 'kN/m') },
    clauses,
  };
}

function niveau(gen: '2004' | '2023'): DefinitionNiveau<EntreeJointPlancher> {
  return {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '10.9.3' : '13.6.1',
    hypothese: 'niveau.jp.base',
    donneesRequises: [R.qEd, R.be, R.vRd],
    conditions: () => null,
    calculer: (e) => jointPlancher(e as Complete, gen === '2004' ? ['10.9.3(5)', '(10.4)'] : ['13.6.1(4)', '(13.13)']),
  };
}

export const jointPlancherMeca: Mecanisme<EntreeJointPlancher> = {
  id: 'joint-plancher',
  version: '0.1.0',
  titre: 'meca.jp.titre',
  champs: [
    { type: 'nombre', id: 'qEd', libelle: 'champ.qEd-plancher', symbole: 'q_Ed', unite: 'kN/m²' },
    { type: 'nombre', id: 'be', libelle: 'champ.be-element', symbole: 'b_e', unite: 'm' },
    { type: 'nombre', id: 'vRd', libelle: 'champ.vRd-joint', symbole: 'v_Rd', unite: 'kN/m' },
  ],
  sollicitation: { libelle: 'grandeur.cisaillement-joint', unite: 'kN/m' },
  resistance: { libelle: 'grandeur.resistance-joint', unite: 'kN/m' },
  niveaux: { 'ec2-2004': [niveau('2004')], 'ec2-2023': [niveau('2023')] },
};
