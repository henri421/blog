/**
 * Noyau de calcul, independant du rendu (CDC ET4) : c est le livrable
 * technique du projet, destine a etre transplante dans `section-uls` ou
 * `poinconnement` le jour venu.
 */

import type { Mecanisme } from './moteur/mecanisme';
import { ameTable } from './mecanismes/ame-table/index';
import { ancrage } from './mecanismes/ancrage/index';
import { ancrageCrochet } from './mecanismes/ancrage-crochet/index';
import { bielles, diffusion } from './mecanismes/bielles/index';
import { fissurationMinimale, nonFragilite } from './mecanismes/armatures-minimales/index';
import { elancement } from './mecanismes/elancement/index';
import { enrobage } from './mecanismes/enrobage/index';
import { fissuration } from './mecanismes/fissuration/index';
import { fleche } from './mecanismes/fleche/index';
import { flexion } from './mecanismes/flexion/index';
import { imperfections } from './mecanismes/imperfections/index';
import { courbureNominale, elancementLimite, rigiditeNominale } from './mecanismes/second-ordre/index';
import { materiauxBeton } from './mecanismes/materiaux/index';
import { cisaillementInterface } from './mecanismes/interface/index';
import { poinconnement } from './mecanismes/poinconnement/index';
import { redistribution } from './mecanismes/redistribution/index';
import { pressionLocalisee } from './mecanismes/pression-localisee/index';
import { poinconnementArme } from './mecanismes/poinconnement-arme/index';
import { torsion } from './mecanismes/torsion/index';
import { tranchantAvecArmature } from './mecanismes/tranchant-avec-armature/index';
import { tranchantSansArmature } from './mecanismes/tranchant-sans-armature/index';
import { tranchantDalleBidirectionnelle } from './mecanismes/tranchant-dalle-bidirectionnelle/index';

export type { Cellule, Generation, Grandeur, Niveau, Provenance, Statut } from './model/resultat';
export type { DefinitionNiveau } from './moteur/niveaux';
export { evaluerNiveau, evaluerNiveaux, estAbsente } from './moteur/niveaux';
export type { Champ, Mecanisme } from './moteur/mecanisme';
export { GENERATIONS } from './moteur/mecanisme';
export { calculerMatrice, relire, rejouer, serialiser, type Matrice } from './moteur/matrice';
export { balayer, valeursRegulieres, type Balayage, type Rupture, type Serie } from './moteur/balayer';
export { courbureNominale, elancementLimite, rigiditeNominale };
export { ameTable, ancrage, ancrageCrochet, bielles, diffusion, cisaillementInterface, elancement, enrobage, fissuration, fissurationMinimale, fleche, flexion, imperfections, materiauxBeton, nonFragilite, poinconnement, poinconnementArme, pressionLocalisee, redistribution, torsion, tranchantAvecArmature, tranchantDalleBidirectionnelle, tranchantSansArmature };

/**
 * Registre des mecanismes, indexe par identifiant (montage des ilots). Le
 * type d entree est efface ici : l ilot ne manipule que des champs declares.
 */
export const MECANISMES: Record<string, Mecanisme<Record<string, unknown>>> = {
  [tranchantSansArmature.id]: tranchantSansArmature as unknown as Mecanisme<Record<string, unknown>>,
  [tranchantDalleBidirectionnelle.id]: tranchantDalleBidirectionnelle as unknown as Mecanisme<Record<string, unknown>>,
  [tranchantAvecArmature.id]: tranchantAvecArmature as unknown as Mecanisme<Record<string, unknown>>,
  [poinconnement.id]: poinconnement as unknown as Mecanisme<Record<string, unknown>>,
  [poinconnementArme.id]: poinconnementArme as unknown as Mecanisme<Record<string, unknown>>,
  [fissuration.id]: fissuration as unknown as Mecanisme<Record<string, unknown>>,
  [elancement.id]: elancement as unknown as Mecanisme<Record<string, unknown>>,
  [fleche.id]: fleche as unknown as Mecanisme<Record<string, unknown>>,
  [pressionLocalisee.id]: pressionLocalisee as unknown as Mecanisme<Record<string, unknown>>,
  [redistribution.id]: redistribution as unknown as Mecanisme<Record<string, unknown>>,
  [torsion.id]: torsion as unknown as Mecanisme<Record<string, unknown>>,
  [elancementLimite.id]: elancementLimite as unknown as Mecanisme<Record<string, unknown>>,
  [rigiditeNominale.id]: rigiditeNominale as unknown as Mecanisme<Record<string, unknown>>,
  [courbureNominale.id]: courbureNominale as unknown as Mecanisme<Record<string, unknown>>,
  [diffusion.id]: diffusion as unknown as Mecanisme<Record<string, unknown>>,
  [bielles.id]: bielles as unknown as Mecanisme<Record<string, unknown>>,
  [imperfections.id]: imperfections as unknown as Mecanisme<Record<string, unknown>>,
  [flexion.id]: flexion as unknown as Mecanisme<Record<string, unknown>>,
  [materiauxBeton.id]: materiauxBeton as unknown as Mecanisme<Record<string, unknown>>,
  [nonFragilite.id]: nonFragilite as unknown as Mecanisme<Record<string, unknown>>,
  [fissurationMinimale.id]: fissurationMinimale as unknown as Mecanisme<Record<string, unknown>>,
  [ancrage.id]: ancrage as unknown as Mecanisme<Record<string, unknown>>,
  [ancrageCrochet.id]: ancrageCrochet as unknown as Mecanisme<Record<string, unknown>>,
  [enrobage.id]: enrobage as unknown as Mecanisme<Record<string, unknown>>,
  [ameTable.id]: ameTable as unknown as Mecanisme<Record<string, unknown>>,
  [cisaillementInterface.id]: cisaillementInterface as unknown as Mecanisme<Record<string, unknown>>,
};
