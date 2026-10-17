/**
 * Charge de neige uniforme sur une toiture terrasse (pente au plus 5 degres
 * en 2025, au plus 30 degres pour mu_1 = 0,8 en 2003), situation de projet
 * durable et transitoire.
 *
 * Unites : kN/m2 pour les charges ; m pour les dimensions.
 *
 * Premiere generation (EN 1991-1-3:2003 + A1:2015, 5.2(3) et tableau 5.2,
 *   texte de 2003 non detenu) : s = mu_1 C_e C_t s_k, mu_1 = 0,8 ;
 *   C_e = 0,8 (balaye), 1,0 (normal), 1,2 (protege).
 * Deuxieme generation (EN 1991-1-3:2025, 6.1(3), 7.2, 7.3, 7.5.2.1) :
 *   s = mu_1 C_t s_k (7.1), le coefficient d exposition etant dans mu_1 ;
 *   mu_1 = 0,8 C_e,F (7.3) ; C_e,F = C_e pour L_c <= 50 m,
 *   C_e + (1,25 - C_e)(L_c - 50)/350 pour 50 < L_c < 400 m, 1,25 au-dela
 *   (7.4) ; L_c = 2 W - W2/L ; s_k multiplie par f_s,cc >= 1 (changement
 *   climatique, 6.1(3)) ; surcharge de pluie sur neige s_R = 0,25 kN/m2 pour
 *   s_k <= 0,75, 1,0 - s_k jusqu a 1,0 kN/m2 (7.2(4)).
 * Choix de l outil : s_R appliquee a s_k avant f_s,cc (lecture litterale de
 *   7.2(4)) ; pas de panneaux inclines, d acrotere ni d obstruction.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeNeigeToiture {
  /** Charge de neige caracteristique sur le sol (kN/m2). */
  sk?: number;
  /** Exposition : 'balaye', 'normal' ou 'protege'. */
  exposition?: string;
  /** Coefficient thermique. */
  Ct?: number;
  /** Petit cote de la toiture (m). */
  W?: number;
  /** Grand cote de la toiture (m). */
  L?: number;
  /** Facteur de changement climatique (2025), 1,0 par defaut. */
  fscc?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeNeigeToiture>;

const R = {
  sk: { champ: 'sk', libelle: 'champ.sk' },
  exposition: { champ: 'exposition', libelle: 'champ.exposition-vent' },
  Ct: { champ: 'Ct', libelle: 'champ.Ct' },
  W: { champ: 'W', libelle: 'champ.W-toiture' },
  L: { champ: 'L', libelle: 'champ.L-toiture' },
} as const satisfies Record<string, { champ: keyof EntreeNeigeToiture; libelle: Cle }>;

export function ce(exposition: string): number {
  return exposition === 'balaye' ? 0.8 : exposition === 'protege' ? 1.2 : 1.0;
}

export function longueurEffective(W: number, L: number): number {
  const w = Math.min(W, L);
  const l = Math.max(W, L);
  return 2 * w - (w * w) / l;
}

export function ceF(Ce: number, Lc: number): number {
  if (Lc <= 50) return Ce;
  if (Lc >= 400) return 1.25;
  return Ce + ((1.25 - Ce) * (Lc - 50)) / 350;
}

export function pluieSurNeige(sk: number): number {
  return sk <= 0.75 ? 0.25 : sk <= 1.0 ? 1.0 - sk : 0;
}

function verifier(e: Complete): void {
  positif(e.sk, 'sk', 'kN/m2');
  positif(e.Ct, 'Ct', '-');
}

const fs = (e: EntreeNeigeToiture): number => e.fscc ?? 1;

export function s2003(e: Complete): Calcul {
  verifier(e);
  const Ce = ce(e.exposition);
  const s = 0.8 * Ce * e.Ct * e.sk;
  return { statut: { etat: 'calcule' }, sollicitation: s, intermediaires: { 'μ_1': recommandee(0.8, '-'), C_e: recommandee(Ce, '-'), C_t: saisie(e.Ct, '-'), s: calculee(s, 'kN/m²') }, clauses: ['5.2(3)', '(5.7)', 'tableau 5.2'] };
}

