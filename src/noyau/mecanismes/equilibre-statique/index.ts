/**
 * Equilibre statique d une poutre sur deux appuis prolongee par une console :
 * soulevement de l appui arriere A sous le poids propre (source unique) et une
 * charge variable sur la console.
 *
 * Unites : m, kN/m, kN.m (moments autour de l appui B, au droit de la console).
 *
 * Modele : travee L entre A et B, console a au-dela de B ; poids propre g sur
 *   toute la longueur (partie stabilisatrice g L2/2, destabilisatrice g a2/2) ;
 *   charge variable q sur la console seule (destabilisatrice q a2/2). Verifie :
 *   M_dst,d <= M_stb,d ; sinon A doit etre ancre, d un effort
 *   (M_dst,d - M_stb,d)/L.
 * Premiere generation (EN 1990:2002, tableau A1.2(A), NOTES 1 et 2, valeurs
 *   recommandees, lu sur le texte le 2026-10-19) :
 *   EQU : gamma_G,sup = 1,10, gamma_G,inf = 0,90, gamma_Q = 1,5 ;
 *   NOTE 2 : 1,35 / 1,15 / 1,5 en verification combinee avec la resistance,
 *   si 1,00 sur les deux parties n est pas plus defavorable.
 * Niveau AN-LU (AN-LU:2020, A1.3.1(1), lu sur le texte le 2026-10-19) : le
 *   tableau A1.2(A) s applique a l EQU avec ses valeurs recommandees ; la
 *   NOTE 2 (verification combinee) n est pas applicable au Luxembourg.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 8.3.3.1(5), (8.8), tableau A.1.8,
 *   VC2) : VC2(a) gamma_G = 1,35 k_F, gamma_G,stb = 1,15, gamma_Q = 1,5 k_F ;
 *   VC2(b) gamma_G = gamma_G,stb = 1,0, gamma_Q = 1,5 k_F ; le moins favorable.
 * Choix de l outil : gamma_G,stb = 1,15 quelle que soit la classe, comme dans le
 *   tableau A.1.8 (note e : 1,35 rho) ; la formule (8.8) appliquee a 1,35 k_F
 *   donnerait 1,15 k_F (ecart signale dans l article).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';
import { kF } from '../combinaison-elu/index';

export interface EntreeEquilibreStatique {
  /** Portee entre les appuis A et B (m). */
  L?: number;
  /** Longueur de la console au-dela de B (m). */
  a?: number;
  /** Poids propre lineique, source unique (kN/m). */
  g?: number;
  /** Charge variable sur la console (kN/m). */
  q?: number;
  /** Classe de consequences (2023). */
  cc?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeEquilibreStatique>;

export const RHO = 0.85;
export const GAMMA_G_STB = 1.15;

const R = {
  L: { champ: 'L', libelle: 'champ.L-travee' },
  a: { champ: 'a', libelle: 'champ.a-console' },
  g: { champ: 'g', libelle: 'champ.g-poids-propre' },
  q: { champ: 'q', libelle: 'champ.q-console' },
  cc: { champ: 'cc', libelle: 'champ.classe-consequences' },
} as const satisfies Record<string, { champ: keyof EntreeEquilibreStatique; libelle: Cle }>;

function verifier(e: Complete): void {
  positif(e.L, 'L', 'm');
  positif(e.a, 'a', 'm');
  positif(e.g, 'g', 'kN/m');
  if (!(e.q >= 0)) throw new Error('q doit etre positif ou nul.');
}

export interface Facteurs {
  dst: number;
  stb: number;
  Q: number;
}

export function moments(e: Complete, f: Facteurs): { dst: number; stb: number } {
  return { dst: f.dst * e.g * e.a ** 2 / 2 + f.Q * e.q * e.a ** 2 / 2, stb: f.stb * e.g * e.L ** 2 / 2 };
}

function cellule(e: Complete, m: { dst: number; stb: number }, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  return {
    statut: { etat: 'calcule' },
    sollicitation: m.dst,
    resistance: m.stb,
    intermediaires: { ...inter, M_dst: calculee(m.dst, 'kN·m'), M_stb: calculee(m.stb, 'kN·m'), F_ancrage: calculee(Math.max(0, (m.dst - m.stb) / e.L), 'kN') },
    clauses,
  };
}

