/**
 * Enrobage nominal des armatures de beton arme.
 *
 * Unites : mm.
 *
 * Les enrobages minimaux de durabilite c_min,dur sont SAISIS, lus par
 * l ingenieur dans les tableaux de sa norme : tableau 4.4N (classe structurale
 * et classe d exposition) en premiere generation, tableaux 6.3 et 6.4 (classe
 * de resistance a l exposition, classe d exposition et duree d utilisation)
 * en deuxieme. L outil ne reproduit aucun de ces tableaux (CDC EE1) ; il
 * assemble l enrobage nominal a partir d eux.
 *
 * Premiere generation (4.4.1) :
 *   c_min = max(c_min,b ; c_min,dur ; 10 mm) (4.2), puis augmente de la couche
 *   d abrasion (4.4.1.2(13)),
 *   les ajustements Delta c_dur,gamma, Delta c_dur,st et Delta c_dur,add valant
 *   0 (valeurs recommandees) ; c_nom = c_min + Delta c_dev.
 * Deuxieme generation (6.5) :
 *   c_min = max(c_min,dur + Delta c ; c_min,b ; 10 mm) (6.2), majore de 5 mm
 *   pour une face verticale coulee contre le sol (6.5.2.1(2)) ;
 *   c_nom = c_min + Delta c_dev (6.1).
 * Dans les deux generations, c_min,b = phi, majore de 5 mm si le granulat
 * depasse 32 mm (tableau 6.5 ; 4.4.1.2(3) en 2004).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeEnrobage {
  /** Diametre de la barre, ou diametre equivalent du paquet (mm). */
  phi?: number;
  /** Dimension du plus gros granulat D_upper (mm). */
  Dupper?: number;
  /** c_min,dur lu dans le tableau 4.4N de l EN 1992-1-1:2004 (mm). */
  cminDur2004?: number;
  /** c_min,dur lu dans le tableau 6.3 ou 6.4 de l EN 1992-1-1:2023 (mm). */
  cminDur2023?: number;
  /** 'aucune', 'XM1', 'XM2' ou 'XM3'. */
  abrasion?: string;
  /** Duree d utilisation de projet au plus 30 ans : 'oui' ou 'non' (2023). */
  duree30?: string;
  /** Compacite amelioree ou cure de classe 3 : 'oui' ou 'non' (2023). */
  compacite?: string;
  /** Face verticale coulee au contact du sol : 'oui' ou 'non' (2023). */
  contactSol?: string;
  /** Tolerance d execution Delta c_dev (mm). */
  deltaCdev?: number;
  /** Enrobage nominal prevu aux plans (mm). */
  cnomPrevu?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeEnrobage>;

const COUCHE_ABRASION: Record<string, number> = { aucune: 0, XM1: 5, XM2: 10, XM3: 15 };
/** Reductions plafonnees a 5 mm, valeurs recommandees (6.5.2.2(2) et (3)). */
const REDUCTION_30_ANS = 5;
const REDUCTION_COMPACITE = 5;
/** Majoration pour une face verticale coulee contre le sol (6.5.2.1(2)). */
const MAJORATION_SOL = 5;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  Dupper: { champ: 'Dupper', libelle: 'champ.Dupper' },
  cminDur2004: { champ: 'cminDur2004', libelle: 'champ.cminDur2004' },
  cminDur2023: { champ: 'cminDur2023', libelle: 'champ.cminDur2023' },
  abrasion: { champ: 'abrasion', libelle: 'champ.abrasion' },
  duree30: { champ: 'duree30', libelle: 'champ.duree30' },
  compacite: { champ: 'compacite', libelle: 'champ.compacite' },
  contactSol: { champ: 'contactSol', libelle: 'champ.contactSol' },
  deltaCdev: { champ: 'deltaCdev', libelle: 'champ.deltaCdev' },
  cnomPrevu: { champ: 'cnomPrevu', libelle: 'champ.cnomPrevu' },
} as const satisfies Record<string, { champ: keyof EntreeEnrobage; libelle: Cle }>;

const communs = [R.phi, R.Dupper, R.abrasion, R.deltaCdev, R.cnomPrevu];

/** c_min,b = phi, + 5 mm si le granulat depasse 32 mm. */
function enrobageAdherence(e: Complete): number {
  return e.phi + (e.Dupper > 32 ? 5 : 0);
}

function verifier(e: Complete): void {
  positif(e.phi, 'phi', 'mm');
  positif(e.Dupper, 'D_upper', 'mm');
  positif(e.cnomPrevu, 'c_nom prevu', 'mm');
  if (!(Number.isFinite(e.deltaCdev) && e.deltaCdev >= 0)) {
    throw new Error('Delta c_dev doit etre un nombre positif ou nul (mm).');
  }
}

