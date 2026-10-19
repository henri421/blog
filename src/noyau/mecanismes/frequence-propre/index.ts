/**
 * Frequence propre approchee d un element de plancher de batiment, deduite de
 * sa fleche instantanee sous les masses en vibration, comparee a une frequence
 * seuil convenue pour le projet (aptitude au service, vibrations).
 *
 * Unites : mm pour la fleche ; Hz pour les frequences.
 *
 * Premiere generation (EN 1990:2002, A1.4.4(2) et (3), lu sur le texte le
 *   2026-10-19) : la frequence propre doit rester au-dessus d une valeur
 *   appropriee, convenue avec le client ou l autorite competente selon la
 *   fonction du batiment et la source des vibrations ; au-dessous, une analyse
 *   plus fine de la reponse dynamique, amortissement compris, est requise.
 *   Aucune valeur seuil chiffree dans le texte.
 * Niveaux AN-LU (AN-LU:2020, A1.4.2(2), qui renvoie pour les mouvements
 *   synchronises de personnes a la NBN B 03-003:2003, 8 et tableau 6, lus sur
 *   le texte le 2026-10-19) : verification en deux etapes, effets negligeables
 *   si la frequence propre depasse la valeur critique de la destination,
 *   sinon calcul dynamique ; (2 pi n / lambda)^2 = g / f en premiere
 *   approximation, lambda = 1 pour les elements lineaires et lambda = 1,126
 *   pour les dalles ou planchers isostatiques portant dans les deux sens.
 *   Ces deux valeurs sont prudentes au regard de la mecanique (poutre a masse
 *   repartie : 1,126 ; dalle carree simplement appuyee : environ 1,26). La
 *   valeur critique reste saisie.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, 8.4.4, A.1.8.3) : meme
 *   principe retenu par l outil ; clause non relue sur ce point dans la
 *   session du 2026-10-19, a confirmer (docs/verification-texte.md).
 * Choix de l outil : la norme ne donne pas la relation entre fleche et
 *   frequence ; elle vient de la mecanique. n = (lambda / 2 pi) sqrt(g / f) :
 *   lambda = 1 pour une masse concentree sur un ressort sans masse (borne
 *   prudente) ; lambda = pi^2 sqrt(5/384) = 1,126 pour le premier mode d une
 *   poutre isostatique a masse uniformement repartie, f etant sa fleche a mi
 *   portee sous son propre poids vibrant. Le seuil est saisi, jamais
 *   reproduit. Au-dessous du seuil, l outil constate qu une analyse
 *   dynamique est requise, sans la faire.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, nationale, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeFrequencePropre {
  /** Fleche instantanee sous les masses en vibration (mm). */
  f?: number;
  /** Frequence seuil convenue pour le projet (Hz). */
  nlim?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeFrequencePropre>;

/** Acceleration de la pesanteur en mm/s2. */
export const G_MM_S2 = 9810;
/** Masse concentree sur un ressort sans masse. */
export const LAMBDA_CONCENTREE = 1;
/** Poutre isostatique a masse uniformement repartie, premier mode. */
export const LAMBDA_REPARTIE = Math.PI ** 2 * Math.sqrt(5 / 384);

const R = {
  f: { champ: 'f', libelle: 'champ.f-instantanee-vibration' },
  nlim: { champ: 'nlim', libelle: 'champ.n-seuil' },
} as const satisfies Record<string, { champ: keyof EntreeFrequencePropre; libelle: Cle }>;

/** Frequence propre (Hz) pour une fleche f (mm). */
export function frequence(lambda: number, f: number): number {
  positif(f, 'f', 'mm');
  return (lambda / (2 * Math.PI)) * Math.sqrt(G_MM_S2 / f);
}

/** Fleche (mm) qui donne exactement la frequence n (Hz). */
export function flecheLimite(lambda: number, n: number): number {
  positif(n, 'n_lim', 'Hz');
  return G_MM_S2 * (lambda / (2 * Math.PI * n)) ** 2;
}

function calculer(lambda: number, clauses: string[]): (e: Complete) => Calcul {
  return (e) => {
    const n = frequence(lambda, e.f);
    const fLim = flecheLimite(lambda, e.nlim);
    return {
      statut: { etat: 'calcule' },
      sollicitation: e.nlim,
      resistance: n,
      intermediaires: { 'λ': calculee(lambda, '-'), f: saisie(e.f, 'mm'), n: calculee(n, 'Hz'), n_lim: saisie(e.nlim, 'Hz'), 'f pour n_lim': calculee(fLim, 'mm') },
      clauses,
    };
  };
}

/** NBN B 03-003, 8 : lambda des dalles portant dans les deux sens. */
export const LAMBDA_DALLE_NBN = 1.126;

function calculerLu(lambda: number): (e: Complete) => Calcul {
  return (e) => {
    const c = calculer(lambda, ['AN-LU A1.4.2(2)', 'NBN B 03-003 8', 'tableau 6'])(e);
    return { ...c, statut: { etat: 'reserve', motif: 'reserve.an-lu-nbn-b03003' }, intermediaires: { ...c.intermediaires, 'λ': nationale(lambda, '-') } };
  };
}

function niveaux(clause: string, clauses: string[], h: string): DefinitionNiveau<EntreeFrequencePropre>[] {
  const requis = [R.f, R.nlim];
  return [
    { id: 'concentree', ordre: 1, position: 'corps', clause, hypothese: `niveau.freq.${h}.concentree` as Cle, donneesRequises: requis, conditions: () => null, calculer: (e) => calculer(LAMBDA_CONCENTREE, clauses)(e as Complete) },
    { id: 'repartie', ordre: 2, position: 'corps', clause, hypothese: `niveau.freq.${h}.repartie` as Cle, donneesRequises: requis, conditions: () => null, calculer: (e) => calculer(LAMBDA_REPARTIE, clauses)(e as Complete) },
  ];
}

export const frequencePropre: Mecanisme<EntreeFrequencePropre> = {
  id: 'frequence-propre',
  version: '0.1.0',
  titre: 'meca.freq.titre',
  generations: ['en1990-2002', 'en1990-2023'],
  champs: [
    { type: 'nombre', id: 'f', libelle: 'champ.f-instantanee-vibration', symbole: 'f', unite: 'mm' },
    { type: 'nombre', id: 'nlim', libelle: 'champ.n-seuil', symbole: 'n_lim', unite: 'Hz' },
  ],
  sollicitation: { libelle: 'grandeur.frequence-seuil', unite: 'Hz' },
  resistance: { libelle: 'grandeur.frequence-propre', unite: 'Hz' },
  niveaux: {
    'en1990-2002': [
      ...niveaux('A1.4.4', ['A1.4.4(2)', 'A1.4.4(3)'], '2002'),
      { id: 'lu-lineaire', ordre: 3, position: 'corps', clause: 'NBN B 03-003 8', hypothese: 'niveau.freq.2002.lu-lineaire', donneesRequises: [R.f, R.nlim], conditions: () => null, calculer: (e) => calculerLu(LAMBDA_CONCENTREE)(e as Complete) },
      { id: 'lu-dalle', ordre: 4, position: 'corps', clause: 'NBN B 03-003 8', hypothese: 'niveau.freq.2002.lu-dalle', donneesRequises: [R.f, R.nlim], conditions: () => null, calculer: (e) => calculerLu(LAMBDA_DALLE_NBN)(e as Complete) },
    ],
    'en1990-2023': niveaux('A.1.8.3', ['8.4.4', 'A.1.8.3'], '2023'),
  },
};
