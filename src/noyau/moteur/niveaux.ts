/**
 * Declaration d un niveau d approximation (CDC §5.3).
 *
 * Lot 0 : le type seul. Le parcours des niveaux (aucun niveau masque, aucune
 * monotonie supposee, iteration visible) arrive au lot 2.
 */

import type { Cle } from '../../i18n/cle';
import type { Cellule, Niveau } from '../model/resultat';

export interface DefinitionNiveau<E> {
  id: Niveau;
  ordre: number;
  clause: string;
  /** Resume de l hypothese du niveau. */
  hypothese: Cle;
  /** Donnees sans lesquelles le niveau est non applicable, chacune nommee. */
  donneesRequises: Array<{ champ: keyof E; libelle: Cle }>;
  /** Condition normative d emploi : `null` si satisfaite, sinon la cle du motif. */
  conditions(e: E): Cle | null;
  calculer(e: E): Omit<Cellule, 'generation' | 'niveau'>;
}
