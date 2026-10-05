/**
 * Ancrage en traction par coude ou crochet standard.
 *
 * Unites : mm, MPa.
 *
 * Premiere generation (8.4.4, tableau 8.2, figure 8.3 b)) :
 *   l_bd = alpha_1 alpha_2 l_b,rqd >= l_b,min,
 *   c_d = min(a/2 ; c_1) pour une barre coudee ou a crochet,
 *   alpha_1 = 0,7 si c_d > 3 phi, 1,0 sinon,
 *   alpha_2 = 1 - 0,15 (c_d - 3 phi)/phi borne a [0,7 ; 1,0].
 * Deuxieme generation (11.4.4(1), figure 11.6 c)) :
 *   l_bd = l_bd,droit - 15 phi >= 10 phi, l_bd,droit selon (11.3) avec
 *   c_d = min(c_s/2 ; c_x ; c_y ; c_yb) <= 3,75 phi.
 * Les autres coefficients de 2004 (alpha_3, alpha_4, alpha_5) valent 1.
 * Deux niveaux par generation : barre plastifiee et contrainte reelle.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_S_2004, GAMMA_S_2023, fctm2004, positif } from '../../materiaux';

export interface EntreeAncrageCrochet {
  phi?: number;
  fck?: number;
  fyk?: number;
  sigmaSd?: number;
  adherence?: string;
  /** Distance libre entre barres (mm). */
  cs?: number;
  /** Enrobage lateral (mm). */
  cx?: number;
  /** Enrobage dans le plan du coude (mm). */
  cy?: number;
  lDispo?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAncrageCrochet>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
  adherence: { champ: 'adherence', libelle: 'champ.adherence' },
  cs: { champ: 'cs', libelle: 'champ.cs' },
  cx: { champ: 'cx', libelle: 'champ.cx' },
  cy: { champ: 'cy', libelle: 'champ.cy-coude' },
  lDispo: { champ: 'lDispo', libelle: 'champ.lDispo' },
} as const satisfies Record<string, { champ: keyof EntreeAncrageCrochet; libelle: Cle }>;

const communs = [R.phi, R.fck, R.fyk, R.adherence, R.cs, R.cx, R.cy, R.lDispo];

function domaine(e: EntreeAncrageCrochet): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function contrainteAdmise(gammaS: number) {
  return (e: EntreeAncrageCrochet): Cle | null =>
    (e.sigmaSd as number) > (e.fyk as number) / gammaS ? 'motif.sigma-sup-fyd' : null;
}

function verifier(e: Complete, sigma: number): void {
  for (const [v, nom] of [
    [e.phi, 'phi'],
    [e.cs, 'cs'],
    [e.cx, 'cx'],
    [e.cy, 'cy'],
    [e.lDispo, 'lDispo'],
  ] as const) {
    positif(v, nom, 'mm');
  }
  positif(sigma, 'sigma_sd', 'MPa');
}

function crochet2004(e: Complete, sigma: number): Calcul {
  verifier(e, sigma);
  const fctd = (0.7 * fctm2004(Math.min(e.fck, 60))) / GAMMA_C_2004;
  const eta1 = e.adherence === 'mediocre' ? 0.7 : 1;
  const eta2 = e.phi <= 32 ? 1 : (132 - e.phi) / 100;
  const fbd = 2.25 * eta1 * eta2 * fctd;
  const lbrqd = ((e.phi / 4) * sigma) / fbd;
  const cd = Math.min(e.cs / 2, e.cx);
  const alpha1 = cd > 3 * e.phi ? 0.7 : 1;
  const alpha2 = Math.min(Math.max(1 - (0.15 * (cd - 3 * e.phi)) / e.phi, 0.7), 1);
  const lmin = Math.max(0.3 * lbrqd, 10 * e.phi, 100);
  const lbd = Math.max(alpha1 * alpha2 * lbrqd, lmin);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbd,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      f_bd: calculee(fbd, 'MPa'),
      'l_b,rqd': calculee(lbrqd, 'mm'),
      c_d: calculee(cd, 'mm'),
      'α_1': recommandee(alpha1, '-'),
      'α_2': calculee(alpha2, '-'),
      'l_b,min': calculee(lmin, 'mm'),
      l_bd: calculee(lbd, 'mm'),
    },
    clauses: ['8.4.4', 'tableau 8.2', 'figure 8.3 b)'],
  };
}

