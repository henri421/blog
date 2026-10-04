import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { lireArticles, pageArticle, pageAccueil } from '../../app/construire/site';
import { calculerMatrice } from '../../src/noyau/moteur/matrice';
import { MECANISMES } from '../../src/noyau/index';
import { ecarts } from '../../src/contenu/exemples';

// Test 9 du cahier des charges, le plus important du projet : chaque chiffre
// qu un article affiche par reference est recalcule par le noyau courant. Un
// article qui afficherait un chiffre que le code ne produit plus fait echouer
// la construction.

const racine = fileURLToPath(new URL('../..', import.meta.url));
const articles = lireArticles(racine);

describe('articles', () => {
  it('le cadrage et les mecanismes sont presents, dans l ordre', () => {
    expect(articles.map((a) => a.slug)).toEqual([
      'cadrage',
      'tranchant-sans-armature',
      'tranchant-avec-armature',
      'poinconnement',
      'fissuration',
      'ancrage',
      'durabilite-enrobage',
      'cisaillement-interfaces',
      'ame-table',
    ]);
  });

  for (const a of articles) {
    describe(a.slug, () => {
      for (const ex of a.exemples) {
        it(`exemple ${ex.nom} : chaque valeur citee est celle du noyau`, () => {
          const m = MECANISMES[ex.mecanisme];
          expect(m, ex.mecanisme).toBeDefined();
          expect(ecarts(ex, calculerMatrice(m, ex.entree))).toEqual([]);
        });
      }

      it('aucune reference non resolue ne subsiste dans le corps de l article', () => {
        expect(a.html).not.toMatch(/\{\{|\}\}/);
        expect(pageArticle(a)).not.toMatch(/undefined|NaN/);
      });

      it('l en-tete de statut cite le texte et son etat d amendement', () => {
        expect(a.entete.texte).toMatch(/EN 1992-1-1:2023/);
        expect(a.entete.texte).toMatch(/amendement/);
        expect(a.entete.historique.length).toBeGreaterThan(0);
      });

      it('publie, l article dit si son etat d amendement est verifie (CDC §2, decision du 2026-10-04)', () => {
        expect(a.entete.statut).toBe('publie');
        expect(a.entete.texte).toMatch(/amendement (non encore verifie|non encore vérifié|vérifié|sans incidence)/);
      });
    });
  }

  it('chaque article de mecanisme embarque au moins un calculateur', () => {
    for (const a of articles.filter((x) => x.slug !== 'cadrage')) expect(a.ilots.length, a.slug).toBeGreaterThan(0);
  });

  it('l accueil liste chaque article', () => {
    const html = pageAccueil(articles);
    for (const a of articles) expect(html).toContain(`./${a.slug}.html`);
  });
});
