/**
 * Combinaison fondamentale (STR, VC1) pour un pont routier : poids propre,
 * trafic du groupe gr1a (TS et UDL du modele LM1) et actions thermiques.
 *
 * Unites : celles des effets saisis (kN, kN.m...).
 *
 * Premiere generation (EN 1990:2002 + A1:2005, annexe A2, tableaux A2.1 et
 *   A2.4(B), valeurs recommandees, texte non detenu, a relire) :
 *   gamma_G = 1,35, gamma_Q = 1,35 (trafic), 1,5 (autres) ; psi_0 = 0,75 (TS),
 *   0,40 (UDL), 0,6 (thermique) ; formule (6.10).
 * Deuxieme generation (EN 1990-1:2023+A1:2026, A.2.6, tableaux A.2.7, A.2.10,
 *   A.2.11) : memes valeurs multipliees par k_F (0,9 CC1 ; 1,0 CC2 et CC3a ;
 *   1,1 CC3b) ; formule (8.12).
 * Choix de l outil : deux combinaisons, trafic dominant et thermique dominante,
 *   la plus defavorable est retenue ; effets tous defavorables.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeCombinaisonPont {
  G?: number;
  TS?: number;
  UDL?: number;
  T?: number;
  cc?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeCombinaisonPont>;

const R = {
  G: { champ: 'G', libelle: 'champ.G-effet' },
  TS: { champ: 'TS', libelle: 'champ.TS-effet' },
  UDL: { champ: 'UDL', libelle: 'champ.UDL-effet' },
  T: { champ: 'T', libelle: 'champ.T-thermique-effet' },
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
} as const satisfies Record<string, { champ: keyof EntreeCombinaisonPont; libelle: Cle }>;

export function kFPont(cc: string): number {
  return cc === 'CC3b' ? 1.1 : cc === 'CC1' ? 0.9 : 1.0;
}

export function combiner(e: Complete, k: number, clauses: string[]): Calcul {
  positif(e.G, 'G', 'effet');
  for (const [v, n] of [
    [e.TS, 'TS'],
    [e.UDL, 'UDL'],
    [e.T, 'T'],
  ] as const) {
    if (!(v >= 0)) throw new Error(`${n} doit etre positif ou nul.`);
  }
  const gG = 1.35 * k;
  const gQ = 1.35 * k;
  const gT = 1.5 * k;
  const trafic = gG * e.G + gQ * (e.TS + e.UDL) + gT * 0.6 * e.T;
  const thermique = gG * e.G + gT * e.T + gQ * (0.75 * e.TS + 0.4 * e.UDL);
  const Ed = Math.max(trafic, thermique);
  return {
    statut: { etat: 'calcule' },
    sollicitation: Ed,
    intermediaires: { k_F: recommandee(k, '-'), 'γ_G = γ_Q,trafic': calculee(gG, '-'), 'γ_Q,autres': calculee(gT, '-'), 'trafic dominant': calculee(trafic, '-'), 'thermique dominante': calculee(thermique, '-') },
    clauses,
  };
}

const requis = [R.G, R.TS, R.UDL, R.T];

function niveau(clause: string, hypothese: Cle, donnees: DefinitionNiveau<EntreeCombinaisonPont>['donneesRequises'], f: (e: Complete) => Calcul): DefinitionNiveau<EntreeCombinaisonPont> {
  return { id: 'str', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: donnees, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const combinaisonPont: Mecanisme<EntreeCombinaisonPont> = {
  id: 'combinaison-pont',
  version: '0.1.0',
  titre: 'meca.pont.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'G', libelle: 'champ.G-effet', symbole: 'G_k', unite: 'kN·m' },
    { type: 'nombre', id: 'TS', libelle: 'champ.TS-effet', symbole: 'TS', unite: 'kN·m' },
    { type: 'nombre', id: 'UDL', libelle: 'champ.UDL-effet', symbole: 'UDL', unite: 'kN·m' },
    { type: 'nombre', id: 'T', libelle: 'champ.T-thermique-effet', symbole: 'T_k', unite: 'kN·m' },
    {
      type: 'choix',
      id: 'cc',
      libelle: 'champ.classe-consequences',
      options: [
        { valeur: 'CC1', libelle: 'option.cc.CC1' },
        { valeur: 'CC2', libelle: 'option.cc.CC2' },
        { valeur: 'CC3a', libelle: 'option.cc.CC3a' },
        { valeur: 'CC3b', libelle: 'option.cc.CC3b' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.effet-calcul-elu', unite: 'kN·m' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1990-2002': [niveau('A2.3.1', 'niveau.pont.2002', requis, (e) => combiner(e, 1, ['(6.10)', 'tableau A2.1', 'tableau A2.4(B)']))],
    'en1990-2023': [niveau('A.2.8', 'niveau.pont.2023', [...requis, R.cc], (e) => combiner(e, kFPont(e.cc), ['(8.12)', 'tableau A.2.7', 'tableau A.2.10', 'tableau A.2.11']))],
  },
};
