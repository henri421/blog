/**
 * Charge de trafic routier sur un remblai (ouvrages geotechniques) et poussee
 * horizontale correspondante sur un mur.
 *
 * Unites : kN/m2, m, kN/m.
 *
 * Premiere generation (EN 1991-2:2003, 4.9, texte non detenu) : modeles de
 *   charge sur remblais a relire ; niveau non code.
 * Deuxieme generation (EN 1991-2:2023, 6.9.3) : charge equivalente uniforme
 *   simplifiee q_ek,l = 20 kN/m2 sur une voie de 3 m, 9 kN/m2 sur les autres
 *   voies, 5 kN/m2 pour les zones d entretien ; non applicable a moins de
 *   1,0 m de la structure.
 * Choix de l outil : poussee F = K q H (surcharge uniforme, coefficient K
 *   saisi).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeRemblaiTrafic {
  zone?: string;
  K?: number;
  H?: number;
  d?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  zone: { champ: 'zone', libelle: 'champ.zone-remblai' },
  K: { champ: 'K', libelle: 'champ.K-poussee' },
  H: { champ: 'H', libelle: 'champ.H-mur' },
} as const satisfies Record<string, { champ: keyof EntreeRemblaiTrafic; libelle: Cle }>;

export function qek(zone: string): number {
  return zone === 'autres' ? 9 : zone === 'entretien' ? 5 : 20;
}

function calculer(e: EntreeRemblaiTrafic): Calcul {
  positif(e.K as number, 'K', '-');
  positif(e.H as number, 'H', 'm');
  const q = qek(e.zone as string);
  const F = (e.K as number) * q * (e.H as number);
  return { statut: { etat: 'calcule' }, sollicitation: F, intermediaires: { 'q_ek,l': recommandee(q, 'kN/m²'), K: saisie(e.K as number, '-'), F: calculee(F, 'kN/m') }, clauses: ['6.9.3'] };
}

const niveau2003: DefinitionNiveau<EntreeRemblaiTrafic> = {
  id: 'poussee',
  ordre: 1,
  position: 'corps',
  clause: '4.9',
  hypothese: 'niveau.remblai.2003',
  donneesRequises: [R.zone, R.K, R.H],
  conditions: () => 'motif.texte-1g-a-relire',
  calculer: () => {
    throw new Error('Texte de 2003 a relire : jamais calcule.');
  },
};

const niveau2023: DefinitionNiveau<EntreeRemblaiTrafic> = {
  id: 'poussee',
  ordre: 1,
  position: 'corps',
  clause: '6.9.3',
  hypothese: 'niveau.remblai.2023',
  donneesRequises: [R.zone, R.K, R.H],
  conditions: (e) => (e.d !== undefined && e.d < 1.0 ? 'motif.remblai-proche' : null),
  calculer: calculer,
};

export const remblaiTrafic: Mecanisme<EntreeRemblaiTrafic> = {
  id: 'remblai-trafic',
  version: '0.1.0',
  titre: 'meca.remblai.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    {
      type: 'choix',
      id: 'zone',
      libelle: 'champ.zone-remblai',
      options: [
        { valeur: 'voie1', libelle: 'option.remblai.voie1' },
        { valeur: 'autres', libelle: 'option.remblai.autres' },
        { valeur: 'entretien', libelle: 'option.remblai.entretien' },
      ],
    },
    { type: 'nombre', id: 'K', libelle: 'champ.K-poussee', symbole: 'K', unite: '-' },
    { type: 'nombre', id: 'H', libelle: 'champ.H-mur', symbole: 'H', unite: 'm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d-chaussee-mur', symbole: 'd', unite: 'm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.poussee-surcharge', unite: 'kN/m' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-2-2003': [niveau2003], 'en1991-2-2023': [niveau2023] },
};
