/**
 * Proprietes de calcul du beton dans les deux generations.
 *
 * Unites : MPa.
 *
 * Premiere generation (3.1.2, tableau 3.1 ; 3.1.6) :
 *   f_cd = alpha_cc f_ck / gamma_c, alpha_cc = 1,0 ;
 *   f_ctd = alpha_ct f_ctk,0,05 / gamma_c, alpha_ct = 1,0 ;
 *   E_cm = 22 000 (f_cm/10)^0,3.
 * Deuxieme generation (5.1.3, tableau 5.1 ; 5.1.4 ; 5.1.6) :
 *   f_cd = eta_cc k_tc f_ck / gamma_C, eta_cc = (40/f_ck)^(1/3) <= 1,
 *   k_tc = 1,00 si la charge de calcul n est pas attendue avant 3 mois
 *   (classes CR et CN, t_ref <= 28 j), 0,85 sinon ;
 *   f_ctd = k_tt f_ctk,0,05 / gamma_C, k_tt = 0,80 (classes CR et CN,
 *   t_ref <= 28 j, hypothese de l outil) ;
 *   E_cm = 9500 f_cm^(1/3) (granulats quartzitiques).
 *
 * Le mecanisme ne compare pas une sollicitation a une resistance : la
 * cellule rend f_cd comme grandeur principale, les autres en detail.
 */

import type { Cle } from '../../../i18n/cle';
import type { Cellule } from '../../model/resultat';
import type { Mecanisme } from '../../moteur/mecanisme';
import type { DefinitionNiveau } from '../../moteur/niveaux';
import { calculee, recommandee } from '../../moteur/grandeurs';
import { GAMMA_C_2004, GAMMA_C_2023, ecm2004, ecm2023, etaCc2023, fctm2004, fctm2023, positif } from '../../materiaux';

export interface EntreeMateriaux {
  fck?: number;
  /** 'oui' si la charge de calcul n est pas attendue avant 3 mois. */
  chargeTardive?: string;
}

type Calcul = Omit<Cellule, 'generation' | 'niveau'>;
type Complete = Required<EntreeMateriaux>;

const R = {
  fck: { champ: 'fck', libelle: 'champ.fck' },
  chargeTardive: { champ: 'chargeTardive', libelle: 'champ.chargeTardive' },
} as const satisfies Record<string, { champ: keyof EntreeMateriaux; libelle: Cle }>;

function domaine(e: EntreeMateriaux): Cle | null {
  return (e.fck as number) > 90 ? 'motif.fck-sup-90' : null;
}

export function materiaux2004(e: Complete): Calcul {
  positif(e.fck, 'fck', 'MPa');
  const fcd = e.fck / GAMMA_C_2004;
  const fctm = fctm2004(e.fck);
  const fctd = (0.7 * fctm) / GAMMA_C_2004;
  return {
    statut: { etat: 'calcule' },
    resistance: fcd,
    intermediaires: {
      'α_cc': recommandee(1, '-'),
      f_cd: calculee(fcd, 'MPa'),
      f_ctm: calculee(fctm, 'MPa'),
      'α_ct': recommandee(1, '-'),
      f_ctd: calculee(fctd, 'MPa'),
      E_cm: calculee(ecm2004(e.fck), 'MPa'),
    },
    clauses: ['3.1.6', '(3.15)', '(3.16)', 'tableau 3.1'],
  };
}

export function materiaux2023(e: Complete): Calcul {
  positif(e.fck, 'fck', 'MPa');
  const eta = etaCc2023(e.fck);
  const ktc = e.chargeTardive === 'oui' ? 1 : 0.85;
  const fcd = (eta * ktc * e.fck) / GAMMA_C_2023;
  const fctm = fctm2023(e.fck);
  const ktt = 0.8;
  const fctd = (ktt * 0.7 * fctm) / GAMMA_C_2023;
  return {
    statut: { etat: 'calcule' },
    resistance: fcd,
    intermediaires: {
      'η_cc': calculee(eta, '-'),
      k_tc: recommandee(ktc, '-'),
      f_cd: calculee(fcd, 'MPa'),
      f_ctm: calculee(fctm, 'MPa'),
      k_tt: recommandee(ktt, '-'),
      f_ctd: calculee(fctd, 'MPa'),
      E_cm: calculee(ecm2023(e.fck), 'MPa'),
    },
    clauses: ['5.1.6', '(5.3)', '(5.4)', '(5.5)', 'tableau 5.1', '(5.1)'],
  };
}

const niveaux2004: DefinitionNiveau<EntreeMateriaux>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '3.1.6',
    hypothese: 'niveau.mat.2004.base',
    donneesRequises: [R.fck],
    domaine,
    conditions: () => null,
    calculer: (e) => materiaux2004(e as Complete),
  },
];

const niveaux2023: DefinitionNiveau<EntreeMateriaux>[] = [
  {
    id: 'base',
    ordre: 1,
    position: 'corps',
    clause: '5.1.6',
    hypothese: 'niveau.mat.2023.base',
    donneesRequises: [R.fck, R.chargeTardive],
    domaine,
    conditions: () => null,
    calculer: (e) => materiaux2023(e as Complete),
  },
];

export const materiauxBeton: Mecanisme<EntreeMateriaux> = {
  id: 'materiaux',
  version: '0.1.0',
  titre: 'meca.mat.titre',
  champs: [
    { type: 'nombre', id: 'fck', libelle: 'champ.fck', symbole: 'f_ck', unite: 'MPa' },
    {
      type: 'choix',
      id: 'chargeTardive',
      libelle: 'champ.chargeTardive',
      options: [
        { valeur: 'non', libelle: 'option.non' },
        { valeur: 'oui', libelle: 'option.oui' },
      ],
    },
  ],
  sollicitation: { libelle: 'grandeur.sans-objet', unite: '-' },
  resistance: { libelle: 'grandeur.fcd', unite: 'MPa' },
  niveaux: { 'ec2-2004': niveaux2004, 'ec2-2023': niveaux2023 },
};
