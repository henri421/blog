/**
 * Limitation des contraintes a l etat-limite de service, section
 * rectangulaire fissuree a armatures tendues seules, flexion simple.
 *
 * Unites : mm, MPa, kN.m.
 *
 * Contraintes : section fissuree elastique, b x^2/2 = alpha A_s (d - x),
 *   I = b x^3/3 + alpha A_s (d - x)^2, sigma_c = M x / I,
 *   sigma_s = alpha M (d - x) / I, alpha = E_s / E_c.
 * Premiere generation (7.2) : sous combinaison caracteristique sigma_s <=
 *   k3 f_yk = 0,8 f_yk et, en XD, XF, XS, sigma_c <= k1 f_ck = 0,6 f_ck
 *   (module E_cm) ; sous combinaison quasi permanente, seuil k2 f_ck =
 *   0,45 f_ck au-dela duquel le fluage non lineaire est a considerer (7.2(3)),
 *   E_c,eff = E_cm/(1 + phi) (7.20).
 * Deuxieme generation (9.1, 9.2.1, tableaux 9.1 et 9.2) : sigma_s <= 0,8 f_yk
 *   et, en XD, XS, XF, sigma_c <= 0,6 f_ck (combinaison caracteristique) ;
 *   seuil du fluage non lineaire sous combinaison quasi permanente 0,40 f_cm
 *   (9.1(4)), E_c,eff = 1,05 E_cm/(1 + phi) (9.1). Dans les deux generations,
 *   le niveau quasi permanent compare la contrainte a un seuil, non a une
 *   limite de conformite.
 * Choix de l outil : module E_cm pour la combinaison caracteristique.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { ES, ecm2004, ecm2023, positif } from '../../materiaux';

export interface EntreeContraintesEls {
  b?: number;
  d?: number;
  As?: number;
  fck?: number;
  fyk?: number;
  /** Moment sous combinaison caracteristique (kN.m). */
  Mcar?: number;
  /** Moment sous combinaison quasi permanente (kN.m). */
  Mqp?: number;
  /** Coefficient de fluage phi(infini, t0). */
  phi?: number;
  /** 'oui' si la classe d exposition est XD, XS ou XF. */
  exposition?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeContraintesEls>;
const NMM_PAR_KNM = 1e6;

