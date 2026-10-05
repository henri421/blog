/**
 * Construction du site : une page HTML par article de `contenu/articles/`,
 * et la page d accueil. Appelee par vite.config.ts avant le serveur de
 * developpement et la construction ; les pages produites dans `app/` ne sont
 * pas suivies par Git.
 *
 * Toute chaine d interface vient du dictionnaire (CDC ET3).
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MECANISMES } from '../../src/noyau/index';
import { dateFr, datesFr, t, type Cle } from '../../src/i18n/cle';
import { MOTS_CLES, type MotCle } from '../../contenu/mots-cles';
import { EUROCODES } from '../../contenu/cartographie/eurocodes';
import { rendreAvancement } from './avancement';
import { lireArticle, type Article } from './article';

const URL_SUITE = 'https://henri421.github.io/WebAedificium/';

function echapper(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tete(titre: string): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="theme-color" content="#f7f7f6" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="./icone.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="./icone-192.png" />
    <link rel="stylesheet" href="./src/style.css" />
    <title>${echapper(titre)}</title>
  </head>
  <body>
    <nav class="barre">
      <div class="barre-corps">
        <a class="barre-nom" href="./index.html">${echapper(t('site.titre'))}</a>
        <a class="barre-lien" href="${URL_SUITE}" target="_blank" rel="noopener">${echapper(t('site.suite'))} &#8599;</a>
      </div>
    </nav>`;
}

/** Libelle d un mot-cle ; la compilation verifie que chaque terme a sa cle. */
export function libelleMotCle(m: MotCle): string {
  const cle: Cle = `motcle.${m}`;
  return t(cle);
}

function liensMotsCles(motscles: MotCle[]): string {
  const liens = motscles.map((m) => `<a href="./mots-cles.html#${m}">${echapper(libelleMotCle(m))}</a>`).join(' · ');
  return `<p class="mots-cles"><span>${echapper(t('article.mots-cles'))}</span> ${liens}</p>`;
}

function pied(): string {
  return `
    <footer class="pied"><p>${echapper(t('site.avertissement'))}</p></footer>
    <script type="module" src="./src/page.ts"></script>
  </body>
</html>
`;
}

/** Versions des calculateurs embarques dans l article, citees dans l en-tete de statut. */
function versionsCalculateurs(a: Article): string {
  const ids = [...new Set(a.exemples.filter((e) => a.ilots.includes(e.nom)).map((e) => e.mecanisme))];
  if (ids.length === 0) return t('article.sans-calculateur');
  return ids
    .map((id) => {
      const m = MECANISMES[id];
      if (!m) throw new Error(`Article ${a.slug} : mecanisme ${id} inconnu.`);
      return `${t(m.titre)} v${m.version}`;
    })
    .join(', ');
}

/** En-tete de statut obligatoire (CDC §3.3). */
function enTeteStatut(a: Article): string {
  const e = a.entete;
  const statut = e.statut === 'publie' ? t('article.publie') : t('article.brouillon');
  const lignes: Array<[string, string]> = [
    [t('article.statut'), statut],
    [t('article.texte-reference'), datesFr(e.texte)],
    [t('article.redige'), dateFr(e.redige)],
    [t('article.revise'), dateFr(e.revise)],
    [t('article.annexe-nationale'), t('article.annexe-non-publiee')],
    [t('article.calculateur'), versionsCalculateurs(a)],
  ];
  const dl = lignes.map(([k, v]) => `<dt>${echapper(k)}</dt><dd>${echapper(v)}</dd>`).join('');
  const hist = e.historique.map((h) => `<li>${echapper(datesFr(h))}</li>`).join('');
  return `<section class="statut statut-${e.statut}" aria-label="${echapper(t('article.statut'))}">
        <dl>${dl}</dl>
        <details><summary>${echapper(t('article.historique'))}</summary><ul>${hist}</ul></details>
      </section>`;
}

