/**
 * Courbes de feu nominales et flux thermique net sur une surface exposee.
 *
 * Unites : min, degres C, W/m2 (resultat en kW/m2).
 *
 * Premiere generation (EN 1991-1-2:2002, 3.1, 3.2, (3.1) a (3.6), texte non
 *   detenu, a relire) et deuxieme generation (EN 1991-1-2:2024, 5.1, 5.2,
 *   (5.1) a (5.6)) : memes expressions.
 *   Normalisee : Theta_g = 20 + 345 log10(8 t + 1), alpha_c = 25 ;
 *   exterieure : Theta_g = 660 (1 - 0,687 e^-0,32t - 0,313 e^-3,8t) + 20,
 *   alpha_c = 25 ; hydrocarbures : Theta_g = 1080 (1 - 0,325 e^-0,167t -
 *   0,675 e^-2,5t) + 20, alpha_c = 50 ;
 *   h_net = alpha_c (Theta_g - Theta_m) + Phi eps_m eps_f sigma
 *   [(Theta_r + 273)^4 - (Theta_m + 273)^4], eps_m = 0,8, eps_f = 1,0.
 * Choix de l outil : Phi = 1, Theta_r = Theta_g.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreeFeuNominal {
  courbe?: string;
  t?: number;
  thetam?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

export const SIGMA = 5.67e-8;

const R = {
  courbe: { champ: 'courbe', libelle: 'champ.courbe-feu' },
  t: { champ: 't', libelle: 'champ.t-feu' },
  thetam: { champ: 'thetam', libelle: 'champ.theta-surface' },
} as const satisfies Record<string, { champ: keyof EntreeFeuNominal; libelle: Cle }>;

export function thetaG(courbe: string, t: number): number {
  if (courbe === 'exterieure') return 660 * (1 - 0.687 * Math.exp(-0.32 * t) - 0.313 * Math.exp(-3.8 * t)) + 20;
  if (courbe === 'hydrocarbures') return 1080 * (1 - 0.325 * Math.exp(-0.167 * t) - 0.675 * Math.exp(-2.5 * t)) + 20;
  return 20 + 345 * Math.log10(8 * t + 1);
}

export function alphaC(courbe: string): number {
  return courbe === 'hydrocarbures' ? 50 : 25;
}

export function flux(e: EntreeFeuNominal, clauses: string[]): Calcul {
  const t = e.t as number;
  positif(t, 't', 'min');
  const tm = e.thetam as number;
  if (!(tm >= 0 && tm < 1500)) throw new Error('thetam doit etre compris entre 0 et 1500.');
  const c = e.courbe as string;
  const tg = thetaG(c, t);
  const ac = alphaC(c);
  const hc = ac * (tg - tm);
  const hr = 1 * 0.8 * 1.0 * SIGMA * ((tg + 273) ** 4 - (tm + 273) ** 4);
  const h = (hc + hr) / 1000;
  return {
    statut: { etat: 'calcule' },
    sollicitation: h,
    intermediaires: { 'Θ_g': calculee(tg, '°C'), 'Θ_m': saisie(tm, '°C'), 'α_c': recommandee(ac, 'W/(m²K)'), 'h_net,c': calculee(hc / 1000, 'kW/m²'), 'h_net,r': calculee(hr / 1000, 'kW/m²'), h_net: calculee(h, 'kW/m²') },
    clauses,
  };
}

function niveau(clause: string, hypothese: Cle, clauses: string[]): DefinitionNiveau<EntreeFeuNominal> {
  return { id: 'flux', ordre: 1, position: 'corps', clause, hypothese, donneesRequises: [R.courbe, R.t, R.thetam], conditions: () => null, calculer: (e) => flux(e, clauses) };
}

export const feuNominal: Mecanisme<EntreeFeuNominal> = {
  id: 'feu-nominal',
  version: '0.1.0',
  titre: 'meca.feu.titre',
  generations: ['en1991-1-2-2002', 'en1991-1-2-2024'],
  champs: [
    {
      type: 'choix',
      id: 'courbe',
      libelle: 'champ.courbe-feu',
      options: [
        { valeur: 'normalisee', libelle: 'option.courbe-feu.normalisee' },
        { valeur: 'exterieure', libelle: 'option.courbe-feu.exterieure' },
        { valeur: 'hydrocarbures', libelle: 'option.courbe-feu.hydrocarbures' },
      ],
    },
    { type: 'nombre', id: 't', libelle: 'champ.t-feu', symbole: 't', unite: 'min' },
    { type: 'nombre', id: 'thetam', libelle: 'champ.theta-surface', symbole: 'Θ_m', unite: '°C' },
  ],
  sollicitation: { libelle: 'grandeur.flux-net', unite: 'kW/m²' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: {
    'en1991-1-2-2002': [niveau('3.2', 'niveau.feu.2002', ['3.1', '3.2', '(3.1) à (3.6)'])],
    'en1991-1-2-2024': [niveau('5.2', 'niveau.feu.2024', ['5.1', '5.2', '(5.1) à (5.6)'])],
  },
};
