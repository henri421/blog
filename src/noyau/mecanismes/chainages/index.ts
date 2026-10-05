/**
 * Chainages de robustesse des batiments a ossature : efforts de traction a
 * reprendre par les chainages peripheriques et interieurs.
 *
 * Unites : kN, kN/m2, m pour les portees et espacements, MPa.
 *
 * Premiere generation (9.10.2, valeurs recommandees) : chainage peripherique
 *   F_tie,per = l_i q_1 <= q_2, q_1 = 10 kN/m, q_2 = 70 kN (9.15) ; chainage
 *   interieur F_tie,int = 20 kN par metre de largeur, soit 20 s_t pour un
 *   chainage regroupant une largeur s_t.
 * Deuxieme generation (12.9.3, tableau 12.5) : renvoi a l EN 1991-1-7:2025,
 *   annexe A (informative), structures a ossature (A.3.1) :
 *   T_i = max(0,8 (g_k + psi q_k) s_t L_t ; 75 kN) (A.1),
 *   T_p = max(0,4 (g_k + psi q_k) s_t L_t ; 75 kN) (A.2).
 * Dans les deux generations, les armatures travaillent a f_yk (9.10.2.1 ;
 * 12.9.1(4)) : A_s = T / f_yk.
 * Choix de l outil : murs porteurs (A.3.2, formules (A.3), (A.4)) non codes ;
 * chainages groupes sur les lignes de poutres de 2004 (9.10.2.3(4)) non codes.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeChainages {
  /** 'peripherique' ou 'interieur'. */
  type?: string;
  /** Charges caracteristiques verticales (kN/m2). */
  gk?: number;
  qk?: number;
  /** Coefficient de combinaison de la situation accidentelle. */
  psi?: number;
  /** Espacement des chainages s_t (m) et portee du chainage L_t (m). */
  st?: number;
  Lt?: number;
  fyk?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeChainages>;
const N_PAR_KN = 1000;

const R = {
  type: { champ: 'type', libelle: 'champ.type-chainage' },
  gk: { champ: 'gk', libelle: 'champ.gk-surfacique' },
  qk: { champ: 'qk', libelle: 'champ.qk-surfacique' },
  psi: { champ: 'psi', libelle: 'champ.psi-accidentel' },
  st: { champ: 'st', libelle: 'champ.st-chainage' },
  Lt: { champ: 'Lt', libelle: 'champ.Lt-chainage' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
} as const satisfies Record<string, { champ: keyof EntreeChainages; libelle: Cle }>;

function cellule(e: Complete, T: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  positif(e.fyk, 'fyk', 'MPa');
  const As = (T * N_PAR_KN) / e.fyk;
  return { statut: { etat: 'calcule' }, resistance: T, intermediaires: { ...inter, T: calculee(T, 'kN'), A_s: calculee(As, 'mm²') }, clauses };
}

export function chainages2004(e: Complete): Calcul {
  positif(e.st, 's_t', 'm');
  positif(e.Lt, 'L_t', 'm');
  if (e.type === 'peripherique') {
    const T = Math.min(10 * e.Lt, 70);
    return cellule(e, T, { q_1: recommandee(10, 'kN/m'), q_2: recommandee(70, 'kN') }, ['9.10.2.2', '(9.15)']);
  }
  const T = 20 * e.st;
  return cellule(e, T, { F_tie_int: recommandee(20, 'kN/m') }, ['9.10.2.3(3)']);
}

export function chainages2023(e: Complete): Calcul {
  positif(e.st, 's_t', 'm');
  positif(e.Lt, 'L_t', 'm');
  if (!(e.gk >= 0 && e.qk >= 0 && e.psi >= 0)) throw new Error('g_k, q_k et psi doivent etre positifs ou nuls.');
  const k = e.type === 'peripherique' ? 0.4 : 0.8;
  const charge = k * (e.gk + e.psi * e.qk) * e.st * e.Lt;
  const T = Math.max(charge, 75);
  return cellule(
    e,
    T,
    { coefficient: recommandee(k, '-'), 'k (g_k + ψ q_k) s_t L_t': calculee(charge, 'kN'), plancher: recommandee(75, 'kN') },
    e.type === 'peripherique' ? ['12.9.3', 'EN 1991-1-7 A.3.1', '(A.2)'] : ['12.9.3', 'EN 1991-1-7 A.3.1', '(A.1)'],
  );
}

const niveaux2004: DefinitionNiveau<EntreeChainages>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '9.10.2',
    hypothese: 'niveau.ch.2004.base',
    donneesRequises: [R.type, R.st, R.Lt, R.fyk],
    conditions: () => null,
    calculer: (e) => chainages2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeChainages>[] = [
  {
    id: 'ossature',
    ordre: 1,
    position: 'annexe-informative',
    reserve: 'reserve.en1991-1-7-a',
    clause: '12.9.3',
    hypothese: 'niveau.ch.2023.ossature',
    donneesRequises: [R.type, R.gk, R.qk, R.psi, R.st, R.Lt, R.fyk],
    conditions: () => null,
    calculer: (e) => chainages2023(e as Complete),
  },
];

export const chainages: Mecanisme<EntreeChainages> = {
  id: 'chainages',
  version: '0.1.0',
  titre: 'meca.ch.titre',
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-chainage',
      options: [
        { valeur: 'peripherique', libelle: 'option.ch.peripherique' },
        { valeur: 'interieur', libelle: 'option.ch.interieur' },
      ],
    },
    { type: 'nombre', id: 'gk', libelle: 'champ.gk-surfacique', symbole: 'g_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'qk', libelle: 'champ.qk-surfacique', symbole: 'q_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'psi', libelle: 'champ.psi-accidentel', symbole: 'ψ', unite: '-' },
    { type: 'nombre', id: 'st', libelle: 'champ.st-chainage', symbole: 's_t', unite: 'm' },
    { type: 'nombre', id: 'Lt', libelle: 'champ.Lt-chainage', symbole: 'L_t', unite: 'm' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.effort-chainage', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