function crochet2023(e: Complete, sigma: number): Calcul {
  verifier(e, sigma);
  const kcp = e.adherence === 'mediocre' ? 1.2 : 1;
  const cd = Math.min(e.cs / 2, e.cx, e.cy, 3.75 * e.phi);
  const droit =
    50 *
    kcp *
    e.phi *
    (sigma / 435) ** 1.5 *
    Math.sqrt(Math.max(25 / e.fck, 0.3)) *
    Math.max(e.phi / 20, 0.6) ** (1 / 3) *
    Math.sqrt((1.5 * e.phi) / cd);
  const lbdDroit = Math.max(droit, 10 * e.phi);
  const lbd = Math.max(lbdDroit - 15 * e.phi, 10 * e.phi);
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbd,
    resistance: e.lDispo,
    intermediaires: {
      'σ_sd': calculee(sigma, 'MPa'),
      k_cp: recommandee(kcp, '-'),
      c_d: calculee(cd, 'mm'),
      'l_bd (barre droite)': calculee(lbdDroit, 'mm'),
      'réduction 15 φ': calculee(15 * e.phi, 'mm'),
      l_bd: calculee(lbd, 'mm'),
    },
    clauses: ['11.4.4(1)', '(11.3)', 'figure 11.6'],
  };
}

function niveaux(gen: '2004' | '2023'): DefinitionNiveau<EntreeAncrageCrochet>[] {
  const gammaS = gen === '2004' ? GAMMA_S_2004 : GAMMA_S_2023;
  const f = gen === '2004' ? crochet2004 : crochet2023;
  const clause = gen === '2004' ? '8.4.4' : '11.4.4';
  return [
    {
      id: 'barre-plastifiee',
      ordre: 1,
      position: 'corps',
      clause,
      hypothese: gen === '2004' ? 'niveau.cro.2004.barre-plastifiee' : 'niveau.cro.2023.barre-plastifiee',
      donneesRequises: communs,
      domaine,
      conditions: () => null,
      calculer: (e) => f(e as Complete, (e.fyk as number) / gammaS),
    },
    {
      id: 'contrainte-reelle',
      ordre: 2,
      position: 'corps',
      clause,
      hypothese: gen === '2004' ? 'niveau.cro.2004.contrainte-reelle' : 'niveau.cro.2023.contrainte-reelle',
      donneesRequises: [...communs, R.sigmaSd],
      domaine,
      conditions: contrainteAdmise(gammaS),
      calculer: (e) => f(e as Complete, e.sigmaSd as number),
    },
  ];
}

export const ancrageCrochet: Mecanisme<EntreeAncrageCrochet> = {
  id: 'ancrage-crochet',
  version: '0.1.0',
  titre: 'meca.cro.titre',
  champs: [
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'sigmaSd', libelle: 'champ.sigmaSd', symbole: 'σ_sd', unite: 'MPa', facultatif: true },
    {
      type: 'choix',
      id: 'adherence',
      libelle: 'champ.adherence',
      options: [
        { valeur: 'bonne', libelle: 'option.adherence.bonne' },
        { valeur: 'mediocre', libelle: 'option.adherence.mediocre' },
      ],
    },
    { type: 'nombre', id: 'cs', libelle: 'champ.cs', symbole: 'c_s', unite: 'mm' },
    { type: 'nombre', id: 'cx', libelle: 'champ.cx', symbole: 'c_x', unite: 'mm' },
    { type: 'nombre', id: 'cy', libelle: 'champ.cy-coude', symbole: 'c_y', unite: 'mm' },
    { type: 'nombre', id: 'lDispo', libelle: 'champ.lDispo', symbole: 'l_dispo', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.longueur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-disponible', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux('2004'), 'ec2-2023': niveaux('2023') },
};
