/**
 * Diagramme de calcul des aciers pour beton arme : branche inclinee.
 *
 * Unites : MPa, pour mille.
 *
 * Premiere generation (3.2.7(2)) : branche inclinee jusqu a eps_ud, valeur
 *   recommandee 0,9 eps_uk, contrainte k f_yk/gamma_s a eps_uk.
 * Deuxieme generation (5.2.4(2)) : eps_ud <= eps_uk/gamma_S, meme branche.
 * Dans les deux generations : E_s = 200 000 MPa, f_yd = f_yk/gamma_S ;
 *   sigma(eps) = f_yd + (k f_yd - f_yd)(eps - eps_yd)/(eps_uk - eps_yd).
 * La branche horizontale sans limite de deformation reste permise ; elle
 *   n est pas calculee ici (sigma = f_yd).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { GAMMA_S_2004, GAMMA_S_2023, positif } from '../../materiaux';

export interface EntreeAcierCalcul {
  fyk?: number;
  /** Rapport k = (f_t/f_y)_k. */
  k?: number;
  /** Allongement sous charge maximale (pour mille). */
  epsUk?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAcierCalcul>;

const ES = 200000;

const R = {
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  k: { champ: 'k', libelle: 'champ.k-acier' },
  epsUk: { champ: 'epsUk', libelle: 'champ.eps-uk' },
} as const satisfies Record<string, { champ: keyof EntreeAcierCalcul; libelle: Cle }>;

export function brancheInclinee(e: Complete, gen: '2004' | '2023'): Calcul {
  positif(e.fyk, 'fyk', 'MPa');
  positif(e.epsUk, 'eps_uk', 'pour mille');
  if (!(e.k >= 1)) throw new Error('k doit etre au moins egal a 1.');
  const gs = gen === '2004' ? GAMMA_S_2004 : GAMMA_S_2023;
  const fyd = e.fyk / gs;
  const epsYd = (fyd / ES) * 1000;
  if (!(e.epsUk > epsYd)) throw new Error('eps_uk doit depasser eps_yd.');
  const epsUd = gen === '2004' ? 0.9 * e.epsUk : e.epsUk / gs;
  const sigma = fyd + ((e.k * fyd - fyd) * (epsUd - epsYd)) / (e.epsUk - epsYd);
  return {
    statut: { etat: 'calcule' },
    resistance: sigma,
    intermediaires: {
      f_yd: calculee(fyd, 'MPa'),
      'ε_yd': calculee(epsYd, '‰'),
      'ε_uk': saisie(e.epsUk, '‰'),
      'ε_ud': calculee(epsUd, '‰'),
      E_s: recommandee(ES, 'MPa'),
      'σ_sd(ε_ud)': calculee(sigma, 'MPa'),
    },
    clauses: gen === '2004' ? ['3.2.7(2)', 'figure 3.8'] : ['5.2.4(2)', 'figure 5.2'],
  };
}

function niveau(gen: '2004' | '2023'): DefinitionNiveau<EntreeAcierCalcul> {
  return {
    id: 'inclinee',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '3.2.7' : '5.2.4',
    hypothese: gen === '2004' ? 'niveau.ac.2004' : 'niveau.ac.2023',
    donneesRequises: [R.fyk, R.k, R.epsUk],
    conditions: () => null,
    calculer: (e) => brancheInclinee(e as Complete, gen),
  };
}

export const acierCalcul: Mecanisme<EntreeAcierCalcul> = {
  id: 'acier-calcul',
  version: '0.1.0',
  titre: 'meca.ac.titre',
  champs: [
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'k', libelle: 'champ.k-acier', symbole: 'k', unite: '-' },
    { type: 'nombre', id: 'epsUk', libelle: 'champ.eps-uk', symbole: 'ε_uk', unite: '‰' },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.contrainte-eps-ud', unite: 'MPa' },
  niveaux: { 'ec2-2004': [niveau('2004')], 'ec2-2023': [niveau('2023')] },
};
