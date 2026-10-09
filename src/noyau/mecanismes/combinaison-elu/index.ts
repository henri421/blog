/**
 * Combinaison d actions a l ELU, situations durables et transitoires,
 * batiments, verification de la resistance structurale (STR).
 *
 * Unites : celles des effets saisis (kN, kN.m...) ; le calcul est lineaire.
 *
 * Premiere generation (EN 1990:2002, 6.4.3.2, tableau A1.2(B), valeurs
 *   recommandees) :
 *   (6.10)  1,35 G + 1,5 Q1 + 1,5 psi0,2 Q2 ;
 *   (6.10a) 1,35 G + 1,5 psi0,1 Q1 + 1,5 psi0,2 Q2 ;
 *   (6.10b) xi 1,35 G + 1,5 Q1 + 1,5 psi0,2 Q2, xi = 0,85 ; la plus defavorable.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 8.3.4.2, tableau A.1.8, cas VC1 ;
 *   tableau A.1.9) : gamma_G = 1,35 k_F, gamma_Q = 1,5 k_F, k_F = 0,9, 1,0 ou
 *   1,1 (CC1, CC2, CC3), xi = 0,85 :
 *   (8.12) gamma_G G + gamma_Q Q1 + gamma_Q psi0,2 Q2 (methode par defaut, NOTE 1) ;
 *   (8.13) les deux expressions de (6.10a), (6.10b) ;
 *   (8.14) gamma_G G seul, ou xi gamma_G G + gamma_Q Q1 + gamma_Q psi0,2 Q2 ;
 *   xi gamma_G >= 1,0 (A.1.7(3)).
 * Choix de l outil : une action permanente defavorable, une action variable
 *   dominante et une d accompagnement, saisies comme effets ; psi0 saisis
 *   (tableau A1.1 ; A.1.6) ; l ingenieur permute lui-meme l action dominante ;
 *   pas de precontrainte ; le facteur K_FI de l annexe B (2002, informative)
 *   n est pas applique.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeCombinaisonElu {
  /** Effet des actions permanentes defavorables. */
  G?: number;
  /** Effet de l action variable dominante. */
  Q1?: number;
  psi01?: number;
  /** Effet de l action variable d accompagnement (0 s il n y en a pas). */
  Q2?: number;
  psi02?: number;
  /** Classe de consequences : 'CC1', 'CC2' ou 'CC3' (2023). */
  cc?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeCombinaisonElu>;

export const GAMMA_G = 1.35;
export const GAMMA_Q = 1.5;
export const XI = 0.85;

const R = {
  G: { champ: 'G', libelle: 'champ.G-effet' },
  Q1: { champ: 'Q1', libelle: 'champ.Q1-effet' },
  psi01: { champ: 'psi01', libelle: 'champ.psi01' },
  Q2: { champ: 'Q2', libelle: 'champ.Q2-effet' },
  psi02: { champ: 'psi02', libelle: 'champ.psi02' },
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
} as const satisfies Record<string, { champ: keyof EntreeCombinaisonElu; libelle: Cle }>;

export function kF(cc: string): number {
  return cc === 'CC3' ? 1.1 : cc === 'CC1' ? 0.9 : 1.0;
}

function verifier(e: Complete): void {
  positif(e.G, 'G', 'effet');
  positif(e.Q1, 'Q1', 'effet');
  if (!(e.Q2 >= 0)) throw new Error('Q2 doit etre positif ou nul.');
  for (const [v, nom] of [
    [e.psi01, 'psi0,1'],
    [e.psi02, 'psi0,2'],
  ] as const) {
    if (!(v >= 0 && v <= 1)) throw new Error(`${nom} doit etre compris entre 0 et 1.`);
  }
}

interface Facteurs {
  gG: number;
  gQ: number;
}

/** Expression de base : gamma_G G + gamma_Q (psi Q1) + gamma_Q psi0,2 Q2. */
function expression(e: Complete, f: Facteurs, coefG: number, psiQ1: number): number {
  return coefG * f.gG * e.G + f.gQ * psiQ1 * e.Q1 + f.gQ * e.psi02 * e.Q2;
}

function cellule(e: Complete, Ed: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  return {
    statut: { etat: 'calcule' },
    sollicitation: Ed,
    intermediaires: {
      ...inter,
      E_d: calculee(Ed, '-'),
      'E_d / (G + Q1 + Q2)': calculee(Ed / (e.G + e.Q1 + e.Q2), '-'),
    },
    clauses,
  };
}

const F2002: Facteurs = { gG: GAMMA_G, gQ: GAMMA_Q };

export function e610(e: Complete): Calcul {
  verifier(e);
  const Ed = expression(e, F2002, 1, 1);
  return cellule(e, Ed, { 'γ_G': recommandee(GAMMA_G, '-'), 'γ_Q': recommandee(GAMMA_Q, '-'), '(6.10)': calculee(Ed, '-') }, ['6.4.3.2(3)', '(6.10)', 'tableau A1.2(B)']);
}

