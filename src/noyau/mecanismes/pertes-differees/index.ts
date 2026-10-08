/**
 * Pertes de precontrainte differees par fluage, retrait et relaxation,
 * expression simplifiee.
 *
 * Unites : MPa, mm, mm2, mm4 ; deformation de retrait en pour mille.
 *
 * Meme expression dans les deux generations ((5.46) ; (7.35)) :
 *   Delta sigma = (eps_cs E_p + 0,8 Delta sigma_pr + E_p/E_cm phi sigma_c,QP)
 *     / (1 + E_p/E_cm A_p/A_c (1 + A_c/I_c z_cp^2) (1 + 0,8 phi)).
 * Seul change E_cm : 22 000 (f_cm/10)^0,3 en 2004 (tableau 3.1),
 *   9 500 f_cm^(1/3) en 2023 (5.1.4, granulats quartzitiques).
 * eps_cs, phi, Delta sigma_pr (relaxation, 3.3.2 ou B.9) et sigma_c,QP
 *   (compression du beton au niveau des armatures sous charges quasi
 *   permanentes) sont saisis.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee } from '../../moteur/grandeurs';
import { ecm2004, ecm2023, positif } from '../../materiaux';

export interface EntreePertesDifferees {
  fck?: number;
  /** Retrait (pour mille, valeur absolue), coefficient de fluage, relaxation (MPa). */
  epsCs?: number;
  phi?: number;
  dSigmaPr?: number;
  /** Compression du beton au niveau des armatures, combinaison quasi permanente (MPa). */
  sigmaCQP?: number;
  Ep?: number;
  Ap?: number;
  Ac?: number;
  Ic?: number;
  /** Distance du centre de gravite de la section aux armatures (mm). */
  zcp?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePertesDifferees>;

const R = {
  fck: { champ: 'fck', libelle: 'champ.fck' },
  epsCs: { champ: 'epsCs', libelle: 'champ.eps-cs' },
  phi: { champ: 'phi', libelle: 'champ.phi-fluage' },
  dSigmaPr: { champ: 'dSigmaPr', libelle: 'champ.dsigma-pr' },
  sigmaCQP: { champ: 'sigmaCQP', libelle: 'champ.sigma-c-qp' },
  Ep: { champ: 'Ep', libelle: 'champ.Ep' },
  Ap: { champ: 'Ap', libelle: 'champ.Ap' },
  Ac: { champ: 'Ac', libelle: 'champ.Ac' },
  Ic: { champ: 'Ic', libelle: 'champ.Ic' },
  zcp: { champ: 'zcp', libelle: 'champ.zcp' },
} as const satisfies Record<string, { champ: keyof EntreePertesDifferees; libelle: Cle }>;

export function pertes(e: Complete, ecm: number, clauses: string[]): Calcul {
  for (const [v, n] of [
    [e.Ep, 'E_p'],
    [e.Ap, 'A_p'],
    [e.Ac, 'A_c'],
    [e.Ic, 'I_c'],
  ] as const) {
    positif(v, n, '-');
  }
  for (const [v, n] of [
    [e.epsCs, 'eps_cs'],
    [e.phi, 'phi'],
    [e.dSigmaPr, 'Delta sigma_pr'],
    [e.sigmaCQP, 'sigma_c,QP'],
    [e.zcp, 'z_cp'],
  ] as const) {
    if (!(Number.isFinite(v) && v >= 0)) throw new Error(`${n} doit etre positif ou nul.`);
  }
  const n = e.Ep / ecm;
  const num = (e.epsCs / 1000) * e.Ep + 0.8 * e.dSigmaPr + n * e.phi * e.sigmaCQP;
  const den = 1 + n * (e.Ap / e.Ac) * (1 + (e.Ac / e.Ic) * e.zcp ** 2) * (1 + 0.8 * e.phi);
  return {
    statut: { etat: 'calcule' },
    sollicitation: num / den,
    intermediaires: {
      E_cm: calculee(ecm, 'MPa'),
      'E_p/E_cm': calculee(n, '-'),
      'ε_cs E_p': calculee((e.epsCs / 1000) * e.Ep, 'MPa'),
      'E_p/E_cm φ σ_c,QP': calculee(n * e.phi * e.sigmaCQP, 'MPa'),
      numérateur: calculee(num, 'MPa'),
      dénominateur: calculee(den, '-'),
    },
    clauses,
  };
}

const requises = [R.fck, R.epsCs, R.phi, R.dSigmaPr, R.sigmaCQP, R.Ep, R.Ap, R.Ac, R.Ic, R.zcp];

function niveau(gen: '2004' | '2023'): DefinitionNiveau<EntreePertesDifferees> {
  return {
    id: 'simplifiee',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '5.10.6' : '7.6.4',
    hypothese: 'niveau.pd.simplifiee',
    donneesRequises: requises,
    domaine: (e) => ((e.fck as number) > 90 ? 'motif.fck-sup-90' : null),
    conditions: () => null,
    calculer: (e) =>
      gen === '2004'
        ? pertes(e as Complete, ecm2004(e.fck as number), ['5.10.6(2)', '(5.46)', 'tableau 3.1'])
        : pertes(e as Complete, ecm2023(e.fck as number), ['7.6.4(2)', '(7.35)', '5.1.4']),
  };
}

export const pertesDifferees: Mecanisme<EntreePertesDifferees> = {
  id: 'pertes-differees',
  version: '0.1.0',
  titre: 'meca.pd.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'epsCs', libelle: 'champ.eps-cs', symbole: 'ε_cs', unite: '‰' },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi-fluage', symbole: 'φ(t, t_0)', unite: '-' },
    { type: 'nombre', id: 'dSigmaPr', libelle: 'champ.dsigma-pr', symbole: 'Δσ_pr', unite: 'MPa' },
    { type: 'nombre', id: 'sigmaCQP', libelle: 'champ.sigma-c-qp', symbole: 'σ_c,QP', unite: 'MPa' },
    { type: 'nombre', id: 'Ep', libelle: 'champ.Ep', symbole: 'E_p', unite: 'MPa' },
    { type: 'nombre', id: 'Ap', libelle: 'champ.Ap', symbole: 'A_p', unite: 'mm²' },
    { type: 'nombre', id: 'Ac', libelle: 'champ.Ac', symbole: 'A_c', unite: 'mm²' },
    { type: 'nombre', id: 'Ic', libelle: 'champ.Ic', symbole: 'I_c', unite: 'mm⁴' },
    { type: 'nombre', id: 'zcp', libelle: 'champ.zcp', symbole: 'z_cp', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.pertes-differees', unite: 'MPa' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'ec2-2004': [niveau('2004')], 'ec2-2023': [niveau('2023')] },
};
