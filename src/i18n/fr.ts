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

  // ---- Generations ----
  'generation.ec2-2004': 'EN 1992-1-1:2004 + A1:2014',
  'generation.ec2-2023': 'EN 1992-1-1:2023',

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
} as const;
