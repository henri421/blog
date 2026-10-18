/**
 * Modele de charge 1 (LM1) d un pont routier : voies conventionnelles et
 * moment global a mi-portee d un tablier isostatique, toutes voies chargees.
 *
 * Unites : m, kN, kN/m2, kN.m.
 *
 * Premiere generation (EN 1991-2:2003, 4.2.3, tableau 4.1, 4.3.2, tableau 4.2,
 *   texte non detenu, a relire) et deuxieme generation (EN 1991-2:2023, 6.2.3,
 *   tableau 6.1, 6.3.2, tableau 6.2) : memes regles.
 *   Voies : w < 5,4 m : 1 voie de 3 m ; 5,4 <= w < 6 m : 2 voies de w/2 ;
 *   w >= 6 m : Int(w/3) voies de 3 m ; aire residuelle w - 3 n.
 *   TS : 300, 200, 100 kN par essieu (voies 1 a 3) ; UDL : 9 kN/m2 (voie 1),
 *   2,5 kN/m2 ailleurs ; coefficients alpha saisis (1 par defaut).
 * Choix de l outil : chaque tandem centre a mi-portee (essieux a +/- 0,6 m) ;
 *   UDL sur toute la portee et toute la largeur ; tablier sans repartition
 *   transversale (moment global).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeLm1 {
  w?: number;
  L?: number;
  alphaQ?: number;
  alphaq?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  w: { champ: 'w', libelle: 'champ.w-chaussee' },
  L: { champ: 'L', libelle: 'champ.L-portee-pont' },
} as const satisfies Record<string, { champ: keyof EntreeLm1; libelle: Cle }>;

const QK = [300, 200, 100];

export function voies(w: number): { n: number; wl: number; wr: number } {
  if (w < 5.4) return { n: 1, wl: 3, wr: w - 3 };
  if (w < 6) return { n: 2, wl: w / 2, wr: 0 };
  const n = Math.floor(w / 3);
  return { n, wl: 3, wr: w - 3 * n };
}

function moment(e: EntreeLm1, clauses: string[]): Calcul {
  positif(e.w as number, 'w', 'm');
  positif(e.L as number, 'L', 'm');
  const L = e.L as number;
  if (!(L > 1.2)) throw new Error('L doit depasser 1,2 m.');
  const aQ = e.alphaQ ?? 1;
  const aq = e.alphaq ?? 1;
  const v = voies(e.w as number);
  let MTS = 0;
  let qTot = 0;
  for (let i = 0; i < v.n; i++) {
    MTS += aQ * (QK[i] ?? 0) * (L / 2 - 0.6);
    qTot += aq * (i === 0 ? 9 : 2.5) * v.wl;
  }
  qTot += aq * 2.5 * Math.max(v.wr, 0);
  const MUDL = (qTot * L * L) / 8;
  const M = MTS + MUDL;
  return {
    statut: { etat: 'calcule' },
    sollicitation: M,
    intermediaires: { n_l: calculee(v.n, '-'), w_l: calculee(v.wl, 'm'), 'aire résiduelle': calculee(Math.max(v.wr, 0), 'm'), 'α_Q': saisie(aQ, '-'), 'M_TS': calculee(MTS, 'kN·m'), 'M_UDL': calculee(MUDL, 'kN·m'), M: calculee(M, 'kN·m') },
    clauses,
  };
}

function niveau(clause: string, hypothese: Cle, clauses: string[]): DefinitionNiveau<EntreeLm1> {
  return { id: 'moment', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: [R.w, R.L], conditions: () => null, calculer: (e) => moment(e, clauses) };
}

export const lm1: Mecanisme<EntreeLm1> = {
  id: 'lm1',
  version: '0.1.0',
  titre: 'meca.lm1.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    { type: 'nombre', id: 'w', libelle: 'champ.w-chaussee', symbole: 'w', unite: 'm' },
    { type: 'nombre', id: 'L', libelle: 'champ.L-portee-pont', symbole: 'L', unite: 'm' },
    { type: 'nombre', id: 'alphaQ', libelle: 'champ.alphaQ', symbole: 'α_Q', unite: '-', facultatif: true },
    { type: 'nombre', id: 'alphaq', libelle: 'champ.alphaq', symbole: 'α_q', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.moment-lm1', unite: 'kN·m' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-2-2003': [niveau('4.3.2', 'niveau.lm1.2003', ['4.2.3', 'tableau 4.1', '4.3.2', 'tableau 4.2'])], 'en1991-2-2023': [niveau('6.3.2', 'niveau.lm1.2023', ['6.2.3', 'tableau 6.1', '6.3.2', 'tableau 6.2'])] },
};
