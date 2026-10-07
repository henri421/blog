/**
 * Espacement des armatures et paquets de barres : distance libre minimale
 * entre barres ou entre paquets, diametre equivalent d un paquet.
 *
 * Unites : mm.
 *
 * Diametre equivalent d un paquet de n_b barres de meme diametre phi :
 *   phi_n = phi racine(n_b) (8.14) en premiere generation ;
 *   phi_b = racine(4 A_s / pi) (11.6) en deuxieme, ce qui revient au meme.
 * Nombre de barres d un paquet : au plus 3, au plus 4 pour des barres
 *   verticales comprimees et dans un recouvrement (8.9.1(2) ; 11.2(3)).
 * Premiere generation (8.2(2), 8.9.1(3), valeurs recommandees k_1 = 1,
 *   k_2 = 5 mm) : c_s,min = max(k_1 phi_n ; d_g + k_2 ; 20 mm), phi_n
 *   remplacant phi pour un paquet ; phi_n <= 55 mm (8.14).
 * Deuxieme generation : barres isolees c_s,min = max(phi ; D_upper + 5 mm ;
 *   20 mm) (11.2(2)) ; entre paquets c_s,min = phi_b (11.2(3)). Le texte de
 *   (3) ne cite que phi_b : l outil ne lui ajoute ni D_upper + 5 mm ni 20 mm
 *   (lecture signalee dans l article). Aucun plafond de phi_b n est donne.
 * Choix de l outil : barres d un paquet de meme diametre (le rapport 1,7 de
 *   8.9.1(1) n est pas traite) ; regles d ancrage et de recouvrement des
 *   paquets (8.9.2, 8.9.3 ; 11.4.3, 11.5.3) decrites dans l article, le
 *   diametre equivalent se saisissant dans le calculateur d ancrage.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeEspacement {
  /** Diametre des barres, toutes de meme diametre (mm). */
  phi?: number;
  /** Nombre de barres du paquet ; 1 pour une barre isolee. */
  nb?: number;
  /** 'courant', 'compression-verticale' ou 'recouvrement'. */
  disposition?: string;
  /** Dimension du plus gros granulat D_upper, d_g en 2004 (mm). */
  Dupper?: number;
  /** Distance libre prevue entre barres ou entre paquets (mm). */
  csPrevu?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeEspacement>;

/** Valeurs recommandees de 8.2(2) ; memes valeurs fixees en 11.2(2). */
const K1 = 1;
const K2 = 5;
const PLANCHER = 20;
/** Diametre equivalent maximal de la premiere generation (8.14). */
const PHI_N_MAX = 55;

const R = {
  phi: { champ: 'phi', libelle: 'champ.phi' },
  nb: { champ: 'nb', libelle: 'champ.nb-paquet' },
  disposition: { champ: 'disposition', libelle: 'champ.disposition-paquet' },
  Dupper: { champ: 'Dupper', libelle: 'champ.Dupper' },
  csPrevu: { champ: 'csPrevu', libelle: 'champ.cs-prevu' },
} as const satisfies Record<string, { champ: keyof EntreeEspacement; libelle: Cle }>;

const requises = [R.phi, R.nb, R.disposition, R.Dupper, R.csPrevu];

export function nbMax(disposition: string): number {
  return disposition === 'compression-verticale' || disposition === 'recouvrement' ? 4 : 3;
}

/** Diametre equivalent d un paquet de n_b barres de diametre phi. */
export function diametreEquivalent(phi: number, nb: number): number {
  return phi * Math.sqrt(nb);
}

function verifier(e: Complete): void {
  positif(e.phi, 'phi', 'mm');
  positif(e.Dupper, 'D_upper', 'mm');
  positif(e.csPrevu, 'c_s prevu', 'mm');
  if (!(Number.isInteger(e.nb) && e.nb >= 1)) throw new Error('n_b doit etre un entier au moins egal a 1.');
}

function conditionNombre(e: EntreeEspacement): Cle | null {
  return (e.nb as number) > nbMax(e.disposition as string) ? 'motif.paquet-nb-max' : null;
}

