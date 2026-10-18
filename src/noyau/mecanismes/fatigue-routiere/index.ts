/**
 * Fatigue des ponts routiers : majoration dynamique pres des joints de
 * dilatation et trafic lourd annuel par categorie.
 *
 * Unites : m ; vehicules par an.
 *
 * Premiere generation (EN 1991-2:2003, 4.6.1, (4.7), tableau 4.5, texte non
 *   detenu, a relire) : Delta phi_fat = 1,30 (1 - D/26) >= 1 ; N_obs par voie
 *   lente selon la categorie ; 10 % par voie rapide.
 * Deuxieme generation (EN 1991-2:2023, 6.6.2, (6.7), 6.6.4, tableau 6.7) :
 *   Delta phi_fat = 1,0 + 0,3 (1 - D/6) >= 1 (meme droite) ; memes N_obs.
 * Choix de l outil : N_obs valeurs indicatives du tableau (categories 1 a 4).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';

export interface EntreeFatigueRoutiere {
  D?: number;
  categorie?: string;
  ns?: number;
  nf?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  D: { champ: 'D', libelle: 'champ.D-joint' },
  categorie: { champ: 'categorie', libelle: 'champ.categorie-trafic' },
  ns: { champ: 'ns', libelle: 'champ.ns-voies-lentes' },
} as const satisfies Record<string, { champ: keyof EntreeFatigueRoutiere; libelle: Cle }>;

export function dPhi2003(D: number): number {
  return Math.max(1.3 * (1 - D / 26), 1);
}

export function dPhi2023(D: number): number {
  return Math.max(1 + 0.3 * (1 - D / 6), 1);
}

export function nObs(cat: string): number {
  return cat === '1' ? 2.0e6 : cat === '2' ? 0.5e6 : cat === '3' ? 0.125e6 : 0.05e6;
}

function majoration(e: EntreeFatigueRoutiere, f: (D: number) => number, clauses: string[]): Calcul {
  const D = e.D as number;
  if (!(D >= 0)) throw new Error('D doit etre positif ou nul.');
  const v = f(D);
  return { statut: { etat: 'calcule' }, sollicitation: v, intermediaires: { D: saisie(D, 'm'), 'Δφ_fat': calculee(v, '-') }, clauses };
}

function trafic(e: EntreeFatigueRoutiere, clauses: string[]): Calcul {
  const ns = e.ns as number;
  const nf = e.nf ?? 0;
  if (!(Number.isInteger(ns) && ns >= 1)) throw new Error('ns doit etre un entier au moins egal a 1.');
  if (!(Number.isInteger(nf) && nf >= 0)) throw new Error('nf doit etre un entier positif ou nul.');
  const N = nObs(e.categorie as string);
  const total = ns * N + nf * 0.1 * N;
  return { statut: { etat: 'calcule' }, sollicitation: total, intermediaires: { N_obs: recommandee(N, 'véh/an'), 'voies rapides': saisie(nf, '-'), 'N total': calculee(total, 'véh/an') }, clauses };
}

function niveaux(gen: '2003' | '2023'): DefinitionNiveau<EntreeFatigueRoutiere>[] {
  const c = gen === '2003' ? { m: ['4.6.1(6)', '(4.7)'], t: ['4.6.1(3)', 'tableau 4.5'] } : { m: ['6.6.2(2)', '(6.7)'], t: ['6.6.4', 'tableau 6.7'] };
  return [
    { id: 'majoration', ordre: 1, position: 'corps', clause: c.m[0], hypothese: `niveau.fatroute.${gen}.majoration` as Cle, donneesRequises: [R.D], conditions: () => null, calculer: (e) => majoration(e, gen === '2003' ? dPhi2003 : dPhi2023, c.m) },
    { id: 'trafic', ordre: 2, position: 'corps', clause: c.t[0], hypothese: 'niveau.fatroute.trafic', donneesRequises: [R.categorie, R.ns], conditions: () => null, calculer: (e) => trafic(e, c.t) },
  ];
}

export const fatigueRoutiere: Mecanisme<EntreeFatigueRoutiere> = {
  id: 'fatigue-routiere',
  version: '0.1.0',
  titre: 'meca.fatroute.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    { type: 'nombre', id: 'D', libelle: 'champ.D-joint', symbole: 'D', unite: 'm', facultatif: true },
    {
      type: 'choix',
      id: 'categorie',
      libelle: 'champ.categorie-trafic',
      options: [
        { valeur: '1', libelle: 'option.trafic.1' },
        { valeur: '2', libelle: 'option.trafic.2' },
        { valeur: '3', libelle: 'option.trafic.3' },
        { valeur: '4', libelle: 'option.trafic.4' },
      ],
    },
    { type: 'nombre', id: 'ns', libelle: 'champ.ns-voies-lentes', symbole: 'n_s', unite: '-', facultatif: true },
    { type: 'nombre', id: 'nf', libelle: 'champ.nf-voies-rapides', symbole: 'n_f', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.fatigue-route', unite: '- ou véh/an' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-2-2003': niveaux('2003'), 'en1991-2-2023': niveaux('2023') },
};
