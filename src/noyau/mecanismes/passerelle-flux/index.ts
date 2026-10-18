/**
 * Acceleration verticale d une passerelle sur deux appuis, premier mode
 * vertical, sous le modele harmonique de flux de pietons, a la resonance.
 *
 * Unites : m, kg/m, Hz, N/m2, m/s2.
 *
 * Premiere generation (EN 1990:2002 + A1:2005, A2.4.3.2 ; EN 1991-2:2003, 5.7,
 *   textes non detenus) : pas de modele de charge de flux ; niveau sans
 *   equivalent.
 * Deuxieme generation (EN 1990-1:2023+A1:2026, A.2.9.3.3, annexe H, tableau
 *   H.1 ; EN 1991-2:2023, annexe G, (G.1) a (G.3), tableau G.2) :
 *   p = P_w n' psi_w, P_w = 280 N (vertical) ; n' = 10,8 sqrt(xi n)/S (d < 1),
 *   1,85 sqrt(n)/S (d >= 1), n = d S ; verification si 1,25 <= f <= 2,3 Hz,
 *   voire jusqu a 4,6 Hz (second harmonique).
 * Choix de l outil : mode sinusoidal, masse modale m L/2, force modale
 *   p b 2L/pi, reponse stationnaire a la resonance : a = 2 p b/(pi xi m) ;
 *   psi_w (figure G.2), densite d (tableau G.1) et a_lim (tableau H.1) saisis.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee, saisie } from '../../moteur/grandeurs';
import { positif } from '../../materiaux';

export interface EntreePasserelleFlux {
  f?: number;
  L?: number;
  b?: number;
  m?: number;
  xi?: number;
  d?: number;
  psiw?: number;
  alim?: number;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreePasserelleFlux>;

export const P_W = 280;

const R = {
  f: { champ: 'f', libelle: 'champ.f-propre' },
  L: { champ: 'L', libelle: 'champ.L-passerelle' },
  b: { champ: 'b', libelle: 'champ.b-passerelle' },
  m: { champ: 'm', libelle: 'champ.m-lineique' },
  xi: { champ: 'xi', libelle: 'champ.xi-amortissement' },
  d: { champ: 'd', libelle: 'champ.d-pietons' },
  psiw: { champ: 'psiw', libelle: 'champ.psiw' },
  alim: { champ: 'alim', libelle: 'champ.alim' },
} as const satisfies Record<string, { champ: keyof EntreePasserelleFlux; libelle: Cle }>;

export function nEquivalent(d: number, S: number, xi: number): number {
  const n = d * S;
  return d < 1 ? (10.8 * Math.sqrt(xi * n)) / S : (1.85 * Math.sqrt(n)) / S;
}

export function acceleration(e: Complete): Calcul {
  for (const [v, k] of [
    [e.L, 'L'],
    [e.b, 'b'],
    [e.m, 'm'],
    [e.xi, 'xi'],
    [e.d, 'd'],
    [e.alim, 'alim'],
  ] as const)
    positif(v, k, '-');
  if (!(e.psiw >= 0 && e.psiw <= 1)) throw new Error('psiw doit etre compris entre 0 et 1.');
  const S = e.L * e.b;
  const np = nEquivalent(e.d, S, e.xi);
  const p = P_W * np * e.psiw;
  const a = (2 * p * e.b) / (Math.PI * e.xi * e.m);
  return {
    statut: { etat: 'calcule' },
    sollicitation: a,
    resistance: e.alim,
    intermediaires: { S: calculee(S, 'm²'), n: calculee(e.d * S, '-'), "n'": calculee(np, '1/m²'), P_w: recommandee(P_W, 'N'), 'ψ_w': saisie(e.psiw, '-'), p: calculee(p, 'N/m²'), a_max: calculee(a, 'm/s²') },
    clauses: ['A.2.9.3.3', 'H.4', '(G.1)', '(G.2)', '(G.3)'],
  };
}

const plage = (e: EntreePasserelleFlux): Cle | null => (e.f !== undefined && (e.f < 1.25 || e.f > 4.6) ? 'motif.passerelle-hors-plage' : null);
const requis = [R.f, R.L, R.b, R.m, R.xi, R.d, R.psiw, R.alim];

const niveau2002: DefinitionNiveau<EntreePasserelleFlux> = {
  id: 'flux',
  ordre: 1,
  position: 'corps',
  clause: 'A2.4.3.2',
  hypothese: 'niveau.passerelle.2002',
  donneesRequises: requis,
  conditions: () => 'motif.sans-equivalent-2004',
  calculer: () => {
    throw new Error('Pas de modele de flux en 2003 : jamais calcule.');
  },
};

const niveau2023: DefinitionNiveau<EntreePasserelleFlux> = {
  id: 'flux',
  ordre: 1,
  position: 'annexe-informative',
  reserve: 'reserve.en1991-2-g',
  clause: 'G.4',
  hypothese: 'niveau.passerelle.2023',
  donneesRequises: requis,
  conditions: plage,
  calculer: (e) => acceleration(e as Complete),
};

export const passerelleFlux: Mecanisme<EntreePasserelleFlux> = {
  id: 'passerelle-flux',
  version: '0.1.0',
  titre: 'meca.passerelle.titre',
  generations: ['en1991-2-2003', 'en1991-2-2023'],
  champs: [
    { type: 'nombre', id: 'f', libelle: 'champ.f-propre', symbole: 'f_1', unite: 'Hz' },
    { type: 'nombre', id: 'L', libelle: 'champ.L-passerelle', symbole: 'L', unite: 'm' },
    { type: 'nombre', id: 'b', libelle: 'champ.b-passerelle', symbole: 'b', unite: 'm' },
    { type: 'nombre', id: 'm', libelle: 'champ.m-lineique', symbole: 'm', unite: 'kg/m' },
    { type: 'nombre', id: 'xi', libelle: 'champ.xi-amortissement', symbole: 'ξ', unite: '-' },
    { type: 'nombre', id: 'd', libelle: 'champ.d-pietons', symbole: 'd', unite: 'P/m²' },
    { type: 'nombre', id: 'psiw', libelle: 'champ.psiw', symbole: 'ψ_w', unite: '-' },
    { type: 'nombre', id: 'alim', libelle: 'champ.alim', symbole: 'a_lim', unite: 'm/s²' },
  ],
  sollicitation: { libelle: 'grandeur.acceleration', unite: 'm/s²' },
  resistance: { libelle: 'grandeur.acceleration-limite', unite: 'm/s²' },
  niveaux: { 'en1991-2-2003': [niveau2002], 'en1991-2-2023': [niveau2023] },
};
