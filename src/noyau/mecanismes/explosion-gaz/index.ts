/**
 * Pression statique nominale equivalente d une explosion de gaz naturel dans
 * un espace clos muni d events.
 *
 * Unites : kN/m2, m2, m3.
 *
 * Premiere generation (EN 1991-1-7:2006 + A1:2014, annexe D, D.2, (D.4) et
 *   (D.5), texte non detenu, a relire) et deuxieme generation (EN 1991-1-7:2025,
 *   annexe D, D.4, (D.1) a (D.3)) : p_d = max{3 + p_stat ; 3 + p_stat/2 +
 *   0,04/(A_v/V)2} ; 0,05 <= A_v/V <= 0,15 m-1 ; V <= 1000 m3 ; p_d au-dela de
 *   50 kN/m2 negligeable.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeExplosionGaz {
  pstat?: number;
  Av?: number;
  V?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  pstat: { champ: 'pstat', libelle: 'champ.pstat' },
  Av: { champ: 'Av', libelle: 'champ.Av-events' },
  V: { champ: 'V', libelle: 'champ.V-enceinte' },
} as const satisfies Record<string, { champ: keyof EntreeExplosionGaz; libelle: Cle }>;

export function pd(pstat: number, Av: number, V: number): { a: number; b: number } {
  const r = Av / V;
  return { a: 3 + pstat, b: 3 + pstat / 2 + 0.04 / (r * r) };
}

function calculer(e: EntreeExplosionGaz, clauses: string[]): Calcul {
  positif(e.pstat as number, 'pstat', 'kN/m2');
  positif(e.Av as number, 'Av', 'm2');
  positif(e.V as number, 'V', 'm3');
  const p = pd(e.pstat as number, e.Av as number, e.V as number);
  const v = Math.max(p.a, p.b);
  return { statut: { etat: 'calcule' }, sollicitation: v, intermediaires: { 'A_v / V': calculee((e.Av as number) / (e.V as number), '1/m'), p_stat: saisie(e.pstat as number, 'kN/m²'), '3 + p_stat': calculee(p.a, 'kN/m²'), '3 + p_stat/2 + 0,04/(A_v/V)²': calculee(p.b, 'kN/m²'), p_d: calculee(v, 'kN/m²') }, clauses };
}

const domaine = (e: EntreeExplosionGaz): Cle | null => {
  if (e.Av === undefined || e.V === undefined) return null;
  const r = e.Av / e.V;
  if (e.V > 1000) return 'motif.explosion-volume';
  return r < 0.05 || r > 0.15 ? 'motif.explosion-events' : null;
};

function niveau(clause: string, hypothese: Cle, clauses: string[]): DefinitionNiveau<EntreeExplosionGaz> {
  return { id: 'pd', ordre: 1, position: 'annexe-informative', reserve: 'reserve.en1991-1-7-d', clause, hypothese, donneesRequises: [R.pstat, R.Av, R.V], conditions: domaine, calculer: (e) => calculer(e, clauses) };
}

export const explosionGaz: Mecanisme<EntreeExplosionGaz> = {
  id: 'explosion-gaz',
  version: '0.1.0',
  titre: 'meca.explosion.titre',
  generations: ['en1991-1-7-2006', 'en1991-1-7-2025'],
  champs: [
    { type: 'nombre', id: 'pstat', libelle: 'champ.pstat', symbole: 'p_stat', unite: 'kN/m²' },
    { type: 'nombre', id: 'Av', libelle: 'champ.Av-events', symbole: 'A_v', unite: 'm²' },
    { type: 'nombre', id: 'V', libelle: 'champ.V-enceinte', symbole: 'V', unite: 'm³' },
  ],
  sollicitation: { libelle: 'grandeur.pression-explosion', unite: 'kN/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-7-2006': [niveau('D.2', 'niveau.explosion.2006', ['D.2', '(D.4)', '(D.5)'])], 'en1991-1-7-2025': [niveau('D.4', 'niveau.explosion.2025', ['D.4', '(D.1)', '(D.2)', '(D.3)'])] },
};
