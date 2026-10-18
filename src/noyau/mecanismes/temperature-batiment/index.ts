/**
 * Composante de temperature uniforme d un element de batiment a une couche
 * et effort de bridage correspondant.
 *
 * Unites : degres C, MPa, mm2, kN.
 *
 * Premiere generation (EN 1991-1-5:2003, 5.3, (5.1), tableaux 5.1 a 5.3, texte
 *   non detenu, a relire) et deuxieme generation (EN 1991-1-5:2025, 7.2, 7.3,
 *   (7.1), tableau 7.1) : T_N = (T_in + T_out)/2 pour un element a une couche ;
 *   Delta T_N = T_N - T_0.
 * Choix de l outil : bridage total, N = E A alpha_T Delta T_N (illustration) ;
 *   T_in, T_out, T_0, E, A et alpha_T saisis.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeTemperatureBatiment {
  Tin?: number;
  Tout?: number;
  T0?: number;
  E?: number;
  A?: number;
  alpha?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeTemperatureBatiment>;

const R = {
  Tin: { champ: 'Tin', libelle: 'champ.Tin' },
  Tout: { champ: 'Tout', libelle: 'champ.Tout' },
  T0: { champ: 'T0', libelle: 'champ.T0-element' },
  E: { champ: 'E', libelle: 'champ.E-module' },
  A: { champ: 'A', libelle: 'champ.A-section' },
  alpha: { champ: 'alpha', libelle: 'champ.alpha-T' },
} as const satisfies Record<string, { champ: keyof EntreeTemperatureBatiment; libelle: Cle }>;

export function bridage(e: Complete, clauses: string[]): Calcul {
  positif(e.E, 'E', 'MPa');
  positif(e.A, 'A', 'mm2');
  positif(e.alpha, 'alpha', '1/K');
  const TN = (e.Tin + e.Tout) / 2;
  const dT = TN - e.T0;
  const N = (e.E * e.A * e.alpha * dT) / 1000;
  return { statut: { etat: 'calcule' }, sollicitation: Math.abs(N), intermediaires: { T_N: calculee(TN, '°C'), 'ΔT_N': calculee(dT, '°C'), 'α_T': saisie(e.alpha, '1/K'), N: calculee(N, 'kN') }, clauses };
}

function niveau(clause: string, hypothese: Cle, clauses: string[]): DefinitionNiveau<EntreeTemperatureBatiment> {
  return { id: 'bridage', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: [R.Tin, R.Tout, R.T0, R.E, R.A, R.alpha], conditions: () => null, calculer: (e) => bridage(e as Complete, clauses) };
}

export const temperatureBatiment: Mecanisme<EntreeTemperatureBatiment> = {
  id: 'temperature-batiment',
  version: '0.1.0',
  titre: 'meca.tbat.titre',
  generations: ['en1991-1-5-2003', 'en1991-1-5-2025'],
  champs: [
    { type: 'nombre', id: 'Tin', libelle: 'champ.Tin', symbole: 'T_in', unite: '°C' },
    { type: 'nombre', id: 'Tout', libelle: 'champ.Tout', symbole: 'T_out', unite: '°C' },
    { type: 'nombre', id: 'T0', libelle: 'champ.T0-element', symbole: 'T_0', unite: '°C' },
    { type: 'nombre', id: 'E', libelle: 'champ.E-module', symbole: 'E', unite: 'MPa' },
    { type: 'nombre', id: 'A', libelle: 'champ.A-section', symbole: 'A', unite: 'mm²' },
    { type: 'nombre', id: 'alpha', libelle: 'champ.alpha-T', symbole: 'α_T', unite: '1/K' },
  ],
  sollicitation: { libelle: 'grandeur.effort-bridage', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-5-2003': [niveau('5.3', 'niveau.tbat.2003', ['5.3', '(5.1)'])],
    'en1991-1-5-2025': [niveau('7.3', 'niveau.tbat.2025', ['7.2', '7.3', '(7.1)'])],
  },
};
