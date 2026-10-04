/**
 * Longueur d ancrage droit ou de recouvrement d une barre tendue, sans
 * armature transversale prise en compte ni pression transversale.
 *
 * Unites : mm, MPa.
 *
 * Premiere generation : 8.4 et 8.7, l_b,rqd = phi/4 sigma_sd / f_bd, seuls
 * alpha_2 (enrobage) et alpha_6 (recouvrement, 100 % des barres dans la meme
 * section) sont retenus ; alpha_1, alpha_3, alpha_4 et alpha_5 valent 1, ce
 * qui va dans le sens de la securite.
 * Deuxieme generation : 11.4.2 et 11.5.2, expression directe de l_bd.
 *
 * Deux niveaux dans chaque generation : barre plastifiee (sigma_sd = f_yd) et
 * contrainte de calcul reelle.
 *
 * Domaine de l outil : fck <= 90 MPa. La premiere generation plafonne la
 * resistance en traction a celle d un C60/75 (8.4.2(2)) ; la deuxieme borne le
 * rapport 25/fck a 0,3 au moins (11.4.2(3)).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_S_2004, GAMMA_S_2023, fctm2004, positif } from '../../materiaux';

export interface EntreeAncrage {
  phi?: number;
  fck?: number;
  fyk?: number;
  /** Contrainte de calcul dans la barre a ancrer (MPa). */
  sigmaSd?: number;
  /** 'bonne' ou 'mediocre'. */
  adherence?: string;
  /** Distance libre entre barres (mm). */
  cs?: number;
  /** Enrobage lateral (mm). */
  cx?: number;
  /** Enrobage inferieur ou superieur (mm). */
  cy?: number;
  /** 'ancrage' ou 'recouvrement'. */
  type?: string;
  /** Longueur disponible (mm). */
  lDispo?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeAncrage>;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  sigmaSd: { champ: 'sigmaSd', libelle: 'champ.sigmaSd' },
  adherence: { champ: 'adherence', libelle: 'champ.adherence' },
  cs: { champ: 'cs', libelle: 'champ.cs' },
  cx: { champ: 'cx', libelle: 'champ.cx' },
  cy: { champ: 'cy', libelle: 'champ.cy' },
  type: { champ: 'type', libelle: 'champ.type-ancrage' },
  lDispo: { champ: 'lDispo', libelle: 'champ.lDispo' },
} as const satisfies Record<string, { champ: keyof EntreeAncrage; libelle: Cle }>;

const communs = [R.phi, R.fck, R.fyk, R.adherence, R.cs, R.cx, R.cy, R.type, R.lDispo];

function domaine(e: EntreeAncrage): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

/** Le niveau a contrainte reelle n a de sens que si sigma_sd ne depasse pas f_yd. */
function contrainteAdmise(gammaS: number) {
  return (e: EntreeAncrage): Cle | null =>
    (e.sigmaSd as number) > (e.fyk as number) / gammaS ? 'motif.sigma-sup-fyd' : null;
}

function verifier(e: Complete): void {
  positif(e.phi, 'phi', 'mm');
  positif(e.fyk, 'fyk', 'MPa');
  positif(e.cs, 'cs', 'mm');
  positif(e.cx, 'cx', 'mm');
  positif(e.cy, 'cy', 'mm');
  positif(e.lDispo, 'lDispo', 'mm');
}

const recouvrement = (e: Complete): boolean => e.type === 'recouvrement';

// ---------------------------------------------------------------------------
// Premiere generation
// ---------------------------------------------------------------------------

/**
 * f_bd = 2,25 eta_1 eta_2 f_ctd (8.4.2), f_ctd = 0,7 f_ctm / gamma_c avec
 * f_ctm plafonne a celle du C60/75 ; l_b,rqd = phi/4 sigma_sd / f_bd (8.3) ;
 * alpha_2 = 1 - 0,15 (c_d - phi)/phi borne a [0,7 ; 1] (tableau 8.2, barre
 * droite) ; l_bd >= l_b,min (8.6), l_0 >= l_0,min (8.11) avec alpha_6 = 1,5.
 */
function ancrage2004(e: Complete, sigmaSd: number): Calcul {
  verifier(e);
  positif(sigmaSd, 'sigma_sd', 'MPa');
  const fctd = (0.7 * fctm2004(Math.min(e.fck, 60))) / GAMMA_C_2004;
  const eta1 = e.adherence === 'mediocre' ? 0.7 : 1;
  const eta2 = e.phi <= 32 ? 1 : (132 - e.phi) / 100;
  const fbd = 2.25 * eta1 * eta2 * fctd;
  const lbrqd = ((e.phi / 4) * sigmaSd) / fbd;
  const cd = Math.min(e.cs / 2, e.cx, e.cy);
  const alpha2 = Math.min(Math.max(1 - (0.15 * (cd - e.phi)) / e.phi, 0.7), 1);
  const inter: Cellule['intermediaires'] = {
    'σ_sd': calculee(sigmaSd, 'MPa'),
    f_ctd: calculee(fctd, 'MPa'),
    'η_1': recommandee(eta1, '-'),
    'η_2': calculee(eta2, '-'),
    f_bd: calculee(fbd, 'MPa'),
    'l_b,rqd': calculee(lbrqd, 'mm'),
    c_d: calculee(cd, 'mm'),
    'α_2': calculee(alpha2, '-'),
  };
  let longueur: number;
  if (recouvrement(e)) {
    const alpha6 = 1.5;
    const lmin = Math.max(0.3 * alpha6 * lbrqd, 15 * e.phi, 200);
    longueur = Math.max(alpha2 * alpha6 * lbrqd, lmin);
    inter['α_6'] = recommandee(alpha6, '-');
    inter['l_0,min'] = calculee(lmin, 'mm');
    inter.l_0 = calculee(longueur, 'mm');
  } else {
    const lmin = Math.max(0.3 * lbrqd, 10 * e.phi, 100);
    longueur = Math.max(alpha2 * lbrqd, lmin);
    inter['l_b,min'] = calculee(lmin, 'mm');
    inter.l_bd = calculee(longueur, 'mm');
  }
  return {
    statut: { etat: 'calcule' },
    sollicitation: longueur,
    resistance: e.lDispo,
    intermediaires: inter,
    clauses: recouvrement(e) ? ['8.4.2', '8.4.3', '8.7.3', '(8.10)'] : ['8.4.2', '8.4.3', '8.4.4', '(8.4)'],
  };
}