const R = {
  b: { champ: 'b', libelle: 'champ.b' },
  d: { champ: 'd', libelle: 'champ.d' },
  As: { champ: 'As', libelle: 'champ.As' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  Mcar: { champ: 'Mcar', libelle: 'champ.Mcar' },
  Mqp: { champ: 'Mqp', libelle: 'champ.Mqp' },
  phi: { champ: 'phi', libelle: 'champ.phi-fluage' },
  exposition: { champ: 'exposition', libelle: 'champ.exposition-xd' },
} as const satisfies Record<string, { champ: keyof EntreeContraintesEls; libelle: Cle }>;

const section = [R.b, R.d, R.As, R.fck, R.fyk];

function domaine(e: EntreeContraintesEls): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

interface Contraintes {
  alpha: number;
  x: number;
  sigmaC: number;
  sigmaS: number;
}

/** Section fissuree elastique, armatures tendues seules. */
export function contraintesFissurees(e: Complete, M: number, Ec: number): Contraintes {
  positif(e.b, 'b', 'mm');
  positif(e.d, 'd', 'mm');
  positif(e.As, 'As', 'mm2');
  const alpha = ES / Ec;
  const a = alpha * e.As;
  const x = (-a + Math.sqrt(a * a + 2 * e.b * a * e.d)) / e.b;
  const I = (e.b * x ** 3) / 3 + a * (e.d - x) ** 2;
  const m = M * NMM_PAR_KNM;
  return { alpha, x, sigmaC: (m * x) / I, sigmaS: (alpha * m * (e.d - x)) / I };
}

function cellule(sigma: number, limite: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  return { statut: { etat: 'calcule' }, sollicitation: sigma, resistance: limite, intermediaires: inter, clauses };
}

function acier(e: Complete, Ecm: number, clauses: string[]): Calcul {
  positif(e.Mcar, 'M_car', 'kN.m');
  const c = contraintesFissurees(e, e.Mcar, Ecm);
  return cellule(c.sigmaS, 0.8 * e.fyk, { E_cm: calculee(Ecm, 'MPa'), 'α_e': calculee(c.alpha, '-'), x: calculee(c.x, 'mm'), 'σ_s': calculee(c.sigmaS, 'MPa'), k_3: recommandee(0.8, '-') }, clauses);
}

function betonCaracteristique(e: Complete, Ecm: number, clauses: string[]): Calcul {
  positif(e.Mcar, 'M_car', 'kN.m');
  const c = contraintesFissurees(e, e.Mcar, Ecm);
  return cellule(c.sigmaC, 0.6 * e.fck, { E_cm: calculee(Ecm, 'MPa'), x: calculee(c.x, 'mm'), 'σ_c': calculee(c.sigmaC, 'MPa'), k_1: recommandee(0.6, '-') }, clauses);
}

const conditionExposition = (e: EntreeContraintesEls): Cle | null => (e.exposition === 'oui' ? null : 'motif.exposition-sans-limite');

export function quasiPermanent2004(e: Complete): Calcul {
  positif(e.Mqp, 'M_qp', 'kN.m');
  const Eceff = ecm2004(e.fck) / (1 + e.phi);
  const c = contraintesFissurees(e, e.Mqp, Eceff);
  return cellule(c.sigmaC, 0.45 * e.fck, { 'E_c,eff': calculee(Eceff, 'MPa'), 'α_e': calculee(c.alpha, '-'), x: calculee(c.x, 'mm'), 'σ_c': calculee(c.sigmaC, 'MPa'), k_2: recommandee(0.45, '-') }, [
    '7.2(3)',
    '(7.20)',
  ]);
}

export function quasiPermanent2023(e: Complete): Calcul {
  positif(e.Mqp, 'M_qp', 'kN.m');
  const Eceff = (1.05 * ecm2023(e.fck)) / (1 + e.phi);
  const c = contraintesFissurees(e, e.Mqp, Eceff);
  const fcm = e.fck + 8;
  return cellule(c.sigmaC, 0.4 * fcm, { 'E_c,eff': calculee(Eceff, 'MPa'), 'α_e': calculee(c.alpha, '-'), x: calculee(c.x, 'mm'), 'σ_c': calculee(c.sigmaC, 'MPa'), f_cm: calculee(fcm, 'MPa') }, [
    '9.1(4)',
    '(9.1)',
  ]);
}

const niveaux2004: DefinitionNiveau<EntreeContraintesEls>[] = [
  {
    id: 'acier',
    ordre: 1,
    position: 'corps',
    clause: '7.2(5)',
    hypothese: 'niveau.els.acier',
    donneesRequises: [...section, R.Mcar],
    domaine,
    conditions: () => null,
    calculer: (e) => acier(e as Complete, ecm2004((e as Complete).fck), ['7.2(5)']),
  },
  {
    id: 'beton-caracteristique',
    ordre: 2,
    position: 'corps',
    clause: '7.2(2)',
    hypothese: 'niveau.els.beton-caracteristique',
    donneesRequises: [...section, R.Mcar, R.exposition],
    domaine,
    conditions: conditionExposition,
    calculer: (e) => betonCaracteristique(e as Complete, ecm2004((e as Complete).fck), ['7.2(2)']),
  },
  {
    id: 'beton-quasi-permanent',
    ordre: 3,
    position: 'corps',
    clause: '7.2(3)',
    hypothese: 'niveau.els.2004.quasi-permanent',
    donneesRequises: [...section, R.Mqp, R.phi],
    domaine,
    conditions: () => null,
    calculer: (e) => quasiPermanent2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeContraintesEls>[] = [
  {
    id: 'acier',
    ordre: 1,
    position: 'corps',
    clause: '9.2.1',
    hypothese: 'niveau.els.acier',
    donneesRequises: [...section, R.Mcar],
    domaine,
    conditions: () => null,
    calculer: (e) => acier(e as Complete, ecm2023((e as Complete).fck), ['9.2.1(6)', 'tableau 9.1']),
  },
  {
    id: 'beton-caracteristique',
    ordre: 2,
    position: 'corps',
    clause: '9.2.1',
    hypothese: 'niveau.els.beton-caracteristique',
    donneesRequises: [...section, R.Mcar, R.exposition],
    domaine,
    conditions: conditionExposition,
    calculer: (e) => betonCaracteristique(e as Complete, ecm2023((e as Complete).fck), ['9.2.1(6)', 'tableau 9.2']),
  },
  {
    id: 'beton-quasi-permanent',
    ordre: 3,
    position: 'corps',
    clause: '9.1(4)',
    hypothese: 'niveau.els.2023.quasi-permanent',
    donneesRequises: [...section, R.Mqp, R.phi],
    domaine,
    conditions: () => null,
    calculer: (e) => quasiPermanent2023(e as Complete),
  },
];

export const contraintesEls: Mecanisme<EntreeContraintesEls> = {
  id: 'contraintes-els',
  version: '0.1.0',
  titre: 'meca.els.titre',
  champs: [
    { type: 'nombre', id: 'Mcar', libelle: 'champ.Mcar', symbole: 'M_car', unite: 'kN·m' },
    { type: 'nombre', id: 'Mqp', libelle: 'champ.Mqp', symbole: 'M_qp', unite: 'kN·m' },
    { type: 'nombre', id: 'b', libelle: 'champ.b', symbole: 'b', unite: 'mm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d', symbole: 'd', unite: 'mm' },
    { type: 'nombre', id: 'As', libelle: 'champ.As', symbole: 'A_s', unite: 'mm²' },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi-fluage', symbole: 'φ', unite: '-' },
    {
      type: 'choix',
      id: 'exposition',
      libelle: 'champ.exposition-xd',
      options: [
        { valeur: 'non', libelle: 'option.non' },
        { valeur: 'oui', libelle: 'option.oui' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.contrainte-els', unite: 'MPa' },
  resistance: { libelle: 'grandeur.contrainte-limite-els', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
