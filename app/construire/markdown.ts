/**
 * Conversion Markdown vers HTML, sous-ensemble suffisant pour les articles,
 * sans dependance (CDC ET1, ET2).
 *
 * Blocs : titres # a ####, paragraphes, listes - et 1. (un niveau), citations
 * >, tableaux a barres verticales, filets ---, code entre ```, formules entre
 * lignes $$, encadres ::: classe ... :::, et ilots {{calculateur:nom}} seuls
 * sur leur ligne.
 * En ligne : $formule$, `code`, **gras**, *italique*, [texte](lien).
 *
 * Le texte est echappe avant toute mise en forme : un article ne peut pas
 * injecter de HTML.
 */

import { texEnMathml } from './tex';

export interface OptionsMarkdown {
  /** Rendu d un ilot de calcul a partir de son nom. */
  ilot(nom: string): string;
}

function echapper(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Identifiant d ancre tire d un titre : minuscules, sans accents, tirets. */
export function ancre(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Mise en forme en ligne. Formules et code sont mis a l abri avant l echappement. */
export function enLigne(texte: string): string {
  const abris: string[] = [];
  const abriter = (html: string): string => `\u0000${abris.push(html) - 1}\u0000`;
  let s = texte
    .replace(/`([^`]+)`/g, (_, code: string) => abriter(`<code>${echapper(code)}</code>`))
    .replace(/\$([^$]+)\$/g, (_, tex: string) => abriter(texEnMathml(tex, false)));
  s = echapper(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, lib: string, url: string) => {
      const externe = /^https?:/.test(url);
      return `<a href="${url}"${externe ? ' target="_blank" rel="noopener"' : ''}>${lib}</a>`;
    });
  return s.replace(/\u0000(\d+)\u0000/g, (_, n: string) => abris[Number(n)]);
}

function cellules(ligne: string): string[] {
  return ligne
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

const DEBUT_BLOC = /^(#{1,4} |```|\$\$|:::|> |- |\* |\d+\. |\||---\s*$|\{\{calculateur:)/;

export function markdownEnHtml(source: string, options: OptionsMarkdown): string {
  const lignes = source.replace(/\r\n/g, '\n').split('\n');
  const sortie: string[] = [];
  let i = 0;
  while (i < lignes.length) {
    const ligne = lignes[i];
    if (ligne.trim() === '') {
      i++;
      continue;
    }
    // Titres
    const titre = /^(#{1,4}) (.+)$/.exec(ligne);
    if (titre) {
      const n = titre[1].length;
      sortie.push(`<h${n} id="${ancre(titre[2])}">${enLigne(titre[2])}</h${n}>`);
      i++;
      continue;
    }
    // Code
    if (ligne.startsWith('```')) {
      const corps: string[] = [];
      i++;
      while (i < lignes.length && !lignes[i].startsWith('```')) corps.push(lignes[i++]);
      if (i >= lignes.length) throw new Error('Markdown : bloc de code non ferme.');
      i++;
      sortie.push(`<pre><code>${echapper(corps.join('\n'))}</code></pre>`);
      continue;
    }
    // Formule centree
    if (ligne.trim() === '$$') {
      const corps: string[] = [];
      i++;
      while (i < lignes.length && lignes[i].trim() !== '$$') corps.push(lignes[i++]);
      if (i >= lignes.length) throw new Error('Markdown : formule $$ non fermee.');
      i++;
      sortie.push(`<div class="formule">${texEnMathml(corps.join(' '), true)}</div>`);
      continue;
    }
    // Ilot de calcul
    const ilot = /^\{\{calculateur:([a-z0-9-]+)\}\}\s*$/.exec(ligne);
    if (ilot) {
      sortie.push(options.ilot(ilot[1]));
      i++;
      continue;
    }
    // Encadre
    const encadre = /^:::\s*([a-z-]+)\s*$/.exec(ligne);
    if (encadre) {
      const corps: string[] = [];
      i++;
      while (i < lignes.length && lignes[i].trim() !== ':::') corps.push(lignes[i++]);
      if (i >= lignes.length) throw new Error('Markdown : encadre ::: non ferme.');
      i++;
      sortie.push(`<aside class="encadre encadre-${encadre[1]}">${markdownEnHtml(corps.join('\n'), options)}</aside>`);
      continue;
    }
    // Filet
    if (/^---\s*$/.test(ligne)) {
      sortie.push('<hr>');
      i++;
      continue;
    }
    // Citation
    if (ligne.startsWith('> ')) {
      const corps: string[] = [];
      while (i < lignes.length && lignes[i].startsWith('> ')) corps.push(lignes[i++].slice(2));
      sortie.push(`<blockquote>${markdownEnHtml(corps.join('\n'), options)}</blockquote>`);
      continue;
    }
    // Listes
    const puce = /^(?:- |\* )/;
    const numero = /^\d+\. /;
    if (puce.test(ligne) || numero.test(ligne)) {
      const ordonnee = numero.test(ligne);
      const marque = ordonnee ? numero : puce;
      const items: string[] = [];
      while (i < lignes.length && marque.test(lignes[i])) {
        let item = lignes[i++].replace(marque, '');
        while (i < lignes.length && /^ {2,}\S/.test(lignes[i])) item += ' ' + lignes[i++].trim();
        items.push(`<li>${enLigne(item)}</li>`);
      }
      const balise = ordonnee ? 'ol' : 'ul';
      sortie.push(`<${balise}>${items.join('')}</${balise}>`);
      continue;
    }
    // Tableau
    if (ligne.startsWith('|') && i + 1 < lignes.length && /^\|[\s:|-]+\|?\s*$/.test(lignes[i + 1])) {
      const tete = cellules(ligne);
      const alignements = cellules(lignes[i + 1]).map((c) =>
        c.endsWith(':') ? (c.startsWith(':') ? 'center' : 'right') : 'left',
      );
      i += 2;
      const corps: string[] = [];
      while (i < lignes.length && lignes[i].startsWith('|')) {
        const cs = cellules(lignes[i++]);
        corps.push(`<tr>${cs.map((c, k) => `<td class="${alignements[k] ?? 'left'}">${enLigne(c)}</td>`).join('')}</tr>`);
      }
      const th = tete.map((c, k) => `<th class="${alignements[k] ?? 'left'}">${enLigne(c)}</th>`).join('');
      sortie.push(`<div class="table-defile"><table><thead><tr>${th}</tr></thead><tbody>${corps.join('')}</tbody></table></div>`);
      continue;
    }
    // Paragraphe
    const corps: string[] = [ligne.trim()];
    i++;
    while (i < lignes.length && lignes[i].trim() !== '' && !DEBUT_BLOC.test(lignes[i])) corps.push(lignes[i++].trim());
    sortie.push(`<p>${enLigne(corps.join(' '))}</p>`);
  }
  return sortie.join('\n');
}
