/**
 * Choc de vehicule : force dynamique d un choc dur et force statique
 * equivalente sur une superstructure selon la hauteur libre.
 *
 * Unites : kg, m/s, kN/m, m, kN.
 *
 * Premiere generation (EN 1991-1-7:2006 + A1:2014, 4.3.2, figure 4.2, annexe C,
 *   (C.1), texte non detenu, a relire) et deuxieme generation (EN 1991-1-7:2025,
 *   5.4.2(3), figure 5.2, annexe C) : choc dur F = v_r sqrt(k m) ; sur une
 *   superstructure, F = r_F F_dx avec r_F = 1 pour h <= h_0, 0 pour h >= h_1,
 *   lineaire entre, h_0 = 5,0 m et h_1 = 6,0 m.
 * Choix de l outil : F_dx saisi (tableau 5.2) ; vitesse saisie en m/s.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeChocVehicule {
  m?: number;
  v?: number;
  k?: number;
  Fdx?: number;
  h?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

export const H0 = 5.0;
export const H1 = 6.0;

const R = {
  m: { champ: 'm', libelle: 'champ.m-vehicule' },
  v: { champ: 'v', libelle: 'champ.v-impact' },
  k: { champ: 'k', libelle: 'champ.k-raideur' },
  Fdx: { champ: 'Fdx', libelle: 'champ.Fdx' },
  h: { champ: 'h', libelle: 'champ.h-libre' },
} as const satisfies Record<string, { champ: keyof EntreeChocVehicule; libelle: Cle }>;

export function rF(h: number): number {
  return h <= H0 ? 1 : h >= H1 ? 0 : (H1 - h) / (H1 - H0);
}

function dur(e: EntreeChocVehicule, clauses: string[]): Calcul {
  positif(e.m as number, 'm', 'kg');
  positif(e.v as number, 'v', 'm/s');
  positif(e.k as number, 'k', 'kN/m');
  const F = (e.v as number) * Math.sqrt((e.k as number) * 1000 * (e.m as number)) / 1000;
  return { statut: { etat: 'calcule' }, sollicitation: F, intermediaires: { v_r: saisie(e.v as number, 'm/s'), F: calculee(F, 'kN') }, clauses };
}

function superstructure(e: EntreeChocVehicule, clauses: string[]): Calcul {
  positif(e.Fdx as number, 'Fdx', 'kN');
  positif(e.h as number, 'h', 'm');
  const r = rF(e.h as number);
  const F = r * (e.Fdx as number);
  return { statut: { etat: 'calcule' }, sollicitation: F, intermediaires: { h_0: recommandee(H0, 'm'), h_1: recommandee(H1, 'm'), r_F: calculee(r, '-'), F: calculee(F, 'kN') }, clauses };
}

function niveaux(gen: '2006' | '2025'): DefinitionNiveau<EntreeChocVehicule>[] {
  const c = gen === '2006' ? { dur: ['C.2.1', '(C.1)'], sup: ['4.3.2', 'figure 4.2'] } : { dur: ['C.4.2', '(C.1)'], sup: ['5.4.2(3)', 'figure 5.2'] };
  return [
    { id: 'dur', ordre: 1, position: 'annexe-informative', reserve: 'reserve.en1991-1-7-c', clause: c.dur[0], hypothese: 'niveau.choc.dur', donneesRequises: [R.m, R.v, R.k], conditions: () => null, calculer: (e) => dur(e, c.dur) },
    { id: 'superstructure', ordre: 2, position: 'corps', clause: c.sup[0], hypothese: 'niveau.choc.superstructure', donneesRequises: [R.Fdx, R.h], conditions: () => null, calculer: (e) => superstructure(e, c.sup) },
  ];
}

export const chocVehicule: Mecanisme<EntreeChocVehicule> = {
  id: 'choc-vehicule',
  version: '0.1.0',
  titre: 'meca.choc.titre',
  generations: ['en1991-1-7-2006', 'en1991-1-7-2025'],
  champs: [
    { type: 'nombre', id: 'm', libelle: 'champ.m-vehicule', symbole: 'm', unite: 'kg', facultatif: true },
    { type: 'nombre', id: 'v', libelle: 'champ.v-impact', symbole: 'v_r', unite: 'm/s', facultatif: true },
    { type: 'nombre', id: 'k', libelle: 'champ.k-raideur', symbole: 'k', unite: 'kN/m', facultatif: true },
    { type: 'nombre', id: 'Fdx', libelle: 'champ.Fdx', symbole: 'F_dx', unite: 'kN', facultatif: true },
    { type: 'nombre', id: 'h', libelle: 'champ.h-libre', symbole: 'h', unite: 'm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.force-choc', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-7-2006': niveaux('2006'), 'en1991-1-7-2025': niveaux('2025') },
};
