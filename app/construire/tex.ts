/**
 * Conversion d un sous-ensemble de TeX en MathML, a la construction (CDC ET2) :
 * aucune bibliotheque n est chargee dans le navigateur, MathML Core est rendu
 * nativement.
 *
 * Sous-ensemble reconnu : nombres (point decimal ecrit, virgule affichee),
 * lettres, operateurs, groupes {}, indices et exposants, \frac, \sqrt et
 * \sqrt[n], \left \right, \text, \mathrm, lettres grecques, \min \max \ln
 * \cot \tan \sin \cos, \le \ge \cdot \times \approx \neq \pm \to \infty, et les
 * espaces \, \; \quad. Dans un indice, les lettres consecutives forment un
 * seul identifiant droit (V_{Rd,c}), selon l usage des Eurocodes.
 *
 * Toute commande inconnue fait echouer la construction : une formule
 * silencieusement mal rendue serait pire qu une construction refusee.
 */

const GRECQUES: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', varepsilon: 'ε', epsilon: 'ϵ', eta: 'η',
  theta: 'θ', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ',
  sigma: 'σ', tau: 'τ', phi: 'ϕ', varphi: 'φ', psi: 'ψ', omega: 'ω', chi: 'χ', zeta: 'ζ',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
};

const OPERATEURS: Record<string, string> = {
  le: '≤', leq: '≤', ge: '≥', geq: '≥', cdot: '·', times: '×', approx: '≈', neq: '≠',
  pm: '±', to: '→', infty: '∞', lt: '<', gt: '>', ldots: '…', quad: ' ', qquad: '  ', in: '∈',
};

const FONCTIONS = new Set(['min', 'max', 'ln', 'log', 'cot', 'tan', 'sin', 'cos', 'arctan', 'exp', 'sqrt']);

const ESPACES: Record<string, string> = { ',': '0.17em', ';': '0.28em', ' ': '0.25em' };

type Jeton =
  | { t: 'cmd'; v: string }
  | { t: 'nombre'; v: string }
  | { t: 'lettre'; v: string }
  | { t: 'op'; v: string }
  | { t: 'ouvre' }
  | { t: 'ferme' }
  | { t: 'haut' }
  | { t: 'bas' }
  | { t: 'crochet-ouvre' }
  | { t: 'crochet-ferme' };

function echapper(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function decouper(source: string): Jeton[] {
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (/\s/.test(c)) {
      i++;
    } else if (c === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(source.slice(i));
      if (!m) throw new Error(`TeX : barre oblique inverse isolee dans « ${source} ».`);
      jetons.push({ t: 'cmd', v: m[1] });
      i += m[0].length;
    } else if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(source.slice(i))!;
      jetons.push({ t: 'nombre', v: m[0] });
      i += m[0].length;
    } else if (/[A-Za-z]/.test(c)) {
      jetons.push({ t: 'lettre', v: c });
      i++;
    } else if (c === '{') {
      jetons.push({ t: 'ouvre' });
      i++;
    } else if (c === '}') {
      jetons.push({ t: 'ferme' });
      i++;
    } else if (c === '^') {
      jetons.push({ t: 'haut' });
      i++;
    } else if (c === '_') {
      jetons.push({ t: 'bas' });
      i++;
    } else if (c === '[') {
      jetons.push({ t: 'crochet-ouvre' });
      i++;
    } else if (c === ']') {
      jetons.push({ t: 'crochet-ferme' });
      i++;
    } else {
      jetons.push({ t: 'op', v: c });
      i++;
    }
  }
  return jetons;
}

class Analyseur {
  private i = 0;
  private readonly j: Jeton[];
  private readonly source: string;

  constructor(j: Jeton[], source: string) {
    this.j = j;
    this.source = source;
  }

  private erreur(message: string): Error {
    return new Error(`TeX : ${message} dans « ${this.source} ».`);
  }

  private voir(): Jeton | undefined {
    return this.j[this.i];
  }

  /** Suite d elements jusqu a `}`, `]` (si `arretCrochet`), `\right` ou la fin. */
  suite(indice: boolean, arretCrochet = false): string[] {
    const elements: string[] = [];
    for (;;) {
      const j = this.voir();
      if (!j || j.t === 'ferme') break;
      if (arretCrochet && j.t === 'crochet-ferme') break;
      if (j.t === 'cmd' && j.v === 'right') break;
      elements.push(this.element(indice));
    }
    return indice ? fusionnerLettres(elements) : elements;
  }

  private element(indice: boolean): string {
    let base = this.atome(indice);
    let bas: string | null = null;
    let haut: string | null = null;
    for (;;) {
      const j = this.voir();
      if (j?.t === 'bas' && bas === null) {
        this.i++;
        bas = this.argument(true);
      } else if (j?.t === 'haut' && haut === null) {
        this.i++;
        haut = this.argument(false);
      } else break;
    }
    if (bas !== null && haut !== null) base = `<msubsup>${base}${bas}${haut}</msubsup>`;
    else if (bas !== null) base = `<msub>${base}${bas}</msub>`;
    else if (haut !== null) base = `<msup>${base}${haut}</msup>`;
    return base;
  }

  /** Argument d un indice, d un exposant ou d une commande : un groupe ou un seul atome. */
  private argument(indice: boolean): string {
    const j = this.voir();
    if (j?.t === 'ouvre') {
      this.i++;
      const contenu = this.suite(indice);
      this.attendre('ferme');
      return contenu.length === 1 ? contenu[0] : `<mrow>${contenu.join('')}</mrow>`;
    }
    return this.atome(indice);
  }

