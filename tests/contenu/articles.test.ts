import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { lireArticles, pageArticle, pageAccueil, pageMotsCles } from '../../app/construire/site';
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
      'poinconnement-arme',
      'fleche',
      'armatures-minimales',
      'materiaux',
      'flexion',
      'pressions-localisees',
      'torsion',
      'ancrage-crochet',
      'elancement',
      'redistribution',
      'imperfections',
      'second-ordre',
      'bielles-tirants',
      'contraintes-service',
      'chainages',
      'espacement-paquets',
      'ancrage-soude-boucle',
      'tete-ancrage',
      'mandrins',
      'fatigue',
      'beton-non-arme',
      'appuis-prefabriques',
      'pretension',
      'encuvement',
      'post-tension',
      'planchers-prefabriques',
      'coefficients-partiels',
      'deversement',
      'largeur-participante',
      'flexion-deviee',
      'fluage-effectif',
      'acier-calcul',
      'analyse-plastique',
      'armature-scellee',
      'precontrainte-tension',
      'integrite-planchers-dalles',
      'efforts-deviation',
      'recouvrements-boucles-tetes',
      'combinaisons-elu',
      'reduction-charges-exploitation',
    ]);
  });

  it('test 13 : chaque article porte au moins un mot-cle et figure dans l index par mot-cle', () => {
    const index = pageMotsCles(articles);
    for (const a of articles) {
      expect(a.entete.motscles.length, a.slug).toBeGreaterThan(0);
      expect(index, a.slug).toContain(`href="./${a.slug}.html"`);
      expect(pageArticle(a)).toContain(`mots-cles.html#${a.entete.motscles[0]}`);
    }
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

      it('aucun caractere de controle, tabulation comprise, dans la page construite', () => {
        // Une commande TeX \tan ou \theta passee par un heredoc devient une tabulation.
        expect(pageArticle(a)).not.toMatch(/[\u0000-\u0008\u0009\u000b\u000c\u000e-\u001f]/);
      });

      it('aucune date ISO visible : format jour/mois/annee (ET7)', () => {
        const visible = pageArticle(a).replace(/<script[\s\S]*?<\/script>/g, '');
        expect(visible).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
        expect(visible).toContain(a.entete.revise.split('-').reverse().join('/'));
      });

      it('aucune reference non resolue ne subsiste dans le corps de l article', () => {
        expect(a.html).not.toMatch(/\{\{|\}\}/);
        expect(pageArticle(a)).not.toMatch(/undefined|NaN/);
      });

      it('l en-tete de statut cite le texte et son etat d amendement', () => {
        // Texte de deuxieme generation cite : EN 1992-1-1:2023 ou une autre partie des Eurocodes.
        expect(a.entete.texte).toMatch(/EN 199\d(-\d+)*:202\d/);
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
