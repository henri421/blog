/**
 * Point d entree de la page d accueil provisoire (lot 0).
 *
 * Remplit chaque element portant `data-cle` depuis le dictionnaire. La chaine
 * de construction des articles (Markdown, formules, ilots) arrive au lot 1.
 */

import { estCle, t } from '../../src/i18n/cle';
import { enregistrerServiceWorker } from './pwa';

export function remplirTextes(racine: ParentNode): void {
  for (const el of racine.querySelectorAll<HTMLElement>('[data-cle]')) {
    const cle = el.dataset.cle ?? '';
    if (!estCle(cle)) throw new Error(`Cle de dictionnaire inconnue : ${cle}`);
    el.textContent = t(cle);
  }
}

document.title = t('site.titre');
remplirTextes(document);
enregistrerServiceWorker();
