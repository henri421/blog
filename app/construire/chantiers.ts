/**
 * Suivi des chantiers : ce qui reste ouvert, article par article, rendu a la
 * construction (page `chantiers.html` et encadre dans chaque article).
 *
 * Seuls les chantiers de `contenu/chantiers.ts` sont saisis ; les autres sont
 * derives de la cartographie, de docs/verification-texte.md et des articles,
 * de sorte qu un manque leve disparait du suivi sans intervention.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dateFr, t } from '../../src/i18n/cle';
import { CHANTIERS_MANUELS, type Chantier, type NatureChantier } from '../../contenu/chantiers';
import type { Eurocode } from '../../contenu/cartographie/eurocodes';
import type { Article } from './article';
import { lacunesClause } from './avancement';

const OUVERTURE_V4 = '2026-10-05';

function echapper(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Points non coches de docs/verification-texte.md, rattaches a l article de leur section. */
export function chantiersVerification(source: string, eurocodes: Eurocode[]): Chantier[] {
  const clauses = eurocodes.find((e) => e.id === 'en1992')?.cartes.flatMap((c) => c.chapitres.flatMap((ch) => ch.clauses)) ?? [];
  const resultat: Chantier[] = [];
  let section = '';
  let item: string[] | null = null;
  const clore = (): void => {
    if (!item) return;
    const numeros = section.match(/\d+\.\d+(?:\.\d+)?/g) ?? [];
    const articles = [...new Set(numeros.map((n) => clauses.find((c) => c.clause === n)?.article).filter((a): a is string => !!a))];
    resultat.push({
      id: `verification-${resultat.length + 1}`,
      nature: 'verification-texte',
      titre: section,
      detail: item.join(' ').replace(/\s+/g, ' ').trim(),
      articles,
      ouvert: OUVERTURE_V4,
    });
    item = null;
  };
  for (const ligne of source.replace(/\r\n/g, '\n').split('\n')) {
    const titre = /^##\s+(.+)$/.exec(ligne);
    if (titre) {
      clore();
      section = titre[1].trim();
      continue;
    }
    const ouvert = /^- \[ \]\s+(.*)$/.exec(ligne);
    if (ouvert) {
      clore();
      item = [ouvert[1]];
      continue;
    }
    if (item && /^\s+\S/.test(ligne)) item.push(ligne.trim());
    else clore();
  }
  clore();
  return resultat;
}

/** Une entree par clause traitee qui a des niveaux manquants ou une reserve. */
export function chantiersCartographie(eurocodes: Eurocode[], articles: Article[]): Chantier[] {
  const parSlug = new Map(articles.map((a) => [a.slug, a]));
  const resultat: Chantier[] = [];
  for (const e of eurocodes) {
    for (const carte of e.cartes) {
      for (const ch of carte.chapitres) {
        for (const c of ch.clauses) {
          if (!c.article || c.perimetre !== 'inclus') continue;
          const manquants = lacunesClause(c, parSlug.get(c.article));
          if (manquants.length > 0) {
            const niveaux = c.niveaux?.filter((n) => manquants.some((m) => m.endsWith(`/${n.mecanisme}/${n.niveau}`))) ?? [];
            resultat.push({
              id: `${carte.id}-${c.clause}-niveaux`,
              nature: 'niveau-manquant',
              titre: `${carte.norme}, ${c.clause} : ${c.titre}`,
              detail: `Niveau${niveaux.length > 1 ? 'x' : ''} non encore rendu${niveaux.length > 1 ? 's' : ''} par l’article : ${niveaux.map((n) => n.clause).join(', ')}.`,
              articles: [c.article],
              ouvert: OUVERTURE_V4,
            });
          }
          if (c.reserves) {
            resultat.push({
              id: `${carte.id}-${c.clause}-reserve`,
              nature: 'reserve',
              titre: `${carte.norme}, ${c.clause} : ${c.titre}`,
              detail: c.reserves,
              articles: [c.article],
              ouvert: OUVERTURE_V4,
            });
          }
        }
      }
    }
  }
  return resultat;
}

/** Tous les chantiers ouverts, dans l ordre de presentation. */
export function chantiers(racine: string, eurocodes: Eurocode[], articles: Article[]): Chantier[] {
  const amendement: Chantier = {
    id: 'ilnas',
    nature: 'amendement',
    titre: t('chantiers.ilnas-titre'),
    detail: t('chantiers.ilnas-detail'),
    articles: articles.filter((a) => /amendement non encore vérifié/.test(a.entete.texte)).map((a) => a.slug),
    ouvert: OUVERTURE_V4,
  };
  const verification = chantiersVerification(readFileSync(join(racine, 'docs', 'verification-texte.md'), 'utf8'), eurocodes);
  return [
    ...(amendement.articles.length > 0 ? [amendement] : []),
    ...chantiersCartographie(eurocodes, articles),
    ...verification,
    ...CHANTIERS_MANUELS,
  ];
}

const ORDRE: NatureChantier[] = ['amendement', 'niveau-manquant', 'reserve', 'verification-texte', 'cartographie'];

function item(c: Chantier, titres: Map<string, string>, avecArticles: boolean): string {
  const liens =
    avecArticles && c.articles.length > 0
      ? `<p class="chantier-articles">${c.articles.map((s) => `<a href="./${s}.html">${echapper(titres.get(s) ?? s)}</a>`).join(' · ')}</p>`
      : '';
  return `<li id="${echapper(c.id)}"><p><strong>${echapper(c.titre)}</strong> <span class="chantier-date">${echapper(t('chantiers.ouvert'))} ${echapper(
    dateFr(c.ouvert),
  )}</span></p><p>${echapper(c.detail)}</p>${liens}</li>`;
}

/** Corps de la page de suivi, groupe par nature. */
export function rendreChantiers(liste: Chantier[], articles: Article[]): string {
  const titres = new Map(articles.map((a) => [a.slug, a.entete.titre]));
  return ORDRE.map((nature) => {
    const groupe = liste.filter((c) => c.nature === nature);
    if (groupe.length === 0) return '';
    return `<section><h2>${echapper(t(`chantiers.nature.${nature}`))} (${groupe.length})</h2><ul class="chantiers">${groupe
      .map((c) => item(c, titres, true))
      .join('')}</ul></section>`;
  }).join('\n      ');
}

/** Encadre d un article : ses chantiers propres, hors verification ILNAS deja dans l en-tete. */
export function encadreChantiers(slug: string, liste: Chantier[]): string {
  const propres = liste.filter((c) => c.nature !== 'amendement' && c.articles.includes(slug));
  if (propres.length === 0) return '';
  return `<aside class="chantiers-article"><p><strong>${echapper(t('chantiers.article'))}</strong></p><ul class="chantiers">${propres
    .map((c) => item(c, new Map(), false))
    .join('')}</ul><p><a href="./chantiers.html">${echapper(t('chantiers.tous'))}</a></p></aside>`;
}
