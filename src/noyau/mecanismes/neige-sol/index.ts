/**
 * Charge de neige sur le sol : ajustement a une periode de retour et charge
 * exceptionnelle.
 *
 * Unites : kN/m2 ; annees.
 *
 * Premiere generation (EN 1991-1-3:2003 + A1:2015, 4.3 et annexe D, (D.1),
 *   texte non detenu, a relire) et deuxieme generation (EN 1991-1-3:2025, 6.2,
 *   (6.1), annexe B, (B.1)) : memes expressions.
 *   s_n = s_k [1 - V sqrt(6)/pi (ln(-ln(1 - P_n)) + 0,57722)] / (1 + 2,5923 V),
 *   P_n = 1/n ; s_Ad = C_esl s_k, C_esl = 2,0.
 * Choix de l outil : constante d Euler et coefficient 2,5923 non arrondis
 *   (le texte ecrit 0,577 et 2,59) ; f_s,cc non applique.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeNeigeSol {
  sk?: number;
  V?: number;
  n?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeNeigeSol>;

export const EULER = 0.5772156649;
export const C_ESL = 2.0;

const R = {
  sk: { champ: 'sk', libelle: 'champ.sk' },
  V: { champ: 'V', libelle: 'champ.V-neige' },
  n: { champ: 'n', libelle: 'champ.n-retour' },
} as const satisfies Record<string, { champ: keyof EntreeNeigeSol; libelle: Cle }>;

export function rapportRetour(V: number, n: number): number {
  const P = 1 / n;
  const a = (Math.sqrt(6) / Math.PI) * (Math.log(-Math.log(1 - P)) + EULER);
  const b = (Math.sqrt(6) / Math.PI) * (Math.log(-Math.log(1 - 0.02)) + EULER);
  return (1 - V * a) / (1 - V * b);
}

export function retour(e: Complete, clauses: string[]): Calcul {
  positif(e.sk, 'sk', 'kN/m2');
  if (!(e.V > 0 && e.V < 1)) throw new Error('V doit etre compris entre 0 et 1.');
  const r = rapportRetour(e.V, e.n);
  const sn = r * e.sk;
  return { statut: { etat: 'calcule' }, sollicitation: sn, intermediaires: { P_n: calculee(1 / e.n, '-'), 's_n / s_k': calculee(r, '-'), s_n: calculee(sn, 'kN/m²') }, clauses };
}

export function exceptionnelle(e: Complete, clauses: string[]): Calcul {
  positif(e.sk, 'sk', 'kN/m2');
  const s = C_ESL * e.sk;
  return { statut: { etat: 'calcule' }, sollicitation: s, intermediaires: { C_esl: recommandee(C_ESL, '-'), s_k: saisie(e.sk, 'kN/m²'), s_Ad: calculee(s, 'kN/m²') }, clauses };
}

const borne = (e: EntreeNeigeSol): Cle | null => (e.n !== undefined && !(e.n > 5) ? 'motif.neige-retour-court' : null);

function niveaux(c: { retour: string; exc: string }, h: string): DefinitionNiveau<EntreeNeigeSol>[] {
  return [
    { id: 'retour', ordre: 1, position: 'annexe-informative', reserve: 'reserve.en1991-1-3-retour', clause: c.retour, hypothese: `niveau.neige-sol.${h}.retour` as Cle, donneesRequises: [R.sk, R.V, R.n], conditions: borne, calculer: (e) => retour(e as Complete, [c.retour]) },
    { id: 'exceptionnelle', ordre: 2, position: 'corps', clause: c.exc, hypothese: `niveau.neige-sol.${h}.exc` as Cle, donneesRequises: [R.sk], conditions: () => null, calculer: (e) => exceptionnelle(e as Complete, [c.exc]) },
  ];
}

export const neigeSol: Mecanisme<EntreeNeigeSol> = {
  id: 'neige-sol',
  version: '0.1.0',
  titre: 'meca.neige-sol.titre',
  generations: ['en1991-1-3-2003', 'en1991-1-3-2025'],
  champs: [
    { type: 'nombre', id: 'sk', libelle: 'champ.sk', symbole: 's_k', unite: 'kN/m²' },
    { type: 'nombre', id: 'V', libelle: 'champ.V-neige', symbole: 'V', unite: '-' },
    { type: 'nombre', id: 'n', libelle: 'champ.n-retour', symbole: 'n', unite: 'ans' },
  ],
  sollicitation: { libelle: 'grandeur.neige-sol', unite: 'kN/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-3-2003': niveaux({ retour: 'D', exc: '4.3' }, '2003'), 'en1991-1-3-2025': niveaux({ retour: 'B.3', exc: '6.2' }, '2025') },
};
