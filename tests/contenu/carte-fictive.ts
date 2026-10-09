/**
 * Cartographie EN 1992 modifiee pour les tests : un niveau fictif sur 7.3.2,
 * que l article de la clause ne peut pas rendre. Elle garantit au moins une
 * lacune, quel que soit l avancement reel du depot.
 */

import { EN1992 } from '../../contenu/cartographie/en1992';
import type { Carte } from '../../contenu/cartographie/types';

export function avecNiveauFictif(): Carte {
  const carte: Carte = JSON.parse(JSON.stringify(EN1992));
  const c = carte.chapitres.flatMap((ch) => ch.clauses).find((x) => x.clause === '7.3.2')!;
  c.niveaux = [...(c.niveaux ?? []), { generation: 'ec2-2023', mecanisme: 'redistribution', niveau: 'fictif', clause: '7.3.2(9)', position: 'corps' }];
  return carte;
}
