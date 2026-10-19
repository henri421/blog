/**
 * Pression dynamique de pointe du vent q_p(z), terrain plat (c_o = 1), sans
 * coefficient de direction, de saison ni d altitude.
 *
 * Unites : m/s, m, Pa.
 *
 * Commun : q_b = 0,5 rho v_b2, rho = 1,25 kg/m3 ; k_r = 0,19 (z_0/0,05)^0,07 ;
 *   c_r(z) = k_r ln(z/z_0) ; I(z) = 1/ln(z/z_0) ; z remplace par z_min en
 *   dessous de z_min ; z <= z_max = 200 m.
 * Premiere generation (EN 1991-1-4:2005, 4.3 a 4.5, (4.4), (4.5), (4.7),
 *   (4.8), (4.10), tableau 4.1, lus sur le texte le 2026-10-19 ; A1:2010 et
 *   AC:2010 non detenus) : q_p = [1 + 7 I_v] 0,5 rho v_m2, avec k_I = 1 et
 *   c_o = 1 ; le 7 vient d un facteur de pointe de 3,5 (4.5, NOTE 3).
 * Deuxieme generation (EN 1991-1-4:2026, 6.2(2), (6.6), (6.7), (6.10), (6.12),
 *   (6.13)) : q_p = c_r2 [1 + g_u I_u]2 q_b, g_u = 2,9 ; v_b0 multiplie par
 *   f_w,cc >= 1 (changement climatique).
 * Choix de l outil : k_r calcule par (6.7) et non lu, arrondi, dans le
 *   tableau 6.1 ; z_0 et z_min de la categorie de terrain saisis par
 *   l ingenieur (tableau 6.1 ; tableau 4.1 en 2005).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreePressionPointe {
  /** Vitesse de reference de base (m/s). */
  vb0?: number;
  /** Longueur de rugosite (m). */
  z0?: number;
  /** Hauteur minimale (m). */
  zmin?: number;
  /** Hauteur de reference (m). */
  z?: number;
  /** Facteur de changement climatique (2026), 1,0 par defaut. */
  fwcc?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePressionPointe>;

export const RHO_AIR = 1.25;
export const Z_MAX = 200;
export const G_U = 2.9;

const R = {
  vb0: { champ: 'vb0', libelle: 'champ.vb0' },
  z0: { champ: 'z0', libelle: 'champ.z0' },
  zmin: { champ: 'zmin', libelle: 'champ.zmin' },
  z: { champ: 'z', libelle: 'champ.z-vent' },
} as const satisfies Record<string, { champ: keyof EntreePressionPointe; libelle: Cle }>;

export function kr(z0: number): number {
  return 0.19 * (z0 / 0.05) ** 0.07;
}

interface Profil {
  ze: number;
  kr: number;
  cr: number;
  I: number;
  qb: number;
  qm: number;
}

function profil(e: Complete, vb: number): Profil {
  positif(vb, 'vb0', 'm/s');
  positif(e.z0, 'z0', 'm');
  positif(e.zmin, 'zmin', 'm');
  positif(e.z, 'z', 'm');
  const ze = Math.max(e.z, e.zmin);
  if (!(ze > e.z0)) throw new Error('z doit depasser z0.');
  const k = kr(e.z0);
  const ln = Math.log(ze / e.z0);
  const qb = 0.5 * RHO_AIR * vb * vb;
  const cr = k * ln;
  return { ze, kr: k, cr, I: 1 / ln, qb, qm: cr * cr * qb };
}

function inter(p: Profil): Cellule['intermediaires'] {
  return { k_r: calculee(p.kr, '-'), 'c_r(z)': calculee(p.cr, '-'), 'I(z)': calculee(p.I, '-'), q_b: calculee(p.qb, 'Pa'), 'q_m(z)': calculee(p.qm, 'Pa') };
}

export function qp2005(e: Complete): Calcul {
  const p = profil(e, e.vb0);
  const qp = (1 + 7 * p.I) * p.qm;
  return { statut: { etat: 'calcule' }, sollicitation: qp, intermediaires: { ...inter(p), '1 + 7 I_v': calculee(1 + 7 * p.I, '-'), 'q_p(z)': calculee(qp, 'Pa') }, clauses: ['4.5(1)', '(4.8)', '(4.7)', '(4.4)'] };
}

export function qp2026(e: Complete): Calcul {
  const f = e.fwcc ?? 1;
  if (!(f >= 1)) throw new Error('fwcc doit etre au moins egal a 1.');
  const p = profil(e, f * e.vb0);
  const facteur = (1 + G_U * p.I) ** 2;
  const qp = facteur * p.qm;
  return {
    statut: { etat: 'calcule' },
    sollicitation: qp,
    intermediaires: { 'f_w,cc': saisie(f, '-'), ...inter(p), g_u: recommandee(G_U, '-'), '(1 + g_u I_u)²': calculee(facteur, '-'), 'q_p(z)': calculee(qp, 'Pa') },
    clauses: ['6.5', '(6.12)', '(6.13)', '(6.10)', '(6.7)', '6.2(2)'],
  };
}

const requis = [R.vb0, R.z0, R.zmin, R.z];
const domaine = (e: EntreePressionPointe): Cle | null => (e.z !== undefined && e.z > Z_MAX ? 'motif.vent-z-max' : null);

function niveau(clause: string, hypothese: Cle, f: (e: Complete) => Calcul): DefinitionNiveau<EntreePressionPointe> {
  return { id: 'qp', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: domaine, calculer: (e) => f(e as Complete) };
}

export const pressionPointe: Mecanisme<EntreePressionPointe> = {
  id: 'pression-pointe',
  version: '0.1.0',
  titre: 'meca.qp.titre',
  generations: ['en1991-1-4-2005', 'en1991-1-4-2026'],
  champs: [
    { type: 'nombre', id: 'vb0', libelle: 'champ.vb0', symbole: 'v_b,0', unite: 'm/s' },
    { type: 'nombre', id: 'z0', libelle: 'champ.z0', symbole: 'z_0', unite: 'm' },
    { type: 'nombre', id: 'zmin', libelle: 'champ.zmin', symbole: 'z_min', unite: 'm' },
    { type: 'nombre', id: 'z', libelle: 'champ.z-vent', symbole: 'z', unite: 'm' },
    { type: 'nombre', id: 'fwcc', libelle: 'champ.fwcc', symbole: 'f_w,cc', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.qp', unite: 'Pa' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-4-2005': [niveau('4.5', 'niveau.qp.2005', qp2005)],
    'en1991-1-4-2026': [niveau('6.5', 'niveau.qp.2026', qp2026)],
  },
};
