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
import { EUROCODES, type Eurocode } from '../../contenu/cartographie/eurocodes';
import { THEMATIQUES, type Thematique } from '../../contenu/thematiques';
import { corpsEurocode, filAriane, filArticle, sommaireThematique, verifierArborescence, vignette, vignettesThematique, etatTexte } from './arborescence';
import { rendreAvancement } from './avancement';
import { chantiers as listerChantiers, encadreChantiers, rendreChantiers } from './chantiers';
import type { Chantier } from '../../contenu/chantiers';
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
        <span class="barre-menu" aria-label="${echapper(t('nav.thematiques'))}">${THEMATIQUES.map(
          (th) => `<a class="barre-lien" href="./${th.id}.html">${echapper(th.titre)}</a>`,
        ).join(' ')}</span>
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
    <footer class="pied"><p>${echapper(t('site.avertissement'))} <a href="./avertissement.html">${echapper(t('avertissement.lien'))}</a></p></footer>
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

export function pageArticle(a: Article, chantiers: Chantier[] = []): string {
  const exemples = JSON.stringify(a.exemples.map(({ nom, mecanisme, entree }) => ({ nom, mecanisme, entree }))).replace(
    /</g,
    '\\u003c',
  );
  return `${tete(`${a.entete.titre} — ${t('site.titre')}`)}
    <main class="article">
      ${filArticle(a.slug)}
      <h1>${echapper(a.entete.titre)}</h1>
      ${enTeteStatut(a)}
      ${liensMotsCles(a.entete.motscles)}
      ${encadreChantiers(a.slug, chantiers)}
      ${a.html}
    </main>
    <script type="application/json" id="exemples">${exemples}</script>${pied()}`;
}

/** Fiche d un article dans un sommaire. */
function carteArticle(a: Article): string {
  const pastille = a.entete.statut === 'publie' ? '' : `<span class="pastille">${echapper(t('article.brouillon'))}</span>`;
  return `<li class="carte"><a href="./${a.slug}.html"><span class="carte-titre">${echapper(a.entete.titre)}</span>${pastille}</a>
          <p>${echapper(a.entete.resume)}</p>
          <p class="carte-date">${echapper(t('article.revise'))} ${echapper(dateFr(a.entete.revise))}</p></li>`;
}

/**
 * Accueil, niveau 0 (CDC v4 §3) : les thematiques, chacune avec ses
 * vignettes d Eurocode et le sommaire de ses articles, range par Eurocode.
 */
export function pageAccueil(articles: Article[], chantiers: Chantier[] = []): string {
  const publies = articles.some((a) => a.entete.statut === 'publie');
  const thematiques = THEMATIQUES.map(
    (th) => `<section class="thematique" id="${th.id}">
      <h2><a href="./${th.id}.html">${echapper(th.titre)}</a></h2>
      <p>${echapper(th.resume)}</p>
      ${vignettesThematique(th, articles)}
      <p class="retour"><a href="./${th.id}.html#avancement">${echapper(t('thematique.avancement'))}</a></p>
      <h2>${echapper(t('site.articles'))}</h2>
      ${sommaireThematique(th, articles, carteArticle)}
      </section>`,
  ).join('\n      ');
  return `${tete(t('site.titre'))}
    <main class="accueil">
      <header>
        <h1>${echapper(t('site.titre'))}</h1>
        <p class="sous-titre">${echapper(t('site.sous-titre'))}</p>
        ${publies ? '' : `<p class="avertissement">${echapper(t('site.chantier'))}</p>`}
      </header>
      <p class="retour"><a href="./mots-cles.html">${echapper(t('site.index-mots-cles'))}</a> · <a href="./chantiers.html">${echapper(t('chantiers.titre'))} (${chantiers.length})</a></p>
      ${thematiques}
    </main>${pied()}`;
}

/**
 * Page d une thematique, niveau 1 (CDC v4 §3) : vignettes des Eurocodes
 * traites ou a traiter, puis le tableau d avancement (§6).
 */
export function pageThematique(th: Thematique, articles: Article[]): string {
  return `${tete(`${th.titre} — ${t('site.titre')}`)}
    <main class="accueil">
      ${filAriane([{ libelle: th.titre }])}
      <h1>${echapper(th.titre)}</h1>
      <p class="sous-titre">${echapper(th.resume)}</p>
      <h2>${echapper(t('thematique.eurocodes'))}</h2>
      ${vignettesThematique(th, articles)}
      <h2 id="avancement">${echapper(t('avancement.titre'))}</h2>
      <p class="note">${echapper(t('avancement.note'))}</p>
      ${th.eurocodes.map((e) => rendreAvancement(e.titre, e.cartes, articles)).join('\n      ')}
    </main>${pied()}`;
}

/** Page d un Eurocode, niveau 2 (CDC v4 §3) : clauses de la cartographie, publiees ou annoncees. */
export function pageEurocode(th: Thematique, e: Eurocode, articles: Article[]): string {
  return `${tete(`${e.titre} — ${t('site.titre')}`)}
    <main class="article">
      ${filAriane([{ libelle: th.titre, lien: `./${th.id}.html` }, { libelle: e.code }])}
      <ul class="vignettes vignette-seule">${vignette(e, etatTexte(e, articles))}</ul>
      <h1>${echapper(e.titre)}</h1>
      ${corpsEurocode(e, articles)}
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

/** Avertissement juridique : le site explique les normes, il ne les reproduit pas. */
export const DEPOT_ISSUES = 'https://github.com/henri421/blog/issues';

export function pageAvertissement(): string {
  const cles: Cle[] = ['avertissement.p1', 'avertissement.p2', 'avertissement.p3', 'avertissement.p4', 'avertissement.p5', 'avertissement.p6'];
  return `${tete(`${t('avertissement.titre')} — ${t('site.titre')}`)}
    <main class="article">
      <p class="retour"><a href="./index.html">← ${echapper(t('site.retour'))}</a></p>
      <h1>${echapper(t('avertissement.titre'))}</h1>
      ${cles.map((c) => `<p>${echapper(t(c))}</p>`).join('\n      ')}
      <p><a href="${DEPOT_ISSUES}">${echapper(t('avertissement.issues'))}</a></p>
    </main>${pied()}`;
}

/** Suivi des chantiers ouverts (decision de l auteur du 05/10/2026, a la place des brouillons). */
export function pageChantiers(articles: Article[], chantiers: Chantier[]): string {
  return `${tete(`${t('chantiers.titre')} — ${t('site.titre')}`)}
    <main class="article">
      <p class="retour"><a href="./index.html">← ${echapper(t('site.retour'))}</a></p>
      <h1>${echapper(t('chantiers.titre'))}</h1>
      <p>${echapper(t('chantiers.intro'))}</p>
      ${rendreChantiers(chantiers, articles)}
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
  verifierArborescence(articles);
  const ouverts = listerChantiers(racine, EUROCODES, articles);
  ecrire('index', pageAccueil(articles, ouverts));
  for (const th of THEMATIQUES) {
    ecrire(th.id, pageThematique(th, articles));
    for (const e of th.eurocodes) ecrire(e.id, pageEurocode(th, e, articles));
  }
  ecrire('mots-cles', pageMotsCles(articles));
  ecrire('chantiers', pageChantiers(articles, ouverts));
  ecrire('avertissement', pageAvertissement());
  for (const a of articles) ecrire(a.slug, pageArticle(a, ouverts));
  return pages;
}
