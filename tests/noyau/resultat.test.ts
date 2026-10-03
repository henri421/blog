import { describe, expect, it } from 'vitest';
import type { Cellule } from '../../src/noyau/model/resultat';
import { estCle } from '../../src/i18n/cle';

// Cellule construite a la main : seul le contrat de forme est teste au lot 0.
const nonApplicable: Cellule = {
  generation: 'ec2-2023',
  niveau: 'fictif-2',
  statut: { etat: 'non-applicable', motif: 'statut.donnees-manquantes', donneesManquantes: ['statut.iterations'] },
  intermediaires: { d: { valeur: 450, unite: 'mm', provenance: 'saisie' } },
  clauses: ['8.2.1'],
};

describe('cellule', () => {
  it('survit a un aller-retour JSON sans perte (CDC ET5)', () => {
    expect(JSON.parse(JSON.stringify(nonApplicable))).toEqual(nonApplicable);
  });

  it('ses motifs sont des cles du dictionnaire', () => {
    const s = nonApplicable.statut;
    if (s.etat !== 'non-applicable') throw new Error('statut inattendu');
    expect(estCle(s.motif)).toBe(true);
    for (const d of s.donneesManquantes) expect(estCle(d)).toBe(true);
  });
});
