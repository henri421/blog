/**
 * Charge uniformement repartie equivalente au poids propre des cloisons
 * mobiles (cloisons traitees comme des charges d exploitation).
 *
 * Unites : kN/m de longueur de mur pour Q_k,p ; kN/m2 pour q_k,p.
 *
 * Premiere generation (EN 1991-1-1:2002, 6.3.1.2(8), lue au travers du guide
 *   de Calgaro et al., 2009, le texte complet n etant pas detenu) : trois
 *   classes de poids, q_k = 0,5 kN/m2 (Q_k,p <= 1,0 kN/m), 0,8 kN/m2
 *   (<= 2,0 kN/m), 1,2 kN/m2 (<= 3,0 kN/m).
 * Deuxieme generation (EN 1991-1-1:2025, 6.5.3.1(1) et (3)) :
 *   q_k,p = max{0,35 ; 0,4 Q_k,p} (6.1), pour Q_k,p <= 3,0 kN/m.
 * Au-dela de 3,0 kN/m, les deux generations demandent de modeliser la
 *   cloison (6.5.3.1(4) ; 6.3.1.2(9)) : niveau non applicable.
 * Condition non verifiee par l outil : plancher capable de repartir une
 *   charge lineique (6.5.3.1(1)).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeChargeCloisons {
  /** Poids propre de la cloison (kN/m de longueur de mur). */
  Qkp?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeChargeCloisons>;

export const QKP_MAX = 3.0;

const R = {
  Qkp: { champ: 'Qkp', libelle: 'champ.Qkp-cloison' },
} as const satisfies Record<string, { champ: keyof EntreeChargeCloisons; libelle: Cle }>;

const lourde = (e: EntreeChargeCloisons): Cle | null => (e.Qkp !== undefined && e.Qkp > QKP_MAX ? 'motif.cloison-lourde' : null);

export function qkp2002(Qkp: number): number {
  return Qkp <= 1.0 ? 0.5 : Qkp <= 2.0 ? 0.8 : 1.2;
}

export function qkp2025(Qkp: number): number {
  return Math.max(0.35, 0.4 * Qkp);
}

function cellule(q: number, inter: Cellule['intermediaires'], clauses: string[]): Calcul {
  return { statut: { etat: 'calcule' }, resistance: q, intermediaires: inter, clauses };
}

const niveau2002: DefinitionNiveau<EntreeChargeCloisons> = {
  id: 'cloisons',
  ordre: 1,
  position: 'corps',
  clause: '6.3.1.2(8)',
  hypothese: 'niveau.cloisons.2002',
  donneesRequises: [R.Qkp],
  conditions: lourde,
  calculer: (e) => {
    const c = e as Complete;
    positif(c.Qkp, 'Qkp', 'kN/m');
    const q = qkp2002(c.Qkp);
    return cellule(q, { 'Q_k,p': saisie(c.Qkp, 'kN/m'), 'q_k,p': calculee(q, 'kN/m²') }, ['6.3.1.2(8)']);
  },
};

const niveau2025: DefinitionNiveau<EntreeChargeCloisons> = {
  id: 'cloisons',
  ordre: 1,
  position: 'corps',
  clause: '6.5.3.1(3)',
  hypothese: 'niveau.cloisons.2025',
  donneesRequises: [R.Qkp],
  conditions: lourde,
  calculer: (e) => {
    const c = e as Complete;
    positif(c.Qkp, 'Qkp', 'kN/m');
    const q = qkp2025(c.Qkp);
    return cellule(q, { 'Q_k,p': saisie(c.Qkp, 'kN/m'), '0,4 Q_k,p': calculee(0.4 * c.Qkp, 'kN/m²'), 'q_k,p': calculee(q, 'kN/m²') }, ['6.5.3.1(3)', '(6.1)']);
  },
};

export const chargeCloisons: Mecanisme<EntreeChargeCloisons> = {
  id: 'charge-cloisons',
  version: '0.1.0',
  titre: 'meca.cloisons.titre',
  generations: ['en1991-1-1-2002', 'en1991-1-1-2025'],
  champs: [{ type: 'nombre', id: 'Qkp', libelle: 'champ.Qkp-cloison', symbole: 'Q_k,p', unite: 'kN/m' }],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.charge-cloisons', unite: 'kN/m²' },
  niveaux: { 'en1991-1-1-2002': [niveau2002], 'en1991-1-1-2025': [niveau2025] },
};
