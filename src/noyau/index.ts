/**
 * Noyau de calcul, independant du rendu (CDC ET4) : c est le livrable
 * technique du projet, destine a etre transplante dans `section-uls` ou
 * `poinconnement` le jour venu.
 */

import type { Mecanisme } from './moteur/mecanisme';
import { lm1 } from './mecanismes/lm1/index';
import { explosionGaz } from './mecanismes/explosion-gaz/index';
import { chocVehicule } from './mecanismes/choc-vehicule/index';
import { executionClimat } from './mecanismes/execution-climat/index';
import { temperatureBatiment } from './mecanismes/temperature-batiment/index';
import { temperaturePont } from './mecanismes/temperature-pont/index';
import { tourbillons } from './mecanismes/tourbillons/index';
import { csdSimplifie } from './mecanismes/csd-simplifie/index';
import { pressionInterieure } from './mecanismes/pression-interieure/index';
import { vitesseReference } from './mecanismes/vitesse-reference/index';
import { neigeAcrotere } from './mecanismes/neige-acrotere/index';
import { neigeVersants } from './mecanismes/neige-versants/index';
import { neigeSol } from './mecanismes/neige-sol/index';
import { chargeCalorifique } from './mecanismes/charge-calorifique/index';
import { feuNominal } from './mecanismes/feu-nominal/index';
import { gardeCorps } from './mecanismes/garde-corps/index';
import { chargeDynamique } from './mecanismes/charge-dynamique/index';
import { poidsPropePont } from './mecanismes/poids-propre-pont/index';
import { appuiFrottement } from './mecanismes/appui-frottement/index';
import { comptageCycles } from './mecanismes/comptage-cycles/index';
import { passerelleFlux } from './mecanismes/passerelle-flux/index';
import { combinaisonPont } from './mecanismes/combinaison-pont/index';
import { essaisCaracteristique } from './mecanismes/essais-caracteristique/index';
import { resistanceCalcul } from './mecanismes/resistance-calcul/index';
import { valeurPermanente } from './mecanismes/valeur-permanente/index';
import { actionsEffets } from './mecanismes/actions-effets/index';
import { tirantsRobustesse } from './mecanismes/tirants-robustesse/index';
import { fiabilite } from './mecanismes/fiabilite/index';
import { ameTable } from './mecanismes/ame-table/index';
import { ancrage } from './mecanismes/ancrage/index';
import { ancrageCrochet } from './mecanismes/ancrage-crochet/index';
import { ancrageBoucle, ancrageSoude } from './mecanismes/ancrage-soude-boucle/index';
import { teteAncrage } from './mecanismes/tete-ancrage/index';
import { integrite } from './mecanismes/integrite/index';
import { deviation } from './mecanismes/deviation/index';
import { recouvrementBoucle, recouvrementTete } from './mecanismes/recouvrement-boucle-tete/index';
import { combinaisonElu } from './mecanismes/combinaison-elu/index';
import { reductionExploitation } from './mecanismes/reduction-exploitation/index';
import { chargeCloisons } from './mecanismes/charge-cloisons/index';
import { facteurConsequence } from './mecanismes/facteur-consequence/index';
import { equilibreStatique } from './mecanismes/equilibre-statique/index';
import { flecheBatiment } from './mecanismes/fleche-batiment/index';
import { neigeToiture } from './mecanismes/neige-toiture/index';
import { pressionPointe } from './mecanismes/pression-pointe/index';
import { combinaisonAccidentelle } from './mecanismes/combinaison-accidentelle/index';
import { mandrin } from './mecanismes/mandrin/index';
import { fatigueAcier, fatigueBeton, fatigueTranchant } from './mecanismes/fatigue/index';
import { nonArmeCompression, nonArmeTranchant, semelleNonArmee } from './mecanismes/beton-non-arme/index';
import { appuiPrefabrique } from './mecanismes/appui-prefabrique/index';
import { pretension } from './mecanismes/pretension/index';
import { encuvement } from './mecanismes/encuvement/index';
import { postTension } from './mecanismes/post-tension/index';
import { jointPlancherMeca } from './mecanismes/joint-plancher/index';
import { coefficientsPartiels } from './mecanismes/coefficients-partiels/index';
import { deversementMeca } from './mecanismes/deversement/index';
import { largeurParticipante } from './mecanismes/largeur-participante/index';
import { flexionDeviee } from './mecanismes/flexion-deviee/index';
import { fluageEffectif } from './mecanismes/fluage-effectif/index';
import { acierCalcul } from './mecanismes/acier-calcul/index';
import { analysePlastique } from './mecanismes/analyse-plastique/index';
import { armatureScellee } from './mecanismes/armature-scellee/index';
import { precontrainteTension } from './mecanismes/precontrainte-tension/index';
import { pertesDifferees } from './mecanismes/pertes-differees/index';
import { armatureTranchantMinimale } from './mecanismes/armature-tranchant-minimale/index';
import { bielles, diffusion } from './mecanismes/bielles/index';
import { fissurationMinimale, nonFragilite } from './mecanismes/armatures-minimales/index';
import { elancement } from './mecanismes/elancement/index';
import { chainages } from './mecanismes/chainages/index';
import { contraintesEls } from './mecanismes/contraintes-els/index';
import { enrobage } from './mecanismes/enrobage/index';
import { espacement } from './mecanismes/espacement/index';
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
export { acierCalcul, analysePlastique, ancrageBoucle, armatureScellee, ancrageSoude, appuiPrefabrique, coefficientsPartiels, deversementMeca, encuvement, chainages, contraintesEls, espacement, fatigueAcier, fatigueBeton, fatigueTranchant, flexionDeviee, fluageEffectif, jointPlancherMeca, largeurParticipante, mandrin, nonArmeCompression, nonArmeTranchant, pertesDifferees, postTension, precontrainteTension, pretension, semelleNonArmee, teteAncrage, integrite, deviation, recouvrementBoucle, recouvrementTete, combinaisonElu, reductionExploitation, chargeCloisons, facteurConsequence, equilibreStatique, flecheBatiment, neigeToiture, pressionPointe, combinaisonAccidentelle, fiabilite, tirantsRobustesse, actionsEffets, valeurPermanente, resistanceCalcul, essaisCaracteristique, combinaisonPont, passerelleFlux, comptageCycles, appuiFrottement, poidsPropePont, chargeDynamique, gardeCorps, feuNominal, chargeCalorifique, neigeSol, neigeVersants, neigeAcrotere, vitesseReference, pressionInterieure, csdSimplifie, tourbillons, temperaturePont, temperatureBatiment, executionClimat, chocVehicule, explosionGaz, lm1 };
export { ameTable, ancrage, ancrageCrochet, armatureTranchantMinimale, bielles, diffusion, cisaillementInterface, elancement, enrobage, fissuration, fissurationMinimale, fleche, flexion, imperfections, materiauxBeton, nonFragilite, poinconnement, poinconnementArme, pressionLocalisee, redistribution, torsion, tranchantAvecArmature, tranchantDalleBidirectionnelle, tranchantSansArmature };

