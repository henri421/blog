/**
 * Rendu HTML d un ilot de calcul : formulaire, matrice, detail d une cellule.
 * Fonctions pures, sans DOM, testables hors navigateur ; le montage
 * (calculateur.ts) ne fait que les brancher sur la page.
 *
 * Toute chaine visible vient du dictionnaire (CDC ET3) ; les symboles et les
 * unites ne se traduisent pas.
 */

import { echapper } from 'aedificium-ui';
import { t } from '../i18n/cle';
import type { Cellule, Generation } from '../noyau/model/resultat';
import { estChiffree } from '../noyau/model/resultat';
import type { Mecanisme } from '../noyau/moteur/mecanisme';
import type { Matrice } from '../noyau/moteur/matrice';
import { nombreFr, tauxFr } from '../contenu/format';

export type Entree = Record<string, unknown>;

/**
 * Symbole a indice : « V_Ed » devient V<sub>Ed</sub>, « τ_Rd,c (8.27) »
 * devient τ<sub>Rd,c</sub> (8.27). Le texte est echappe.
 */
export function symboleHtml(symbole: string): string {
  const m = /^([^_\s]+)_([^\s]+)(.*)$/.exec(symbole);
  if (!m) return echapper(symbole);
  return `${echapper(m[1])}<sub>${echapper(m[2])}</sub>${echapper(m[3])}`;
}

/**
 * Nombre de decimales adapte a l ordre de grandeur : quatre chiffres
 * significatifs environ, au plus six decimales.
 */
