/**
 * Mise en forme des nombres pour la construction des pages.
 *
 * Copie conforme de `nombreFr` et `tauxFr` d `aedificium-ui` : la
 * construction s execute dans Node a partir de vite.config.ts, ou un paquet
 * distribue en sources TypeScript ne se charge pas. Un test verifie que les
 * deux copies rendent le meme texte, de sorte que l article et l ilot de
 * calcul affichent les memes chiffres.
 */

export function nombreFr(valeur: number, decimales: number): string {
  if (!Number.isFinite(valeur)) return '—';
  const texte = valeur.toFixed(decimales).replace('.', ',');
  return /^-0(,0*)?$/.test(texte) ? texte.slice(1) : texte;
}

/** Taux de travail arrondi vers le verdict : par defaut sous 1, par exces au-dessus. */
export function tauxFr(taux: number, decimales = 3): string {
  if (!Number.isFinite(taux)) return 'hors domaine';
  if (taux === 1) return nombreFr(1, decimales);
  const f = 10 ** decimales;
  const arrondi = taux < 1 ? Math.floor(taux * f) / f : Math.ceil(taux * f) / f;
  return nombreFr(arrondi, decimales);
}