function base2025(e: Complete): { s: number; inter: Cellule['intermediaires'] } {
  verifier(e);
  positif(e.W, 'W', 'm');
  positif(e.L, 'L', 'm');
  const f = fs(e);
  if (!(f >= 1)) throw new Error('fscc doit etre au moins egal a 1.');
  const Ce = ce(e.exposition);
  const Lc = longueurEffective(e.W, e.L);
  const CeF = ceF(Ce, Lc);
  const mu = 0.8 * CeF;
  const s = mu * e.Ct * f * e.sk;
  return { s, inter: { C_e: recommandee(Ce, '-'), L_c: calculee(Lc, 'm'), 'C_e,F': calculee(CeF, '-'), 'μ_1': calculee(mu, '-'), 'f_s,cc': saisie(f, '-'), C_t: saisie(e.Ct, '-'), s: calculee(s, 'kN/m²') } };
}

export function uniforme2025(e: Complete): Calcul {
  const b = base2025(e);
  return { statut: { etat: 'calcule' }, sollicitation: b.s, intermediaires: b.inter, clauses: ['7.2', '(7.1)', '(7.3)', '(7.4)', '6.1(3)'] };
}

export function pluie2025(e: Complete): Calcul {
  const b = base2025(e);
  const sR = pluieSurNeige(e.sk);
  const s = b.s + sR;
  return { statut: { etat: 'calcule' }, sollicitation: s, intermediaires: { ...b.inter, s_R: recommandee(sR, 'kN/m²'), 's + s_R': calculee(s, 'kN/m²') }, clauses: ['7.2(4)', '(7.1)', '(7.3)', '(7.4)'] };
}

function niveau(id: string, ordre: number, clause: string, hypothese: Cle, requis: DefinitionNiveau<EntreeNeigeToiture>['donneesRequises'], f: (e: Complete) => Calcul, conditions: DefinitionNiveau<EntreeNeigeToiture>['conditions'] = () => null): DefinitionNiveau<EntreeNeigeToiture> {
  return { id, ordre, position: 'corps', clause, hypothese, donneesRequises: requis, conditions, calculer: (e) => f(e as Complete) };
}

const avecDimensions = [R.sk, R.exposition, R.Ct, R.W, R.L];

export const neigeToiture: Mecanisme<EntreeNeigeToiture> = {
  id: 'neige-toiture',
  version: '0.1.0',
  titre: 'meca.neige.titre',
  generations: ['en1991-1-3-2003', 'en1991-1-3-2025'],
  champs: [
    { type: 'nombre', id: 'sk', libelle: 'champ.sk', symbole: 's_k', unite: 'kN/m²' },
    {
      type: 'choix',
      id: 'exposition',
      libelle: 'champ.exposition-vent',
      options: [
        { valeur: 'balaye', libelle: 'option.exposition.balaye' },
        { valeur: 'normal', libelle: 'option.exposition.normal' },
        { valeur: 'protege', libelle: 'option.exposition.protege' },
      ],
    },
    { type: 'nombre', id: 'Ct', libelle: 'champ.Ct', symbole: 'C_t', unite: '-' },
    { type: 'nombre', id: 'W', libelle: 'champ.W-toiture', symbole: 'W', unite: 'm' },
    { type: 'nombre', id: 'L', libelle: 'champ.L-toiture', symbole: 'L', unite: 'm' },
    { type: 'nombre', id: 'fscc', libelle: 'champ.fscc', symbole: 'f_s,cc', unite: '-', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.neige-toiture', unite: 'kN/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-3-2003': [
      niveau('uniforme', 1, '5.2(3)', 'niveau.neige.2003.uniforme', [R.sk, R.exposition, R.Ct], s2003),
      niveau('pluie', 2, '—', 'niveau.neige.2003.pluie', [], s2003, () => 'motif.sans-equivalent-2004'),
    ],
    'en1991-1-3-2025': [
      niveau('uniforme', 1, '7.2(1)', 'niveau.neige.2025.uniforme', avecDimensions, uniforme2025),
      niveau('pluie', 2, '7.2(4)', 'niveau.neige.2025.pluie', avecDimensions, pluie2025, (e) => (e.sk !== undefined && e.sk > 1.0 ? 'motif.neige-sk-sup-1' : null)),
    ],
  },
};