export function enrobage2004(e: Complete): Calcul {
  verifier(e);
  positif(e.cminDur2004, 'c_min,dur 2004', 'mm');
  const cminb = enrobageAdherence(e);
  const abr = COUCHE_ABRASION[e.abrasion] ?? 0;
  const cmin = Math.max(cminb, e.cminDur2004, 10) + abr;
  const cnom = cmin + e.deltaCdev;
  return {
    statut: { etat: 'calcule' },
    sollicitation: cnom,
    resistance: e.cnomPrevu,
    intermediaires: {
      'c_min,dur': saisie(e.cminDur2004, 'mm'),
      'Δc_dur,γ − Δc_dur,st − Δc_dur,add': recommandee(0, 'mm'),
      'couche d’abrasion': calculee(abr, 'mm'),
      'c_min,b': calculee(cminb, 'mm'),
      c_min: calculee(cmin, 'mm'),
      'Δc_dev': saisie(e.deltaCdev, 'mm'),
      c_nom: calculee(cnom, 'mm'),
    },
    clauses: ['4.4.1.1', '4.4.1.2', '4.4.1.3'],
  };
}

export function enrobage2023(e: Complete): Calcul {
  verifier(e);
  positif(e.cminDur2023, 'c_min,dur 2023', 'mm');
  const cminb = enrobageAdherence(e);
  const abr = COUCHE_ABRASION[e.abrasion] ?? 0;
  const red30 = e.duree30 === 'oui' ? REDUCTION_30_ANS : 0;
  const redExc = e.compacite === 'oui' ? REDUCTION_COMPACITE : 0;
  const deltaC = abr - red30 - redExc;
  const sol = e.contactSol === 'oui' ? MAJORATION_SOL : 0;
  const cmin = Math.max(e.cminDur2023 + deltaC, cminb, 10) + sol;
  const cnom = cmin + e.deltaCdev;
  return {
    statut: { etat: 'calcule' },
    sollicitation: cnom,
    resistance: e.cnomPrevu,
    intermediaires: {
      'c_min,dur': saisie(e.cminDur2023, 'mm'),
      'Δc_min,30': recommandee(-red30, 'mm'),
      'Δc_min,exc': recommandee(-redExc, 'mm'),
      'Δc_dur,abr': recommandee(abr, 'mm'),
      'c_min,b': calculee(cminb, 'mm'),
      'Δc_min (sol)': recommandee(sol, 'mm'),
      c_min: calculee(cmin, 'mm'),
      'Δc_dev': saisie(e.deltaCdev, 'mm'),
      c_nom: calculee(cnom, 'mm'),
    },
    clauses: ['6.5.1', '(6.1)', '6.5.2', '(6.2)', '6.5.3'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeEnrobage>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '4.4.1',
    hypothese: 'niveau.enr.2004.base',
    donneesRequises: [...communs, R.cminDur2004],
    conditions: () => null,
    calculer: (e) => enrobage2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeEnrobage>[] = [
  {
    id: 'base',
    ordre: 1,
    clause: '6.5',
    hypothese: 'niveau.enr.2023.base',
    donneesRequises: [...communs, R.cminDur2023, R.duree30, R.compacite, R.contactSol],
    conditions: () => null,
    calculer: (e) => enrobage2023(e as Complete),
  },
];

const ouiNon = [
  { valeur: 'non', libelle: 'option.non' },
  { valeur: 'oui', libelle: 'option.oui' },
] as const;

export const enrobage: Mecanisme<EntreeEnrobage> = {
  id: 'enrobage',
  version: '0.1.0',
  titre: 'meca.enr.titre',
  champs: [
    { type: 'nombre', id: 'cminDur2004', libelle: 'champ.cminDur2004', symbole: 'c_min,dur 2004', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'cminDur2023', libelle: 'champ.cminDur2023', symbole: 'c_min,dur 2023', unite: 'mm', facultatif: true },
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'Dupper', libelle: 'champ.Dupper', symbole: 'D_upper', unite: 'mm' },
    {
      type: 'choix',
      id: 'abrasion',
      libelle: 'champ.abrasion',
      options: [
        { valeur: 'aucune', libelle: 'option.abrasion.aucune' },
        { valeur: 'XM1', libelle: 'option.abrasion.XM1' },
        { valeur: 'XM2', libelle: 'option.abrasion.XM2' },
        { valeur: 'XM3', libelle: 'option.abrasion.XM3' },
      ],
    },
    { type: 'choix', id: 'duree30', libelle: 'champ.duree30', options: [...ouiNon] },
    { type: 'choix', id: 'compacite', libelle: 'champ.compacite', options: [...ouiNon] },
    { type: 'choix', id: 'contactSol', libelle: 'champ.contactSol', options: [...ouiNon] },
    { type: 'nombre', id: 'deltaCdev', libelle: 'champ.deltaCdev', symbole: 'Δc_dev', unite: 'mm' },
    { type: 'nombre', id: 'cnomPrevu', libelle: 'champ.cnomPrevu', symbole: 'c_nom,prévu', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.enrobage-requis', unite: 'mm' },
  resistance: { libelle: 'grandeur.enrobage-prevu', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
