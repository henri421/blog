import { describe, expect, it } from 'vitest';
import { nombreFr as nombreUi, tauxFr as tauxUi } from 'aedificium-ui';
import { nombreFr, tauxFr } from '../../src/contenu/format';
import { MECANISMES } from '../../src/noyau/index';
import { calculerMatrice } from '../../src/noyau/moteur/matrice';
import { balayer, valeursRegulieres } from '../../src/noyau/moteur/balayer';
import { rendreDetail, rendreFormulaire, rendreMatrice, symboleHtml, valeurFr } from '../../src/ilots/rendu';
import { graduationFr, graduations, rendreRuptures, tracerBalayage } from '../../src/ilots/courbes';

const tsa = MECANISMES['tranchant-sans-armature'];
const dalle = { VEd: 60, MEd: 15, bw: 1000, d: 190, Asl: 754, fck: 25, fyk: 500, Dlower: 16 };

describe('mise en forme', () => {
  it('la copie de nombreFr et tauxFr rend le meme texte qu aedificium-ui', () => {
    for (const v of [0, -0.0001, 0.12345, 1, 0.9996, 1.0004, 97.983, 1234.5678, Number.NaN]) {
      for (const d of [0, 1, 3]) expect(nombreFr(v, d)).toBe(nombreUi(v, d));
      expect(tauxFr(v)).toBe(tauxUi(v));
    }
  });

  it('quatre chiffres significatifs environ', () => {
    expect(valeurFr(97.983)).toBe('97,98');
    expect(valeurFr(0.13345)).toBe('0,1335');
    expect(valeurFr(560.99)).toBe('561,0');
    expect(valeurFr(undefined)).toBe('—');
  });

  it('symbole a indice', () => {
    expect(symboleHtml('V_Ed')).toBe('V<sub>Ed</sub>');
    expect(symboleHtml('τ_Rd,c (8.27)')).toBe('τ<sub>Rd,c</sub> (8.27)');
    expect(symboleHtml('k')).toBe('k');
  });

  it('graduations rondes et sans zeros inutiles', () => {
    expect(graduations(1.26)).toEqual([0, 0.5, 1, 1.5]);
    expect(graduationFr(0.5)).toBe('0,5');
    expect(graduations(1.5)).toEqual([0, 0.5, 1, 1.5]);
    expect(graduationFr(1)).toBe('1');
  });
});

describe('rendu de l ilot', () => {
  const matrice = calculerMatrice(tsa, dalle);

  it('formulaire : un champ par donnee, facultatifs signales, valeurs a la virgule', () => {
    const h = rendreFormulaire(tsa, { ...dalle, d: 190.5 });
    expect((h.match(/<input /g) ?? []).length).toBe(tsa.champs.length);
    expect(h).toContain('value="190,5"');
    expect((h.match(/facultatif/g) ?? []).length).toBe(2);
  });

  it('matrice : une ligne par cellule, aucune masquee, taux colore selon le verdict', () => {
    const h = rendreMatrice(tsa, matrice, null);
    expect((h.match(/<tr class="cellule/g) ?? []).length).toBe(4);
    expect(h).toContain('0,612');
    expect(h).not.toContain('undefined');
  });

  it('detail d un niveau non applicable : motif et donnees manquantes nommees', () => {
    const m = calculerMatrice(tsa, { ...dalle, MEd: undefined });
    const h = rendreDetail(tsa, m.cellules[3]);
    expect(h).toContain('Moment concomitant');
    expect(h).toContain('Données manquantes');
  });

  it('detail d un niveau calcule : grandeurs et provenance', () => {
    const h = rendreDetail(tsa, matrice.cellules[1]);
    expect(h).toContain('valeur recommandée');
    expect(h).toContain('γ<sub>V</sub>');
  });

  it('courbes : une polyligne par serie continue, interrompue sur une rupture', () => {
    const b = balayer(tsa, dalle, 'fck', valeursRegulieres(60, 120, 7));
    const svg = tracerBalayage(tsa, b, 'fck', 'MPa');
    // fck > 90 : hors domaine pour les quatre cellules, qui s arretent.
    expect(b.ruptures).toHaveLength(4);
    expect((svg.match(/<polyline/g) ?? []).length).toBe(4);
    for (const serie of b.series) expect(serie.taux.slice(4)).toEqual([null, null, null]);
    expect(rendreRuptures(tsa, b)).toContain('Hors du domaine');
    expect(svg).not.toMatch(/NaN|undefined/);
  });
});

describe('niveau en reserve', () => {
  it('la matrice affiche le resultat chiffre et la reserve en clair dans la cellule', () => {
    const m = {
      ...tsa,
      niveaux: {
        ...tsa.niveaux,
        'ec2-2023': [
          {
            id: 'annexe',
            ordre: 4,
            position: 'annexe-informative' as const,
            reserve: 'reserve.annexe-i' as const,
            clause: 'I.8.3.1',
            hypothese: 'niveau.tsa.2023.portee-mecanique' as const,
            donneesRequises: [],
            conditions: () => null,
            calculer: () => ({ statut: { etat: 'calcule' as const }, sollicitation: 5, resistance: 20, intermediaires: {}, clauses: [] }),
          },
        ],
      },
    };
    const matrice = calculerMatrice(m, dalle);
    const i = matrice.cellules.findIndex((c) => c.niveau === 'annexe');
    const html = rendreMatrice(m, matrice, null);
    expect(html).toContain('Calculé, sous réserve');
    expect(html).toContain('Annexe I, informative');
    expect(html).toContain('0,250');
    expect(rendreDetail(m, matrice.cellules[i])).toContain('class="motif reserve"');
  });
});
