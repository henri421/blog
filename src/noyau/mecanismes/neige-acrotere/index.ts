/**
 * Accumulation de neige le long d un acrotere (toiture terrasse) : coefficient
 * de forme de pointe, longueur de congere et charge de pointe.
 *
 * Unites : kN/m2, m, kN/m3.
 *
 * Premiere generation (EN 1991-1-3:2003 + A1:2015, 6.2, figure 6.2, texte non
 *   detenu, a relire) : mu_2 = gamma h / s_k, 0,8 <= mu_2 <= 2,0 ;
 *   l_s = 2 h, 5 <= l_s <= 15 m ; gamma = 2 kN/m3 ; s = mu_2 C_e C_t s_k.
 * Deuxieme generation (EN 1991-1-3:2025, 8.3, (8.3), (8.4)) :
 *   mu_7 = (0,8/C_e)(2 b / l_s) <= min{0,8 gamma h_p/(C_e s_k) ; mu_7,max},
 *   mu_7,max = 4,0 ; l_s = 4 h_p / C_e, 5 <= l_s <= 15 m ; gamma = 2 kN/m3 ;
 *   s = mu_7 C_t s_k.
 * Choix de l outil : acrotere avec w/h >= 2 (sinon 8.2, obstruction).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { ce } from '../neige-toiture/index';

export interface EntreeNeigeAcrotere {
  sk?: number;
  hp?: number;
  b?: number;
  exposition?: string;
  Ct?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeNeigeAcrotere>;

export const GAMMA_NEIGE = 2.0;

const R = {
  sk: { champ: 'sk', libelle: 'champ.sk' },
  hp: { champ: 'hp', libelle: 'champ.hp-acrotere' },
  b: { champ: 'b', libelle: 'champ.b-toiture-acrotere' },
  exposition: { champ: 'exposition', libelle: 'champ.exposition-vent' },
  Ct: { champ: 'Ct', libelle: 'champ.Ct' },
} as const satisfies Record<string, { champ: keyof EntreeNeigeAcrotere; libelle: Cle }>;

const borner = (v: number, a: number, b: number): number => Math.min(Math.max(v, a), b);

function verifier(e: Complete): void {
  positif(e.sk, 'sk', 'kN/m2');
  positif(e.hp, 'hp', 'm');
  positif(e.b, 'b', 'm');
  positif(e.Ct, 'Ct', '-');
}

export function c2003(e: Complete): Calcul {
  verifier(e);
  const C = ce(e.exposition);
  const brut = (GAMMA_NEIGE * e.hp) / e.sk;
  const mu = borner(brut, 0.8, 2.0);
  const ls = borner(2 * e.hp, 5, 15);
  const s = mu * C * e.Ct * e.sk;
  return { statut: { etat: 'calcule' }, sollicitation: s, intermediaires: { 'γ h / s_k': calculee(brut, '-'), 'μ_2': calculee(mu, '-'), l_s: calculee(ls, 'm'), s: calculee(s, 'kN/m²') }, clauses: ['6.2', 'figure 6.2'] };
}

export function c2025(e: Complete): Calcul {
  verifier(e);
  const C = ce(e.exposition);
  const ls = borner((4 * e.hp) / C, 5, 15);
  const brut = (0.8 / C) * ((2 * e.b) / ls);
  const plafond = Math.min((0.8 * GAMMA_NEIGE * e.hp) / (C * e.sk), 4.0);
  const mu = Math.min(brut, plafond);
  const s = mu * e.Ct * e.sk;
  return {
    statut: { etat: 'calcule' },
    sollicitation: s,
    intermediaires: { l_s: calculee(ls, 'm'), '(0,8/C_e)(2b/l_s)': calculee(brut, '-'), plafond: calculee(plafond, '-'), 'μ_7,max': recommandee(4, '-'), 'μ_7': calculee(mu, '-'), s: calculee(s, 'kN/m²') },
    clauses: ['8.3', '(8.3)', '(8.4)'],
  };
}

const requis = [R.sk, R.hp, R.b, R.exposition, R.Ct];

function niveau(clause: string, hypothese: Cle, f: (e: Complete) => Calcul): DefinitionNiveau<EntreeNeigeAcrotere> {
  return { id: 'acrotere', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const neigeAcrotere: Mecanisme<EntreeNeigeAcrotere> = {
  id: 'neige-acrotere',
  version: '0.1.0',
  titre: 'meca.acrotere.titre',
  generations: ['en1991-1-3-2003', 'en1991-1-3-2025'],
  champs: [
    { type: 'nombre', id: 'sk', libelle: 'champ.sk', symbole: 's_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'hp', libelle: 'champ.hp-acrotere', symbole: 'h_p', unite: 'm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b-toiture-acrotere', symbole: 'b', unite: 'm' },
    {
      type: 'choix',
      id: 'exposition',
      libelle: 'champ.exposition-vent',
      options: [
        { valeur: 'balaye', libelle: 'option.exposition.balaye' },
        { valeur: 'normal', libelle: 'option.exposition.normal' },
        { valeur: 'protege', libelle: 'option.exposition.protege' },
      ],
    },
    { type: 'nombre', id: 'Ct', libelle: 'champ.Ct', symbole: 'C_t', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.neige-pointe', unite: 'kN/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-3-2003': [niveau('6.2', 'niveau.acrotere.2003', c2003)], 'en1991-1-3-2025': [niveau('8.3', 'niveau.acrotere.2025', c2025)] },
};