export function valeurFr(v: number | undefined): string {
  if (v === undefined || !Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const d = Math.min(Math.max(3 - Math.floor(Math.log10(Math.abs(v))), 0), 6);
  return nombreFr(v, d);
}

export function rendreFormulaire(m: Mecanisme<Entree>, e: Entree): string {
  const champs = m.champs
    .map((c) => {
      const id = `${m.id}-${c.id}`;
      if (c.type === 'choix') {
        const options = c.options
          .map((o) => `<option value="${o.valeur}"${e[c.id] === o.valeur ? ' selected' : ''}>${echapper(t(o.libelle))}</option>`)
          .join('');
        return `<label class="champ"><span>${echapper(t(c.libelle))}</span><select name="${c.id}" id="${id}">${options}</select></label>`;
      }
      const v = e[c.id];
      const valeur = typeof v === 'number' ? String(v).replace('.', ',') : '';
      const facultatif = c.facultatif ? ` <em>(${echapper(t('ilot.facultatif'))})</em>` : '';
      return `<label class="champ"><span>${echapper(t(c.libelle))}${facultatif}</span>
        <span class="saisie"><var>${symboleHtml(c.symbole)}</var><input name="${c.id}" id="${id}" inputmode="decimal" value="${valeur}"><span class="unite">${echapper(c.unite)}</span></span></label>`;
    })
    .join('');
  return `<fieldset class="donnees"><legend>${echapper(t('ilot.donnees'))}</legend>${champs}</fieldset>`;
}

function definition(m: Mecanisme<Entree>, c: Cellule) {
  return m.niveaux[c.generation].find((d) => d.id === c.niveau);
}

function libelleStatut(c: Cellule): string {
  return t(`statut.${c.statut.etat}`);
}

/** Statut affiche dans la matrice ; une reserve y figure en clair, pas en note. */
function statutHtml(c: Cellule): string {
  const libelle = echapper(libelleStatut(c));
  return c.statut.etat === 'reserve' ? `${libelle}<br><small class="reserve">${echapper(t(c.statut.motif))}</small>` : libelle;
}

/** Unite affichee dans la cellule d un niveau qui compare une autre grandeur. */
function uniteNiveau(unite: string | undefined): string {
  return unite === undefined ? '' : ` ${echapper(unite)}`;
}

/** Note des niveaux dont les grandeurs comparees different de celles du mecanisme. */
function grandeursPropres(m: Mecanisme<Entree>): string {
  return (Object.keys(m.niveaux) as Generation[])
    .flatMap((g) =>
      m.niveaux[g]
        .filter((d) => d.grandeurs)
        .map((d) => {
          const { sollicitation: s, resistance: r } = d.grandeurs!;
          return `<p class="note">${echapper(t(`generation-courte.${g}`))}, ${echapper(t('ilot.niveau').toLowerCase())} ${d.ordre} : <strong>${echapper(t('ilot.agissant'))}</strong> : ${echapper(t(s.libelle))} (${echapper(s.unite)}). <strong>${echapper(t('ilot.resistant'))}</strong> : ${echapper(t(r.libelle))} (${echapper(r.unite)}).</p>`;
        }),
    )
    .join('');
}

export function rendreMatrice(m: Mecanisme<Entree>, matrice: Matrice, choisie: number | null): string {
  const lignes = matrice.cellules
    .map((c, i) => {
      const def = definition(m, c);
      const calcule = estChiffree(c);
      const classeTaux = calcule && c.taux !== undefined ? (c.taux <= 1 ? 'ok' : 'refus') : '';
      return `<tr class="cellule etat-${c.statut.etat}${choisie === i ? ' choisie' : ''}" data-index="${i}" tabindex="0">
        <td>${echapper(t(`generation-courte.${c.generation}`))}</td>
        <td title="${echapper(def ? t(def.hypothese) : c.niveau)}">${def ? def.ordre : echapper(c.niveau)}</td>
        <td>${statutHtml(c)}</td>
        <td class="nombre">${calcule ? valeurFr(c.sollicitation) + uniteNiveau(def?.grandeurs?.sollicitation.unite) : '—'}</td>
        <td class="nombre">${calcule ? valeurFr(c.resistance) + uniteNiveau(def?.grandeurs?.resistance.unite) : '—'}</td>
        <td class="nombre ${classeTaux}">${calcule && c.taux !== undefined ? tauxFr(c.taux) : '—'}</td>
      </tr>`;
    })
    .join('');
  const s = m.sollicitation;
  const r = m.resistance;
  return `<div class="table-defile"><table class="matrice">
    <caption>${echapper(t('ilot.resultats'))}</caption>
    <thead><tr><th>${echapper(t('ilot.generation'))}</th><th>${echapper(t('ilot.niveau'))}</th><th>${echapper(t('ilot.statut'))}</th>
    <th class="nombre" title="${echapper(t(s.libelle))}">${echapper(t('ilot.agissant'))} (${echapper(s.unite)})</th><th class="nombre" title="${echapper(t(r.libelle))}">${echapper(t('ilot.resistant'))} (${echapper(r.unite)})</th>
    <th class="nombre">${echapper(t('ilot.taux'))}</th></tr></thead>
    <tbody>${lignes}</tbody></table></div>
    <p class="note"><strong>${echapper(t('ilot.agissant'))}</strong> : ${echapper(t(s.libelle))}. <strong>${echapper(t('ilot.resistant'))}</strong> : ${echapper(t(r.libelle))}.</p>
    ${grandeursPropres(m)}
    ${legendeNiveaux(m)}`;
}

/** Hypothese de chaque niveau, sous la matrice : le numero seul ne suffit pas. */
export function legendeNiveaux(m: Mecanisme<Entree>): string {
  const blocs = (Object.keys(m.niveaux) as Generation[])
    .map((g) => {
      const items = [...m.niveaux[g]]
        .sort((a, b) => a.ordre - b.ordre)
        .map((d) => `<li value="${d.ordre}">${echapper(t(d.hypothese))}</li>`)
        .join('');
      return `<div><p><strong>${echapper(t(`generation.${g}`))}</strong></p><ol>${items}</ol></div>`;
    })
    .join('');
  return `<div class="legende-niveaux"><p class="note">${echapper(t('ilot.niveaux'))}</p>${blocs}</div>`;
}

export function rendreDetail(m: Mecanisme<Entree>, c: Cellule): string {
  const def = definition(m, c);
  const entete = `<h4>${echapper(t(`generation.${c.generation}`))} · ${echapper(def ? t(def.hypothese) : c.niveau)}</h4>
    <p><strong>${echapper(t('ilot.clauses'))}</strong> : ${echapper(c.clauses.join(', '))}</p>`;
  if (c.statut.etat === 'non-applicable') {
    const manquantes = c.statut.donneesManquantes.map((d) => `<li>${echapper(t(d))}</li>`).join('');
    return `${entete}<p class="motif">${echapper(t(c.statut.motif))}</p>${
      manquantes ? `<p>${echapper(t('statut.donnees-manquantes'))} :</p><ul>${manquantes}</ul>` : ''
    }`;
  }
  if (c.statut.etat === 'hors-domaine') return `${entete}<p class="motif">${echapper(t(c.statut.motif))}</p>`;
  const reserve = c.statut.etat === 'reserve' ? `<p class="motif reserve">${echapper(t(c.statut.motif))}</p>` : '';
  const iterations =
    c.iterations !== undefined ? `<p><strong>${echapper(t('statut.iterations'))}</strong> : ${c.iterations}</p>` : '';
  const lignes = Object.entries(c.intermediaires)
    .map(
      ([sym, g]) =>
        `<tr><td><var>${symboleHtml(sym)}</var></td><td class="nombre">${valeurFr(g.valeur)}</td><td>${echapper(g.unite)}</td><td class="provenance-${g.provenance}">${echapper(t(`provenance.${g.provenance}`))}</td></tr>`,
    )
    .join('');
  return `${entete}${reserve}${iterations}${
    c.statut.etat === 'non-convergent' ? `<p class="motif">${echapper(t('statut.non-convergent'))}</p>` : ''
  }<div class="table-defile"><table class="intermediaires"><thead><tr><th>${echapper(t('ilot.grandeur'))}</th><th class="nombre">${echapper(
    t('ilot.valeur'),
  )}</th><th></th><th>${echapper(t('ilot.provenance'))}</th></tr></thead><tbody>${lignes}</tbody></table></div>`;
}

/** Champs numeriques que le lecteur peut faire varier. */
export function champsBalayables(m: Mecanisme<Entree>): Array<{ id: string; libelle: string }> {
  return m.champs.filter((c) => c.type === 'nombre').map((c) => ({ id: c.id, libelle: t(c.libelle) }));
}

export const GENERATION_COURTE: Record<Generation, string> = { 'ec2-2004': '2004', 'ec2-2023': '2023' };
