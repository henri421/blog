/**
 * Charges d exploitation dynamiques des batiments : chariots elevateurs et
 * helicopteres (toitures de categorie K).
 *
 * Unites : kN.
 *
 * Premiere generation (EN 1991-1-1:2002, 6.3.2.3 et 6.3.4.2, tableau 6.11,
 *   texte non detenu, a relire) : Q_k,dyn = phi Q_k ; phi = 1,40 (roues
 *   pneumatiques), 2,00 (roues pleines), 1,40 (helicopteres) ; classes HC1
 *   (Q <= 20 kN, Q_k = 20) et HC2 (Q <= 60 kN, Q_k = 60).
 * Deuxieme generation (EN 1991-1-1:2025, 6.5.4.2, 6.5.6.3, (6.4), tableau
 *   6.4) : memes coefficients ; classe HC3 ajoutee (60 < Q <= 120 kN,
 *   Q_k = 120 kN).
 * Choix de l outil : pour un chariot, Q_k est la charge a l essieu saisie
 *   (tableau 6.3) ; pour un helicoptere, Q est la charge de decollage.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeChargeDynamique {
  /** 'chariot-pneu', 'chariot-plein' ou 'helicoptere'. */
  type?: string;
  /** Charge a l essieu (chariot) ou charge de decollage (helicoptere), kN. */
  Q?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  type: { champ: 'type', libelle: 'champ.type-charge-dynamique' },
  Q: { champ: 'Q', libelle: 'champ.Q-statique' },
} as const satisfies Record<string, { champ: keyof EntreeChargeDynamique; libelle: Cle }>;

export function phi(type: string): number {
  return type === 'chariot-plein' ? 2.0 : 1.4;
}

export function qkHelicoptere(Q: number, hc3: boolean): number | null {
  if (Q <= 20) return 20;
  if (Q <= 60) return 60;
  if (hc3 && Q <= 120) return 120;
  return null;
}

function calculer(e: EntreeChargeDynamique, hc3: boolean, clauses: string[]): Calcul {
  const Q = e.Q as number;
  positif(Q, 'Q', 'kN');
  const p = phi(e.type as string);
  const Qk = e.type === 'helicoptere' ? (qkHelicoptere(Q, hc3) as number) : Q;
  const Qd = p * Qk;
  return { statut: { etat: 'calcule' }, sollicitation: Qd, intermediaires: { Q: saisie(Q, 'kN'), Q_k: calculee(Qk, 'kN'), 'φ': recommandee(p, '-'), 'Q_k,dyn': calculee(Qd, 'kN') }, clauses };
}

function niveau(hc3: boolean, clause: string, hypothese: Cle, clauses: string[]): DefinitionNiveau<EntreeChargeDynamique> {
  return {
    id: 'dynamique',
    ordre: 1,
    position: 'corps',
    clause,
    hypothese,
    donneesRequises: [R.type, R.Q],
    conditions: (e) => (e.type === 'helicoptere' && e.Q !== undefined && qkHelicoptere(e.Q, hc3) === null ? 'motif.helicoptere-lourd' : null),
    calculer: (e) => calculer(e, hc3, clauses),
  };
}

export const chargeDynamique: Mecanisme<EntreeChargeDynamique> = {
  id: 'charge-dynamique',
  version: '0.1.0',
  titre: 'meca.qdyn.titre',
  generations: ['en1991-1-1-2002', 'en1991-1-1-2025'],
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-charge-dynamique',
      options: [
        { valeur: 'chariot-pneu', libelle: 'option.qdyn.chariot-pneu' },
        { valeur: 'chariot-plein', libelle: 'option.qdyn.chariot-plein' },
        { valeur: 'helicoptere', libelle: 'option.qdyn.helicoptere' },
      ],
    },
    { type: 'nombre', id: 'Q', libelle: 'champ.Q-statique', symbole: 'Q', unite: 'kN' },
  ],
  sollicitation: { libelle: 'grandeur.charge-dynamique', unite: 'kN' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-1-2002': [niveau(false, '6.3.4.2', 'niveau.qdyn.2002', ['6.3.2.3', '6.3.4.2', '(6.3)', 'tableau 6.11'])],
    'en1991-1-1-2025': [niveau(true, '6.5.6.3', 'niveau.qdyn.2025', ['6.5.4.2', '6.5.6.3', '(6.4)', 'tableau 6.4'])],
  },
};
