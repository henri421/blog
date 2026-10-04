import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JETONS, valeursDesJetons } from 'aedificium-ui';

const lire = (chemin: string) => readFileSync(fileURLToPath(new URL(chemin, import.meta.url)), 'utf8');

describe('page', () => {
  it('le bloc :root reprend exactement les jetons de la suite', () => {
    const page = valeursDesJetons(lire('../../app/src/style.css'));
    for (const [nom, valeur] of valeursDesJetons(JETONS)) expect(page.get(nom)).toBe(valeur);
  });
});
