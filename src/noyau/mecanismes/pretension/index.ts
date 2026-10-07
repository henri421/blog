/**
 * Transmission et ancrage de la precontrainte par pre-tension.
 *
 * Unites : mm, MPa.
 *
 * Premiere generation (8.10.2) :
 *   f_bpt = eta_p1 eta_1 f_ctd(t) (8.15), f_ctd(t) = 0,7 f_ctm(t)/gamma_c
 *   (alpha_ct = 1), f_ctm(t) = beta_cc(t) f_ctm (3.1.2(9), alpha = 1 avant
 *   28 jours), beta_cc(t) = f_cm(t)/f_cm ;
 *   l_pt = alpha_1 alpha_2 phi sigma_pm0 / f_bpt (8.16) ;
 *   eta_p1 = 2,7 fils cranteS, 3,2 torons ; alpha_2 = 0,25 fils, 0,19 torons ;
 *   ancrage : f_bpd = eta_p2 eta_1 f_ctd (8.20), eta_p2 = 1,4 fils cranteS,
 *   1,2 torons, f_ctk,0.05 plafonnee au C60/75 ;
 *   l_bpd = l_pt2 + alpha_2 phi (sigma_pd - sigma_pm,inf)/f_bpd (8.21).
 * Deuxieme generation (13.5.3, 13.5.4) :
 *   l_pt = (gamma_C/1,5) alpha_1 alpha_2 sigma_pm0 phi_p / (eta_1 racine(f_ck(t)))
 *   (13.4), alpha_2 = 0,40 fils cranteS, 0,26 torons ;
 *   l_bpd = l_pt2 + (gamma_C/1,5) 2 alpha_2 alpha_3 (sigma_pd - sigma_pm,inf)
 *   phi_p / (eta_1 racine(f_ck)) (13.9), alpha_3 = 1,5 sous fatigue, 1,0 sinon.
 * Dans les deux generations : alpha_1 = 1,0 (relachement progressif) ou 1,25
 *   (brutal) ; eta_1 = 1,0 en bonne adherence, 0,7 sinon ; l_pt1 = 0,8 l_pt,
 *   l_pt2 = 1,2 l_pt ; l_disp = racine(l_pt^2 + d^2).
 * Choix de l outil : f_ck(t) au relachement est saisie (13.5.3(1) permet de
 *   l estimer par (13.5)) ; elle fixe aussi beta_cc(t) en 2004.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_C_2023, fctm2004, positif } from '../../materiaux';

export interface EntreePretension {
  /** 'toron' (3 ou 7 fils) ou 'fil' (fil crante). */
  armature?: string;
  phiP?: number;
  /** Contrainte juste apres relachement (MPa). */
  sigmaPm0?: number;
  /** 'progressif' ou 'brutal'. */
  relachement?: string;
  adherence?: string;
  fck?: number;
  /** Resistance caracteristique au moment du relachement (MPa). */
  fckt?: number;
  /** Hauteur de la section (mm), pour la longueur de regularisation. */
  d?: number;
  /** Contrainte a ancrer a l ELU et contrainte apres toutes les pertes (MPa). */
  sigmaPd?: number;
  sigmaPmInf?: number;
  /** Verification a la fatigue exigee : 'oui' ou 'non' (2023). */
  fatigue?: string;
  /** Longueur disponible depuis l about (mm). */
  lDispo?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePretension>;
type Generation = '2004' | '2023';

