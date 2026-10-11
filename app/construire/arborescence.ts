/**
 * Arborescence du site (CDC v4 §3, lot 5) : thematique > Eurocode > article.
 *
 * Decision de l auteur du 11/10/2026 : l arborescence n existe que dans la
 * navigation (fil d Ariane, menu, accueil, pages de thematique et
 * d Eurocode). Les adresses des articles restent plates, `./<slug>.html`.
 *
 * Le rattachement d un article a un Eurocode se lit dans la cartographie
 * (clauses qui citent l article) ou dans `Eurocode.generaux` : aucun champ
 * d en-tete d article n est ajoute, et aucune liste de clauses n est ecrite
 * ailleurs que dans la cartographie (EF9).
 */

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { t } from '../../src/i18n/cle';
import type { Eurocode } from '../../contenu/cartographie/eurocodes';
import type { ClauseCarte } from '../../contenu/cartographie/types';
import { THEMATIQUES, type Thematique } from '../../contenu/thematiques';
import type { Article } from './article';

/** Pages fixes du site, dont le nom ne peut etre pris par une thematique, un Eurocode ou un article. */
export const PAGES_FIXES = ['index', 'mots-cles', 'chantiers'];

/** Dossier des logos, servi tel quel par Vite sous `./eurocodes/logos/`. */
const DOSSIER_LOGOS = fileURLToPath(new URL('../public/eurocodes/logos/', import.meta.url));

