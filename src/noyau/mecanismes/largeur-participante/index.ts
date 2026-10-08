/**
 * Largeur participante de la table de compression des poutres en T ou en L.
 *
 * Unites : mm.
 *
 * Meme expression dans les deux generations ((5.7) ; (7.11), (7.12)) :
 *   b_eff = somme(b_eff,i) + b_w <= b,
 *   b_eff,i = min(0,2 b_i + 0,1 l_0 ; 0,2 l_0 ; b_i),
 *   l_0 (l_0b en 2023) distance entre points de moment nul, lue sur la
 *   figure 5.2 ou 7.2 et saisie.
 * Premiere generation (5.3.2.1) : pour tous les etats limites.
 * Deuxieme generation (7.2.3(1)) : a l ELU seulement lorsqu un comportement
 *   fragile peut etre attendu, et a l ELS le cas echeant ; sinon, a l ELU, la
 *   table entiere b peut etre retenue (niveau « elu-ductile »).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeLargeurParticipante {
  bw?: number;
  /** Debords de table de chaque cote de l ame (mm), 0 pour une poutre en L. */
  b1?: number;
  b2?: number;
  /** Distance entre points de moment nul (mm). */
  l0?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeLargeurParticipante>;

const R = {
  bw: { champ: 'bw', libelle: 'champ.bw' },
  b1: { champ: 'b1', libelle: 'champ.b1-debord' },
  b2: { champ: 'b2', libelle: 'champ.b2-debord' },
  l0: { champ: 'l0', libelle: 'champ.l0-moment-nul' },
} as const satisfies Record<string, { champ: keyof EntreeLargeurParticipante; libelle: Cle }>;

function verifier(e: Complete): void {
  positif(e.bw, 'b_w', 'mm');
  positif(e.l0, 'l_0', 'mm');
  for (const [v, n] of [
    [e.b1, 'b_1'],
    [e.b2, 'b_2'],
  ] as const) {
    if (!(Number.isFinite(v) && v >= 0)) throw new Error(`${n} doit etre positif ou nul (mm).`);
  }
}

const partielle = (bi: number, l0: number): number => Math.min(0.2 * bi + 0.1 * l0, 0.2 * l0, bi);

export function largeurReduite(e: Complete, clauses: string[]): Calcul {
  verifier(e);
  const b1 = partielle(e.b1, e.l0);
  const b2 = partielle(e.b2, e.l0);
  const b = e.bw + e.b1 + e.b2;
  const beff = Math.min(b1 + b2 + e.bw, b);
  return {
    statut: { etat: 'calcule' },
    resistance: beff,
    intermediaires: { 'b_eff,1': calculee(b1, 'mm'), 'b_eff,2': calculee(b2, 'mm'), b: calculee(b, 'mm'), b_eff: calculee(beff, 'mm') },
    clauses,
  };
}

export function largeurDuctile(e: Complete): Calcul {
  verifier(e);
  const b = e.bw + e.b1 + e.b2;
  return {
    statut: { etat: 'calcule' },
    resistance: b,
    intermediaires: { b_w: saisie(e.bw, 'mm'), b: calculee(b, 'mm') },
    clauses: ['7.2.3(1)'],
  };
}

const requises = [R.bw, R.b1, R.b2, R.l0];

const niveaux2004: DefinitionNiveau<EntreeLargeurParticipante>[] = [
  {
    id: 'reduite',
    ordre: 1,
    position: 'corps',
    clause: '5.3.2.1',
    hypothese: 'niveau.lp.2004.reduite',
    donneesRequises: requises,
    conditions: () => null,
    calculer: (e) => largeurReduite(e as Complete, ['5.3.2.1(3)', '(5.7)']),
  },
];

const niveaux2023: DefinitionNiveau<EntreeLargeurParticipante>[] = [
  {
    id: 'reduite',
    ordre: 1,
    position: 'corps',
    clause: '7.2.3',
    hypothese: 'niveau.lp.2023.reduite',
    donneesRequises: requises,
    conditions: () => null,
    calculer: (e) => largeurReduite(e as Complete, ['7.2.3(3)', '(7.11)', '(7.12)']),
  },
  {
    id: 'elu-ductile',
    ordre: 2,
    position: 'corps',
    clause: '7.2.3',
    hypothese: 'niveau.lp.2023.elu-ductile',
    donneesRequises: [R.bw, R.b1, R.b2],
    conditions: () => null,
    calculer: (e) => largeurDuctile(e as Complete),
  },
];

export const largeurParticipante: Mecanisme<EntreeLargeurParticipante> = {
  id: 'largeur-participante',
  version: '0.1.0',
  titre: 'meca.lp.titre',
  champs: [
    { type: 'nombre', id: 'bw', libelle: 'champ.bw', symbole: 'b_w', unite: 'mm' },
    { type: 'nombre', id: 'b1', libelle: 'champ.b1-debord', symbole: 'b_1', unite: 'mm' },
    { type: 'nombre', id: 'b2', libelle: 'champ.b2-debord', symbole: 'b_2', unite: 'mm' },
    { type: 'nombre', id: 'l0', libelle: 'champ.l0-moment-nul', symbole: 'l_0', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.largeur-participante', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
