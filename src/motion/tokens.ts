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
export const SMOOTH = 0.8;

/**
 * L'entrata del megamenu.
 *
 * Il pannello entra da destra e il suo contenuto si contro-trasla della stessa
 * quantita': quello che si muove e' il ritaglio, non i blocchi. Nessun blocco
 * bordato si sposta mai di un pixel, che e' la regola del progetto.
 *
 * I valori sono quelli proposti da `home-handoff` §11.
 */
export const MENU = {
  /** La tendina che scopre il pannello. */
  wipe: 0.7,
  ease: 'power3.inOut',
  /** Il contenuto che compare dietro alla tendina. */
  fade: 0.4,
  stagger: 0.06,
  /** Quando il contenuto comincia: un quarto di secondo prima che la tendina finisca. */
  contentAt: 0.45,
  /** Si esce piu' in fretta di quanto si entri: 0,7 -> 0,5 secondi. */
  exitScale: 0.7,
  /** Sotto reduced motion resta la sola dissolvenza. */
  reducedFade: 0.2,
} as const;
