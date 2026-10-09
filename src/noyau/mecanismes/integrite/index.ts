/**
 * Armatures d integrite des planchers-dalles au droit des poteaux, contre
 * l effondrement progressif apres poinconnement.
 *
 * Unites : mm, MPa, kN.
 *
 * Premiere generation (9.4.1(3)) : au moins deux barres inferieures dans
 *   chaque direction orthogonale traversent les poteaux interieurs ; aucune
 *   verification de resistance.
 * Deuxieme generation (12.5.2, batiments CC2 et au-dela) : au moins deux
 *   barres par direction, de classe B ou C, ancrees dans le poteau ou le
 *   traversant, dans la partie comprimee de la dalle, et
 *   V_Rd,int = somme(A_s,int) f_yd k_int >= V_Ed (12.10), V_Ed de la situation
 *   accidentelle, k_int = 0,37 (classe B) ou 0,49 (classe C) ;
 *   dalle sans armature transversale : la resistance peut etre augmentee de
 *   V_Rd,hog = n_hog sqrt(f_ck)/gamma_C phi b_ef,hog (12.12),
 *   b_ef,hog = min(s - phi ; 6 phi ; 4 c).
 * Choix de l outil : coefficients partiels de la situation accidentelle,
 *   gamma_S = 1,0 et gamma_C = 1,15 (tableau 4.3) ; A_s,int est la somme des
 *   sections qui traversent un bord du poteau (une barre ancree des deux cotes
 *   compte deux fois), saisie ; n_hog saisi ; le cas des dalles avec armatures
 *   d effort tranchant (12.11) est decrit dans l article, pas code.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeIntegrite {
  /** Effort tranchant de la situation accidentelle (kN). */
  VEd?: number;
  /** Somme des sections de barres traversant les bords du poteau (mm2). */
  AsInt?: number;
  fyk?: number;
  /** Classe de ductilite : 'A', 'B' ou 'C'. */
  classe?: string;
  fck?: number;
  /** Nombre de barres sur appui traversant b_0,5 et ancrees. */
  nHog?: number;
  /** Diametre, espacement et enrobage des barres sur appui (mm). */
  phiHog?: number;
  sHog?: number;
  cHog?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeIntegrite>;

/** Coefficients partiels de la situation accidentelle (tableau 4.3). */
const GAMMA_S_ACC = 1.0;
const GAMMA_C_ACC = 1.15;

const R = {
  VEd: { champ: 'VEd', libelle: 'champ.VEd-accidentel' },
  AsInt: { champ: 'AsInt', libelle: 'champ.AsInt' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  classe: { champ: 'classe', libelle: 'champ.classe-ductilite' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  nHog: { champ: 'nHog', libelle: 'champ.nHog' },
  phiHog: { champ: 'phiHog', libelle: 'champ.phiHog' },
  sHog: { champ: 'sHog', libelle: 'champ.sHog' },
  cHog: { champ: 'cHog', libelle: 'champ.cHog' },
} as const satisfies Record<string, { champ: keyof EntreeIntegrite; libelle: Cle }>;

export function kInt(classe: string): number {
  return classe === 'C' ? 0.49 : 0.37;
}

export function integrite2023(e: Complete, appui: boolean): Calcul {
  positif(e.VEd, 'V_Ed', 'kN');
  positif(e.AsInt, 'A_s,int', 'mm2');
  positif(e.fyk, 'fyk', 'MPa');
  const fyd = e.fyk / GAMMA_S_ACC;
  const k = kInt(e.classe);
  const vInt = (e.AsInt * fyd * k) / 1000;
  const inter: Cellule['intermediaires'] = {
    'f_yd (accidentelle)': calculee(fyd, 'MPa'),
    k_int: recommandee(k, '-'),
    'V_Rd,int (12.10)': calculee(vInt, 'kN'),
  };
  let vHog = 0;
  if (appui) {
    positif(e.fck, 'fck', 'MPa');
    positif(e.phiHog, 'phi', 'mm');
    positif(e.sHog, 's', 'mm');
    positif(e.cHog, 'c', 'mm');
    if (!(Number.isInteger(e.nHog) && e.nHog >= 0)) throw new Error('n_hog doit etre un entier positif ou nul.');
    const bef = Math.min(e.sHog - e.phiHog, 6 * e.phiHog, 4 * e.cHog);
    vHog = (e.nHog * (Math.sqrt(e.fck) / GAMMA_C_ACC) * e.phiHog * Math.max(bef, 0)) / 1000;
    inter['b_ef,hog'] = calculee(bef, 'mm');
    inter['V_Rd,hog (12.12)'] = calculee(vHog, 'kN');
  }
  return {
    statut: { etat: 'calcule' },
    sollicitation: e.VEd,
    resistance: vInt + vHog,
    intermediaires: inter,
    clauses: appui ? ['12.5.2(1)', '(12.10)', '12.5.2(3)', '(12.12)'] : ['12.5.2(1)', '(12.10)'],
  };
}

/** Classes de ductilite B ou C exigees (12.5.2(1)). */
function conditions(e: EntreeIntegrite): Cle | null {
  return e.classe === 'A' ? 'motif.integrite-classe-a' : null;
}

const niveaux2004: DefinitionNiveau<EntreeIntegrite>[] = [
  {
    id: 'sans-equivalent',
    ordre: 1,
    position: 'corps',
    clause: '9.4.1(3)',
    hypothese: 'niveau.integ.2004',
    donneesRequises: [],
    conditions: () => 'motif.sans-equivalent-2004',
    calculer: () => {
      throw new Error('Niveau sans equivalent chiffre : jamais calcule.');
    },
  },
];

const niveaux2023: DefinitionNiveau<EntreeIntegrite>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '12.5.2(1)',
    hypothese: 'niveau.integ.2023.base',
    donneesRequises: [R.VEd, R.AsInt, R.fyk, R.classe],
    conditions,
    calculer: (e) => integrite2023(e as Complete, false),
  },
  {
    id: 'appui',
    ordre: 2,
    position: 'corps',
    clause: '12.5.2(3)',
    hypothese: 'niveau.integ.2023.appui',
    donneesRequises: [R.VEd, R.AsInt, R.fyk, R.classe, R.fck, R.nHog, R.phiHog, R.sHog, R.cHog],
    conditions,
    calculer: (e) => integrite2023(e as Complete, true),
  },
];

export const integrite: Mecanisme<EntreeIntegrite> = {
  id: 'integrite',
  version: '0.1.0',
  titre: 'meca.integ.titre',
  champs: [
    { type: 'nombre', id: 'VEd', libelle: 'champ.VEd-accidentel', symbole: 'V_Ed', unite: 'kN' },
    { type: 'nombre', id: 'AsInt', libelle: 'champ.AsInt', symbole: 'ΣA_s,int', unite: 'mm²' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
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
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'nHog', libelle: 'champ.nHog', symbole: 'n_hog', unite: '-', facultatif: true },
    { type: 'nombre', id: 'phiHog', libelle: 'champ.phiHog', symbole: 'φ', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'sHog', libelle: 'champ.sHog', symbole: 's', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'cHog', libelle: 'champ.cHog', symbole: 'c', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.effort-tranchant-accidentel', unite: 'kN' },
  resistance: { libelle: 'grandeur.resistance-integrite', unite: 'kN' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
