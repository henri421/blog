/**
 * Noyau de calcul, independant du rendu (CDC ET4) : c est le livrable
 * technique du projet, destine a etre transplante dans `section-uls` ou
 * `poinconnement` le jour venu.
 */

import type { Mecanisme } from './moteur/mecanisme';
import { ameTable } from './mecanismes/ame-table/index';
import { ancrage } from './mecanismes/ancrage/index';
import { fissurationMinimale, nonFragilite } from './mecanismes/armatures-minimales/index';
import { enrobage } from './mecanismes/enrobage/index';
import { fissuration } from './mecanismes/fissuration/index';
import { fleche } from './mecanismes/fleche/index';
import { cisaillementInterface } from './mecanismes/interface/index';
import { poinconnement } from './mecanismes/poinconnement/index';
import { poinconnementArme } from './mecanismes/poinconnement-arme/index';
import { tranchantAvecArmature } from './mecanismes/tranchant-avec-armature/index';
import { tranchantSansArmature } from './mecanismes/tranchant-sans-armature/index';

export type { Cellule, Generation, Grandeur, Niveau, Provenance, Statut } from './model/resultat';
export type { DefinitionNiveau } from './moteur/niveaux';
export { evaluerNiveau, evaluerNiveaux, estAbsente } from './moteur/niveaux';
export type { Champ, Mecanisme } from './moteur/mecanisme';
export { GENERATIONS } from './moteur/mecanisme';
export { calculerMatrice, relire, rejouer, serialiser, type Matrice } from './moteur/matrice';
export { balayer, valeursRegulieres, type Balayage, type Rupture, type Serie } from './moteur/balayer';
export { ameTable, ancrage, cisaillementInterface, enrobage, fissuration, fissurationMinimale, fleche, nonFragilite, poinconnement, poinconnementArme, tranchantAvecArmature, tranchantSansArmature };

/**
 * Registre des mecanismes, indexe par identifiant (montage des ilots). Le
 * type d entree est efface ici : l ilot ne manipule que des champs declares.
 */
export const MECANISMES: Record<string, Mecanisme<Record<string, unknown>>> = {
  [tranchantSansArmature.id]: tranchantSansArmature as unknown as Mecanisme<Record<string, unknown>>,
  [tranchantAvecArmature.id]: tranchantAvecArmature as unknown as Mecanisme<Record<string, unknown>>,
  [poinconnement.id]: poinconnement as unknown as Mecanisme<Record<string, unknown>>,
  [poinconnementArme.id]: poinconnementArme as unknown as Mecanisme<Record<string, unknown>>,
  [fissuration.id]: fissuration as unknown as Mecanisme<Record<string, unknown>>,
  [fleche.id]: fleche as unknown as Mecanisme<Record<string, unknown>>,
  [nonFragilite.id]: nonFragilite as unknown as Mecanisme<Record<string, unknown>>,
  [fissurationMinimale.id]: fissurationMinimale as unknown as Mecanisme<Record<string, unknown>>,
  [ancrage.id]: ancrage as unknown as Mecanisme<Record<string, unknown>>,
  [enrobage.id]: enrobage as unknown as Mecanisme<Record<string, unknown>>,
  [ameTable.id]: ameTable as unknown as Mecanisme<Record<string, unknown>>,
  [cisaillementInterface.id]: cisaillementInterface as unknown as Mecanisme<Record<string, unknown>>,
};
