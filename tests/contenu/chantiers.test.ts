import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { EUROCODES } from '../../contenu/cartographie/eurocodes';
import { EN1992 } from '../../contenu/cartographie/en1992';
import { lireArticles, pageAccueil, pageArticle, pageChantiers } from '../../app/construire/site';
import { lacunes } from '../../app/construire/avancement';
import { chantiers, chantiersVerification } from '../../app/construire/chantiers';
import { avecNiveauFictif } from './carte-fictive';

// Suivi des chantiers : decision de l auteur du 05/10/2026, a la place du
// retour en brouillon des articles incomplets ou non verifies (CDC v4 §5.1, §9).

const racine = fileURLToPath(new URL('../..', import.meta.url));
const articles = lireArticles(racine);
const liste = chantiers(racine, EUROCODES, articles);

describe('suivi des chantiers', () => {
  it('identifiants uniques, dates ISO, articles existants', () => {
    expect(new Set(liste.map((c) => c.id)).size).toBe(liste.length);
    const slugs = new Set(articles.map((a) => a.slug));
    for (const c of liste) {
      expect(c.ouvert, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const s of c.articles) expect(slugs.has(s), `${c.id} ${s}`).toBe(true);
    }
  });

  it('chaque niveau manquant (test 15) est un chantier de son article', () => {
    // Carte modifiee : un niveau fictif garantit au moins un manque a suivre.
    const carte = avecNiveauFictif();
    const eurocodes = EUROCODES.map((e) => (e.id === 'en1992' ? { ...e, cartes: [carte] } : e));
    const fictive = chantiers(racine, eurocodes, articles);
    const manquants = lacunes(carte, articles);
    expect(manquants.length).toBeGreaterThan(0);
    for (const m of manquants) {
      const clause = m.split(' ')[0];
      expect(fictive.some((c) => c.nature === 'niveau-manquant' && c.id === `en1992-${clause}-niveaux`), m).toBe(true);
    }
    expect(pageChantiers(articles, fictive)).toContain('Niveaux de calcul pas encore rendus');
    // Sur la cartographie reelle, la liste suit exactement les lacunes.
    expect(liste.filter((c) => c.nature === 'niveau-manquant').length).toBe(lacunes(EN1992, articles).length);
  });

  it('aucun article n est en brouillon : les manques sont suivis, pas depublies', () => {
    for (const a of articles) expect(a.entete.statut, a.slug).toBe('publie');
  });

  it('l article concerne affiche son encadre, sans repeter la verification ILNAS', () => {
    const tsa = articles.find((a) => a.slug === 'tranchant-sans-armature')!;
    const html = pageArticle(tsa, liste);
    expect(html).toContain('class="chantiers-article"');
    expect(html).toContain('I.8.3.1');
    expect(html).not.toContain('auprès de l’ILNAS</strong>');
  });

  it('les points non coches de la verification sur le texte sont rattaches a leur article', () => {
    const v = chantiersVerification('## Fissuration (9.2.3)\n\n- [x] fait\n- [ ] Largeur b_c,eff\n  a confirmer.\n', EUROCODES);
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ articles: ['fissuration'], detail: 'Largeur b_c,eff a confirmer.' });
  });

  it('la page de suivi et le lien de l accueil comptent les chantiers', () => {
    expect(pageChantiers(articles, liste)).toContain('Réserves sur le contenu');
    expect(pageAccueil(articles, liste)).toContain(`chantiers.html">Suivi des chantiers (${liste.length})`);
  });
});
