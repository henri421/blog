/**
 * Tableau d avancement (CDC v4 §6), rendu a la construction.
 *
 * Les quatre premieres colonnes derivent de la cartographie et de l etat du
 * depot (articles, mecanismes). La cinquieme, « teste et verifie », est lue
 * telle quelle dans la cartographie : aucune fonction de ce module ne la
 * deduit d autre chose (test 16).
 */

import { MECANISMES } from '../../src/noyau/index';
import { dateFr, t } from '../../src/i18n/cle';
import type { Carte, ClauseCarte } from '../../contenu/cartographie/types';
import type { Article } from './article';

export interface LigneAvancement {
  clause: string;
  titre: string;
  perimetre: ClauseCarte['perimetre'];
  /** Motif d exclusion ou de report. */
  motif?: string;
  article: string | null;
  theorie: boolean;
  ecrite: boolean;
  comparatif: boolean;
  calculateur: boolean;
  /** Date ISO de l attestation de l auteur, copiee de la cartographie. */
  verifie: string | null;
}

function echapper(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Mecanismes dont l article embarque un calculateur. */
function mecanismesEmbarques(a: Article): Set<string> {
  return new Set(a.exemples.filter((e) => a.ilots.includes(e.nom)).map((e) => e.mecanisme));
}

/**
 * Niveaux cartographies d une clause qui n apparaissent pas dans son article :
 * mecanisme non embarque, ou niveau absent du mecanisme (test 15).
 */
export function lacunesClause(cl: ClauseCarte, article: Article | undefined): string[] {
  if (!cl.niveaux || cl.niveaux.length === 0) return [];
  const embarques = article ? mecanismesEmbarques(article) : new Set<string>();
  return cl.niveaux
    .filter((n) => !embarques.has(n.mecanisme) || !MECANISMES[n.mecanisme]?.niveaux[n.generation]?.some((d) => d.id === n.niveau))
    .map((n) => `${cl.clause} ${n.generation}/${n.mecanisme}/${n.niveau}`);
}

/** Toutes les lacunes des clauses traitees par un article. */
export function lacunes(carte: Carte, articles: Article[]): string[] {
  const parSlug = new Map(articles.map((a) => [a.slug, a]));
  return carte.chapitres.flatMap((ch) => ch.clauses.filter((c) => c.article).flatMap((c) => lacunesClause(c, parSlug.get(c.article as string))));
}

const COMPARATIF = /<h2[^>]*>\s*(Ce qui change|Changement)/;

export function deriverLignes(carte: Carte, articles: Article[]): Array<{ numero: string; titre: string; lignes: LigneAvancement[] }> {
  const parSlug = new Map(articles.map((a) => [a.slug, a]));
  return carte.chapitres.map((ch) => ({
    numero: ch.numero,
    titre: ch.titre,
    lignes: ch.clauses.map((c) => {
      const a = c.article ? parSlug.get(c.article) : undefined;
      if (c.article && !a) throw new Error(`Cartographie : clause ${c.clause}, article « ${c.article} » introuvable.`);
      return {
        clause: c.clause,
        titre: c.titre,
        perimetre: c.perimetre,
        motif: c.motifExclusion,
        article: a ? a.slug : null,
        theorie: c.ingeree,
        ecrite: a !== undefined,
        comparatif: a !== undefined && COMPARATIF.test(a.html),
        calculateur: a !== undefined && a.ilots.length > 0 && lacunesClause(c, a).length === 0,
        verifie: c.verifie,
      };
    }),
  }));
}

const coche = (v: boolean): string => (v ? '<td class="fait">✓</td>' : '<td class="a-faire">—</td>');

/** Lignes de chapitres d une carte, avec un titre de partie quand l Eurocode en compte plusieurs. */
function corpsCarte(carte: Carte, articles: Article[], avecTitre: boolean): { html: string; lignes: LigneAvancement[] } {
  const chapitres = deriverLignes(carte, articles);
  const html = chapitres
    .map((ch) => {
      const lignes = ch.lignes
        .map((l) => {
          const titre = l.article ? `<a href="./${l.article}.html">${echapper(l.titre)}</a>` : echapper(l.titre);
          if (l.perimetre !== 'inclus') {
            const etat = l.perimetre === 'exclu' ? t('avancement.hors-perimetre') : t('avancement.reporte');
            return `<tr class="${l.perimetre}"><td>${echapper(l.clause)}</td><td>${titre}</td><td colspan="5" title="${echapper(l.motif ?? '')}">${echapper(etat)}</td></tr>`;
          }
          const verifie = l.verifie ? `<td class="fait">${echapper(dateFr(l.verifie))}</td>` : '<td class="a-faire">—</td>';
          return `<tr><td>${echapper(l.clause)}</td><td>${titre}</td>${coche(l.theorie)}${coche(l.ecrite)}${coche(l.comparatif)}${coche(l.calculateur)}${verifie}</tr>`;
        })
        .join('');
      const numero = ch.numero === '—' ? '' : `${echapper(ch.numero)} `;
      return `<tr class="chapitre"><th colspan="7">${numero}${echapper(ch.titre)}</th></tr>${lignes}`;
    })
    .join('');
  const tete = avecTitre ? `<tr class="partie"><th colspan="7">${echapper(carte.norme)}</th></tr>` : '';
  return { html: tete + html, lignes: chapitres.flatMap((c) => c.lignes) };
}

/**
 * Groupe d un Eurocode, replie par defaut (CDC v4 §6) ; la ligne de resume
 * compte chaque colonne sur les clauses du perimetre.
 */
export function rendreAvancement(titre: string, cartes: Carte[], articles: Article[]): string {
  const corps = cartes.map((c) => corpsCarte(c, articles, cartes.length > 1));
  const toutes = corps.flatMap((c) => c.lignes).filter((l) => l.perimetre === 'inclus');
  const compte = (f: (l: LigneAvancement) => boolean): string => `${toutes.filter(f).length}/${toutes.length}`;
  const resume = [
    `${t('avancement.theorie')} ${compte((l) => l.theorie)}`,
    `${t('avancement.ecrite')} ${compte((l) => l.ecrite)}`,
    `${t('avancement.comparatif')} ${compte((l) => l.comparatif)}`,
    `${t('avancement.calculateur')} ${compte((l) => l.calculateur)}`,
    `${t('avancement.verifie')} ${compte((l) => l.verifie !== null)}`,
  ].join(' · ');
  return `<details class="avancement">
        <summary><strong>${echapper(titre)}</strong> <span>${echapper(resume)}</span></summary>
        <div class="table-defile"><table>
          <thead><tr><th>${echapper(t('avancement.clause'))}</th><th>${echapper(t('avancement.sujet'))}</th><th>${echapper(t('avancement.theorie'))}</th><th>${echapper(
            t('avancement.ecrite'),
          )}</th><th>${echapper(t('avancement.comparatif'))}</th><th>${echapper(t('avancement.calculateur'))}</th><th>${echapper(t('avancement.verifie'))}</th></tr></thead>
          <tbody>${corps.map((c) => c.html).join('')}</tbody>
        </table></div>
      </details>`;
}
