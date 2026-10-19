/**
 * Facteur de consequence applique aux coefficients partiels des actions
 * defavorables, selon la classe de consequences (batiments, STR).
 *
 * Unites : sans dimension.
 *
 * Premiere generation (EN 1990:2002, annexe B informative, B.3.3, tableau B.3,
 *   lu sur le texte le 2026-10-19) : K_FI = 0,9 ; 1,0 ; 1,1 pour RC1 a RC3
 *   (associees a CC1 a CC3, B.3.2(2)), applique aux seules actions
 *   defavorables ; pour RC3, la NOTE prefere d autres mesures a K_FI ; pas de
 *   CC0 ni de CC4.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 4.3, tableaux A.1.8 et A.1.9) :
 *   k_F = 0,9 ; 1,0 ; 1,1 pour CC1 a CC3, gamma_G = 1,35 k_F et gamma_Q =
 *   1,5 k_F (VC1) ; gamma_G,fav et gamma_G,stb ne sont pas multiplies.
 *   CC0 : Eurocodes ou autres dispositions (4.3(3)) ; CC4 : dispositions
 *   complementaires (4.3, NOTE 3) : pas de k_F.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_G, GAMMA_Q, kF } from '../combinaison-elu/index';

export interface EntreeFacteurConsequence {
  /** Classe de consequences : 'CC0' a 'CC4'. */
  cc?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
} as const satisfies Record<string, { champ: keyof EntreeFacteurConsequence; libelle: Cle }>;

const extreme = (e: EntreeFacteurConsequence): Cle | null =>
  e.cc === 'CC0' ? 'motif.cc0' : e.cc === 'CC4' ? 'motif.cc4' : null;

function calculer(e: EntreeFacteurConsequence, clauses: string[]): Calcul {
  const k = kF(e.cc as string);
  return {
    statut: { etat: 'calcule' },
    resistance: k,
    intermediaires: { k_F: recommandee(k, '-'), 'γ_G': calculee(GAMMA_G * k, '-'), 'γ_Q': calculee(GAMMA_Q * k, '-'), 'γ_G,fav': recommandee(1, '-') },
    clauses,
  };
}

const niveau2002: DefinitionNiveau<EntreeFacteurConsequence> = {
  id: 'kf',
  ordre: 1,
  position: 'annexe-informative',
  reserve: 'reserve.en1990-2002-b',
  clause: 'B.3.3',
  hypothese: 'niveau.kf.2002',
  donneesRequises: [R.cc],
  conditions: extreme,
  calculer: (e) => calculer(e, ['B.3.3', 'tableau B.3']),
};

const niveau2023: DefinitionNiveau<EntreeFacteurConsequence> = {
  id: 'kf',
  ordre: 1,
  position: 'corps',
  clause: '4.3',
  hypothese: 'niveau.kf.2023',
  donneesRequises: [R.cc],
  conditions: extreme,
  calculer: (e) => calculer(e, ['4.3', 'tableau A.1.8', 'tableau A.1.9']),
};

export const facteurConsequence: Mecanisme<EntreeFacteurConsequence> = {
  id: 'facteur-consequence',
  version: '0.1.0',
  titre: 'meca.kf.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    {
      type: 'choix',
      id: 'cc',
      libelle: 'champ.classe-consequences',
      options: [
        { valeur: 'CC0', libelle: 'option.cc.CC0' },
        { valeur: 'CC1', libelle: 'option.cc.CC1' },
        { valeur: 'CC2', libelle: 'option.cc.CC2' },
        { valeur: 'CC3', libelle: 'option.cc.CC3' },
        { valeur: 'CC4', libelle: 'option.cc.CC4' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.facteur-consequence', unite: '-' },
  niveaux: { 'en1990-2002': [niveau2002], 'en1990-2023': [niveau2023] },
};
