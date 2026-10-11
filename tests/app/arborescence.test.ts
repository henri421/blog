import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lireArticles, pageAccueil, pageArticle, pageEurocode, pageThematique } from '../../app/construire/site';
import {
  articlesEurocode,
  corpsEurocode,
  filArticle,
  logoPresent,
  rattachement,
  verifierArborescence,
  vignette,
  vignettesThematique,
} from '../../app/construire/arborescence';
import { THEMATIQUES, type Thematique } from '../../contenu/thematiques';
import { EUROCODES } from '../../contenu/cartographie/eurocodes';
import type { Article } from '../../app/construire/article';

const racine = fileURLToPath(new URL('../..', import.meta.url));
const articles = lireArticles(racine);
const th = THEMATIQUES[0];
const en1992 = EUROCODES.find((e) => e.id === 'en1992')!;

describe('arborescence thematique > Eurocode > article (CDC v4 §3, lot 5)', () => {
  it('EF10 : tout article est rattache a un Eurocode d une thematique', () => {
    for (const a of articles) expect(rattachement(a.slug), a.slug).toBeDefined();
    expect(() => verifierArborescence(articles)).not.toThrow();
  });

  it('un article orphelin ou un nom de page pris deux fois fait echouer la construction', () => {
    const orphelin = { ...articles[0], slug: 'orphelin' } as Article;
    expect(() => verifierArborescence([...articles, orphelin])).toThrow(/orphelin/);
    const doublon: Thematique = { ...th, id: 'tranchant-sans-armature' };
    expect(() => verifierArborescence(articles, [doublon])).toThrow(/pris deux fois/);
    const fixe: Thematique = { ...th, id: 'index' };
    expect(() => verifierArborescence(articles, [fixe])).toThrow(/pris deux fois/);
  });

  it('le rattachement se lit dans la cartographie, le cadrage dans les articles generaux', () => {
    expect(rattachement('tranchant-sans-armature')?.eurocode.id).toBe('en1992');
    expect(rattachement('combinaisons-elu')?.eurocode.id).toBe('en1990');
    expect(rattachement('reduction-charges-exploitation')?.eurocode.id).toBe('en1991');
    expect(rattachement('cadrage')?.eurocode.id).toBe('en1992');
    expect(articlesEurocode(en1992)[0]).toBe('cadrage');
    expect(new Set(articlesEurocode(en1992)).size).toBe(articlesEurocode(en1992).length);
  });

  it('les adresses des articles ne changent pas : liens plats ./<slug>.html', () => {
    const html = pageAccueil(articles) + pageThematique(th, articles) + EUROCODES.map((e) => pageEurocode(th, e, articles)).join('');
    for (const lien of html.match(/href="\.\/[^"]+"/g) ?? []) expect(lien).not.toMatch(/href="\.\/[^"]*\/[^"]*\.html/);
    expect(pageAccueil(articles)).toContain('href="./tranchant-sans-armature.html"');
  });

  it('fil d Ariane d un article : accueil, thematique, Eurocode', () => {
    const fil = filArticle('tranchant-sans-armature');
    expect(fil).toContain('href="./index.html"');
    expect(fil).toContain('href="./nouveaux-eurocodes.html">Nouveaux Eurocodes');
    expect(fil).toContain('href="./en1992.html">EN 1992');
    const a = articles.find((x) => x.slug === 'tranchant-sans-armature')!;
    expect(pageArticle(a)).toContain(fil);
  });

  it('niveau 0 : l accueil presente chaque thematique et range les articles par Eurocode', () => {
    const html = pageAccueil(articles);
    for (const t of THEMATIQUES) expect(html).toContain(`href="./${t.id}.html"`);
    for (const e of EUROCODES) expect(html).toContain(`href="./${e.id}.html"`);
    expect(html.indexOf('./en1990.html">EN 1990')).toBeLessThan(html.indexOf('./combinaisons-elu.html'));
    expect(html).not.toContain('<details class="avancement">');
  });

  it('niveau 1 : la thematique porte les vignettes et le tableau d avancement', () => {
    const html = pageThematique(th, articles);
    expect(html.match(/<details class="avancement">/g)).toHaveLength(th.eurocodes.length);
    expect(html.match(/<li class="vignette/g)).toHaveLength(th.eurocodes.length + th.annonces.length);
    expect(html).toContain('EN 1993');
    // Un Eurocode a traiter n a pas de page : sa vignette n a pas de lien.
    expect(html).not.toContain('href="./en1993.html"');
  });

  it('niveau 2 : les clauses dans l ordre de la cartographie, publiees ou annoncees (EF9)', () => {
    const html = corpsEurocode(en1992, articles);
    const clauses = en1992.cartes.flatMap((k) => k.chapitres.flatMap((ch) => ch.clauses));
    let position = -1;
    for (const c of clauses) {
      const i = html.indexOf(`<span class="clause-num">${c.clause}</span>`, position + 1);
      expect(i, c.clause).toBeGreaterThan(position);
      position = i;
    }
    expect(html).toMatch(/<li class="clause publie"><span class="clause-num">8\.2\.2<\/span><span class="clause-titre"><a href="\.\/tranchant-sans-armature\.html">/);
    expect(html).toContain('<li class="clause annonce"><span class="clause-num">8.5.3</span>');
    expect(html).toContain('<li class="clause exclu"><span class="clause-num">6.4</span>');
    expect(html).toContain('href="./cadrage.html"');
  });

  it('vignette : logo fourni s il existe, repli typographique sinon (ET6)', () => {
    for (const e of EUROCODES) expect(logoPresent(e.logo!), e.id).toBe(true);
    for (const e of th.annonces) expect(logoPresent(e.logo!), e.code).toBe(true);
    const avec = vignette(en1992, 'x', { lien: './en1992.html' });
    expect(avec).toContain('<img class="vignette-logo" src="./eurocodes/logos/en1992.svg" alt=""');
    const sans = vignette(en1992, 'x', { lien: './en1992.html', present: () => false });
    expect(sans).not.toContain('<img');
    expect(sans).toContain('<span class="vignette-logo vignette-repli" aria-hidden="true">1992</span>');
    // Le numero et l intitule sont ecrits dans les deux cas.
    for (const h of [avec, sans]) expect(h).toContain('<span class="vignette-code">EN 1992</span><span class="vignette-intitule">Structures en béton</span>');
    expect(vignettesThematique(th, articles, () => false)).not.toContain('<img');
  });

  it('les logos sont les fichiers fournis, sans modification', () => {
    const svg = readFileSync(fileURLToPath(new URL('../../app/public/eurocodes/logos/en1992.svg', import.meta.url)), 'utf8');
    expect(svg).toMatch(/^<\?xml/);
    expect(svg).toContain('<svg');
  });
});
