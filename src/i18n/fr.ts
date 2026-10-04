/**
 * Dictionnaire francais : seule entree active en version 1.
 *
 * Toute chaine visible par l utilisateur vient d ici, y compris les motifs de
 * non-applicabilite renvoyes par le noyau (CDC §5.5). L anglais sera un second
 * dictionnaire de meme type (`Dictionnaire`), pas une reecriture.
 */

export const fr = {
  // ---- Site ----
  'site.titre': 'EC2 2e génération',
  'site.sous-titre':
    'Ce qui change avec l’EN 1992-1-1:2023, mécanisme par mécanisme : articles de référence, exemples types et mini-calculateurs.',
  'site.suite': 'Suite Aedificium',
  'site.chantier': 'Site en préparation : aucun article n’est encore publié.',
  'site.articles': 'Articles',
  'site.retour': 'Tous les articles',
  'site.avertissement':
    'Contenu rédigé par l’auteur, sans reproduction de la norme. Valeurs recommandées des deux générations, sans annexe nationale. L’outil constate, il ne prescrit pas.',

  // ---- En-tete de statut d un article ----
  'article.statut': 'Statut de l’article',
  'article.brouillon': 'Brouillon, non publié',
  'article.publie': 'Publié',
  'article.texte-reference': 'Texte de référence',
  'article.redige': 'Rédigé le',
  'article.revise': 'Dernière révision',
  'article.annexe-nationale': 'Annexe nationale',
  'article.annexe-non-publiee': 'non publiée ; valeurs recommandées',
  'article.calculateur': 'Calculateur embarqué',
  'article.historique': 'Historique des révisions',
  'article.sans-calculateur': 'aucun',

  // ---- Generations ----
  'generation.ec2-2004': 'EN 1992-1-1:2004 + A1:2014',
  'generation.ec2-2023': 'EN 1992-1-1:2023',
  'generation-courte.ec2-2004': '2004',
  'generation-courte.ec2-2023': '2023',

  // ---- Statuts d une cellule ----
  'statut.calcule': 'Calculé',
  'statut.non-applicable': 'Niveau non applicable',
  'statut.non-convergent': 'Calcul non convergent',
  'statut.hors-domaine': 'Hors du domaine de validité',
  'statut.donnees-manquantes': 'Données manquantes',
  'statut.iterations': 'Itérations',

  // ---- Provenance d une grandeur ----
  'provenance.saisie': 'saisie',
  'provenance.calculee': 'calculée',
  'provenance.recommandee': 'valeur recommandée',

  // ---- Motifs ----
  'motif.donnees-manquantes': 'Une ou plusieurs données exigées par ce niveau ne sont pas saisies.',
  'motif.fck-sup-90': 'fck supérieur à 90 MPa : hors du domaine traité par l’outil.',
  'motif.fck-sup-60': 'fck supérieur à 60 MPa : hors du domaine traité par l’outil pour les ancrages.',
  'motif.d-sup-h': 'La hauteur utile doit être inférieure à la hauteur totale.',
  'motif.poteau-allonge':
    'Un côté du poteau dépasse 3 d : seule une partie du périmètre serait à retenir, règle non codée.',
  'motif.sigma-sup-fyd': 'σsd dépasse fyd : la barre ne peut pas être plus sollicitée que plastifiée.',

  // ---- Mecanismes ----
  'meca.tsa.titre': 'Effort tranchant sans armature d’âme',
  'meca.taa.titre': 'Effort tranchant avec armatures d’âme',
  'meca.poin.titre': 'Poinçonnement sur poteau intérieur',
  'meca.fiss.titre': 'Ouverture de fissure',
  'meca.anc.titre': 'Longueurs d’ancrage et de recouvrement',

  // ---- Grandeurs comparees ----
  'grandeur.effort-tranchant': 'Effort tranchant de calcul',
  'grandeur.resistance-tranchant': 'Résistance à l’effort tranchant',
  'grandeur.reaction-poteau': 'Réaction transmise par le poteau',
  'grandeur.resistance-poinconnement': 'Résistance au poinçonnement',
  'grandeur.ouverture': 'Ouverture calculée',
  'grandeur.ouverture-limite': 'Ouverture limite',
  'grandeur.longueur-requise': 'Longueur requise',
  'grandeur.longueur-disponible': 'Longueur disponible',

  // ---- Champs d entree ----
  'champ.VEd': 'Effort tranchant de calcul',
  'champ.VEd-poinconnement': 'Réaction de calcul du poteau',
  'champ.MEd': 'Moment concomitant',
  'champ.bw': 'Largeur de l’âme',
  'champ.b': 'Largeur de la section',
  'champ.h': 'Hauteur totale',
  'champ.d': 'Hauteur utile',
  'champ.dx': 'Hauteur utile, nappe x',
  'champ.dy': 'Hauteur utile, nappe y',
  'champ.Asl': 'Armatures longitudinales tendues ancrées',
  'champ.Ast': 'Armatures de la membrure tendue',
  'champ.Asw': 'Section d’un cours d’armatures d’âme',
  'champ.Asx': 'Nappe supérieure x',
  'champ.Asy': 'Nappe supérieure y',
  'champ.s': 'Espacement des cours',
  'champ.s-barres': 'Espacement des barres tendues',
  'champ.fck': 'Résistance caractéristique du béton',
  'champ.fyk': 'Limite d’élasticité de l’acier',
  'champ.Dlower': 'Granulat : dimension supérieure de la fraction la plus grosse',
  'champ.c1': 'Côté du poteau, direction x',
  'champ.c2': 'Côté du poteau, direction y',
  'champ.apx': 'Distance au moment nul, direction x',
  'champ.apy': 'Distance au moment nul, direction y',
  'champ.phi': 'Diamètre des barres',
  'champ.c': 'Enrobage des barres tendues',
  'champ.Mqp': 'Moment quasi permanent',
  'champ.alphaE': 'Coefficient d’équivalence pour σs',
  'champ.duree': 'Durée de la charge',
  'champ.wmax': 'Ouverture limite',
  'champ.sigmaSd': 'Contrainte de calcul dans la barre',
  'champ.adherence': 'Conditions d’adhérence',
  'champ.cs': 'Distance libre entre barres',
  'champ.cx': 'Enrobage latéral',
  'champ.cy': 'Enrobage inférieur ou supérieur',
  'champ.type-ancrage': 'Disposition',
  'champ.lDispo': 'Longueur disponible',

  // ---- Options ----
  'option.duree.longue': 'longue durée (kt = 0,4)',
  'option.duree.courte': 'courte durée (kt = 0,6)',
  'option.adherence.bonne': 'bonnes',
  'option.adherence.mediocre': 'médiocres',
  'option.type.ancrage': 'ancrage droit',
  'option.type.recouvrement': 'recouvrement, toutes les barres dans la même section',

  // ---- Hypotheses des niveaux ----
  'niveau.tsa.2004.base': 'Expression empirique en (100 ρl fck)^1/3, effet d’échelle par k, minimum vmin.',
  'niveau.tsa.2023.tau-min':
    'Résistance minimale τRdc,min : ne demande ni le ferraillage longitudinal ni le moment.',
  'niveau.tsa.2023.hauteur-utile': 'τRd,c avec la hauteur utile d comme longueur d’échelle.',
  'niveau.tsa.2023.portee-mecanique':
    'τRd,c avec la portée mécanique av, tirée du rapport M/V dans la section.',
  'niveau.taa.2004.base': 'Treillis à inclinaison variable, ν1 = 0,6 (1 − fck/250), 1 ≤ cot θ ≤ 2,5.',
  'niveau.taa.2023.nu-constant': 'Treillis à inclinaison variable, ν = 0,5, 1 ≤ cot θ ≤ 2,5.',
  'niveau.taa.2023.nu-variable':
    'ν tiré de la déformation longitudinale εx, elle-même fonction de M, V et cot θ ; optimum cherché par itération.',
  'niveau.poin.2004.base': 'Contrôle à 2d du nu (u1) et au nu (u0), β = 1,15.',
  'niveau.poin.2023.hauteur-utile': 'Contrôle à dv/2 du nu (b0,5), βe = 1,15, longueur d’échelle dv.',
  'niveau.poin.2023.moment-nul':
    'Longueur d’échelle apd tirée de la distance aux lignes de moment nul.',
  'niveau.fiss.2004.base': 'sr,max = 3,4 c + 0,17 φ/ρp,eff, sans effet de la courbure.',
  'niveau.fiss.2023.base': 'wk,cal = kw k1/r sr,m,cal (εsm − εcm) : espacement moyen et courbure.',
  'niveau.anc.2004.barre-plastifiee': 'σsd = fyd ; lb,rqd par la contrainte d’adhérence fbd, α2 seul retenu.',
  'niveau.anc.2004.contrainte-reelle': 'σsd de calcul saisie ; lb,rqd par fbd, α2 seul retenu.',
  'niveau.anc.2023.barre-plastifiee': 'σsd = fyd dans l’expression directe de lbd.',
  'niveau.anc.2023.contrainte-reelle': 'σsd de calcul saisie dans l’expression directe de lbd.',

  // ---- Ilot de calcul ----
  'ilot.donnees': 'Données',
  'ilot.facultatif': 'facultatif',
  'ilot.resultats': 'Résultats par génération et par niveau',
  'ilot.generation': 'Génération',
  'ilot.niveau': 'Niveau',
  'ilot.niveaux': 'Niveaux',
  'ilot.agissant': 'Agissant',
  'ilot.resistant': 'Résistant',
  'ilot.statut': 'Statut',
  'ilot.taux': 'Taux de travail',
  'ilot.detail': 'Détail',
  'ilot.hypothese': 'Hypothèse',
  'ilot.clauses': 'Clauses',
  'ilot.grandeur': 'Grandeur',
  'ilot.valeur': 'Valeur',
  'ilot.provenance': 'Provenance',
  'ilot.balayage': 'Faire varier un paramètre',
  'ilot.parametre': 'Paramètre',
  'ilot.de': 'de',
  'ilot.a': 'à',
  'ilot.tracer': 'Tracer',
  'ilot.axe-taux': 'Taux de travail',
  'ilot.ruptures': 'Changements d’applicabilité',
  'ilot.aucune-rupture': 'Aucun changement d’applicabilité sur la plage.',
  'ilot.exporter': 'Exporter en JSON',
  'ilot.importer': 'Rejouer un JSON',
  'ilot.reinitialiser': 'Revenir à l’exemple',
  'ilot.erreur': 'Calcul impossible',
  'ilot.version': 'Version du calculateur',
} as const;