  private attendre(t: Jeton['t']): void {
    if (this.voir()?.t !== t) throw this.erreur(`« ${t} » attendu`);
    this.i++;
  }

  private texteBrut(): string {
    this.attendre('ouvre');
    let profondeur = 1;
    let texte = '';
    while (this.i < this.j.length) {
      const j = this.j[this.i++];
      if (j.t === 'ouvre') profondeur++;
      if (j.t === 'ferme' && --profondeur === 0) return texte;
      texte += jetonEnTexte(j);
    }
    throw this.erreur('accolade non fermee');
  }

  private atome(indice: boolean): string {
    const j = this.j[this.i++];
    if (!j) throw this.erreur('expression incomplete');
    switch (j.t) {
      case 'nombre':
        return `<mn>${j.v.replace('.', ',')}</mn>`;
      case 'lettre':
        return indice ? `<mi mathvariant="normal">${j.v}</mi>` : `<mi>${j.v}</mi>`;
      case 'op':
        return `<mo>${echapper(j.v === '-' ? '−' : j.v)}</mo>`;
      case 'crochet-ouvre':
        return '<mo>[</mo>';
      case 'crochet-ferme':
        return '<mo>]</mo>';
      case 'ouvre': {
        const contenu = this.suite(indice);
        this.attendre('ferme');
        return `<mrow>${contenu.join('')}</mrow>`;
      }
      case 'cmd':
        return this.commande(j.v, indice);
      default:
        throw this.erreur(`jeton inattendu ${j.t}`);
    }
  }

  private commande(nom: string, indice: boolean): string {
    if (nom in GRECQUES) return `<mi>${GRECQUES[nom]}</mi>`;
    if (nom in OPERATEURS) return `<mo>${echapper(OPERATEURS[nom])}</mo>`;
    if (nom in ESPACES) return `<mspace width="${ESPACES[nom]}"/>`;
    if (nom === '{' || nom === '}' || nom === '%') return `<mo>${nom}</mo>`;
    if (nom === 'frac') {
      const num = this.argument(indice);
      const den = this.argument(indice);
      return `<mfrac>${num}${den}</mfrac>`;
    }
    if (nom === 'sqrt') {
      if (this.voir()?.t === 'crochet-ouvre') {
        this.i++;
        const ordre = this.suite(indice, true);
        this.attendre('crochet-ferme');
        const radicande = this.argument(indice);
        return `<mroot>${radicande}<mrow>${ordre.join('')}</mrow></mroot>`;
      }
      return `<msqrt>${this.argument(indice)}</msqrt>`;
    }
    if (nom === 'text') return `<mtext>${echapper(this.texteBrut())}</mtext>`;
    if (nom === 'mathrm') return `<mi mathvariant="normal">${echapper(this.texteBrut())}</mi>`;
    if (FONCTIONS.has(nom)) return `<mi>${nom}</mi>`;
    if (nom === 'left') {
      const ouvrant = this.delimiteur();
      const contenu = this.suite(indice);
      const fin = this.j[this.i++];
      if (!fin || fin.t !== 'cmd' || fin.v !== 'right') throw this.erreur('\\left sans \\right');
      const fermant = this.delimiteur();
      return `<mrow>${ouvrant}${contenu.join('')}${fermant}</mrow>`;
    }
    throw this.erreur(`commande inconnue \\${nom}`);
  }

  private delimiteur(): string {
    const j = this.j[this.i++];
    if (!j) throw this.erreur('delimiteur attendu');
    let v: string;
    if (j.t === 'op') v = j.v;
    else if (j.t === 'crochet-ouvre') v = '[';
    else if (j.t === 'crochet-ferme') v = ']';
    else if (j.t === 'cmd' && (j.v === '{' || j.v === '}')) v = j.v;
    else if (j.t === 'cmd' && j.v === '|') v = '‖';
    else throw this.erreur('delimiteur invalide');
    return v === '.' ? '' : `<mo stretchy="true">${echapper(v)}</mo>`;
  }

  fin(): void {
    if (this.i < this.j.length) throw this.erreur('accolade ou \\right en trop');
  }
}

function jetonEnTexte(j: Jeton): string {
  switch (j.t) {
    case 'cmd':
      return j.v === ' ' ? ' ' : `\\${j.v}`;
    case 'nombre':
    case 'lettre':
    case 'op':
      return j.v;
    case 'haut':
      return '^';
    case 'bas':
      return '_';
    case 'crochet-ouvre':
      return '[';
    case 'crochet-ferme':
      return ']';
    default:
      return '';
  }
}

/** Dans un indice, `<mi>R</mi><mi>d</mi>` devient `<mi>Rd</mi>`, droit. */
function fusionnerLettres(elements: string[]): string[] {
  const sortie: string[] = [];
  const motif = /^<mi mathvariant="normal">([^<]*)<\/mi>$/;
  for (const e of elements) {
    const m = motif.exec(e);
    const precedent = sortie.length > 0 ? motif.exec(sortie[sortie.length - 1]) : null;
    if (m && precedent) sortie[sortie.length - 1] = `<mi mathvariant="normal">${precedent[1]}${m[1]}</mi>`;
    else sortie.push(e);
  }
  return sortie;
}

/** Convertit une formule TeX en un element `<math>` ; `bloc` pour une formule centree. */
export function texEnMathml(source: string, bloc: boolean): string {
  const a = new Analyseur(decouper(source), source);
  const contenu = a.suite(false);
  a.fin();
  const attributs = bloc ? ' display="block"' : '';
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"${attributs}><mrow>${contenu.join('')}</mrow></math>`;
}
