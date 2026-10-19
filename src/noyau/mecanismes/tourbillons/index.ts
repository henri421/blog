/**
 * Detachement tourbillonnaire : vitesse critique, critere de verification et
 * nombre de Scruton.
 *
 * Unites : m, Hz, m/s, kg/m.
 *
 * Premiere generation (EN 1991-1-4:2005, annexe E, E.1.2, (E.1), E.1.3.1,
 *   (E.2), E.1.3.3, (E.4), lus sur le texte le 2026-10-19 ; A1:2010 et AC:2010
 *   non detenus) : v_crit = b n / St ; effet a etudier sauf si
 *   v_crit > 1,25 v_m ; Sc = 2 delta_s m / (rho b2).
 * Deuxieme generation (EN 1991-1-4:2026, 9.3, annexe G, (G.15), (G.18)) :
 *   meme vitesse critique et meme critere ; nombre de Scruton generalise
 *   Sc_G = 2 delta_s m / (rho b d), d profondeur dans la direction du vent.
 * Choix de l outil : rho = 1,25 kg/m3 ; St saisi.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { RHO_AIR } from '../pression-pointe/index';

export interface EntreeTourbillons {
  b?: number;
  d?: number;
  n?: number;
  St?: number;
  vm?: number;
  m?: number;
  deltas?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeTourbillons>;

const R = {
  b: { champ: 'b', libelle: 'champ.b-transversal' },
  d: { champ: 'd', libelle: 'champ.d-longitudinal' },
  n: { champ: 'n', libelle: 'champ.n-frequence' },
  St: { champ: 'St', libelle: 'champ.St' },
  vm: { champ: 'vm', libelle: 'champ.vm' },
  m: { champ: 'm', libelle: 'champ.m-equivalente' },
  deltas: { champ: 'deltas', libelle: 'champ.delta-s' },
} as const satisfies Record<string, { champ: keyof EntreeTourbillons; libelle: Cle }>;

export function critique(e: Complete, clauses: string[]): Calcul {
  for (const [v, k] of [
    [e.b, 'b'],
    [e.n, 'n'],
    [e.St, 'St'],
    [e.vm, 'vm'],
  ] as const)
    positif(v, k, '-');
  const vc = (e.b * e.n) / e.St;
  return { statut: { etat: 'calcule' }, sollicitation: 1.25 * e.vm, resistance: vc, intermediaires: { v_crit: calculee(vc, 'm/s'), '1,25 v_m': calculee(1.25 * e.vm, 'm/s'), 'v_crit / v_m': calculee(vc / e.vm, '-') }, clauses };
}

export function scruton(e: Complete, generalise: boolean, clauses: string[]): Calcul {
  for (const [v, k] of [
    [e.b, 'b'],
    [e.d, 'd'],
    [e.m, 'm'],
    [e.deltas, 'deltas'],
  ] as const)
    positif(v, k, '-');
  const denom = generalise ? RHO_AIR * e.b * e.d : RHO_AIR * e.b * e.b;
  const Sc = (2 * e.deltas * e.m) / denom;
  return { statut: { etat: 'calcule' }, resistance: Sc, intermediaires: { 'δ_s': saisie(e.deltas, '-'), 'ρ': recommandee(RHO_AIR, 'kg/m³'), Sc: calculee(Sc, '-') }, clauses };
}

function niveaux(gen: '2005' | '2026'): DefinitionNiveau<EntreeTourbillons>[] {
  const c = gen === '2005' ? { v: ['E.1.2', '(E.1)', 'E.1.3.1', '(E.2)'], s: ['E.1.3.3', '(E.4)'] } : { v: ['9.3', '(G.15)'], s: ['G.5.3.4', '(G.18)'] };
  return [
    { id: 'critere', ordre: 1, position: 'corps', clause: c.v[0], hypothese: `niveau.tourbillons.${gen}.critere` as Cle, donneesRequises: [R.b, R.n, R.St, R.vm], conditions: () => null, calculer: (e) => critique(e as Complete, c.v) },
    { id: 'scruton', ordre: 2, position: 'annexe-informative', reserve: gen === '2005' ? 'reserve.en1991-1-4-e2005' : 'reserve.en1991-1-4-g', clause: c.s[0], hypothese: `niveau.tourbillons.${gen}.scruton` as Cle, donneesRequises: [R.b, R.d, R.m, R.deltas], conditions: () => null, calculer: (e) => scruton(e as Complete, gen === '2026', c.s) },
  ];
}

export const tourbillons: Mecanisme<EntreeTourbillons> = {
  id: 'tourbillons',
  version: '0.1.0',
  titre: 'meca.tourbillons.titre',
  generations: ['en1991-1-4-2005', 'en1991-1-4-2026'],
  champs: [
    { type: 'nombre', id: 'b', libelle: 'champ.b-transversal', symbole: 'b', unite: 'm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d-longitudinal', symbole: 'd', unite: 'm' },
    { type: 'nombre', id: 'n', libelle: 'champ.n-frequence', symbole: 'n', unite: 'Hz' },
    { type: 'nombre', id: 'St', libelle: 'champ.St', symbole: 'St', unite: '-' },
    { type: 'nombre', id: 'vm', libelle: 'champ.vm', symbole: 'v_m', unite: 'm/s' },
    { type: 'nombre', id: 'm', libelle: 'champ.m-equivalente', symbole: 'm_e', unite: 'kg/m' },
    { type: 'nombre', id: 'deltas', libelle: 'champ.delta-s', symbole: 'δ_s', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.vitesse-comparaison', unite: 'm/s' },
  resistance: { libelle: 'grandeur.vcrit-ou-scruton', unite: 'm/s ou -' },
  niveaux: { 'en1991-1-4-2005': niveaux('2005'), 'en1991-1-4-2026': niveaux('2026') },
};