export function e610ab(e: Complete): Calcul {
  verifier(e);
  const a = expression(e, F2002, 1, e.psi01);
  const b = expression(e, F2002, XI, 1);
  return cellule(
    e,
    Math.max(a, b),
    { 'γ_G': recommandee(GAMMA_G, '-'), 'γ_Q': recommandee(GAMMA_Q, '-'), 'ξ': recommandee(XI, '-'), '(6.10a)': calculee(a, '-'), '(6.10b)': calculee(b, '-') },
    ['6.4.3.2(3)', '(6.10a)', '(6.10b)', 'tableau A1.2(B)'],
  );
}

function facteurs2023(e: Complete): Facteurs & { k: number } {
  const k = kF(e.cc);
  return { gG: GAMMA_G * k, gQ: GAMMA_Q * k, k };
}

function base2023(f: Facteurs & { k: number }): Cellule['intermediaires'] {
  return { k_F: recommandee(f.k, '-'), 'γ_G': calculee(f.gG, '-'), 'γ_Q': calculee(f.gQ, '-') };
}

export function e812(e: Complete): Calcul {
  verifier(e);
  const f = facteurs2023(e);
  const Ed = expression(e, f, 1, 1);
  return cellule(e, Ed, { ...base2023(f), '(8.12)': calculee(Ed, '-') }, ['8.3.4.2(2)', '(8.12)', 'tableau A.1.8', 'tableau A.1.9']);
}

export function e813(e: Complete): Calcul {
  verifier(e);
  const f = facteurs2023(e);
  const a = expression(e, f, 1, e.psi01);
  const b = expression(e, f, XI, 1);
  return cellule(
    e,
    Math.max(a, b),
    { ...base2023(f), 'ξ': recommandee(XI, '-'), '(8.13) haut': calculee(a, '-'), '(8.13) bas': calculee(b, '-') },
    ['8.3.4.2(2)', '(8.13)', 'tableau A.1.8', 'tableau A.1.9', 'A.1.7(3)'],
  );
}

export function e814(e: Complete): Calcul {
  verifier(e);
  const f = facteurs2023(e);
  const a = f.gG * e.G;
  const b = expression(e, f, XI, 1);
  return cellule(
    e,
    Math.max(a, b),
    { ...base2023(f), 'ξ': recommandee(XI, '-'), '(8.14) haut': calculee(a, '-'), '(8.14) bas': calculee(b, '-') },
    ['8.3.4.2(2)', '(8.14)', 'tableau A.1.8', 'tableau A.1.9', 'A.1.7(3)'],
  );
}

const communs = [R.G, R.Q1, R.psi01, R.Q2, R.psi02];

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, requis: DefinitionNiveau<EntreeCombinaisonElu>['donneesRequises'], calculer: (e: Complete) => Calcul): DefinitionNiveau<EntreeCombinaisonElu> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => calculer(e as Complete) };
}

const avecCc = [...communs, R.cc];

export const combinaisonElu: Mecanisme<EntreeCombinaisonElu> = {
  id: 'combinaison-elu',
  version: '0.1.0',
  titre: 'meca.comb.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'G', libelle: 'champ.G-effet', symbole: 'G_k', unite: 'kN' },
    { type: 'nombre', id: 'Q1', libelle: 'champ.Q1-effet', symbole: 'Q_k,1', unite: 'kN' },
    { type: 'nombre', id: 'psi01', libelle: 'champ.psi01', symbole: 'ψ_0,1', unite: '-' },
    { type: 'nombre', id: 'Q2', libelle: 'champ.Q2-effet', symbole: 'Q_k,2', unite: 'kN' },
    { type: 'nombre', id: 'psi02', libelle: 'champ.psi02', symbole: 'ψ_0,2', unite: '-' },
    {
      type: 'choix',
      id: 'cc',
      libelle: 'champ.classe-consequences',
      options: [
        { valeur: 'CC1', libelle: 'option.cc.CC1' },
        { valeur: 'CC2', libelle: 'option.cc.CC2' },
        { valeur: 'CC3', libelle: 'option.cc.CC3' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.effet-calcul-elu', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1990-2002': [
      niveau('e610', 1, '6.4.3.2(3)', 'niveau.comb.2002.e610', communs, e610),
      niveau('e610ab', 2, '6.4.3.2(3)', 'niveau.comb.2002.e610ab', communs, e610ab),
    ],
    'en1990-2023': [
      niveau('e812', 1, '8.3.4.2(2)', 'niveau.comb.2023.e812', avecCc, e812),
      niveau('e813', 2, '8.3.4.2(2)', 'niveau.comb.2023.e813', avecCc, e813),
      niveau('e814', 3, '8.3.4.2(2)', 'niveau.comb.2023.e814', avecCc, e814),
    ],
  },
};
