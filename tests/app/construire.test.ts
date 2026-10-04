import { describe, expect, it } from 'vitest';
import { texEnMathml } from '../../app/construire/tex';
import { ancre, enLigne, markdownEnHtml } from '../../app/construire/markdown';
import { lireArticle, lireEnTete } from '../../app/construire/article';
import { extraireExemples, substituer } from '../../src/contenu/exemples';

const sansIlot = { ilot: (nom: string) => `[${nom}]` };

describe('TeX vers MathML', () => {
  it('nombre a virgule, indice droit groupe, exposant', () => {
    const m = texEnMathml('V_{Rd,c} = 0.66^{1/3}', false);
    expect(m).toContain('<msub><mi>V</mi><mrow><mi mathvariant="normal">Rd</mi><mo>,</mo><mi mathvariant="normal">c</mi></mrow></msub>');
    expect(m).toContain('<mn>0,66</mn>');
    expect(m).toContain('<msup>');
  });

  it('fraction, racine, racine n-ieme, grec, delimiteurs', () => {
    const m = texEnMathml('\\tau = \\frac{a}{b}\\sqrt{x}\\sqrt[3]{y}\\left(z\\right)', true);
    expect(m).toContain('display="block"');
    expect(m).toContain('<mi>τ</mi>');
    expect(m).toContain('<mfrac><mi>a</mi><mi>b</mi></mfrac>');
    expect(m).toContain('<msqrt><mi>x</mi></msqrt>');
    expect(m).toContain('<mroot><mi>y</mi><mrow><mn>3</mn></mrow></mroot>');
    expect(m).toContain('<mo stretchy="true">(</mo>');
  });

  it('le signe moins est le vrai signe moins, < est echappe', () => {
    const m = texEnMathml('a - b < c', false);
    expect(m).toContain('<mo>−</mo>');
    expect(m).toContain('<mo>&lt;</mo>');
  });

  it('une commande inconnue fait echouer la construction', () => {
    expect(() => texEnMathml('\\inconnue{x}', false)).toThrow(/inconnue/);
    expect(() => texEnMathml('\\frac{a}{b', false)).toThrow();
  });
});

describe('Markdown', () => {
  it('titres avec ancre, paragraphes, gras, italique, lien', () => {
    const h = markdownEnHtml('## Ce qui change\n\nUn **mot** et un *autre* [ici](https://x.org).', sansIlot);
    expect(h).toContain('<h2 id="ce-qui-change">Ce qui change</h2>');
    expect(h).toContain('<strong>mot</strong>');
    expect(h).toContain('<em>autre</em>');
    expect(h).toContain('<a href="https://x.org" target="_blank" rel="noopener">ici</a>');
  });

  it('le HTML d un article est echappe, jamais injecte', () => {
    expect(enLigne('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('listes, tableau aligne, formule centree, encadre, ilot', () => {
    const h = markdownEnHtml(
      '- a\n- b\n\n1. un\n2. deux\n\n| x | y |\n|---|---:|\n| 1 | 2 |\n\n$$\nx^2\n$$\n\n::: verifier\nTexte\n:::\n\n{{calculateur:dalle}}',
      sansIlot,
    );
    expect(h).toContain('<ul><li>a</li><li>b</li></ul>');
    expect(h).toContain('<ol><li>un</li><li>deux</li></ol>');
    expect(h).toContain('<td class="right">2</td>');
    expect(h).toContain('<div class="formule"><math');
    expect(h).toContain('<aside class="encadre encadre-verifier"><p>Texte</p></aside>');
    expect(h).toContain('[dalle]');
  });

  it('formule en ligne protegee de la mise en forme', () => {
    expect(enLigne('$a*b*c$')).toContain('<math');
    expect(enLigne('$a*b*c$')).not.toContain('<em>');
  });

  it('ancre sans accents', () => {
    expect(ancre('L’effet sur une note')).toBe('l-effet-sur-une-note');
  });
});

describe('en-tete et exemples', () => {
  const entete = '---\ntitre: T\nordre: 1\nstatut: brouillon\ntexte: X\nredige: 2026-10-04\nrevise: 2026-10-04\nresume: R\nhistorique:\n  - 2026-10-04 : creation\n---\n';

  it('lit l en-tete et l historique', () => {
    const { entete: e, corps } = lireEnTete(`${entete}Corps`);
    expect(e.titre).toBe('T');
    expect(e.historique).toEqual(['2026-10-04 : creation']);
    expect(corps).toBe('Corps');
  });

  it('refuse un en-tete sans historique ni statut connu', () => {
    expect(() => lireEnTete(entete.replace(/historique:\n {2}- .*\n/, ''))).toThrow(/historique/);
    expect(() => lireEnTete(entete.replace('brouillon', 'final'))).toThrow(/statut/);
  });

  it('extrait les exemples et substitue les references', () => {
    const md = 'Avant {{e:g/n.resistance}} apres\n```exemple\n{"nom":"e","mecanisme":"m","entree":{},"attendus":{"g/n.resistance":"1,23"}}\n```\n';
    const { texte, exemples } = extraireExemples(md);
    expect(exemples).toHaveLength(1);
    expect(substituer(texte, exemples)).toContain('Avant 1,23 apres');
    expect(() => substituer('{{e:g/n.taux}}', exemples)).toThrow(/aucune valeur/);
    expect(() => substituer('{{autre:g/n.taux}}', exemples)).toThrow(/inconnu/);
  });

  it('un calculateur sur un exemple inconnu fait echouer la lecture', () => {
    expect(() => lireArticle('x', `${entete}{{calculateur:absent}}`)).toThrow(/absent/);
  });
});
