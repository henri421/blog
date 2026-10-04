/**
 * Montage d un ilot de calcul dans une page : branche le rendu pur sur le
 * DOM. Le lecteur modifie les donnees, choisit une cellule pour en voir le
 * detail, fait varier un parametre, exporte ou rejoue un JSON (CDC ET5).
 *
 * L outil ne recommande aucun niveau : toutes les cellules sont affichees au
 * meme rang (CDC §5.4).
 */

import { echapper, lireNombre, telecharger } from 'aedificium-ui';
import { t } from '../i18n/cle';
import type { Mecanisme } from '../noyau/moteur/mecanisme';
import { calculerMatrice, rejouer, serialiser, type Matrice } from '../noyau/moteur/matrice';
import { balayer, valeursRegulieres } from '../noyau/moteur/balayer';
import { champsBalayables, rendreDetail, rendreFormulaire, rendreMatrice, type Entree } from './rendu';
import { rendreRuptures, tracerBalayage } from './courbes';

const POINTS_BALAYAGE = 61;

export function monterCalculateur(racine: HTMLElement, m: Mecanisme<Entree>, exemple: Entree): void {
  let entree: Entree = { ...exemple };
  let choisie: number | null = null;
  let matrice: Matrice<Entree> | null = null;

  const balayables = champsBalayables(m);
  const options = balayables.map((c) => `<option value="${c.id}">${echapper(c.libelle)}</option>`).join('');
  racine.innerHTML = `
    <div class="ilot-formulaire"></div>
    <div class="ilot-actions">
      <button type="button" data-action="reinitialiser">${echapper(t('ilot.reinitialiser'))}</button>
      <button type="button" data-action="exporter">${echapper(t('ilot.exporter'))}</button>
      <label class="bouton">${echapper(t('ilot.importer'))}<input type="file" accept="application/json" data-action="importer" hidden></label>
    </div>
    <div class="ilot-erreur" role="alert" hidden></div>
    <div class="ilot-matrice"></div>
    <div class="ilot-detail" aria-live="polite"></div>
    <details class="ilot-balayage"><summary>${echapper(t('ilot.balayage'))}</summary>
      <div class="balayage-reglages">
        <label>${echapper(t('ilot.parametre'))} <select data-balayage="champ">${options}</select></label>
        <label>${echapper(t('ilot.de'))} <input data-balayage="de" inputmode="decimal" size="7"></label>
        <label>${echapper(t('ilot.a'))} <input data-balayage="a" inputmode="decimal" size="7"></label>
        <button type="button" data-action="tracer">${echapper(t('ilot.tracer'))}</button>
      </div>
      <div class="balayage-trace"></div>
    </details>
    <p class="note">${echapper(t('ilot.version'))} : ${echapper(m.id)} v${echapper(m.version)}</p>`;

  const $ = <T extends Element>(sel: string): T => racine.querySelector(sel) as T;
  const formulaire = $<HTMLElement>('.ilot-formulaire');
  const zoneErreur = $<HTMLElement>('.ilot-erreur');
  const zoneMatrice = $<HTMLElement>('.ilot-matrice');
  const zoneDetail = $<HTMLElement>('.ilot-detail');

  const erreur = (e: unknown): void => {
    zoneErreur.hidden = false;
    zoneErreur.textContent = `${t('ilot.erreur')} : ${e instanceof Error ? e.message : String(e)}`;
  };

  const recalculer = (): void => {
    zoneErreur.hidden = true;
    try {
      matrice = calculerMatrice(m, entree);
    } catch (e) {
      matrice = null;
      zoneMatrice.innerHTML = '';
      zoneDetail.innerHTML = '';
      erreur(e);
      return;
    }
    if (choisie !== null && choisie >= matrice.cellules.length) choisie = null;
    zoneMatrice.innerHTML = rendreMatrice(m, matrice, choisie);
    zoneDetail.innerHTML = choisie === null ? '' : rendreDetail(m, matrice.cellules[choisie]);
  };

  const remplirFormulaire = (): void => {
    formulaire.innerHTML = rendreFormulaire(m, entree);
  };

  const preremplirBalayage = (): void => {
    const champ = $<HTMLSelectElement>('[data-balayage="champ"]').value;
    const v = entree[champ];
    if (typeof v === 'number' && v > 0) {
      $<HTMLInputElement>('[data-balayage="de"]').value = String(+(v * 0.5).toPrecision(3)).replace('.', ',');
      $<HTMLInputElement>('[data-balayage="a"]').value = String(+(v * 1.5).toPrecision(3)).replace('.', ',');
    }
  };

  formulaire.addEventListener('input', (ev) => {
    const cible = ev.target as HTMLInputElement | HTMLSelectElement;
    const champ = m.champs.find((c) => c.id === cible.name);
    if (!champ) return;
    // Un champ vide ou illisible est ABSENT : jamais remplace par une valeur.
    entree = { ...entree, [champ.id]: champ.type === 'choix' ? cible.value : (lireNombre(cible.value) ?? undefined) };
    recalculer();
  });

  zoneMatrice.addEventListener('click', (ev) => {
    const ligne = (ev.target as Element).closest('tr[data-index]');
    if (!ligne || !matrice) return;
    const i = Number(ligne.getAttribute('data-index'));
    choisie = choisie === i ? null : i;
    recalculer();
  });
  zoneMatrice.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      (ev.target as HTMLElement).click();
    }
  });

  racine.addEventListener('click', (ev) => {
    const action = (ev.target as Element).closest('[data-action]')?.getAttribute('data-action');
    if (action === 'reinitialiser') {
      entree = { ...exemple };
      choisie = null;
      remplirFormulaire();
      recalculer();
    } else if (action === 'exporter' && matrice) {
      telecharger(`${m.id}.json`, serialiser(matrice), 'application/json');
    } else if (action === 'tracer') {
      const champ = $<HTMLSelectElement>('[data-balayage="champ"]').value;
      const de = lireNombre($<HTMLInputElement>('[data-balayage="de"]').value);
      const a = lireNombre($<HTMLInputElement>('[data-balayage="a"]').value);
      const zone = $<HTMLElement>('.balayage-trace');
      if (de === null || a === null || !(a > de)) return;
      try {
        const b = balayer(m, entree, champ, valeursRegulieres(de, a, POINTS_BALAYAGE));
        const def = m.champs.find((c) => c.id === champ);
        const unite = def && def.type === 'nombre' ? def.unite : '';
        zone.innerHTML = tracerBalayage(m, b, def ? t(def.libelle) : champ, unite) + rendreRuptures(m, b);
      } catch (e) {
        erreur(e);
      }
    }
  });

  racine.addEventListener('change', (ev) => {
    const cible = ev.target as HTMLElement;
    if (cible.matches('[data-balayage="champ"]')) preremplirBalayage();
    if (cible.matches('[data-action="importer"]')) {
      const fichier = (cible as HTMLInputElement).files?.[0];
      if (!fichier) return;
      void fichier.text().then((texte) => {
        try {
          entree = { ...rejouer(m, texte).entree };
          choisie = null;
          remplirFormulaire();
          recalculer();
        } catch (e) {
          erreur(e);
        }
      });
    }
  });

  remplirFormulaire();
  preremplirBalayage();
  recalculer();
}
