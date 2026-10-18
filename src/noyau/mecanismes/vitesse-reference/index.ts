/**
 * Vitesse de reference du vent et pression dynamique de reference, avec le
 * coefficient de probabilite pour une periode de retour donnee.
 *
 * Unites : m/s, annees, Pa.
 *
 * Premiere generation (EN 1991-1-4:2005 + A1:2010, 4.2, (4.1), (4.2), (4.10),
 *   texte non detenu, a relire) : v_b = c_dir c_season v_b,0 ; c_prob =
 *   [(1 - K ln(-ln(1 - p)))/(1 - K ln(-ln 0,98))]^n, K = 0,2, n = 0,5 ;
 *   q_b = 0,5 rho v_b2, rho = 1,25 kg/m3.
 * Deuxieme generation (EN 1991-1-4:2026, 6.2, (6.1) a (6.3)) : v_b = c_dir
 *   c_season c_prob c_alt v_b0 ; v_b0 multipliee par f_w,cc >= 1 (6.2(2)) ;
 *   meme c_prob (ecrite aussi en fonction de T) ; c_alt = 1,0 par defaut.
 * Choix de l outil : c_alt = 1 ; p = 1/T.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { RHO_AIR } from '../pression-pointe/index';

export interface EntreeVitesseReference {
  vb0?: number;
  cdir?: number;
  cseason?: number;
  T?: number;
  fwcc?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeVitesseReference>;

const R = {
  vb0: { champ: 'vb0', libelle: 'champ.vb0' },
  cdir: { champ: 'cdir', libelle: 'champ.cdir' },
  cseason: { champ: 'cseason', libelle: 'champ.cseason' },
  T: { champ: 'T', libelle: 'champ.T-retour-vent' },
} as const satisfies Record<string, { champ: keyof EntreeVitesseReference; libelle: Cle }>;

export function cprob(T: number): number {
  const K = 0.2;
  const n = 0.5;
  const p = 1 / T;
  return ((1 - K * Math.log(-Math.log(1 - p))) / (1 - K * Math.log(-Math.log(0.98)))) ** n;
}

function calculer(e: Complete, avecClimat: boolean, clauses: string[]): Calcul {
  positif(e.vb0, 'vb0', 'm/s');
  positif(e.cdir, 'cdir', '-');
  positif(e.cseason, 'cseason', '-');
  if (!(e.T > 1)) throw new Error('T doit etre superieur a 1 an.');
  const f = avecClimat ? (e.fwcc ?? 1) : 1;
  if (!(f >= 1)) throw new Error('fwcc doit etre au moins egal a 1.');
  const cp = cprob(e.T);
  const vb = e.cdir * e.cseason * cp * f * e.vb0;
  const qb = 0.5 * RHO_AIR * vb * vb;
  const inter: Cellule['intermediaires'] = { c_prob: calculee(cp, '-') };
  if (avecClimat) inter['f_w,cc'] = saisie(f, '-');
  inter.v_b = calculee(vb, 'm/s');
  inter.q_b = calculee(qb, 'Pa');
  return { statut: { etat: 'calcule' }, sollicitation: qb, intermediaires: inter, clauses };
}

function niveau(avecClimat: boolean, clause: string, hypothese: Cle, clauses: string[]): DefinitionNiveau<EntreeVitesseReference> {
  return { id: 'qb', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: [R.vb0, R.cdir, R.cseason, R.T], conditions: () => null, calculer: (e) => calculer(e as Complete, avecClimat, clauses) };
}

export const vitesseReference: Mecanisme<EntreeVitesseReference> = {
  id: 'vitesse-reference',
  version: '0.1.0',
  titre: 'meca.vb.titre',
  generations: ['en1991-1-4-2005', 'en1991-1-4-2026'],
  champs: [
    { type: 'nombre', id: 'vb0', libelle: 'champ.vb0', symbole: 'v_b,0', unite: 'm/s' },
    { type: 'nombre', id: 'cdir', libelle: 'champ.cdir', symbole: 'c_dir', unite: '-' },
    { type: 'nombre', id: 'cseason', libelle: 'champ.cseason', symbole: 'c_season', unite: '-' },
    { type: 'nombre', id: 'T', libelle: 'champ.T-retour-vent', symbole: 'T', unite: 'ans' },
    { type: 'nombre', id: 'fwcc', libelle: 'champ.fwcc', symbole: 'f_w,cc', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.qb', unite: 'Pa' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-4-2005': [niveau(false, '4.2', 'niveau.vb.2005', ['4.2', '(4.1)', '(4.2)', '(4.10)'])],
    'en1991-1-4-2026': [niveau(true, '6.2', 'niveau.vb.2026', ['6.2', '(6.1)', '(6.2)', '(6.3)'])],
  },
};
