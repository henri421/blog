import { describe, expect, it } from 'vitest';
import { fr } from '../../src/i18n/fr';
import { dateFr, datesFr, estCle, t, type Dictionnaire } from '../../src/i18n/cle';

describe('dictionnaire', () => {
  it('aucune entree vide', () => {
    for (const [cle, texte] of Object.entries(fr)) expect(texte.trim(), cle).not.toBe('');
  });

  it('estCle reconnait une cle et refuse une phrase libre', () => {
    expect(estCle('statut.non-applicable')).toBe(true);
    expect(estCle('Niveau non applicable')).toBe(false);
    // Une propriete heritee d Object n est pas une cle.
    expect(estCle('toString')).toBe(false);
  });

  it('t lit le dictionnaire actif, francais par defaut', () => {
    expect(t('statut.donnees-manquantes')).toBe('Données manquantes');
    const autre: Dictionnaire = { ...fr, 'statut.calcule': 'Computed' };
    expect(t('statut.calcule', autre)).toBe('Computed');
  });

  it('un libelle de statut existe pour chaque etat', () => {
    for (const etat of ['calcule', 'non-applicable', 'non-convergent', 'hors-domaine', 'reserve']) {
      expect(estCle(`statut.${etat}`), etat).toBe(true);
    }
  });

  it('dates au format europeen (ET7)', () => {
    expect(dateFr('2027-02-28')).toBe('28/02/2027');
    expect(datesFr('vérifié le 2026-10-04 ; revu le 2026-10-05')).toBe('vérifié le 04/10/2026 ; revu le 05/10/2026');
    expect(() => dateFr('28/02/2027')).toThrow();
  });
});
