import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JETONS, valeursDesJetons } from 'aedificium-ui';
import { estCle } from '../../src/i18n/cle';

const lire = (chemin: string) => readFileSync(fileURLToPath(new URL(chemin, import.meta.url)), 'utf8');

describe('page', () => {
  it('le bloc :root reprend exactement les jetons de la suite', () => {
    const page = valeursDesJetons(lire('../../app/src/style.css'));
    for (const [nom, valeur] of valeursDesJetons(JETONS)) expect(page.get(nom)).toBe(valeur);
  });

  it('chaque data-cle de la page est une cle du dictionnaire', () => {
    const cles = [...lire('../../app/index.html').matchAll(/data-cle="([^"]+)"/g)].map((m) => m[1]);
    expect(cles.length).toBeGreaterThan(0);
    for (const cle of cles) expect(estCle(cle), cle).toBe(true);
  });
});
