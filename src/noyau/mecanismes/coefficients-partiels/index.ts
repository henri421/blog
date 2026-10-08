/**
 * Coefficients partiels des materiaux et resistances de calcul qui en
 * decoulent, valeurs recommandees.
 *
 * Unites : MPa.
 *
 * Premiere generation (2.4.2.4, tableau 2.1N ; 2.4.2.5(2)) : situations durables
 *   et transitoires gamma_c = 1,5, gamma_s = 1,15 ; accidentelles 1,2 et 1,0 ;
 *   pieux coules en place sans tubage : gamma_c multiplie par k_f = 1,1 ;
 *   f_cd = alpha_cc f_ck/gamma_c, alpha_cc = 1,0 (3.1.6(1)).
 * Deuxieme generation (4.3.3, tableau 4.3 ; 4.3.3(4)) : durables et
 *   transitoires gamma_C = 1,5, gamma_S = 1,15, gamma_V = 1,4 ; accidentelles
 *   1,15, 1,0 et 1,15 ; elements coules dans le sol sans tubage permanent :
 *   gamma_C multiplie par k_cip = 1,1 ; f_cd = eta_cc k_tc f_ck/gamma_C (5.1.6).
 * Dans les deux generations, f_yd = f_yk/gamma_S ; la fatigue reprend les
 *   valeurs des situations durables.
 * Choix de l outil : les valeurs reduites de l annexe A (A.2 ; A.3, A.4) ne
 *   sont pas traitees ; le cas k_cip = 1,0 des pieux executes selon les
 *   EN 1536, EN 1538 ou EN 14199 revient a repondre « non ».
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { K_TC_2023, etaCc2023, positif } from '../../materiaux';

export interface EntreeCoefficientsPartiels {
  fck?: number;
  fyk?: number;
  /** 'durable' (durable, transitoire ou fatigue) ou 'accidentelle'. */
  situation?: string;
  /** Element coule dans le sol sans tubage permanent : 'oui' ou 'non'. */
  sansTubage?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeCoefficientsPartiels>;

const R = {
  fck: { champ: 'fck', libelle: 'champ.fck' },
  fyk: { champ: 'fyk', libelle: 'champ.fyk' },
  situation: { champ: 'situation', libelle: 'champ.situation-calcul' },
  sansTubage: { champ: 'sansTubage', libelle: 'champ.sans-tubage' },
} as const satisfies Record<string, { champ: keyof EntreeCoefficientsPartiels; libelle: Cle }>;

const K_SOL = 1.1;

export function coefficients2004(e: Complete): Calcul {
  positif(e.fck, 'fck', 'MPa');
  positif(e.fyk, 'fyk', 'MPa');
  const acc = e.situation === 'accidentelle';
  const kf = e.sansTubage === 'oui' ? K_SOL : 1;
  const gc = (acc ? 1.2 : 1.5) * kf;
  const gs = acc ? 1 : 1.15;
  const fcd = e.fck / gc;
  return {
    statut: { etat: 'calcule' },
    resistance: fcd,
    intermediaires: {
      'γ_c': calculee(gc, '-'),
      k_f: recommandee(kf, '-'),
      'γ_s': recommandee(gs, '-'),
      'α_cc': recommandee(1, '-'),
      f_cd: calculee(fcd, 'MPa'),
      f_yd: calculee(e.fyk / gs, 'MPa'),
    },
    clauses: ['2.4.2.4', 'tableau 2.1N', '2.4.2.5(2)', '3.1.6(1)'],
  };
}

export function coefficients2023(e: Complete): Calcul {
  positif(e.fck, 'fck', 'MPa');
  positif(e.fyk, 'fyk', 'MPa');
  const acc = e.situation === 'accidentelle';
  const kcip = e.sansTubage === 'oui' ? K_SOL : 1;
  const gc = (acc ? 1.15 : 1.5) * kcip;
  const gs = acc ? 1 : 1.15;
  const gv = acc ? 1.15 : 1.4;
  const eta = etaCc2023(e.fck);
  const fcd = (eta * K_TC_2023 * e.fck) / gc;
  return {
    statut: { etat: 'calcule' },
    resistance: fcd,
    intermediaires: {
      'γ_C': calculee(gc, '-'),
      k_cip: recommandee(kcip, '-'),
      'γ_S': recommandee(gs, '-'),
      'γ_V': recommandee(gv, '-'),
      'η_cc': calculee(eta, '-'),
      k_tc: recommandee(K_TC_2023, '-'),
      f_cd: calculee(fcd, 'MPa'),
      f_yd: calculee(e.fyk / gs, 'MPa'),
    },
    clauses: ['4.3.3', 'tableau 4.3', '4.3.3(4)', '5.1.6'],
  };
}

function niveau(gen: '2004' | '2023'): DefinitionNiveau<EntreeCoefficientsPartiels> {
  return {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: gen === '2004' ? '2.4.2.4' : '4.3.3',
    hypothese: gen === '2004' ? 'niveau.cp.2004' : 'niveau.cp.2023',
    donneesRequises: [R.fck, R.fyk, R.situation, R.sansTubage],
    domaine: (e) => ((e.fck as number) > 90 ? 'motif.fck-sup-90' : null),
    conditions: () => null,
    calculer: (e) => (gen === '2004' ? coefficients2004(e as Complete) : coefficients2023(e as Complete)),
  };
}

export const coefficientsPartiels: Mecanisme<EntreeCoefficientsPartiels> = {
  id: 'coefficients-partiels',
  version: '0.1.0',
  titre: 'meca.cp.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    { type: 'nombre', id: 'fyk', libelle: 'champ.fyk', symbole: 'f_yk', unite: 'MPa' },
    {
      type: 'choix',
      id: 'situation',
      libelle: 'champ.situation-calcul',
      options: [
        { valeur: 'durable', libelle: 'option.cp.durable' },
        { valeur: 'accidentelle', libelle: 'option.cp.accidentelle' },
      ],
    },
    {
      type: 'choix',
      id: 'sansTubage',
      libelle: 'champ.sans-tubage',
      options: [
        { valeur: 'non', libelle: 'option.non' },
        { valeur: 'oui', libelle: 'option.oui' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.fcd', unite: 'MPa' },
  niveaux: { 'ec2-2004': [niveau('2004')], 'ec2-2023': [niveau('2023')] },
};