export const ancrage2004Plastifie = (e: Complete): Calcul => ancrage2004(e, e.fyk / GAMMA_S_2004);
export const ancrage2004Reel = (e: Complete): Calcul => ancrage2004(e, e.sigmaSd);

// ---------------------------------------------------------------------------
// Deuxieme generation
// ---------------------------------------------------------------------------

/** Coefficient de longueur de recouvrement k_ls (11.5.2, valeur recommandee). */
export const KLS_2023 = 1.2;

/**
 * l_bd = 50 k_cp phi (sigma_sd/435)^(3/2) (25/fck)^(1/2) (phi/20)^(1/3) (1,5 phi / c_d)^(1/2) >= 10 phi
 * (11.4.2, (11.3)), k_cp = 1,0 en bonne adherence et 1,2 sinon,
 * c_d = min(c_s/2 ; c_x ; c_y) <= 3,75 phi, phi/20 >= 0,6, 25/fck >= 0,3 ;
 * l_sd = k_ls l_bd >= 15 phi (11.5.2).
 */
function ancrage2023(e: Complete, sigmaSd: number): Calcul {
  verifier(e);
  positif(sigmaSd, 'sigma_sd', 'MPa');
  const kcp = e.adherence === 'mediocre' ? 1.2 : 1;
  const cd = Math.min(e.cs / 2, e.cx, e.cy, 3.75 * e.phi);
  const brut =
    50 *
    kcp *
    e.phi *
    (sigmaSd / 435) ** 1.5 *
    Math.sqrt(Math.max(25 / e.fck, 0.3)) *
    Math.max(e.phi / 20, 0.6) ** (1 / 3) *
    Math.sqrt((1.5 * e.phi) / cd);
  const lbd = Math.max(brut, 10 * e.phi);
  const inter: Cellule['intermediaires'] = {
    'σ_sd': calculee(sigmaSd, 'MPa'),
    k_cp: recommandee(kcp, '-'),
    c_d: calculee(cd, 'mm'),
    l_bd: calculee(lbd, 'mm'),
  };
  let longueur = lbd;
  if (recouvrement(e)) {
    longueur = Math.max(KLS_2023 * lbd, 15 * e.phi);
    inter.k_ls = recommandee(KLS_2023, '-');
    inter.l_sd = calculee(longueur, 'mm');
  }
  return {
    statut: { etat: 'calcule' },
    sollicitation: longueur,
    resistance: e.lDispo,
    intermediaires: inter,
    clauses: recouvrement(e) ? ['11.4.2', '(11.3)', '11.5.2'] : ['11.4.2', '(11.3)'],
  };
}

export const ancrage2023Plastifie = (e: Complete): Calcul => ancrage2023(e, e.fyk / GAMMA_S_2023);
export const ancrage2023Reel = (e: Complete): Calcul => ancrage2023(e, e.sigmaSd);

function niveaux(gen: '2004' | '2023'): DefinitionNiveau<EntreeAncrage>[] {
  const gammaS = gen === '2004' ? GAMMA_S_2004 : GAMMA_S_2023;
  const clause = gen === '2004' ? '8.4.3' : '11.4.2';
  return [
    {
      id: 'barre-plastifiee',
      ordre: 1,
      clause,
      hypothese: gen === '2004' ? 'niveau.anc.2004.barre-plastifiee' : 'niveau.anc.2023.barre-plastifiee',
      donneesRequises: communs,
      domaine,
      conditions: () => null,
      calculer: (e) => (gen === '2004' ? ancrage2004Plastifie : ancrage2023Plastifie)(e as Complete),
    },
    {
      id: 'contrainte-reelle',
      ordre: 2,
      clause,
      hypothese: gen === '2004' ? 'niveau.anc.2004.contrainte-reelle' : 'niveau.anc.2023.contrainte-reelle',
      donneesRequises: [...communs, R.sigmaSd],
      domaine,
      conditions: contrainteAdmise(gammaS),
      calculer: (e) => (gen === '2004' ? ancrage2004Reel : ancrage2023Reel)(e as Complete),
    },
  ];
}

export const ancrage: Mecanisme<EntreeAncrage> = {
  id: 'ancrage',
  version: '0.1.0',
  titre: 'meca.anc.titre',
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-ancrage',
      options: [
        { valeur: 'ancrage', libelle: 'option.type.ancrage' },
        { valeur: 'recouvrement', libelle: 'option.type.recouvrement' },
      ],
    },
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
    { type: 'nombre', id: 'cy', libelle: 'champ.cy', symbole: 'c_y', unite: 'mm' },
    { type: 'nombre', id: 'lDispo', libelle: 'champ.lDispo', symbole: 'l_dispo', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.longueur-requise', unite: 'mm' },
  resistance: { libelle: 'grandeur.longueur-disponible', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux('2004'), 'ec2-2023': niveaux('2023') },
};
