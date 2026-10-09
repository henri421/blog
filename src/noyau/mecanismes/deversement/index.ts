/**
 * Deversement des poutres elancees : conditions permettant de negliger les
 * effets du second ordre lies a l instabilite laterale.
 *
 * Unites : mm.
 *
 * Premiere generation (5.9(3)) : l_0t/b <= 50/(h/b)^(1/3) et h/b <= 2,5
 *   (situations durables, (5.40a)) ; 70/(h/b)^(1/3) et h/b <= 3,5
 *   (transitoires, (5.40b)).
 * Deuxieme generation (7.5(3)) : memes limites (7.31), (7.32), sans condition
 *   sur h/b (texte relu le 09/10/2026).
 * Hors de ces conditions, le niveau est non applicable : le second ordre lie au
 *   deversement doit etre calcule, avec l imperfection l/300 de 5.9(2) ; 7.5(2).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeDeversement {
  /** Distance entre elements s opposant au deversement (mm). */
  l0t?: number;
  /** Hauteur totale de la poutre et largeur de la table comprimee (mm). */
  h?: number;
  b?: number;
  /** 'durable' ou 'transitoire'. */
  situation?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeDeversement>;

const R = {
  l0t: { champ: 'l0t', libelle: 'champ.l0t' },
  h: { champ: 'h', libelle: 'champ.h' },
  b: { champ: 'b', libelle: 'champ.b-table' },
  situation: { champ: 'situation', libelle: 'champ.situation-deversement' },
} as const satisfies Record<string, { champ: keyof EntreeDeversement; libelle: Cle }>;

const transitoire = (e: EntreeDeversement): boolean => e.situation === 'transitoire';

export function deversement(e: Complete, clauses: string[]): Calcul {
  positif(e.l0t, 'l_0t', 'mm');
  positif(e.h, 'h', 'mm');
  positif(e.b, 'b', 'mm');
  const k = transitoire(e) ? 70 : 50;
  const hb = e.h / e.b;
  const limite = k / hb ** (1 / 3);
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.l0t / e.b,
    resistance: limite,
    intermediaires: { 'h/b': calculee(hb, '-'), coefficient: recommandee(k, '-'), 'l_0t/b limite': calculee(limite, '-') },
    clauses,
  };
}

const niveaux2004: DefinitionNiveau<EntreeDeversement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '5.9',
    hypothese: 'niveau.dev.2004',
    donneesRequises: [R.l0t, R.h, R.b, R.situation],
    conditions: (e) => ((e.h as number) / (e.b as number) > (transitoire(e) ? 3.5 : 2.5) ? 'motif.deversement-hb' : null),
    calculer: (e) => deversement(e as Complete, transitoire(e) ? ['5.9(3)', '(5.40b)'] : ['5.9(3)', '(5.40a)']),
  },
];

const niveaux2023: DefinitionNiveau<EntreeDeversement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '7.5',
    hypothese: 'niveau.dev.2023',
    donneesRequises: [R.l0t, R.h, R.b, R.situation],
    conditions: () => null,
    calculer: (e) => deversement(e as Complete, transitoire(e) ? ['7.5(3)', '(7.32)'] : ['7.5(3)', '(7.31)']),
  },
];

export const deversementMeca: Mecanisme<EntreeDeversement> = {
  id: 'deversement',
  version: '0.1.0',
  titre: 'meca.dev.titre',
  champs: [
    { type: 'nombre', id: 'l0t', libelle: 'champ.l0t', symbole: 'l_0t', unite: 'mm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b-table', symbole: 'b', unite: 'mm' },
    {
      type: 'choix',
      id: 'situation',
      libelle: 'champ.situation-deversement',
      options: [
        { valeur: 'durable', libelle: 'option.dev.durable' },
        { valeur: 'transitoire', libelle: 'option.dev.transitoire' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.elancement-lateral', unite: '-' },
  resistance: { libelle: 'grandeur.elancement-lateral-limite', unite: '-' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