const R = {
  armature: { champ: 'armature', libelle: 'champ.armature-pretension' },
  phiP: { champ: 'phiP', libelle: 'champ.phiP' },
  sigmaPm0: { champ: 'sigmaPm0', libelle: 'champ.sigmaPm0' },
  relachement: { champ: 'relachement', libelle: 'champ.relachement' },
  adherence: { champ: 'adherence', libelle: 'champ.adherence' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fckt: { champ: 'fckt', libelle: 'champ.fckt-relachement' },
  d: { champ: 'd', libelle: 'champ.h-regularisation' },
  sigmaPd: { champ: 'sigmaPd', libelle: 'champ.sigmaPd' },
  sigmaPmInf: { champ: 'sigmaPmInf', libelle: 'champ.sigmaPmInf' },
  fatigue: { champ: 'fatigue', libelle: 'champ.fatigue-exigee' },
  lDispo: { champ: 'lDispo', libelle: 'champ.lDispo-about' },
} as const satisfies Record<string, { champ: keyof EntreePretension; libelle: Cle }>;

const requisTransmission = [R.armature, R.phiP, R.sigmaPm0, R.relachement, R.adherence, R.fck, R.fckt, R.d];

function domaine(e: EntreePretension): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

function conditionsResistance(e: EntreePretension): Cle | null {
  return (e.fckt as number) > (e.fck as number) ? 'motif.fckt-sup-fck' : null;
}

interface Transmission {
  lpt: number;
  inter: Cellule['intermediaires'];
  alpha2: number;
  eta1: number;
}

function transmission(gen: Generation, e: Complete): Transmission {
  positif(e.phiP, 'phi_p', 'mm');
  positif(e.sigmaPm0, 'sigma_pm0', 'MPa');
  positif(e.fckt, 'f_ck(t)', 'MPa');
  positif(e.d, 'd', 'mm');
  const toron = e.armature === 'toron';
  const alpha1 = e.relachement === 'brutal' ? 1.25 : 1;
  const eta1 = e.adherence === 'mediocre' ? 0.7 : 1;
  if (gen === '2004') {
    const alpha2 = toron ? 0.19 : 0.25;
    const etaP1 = toron ? 3.2 : 2.7;
    const beta = (e.fckt + 8) / (e.fck + 8);
    const fctdt = (0.7 * beta * fctm2004(e.fck)) / GAMMA_C_2004;
    const fbpt = etaP1 * eta1 * fctdt;
    const lpt = (alpha1 * alpha2 * e.phiP * e.sigmaPm0) / fbpt;
    return {
      lpt,
      alpha2,
      eta1,
      inter: {
        'α_1': recommandee(alpha1, '-'),
        'α_2': recommandee(alpha2, '-'),
        'η_p1': recommandee(etaP1, '-'),
        'β_cc(t)': calculee(beta, '-'),
        'f_ctd(t)': calculee(fctdt, 'MPa'),
        f_bpt: calculee(fbpt, 'MPa'),
      },
    };
  }
  const alpha2 = toron ? 0.26 : 0.4;
  const lpt = ((GAMMA_C_2023 / 1.5) * alpha1 * alpha2 * e.sigmaPm0 * e.phiP) / (eta1 * Math.sqrt(e.fckt));
  return {
    lpt,
    alpha2,
    eta1,
    inter: { 'α_1': recommandee(alpha1, '-'), 'α_2': recommandee(alpha2, '-'), 'η_1': recommandee(eta1, '-') },
  };
}

export function transmissionCellule(gen: Generation, e: Complete): Calcul {
  const { lpt, inter } = transmission(gen, e);
  return {
    statut: { etat: 'calcule' },
    sollicitation: 1.2 * lpt,
    intermediaires: {
      ...inter,
      l_pt: calculee(lpt, 'mm'),
      l_pt1: calculee(0.8 * lpt, 'mm'),
      l_pt2: calculee(1.2 * lpt, 'mm'),
      l_disp: calculee(Math.sqrt(lpt ** 2 + e.d ** 2), 'mm'),
    },
    clauses: gen === '2004' ? ['8.10.2.2', '(8.15) à (8.19)'] : ['13.5.3', '(13.4)', '(13.6) à (13.8)'],
  };
}

export function ancrageCellule(gen: Generation, e: Complete): Calcul {
  positif(e.lDispo, 'l_dispo', 'mm');
  if (!(e.sigmaPd >= e.sigmaPmInf && e.sigmaPmInf > 0)) throw new Error('Il faut 0 < sigma_pm,inf <= sigma_pd (MPa).');
  const { lpt, alpha2, eta1, inter } = transmission(gen, e);
  const lpt2 = 1.2 * lpt;
  const ecart = e.sigmaPd - e.sigmaPmInf;
  let complement: number;
  const sup: Cellule['intermediaires'] = {};
  if (gen === '2004') {
    const etaP2 = e.armature === 'toron' ? 1.2 : 1.4;
    const fctd = (0.7 * fctm2004(Math.min(e.fck, 60))) / GAMMA_C_2004;
    const fbpd = etaP2 * eta1 * fctd;
    complement = (alpha2 * e.phiP * ecart) / fbpd;
    sup['η_p2'] = recommandee(etaP2, '-');
    sup.f_bpd = calculee(fbpd, 'MPa');
  } else {
    const alpha3 = e.fatigue === 'oui' ? 1.5 : 1;
    complement = ((GAMMA_C_2023 / 1.5) * 2 * alpha2 * alpha3 * ecart * e.phiP) / (eta1 * Math.sqrt(e.fck));
    sup['α_3'] = recommandee(alpha3, '-');
  }
  const lbpd = lpt2 + complement;
  return {
    statut: { etat: 'calcule' },
    sollicitation: lbpd,
    resistance: e.lDispo,
    intermediaires: { ...inter, ...sup, l_pt2: calculee(lpt2, 'mm'), 'longueur complémentaire': calculee(complement, 'mm'), l_bpd: calculee(lbpd, 'mm') },
    clauses: gen === '2004' ? ['8.10.2.3', '(8.20)', '(8.21)'] : ['13.5.4', '(13.9)'],
  };
}

function niveaux(gen: Generation): DefinitionNiveau<EntreePretension>[] {
  const clause = gen === '2004' ? '8.10.2' : '13.5';
  return [
    {
      id: 'transmission',
      ordre: 1,
      position: 'corps',
      clause,
      hypothese: gen === '2004' ? 'niveau.pt.2004.transmission' : 'niveau.pt.2023.transmission',
      donneesRequises: requisTransmission,
      domaine,
      conditions: conditionsResistance,
      calculer: (e) => transmissionCellule(gen, e as Complete),
    },
    {
      id: 'ancrage',
      ordre: 2,
      position: 'corps',
      clause,
      hypothese: gen === '2004' ? 'niveau.pt.2004.ancrage' : 'niveau.pt.2023.ancrage',
      donneesRequises: gen === '2004' ? [...requisTransmission, R.sigmaPd, R.sigmaPmInf, R.lDispo] : [...requisTransmission, R.sigmaPd, R.sigmaPmInf, R.fatigue, R.lDispo],
      domaine,
      conditions: conditionsResistance,
      calculer: (e) => ancrageCellule(gen, e as Complete),
    },
  ];
}

const ouiNon = [
  { valeur: 'non', libelle: 'option.non' },
  { valeur: 'oui', libelle: 'option.oui' },
] as const;

export const pretension: Mecanisme<EntreePretension> = {
  id: 'pretension',
  version: '0.1.0',
  titre: 'meca.pt.titre',
  champs: [
    {
      type: 'choix',
      id: 'armature',
      libelle: 'champ.armature-pretension',
      options: [
        { valeur: 'toron', libelle: 'option.pt.toron' },
        { valeur: 'fil', libelle: 'option.pt.fil' },
      ],
    },
    { type: 'nombre', id: 'phiP', libelle: 'champ.phiP', symbole: 'φ_p', unite: 'mm' },
    { type: 'nombre', id: 'sigmaPm0', libelle: 'champ.sigmaPm0', symbole: 'σ_pm0', unite: 'MPa' },
    {
      type: 'choix',
      id: 'relachement',
      libelle: 'champ.relachement',
      options: [
        { valeur: 'progressif', libelle: 'option.pt.progressif' },
        { valeur: 'brutal', libelle: 'option.pt.brutal' },
      ],
    },
    {
      type: 'choix',
      id: 'adherence',
      libelle: 'champ.adherence',
      options: [
        { valeur: 'bonne', libelle: 'option.adherence.bonne' },
        { valeur: 'mediocre', libelle: 'option.adherence.mediocre' },
      ],
    },
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fckt', libelle: 'champ.fckt-relachement', symbole: 'f_ck(t)', unite: 'MPa' },
    { type: 'nombre', id: 'd', libelle: 'champ.h-regularisation', symbole: 'h', unite: 'mm' },
    { type: 'nombre', id: 'sigmaPd', libelle: 'champ.sigmaPd', symbole: 'σ_pd', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'sigmaPmInf', libelle: 'champ.sigmaPmInf', symbole: 'σ_pm∞', unite: 'MPa', facultatif: true },
    { type: 'choix', id: 'fatigue', libelle: 'champ.fatigue-exigee', options: [...ouiNon] },
    { type: 'nombre', id: 'lDispo', libelle: 'champ.lDispo-about', symbole: 'l_dispo', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.longueur-pretension', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-disponible', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux('2004'), 'ec2-2023': niveaux('2023') },
};
