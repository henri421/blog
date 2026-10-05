/**
 * Lecture d un article : en-tete YAML restreint, exemples, Markdown.
 *
 * En-tete reconnu (une cle par ligne, `historique` en liste) :
 *   titre, ordre, statut (brouillon | publie), texte (texte de reference et
 *   etat d amendement), redige, revise, resume, motscles (separes par des
 *   virgules), historique.
 */

import { extraireExemples, substituer, type Exemple } from '../../src/contenu/exemples';
import { markdownEnHtml } from './markdown';
import { estMotCle, type MotCle } from '../../contenu/mots-cles';

export interface EnTete {
  titre: string;
  ordre: number;
  statut: 'brouillon' | 'publie';
  texte: string;
  redige: string;
  revise: string;
  resume: string;
  /** Mots-cles du vocabulaire controle (CDC v4 §4.2), au moins un. */
  motscles: MotCle[];
  historique: string[];
}

export interface Article {
  slug: string;
  entete: EnTete;
  exemples: Exemple[];
  /** Ilots utilises par l article : nom d exemple. */
  ilots: string[];
  html: string;
}

const OBLIGATOIRES: Array<keyof EnTete> = ['titre', 'ordre', 'statut', 'texte', 'redige', 'revise', 'resume', 'motscles'];

export function lireEnTete(source: string): { entete: EnTete; corps: string } {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(source.replace(/\r\n/g, '\n'));
  if (!m) throw new Error('Article sans en-tete --- ... ---.');
  const brut: Record<string, string | string[]> = {};
  let liste: string[] | null = null;
  for (const ligne of m[1].split('\n')) {
    const item = /^\s+-\s+(.+)$/.exec(ligne);
    if (item && liste) {
      liste.push(item[1].trim());
      continue;
    }
    const kv = /^([a-z]+):\s*(.*)$/.exec(ligne);
    if (!kv) {
      if (ligne.trim() !== '') throw new Error(`En-tete : ligne illisible « ${ligne} ».`);
      continue;
    }
    if (kv[2] === '') {
      liste = [];
      brut[kv[1]] = liste;
    } else {
      liste = null;
      brut[kv[1]] = kv[2].trim();
    }
  }
  for (const cle of OBLIGATOIRES) {
    if (typeof brut[cle] !== 'string' || brut[cle] === '') throw new Error(`En-tete : « ${cle} » manquant.`);
  }
  for (const cle of ['redige', 'revise'] as const) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(brut[cle] as string)) throw new Error(`En-tete : « ${cle} » doit etre une date AAAA-MM-JJ.`);
  }
  const statut = brut.statut as string;
  if (statut !== 'brouillon' && statut !== 'publie') throw new Error(`En-tete : statut « ${statut} » inconnu.`);
  const motscles = (brut.motscles as string).split(',').map((m) => m.trim());
  for (const m of motscles) {
    if (!estMotCle(m)) throw new Error(`En-tete : mot-cle « ${m} » absent du vocabulaire controle (contenu/mots-cles.ts).`);
  }
  const historique = Array.isArray(brut.historique) ? brut.historique : [];
  if (historique.length === 0) throw new Error('En-tete : l historique des revisions est obligatoire (CDC EE4).');
  return {
    entete: {
      titre: brut.titre as string,
      ordre: Number(brut.ordre),
      statut,
      texte: brut.texte as string,
      redige: brut.redige as string,
      revise: brut.revise as string,
      resume: brut.resume as string,
      motscles: motscles as MotCle[],
      historique,
    },
    corps: source.replace(/\r\n/g, '\n').slice(m[0].length),
  };
}

/** Analyse et rend un article ; le rendu des ilots est delegue a la page. */
export function lireArticle(slug: string, source: string): Article {
  const { entete, corps } = lireEnTete(source);
  const { texte, exemples } = extraireExemples(corps);
  const ilots: string[] = [];
  const html = markdownEnHtml(substituer(texte, exemples), {
    ilot(nom) {
      if (!exemples.some((e) => e.nom === nom)) throw new Error(`Article ${slug} : calculateur sur l exemple inconnu ${nom}.`);
      ilots.push(nom);
      return `<div class="ilot" data-ilot="${nom}"></div>`;
    },
  });
  return { slug, entete, exemples, ilots, html };
}
