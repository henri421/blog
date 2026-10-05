/**
 * Vocabulaire controle des mots-cles (CDC v4 §4.2).
 *
 * Seule voie d acces transverse entre Eurocodes : un mot-cle absent de cette
 * liste fait echouer la construction. Ajouter un terme ici plutot qu un
 * synonyme d un terme existant. Le libelle affiche est la cle
 * `motcle.<identifiant>` du dictionnaire.
 */

export const MOTS_CLES = [
  'calendrier',
  'niveaux-approximation',
  'materiaux-beton',
  'analyse-structurale',
  'ductilite',
  'stabilite',
  'elu',
  'els',
  'flexion',
  'effort-tranchant',
  'treillis',
  'cisaillement',
  'interface',
  'torsion',
  'poinconnement',
  'pression-localisee',
  'fissuration',
  'fleche',
  'enrobage',
  'durabilite',
  'ancrage',
  'recouvrement',
  'dispositions-constructives',
  'armatures-minimales',
  'dalle',
  'poutre',
] as const;

export type MotCle = (typeof MOTS_CLES)[number];

export function estMotCle(texte: string): texte is MotCle {
  return (MOTS_CLES as readonly string[]).includes(texte);
}
