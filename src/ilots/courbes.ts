/**
 * Courbes du balayage, SVG ecrit a la main : taux de travail de chaque niveau
 * de chaque generation en fonction du parametre balaye (CDC EF6).
 *
 * Un point non calcule interrompt la courbe : rien n est interpole a travers
 * une rupture d applicabilite. Les couleurs sont des jetons de la suite,
 * portees par des classes (style.css) ; aucune couleur n est ecrite ici.
 * La generation se lit a la couleur, le niveau au trait.
 */

import { echapper } from 'aedificium-ui';
import { t } from '../i18n/cle';
import type { Balayage } from '../noyau/moteur/balayer';
import type { Mecanisme } from '../noyau/moteur/mecanisme';
import { valeurFr, type Entree } from './rendu';

const L = 640;
const H = 300;
const M = { g: 56, d: 16, h: 16, b: 44 };
const TRAITS = ['', '8 4', '2 4', '12 4 2 4'];

/** Valeur de graduation sans zeros inutiles : « 0,5 » et non « 0,5000 ». */
export function graduationFr(v: number): string {
  const texte = valeurFr(v);
  return texte.includes(',') ? texte.replace(/0+$/, '').replace(/,$/, '') : texte;
}

/** Graduation « ronde » couvrant [0, max]. */
export function graduations(max: number, n = 5): number[] {
  const brut = max / n;
  const p = 10 ** Math.floor(Math.log10(brut));
  const pas = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= brut) ?? brut;
  // La derniere graduation couvre le maximum : la courbe ne sort jamais du cadre.
  const nb = Math.ceil(max / pas - 1e-9);
  return Array.from({ length: nb + 1 }, (_, i) => i * pas);
}

export function tracerBalayage(m: Mecanisme<Entree>, b: Balayage, libelleChamp: string, unite: string): string {
  const xs = b.valeurs;
  const tous = b.series.flatMap((s) => s.taux.filter((v): v is number => v !== null));
  const yMax = Math.max(1.2, ...tous) * 1.05;
  const gy = graduations(yMax);
  const yHaut = gy[gy.length - 1];
  const x0 = xs[0];
  const x1 = xs[xs.length - 1];
  const X = (x: number): number => M.g + ((x - x0) / (x1 - x0 || 1)) * (L - M.g - M.d);
  const Y = (y: number): number => H - M.b - (y / yHaut) * (H - M.h - M.b);

  const grille = gy
    .map(
      (v) =>
        `<line class="grille" x1="${M.g}" x2="${L - M.d}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/>` +
        `<text class="graduation" x="${M.g - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end">${graduationFr(v)}</text>`,
    )
    .join('');
  const gx = [x0, (x0 + x1) / 2, x1]
    .map((v) => `<text class="graduation" x="${X(v).toFixed(1)}" y="${H - M.b + 16}" text-anchor="middle">${graduationFr(v)}</text>`)
    .join('');
  const unitaire = `<line class="taux-unitaire" x1="${M.g}" x2="${L - M.d}" y1="${Y(1).toFixed(1)}" y2="${Y(1).toFixed(1)}"/>`;

  const rangs = new Map<string, number>();
  const courbes = b.series
    .map((s) => {
      const rang = m.niveaux[s.generation].findIndex((d) => d.id === s.niveau);
      rangs.set(`${s.generation}/${s.niveau}`, rang);
      const morceaux: string[][] = [[]];
      s.taux.forEach((v, i) => {
        if (v === null) morceaux.push([]);
        else morceaux[morceaux.length - 1].push(`${X(xs[i]).toFixed(1)},${Y(v).toFixed(1)}`);
      });
      const trait = TRAITS[rang % TRAITS.length];
      return morceaux
        .filter((p) => p.length > 0)
        .map(
          (p) =>
            `<polyline class="serie serie-${s.generation}" points="${p.join(' ')}"${trait ? ` stroke-dasharray="${trait}"` : ''}/>`,
        )
        .join('');
    })
    .join('');

  const legende = b.series
    .map((s) => {
      const def = m.niveaux[s.generation].find((d) => d.id === s.niveau);
      const rang = rangs.get(`${s.generation}/${s.niveau}`) ?? 0;
      const trait = TRAITS[rang % TRAITS.length];
      return `<li><svg width="28" height="10" aria-hidden="true"><line class="serie serie-${s.generation}" x1="0" x2="28" y1="5" y2="5"${
        trait ? ` stroke-dasharray="${trait}"` : ''
      }/></svg> ${echapper(t(`generation.${s.generation}`))} · ${echapper(def ? t(def.hypothese) : s.niveau)}</li>`;
    })
    .join('');

  const axeX = `<text class="axe" x="${(M.g + L - M.d) / 2}" y="${H - 6}" text-anchor="middle">${echapper(libelleChamp)} (${echapper(unite)})</text>`;
  const axeY = `<text class="axe" x="14" y="${(H - M.b + M.h) / 2}" text-anchor="middle" transform="rotate(-90 14 ${(H - M.b + M.h) / 2})">${echapper(
    t('ilot.axe-taux'),
  )}</text>`;

  return `<figure class="courbes"><svg viewBox="0 0 ${L} ${H}" role="img" aria-label="${echapper(t('ilot.axe-taux'))}">
    ${grille}${unitaire}${courbes}${gx}${axeX}${axeY}</svg><ul class="legende">${legende}</ul></figure>`;
}

export function rendreRuptures(m: Mecanisme<Entree>, b: Balayage): string {
  if (b.ruptures.length === 0) return `<p class="note">${echapper(t('ilot.aucune-rupture'))}</p>`;
  const items = b.ruptures
    .map((r) => {
      const def = m.niveaux[r.generation].find((d) => d.id === r.niveau);
      return `<li>${echapper(t(`generation.${r.generation}`))} · ${echapper(def ? t(def.hypothese) : r.niveau)} : ${echapper(
        t(`statut.${r.avant}`),
      )} → ${echapper(t(`statut.${r.apres}`))} (${valeurFr(r.entre[0])} – ${valeurFr(r.entre[1])})</li>`;
    })
    .join('');
  return `<p><strong>${echapper(t('ilot.ruptures'))}</strong></p><ul class="ruptures">${items}</ul>`;
}
