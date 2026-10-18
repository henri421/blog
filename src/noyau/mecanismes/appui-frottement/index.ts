/**
 * Force transmise a un point fixe par le frottement d appareils d appui a
 * glissement, avec compensation partielle des frottements opposes.
 *
 * Unites : kN ; coefficients sans dimension.
 *
 * Premiere generation : regles dans l EN 1337-1:2000 (6.2), hors de l EN 1990 ;
 *   niveau sans equivalent ici.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, annexe G, G.7.1.2, (G.1),
 *   G.7.3.1, (G.4) a (G.6), tableau G.3) : F_bd = gamma_Sd mu_d N_d (G.1) ;
 *   mu_d = mu_max (G.4) ; frottements opposes : mu_d = 0,5 mu_max (1 + alpha_n),
 *   mu_d,fav = 0,5 mu_max (1 - alpha_n) ; alpha_n = 1 (n <= 4), (16 - n)/12
 *   (4 < n < 10), 0,5 (n >= 10) ; gamma_Sd = 1,0.
 * Choix de l outil : N_d identique sur tous les appareils ; n_u appareils
 *   defavorables, n_f favorables.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeAppuiFrottement {
  mumax?: number;
  Nd?: number;
  nu?: number;
  nf?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAppuiFrottement>;

const R = {
  mumax: { champ: 'mumax', libelle: 'champ.mumax' },
  Nd: { champ: 'Nd', libelle: 'champ.Nd-appui' },
  nu: { champ: 'nu', libelle: 'champ.n-defavorables' },
  nf: { champ: 'nf', libelle: 'champ.n-favorables' },
} as const satisfies Record<string, { champ: keyof EntreeAppuiFrottement; libelle: Cle }>;

export function alphaN(n: number): number {
  return n <= 4 ? 1 : n < 10 ? (16 - n) / 12 : 0.5;
}

function verifier(e: Complete): void {
  positif(e.mumax, 'mumax', '-');
  positif(e.Nd, 'Nd', 'kN');
  if (!(Number.isInteger(e.nu) && e.nu >= 1)) throw new Error('nu doit etre un entier au moins egal a 1.');
  if (!(Number.isInteger(e.nf) && e.nf >= 0)) throw new Error('nf doit etre un entier positif ou nul.');
}

export function sansCompensation(e: Complete): Calcul {
  verifier(e);
  const F = e.nu * e.mumax * e.Nd;
  return { statut: { etat: 'calcule' }, sollicitation: F, intermediaires: { 'μ_d': saisie(e.mumax, '-'), 'γ_Sd': recommandee(1, '-'), F: calculee(F, 'kN') }, clauses: ['(G.1)', '(G.4)'] };
}

export function compense(e: Complete): Calcul {
  verifier(e);
  const au = alphaN(e.nu);
  const af = alphaN(Math.max(e.nf, 1));
  const mu = 0.5 * e.mumax * (1 + au);
  const muf = 0.5 * e.mumax * (1 - af);
  const F = e.nu * mu * e.Nd - e.nf * muf * e.Nd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: F,
    intermediaires: { 'α_n (défavorables)': calculee(au, '-'), 'α_n (favorables)': calculee(af, '-'), 'μ_d': calculee(mu, '-'), 'μ_d,fav': calculee(muf, '-'), F: calculee(F, 'kN') },
    clauses: ['(G.5)', '(G.6)', 'tableau G.3'],
  };
}

const requis = [R.mumax, R.Nd, R.nu, R.nf];

function niveau2023(id: string, ordre: number, clause: string, hypothese: Cle, f: (e: Complete) => Calcul): DefinitionNiveau<EntreeAppuiFrottement> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => f(e as Complete) };
}

function sans(id: string, ordre: number): DefinitionNiveau<EntreeAppuiFrottement> {
  return {
    id,
    ordre,
    position: 'corps',
    clause: '—',
    hypothese: 'niveau.frottement.2002',
    donneesRequises: requis,
    conditions: () => 'motif.sans-equivalent-2004',
    calculer: () => {
      throw new Error('Regle hors EN 1990:2002 : jamais calcule.');
    },
  };
}

export const appuiFrottement: Mecanisme<EntreeAppuiFrottement> = {
  id: 'appui-frottement',
  version: '0.1.0',
  titre: 'meca.frottement.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'mumax', libelle: 'champ.mumax', symbole: 'μ_max', unite: '-' },
    { type: 'nombre', id: 'Nd', libelle: 'champ.Nd-appui', symbole: 'N_d', unite: 'kN' },
    { type: 'nombre', id: 'nu', libelle: 'champ.n-defavorables', symbole: 'n_u', unite: '-' },
    { type: 'nombre', id: 'nf', libelle: 'champ.n-favorables', symbole: 'n_f', unite: '-' },
  ],
  sollicitation: { libelle: 'grandeur.force-point-fixe', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1990-2002': [sans('sans-compensation', 1), sans('compense', 2)],
    'en1990-2023': [niveau2023('sans-compensation', 1, 'G.7.1.2', 'niveau.frottement.2023.sans', sansCompensation), niveau2023('compense', 2, 'G.7.3.1(2)', 'niveau.frottement.2023.compense', compense)],
  },
};
