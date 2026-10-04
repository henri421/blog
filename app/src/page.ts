/**
 * Point d entree de chaque page : enregistre le service worker et monte les
 * ilots de calcul declares par l article.
 *
 * Les exemples sont embarques dans la page par la construction
 * (<script type="application/json" id="exemples">) : l ilot demarre sur les
 * donnees de l exemple que le texte commente.
 */

import { MECANISMES } from '../../src/noyau/index';
import { monterCalculateur } from '../../src/ilots/calculateur';
import { enregistrerServiceWorker } from './pwa';

interface ExempleEmbarque {
  nom: string;
  mecanisme: string;
  entree: Record<string, unknown>;
}

function exemples(): ExempleEmbarque[] {
  const script = document.getElementById('exemples');
  return script ? (JSON.parse(script.textContent ?? '[]') as ExempleEmbarque[]) : [];
}

const tous = exemples();
for (const el of document.querySelectorAll<HTMLElement>('[data-ilot]')) {
  const ex = tous.find((e) => e.nom === el.dataset.ilot);
  const m = ex ? MECANISMES[ex.mecanisme] : undefined;
  if (ex && m) monterCalculateur(el, m, ex.entree);
}

enregistrerServiceWorker();