/**
 * Registre des mecanismes, indexe par identifiant (montage des ilots). Le
 * type d entree est efface ici : l ilot ne manipule que des champs declares.
 */
export const MECANISMES: Record<string, Mecanisme<Record<string, unknown>>> = {
  [lm1.id]: lm1 as unknown as Mecanisme<Record<string, unknown>>,
  [explosionGaz.id]: explosionGaz as unknown as Mecanisme<Record<string, unknown>>,
  [chocVehicule.id]: chocVehicule as unknown as Mecanisme<Record<string, unknown>>,
  [executionClimat.id]: executionClimat as unknown as Mecanisme<Record<string, unknown>>,
  [temperatureBatiment.id]: temperatureBatiment as unknown as Mecanisme<Record<string, unknown>>,
  [temperaturePont.id]: temperaturePont as unknown as Mecanisme<Record<string, unknown>>,
  [tourbillons.id]: tourbillons as unknown as Mecanisme<Record<string, unknown>>,
  [csdSimplifie.id]: csdSimplifie as unknown as Mecanisme<Record<string, unknown>>,
  [pressionInterieure.id]: pressionInterieure as unknown as Mecanisme<Record<string, unknown>>,
  [vitesseReference.id]: vitesseReference as unknown as Mecanisme<Record<string, unknown>>,
  [neigeAcrotere.id]: neigeAcrotere as unknown as Mecanisme<Record<string, unknown>>,
  [neigeVersants.id]: neigeVersants as unknown as Mecanisme<Record<string, unknown>>,
  [neigeSol.id]: neigeSol as unknown as Mecanisme<Record<string, unknown>>,
  [chargeCalorifique.id]: chargeCalorifique as unknown as Mecanisme<Record<string, unknown>>,
  [feuNominal.id]: feuNominal as unknown as Mecanisme<Record<string, unknown>>,
  [gardeCorps.id]: gardeCorps as unknown as Mecanisme<Record<string, unknown>>,
  [chargeDynamique.id]: chargeDynamique as unknown as Mecanisme<Record<string, unknown>>,
  [poidsPropePont.id]: poidsPropePont as unknown as Mecanisme<Record<string, unknown>>,
  [appuiFrottement.id]: appuiFrottement as unknown as Mecanisme<Record<string, unknown>>,
  [comptageCycles.id]: comptageCycles as unknown as Mecanisme<Record<string, unknown>>,
  [passerelleFlux.id]: passerelleFlux as unknown as Mecanisme<Record<string, unknown>>,
  [combinaisonPont.id]: combinaisonPont as unknown as Mecanisme<Record<string, unknown>>,
  [essaisCaracteristique.id]: essaisCaracteristique as unknown as Mecanisme<Record<string, unknown>>,
  [resistanceCalcul.id]: resistanceCalcul as unknown as Mecanisme<Record<string, unknown>>,
  [valeurPermanente.id]: valeurPermanente as unknown as Mecanisme<Record<string, unknown>>,
  [actionsEffets.id]: actionsEffets as unknown as Mecanisme<Record<string, unknown>>,
  [tirantsRobustesse.id]: tirantsRobustesse as unknown as Mecanisme<Record<string, unknown>>,
  [fiabilite.id]: fiabilite as unknown as Mecanisme<Record<string, unknown>>,
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
  [armatureTranchantMinimale.id]: armatureTranchantMinimale as unknown as Mecanisme<Record<string, unknown>>,
  [contraintesEls.id]: contraintesEls as unknown as Mecanisme<Record<string, unknown>>,
  [chainages.id]: chainages as unknown as Mecanisme<Record<string, unknown>>,
  [espacement.id]: espacement as unknown as Mecanisme<Record<string, unknown>>,
  [ancrageSoude.id]: ancrageSoude as unknown as Mecanisme<Record<string, unknown>>,
  [ancrageBoucle.id]: ancrageBoucle as unknown as Mecanisme<Record<string, unknown>>,
  [teteAncrage.id]: teteAncrage as unknown as Mecanisme<Record<string, unknown>>,
  [integrite.id]: integrite as unknown as Mecanisme<Record<string, unknown>>,
  [deviation.id]: deviation as unknown as Mecanisme<Record<string, unknown>>,
  [recouvrementBoucle.id]: recouvrementBoucle as unknown as Mecanisme<Record<string, unknown>>,
  [recouvrementTete.id]: recouvrementTete as unknown as Mecanisme<Record<string, unknown>>,
  [combinaisonElu.id]: combinaisonElu as unknown as Mecanisme<Record<string, unknown>>,
  [reductionExploitation.id]: reductionExploitation as unknown as Mecanisme<Record<string, unknown>>,
  [chargeCloisons.id]: chargeCloisons as unknown as Mecanisme<Record<string, unknown>>,
  [facteurConsequence.id]: facteurConsequence as unknown as Mecanisme<Record<string, unknown>>,
  [equilibreStatique.id]: equilibreStatique as unknown as Mecanisme<Record<string, unknown>>,
  [flecheBatiment.id]: flecheBatiment as unknown as Mecanisme<Record<string, unknown>>,
  [neigeToiture.id]: neigeToiture as unknown as Mecanisme<Record<string, unknown>>,
  [pressionPointe.id]: pressionPointe as unknown as Mecanisme<Record<string, unknown>>,
  [combinaisonAccidentelle.id]: combinaisonAccidentelle as unknown as Mecanisme<Record<string, unknown>>,
  [mandrin.id]: mandrin as unknown as Mecanisme<Record<string, unknown>>,
  [fatigueAcier.id]: fatigueAcier as unknown as Mecanisme<Record<string, unknown>>,
  [fatigueBeton.id]: fatigueBeton as unknown as Mecanisme<Record<string, unknown>>,
  [fatigueTranchant.id]: fatigueTranchant as unknown as Mecanisme<Record<string, unknown>>,
  [nonArmeCompression.id]: nonArmeCompression as unknown as Mecanisme<Record<string, unknown>>,
  [nonArmeTranchant.id]: nonArmeTranchant as unknown as Mecanisme<Record<string, unknown>>,
  [semelleNonArmee.id]: semelleNonArmee as unknown as Mecanisme<Record<string, unknown>>,
  [appuiPrefabrique.id]: appuiPrefabrique as unknown as Mecanisme<Record<string, unknown>>,
  [pretension.id]: pretension as unknown as Mecanisme<Record<string, unknown>>,
  [encuvement.id]: encuvement as unknown as Mecanisme<Record<string, unknown>>,
  [postTension.id]: postTension as unknown as Mecanisme<Record<string, unknown>>,
  [jointPlancherMeca.id]: jointPlancherMeca as unknown as Mecanisme<Record<string, unknown>>,
  [coefficientsPartiels.id]: coefficientsPartiels as unknown as Mecanisme<Record<string, unknown>>,
  [deversementMeca.id]: deversementMeca as unknown as Mecanisme<Record<string, unknown>>,
  [largeurParticipante.id]: largeurParticipante as unknown as Mecanisme<Record<string, unknown>>,
  [flexionDeviee.id]: flexionDeviee as unknown as Mecanisme<Record<string, unknown>>,
  [fluageEffectif.id]: fluageEffectif as unknown as Mecanisme<Record<string, unknown>>,
  [acierCalcul.id]: acierCalcul as unknown as Mecanisme<Record<string, unknown>>,
  [analysePlastique.id]: analysePlastique as unknown as Mecanisme<Record<string, unknown>>,
  [armatureScellee.id]: armatureScellee as unknown as Mecanisme<Record<string, unknown>>,
  [precontrainteTension.id]: precontrainteTension as unknown as Mecanisme<Record<string, unknown>>,
  [pertesDifferees.id]: pertesDifferees as unknown as Mecanisme<Record<string, unknown>>,
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