export function espacement2004(e: Complete): Calcul {
  verifier(e);
  const phin = diametreEquivalent(e.phi, e.nb);
  const csmin = Math.max(K1 * phin, e.Dupper + K2, PLANCHER);
  const inter: Cellule['intermediaires'] = {};
  if (e.nb > 1) inter.φ_n = calculee(phin, 'mm');
  return {
    statut: { etat: 'calcule' },
    sollicitation: csmin,
    resistance: e.csPrevu,
    intermediaires: {
      ...inter,
      'n_b,max': recommandee(nbMax(e.disposition), '-'),
      'k_1 φ': calculee(K1 * phin, 'mm'),
      'd_g + k_2': calculee(e.Dupper + K2, 'mm'),
      plancher: recommandee(PLANCHER, 'mm'),
      'c_s,min': calculee(csmin, 'mm'),
      c_s: saisie(e.csPrevu, 'mm'),
    },
    clauses: e.nb > 1 ? ['8.2(2)', '8.9.1', '(8.14)'] : ['8.2(2)'],
  };
}

export function espacement2023(e: Complete): Calcul {
  verifier(e);
  if (e.nb === 1) {
    const csmin = Math.max(e.phi, e.Dupper + K2, PLANCHER);
    return {
      statut: { etat: 'calcule' },
      sollicitation: csmin,
      resistance: e.csPrevu,
      intermediaires: {
        φ: saisie(e.phi, 'mm'),
        'D_upper + 5': calculee(e.Dupper + K2, 'mm'),
        plancher: recommandee(PLANCHER, 'mm'),
        'c_s,min': calculee(csmin, 'mm'),
        c_s: saisie(e.csPrevu, 'mm'),
      },
      clauses: ['11.2(2)'],
    };
  }
  const phib = diametreEquivalent(e.phi, e.nb);
  return {
    statut: { etat: 'calcule' },
    sollicitation: phib,
    resistance: e.csPrevu,
    intermediaires: {
      φ_b: calculee(phib, 'mm'),
      'n_b,max': recommandee(nbMax(e.disposition), '-'),
      'c_s,min': calculee(phib, 'mm'),
      c_s: saisie(e.csPrevu, 'mm'),
    },
    clauses: ['11.2(3)', '11.4.3(1)', '(11.6)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeEspacement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '8.2',
    hypothese: 'niveau.esp.2004.base',
    donneesRequises: requises,
    conditions: (e) => {
      const n = conditionNombre(e);
      if (n !== null) return n;
      return diametreEquivalent(e.phi as number, e.nb as number) > PHI_N_MAX ? 'motif.phin-sup-55' : null;
    },
    calculer: (e) => espacement2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeEspacement>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '11.2',
    hypothese: 'niveau.esp.2023.base',
    donneesRequises: requises,
    conditions: conditionNombre,
    calculer: (e) => espacement2023(e as Complete),
  },
];

export const espacement: Mecanisme<EntreeEspacement> = {
  id: 'espacement',
  version: '0.1.0',
  titre: 'meca.esp.titre',
  champs: [
    { type: 'nombre', id: 'phi', libelle: 'champ.phi', symbole: 'φ', unite: 'mm' },
    { type: 'nombre', id: 'nb', libelle: 'champ.nb-paquet', symbole: 'n_b', unite: '-' },
    {
      type: 'choix',
      id: 'disposition',
      libelle: 'champ.disposition-paquet',
      options: [
        { valeur: 'courant', libelle: 'option.esp.courant' },
        { valeur: 'compression-verticale', libelle: 'option.esp.compression-verticale' },
        { valeur: 'recouvrement', libelle: 'option.esp.recouvrement' },
      ],
    },
    { type: 'nombre', id: 'Dupper', libelle: 'champ.Dupper', symbole: 'D_upper', unite: 'mm' },
    { type: 'nombre', id: 'csPrevu', libelle: 'champ.cs-prevu', symbole: 'c_s', unite: 'mm' },
  ],
  sollicitation: { libelle: 'grandeur.cs-requis', unite: 'mm' },
  resistance: { libelle: 'grandeur.cs-prevu', unite: 'mm' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
