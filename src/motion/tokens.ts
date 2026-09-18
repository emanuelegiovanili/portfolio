/** Durate ed ease del progetto, in un posto solo. */

export const DURATION = {
  /** Il disegno di una linea di griglia. */
  rule: 0.55,
  /** Lo scarto fra una linea e la successiva dentro lo stesso gruppo. */
  ruleStagger: 0.04,
} as const;

export const EASE = {
  /** Le linee entrano decise e si fermano senza rimbalzo: sono un righello. */
  rule: 'power2.out',
} as const;

/**
 * Inerzia dello smooth scroll, in secondi di ritardo.
 *
 * Sotto 0,6 non si sente, sopra 1,5 la pagina sembra scollegata dalla rotella.
 */
export const SMOOTH = 0.9;
