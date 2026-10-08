/**
 * Post-tension : espacement libre des gaines et rayon de courbure minimal des
 * armatures de precontrainte.
 *
 * Unites : mm, mm2, MPa.
 *
 * Espacement libre minimal des gaines, identique dans les deux generations
 *   (figure 8.15 ; figure 11.16) : horizontal c_sx >= max(D_upper + 5 mm ;
 *   phi_duct ; 50 mm), vertical c_sy >= max(D_upper ; phi_duct ; 40 mm).
 * Rayon de courbure minimal, deuxieme generation seulement (11.6.3(2)) :
 *   R_min = sigma_pd racine(A_p) / p_Rd (11.23), p_Rd lue dans le tableau 11.4
 *   (NDP) et saisie ; la premiere generation renvoie aux agrements.
 * Choix de l outil : la reduction de l espacement vertical avec armatures
 *   transversales (11.6.2(1)) et l espacement des paquets (s >= 100 mm,
 *   11.6.2(2)) ne sont pas traites.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreePostTension {
  /** Diametre exterieur de la gaine (mm). */
  phiDuct?: number;
  Dupper?: number;
  /** Espacements libres prevus, horizontal et vertical (mm). */
  csx?: number;
  csy?: number;
  /** Contrainte de calcul a la mise en tension (MPa) et aire de l armature (mm2). */
  sigmaPd?: number;
  Ap?: number;
  /** Pression transversale maximale lue dans le tableau 11.4 (MPa). */
  pRd?: number;
  /** Rayon de courbure prevu (mm). */
  rPrevu?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePostTension>;

const R = {
  phiDuct: { champ: 'phiDuct', libelle: 'champ.phiDuct' },
  Dupper: { champ: 'Dupper', libelle: 'champ.Dupper' },
  csx: { champ: 'csx', libelle: 'champ.csx-gaine' },
  csy: { champ: 'csy', libelle: 'champ.csy-gaine' },
  sigmaPd: { champ: 'sigmaPd', libelle: 'champ.sigmaPd-tension' },
  Ap: { champ: 'Ap', libelle: 'champ.Ap' },
  pRd: { champ: 'pRd', libelle: 'champ.pRd' },
  rPrevu: { champ: 'rPrevu', libelle: 'champ.r-prevu' },
} as const satisfies Record<string, { champ: keyof EntreePostTension; libelle: Cle }>;

export function espacementGaines(e: Complete, sens: 'horizontal' | 'vertical', clause: string): Calcul {
  positif(e.phiDuct, 'phi_duct', 'mm');
  positif(e.Dupper, 'D_upper', 'mm');
  const prevu = sens === 'horizontal' ? e.csx : e.csy;
  positif(prevu, 'c_s prevu', 'mm');
  const granulat = sens === 'horizontal' ? e.Dupper + 5 : e.Dupper;
  const plancher = sens === 'horizontal' ? 50 : 40;
  const min = Math.max(granulat, e.phiDuct, plancher);
  return {
    statut: { etat: 'calcule' },
    sollicitation: min,
    resistance: prevu,
    intermediaires: {
      [sens === 'horizontal' ? 'D_upper + 5' : 'D_upper']: calculee(granulat, 'mm'),
      φ_duct: saisie(e.phiDuct, 'mm'),
      plancher: recommandee(plancher, 'mm'),
      'c_s,min': calculee(min, 'mm'),
    },
    clauses: [clause],
  };
}

export function rayonMinimal(e: Complete): Calcul {
  positif(e.sigmaPd, 'sigma_pd', 'MPa');
  positif(e.Ap, 'A_p', 'mm2');
  positif(e.pRd, 'p_Rd', 'MPa');
  positif(e.rPrevu, 'R prevu', 'mm');
  const rmin = (e.sigmaPd * Math.sqrt(e.Ap)) / e.pRd;
  return {
    statut: { etat: 'calcule' },
    sollicitation: rmin,
    resistance: e.rPrevu,
    intermediaires: { '√A_p': calculee(Math.sqrt(e.Ap), 'mm'), p_Rd: saisie(e.pRd, 'MPa'), R_min: calculee(rmin, 'mm') },
    clauses: ['11.6.3(2)', '(11.23)', 'tableau 11.4'],
  };
}

function niveauxEspacement(gen: '2004' | '2023'): DefinitionNiveau<EntreePostTension>[] {
  const fig = gen === '2004' ? 'figure 8.15' : 'figure 11.16';
  return (['horizontal', 'vertical'] as const).map((sens, i) => ({
    id: `espacement-${sens}`,
    ordre: i + 1,
    position: 'corps' as const,
    clause: gen === '2004' ? '8.10.1.3' : '11.6.2',
    hypothese: `niveau.pst.espacement-${sens}` as Cle,
    donneesRequises: [R.phiDuct, R.Dupper, sens === 'horizontal' ? R.csx : R.csy],
    conditions: () => null,
    calculer: (e: EntreePostTension) => espacementGaines(e as Complete, sens, fig),
  }));
}

export const postTension: Mecanisme<EntreePostTension> = {
  id: 'post-tension',
  version: '0.1.0',
  titre: 'meca.pst.titre',
  champs: [
    { type: 'nombre', id: 'phiDuct', libelle: 'champ.phiDuct', symbole: 'φ_duct', unite: 'mm' },
    { type: 'nombre', id: 'Dupper', libelle: 'champ.Dupper', symbole: 'D_upper', unite: 'mm' },
    { type: 'nombre', id: 'csx', libelle: 'champ.csx-gaine', symbole: 'c_sx', unite: 'mm' },
    { type: 'nombre', id: 'csy', libelle: 'champ.csy-gaine', symbole: 'c_sy', unite: 'mm' },
    { type: 'nombre', id: 'sigmaPd', libelle: 'champ.sigmaPd-tension', symbole: 'σ_pd', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'Ap', libelle: 'champ.Ap', symbole: 'A_p', unite: 'mm²', facultatif: true },
    { type: 'nombre', id: 'pRd', libelle: 'champ.pRd', symbole: 'p_Rd', unite: 'MPa', facultatif: true },
    { type: 'nombre', id: 'rPrevu', libelle: 'champ.r-prevu', symbole: 'R', unite: 'mm', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.minimum-requis', unite: 'mm' },
  resistance: { libelle: 'grandeur.valeur-prevue', unite: 'mm' },
  niveaux: {
    'ec2-2004': [
      ...niveauxEspacement('2004'),
      {
        id: 'rayon',
        ordre: 3,
        position: 'corps',
        clause: '8.10.1.3',
        hypothese: 'niveau.pst.2004.rayon',
        donneesRequises: [],
        conditions: () => 'motif.sans-equivalent-2004',
        calculer: () => {
          throw new Error('Niveau sans equivalent : jamais calcule.');
        },
      },
    ],
    'ec2-2023': [
      ...niveauxEspacement('2023'),
      {
        id: 'rayon',
        ordre: 3,
        position: 'corps',
        clause: '11.6.3',
        hypothese: 'niveau.pst.2023.rayon',
        donneesRequises: [R.sigmaPd, R.Ap, R.pRd, R.rPrevu],
        conditions: () => null,
        calculer: (e) => rayonMinimal(e as Complete),
      },
    ],
  },
};
