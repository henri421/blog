/**
 * Coefficient structural du vent pris egal a 1,0 (dispense de calcul
 * dynamique) selon le type de construction.
 *
 * Unites : m, Hz.
 *
 * Premiere generation (EN 1991-1-4:2005 + A1:2010, 6.2(1), texte non detenu,
 *   a relire) : c_s c_d = 1 pour a) batiments de hauteur < 15 m ; b) facades
 *   et toitures de frequence propre > 5 Hz ; c) batiments a ossature avec murs
 *   de contreventement, h < 100 m et h < 4 d ; d) cheminees circulaires,
 *   h < 60 m et h < 6,5 d.
 * Deuxieme generation (EN 1991-1-4:2026, 8.2(1)) : c_sd = 1 pour a) a c)
 *   identiques ; d) tabliers de ponts du domaine de D.8.1 sans calcul
 *   dynamique (5.4(9)) ; les cheminees ne sont plus dispensees.
 * Choix de l outil : resultat 1,0 si dispense, sinon niveau non applicable
 *   (calcul detaille par l annexe E).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { recommandee, saisie } from '../../moteur/grandeurs';

export interface EntreeCsdSimplifie {
  /** 'batiment', 'batiment-contrevente', 'facade', 'cheminee' ou 'tablier'. */
  type?: string;
  h?: number;
  d?: number;
  f?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  type: { champ: 'type', libelle: 'champ.type-csd' },
  h: { champ: 'h', libelle: 'champ.h-construction' },
  d: { champ: 'd', libelle: 'champ.d-construction' },
  f: { champ: 'f', libelle: 'champ.f-propre-element' },
} as const satisfies Record<string, { champ: keyof EntreeCsdSimplifie; libelle: Cle }>;

export function dispense(e: EntreeCsdSimplifie, gen: '2005' | '2026'): boolean {
  const h = e.h ?? Infinity;
  const d = e.d ?? 0;
  const f = e.f ?? 0;
  switch (e.type) {
    case 'batiment':
      return h < 15;
    case 'batiment-contrevente':
      return h < 15 || (h < 100 && h < 4 * d);
    case 'facade':
      return f > 5;
    case 'cheminee':
      return gen === '2005' && h < 60 && h < 6.5 * d;
    case 'tablier':
      return gen === '2026';
    default:
      return false;
  }
}

function calculer(e: EntreeCsdSimplifie, clause: string): Calcul {
  return { statut: { etat: 'calcule' }, resistance: 1, intermediaires: { h: saisie(e.h ?? 0, 'm'), c_sd: recommandee(1, '-') }, clauses: [clause] };
}

function niveau(gen: '2005' | '2026', clause: string, hypothese: Cle): DefinitionNiveau<EntreeCsdSimplifie> {
  return {
    id: 'dispense',
    ordre: 1,
    position: 'corps',
    clause,
    hypothese,
    donneesRequises: [R.type, R.h],
    conditions: (e) => (dispense(e, gen) ? null : 'motif.csd-detaille'),
    calculer: (e) => calculer(e, clause),
  };
}

export const csdSimplifie: Mecanisme<EntreeCsdSimplifie> = {
  id: 'csd-simplifie',
  version: '0.1.0',
  titre: 'meca.csd.titre',
  generations: ['en1991-1-4-2005', 'en1991-1-4-2026'],
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-csd',
      options: [
        { valeur: 'batiment', libelle: 'option.csd.batiment' },
        { valeur: 'batiment-contrevente', libelle: 'option.csd.batiment-contrevente' },
        { valeur: 'facade', libelle: 'option.csd.facade' },
        { valeur: 'cheminee', libelle: 'option.csd.cheminee' },
        { valeur: 'tablier', libelle: 'option.csd.tablier' },
      ],
    },
    { type: 'nombre', id: 'h', libelle: 'champ.h-construction', symbole: 'h', unite: 'm' },
    { type: 'nombre', id: 'd', libelle: 'champ.d-construction', symbole: 'd', unite: 'm', facultatif: true },
    { type: 'nombre', id: 'f', libelle: 'champ.f-propre-element', symbole: 'f', unite: 'Hz', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.csd', unite: '-' },
  niveaux: { 'en1991-1-4-2005': [niveau('2005', '6.2(1)', 'niveau.csd.2005')], 'en1991-1-4-2026': [niveau('2026', '8.2(1)', 'niveau.csd.2026')] },
};
