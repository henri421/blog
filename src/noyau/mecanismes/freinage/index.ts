/**
 * Forces horizontales des ponts routiers : freinage et acceleration, force
 * centrifuge.
 *
 * Unites : m, kN.
 *
 * Premiere generation (EN 1991-2:2003, 4.4.1, (4.6), 4.4.2, tableau 4.3,
 *   texte non detenu, a relire) et deuxieme generation (EN 1991-2:2023,
 *   6.4.1, (6.5), 6.4.2, tableau 6.4) : memes expressions.
 *   Q_Lk = 0,6 alpha_Q1 (2 x 300) + 0,10 alpha_q1 x 9 x w_1 x L, borne entre
 *   180 alpha_Q1 et 900 kN ; Q_tk = 0,2 Q_v (r < 200 m), 40 Q_v / r
 *   (200 <= r <= 1500 m), 0 au-dela, Q_v = charge totale des tandems.
 * Choix de l outil : w_1 = 3 m par defaut ; Q_v saisi.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeFreinage {
  L?: number;
  w1?: number;
  alphaQ1?: number;
  alphaq1?: number;
  r?: number;
  Qv?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  L: { champ: 'L', libelle: 'champ.L-tablier' },
  r: { champ: 'r', libelle: 'champ.r-courbure-plan' },
  Qv: { champ: 'Qv', libelle: 'champ.Qv-tandems' },
} as const satisfies Record<string, { champ: keyof EntreeFreinage; libelle: Cle }>;

export function qLk(L: number, w1 = 3, aQ = 1, aq = 1): { brut: number; Q: number } {
  const brut = 0.6 * aQ * 2 * 300 + 0.1 * aq * 9 * w1 * L;
  return { brut, Q: Math.min(Math.max(brut, 180 * aQ), 900) };
}

export function qtk(r: number, Qv: number): number {
  return r < 200 ? 0.2 * Qv : r <= 1500 ? (40 * Qv) / r : 0;
}

function freinage(e: EntreeFreinage, clauses: string[]): Calcul {
  positif(e.L as number, 'L', 'm');
  const q = qLk(e.L as number, e.w1 ?? 3, e.alphaQ1 ?? 1, e.alphaq1 ?? 1);
  return { statut: { etat: 'calcule' }, sollicitation: q.Q, intermediaires: { 'formule brute': calculee(q.brut, 'kN'), 'Q_Lk,max': recommandee(900, 'kN'), Q_Lk: calculee(q.Q, 'kN') }, clauses };
}

function centrifuge(e: EntreeFreinage, clauses: string[]): Calcul {
  positif(e.r as number, 'r', 'm');
  positif(e.Qv as number, 'Qv', 'kN');
  const Q = qtk(e.r as number, e.Qv as number);
  return { statut: { etat: 'calcule' }, sollicitation: Q, intermediaires: { Q_tk: calculee(Q, 'kN') }, clauses };
}

function niveaux(gen: '2003' | '2023'): DefinitionNiveau<EntreeFreinage>[] {
  const c = gen === '2003' ? { f: ['4.4.1', '(4.6)'], c: ['4.4.2', 'tableau 4.3'] } : { f: ['6.4.1', '(6.5)'], c: ['6.4.2', 'tableau 6.4'] };
  return [
    { id: 'freinage', ordre: 1, position: 'corps', clause: c.f[0], hypothese: 'niveau.freinage', donneesRequises: [R.L], conditions: () => null, calculer: (e) => freinage(e, c.f) },
    { id: 'centrifuge', ordre: 2, position: 'corps', clause: c.c[0], hypothese: 'niveau.centrifuge', donneesRequises: [R.r, R.Qv], conditions: () => null, calculer: (e) => centrifuge(e, c.c) },
  ];
}

export const freinageMeca: Mecanisme<EntreeFreinage> = {
  id: 'freinage',
  version: '0.1.0',
  titre: 'meca.freinage.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    { type: 'nombre', id: 'L', libelle: 'champ.L-tablier', symbole: 'L', unite: 'm' },
    { type: 'nombre', id: 'w1', libelle: 'champ.w1-voie', symbole: 'w_1', unite: 'm', facultatif: true },
    { type: 'nombre', id: 'alphaQ1', libelle: 'champ.alphaQ', symbole: 'α_Q1', unite: '-', facultatif: true },
    { type: 'nombre', id: 'alphaq1', libelle: 'champ.alphaq', symbole: 'α_q1', unite: '-', facultatif: true },
    { type: 'nombre', id: 'r', libelle: 'champ.r-courbure-plan', symbole: 'r', unite: 'm', facultatif: true },
    { type: 'nombre', id: 'Qv', libelle: 'champ.Qv-tandems', symbole: 'Q_v', unite: 'kN', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.force-horizontale', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-2-2003': niveaux('2003'), 'en1991-2-2023': niveaux('2023') },
};