function facteurs(gs: number, gi: number, gq: number): Cellule['intermediaires'] {
  return { 'γ_G,dst': recommandee(gs, '-'), 'γ_G,stb': recommandee(gi, '-'), 'γ_Q': recommandee(gq, '-') };
}

export function equ2002(e: Complete): Calcul {
  verifier(e);
  const f = { dst: 1.1, stb: 0.9, Q: 1.5 };
  return cellule(e, moments(e, f), facteurs(f.dst, f.stb, f.Q), ['tableau A1.2(A)']);
}

export function equLu(e: Complete): Calcul {
  const c = equ2002(e);
  return { ...c, clauses: ['AN-LU A1.3.1(1)', 'tableau A1.2(A)'], statut: { etat: 'reserve', motif: 'reserve.an-lu-en1990' } };
}

/** Le moins favorable de deux jeux : plus grand rapport M_dst / M_stb. */
function pire(e: Complete, fa: Facteurs, fb: Facteurs): { m: { dst: number; stb: number }; a: { dst: number; stb: number }; b: { dst: number; stb: number } } {
  const a = moments(e, fa);
  const b = moments(e, fb);
  return { m: a.dst / a.stb >= b.dst / b.stb ? a : b, a, b };
}

export function equStr2002(e: Complete): Calcul {
  verifier(e);
  const r = pire(e, { dst: 1.35, stb: 1.15, Q: 1.5 }, { dst: 1, stb: 1, Q: 1.5 });
  return cellule(e, r.m, { 'M_dst / M_stb (1,35 ; 1,15)': calculee(r.a.dst / r.a.stb, '-'), 'M_dst / M_stb (1,00 ; 1,00)': calculee(r.b.dst / r.b.stb, '-') }, ['tableau A1.2(A)', 'NOTE 2']);
}

export function vc2(e: Complete): Calcul {
  verifier(e);
  const k = kF(e.cc);
  const r = pire(e, { dst: 1.35 * k, stb: GAMMA_G_STB, Q: 1.5 * k }, { dst: 1, stb: 1, Q: 1.5 * k });
  return cellule(
    e,
    r.m,
    {
      k_F: recommandee(k, '-'),
      'ρ': recommandee(RHO, '-'),
      'γ_G,stb': recommandee(GAMMA_G_STB, '-'),
      'M_dst / M_stb VC2(a)': calculee(r.a.dst / r.a.stb, '-'),
      'M_dst / M_stb VC2(b)': calculee(r.b.dst / r.b.stb, '-'),
    },
    ['8.3.3.1(5)', '(8.8)', 'tableau A.1.8', 'tableau A.1.9'],
  );
}

const communs = [R.L, R.a, R.g, R.q];

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, requis: DefinitionNiveau<EntreeEquilibreStatique>['donneesRequises'], f: (e: Complete) => Calcul): DefinitionNiveau<EntreeEquilibreStatique> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions: () => null, calculer: (e) => f(e as Complete) };
}

export const equilibreStatique: Mecanisme<EntreeEquilibreStatique> = {
  id: 'equilibre-statique',
  version: '0.1.0',
  titre: 'meca.equ.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'L', libelle: 'champ.L-travee', symbole: 'L', unite: 'm' },
    { type: 'nombre', id: 'a', libelle: 'champ.a-console', symbole: 'a', unite: 'm' },
    { type: 'nombre', id: 'g', libelle: 'champ.g-poids-propre', symbole: 'g_k', unite: 'kN/m' },
    { type: 'nombre', id: 'q', libelle: 'champ.q-console', symbole: 'q_k', unite: 'kN/m' },
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
  sollicitation: { libelle: 'grandeur.moment-destabilisant', unite: 'kN·m' },
  resistance: { libelle: 'grandeur.moment-stabilisant', unite: 'kN·m' },
  niveaux: {
    'en1990-2002': [niveau('equ', 1, 'A1.2(A)', 'niveau.equ.2002.equ', communs, equ2002), niveau('equ-str', 2, 'A1.2(A)', 'niveau.equ.2002.equ-str', communs, equStr2002), niveau('lu', 3, 'AN-LU A1.3.1(1)', 'niveau.equ.2002.lu', communs, equLu)],
    'en1990-2023': [niveau('vc2', 1, '8.3.3.1(5)', 'niveau.equ.2023.vc2', [...communs, R.cc], vc2)],
  },
};
