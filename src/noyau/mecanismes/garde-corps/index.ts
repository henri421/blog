/**
 * Efforts sur un poteau de garde-corps : moment a la base sous la charge
 * horizontale lineique, et charge verticale sur la main courante.
 *
 * Unites : kN/m, m, kN.m, kN.
 *
 * Premiere generation (EN 1991-1-1:2002, 6.4, tableau 6.12, texte non
 *   detenu, a relire) : q_k horizontale appliquee a la hauteur de la barriere,
 *   au plus 1,2 m ; pas de charge verticale.
 * Deuxieme generation (EN 1991-1-1:2025, 6.6.2, 6.6.3, tableau 6.5) : meme
 *   charge horizontale ; charge verticale Q_k = 1 kN ou q_k = 0,6 kN/m, la plus
 *   defavorable, combinee avec la charge horizontale.
 * Choix de l outil : q_k horizontale saisie (tableau 6.5) ; travee de
 *   main courante s entre poteaux ; moment M = q_k min(h ; 1,2) s.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeGardeCorps {
  qk?: number;
  h?: number;
  s?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeGardeCorps>;

const R = {
  qk: { champ: 'qk', libelle: 'champ.qk-garde-corps' },
  h: { champ: 'h', libelle: 'champ.h-garde-corps' },
  s: { champ: 's', libelle: 'champ.s-poteaux' },
} as const satisfies Record<string, { champ: keyof EntreeGardeCorps; libelle: Cle }>;

export function horizontal(e: Complete, clauses: string[]): Calcul {
  positif(e.qk, 'qk', 'kN/m');
  positif(e.h, 'h', 'm');
  positif(e.s, 's', 'm');
  const z = Math.min(e.h, 1.2);
  const M = e.qk * z * e.s;
  return { statut: { etat: 'calcule' }, sollicitation: M, intermediaires: { q_k: saisie(e.qk, 'kN/m'), "hauteur d'application": calculee(z, 'm'), H: calculee(e.qk * e.s, 'kN'), M: calculee(M, 'kN·m') }, clauses };
}

export function vertical(e: Complete): Calcul {
  positif(e.s, 's', 'm');
  const V = Math.max(1.0, 0.6 * e.s);
  return { statut: { etat: 'calcule' }, sollicitation: V, intermediaires: { Q_k: recommandee(1.0, 'kN'), 'q_k s': calculee(0.6 * e.s, 'kN'), V: calculee(V, 'kN') }, clauses: ['6.6.3'] };
}

export const gardeCorps: Mecanisme<EntreeGardeCorps> = {
  id: 'garde-corps',
  version: '0.1.0',
  titre: 'meca.gc.titre',
  generations: ['en1991-1-1-2002', 'en1991-1-1-2025'],
  champs: [
    { type: 'nombre', id: 'qk', libelle: 'champ.qk-garde-corps', symbole: 'q_k', unite: 'kN/m' },
    { type: 'nombre', id: 'h', libelle: 'champ.h-garde-corps', symbole: 'h', unite: 'm' },
    { type: 'nombre', id: 's', libelle: 'champ.s-poteaux', symbole: 's', unite: 'm' },
  ],
  sollicitation: { libelle: 'grandeur.effort-garde-corps', unite: 'kN·m ou kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-1-2002': [
      { id: 'horizontal', ordre: 1, position: 'corps', clause: '6.4', hypothese: 'niveau.gc.horizontal', donneesRequises: [R.qk, R.h, R.s], conditions: () => null, calculer: (e) => horizontal(e as Complete, ['6.4', 'tableau 6.12']) },
      {
        id: 'vertical',
        ordre: 2,
        position: 'corps',
        clause: '—',
        hypothese: 'niveau.gc.vertical-2002',
        donneesRequises: [R.s],
        conditions: () => 'motif.sans-equivalent-2004',
        calculer: () => {
          throw new Error('Pas de charge verticale en 2002 : jamais calcule.');
        },
      },
    ] as DefinitionNiveau<EntreeGardeCorps>[],
    'en1991-1-1-2025': [
      { id: 'horizontal', ordre: 1, position: 'corps', clause: '6.6.2', hypothese: 'niveau.gc.horizontal', donneesRequises: [R.qk, R.h, R.s], conditions: () => null, calculer: (e) => horizontal(e as Complete, ['6.6.2', 'tableau 6.5']) },
      { id: 'vertical', ordre: 2, position: 'corps', clause: '6.6.3', hypothese: 'niveau.gc.vertical-2025', donneesRequises: [R.s], conditions: () => null, calculer: (e) => vertical(e as Complete) },
    ],
  },
};
