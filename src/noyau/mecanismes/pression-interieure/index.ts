/**
 * Pression nette du vent sur une paroi : pression exterieure moins pression
 * interieure, avec le coefficient de pression interieure par defaut ou issu
 * des ouvertures.
 *
 * Unites : Pa, m2.
 *
 * Premiere generation (EN 1991-1-4:2005, 5.2, (5.1), (5.2), 7.2.9(6),
 *   figure 7.13, (7.3), lus sur le texte le 2026-10-19 ; A1:2010 et AC:2010
 *   non detenus) : w = q_p (c_pe - c_pi) ; sans face dominante, c_pi lu sur la
 *   figure 7.13 en fonction de mu = A_n/(A_p + A_n) (7.3) et de h/d ; c_pi =
 *   +0,2 ou -0,3 (le plus defavorable) si mu ne peut pas etre evalue (NOTE 2).
 *   La figure 7.13 est faite de segments droits : (0,33 ; 0,35) a (0,90 ;
 *   -0,30) puis -0,30 pour h/d <= 0,25 ; (0,33 ; 0,35) a (0,95 ; -0,50) puis
 *   -0,50 pour h/d >= 1 ; interpolation lineaire entre les deux (NOTE).
 * Deuxieme generation (EN 1991-1-4:2026, 7.2, (7.2) a (7.4), B.6(5) et (14),
 *   (B.18)) : meme valeur par defaut ; ouvertures permanentes sans face
 *   dominante : c_pi = (A_p2 c_pe,p + A_n2 c_pe,n)/(A_p2 + A_n2).
 * Choix de l outil : q_p identique a l exterieur et a l interieur ; resultat
 *   en valeur absolue de la pression nette la plus defavorable ; en 2005,
 *   mu < 1/3 (A_p > 2 A_n, face dominante, 7.2.9(4) et (5)) hors figure.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreePressionInterieure {
  qp?: number;
  cpe?: number;
  Ap?: number;
  An?: number;
  cpep?: number;
  cpen?: number;
  /** Rapport hauteur sur profondeur du batiment (2005, figure 7.13). */
  hd?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePressionInterieure>;

const R = {
  qp: { champ: 'qp', libelle: 'champ.qp' },
  cpe: { champ: 'cpe', libelle: 'champ.cpe-paroi' },
  Ap: { champ: 'Ap', libelle: 'champ.Ap-ouvertures' },
  An: { champ: 'An', libelle: 'champ.An' },
  cpep: { champ: 'cpep', libelle: 'champ.cpep' },
  cpen: { champ: 'cpen', libelle: 'champ.cpen' },
  hd: { champ: 'hd', libelle: 'champ.hd-batiment' },
} as const satisfies Record<string, { champ: keyof EntreePressionInterieure; libelle: Cle }>;

export function cpiOuvertures(Ap: number, An: number, cpep: number, cpen: number): number {
  return (Ap * Ap * cpep + An * An * cpen) / (Ap * Ap + An * An);
}

/** Figure 7.13 de l EN 1991-1-4:2005 (mu >= 1/3). */
export function cpiFigure713(mu: number, hd: number): number {
  const bas = mu >= 0.9 ? -0.3 : 0.35 - (0.65 * (mu - 0.33)) / (0.9 - 0.33);
  const haut = mu >= 0.95 ? -0.5 : 0.35 - (0.85 * (mu - 0.33)) / (0.95 - 0.33);
  const t = Math.min(1, Math.max(0, (hd - 0.25) / 0.75));
  return bas + t * (haut - bas);
}

function rapportOuvertures(e: EntreePressionInterieure): number | null {
  if (e.Ap === undefined || e.An === undefined || !(e.Ap >= 0 && e.An >= 0 && e.Ap + e.An > 0)) return null;
  return e.An / (e.Ap + e.An);
}

export function figure2005(e: Complete): Calcul {
  positif(e.qp, 'qp', 'Pa');
  positif(e.hd, 'hd', '-');
  const mu = rapportOuvertures(e);
  if (mu === null) throw new Error('Il faut des ouvertures.');
  const cpi = cpiFigure713(mu, e.hd);
  const w = e.qp * (e.cpe - cpi);
  return { statut: { etat: 'calcule' }, sollicitation: Math.abs(w), intermediaires: { 'μ': calculee(mu, '-'), 'h/d': saisie(e.hd, '-'), c_pi: calculee(cpi, '-'), w: calculee(w, 'Pa') }, clauses: ['7.2.9(6)', 'figure 7.13', '(7.3)', '(5.1)', '(5.2)'] };
}

