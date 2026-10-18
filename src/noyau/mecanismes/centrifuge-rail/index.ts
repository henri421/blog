/**
 * Force centrifuge sur un pont ferroviaire en courbe (modeles de charge 71 et
 * SW/0), avec le coefficient de reduction f.
 *
 * Unites : km/h, m, kN.
 *
 * Premiere generation (EN 1991-2:2003, 6.5.1, citee de memoire, a relire) :
 *   Q_tk = V^2/(127 r) f Q_vk ;
 *   f = 1 - (V - 120)/1000 (814/V + 1,75)(1 - sqrt(2,88/L_f)) >= 0,35.
 * Deuxieme generation (EN 1991-2:2023, 8.5.1, Formules (8.14) et (8.16)) :
 *   memes expressions ; f = 1 pour V <= 120 km/h ou L_f <= 2,88 m ;
 *   f(V) = f(300) au-dela de 300 km/h.
 * Choix de l outil : cas 8.5.1(10) b) (vitesse maximale, charge reduite par f) ;
 *   le cas a) (V = 120 km/h, f = 1) est donne en intermediaire. Q_vk est saisi
 *   (charge par essieu ou repartie, alpha deja applique si besoin).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeCentrifugeRail {
  V?: number;
  r?: number;
  Lf?: number;
  Qvk?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  V: { champ: 'V', libelle: 'champ.V-ligne' },
  r: { champ: 'r', libelle: 'champ.r-courbe-voie' },
  Lf: { champ: 'Lf', libelle: 'champ.Lf-influence' },
  Qvk: { champ: 'Qvk', libelle: 'champ.Qvk-rail' },
} as const satisfies Record<string, { champ: keyof EntreeCentrifugeRail; libelle: Cle }>;

export function reductionF(V: number, Lf: number): number {
  if (V <= 120 || Lf <= 2.88) return 1;
  const v = Math.min(V, 300);
  return Math.max(1 - ((v - 120) / 1000) * (814 / v + 1.75) * (1 - Math.sqrt(2.88 / Lf)), 0.35);
}

function calculeur(clause: string) {
  return (e: EntreeCentrifugeRail): Calcul => {
    positif(e.V as number, 'V', 'km/h');
    positif(e.r as number, 'r', 'm');
    positif(e.Lf as number, 'L_f', 'm');
    positif(e.Qvk as number, 'Q_vk', 'kN');
    const V = e.V as number;
    const f = reductionF(V, e.Lf as number);
    const Q = ((V * V) / (127 * (e.r as number))) * f * (e.Qvk as number);
    const Q120 = ((Math.min(V, 120) ** 2) / (127 * (e.r as number))) * (e.Qvk as number);
    return {
      statut: { etat: 'calcule' },
      sollicitation: Q,
      intermediaires: { f: calculee(f, '-'), Q_vk: saisie(e.Qvk as number, 'kN'), 'Q_tk (120 km/h, f = 1)': calculee(Q120, 'kN') },
      clauses: [clause],
    };
  };
}

const niveau = (clause: string, hypothese: Cle): DefinitionNiveau<EntreeCentrifugeRail> => ({
  id: 'centrifuge',
  ordre: 1,
  position: 'corps',
  clause: clause,
  hypothese: hypothese,
  donneesRequises: [R.V, R.r, R.Lf, R.Qvk],
  conditions: () => null,
  calculer: calculeur(clause),
});

export const centrifugeRail: Mecanisme<EntreeCentrifugeRail> = {
  id: 'centrifuge-rail',
  version: '0.1.0',
  titre: 'meca.centrifuge-rail.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    { type: 'nombre', id: 'V', libelle: 'champ.V-ligne', symbole: 'V', unite: 'km/h' },
    { type: 'nombre', id: 'r', libelle: 'champ.r-courbe-voie', symbole: 'r', unite: 'm' },
    { type: 'nombre', id: 'Lf', libelle: 'champ.Lf-influence', symbole: 'L_f', unite: 'm' },
    { type: 'nombre', id: 'Qvk', libelle: 'champ.Qvk-rail', symbole: 'Q_vk', unite: 'kN' },
  ],
  sollicitation: { libelle: 'grandeur.centrifuge-rail', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-2-2003': [niveau('6.5.1', 'niveau.centrifuge-rail.2003')],
    'en1991-2-2023': [niveau('8.5.1', 'niveau.centrifuge-rail.2023')],
  },
};
