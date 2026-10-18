/**
 * Densite de charge calorifique de calcul d un compartiment.
 *
 * Unites : MJ/m2 ; coefficients sans dimension.
 *
 * Premiere generation (EN 1991-1-2:2002, annexe E, (E.1), texte non detenu, a
 *   relire) : q_f,d = q_f,k m delta_q1 delta_q2 delta_n.
 * Deuxieme generation (EN 1991-1-2:2024, annexe E, (E.1), tableaux E.1 a E.3) :
 *   q_d,fi = q_k,fi m delta_q1 delta_q2 delta_n delta_q3 ; delta_q3 = 0,83,
 *   1,0 ou 1,19 selon la classe de consequences (CC1 a CC3).
 * Choix de l outil : delta_q1, delta_q2 et le produit delta_n = Prod delta_ni
 *   saisis (tableaux E.1 et E.2 non reproduits).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeChargeCalorifique {
  qk?: number;
  m?: number;
  dq1?: number;
  dq2?: number;
  dn?: number;
  cc?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeChargeCalorifique>;

const R = {
  qk: { champ: 'qk', libelle: 'champ.qk-calorifique' },
  m: { champ: 'm', libelle: 'champ.m-combustion' },
  dq1: { champ: 'dq1', libelle: 'champ.delta-q1' },
  dq2: { champ: 'dq2', libelle: 'champ.delta-q2' },
  dn: { champ: 'dn', libelle: 'champ.delta-n' },
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
} as const satisfies Record<string, { champ: keyof EntreeChargeCalorifique; libelle: Cle }>;

export function deltaQ3(cc: string): number {
  return cc === 'CC3' ? 1.19 : cc === 'CC1' ? 0.83 : 1.0;
}

function calculer(e: Complete, avecQ3: boolean, clauses: string[]): Calcul {
  for (const [v, k] of [
    [e.qk, 'qk'],
    [e.m, 'm'],
    [e.dq1, 'dq1'],
    [e.dq2, 'dq2'],
    [e.dn, 'dn'],
  ] as const)
    positif(v, k, '-');
  const d3 = avecQ3 ? deltaQ3(e.cc) : 1;
  const q = e.qk * e.m * e.dq1 * e.dq2 * e.dn * d3;
  const inter: Cellule['intermediaires'] = { q_k: saisie(e.qk, 'MJ/m²'), m: saisie(e.m, '-'), 'δ_q1 δ_q2': calculee(e.dq1 * e.dq2, '-'), 'δ_n': saisie(e.dn, '-') };
  if (avecQ3) inter['δ_q3'] = recommandee(d3, '-');
  inter.q_d = calculee(q, 'MJ/m²');
  return { statut: { etat: 'calcule' }, sollicitation: q, intermediaires: inter, clauses };
}

const base = [R.qk, R.m, R.dq1, R.dq2, R.dn];

function niveau(avecQ3: boolean, h: string, clauses: string[]): DefinitionNiveau<EntreeChargeCalorifique> {
  return {
    id: 'qd',
    ordre: 1,
    position: 'annexe-informative',
    reserve: 'reserve.en1991-1-2-e',
    clause: 'E.3',
    hypothese: `niveau.calorifique.${h}` as Cle,
    donneesRequises: avecQ3 ? [...base, R.cc] : base,
    conditions: () => null,
    calculer: (e) => calculer(e as Complete, avecQ3, clauses),
  };
}

export const chargeCalorifique: Mecanisme<EntreeChargeCalorifique> = {
  id: 'charge-calorifique',
  version: '0.1.0',
  titre: 'meca.calorifique.titre',
  generations: ['en1991-1-2-2002', 'en1991-1-2-2024'],
  champs: [
    { type: 'nombre', id: 'qk', libelle: 'champ.qk-calorifique', symbole: 'q_k', unite: 'MJ/m²' },
    { type: 'nombre', id: 'm', libelle: 'champ.m-combustion', symbole: 'm', unite: '-' },
    { type: 'nombre', id: 'dq1', libelle: 'champ.delta-q1', symbole: 'δ_q1', unite: '-' },
    { type: 'nombre', id: 'dq2', libelle: 'champ.delta-q2', symbole: 'δ_q2', unite: '-' },
    { type: 'nombre', id: 'dn', libelle: 'champ.delta-n', symbole: 'δ_n', unite: '-' },
    {
      type: 'choix',
      id: 'cc',
      libelle: 'champ.classe-consequences',
      options: [
        { valeur: 'CC1', libelle: 'option.cc.CC1' },
        { valeur: 'CC2', libelle: 'option.cc.CC2' },
        { valeur: 'CC3', libelle: 'option.cc.CC3' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.charge-calorifique', unite: 'MJ/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-2-2002': [niveau(false, '2002', ['E.1', '(E.1)'])],
    'en1991-1-2-2024': [niveau(true, '2024', ['E.3', '(E.1)', 'tableau E.3'])],
  },
};
