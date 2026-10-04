/**
 * Declaration et evaluation des niveaux d approximation (CDC §5.3, §5.4).
 *
 * Regles imperatives : aucun niveau n est masque (un niveau non applicable est
 * rendu avec son motif et ses donnees manquantes nommees), aucune valeur par
 * defaut n est substituee a une donnee absente, aucune monotonie n est
 * supposee entre niveaux, et l iteration d un niveau est visible.
 */

import type { Cle } from '../../i18n/cle';
import type { Cellule, Generation, Niveau } from '../model/resultat';

export interface DefinitionNiveau<E> {
  id: Niveau;
  ordre: number;
  clause: string;
  /** Resume de l hypothese du niveau. */
  hypothese: Cle;
  /** Donnees sans lesquelles le niveau est non applicable, chacune nommee. */
  donneesRequises: Array<{ champ: keyof E; libelle: Cle }>;
  /**
   * Domaine couvert par l OUTIL (et non par la norme) : `null` si l entree y
   * est, sinon la cle du motif. Hors de ce domaine, le niveau est
   * `hors-domaine`, jamais calcule par extrapolation.
   */
  domaine?(e: E): Cle | null;
  /** Condition normative d emploi : `null` si satisfaite, sinon la cle du motif. */
  conditions(e: E): Cle | null;
  calculer(e: E): Omit<Cellule, 'generation' | 'niveau'>;
}

/** Une donnee est absente si elle n est pas saisie ou n est pas un nombre fini. */
export function estAbsente(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return true;
  return typeof v === 'number' && !Number.isFinite(v);
}

/**
 * Evalue un niveau sur une entree. L ordre des controles est : donnees
 * manquantes, domaine de l outil, conditions normatives, calcul. Le taux de
 * travail est derive de la sollicitation et de la resistance si le niveau ne
 * le fournit pas.
 */
export function evaluerNiveau<E>(generation: Generation, def: DefinitionNiveau<E>, e: E): Cellule {
  const base = { generation, niveau: def.id, intermediaires: {}, clauses: [def.clause] };
  const manquantes = def.donneesRequises.filter((r) => estAbsente(e[r.champ])).map((r) => r.libelle);
  if (manquantes.length > 0) {
    return { ...base, statut: { etat: 'non-applicable', motif: 'motif.donnees-manquantes', donneesManquantes: manquantes } };
  }
  const horsDomaine = def.domaine?.(e) ?? null;
  if (horsDomaine !== null) return { ...base, statut: { etat: 'hors-domaine', motif: horsDomaine } };
  const condition = def.conditions(e);
  if (condition !== null) {
    return { ...base, statut: { etat: 'non-applicable', motif: condition, donneesManquantes: [] } };
  }
  const r = def.calculer(e);
  const cellule: Cellule = { generation, niveau: def.id, ...r };
  if (
    cellule.statut.etat === 'calcule' &&
    cellule.taux === undefined &&
    cellule.sollicitation !== undefined &&
    cellule.resistance !== undefined &&
    cellule.resistance > 0
  ) {
    cellule.taux = cellule.sollicitation / cellule.resistance;
  }
  return cellule;
}

/** Evalue TOUS les niveaux d une generation, dans leur ordre declare. */
export function evaluerNiveaux<E>(generation: Generation, defs: DefinitionNiveau<E>[], e: E): Cellule[] {
  return [...defs].sort((a, b) => a.ordre - b.ordre).map((d) => evaluerNiveau(generation, d, e));
}
