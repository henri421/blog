import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { flecheLimite, frequence, frequencePropre, LAMBDA_REPARTIE } from '../../../src/noyau/mecanismes/frequence-propre/index';

// Valeurs attendues calculees a la main (docs/validation/frequence-propre.md).

const bureau = { f: 12, nlim: 3.5 };
const cel = (e: object, g: string, n: string) => calculerMatrice(frequencePropre, e).cellules.find((c) => c.generation === g && c.niveau === n)!;

describe('frequence propre des planchers (EN 1990, vibrations)', () => {
  it('lambda de la poutre a masse repartie : pi^2 sqrt(5/384) = 1,12621', () => {
    expect(LAMBDA_REPARTIE).toBeCloseTo(1.126209, 6);
  });

  it('f = 12 mm : 4,5506 Hz (masse concentree), 5,1249 Hz (masse repartie)', () => {
    for (const g of ['en1990-2002', 'en1990-2023']) {
      expect(cel(bureau, g, 'concentree').resistance).toBeCloseTo(4.550551, 5);
      expect(cel(bureau, g, 'repartie').resistance).toBeCloseTo(5.124873, 5);
    }
  });

  it('seuil de 3,5 Hz satisfait : taux 0,769', () => {
    const c = cel(bureau, 'en1990-2002', 'concentree');
    expect(c.statut.etat).toBe('calcule');
    expect(c.taux).toBeCloseTo(0.769138, 5);
  });

  it('seuil de 7 Hz non satisfait : taux 1,538, analyse dynamique requise', () => {
    const c = cel({ f: 12, nlim: 7 }, 'en1990-2002', 'concentree');
    expect(c.taux).toBeCloseTo(1.538275, 5);
    expect(c.taux! > 1).toBe(true);
  });

  it('controle inverse : 3,5 Hz pour f = 20,28 mm, 7 Hz pour f = 5,07 mm', () => {
    expect(flecheLimite(1, 3.5)).toBeCloseTo(20.2849, 3);
    expect(flecheLimite(1, 7)).toBeCloseTo(5.0712, 3);
    expect(frequence(1, flecheLimite(1, 7))).toBeCloseTo(7, 10);
  });

  it('fleche nulle ou negative : erreur nommee', () => {
    expect(() => frequence(1, 0)).toThrow(/f doit etre/);
    expect(() => flecheLimite(1, -1)).toThrow(/n_lim doit etre/);
  });

  it('donnee manquante : niveau non applicable, jamais masque', () => {
    const c = cel({ f: 12 }, 'en1990-2023', 'repartie');
    expect(c.statut.etat).toBe('non-applicable');
  });
});