function echapper(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Le fichier de logo est-il present ? Son absence donne le repli typographique (ET6). */
export function logoPresent(fichier: string): boolean {
  return existsSync(join(DOSSIER_LOGOS, fichier));
}

export interface Rattachement {
  thematique: Thematique;
  eurocode: Eurocode;
}

/** Articles d un Eurocode : generaux d abord, puis dans l ordre de la cartographie, sans doublon. */
export function articlesEurocode(e: Eurocode): string[] {
  const cites = e.cartes.flatMap((k) => k.chapitres.flatMap((ch) => ch.clauses.map((c) => c.article))).filter((s): s is string => !!s);
  return [...new Set([...(e.generaux ?? []), ...cites])];
}

/** Premier Eurocode (et sa thematique) auquel un article est rattache ; il fixe le fil d Ariane. */
export function rattachement(slug: string, thematiques: Thematique[] = THEMATIQUES): Rattachement | undefined {
  for (const thematique of thematiques) {
    for (const eurocode of thematique.eurocodes) if (articlesEurocode(eurocode).includes(slug)) return { thematique, eurocode };
  }
  return undefined;
}

/**
 * Controle de construction : tout article est atteignable par l arborescence
 * (EF10), tout article cite existe, et aucun nom de page n est pris deux fois
 * (les pages de thematique et d Eurocode partagent le dossier des articles).
 */
export function verifierArborescence(articles: Article[], thematiques: Thematique[] = THEMATIQUES): void {
  const slugs = new Set(articles.map((a) => a.slug));
  for (const a of articles) {
    if (!rattachement(a.slug, thematiques)) throw new Error(`Arborescence : l article « ${a.slug} » n est rattache a aucun Eurocode (EF10).`);
  }
  const noms = new Set(PAGES_FIXES);
  for (const nom of [...thematiques.map((th) => th.id), ...thematiques.flatMap((th) => th.eurocodes.map((e) => e.id)), ...slugs]) {
    if (noms.has(nom)) throw new Error(`Arborescence : le nom de page « ${nom} » est pris deux fois.`);
    noms.add(nom);
  }
  for (const th of thematiques) {
    for (const e of th.eurocodes) {
      for (const s of e.generaux ?? []) if (!slugs.has(s)) throw new Error(`Arborescence : ${e.code}, article general « ${s} » introuvable.`);
    }
  }
}

/** Fil d Ariane : Accueil, puis chaque niveau ; le dernier niveau sans lien est la page courante. */
export function filAriane(niveaux: Array<{ libelle: string; lien?: string }>): string {
  const items = [{ libelle: t('nav.accueil'), lien: './index.html' }, ...niveaux]
    .map((n) => (n.lien ? `<li><a href="${n.lien}">${echapper(n.libelle)}</a></li>` : `<li aria-current="page">${echapper(n.libelle)}</li>`))
    .join('');
  return `<nav class="fil" aria-label="${echapper(t('nav.fil'))}"><ol>${items}</ol></nav>`;
}

/** Fil d Ariane d un article : Accueil > thematique > Eurocode. */
export function filArticle(slug: string, thematiques: Thematique[] = THEMATIQUES): string {
  const r = rattachement(slug, thematiques);
  if (!r) return filAriane([]);
  return filAriane([
    { libelle: r.thematique.titre, lien: `./${r.thematique.id}.html` },
    { libelle: r.eurocode.code, lien: `./${r.eurocode.id}.html` },
  ]);
}

/** Clauses du perimetre sans article publie : ce qui est annonce. */
function annoncees(e: Eurocode, publies: Set<string>): ClauseCarte[] {
  return e.cartes.flatMap((k) => k.chapitres.flatMap((ch) => ch.clauses)).filter((c) => c.perimetre === 'inclus' && !(c.article && publies.has(c.article)));
}

function slugsPublies(articles: Article[]): Set<string> {
  return new Set(articles.filter((a) => a.entete.statut === 'publie').map((a) => a.slug));
}

/** Etat resume d un Eurocode : articles publies, clauses annoncees. */
export function etatEurocode(e: Eurocode, articles: Article[]): { articles: number; annoncees: number } {
  const publies = slugsPublies(articles);
  return { articles: articlesEurocode(e).filter((s) => publies.has(s)).length, annoncees: annoncees(e, publies).length };
}

/**
 * Vignette d un Eurocode (CDC v4 §3). Le logo est affiche tel que fourni ;
 * s il manque, un repli typographique (le numero) en tient lieu. Le numero et
 * l intitule sont toujours ecrits : aucune page ne depend de l image.
 */
export function vignette(
  v: { code: string; intitule: string; logo?: string },
  etat: string,
  options: { lien?: string; aTraiter?: boolean; present?: (fichier: string) => boolean } = {},
): string {
  const { lien, aTraiter = false, present = logoPresent } = options;
  const image =
    v.logo && present(v.logo)
      ? `<img class="vignette-logo" src="./eurocodes/logos/${echapper(v.logo)}" alt="" width="56" height="56" />`
      : `<span class="vignette-logo vignette-repli" aria-hidden="true">${echapper(v.code.replace(/^EN\s*/, ''))}</span>`;
  const texte = `${image}<span class="vignette-texte"><span class="vignette-code">${echapper(v.code)}</span><span class="vignette-intitule">${echapper(
    v.intitule,
  )}</span><span class="vignette-etat">${echapper(etat)}</span></span>`;
  const classe = aTraiter ? 'vignette a-traiter' : 'vignette';
  return lien ? `<li class="${classe}"><a href="${lien}">${texte}</a></li>` : `<li class="${classe}"><div>${texte}</div></li>`;
}

/** Etat resume affiche sous la vignette : « 3 articles publiés · 40 clauses annoncées ». */
export function etatTexte(e: Eurocode, articles: Article[]): string {
  const s = etatEurocode(e, articles);
  const a = s.articles > 1 ? t('eurocode.articles') : t('eurocode.article');
  const c = s.annoncees > 1 ? t('eurocode.annoncees') : t('eurocode.annoncee');
  return `${s.articles} ${a} · ${s.annoncees} ${c}`;
}

/** Vignettes d une thematique : Eurocodes cartographies (avec lien), puis a traiter. */
export function vignettesThematique(th: Thematique, articles: Article[], present: (fichier: string) => boolean = logoPresent): string {
  const traites = th.eurocodes.map((e) => vignette(e, etatTexte(e, articles), { lien: `./${e.id}.html`, present }));
  const a = th.annonces.map((e) => vignette(e, t('thematique.a-traiter'), { aTraiter: true, present }));
  return `<ul class="vignettes">${[...traites, ...a].join('')}</ul>`;
}

/**
 * Sommaire d une thematique pour l accueil : un bloc par Eurocode, ses
 * articles dans l ordre de la cartographie. `carte` rend la fiche d un article.
 */
export function sommaireThematique(th: Thematique, articles: Article[], carte: (a: Article) => string): string {
  const parSlug = new Map(articles.map((a) => [a.slug, a]));
  return th.eurocodes
    .map((e) => {
      const liste = articlesEurocode(e)
        .map((s) => parSlug.get(s))
        .filter((a): a is Article => !!a);
      if (liste.length === 0) return '';
      return `<h3 class="sommaire-eurocode"><a href="./${e.id}.html">${echapper(e.titre)}</a></h3>
      <ul class="cartes">
        ${liste.map(carte).join('\n        ')}
      </ul>`;
    })
    .join('\n      ');
}

/**
 * Corps de la page d un Eurocode (niveau 2) : articles generaux, puis les
 * clauses dans l ordre de la cartographie, publiees ou annoncees.
 */
export function corpsEurocode(e: Eurocode, articles: Article[]): string {
  const parSlug = new Map(articles.map((a) => [a.slug, a]));
  const publies = slugsPublies(articles);
  const generaux = (e.generaux ?? [])
    .map((s) => parSlug.get(s))
    .filter((a): a is Article => !!a)
    .map((a) => `<li><a href="./${a.slug}.html">${echapper(a.entete.titre)}</a></li>`)
    .join('');
  const blocGeneraux = generaux ? `<h2>${echapper(t('eurocode.generaux'))}</h2><ul class="generaux">${generaux}</ul>` : '';
  const cartes = e.cartes
    .map((k) => {
      const titreCarte = e.cartes.length > 1 ? `<h2>${echapper(k.norme)}</h2>` : `<h2>${echapper(t('eurocode.clauses'))} — ${echapper(k.norme)}</h2>`;
      const chapitres = k.chapitres
        .map((ch) => {
          const items = ch.clauses.map((c) => ligneClause(c, parSlug, publies)).join('');
          const numero = ch.numero === '—' ? '' : `${echapper(ch.numero)} `;
          return `<h3>${numero}${echapper(ch.titre)}</h3><ul class="clauses">${items}</ul>`;
        })
        .join('');
      return `<section class="carte-norme">${titreCarte}<p class="note">${echapper(t('eurocode.correspondance'))} : ${echapper(k.correspondant)}</p>${chapitres}</section>`;
    })
    .join('');
  return `${blocGeneraux}<p class="note">${echapper(t('eurocode.note'))}</p>${cartes}`;
}

function ligneClause(c: ClauseCarte, parSlug: Map<string, Article>, publies: Set<string>): string {
  const num = `<span class="clause-num">${echapper(c.clause)}</span>`;
  const corresp = c.correspondance.length > 0 ? c.correspondance.join(', ') : t('eurocode.sans-correspondance');
  const detail = `<span class="clause-corresp">${echapper(t('eurocode.correspondance'))} : ${echapper(corresp)}</span>`;
  if (c.perimetre !== 'inclus') {
    const etat = c.perimetre === 'exclu' ? t('avancement.hors-perimetre') : t('avancement.reporte');
    return `<li class="clause ${c.perimetre}">${num}<span class="clause-titre">${echapper(c.titre)}</span><span class="clause-etat" title="${echapper(
      c.motifExclusion ?? '',
    )}">${echapper(etat)}</span></li>`;
  }
  const a = c.article ? parSlug.get(c.article) : undefined;
  if (a && publies.has(a.slug)) {
    return `<li class="clause publie">${num}<span class="clause-titre"><a href="./${a.slug}.html">${echapper(c.titre)}</a>${detail}</span><span class="clause-etat">${echapper(
      t('eurocode.publie'),
    )}</span></li>`;
  }
  return `<li class="clause annonce">${num}<span class="clause-titre">${echapper(c.titre)}${detail}</span><span class="clause-etat">${echapper(t('eurocode.annonce'))}</span></li>`;
}
