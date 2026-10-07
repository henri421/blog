/**
 * Diametre minimal des mandrins de cintrage des barres faconnees.
 *
 * Unites : mm, MPa, N pour l effort F_bt.
 *
 * Endommagement de l armature, memes valeurs dans les deux generations :
 *   phi_m,min = 4 phi pour phi <= 16 mm, 7 phi au-dela (tableau 8.1N a),
 *   valeurs recommandees ; 11.3(2), barres non soudees ou soudures a au
 *   moins 3 phi de la courbure).
 * Rupture du beton dans la courbure, premiere generation (8.3(3), (8.1)) :
 *   phi_m,min >= F_bt (1/a_b + 1/(2 phi)) / f_cd, F_bt = sigma_sd A_s,
 *   f_cd plafonnee a celle du C55/67 ; a_b demi-entraxe des barres
 *   perpendiculairement au plan du coude, ou enrobage + phi/2 en rive.
 * Choix de l outil : les dispenses de verification du beton (8.3(3) ;
 *   11.3(3)) sont decrites dans l article, pas evaluees ; la verification de
 *   la deuxieme generation (11.1), (11.2) n est pas codee (lecture de la
 *   formule a confirmer) ; les barres soudees et treillis cintres apres
 *   soudage (tableau 8.1N b)) ne sont pas traites.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { fcd2004, positif } from '../../materiaux';

export interface EntreeMandrin {
  phi?: number;
  /** Diametre du mandrin prevu (mm). */
  phiMand?: number;
  fck?: number;
  /** Contrainte de calcul dans la barre au debut du coude (MPa). */
  sigmaSd?: number;
  /** Demi-entraxe perpendiculaire au plan du coude, ou enrobage + phi/2 en rive (mm). */
  ab?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeMandrin>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  phiMand: { champ: 'phiMand', libelle: 'champ.phiMand' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
  ab: { champ: 'ab', libelle: 'champ.ab-mandrin' },
} as const satisfies Record<string, { champ: keyof EntreeMandrin; libelle: Cle }>;

/** Rapport phi_m,min / phi contre l endommagement de l armature. */
export function rapportMandrin(phi: number): number {
  return phi <= 16 ? 4 : 7;
}

export function mandrinDommage(e: Complete, clauses: string[]): Calcul {
  positif(e.phi, 'phi', 'mm');
  positif(e.phiMand, 'phi_mand', 'mm');
  const k = rapportMandrin(e.phi);
  return {
    statut: { etat: 'calcule' },
    sollicitation: k * e.phi,
    resistance: e.phiMand,
    intermediaires: {
      'φ_m,min / φ': recommandee(k, '-'),
      'φ_m,min': calculee(k * e.phi, 'mm'),
      φ_mand: saisie(e.phiMand, 'mm'),
    },
    clauses,
  };
}

export function mandrinBeton2004(e: Complete): Calcul {
  positif(e.phi, 'phi', 'mm');
  positif(e.phiMand, 'phi_mand', 'mm');
  positif(e.sigmaSd, 'sigma_sd', 'MPa');
  positif(e.ab, 'a_b', 'mm');
  const As = (Math.PI * e.phi ** 2) / 4;
  const Fbt = e.sigmaSd * As;
  const fcd = fcd2004(Math.min(e.fck, 55));
  const phim = (Fbt * (1 / e.ab + 1 / (2 * e.phi))) / fcd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: phim,
    resistance: e.phiMand,
    intermediaires: {
      F_bt: calculee(Fbt / 1000, 'kN'),
      f_cd: calculee(fcd, 'MPa'),
      'φ_m,min': calculee(phim, 'mm'),
      φ_mand: saisie(e.phiMand, 'mm'),
    },
    clauses: ['8.3(3)', '(8.1)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeMandrin>[] = [
  {
    id: 'dommage',
    ordre: 1,
    position: 'corps',
    clause: '8.3(2)',
    hypothese: 'niveau.man.dommage',
    donneesRequises: [R.phi, R.phiMand],
    conditions: () => null,
    calculer: (e) => mandrinDommage(e as Complete, ['8.3(2)', 'tableau 8.1N a)']),
  },
  {
    id: 'beton',
    ordre: 2,
    position: 'corps',
    clause: '8.3(3)',
    hypothese: 'niveau.man.2004.beton',
    donneesRequises: [R.phi, R.phiMand, R.fck, R.sigmaSd, R.ab],
    conditions: () => null,
    calculer: (e) => mandrinBeton2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeMandrin>[] = [
  {
    id: 'dommage',
    ordre: 1,
    position: 'corps',
    clause: '11.3(2)',
    hypothese: 'niveau.man.dommage',
    donneesRequises: [R.phi, R.phiMand],
    conditions: () => null,
    calculer: (e) => mandrinDommage(e as Complete, ['11.3(2)']),
  },
];

export const mandrin: Mecanisme<EntreeMandrin> = {
  id: 'mandrin',
  version: '0.1.0',
  titre: 'meca.man.titre',
  champs: [
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'phiMand', libelle: 'champ.phiMand', symbole: 'φ_mand', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'sigmaSd', libelle: 'champ.sigmaSd', symbole: 'σ_sd', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'ab', libelle: 'champ.ab-mandrin', symbole: 'a_b', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.mandrin-requis', unite: 'mm' },
  resistance: { libelle: 'grandeur.mandrin-prevu', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
