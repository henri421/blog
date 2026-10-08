/**
 * Analyse plastique des poutres, portiques et dalles sans verification de la
 * capacite de rotation : conditions de ductilite.
 *
 * Unites : mm, sans dimension.
 *
 * Premiere generation (5.6.2(2)) : x_u/d <= 0,25 jusqu au C50/60, 0,15 a
 *   partir du C55/67 ; acier de classe B ou C ; rapport des moments sur appuis
 *   intermediaires aux moments en travee entre 0,5 et 2.
 * Deuxieme generation (7.3.3.2(1), 7.3.3.1(5)) : x_u/d <= 0,25 pour toutes les
 *   classes ; acier de classe B ou C dans les rotules ; meme rapport des moments.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeAnalysePlastique {
  fck?: number;
  /** Hauteur de l axe neutre a l ELU et hauteur utile (mm). */
  xu?: number;
  d?: number;
  /** Rapport des moments sur appuis intermediaires aux moments en travee. */
  rapportMoments?: number;
  /** Classe de ductilite de l acier : 'A', 'B' ou 'C'. */
  classe?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAnalysePlastique>;

const R = {
  fck: { champ: 'fck', libelle: 'champ.fck' },
  xu: { champ: 'xu', libelle: 'champ.xu' },
  d: { champ: 'd', libelle: 'champ.d' },
  rapportMoments: { champ: 'rapportMoments', libelle: 'champ.rapport-moments' },
  classe: { champ: 'classe', libelle: 'champ.classe-ductilite' },
} as const satisfies Record<string, { champ: keyof EntreeAnalysePlastique; libelle: Cle }>;

function conditions(e: EntreeAnalysePlastique): Cle | null {
  if (e.classe === 'A') return 'motif.plastique-classe-a';
  const r = e.rapportMoments as number;
  return r < 0.5 || r > 2 ? 'motif.plastique-rapport-moments' : null;
}

export function ductilite(e: Complete, limite: number, clauses: string[]): Calcul {
  positif(e.xu, 'x_u', 'mm');
  positif(e.d, 'd', 'mm');
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.xu / e.d,
    resistance: limite,
    intermediaires: { 'x_u/d': calculee(e.xu / e.d, '-'), 'x_u/d limite': recommandee(limite, '-') },
    clauses,
  };
}

function niveau(gen: '2004' | '2023'): DefinitionNiveau<EntreeAnalysePlastique> {
  return {
    id: 'sans-rotation',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '5.6.2' : '7.3.3.2',
    hypothese: gen === '2004' ? 'niveau.ap.2004' : 'niveau.ap.2023',
    donneesRequises: [R.fck, R.xu, R.d, R.rapportMoments, R.classe],
    domaine: (e) => ((e.fck as number) > 90 ? 'motif.fck-sup-90' : null),
    conditions,
    calculer: (e) =>
      gen === '2004'
        ? ductilite(e as Complete, (e.fck as number) <= 50 ? 0.25 : 0.15, ['5.6.2(2)'])
        : ductilite(e as Complete, 0.25, ['7.3.3.2(1)', '7.3.3.1(5)']),
  };
}

export const analysePlastique: Mecanisme<EntreeAnalysePlastique> = {
  id: 'analyse-plastique',
  version: '0.1.0',
  titre: 'meca.ap.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'xu', libelle: 'champ.xu', symbole: 'x_u', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'rapportMoments', libelle: 'champ.rapport-moments', symbole: 'M_appui/M_travée', unite: '-' },
    {
      type: 'choix',
      id: 'classe',
      libelle: 'champ.classe-ductilite',
      options: [
        { valeur: 'A', libelle: 'option.ductilite.A' },
        { valeur: 'B', libelle: 'option.ductilite.B' },
        { valeur: 'C', libelle: 'option.ductilite.C' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.xu-d', unite: '-' },
  resistance: { libelle: 'grandeur.xu-d-limite', unite: '-' },
  niveaux: { 'ec2-2004': [niveau('2004')], 'ec2-2023': [niveau('2023')] },
};
