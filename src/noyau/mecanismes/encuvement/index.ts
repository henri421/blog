/**
 * Profondeur minimale d une fondation en encuvement a surfaces lisses ou
 * rugueuses (sans cles).
 *
 * Unites : mm, kN, kN.m.
 *
 * Premiere generation (10.9.6.3(1)) : l >= 1,2 h, h le cote du poteau.
 * Deuxieme generation (13.8.3(2)) : l >= 1,2 h_col pour M_Ed/N_Ed <= 0,15 h_col
 *   (13.17), l >= 2,0 h_col pour M_Ed/N_Ed >= 2,0 h_col (13.18), interpolation
 *   lineaire entre les deux ; h_col le plus grand cote du poteau.
 * Un effort normal nul ou de traction est traite comme une excentricite
 *   infinie (2,0 h_col). Choix de l outil : les efforts F_1 a F_3 du modele de
 *   la figure 13.8 et le frottement (mu <= 0,3 en 2004, tableau 8.2 en 2023)
 *   ne sont pas calcules.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeEncuvement {
  /** Plus grand cote de la section du poteau (mm). */
  hcol?: number;
  /** Moment et effort normal de compression au pied du poteau (kN.m, kN). */
  MEd?: number;
  NEd?: number;
  /** Profondeur prevue de la reservation (mm). */
  lPrevu?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeEncuvement>;

const R = {
  hcol: { champ: 'hcol', libelle: 'champ.hcol' },
  MEd: { champ: 'MEd', libelle: 'champ.MEd-pied' },
  NEd: { champ: 'NEd', libelle: 'champ.NEd-pied' },
  lPrevu: { champ: 'lPrevu', libelle: 'champ.l-encuvement' },
} as const satisfies Record<string, { champ: keyof EntreeEncuvement; libelle: Cle }>;

/** Rapport l/h_col de 13.8.3(2) pour une excentricite relative e/h_col. */
export function rapportEncuvement(eRel: number): number {
  if (eRel <= 0.15) return 1.2;
  if (eRel >= 2) return 2;
  return 1.2 + (0.8 * (eRel - 0.15)) / 1.85;
}

export function encuvement2004(e: Complete): Calcul {
  positif(e.hcol, 'h_col', 'mm');
  positif(e.lPrevu, 'l prevu', 'mm');
  return {
    statut: { etat: 'calcule' },
    sollicitation: 1.2 * e.hcol,
    resistance: e.lPrevu,
    intermediaires: { 'l / h': recommandee(1.2, '-'), l_min: calculee(1.2 * e.hcol, 'mm'), l: saisie(e.lPrevu, 'mm') },
    clauses: ['10.9.6.3(1)'],
  };
}

export function encuvement2023(e: Complete): Calcul {
  positif(e.hcol, 'h_col', 'mm');
  positif(e.lPrevu, 'l prevu', 'mm');
  if (!Number.isFinite(e.MEd) || !Number.isFinite(e.NEd)) throw new Error('M_Ed et N_Ed doivent etre des nombres.');
  const eRel = e.NEd > 0 ? (Math.abs(e.MEd) * 1000) / e.NEd / e.hcol : Number.POSITIVE_INFINITY;
  const k = rapportEncuvement(eRel);
  const inter: Cellule['intermediaires'] = {};
  if (Number.isFinite(eRel)) inter['M_Ed / (N_Ed h_col)'] = calculee(eRel, '-');
  return {
    statut: { etat: 'calcule' },
    sollicitation: k * e.hcol,
    resistance: e.lPrevu,
    intermediaires: { ...inter, 'l / h_col': calculee(k, '-'), l_min: calculee(k * e.hcol, 'mm'), l: saisie(e.lPrevu, 'mm') },
    clauses: ['13.8.3(2)', '(13.17)', '(13.18)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeEncuvement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '10.9.6.3',
    hypothese: 'niveau.enc.2004',
    donneesRequises: [R.hcol, R.lPrevu],
    conditions: () => null,
    calculer: (e) => encuvement2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeEncuvement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '13.8.3',
    hypothese: 'niveau.enc.2023',
    donneesRequises: [R.hcol, R.MEd, R.NEd, R.lPrevu],
    conditions: () => null,
    calculer: (e) => encuvement2023(e as Complete),
  },
];

export const encuvement: Mecanisme<EntreeEncuvement> = {
  id: 'encuvement',
  version: '0.1.0',
  titre: 'meca.enc.titre',
  champs: [
    { type: 'nombre', id: 'hcol', libelle: 'champ.hcol', symbole: 'h_col', unite: 'mm' },
    { type: 'nombre', id: 'MEd', libelle: 'champ.MEd-pied', symbole: 'M_Ed', unite: 'kN·m' },
    { type: 'nombre', id: 'NEd', libelle: 'champ.NEd-pied', symbole: 'N_Ed', unite: 'kN' },
    { type: 'nombre', id: 'lPrevu', libelle: 'champ.l-encuvement', symbole: 'l', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.profondeur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.profondeur-prevue', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
