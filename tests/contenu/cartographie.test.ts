import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { EN1992 } from '../../contenu/cartographie/en1992';
import { EUROCODES } from '../../contenu/cartographie/eurocodes';
import { lireArticles } from '../../app/construire/site';
import { deriverLignes, lacunes, rendreAvancement } from '../../app/construire/avancement';
import { MECANISMES } from '../../src/noyau/index';

const racine = fileURLToPath(new URL('../..', import.meta.url));
const articles = lireArticles(racine);
const clauses = EN1992.chapitres.flatMap((c) => c.clauses);

// Niveaux cartographies que les articles ne rendent pas encore. Cette liste
// ne peut que raccourcir : un niveau ajoute a un mecanisme doit en etre retire,
// et une nouvelle lacune fait echouer la construction (test 15, CDC v4 §5.1).
const LACUNES_CONNUES = [
  '6.5.2 ec2-2023/enrobage/annexe-p',
  '7.3.2 ec2-2023/redistribution/rotation',
  '9.2.3 ec2-2023/fissuration/annexe-s',
];

describe('cartographie EN 1992-1-1', () => {
  it('chaque clause est unique et chaque article cite existe', () => {
    expect(new Set(clauses.map((c) => c.clause)).size).toBe(clauses.length);
    const slugs = new Set(articles.map((a) => a.slug));
    for (const c of clauses) if (c.article) expect(slugs.has(c.article), c.clause).toBe(true);
  });

  it('tout article de mecanisme est rattache a au moins une clause', () => {
    const rattaches = new Set(clauses.map((c) => c.article));
    for (const a of articles) if (a.ilots.length > 0) expect(rattaches.has(a.slug), a.slug).toBe(true);
  });

  it('la position normative d un niveau code est celle de la cartographie', () => {
    for (const c of clauses) {
      for (const n of c.niveaux ?? []) {
        const def = MECANISMES[n.mecanisme]?.niveaux[n.generation]?.find((d) => d.id === n.niveau);
        if (def) expect(def.position, `${c.clause} ${n.niveau}`).toBe(n.position);
      }
    }
  });

  it('une clause exclue ou reportee porte son motif', () => {
    for (const c of EUROCODES.flatMap((e) => e.cartes).flatMap((k) => k.chapitres.flatMap((ch) => ch.clauses)))
      if (c.perimetre !== 'inclus') expect(c.motifExclusion, c.clause).toBeTruthy();
  });

  it('la forme lisible cite chaque clause de la forme typee', () => {
    const md = readFileSync(`${racine}/docs/cartographie/en1992.md`, 'utf8');
    for (const c of clauses) expect(md, c.clause).toContain(`| ${c.clause} |`);
  });

  it('test 14 : une clause sans article figure au tableau, colonnes derivees non faites', () => {
    const lignes = deriverLignes(EN1992, articles).flatMap((c) => c.lignes);
    expect(lignes).toHaveLength(clauses.length);
    const l = lignes.find((x) => x.clause === '8.5.3')!;
    expect(l).toMatchObject({ article: null, ecrite: false, comparatif: false, calculateur: false });
    expect(rendreAvancement('EN 1992', [EN1992], articles)).toContain('<td>8.5.3</td>');
  });

  it('test 15 : tout niveau cartographie apparait dans l article de sa clause, hors lacunes connues', () => {
    expect(lacunes(EN1992, articles)).toEqual(LACUNES_CONNUES);
  });

  it('une clause dont un niveau manque n a pas son calculateur coche', () => {
    const l = deriverLignes(EN1992, articles)
      .flatMap((c) => c.lignes)
      .find((x) => x.clause === '7.3.2')!;
    expect(l.ecrite).toBe(true);
    expect(l.calculateur).toBe(false);
  });

  it('test 16 : la colonne verifie ne provient que de la cartographie', () => {
    // Meme resultat avec ou sans articles : rien dans le depot ne la renseigne.
    const avec = deriverLignes(EN1992, articles).flatMap((c) => c.lignes.map((l) => l.verifie));
    const carte = clauses.map((c) => c.verifie);
    expect(avec).toEqual(carte);
    const source = readFileSync(`${racine}/app/construire/avancement.ts`, 'utf8');
    expect(source.match(/verifie:/g)).toEqual(['verifie:', 'verifie:']); // declaration du type et copie
    expect(source).toContain('verifie: c.verifie,');
  });
});

describe('cartographies de toutes les normes', () => {
  const cartes = EUROCODES.flatMap((e) => e.cartes.map((c) => ({ e, c })));

  it('identifiants de cartes uniques, clauses uniques dans chaque carte', () => {
    expect(new Set(cartes.map(({ c }) => c.id)).size).toBe(cartes.length);
    for (const { c } of cartes) {
      const liste = c.chapitres.flatMap((ch) => ch.clauses.map((x) => x.clause));
      expect(new Set(liste).size, c.id).toBe(liste.length);
    }
  });

  it('chaque forme lisible cite chaque clause de sa forme typee', () => {
    for (const { e, c } of cartes) {
      const md = readFileSync(`${racine}/docs/cartographie/${e.documentation}`, 'utf8');
      for (const ch of c.chapitres) for (const x of ch.clauses) expect(md, `${c.id} ${x.clause}`).toContain(`| ${x.clause} |`);
    }
  });

  it('un groupe par Eurocode, replie par defaut', () => {
    const html = EUROCODES.map((e) => rendreAvancement(e.titre, e.cartes, articles)).join('');
    expect(html.match(/<details class="avancement">/g)).toHaveLength(EUROCODES.length);
    expect(html).not.toMatch(/<details[^>]* open/);
  });
});
