import { describe, expect, it } from 'vitest';
import { calculerMatrice } from '../../../src/noyau/moteur/matrice';
import { chargeDynamique } from '../../../src/noyau/mecanismes/charge-dynamique/index';

// Valeurs attendues calculees a la main (docs/validation/charge-dynamique.md).

const cel = (e: object, g: string) => calculerMatrice(chargeDynamique, e).cellules.find((c) => c.generation === g)!;

describe('charges d exploitation dynamiques (EN 1991-1-1)', () => {
  it('helicoptere de 90 kN : HC3, 168 kN en 2025 ; hors classes en 2002', () => {
    expect(cel({ type: 'helicoptere', Q: 90 }, 'en1991-1-1-2025').sollicitation).toBeCloseTo(168, 12);
    expect(cel({ type: 'helicoptere', Q: 90 }, 'en1991-1-1-2002').statut.etat).toBe('non-applicable');
  });

  it('helicoptere de 45 kN : HC2, 84 kN dans les deux generations', () => {
    for (const g of ['en1991-1-1-2002', 'en1991-1-1-2025']) expect(cel({ type: 'helicoptere', Q: 45 }, g).sollicitation).toBeCloseTo(84, 12);
  });

  it('chariot FL3, essieu 63 kN : 88,2 kN (pneus) et 126 kN (roues pleines)', () => {
    expect(cel({ type: 'chariot-pneu', Q: 63 }, 'en1991-1-1-2025').sollicitation).toBeCloseTo(88.2, 12);
    expect(cel({ type: 'chariot-plein', Q: 63 }, 'en1991-1-1-2025').sollicitation).toBeCloseTo(126, 12);
  });
});