export function defaut(e: Complete, clauses: string[]): Calcul {
  positif(e.qp, 'qp', 'Pa');
  const a = e.qp * (e.cpe - 0.2);
  const b = e.qp * (e.cpe + 0.3);
  const w = Math.abs(a) >= Math.abs(b) ? a : b;
  return { statut: { etat: 'calcule' }, sollicitation: Math.abs(w), intermediaires: { 'c_pi = +0,2': recommandee(0.2, '-'), 'w (c_pi = +0,2)': calculee(a, 'Pa'), 'w (c_pi = −0,3)': calculee(b, 'Pa'), w: calculee(w, 'Pa') }, clauses };
}

export function ouvertures(e: Complete): Calcul {
  positif(e.qp, 'qp', 'Pa');
  if (!(e.Ap >= 0 && e.An >= 0 && e.Ap + e.An > 0)) throw new Error('Il faut des ouvertures.');
  const cpi = cpiOuvertures(e.Ap, e.An, e.cpep, e.cpen);
  const w = e.qp * (e.cpe - cpi);
  return { statut: { etat: 'calcule' }, sollicitation: Math.abs(w), intermediaires: { A_p: saisie(e.Ap, 'm²'), A_n: saisie(e.An, 'm²'), c_pi: calculee(cpi, '-'), w: calculee(w, 'Pa') }, clauses: ['B.6(14)', '(B.18)', '(7.4)'] };
}

const base = [R.qp, R.cpe];
const avecOuvertures = [R.qp, R.cpe, R.Ap, R.An, R.cpep, R.cpen];
const figure = [R.qp, R.cpe, R.Ap, R.An, R.hd];
const horsFigure = (e: EntreePressionInterieure): Cle | null => {
  const mu = rapportOuvertures(e);
  return mu !== null && mu < 1 / 3 ? 'motif.cpi-face-dominante-2005' : null;
};

export const pressionInterieure: Mecanisme<EntreePressionInterieure> = {
  id: 'pression-interieure',
  version: '0.1.0',
  titre: 'meca.cpi.titre',
  generations: ['en1991-1-4-2005', 'en1991-1-4-2026'],
  champs: [
    { type: 'nombre', id: 'qp', libelle: 'champ.qp', symbole: 'q_p', unite: 'Pa' },
    { type: 'nombre', id: 'cpe', libelle: 'champ.cpe-paroi', symbole: 'c_pe', unite: '-' },
    { type: 'nombre', id: 'Ap', libelle: 'champ.Ap-ouvertures', symbole: 'A_p', unite: 'm²', facultatif: true },
    { type: 'nombre', id: 'An', libelle: 'champ.An', symbole: 'A_n', unite: 'm²', facultatif: true },
    { type: 'nombre', id: 'cpep', libelle: 'champ.cpep', symbole: 'c_pe,p', unite: '-', facultatif: true },
    { type: 'nombre', id: 'cpen', libelle: 'champ.cpen', symbole: 'c_pe,n', unite: '-', facultatif: true },
    { type: 'nombre', id: 'hd', libelle: 'champ.hd-batiment', symbole: 'h/d', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.pression-nette', unite: 'Pa' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-4-2005': [
      { id: 'defaut', ordre: 1, position: 'corps', clause: '7.2.9', hypothese: 'niveau.cpi.defaut', donneesRequises: base, conditions: () => null, calculer: (e) => defaut(e as Complete, ['7.2.9(6) NOTE 2', '(5.1)', '(5.2)']) },
      { id: 'ouvertures', ordre: 2, position: 'corps', clause: '7.2.9', hypothese: 'niveau.cpi.2005.ouvertures', donneesRequises: figure, conditions: horsFigure, calculer: (e) => figure2005(e as Complete) },
    ] as DefinitionNiveau<EntreePressionInterieure>[],
    'en1991-1-4-2026': [
      { id: 'defaut', ordre: 1, position: 'corps', clause: 'B.6(5)', hypothese: 'niveau.cpi.defaut', donneesRequises: base, conditions: () => null, calculer: (e) => defaut(e as Complete, ['B.6(5)', '(7.2)', '(7.3)']) },
      { id: 'ouvertures', ordre: 2, position: 'corps', clause: 'B.6(14)', hypothese: 'niveau.cpi.2026.ouvertures', donneesRequises: avecOuvertures, conditions: () => null, calculer: (e) => ouvertures(e as Complete) },
    ],
  },
};
