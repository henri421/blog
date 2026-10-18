/**
 * Efforts de calcul des tirants horizontaux de robustesse (situation de projet
 * accidentelle), batiments a ossature ou a murs porteurs.
 *
 * Unites : kN/m2 pour les charges, m pour les longueurs ; kN pour les tirants
 *   d ossature, kN/m pour les tirants de murs porteurs.
 *
 * Premiere generation (EN 1991-1-7:2006 + A1:2014, annexe A, A.5.1 et A.5.2,
 *   texte non detenu, a relire) et deuxieme generation (EN 1991-1-7:2025,
 *   annexe A, A.3.1 et A.3.2, (A.1) a (A.4)) : memes expressions.
 *   Ossature : T_i = max{0,8 (g_k + psi q_k) s_t L_t ; 75 kN} (A.1) ;
 *     T_p = max{0,4 (g_k + psi q_k) s_t L_t ; 75 kN} (A.2).
 *   Murs porteurs (classe 2b) : F_t = min{60 ; 20 + 4 n_s} kN/m ;
 *     T_i = max{F_t (g_k + psi q_k)/7,5 . z/5 ; F_t} (A.3) ; T_p = F_t (A.4).
 * Choix de l outil : z saisi (plus petite de 5 h_i et de la plus grande portee
 *   dans la direction du tirant) ; psi saisi (situation accidentelle).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeTirantsRobustesse {
  /** 'ossature' ou 'murs'. */
  type?: string;
  gk?: number;
  qk?: number;
  psi?: number;
  /** Espacement des tirants (ossature, m). */
  st?: number;
  /** Portee du tirant (ossature, m). */
  Lt?: number;
  /** Distance z (murs, m). */
  z?: number;
  /** Nombre de niveaux (murs). */
  ns?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeTirantsRobustesse>;

const R = {
  type: { champ: 'type', libelle: 'champ.type-batiment-tirants' },
  gk: { champ: 'gk', libelle: 'champ.gk-surfacique' },
  qk: { champ: 'qk', libelle: 'champ.qk-surfacique' },
  psi: { champ: 'psi', libelle: 'champ.psi-accidentel' },
  st: { champ: 'st', libelle: 'champ.st-tirants' },
  Lt: { champ: 'Lt', libelle: 'champ.Lt-tirant' },
  z: { champ: 'z', libelle: 'champ.z-tirant' },
  ns: { champ: 'ns', libelle: 'champ.ns-niveaux' },
} as const satisfies Record<string, { champ: keyof EntreeTirantsRobustesse; libelle: Cle }>;

function charge(e: Complete): number {
  positif(e.gk, 'gk', 'kN/m2');
  if (!(e.qk >= 0)) throw new Error('qk doit etre positif ou nul.');
  if (!(e.psi >= 0 && e.psi <= 1)) throw new Error('psi doit etre compris entre 0 et 1.');
  return e.gk + e.psi * e.qk;
}

export function ossature(e: Complete, coef: number): Calcul {
  const p = charge(e);
  positif(e.st, 'st', 'm');
  positif(e.Lt, 'Lt', 'm');
  const brut = coef * p * e.st * e.Lt;
  const T = Math.max(brut, 75);
  return { statut: { etat: 'calcule' }, sollicitation: T, intermediaires: { 'g_k + ψ q_k': calculee(p, 'kN/m²'), [`${coef} (g_k + ψ q_k) s_t L_t`]: calculee(brut, 'kN'), minimum: recommandee(75, 'kN'), T: calculee(T, 'kN') }, clauses: [coef === 0.8 ? '(A.1)' : '(A.2)'] };
}

export function ft(ns: number): number {
  return Math.min(60, 20 + 4 * ns);
}

export function murs(e: Complete, interne: boolean): Calcul {
  const p = charge(e);
  if (!(Number.isInteger(e.ns) && e.ns >= 1)) throw new Error('ns doit etre un entier au moins egal a 1.');
  const F = ft(e.ns);
  if (!interne) return { statut: { etat: 'calcule' }, sollicitation: F, intermediaires: { F_t: calculee(F, 'kN/m') }, clauses: ['(A.4)'] };
  positif(e.z, 'z', 'm');
  const brut = ((F * p) / 7.5) * (e.z / 5);
  const T = Math.max(brut, F);
  return { statut: { etat: 'calcule' }, sollicitation: T, intermediaires: { F_t: calculee(F, 'kN/m'), 'g_k + ψ q_k': calculee(p, 'kN/m²'), 'F_t (g_k + ψ q_k)/7,5 · z/5': calculee(brut, 'kN/m'), T_i: calculee(T, 'kN/m') }, clauses: ['(A.3)'] };
}

const estOssature = (e: EntreeTirantsRobustesse): boolean => e.type !== 'murs';

function niveaux(clauseOss: string, clauseMurs: string): DefinitionNiveau<EntreeTirantsRobustesse>[] {
  const base = { position: 'annexe-informative' as const, reserve: 'reserve.en1991-1-7-a' as Cle };
  return [
    { ...base, id: 'internes', ordre: 1, clause: clauseOss, hypothese: 'niveau.tirants.internes', donneesRequises: [R.type, R.gk, R.qk, R.psi], conditions: () => null, calculer: (e) => (estOssature(e) ? ossature({ ...(e as Complete) }, 0.8) : murs(e as Complete, true)) },
    { ...base, id: 'peripheriques', ordre: 2, clause: clauseMurs, hypothese: 'niveau.tirants.peripheriques', donneesRequises: [R.type, R.gk, R.qk, R.psi], conditions: () => null, calculer: (e) => (estOssature(e) ? ossature(e as Complete, 0.4) : murs(e as Complete, false)) },
  ];
}

export const tirantsRobustesse: Mecanisme<EntreeTirantsRobustesse> = {
  id: 'tirants-robustesse',
  version: '0.1.0',
  titre: 'meca.tirants.titre',
  generations: ['en1991-1-7-2006', 'en1991-1-7-2025'],
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-batiment-tirants',
      options: [
        { valeur: 'ossature', libelle: 'option.tirants.ossature' },
        { valeur: 'murs', libelle: 'option.tirants.murs' },
      ],
    },
    { type: 'nombre', id: 'gk', libelle: 'champ.gk-surfacique', symbole: 'g_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'qk', libelle: 'champ.qk-surfacique', symbole: 'q_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'psi', libelle: 'champ.psi-accidentel', symbole: 'ψ', unite: '-' },
    { type: 'nombre', id: 'st', libelle: 'champ.st-tirants', symbole: 's_t', unite: 'm', facultatif: true },
    { type: 'nombre', id: 'Lt', libelle: 'champ.Lt-tirant', symbole: 'L_t', unite: 'm', facultatif: true },
    { type: 'nombre', id: 'z', libelle: 'champ.z-tirant', symbole: 'z', unite: 'm', facultatif: true },
    { type: 'nombre', id: 'ns', libelle: 'champ.ns-niveaux', symbole: 'n_s', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-tirant', unite: 'kN ou kN/m' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-7-2006': niveaux('A.5.1', 'A.5.2'), 'en1991-1-7-2025': niveaux('A.3.1', 'A.3.2') },
};
