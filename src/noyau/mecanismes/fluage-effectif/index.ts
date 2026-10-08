/**
 * Coefficient de fluage effectif pour l analyse du second ordre.
 *
 * Unites : kN, kN.m, mm, sans dimension.
 *
 * Premiere generation (5.8.4) : phi_ef = phi(inf, t_0) M_0Eqp/M_0Ed (5.19) ;
 *   phi_ef = 0 admis si phi(inf, t_0) <= 2, lambda <= 75 et M_0Ed/N_Ed >= h
 *   (5.8.4(4)).
 * Deuxieme generation (7.4.2) : elements isoles et effets locaux
 *   phi_eff,b = phi(t_DL, t_0) M_0Eqp/M_0Ed (7.27) ; effets globaux
 *   phi_eff,s = phi(t_DL, t_0) delta_0Eqp/delta_Ed (7.26), deplacements
 *   horizontaux a court terme en sections non fissurees ; aucune dispense
 *   relevee.
 * Le coefficient de fluage est saisi (tableau 5.2 ou annexe B ; 3.1.4).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeFluageEffectif {
  /** Coefficient de fluage final (2004) ou a la duree d utilisation (2023). */
  phi?: number;
  /** Moments du premier ordre quasi permanent et de calcul (kN.m). */
  M0Eqp?: number;
  M0Ed?: number;
  /** Elancement, effort normal de calcul (kN) et hauteur de section (mm), pour la dispense de 2004. */
  lambda?: number;
  NEd?: number;
  h?: number;
  /** Deplacements horizontaux quasi permanent et de calcul (mm), effets globaux 2023. */
  delta0Eqp?: number;
  deltaEd?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFluageEffectif>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi-fluage' },
  M0Eqp: { champ: 'M0Eqp', libelle: 'champ.M0Eqp' },
  M0Ed: { champ: 'M0Ed', libelle: 'champ.M0Ed' },
  lambda: { champ: 'lambda', libelle: 'champ.lambda' },
  NEd: { champ: 'NEd', libelle: 'champ.NEd-compression' },
  h: { champ: 'h', libelle: 'champ.h' },
  delta0Eqp: { champ: 'delta0Eqp', libelle: 'champ.delta0Eqp' },
  deltaEd: { champ: 'deltaEd', libelle: 'champ.deltaEd' },
} as const satisfies Record<string, { champ: keyof EntreeFluageEffectif; libelle: Cle }>;

function rapportMoments(e: Complete, clauses: string[]): Calcul {
  positif(e.phi, 'phi', '-');
  positif(e.M0Ed, 'M_0Ed', 'kN.m');
  if (!(Number.isFinite(e.M0Eqp) && e.M0Eqp >= 0 && e.M0Eqp <= e.M0Ed)) throw new Error('Il faut 0 <= M_0Eqp <= M_0Ed.');
  const r = e.M0Eqp / e.M0Ed;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.phi * r,
    intermediaires: { 'φ': saisie(e.phi, '-'), 'M_0Eqp/M_0Ed': calculee(r, '-'), 'φ_ef': calculee(e.phi * r, '-') },
    clauses,
  };
}

function conditionsNegligeable(e: EntreeFluageEffectif): Cle | null {
  const ok =
    (e.phi as number) <= 2 && (e.lambda as number) <= 75 && ((e.M0Ed as number) * 1000) / (e.NEd as number) >= (e.h as number);
  return ok ? null : 'motif.fluage-non-negligeable';
}

export function negligeable2004(e: Complete): Calcul {
  positif(e.NEd, 'N_Ed', 'kN');
  positif(e.h, 'h', 'mm');
  return {
    statut: { etat: 'calcule' },
    sollicitation: 0,
    intermediaires: { 'M_0Ed/N_Ed': calculee((e.M0Ed * 1000) / e.NEd, 'mm'), h: saisie(e.h, 'mm'), 'φ_ef': calculee(0, '-') },
    clauses: ['5.8.4(4)'],
  };
}

export function global2023(e: Complete): Calcul {
  positif(e.phi, 'phi', '-');
  positif(e.deltaEd, 'delta_Ed', 'mm');
  if (!(Number.isFinite(e.delta0Eqp) && e.delta0Eqp >= 0 && e.delta0Eqp <= e.deltaEd)) throw new Error('Il faut 0 <= delta_0Eqp <= delta_Ed.');
  const r = e.delta0Eqp / e.deltaEd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.phi * r,
    intermediaires: { 'δ_0Eqp/δ_Ed': calculee(r, '-'), 'φ_eff,s': calculee(e.phi * r, '-') },
    clauses: ['7.4.2(2)', '(7.26)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeFluageEffectif>[] = [
  {
    id: 'moments',
    ordre: 1,
    position: 'corps',
    clause: '5.8.4',
    hypothese: 'niveau.fe.2004.moments',
    donneesRequises: [R.phi, R.M0Eqp, R.M0Ed],
    conditions: () => null,
    calculer: (e) => rapportMoments(e as Complete, ['5.8.4(2)', '(5.19)']),
  },
  {
    id: 'negligeable',
    ordre: 2,
    position: 'corps',
    clause: '5.8.4(4)',
    hypothese: 'niveau.fe.2004.negligeable',
    donneesRequises: [R.phi, R.M0Ed, R.lambda, R.NEd, R.h],
    conditions: conditionsNegligeable,
    calculer: (e) => negligeable2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeFluageEffectif>[] = [
  {
    id: 'moments',
    ordre: 1,
    position: 'corps',
    clause: '7.4.2',
    hypothese: 'niveau.fe.2023.moments',
    donneesRequises: [R.phi, R.M0Eqp, R.M0Ed],
    conditions: () => null,
    calculer: (e) => rapportMoments(e as Complete, ['7.4.2(2)', '(7.27)']),
  },
  {
    id: 'global',
    ordre: 2,
    position: 'corps',
    clause: '7.4.2',
    hypothese: 'niveau.fe.2023.global',
    donneesRequises: [R.phi, R.delta0Eqp, R.deltaEd],
    conditions: () => null,
    calculer: (e) => global2023(e as Complete),
  },
];

export const fluageEffectif: Mecanisme<EntreeFluageEffectif> = {
  id: 'fluage-effectif',
  version: '0.1.0',
  titre: 'meca.fe.titre',
  champs: [
    { type: 'nombre', id: 'phi', libelle: 'champ.phi-fluage', symbole: 'φ', unite: '-' },
    { type: 'nombre', id: 'M0Eqp', libelle: 'champ.M0Eqp', symbole: 'M_0Eqp', unite: 'kN·m' },
    { type: 'nombre', id: 'M0Ed', libelle: 'champ.M0Ed', symbole: 'M_0Ed', unite: 'kN·m' },
    { type: 'nombre', id: 'lambda', libelle: 'champ.lambda', symbole: 'λ', unite: '-', facultatif: true },
    { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-compression', symbole: 'N_Ed', unite: 'kN', facultatif: true },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'delta0Eqp', libelle: 'champ.delta0Eqp', symbole: 'δ_0Eqp', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'deltaEd', libelle: 'champ.deltaEd', symbole: 'δ_Ed', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.phi-ef', unite: '-' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
