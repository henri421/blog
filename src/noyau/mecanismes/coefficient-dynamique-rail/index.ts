/**
 * Coefficient dynamique Phi (Phi2, Phi3) des ponts ferroviaires, applique aux
 * effets statiques des modeles de charge 71, SW/0 et SW/2.
 *
 * Unites : m, sans dimension.
 *
 * Premiere generation (EN 1991-2:2003, 6.4.5, citee de memoire, a relire) :
 *   Phi2 = 1,44/(sqrt(L) - 0,2) + 0,82 (1,00 a 1,67) ;
 *   Phi3 = 2,16/(sqrt(L) - 0,2) + 0,73 (1,00 a 2,00) ;
 *   reduction pour une couverture h > 1,0 m : Phi - (h - 1,0)/10 >= 1,0.
 * Deuxieme generation (EN 1991-2:2023, 8.4.5, Formules (8.4) a (8.6)) : memes
 *   expressions ; Phi3 par defaut si rien n est specifie.
 * Choix de l outil : les criteres de 8.4.4 (analyse dynamique requise) ne
 *   sont pas verifies ; L_Phi est saisi (tableau 8.2 non reproduit).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeCoefficientDynamiqueRail {
  entretien?: string;
  L?: number;
  h?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  entretien: { champ: 'entretien', libelle: 'champ.entretien-voie' },
  L: { champ: 'L', libelle: 'champ.L-determinante' },
} as const satisfies Record<string, { champ: keyof EntreeCoefficientDynamiqueRail; libelle: Cle }>;

export function phi(entretien: string, L: number): number {
  const s = Math.sqrt(L) - 0.2;
  return entretien === 'soigne'
    ? Math.min(Math.max(1.44 / s + 0.82, 1.0), 1.67)
    : Math.min(Math.max(2.16 / s + 0.73, 1.0), 2.0);
}

function calculeur(clause: string) {
  return (e: EntreeCoefficientDynamiqueRail): Calcul => {
    positif(e.L as number, 'L_Φ', 'm');
    const p = phi(e.entretien as string, e.L as number);
    const h = e.h ?? 0;
    const red = h > 1.0 ? Math.max(p - (h - 1.0) / 10, 1.0) : p;
    return {
      statut: { etat: 'calcule' },
      sollicitation: red,
      intermediaires: { 'L_Φ': saisie(e.L as number, 'm'), 'Φ': calculee(p, '-'), 'Φ_red': calculee(red, '-') },
      clauses: [clause],
    };
  };
}

const niveau = (clause: string, hypothese: Cle): DefinitionNiveau<EntreeCoefficientDynamiqueRail> => ({
  id: 'phi',
  ordre: 1,
  position: 'corps',
  clause: clause,
  hypothese: hypothese,
  donneesRequises: [R.entretien, R.L],
  conditions: (e) => (Math.sqrt(e.L as number) <= 0.2 ? 'motif.L-phi-trop-court' : null),
  calculer: calculeur(clause),
});

export const coefficientDynamiqueRail: Mecanisme<EntreeCoefficientDynamiqueRail> = {
  id: 'coefficient-dynamique-rail',
  version: '0.1.0',
  titre: 'meca.phi-rail.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    {
      type: 'choix',
      id: 'entretien',
      libelle: 'champ.entretien-voie',
      options: [
        { valeur: 'normal', libelle: 'option.phi-rail.normal' },
        { valeur: 'soigne', libelle: 'option.phi-rail.soigne' },
      ],
    },
    { type: 'nombre', id: 'L', libelle: 'champ.L-determinante', symbole: 'L_Φ', unite: 'm' },
    { type: 'nombre', id: 'h', libelle: 'champ.h-couverture', symbole: 'h', unite: 'm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.phi-rail', unite: '-' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-2-2003': [niveau('6.4.5', 'niveau.phi-rail.2003')],
    'en1991-2-2023': [niveau('8.4.5', 'niveau.phi-rail.2023')],
  },
};
