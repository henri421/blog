/**
 * Composante de temperature uniforme d un tablier de pont : temperatures
 * extremes du tablier et etendues de contraction et de dilatation.
 *
 * Unites : degres C.
 *
 * Premiere generation (EN 1991-1-5:2003, 6.1.3, figure 6.1, (6.1), (6.2),
 *   texte non detenu, a relire) : T_e,max = T_max + 16 / 4 / 1,5 et
 *   T_e,min = T_min - 3 / + 4 / + 8 (types 1 a 3) ; Delta T_N,con = T_0 -
 *   T_e,min ; Delta T_N,exp = T_e,max - T_0.
 * Deuxieme generation (EN 1991-1-5:2025, 8.1.3, tableau 8.1, (8.1) a (8.6)) :
 *   T_N,max = T'_max + 16 / 4 / 2 ; T_N,min = T'_min - 3 / + 4 / + 8 ;
 *   T'_max = T_max + Delta T_cc,max, T'_min = T_min + Delta T_cc,min ;
 *   Delta T_N,con = T_0 + Delta T_0 - T_N,min ; Delta T_N,exp = T_N,max -
 *   (T_0 - Delta T_0).
 * Choix de l outil : Delta T_0 et Delta T_cc saisis (annexe nationale).
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, saisie } from '../../moteur/grandeurs';

export interface EntreeTemperaturePont {
  /** 'acier', 'mixte' ou 'beton'. */
  type?: string;
  Tmax?: number;
  Tmin?: number;
  T0?: number;
  dT0?: number;
  dTccmax?: number;
  dTccmin?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;

const R = {
  type: { champ: 'type', libelle: 'champ.type-tablier' },
  Tmax: { champ: 'Tmax', libelle: 'champ.Tmax-abri' },
  Tmin: { champ: 'Tmin', libelle: 'champ.Tmin-abri' },
  T0: { champ: 'T0', libelle: 'champ.T0-pont' },
} as const satisfies Record<string, { champ: keyof EntreeTemperaturePont; libelle: Cle }>;

export function ecarts(type: string, gen: '2003' | '2025'): { max: number; min: number } {
  if (type === 'acier') return { max: 16, min: -3 };
  if (type === 'mixte') return { max: 4, min: 4 };
  return { max: gen === '2003' ? 1.5 : 2, min: 8 };
}

function calculer(e: EntreeTemperaturePont, gen: '2003' | '2025', sens: 'con' | 'exp'): Calcul {
  const ec = ecarts(e.type as string, gen);
  const dmax = gen === '2025' ? (e.dTccmax ?? 0) : 0;
  const dmin = gen === '2025' ? (e.dTccmin ?? 0) : 0;
  const d0 = gen === '2025' ? (e.dT0 ?? 0) : 0;
  const TNmax = (e.Tmax as number) + dmax + ec.max;
  const TNmin = (e.Tmin as number) + dmin + ec.min;
  const T0 = e.T0 as number;
  const val = sens === 'con' ? T0 + d0 - TNmin : TNmax - (T0 - d0);
  const inter: Cellule['intermediaires'] = { T_N_max: calculee(TNmax, '°C'), T_N_min: calculee(TNmin, '°C'), T_0: saisie(T0, '°C') };
  if (gen === '2025') inter['ΔT_0'] = saisie(d0, '°C');
  inter[sens === 'con' ? 'ΔT_N,con' : 'ΔT_N,exp'] = calculee(val, '°C');
  return { statut: { etat: 'calcule' }, sollicitation: val, intermediaires: inter, clauses: gen === '2003' ? ['6.1.3.1', '6.1.3.3', 'figure 6.1'] : ['8.1.3', 'tableau 8.1', sens === 'con' ? '(8.5)' : '(8.6)'] };
}

function niveaux(gen: '2003' | '2025'): DefinitionNiveau<EntreeTemperaturePont>[] {
  const requis = [R.type, R.Tmax, R.Tmin, R.T0];
  const clause = gen === '2003' ? '6.1.3.3' : '8.1.3.3';
  return [
    { id: 'contraction', ordre: 1, position: 'corps', clause, hypothese: `niveau.tpont.${gen}.con` as Cle, donneesRequises: requis, conditions: () => null, calculer: (e) => calculer(e, gen, 'con') },
    { id: 'dilatation', ordre: 2, position: 'corps', clause, hypothese: `niveau.tpont.${gen}.exp` as Cle, donneesRequises: requis, conditions: () => null, calculer: (e) => calculer(e, gen, 'exp') },
  ];
}

export const temperaturePont: Mecanisme<EntreeTemperaturePont> = {
  id: 'temperature-pont',
  version: '0.1.0',
  titre: 'meca.tpont.titre',
  generations: ['en1991-1-5-2003', 'en1991-1-5-2025'],
  champs: [
    {
      type: 'choix',
      id: 'type',
      libelle: 'champ.type-tablier',
      options: [
        { valeur: 'acier', libelle: 'option.tablier.acier' },
        { valeur: 'mixte', libelle: 'option.tablier.mixte' },
        { valeur: 'beton', libelle: 'option.tablier.beton' },
      ],
    },
    { type: 'nombre', id: 'Tmax', libelle: 'champ.Tmax-abri', symbole: 'T_max', unite: '°C' },
    { type: 'nombre', id: 'Tmin', libelle: 'champ.Tmin-abri', symbole: 'T_min', unite: '°C' },
    { type: 'nombre', id: 'T0', libelle: 'champ.T0-pont', symbole: 'T_0', unite: '°C' },
    { type: 'nombre', id: 'dT0', libelle: 'champ.dT0', symbole: 'ΔT_0', unite: '°C', facultatif: true },
    { type: 'nombre', id: 'dTccmax', libelle: 'champ.dTccmax', symbole: 'ΔT_cc,max', unite: '°C', facultatif: true },
    { type: 'nombre', id: 'dTccmin', libelle: 'champ.dTccmin', symbole: 'ΔT_cc,min', unite: '°C', facultatif: true },
  ],
  sollicitation: { libelle: 'grandeur.etendue-temperature', unite: '°C' },
  resistance: { libelle: 'grandeur.sans-objet', unite: '-' },
  niveaux: { 'en1991-1-5-2003': niveaux('2003'), 'en1991-1-5-2025': niveaux('2025') },
};