export function pageArticle(a: Article): string {
  const exemples = JSON.stringify(a.exemples.map(({ nom, mecanisme, entree }) => ({ nom, mecanisme, entree }))).replace(
    /</g,
    '\\u003c',
  );
  return `${tete(`${a.entete.titre} — ${t('site.titre')}`)}
    <main class="article">
      <p class="retour"><a href="./index.html">← ${echapper(t('site.retour'))}</a></p>
      <h1>${echapper(a.entete.titre)}</h1>
      ${enTeteStatut(a)}
      ${liensMotsCles(a.entete.motscles)}
      ${a.html}
    </main>
    <script type="application/json" id="exemples">${exemples}</script>${pied()}`;
}

export function pageAccueil(articles: Article[]): string {
  const cartes = articles
    .map((a) => {
      const pastille = a.entete.statut === 'publie' ? '' : `<span class="pastille">${echapper(t('article.brouillon'))}</span>`;
      return `<li class="carte"><a href="./${a.slug}.html"><span class="carte-titre">${echapper(a.entete.titre)}</span>${pastille}</a>
          <p>${echapper(a.entete.resume)}</p>
          <p class="carte-date">${echapper(t('article.revise'))} ${echapper(dateFr(a.entete.revise))}</p></li>`;
    })
    .join('\n        ');
  const publies = articles.some((a) => a.entete.statut === 'publie');
  return `${tete(t('site.titre'))}
    <main class="accueil">
      <header>
        <h1>${echapper(t('site.titre'))}</h1>
        <p class="sous-titre">${echapper(t('site.sous-titre'))}</p>
        ${publies ? '' : `<p class="avertissement">${echapper(t('site.chantier'))}</p>`}
      </header>
      <p class="retour"><a href="./mots-cles.html">${echapper(t('site.index-mots-cles'))}</a></p>
      <h2>${echapper(t('avancement.titre'))}</h2>
      <p class="note">${echapper(t('avancement.note'))}</p>
      ${EUROCODES.map((e) => rendreAvancement(e.titre, e.cartes, articles)).join('\n      ')}
      <h2>${echapper(t('site.articles'))}</h2>
      <ul class="cartes">
        ${cartes}
      </ul>
    </main>${pied()}`;
}

/** Index par mot-cle, genere a la construction : chaque terme employe, ses articles. */
export function pageMotsCles(articles: Article[]): string {
  const sections = MOTS_CLES.map((m) => {
    const liste = articles.filter((a) => a.entete.motscles.includes(m));
    if (liste.length === 0) return '';
    const items = liste.map((a) => `<li><a href="./${a.slug}.html">${echapper(a.entete.titre)}</a></li>`).join('');
    return `<section id="${m}"><h2>${echapper(libelleMotCle(m))}</h2><ul>${items}</ul></section>`;
  }).join('\n      ');
  return `${tete(`${t('site.index-mots-cles')} — ${t('site.titre')}`)}
    <main class="article">
      <p class="retour"><a href="./index.html">← ${echapper(t('site.retour'))}</a></p>
      <h1>${echapper(t('site.index-mots-cles'))}</h1>
      ${sections}
    </main>${pied()}`;
}

/** Lit tous les articles, tries par ordre, slug tire du nom de fichier (`01-tranchant.md` : `tranchant`). */
export function lireArticles(racine: string): Article[] {
  const dossier = join(racine, 'contenu', 'articles');
  return readdirSync(dossier)
    .filter((f) => f.endsWith('.md'))
    .map((f) => lireArticle(f.replace(/^\d+-/, '').replace(/\.md$/, ''), readFileSync(join(dossier, f), 'utf8')))
    .sort((a, b) => a.entete.ordre - b.entete.ordre);
}

/** Ecrit les pages dans `app/` et rend leurs chemins, entree de la construction Vite. */
export function construireSite(racine: string): Record<string, string> {
  const articles = lireArticles(racine);
  const pages: Record<string, string> = {};
  const ecrire = (nom: string, html: string): void => {
    const chemin = join(racine, 'app', `${nom}.html`);
    writeFileSync(chemin, html, 'utf8');
    pages[nom] = chemin;
  };
  ecrire('index', pageAccueil(articles));
  ecrire('mots-cles', pageMotsCles(articles));
  for (const a of articles) ecrire(a.slug, pageArticle(a));
  return pages;
}
