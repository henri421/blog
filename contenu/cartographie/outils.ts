/** Constructeurs communs aux cartographies. */

import type { Generation } from '../../src/noyau/model/resultat';
import type { AnnexeRattachee, ClauseCarte, NiveauCarte } from './types';

export function n(generation: Generation, mecanisme: string, niveau: string, clause: string, position: NiveauCarte['position'] = 'corps'): NiveauCarte {
  return { generation, mecanisme, niveau, clause, position };
}

export function c(
  clause: string,
  titre: string,
  correspondance: string[],
  autres: Partial<Omit<ClauseCarte, 'clause' | 'titre' | 'correspondance'>> = {},
): ClauseCarte {
  return { clause, titre, correspondance, perimetre: 'inclus', ingeree: false, verifie: null, ...autres };
}

export const ann = (ref: string, caractere: AnnexeRattachee['caractere']): AnnexeRattachee => ({ ref, caractere });

export const exclu = (motif: string) => ({ perimetre: 'exclu' as const, motifExclusion: motif });

/** Reporte par decision de l auteur du 05/10/2026. */
export const reporte = (motif: string) => ({ perimetre: 'reporte' as const, motifExclusion: motif });
