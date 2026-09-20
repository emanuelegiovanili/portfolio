/** Durate ed ease del progetto, in un posto solo. */

export const DURATION = {
  /** Il disegno di una linea di griglia. */
  rule: 0.55,
  /**
   * Il giro del filo attorno a un blocco, dove a muoverlo e' una timeline e
   * non lo scroll: nel megamenu.
   *
   * E' il doppio di `rule` perche' il percorso e' il doppio: il filo fa tutto
   * il perimetro invece di due lati soli. Sulle pagine questa durata non serve,
   * perche' li' l'avanzamento lo detta lo scroll.
   */
  trace: 1.1,
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

/**
 * Il marquee.
 *
 * La velocita' e' in pixel al secondo e non in secondi per giro: la durata la
 * detta la larghezza, cosi' su uno schermo largo il testo non scorre piu' in
 * fretta. Il file non da' ne' l'una ne' l'altra — dice solo "autoscroll" nel
 * nome del layer — quindi 70px/s e' una scelta, tarata perche' una parola da
 * 32px resti leggibile mentre passa.
 */
export const MARQUEE = {
  speed: 70,
  /** Il passo di riposo, da 250:196: 48 pixel di disegno. */
  minGap: 48,
} as const;

/**
 * Il carosello.
 *
 * La slide che esce e quella che entra si muovono insieme: la durata e' quella
 * di un gesto, non di un'entrata, ed e' la stessa della tendina del megamenu
 * diviso due.
 */
export const CAROUSEL = {
  slide: 0.55,
  ease: 'power3.inOut',
} as const;

/**
 * I testimonial.
 *
 * `dwell` e' quanto resta su una scheda prima di passare alla successiva, ed e'
 * anche la durata della barra sotto la scheda attiva: sono la stessa cosa vista
 * da due parti. Il Figma non lo dice, mostra la barra a tre quarti, cioe' un
 * fermo-immagine. I dieci secondi sono una richiesta del committente.
 */
export const TESTIMONIAL = {
  dwell: 10,
  fade: 0.22,
} as const;

/**
 * Il titolo e le categorie di una card progetto.
 *
 * Salgono da sotto il bordo della card, uno dopo l'altro. Non e' nel Figma:
 * e' una richiesta del committente, e i valori sono una scelta — abbastanza
 * lenti da leggersi, abbastanza sfalsati da sentirsi come una sequenza e non
 * come un blocco solo che si alza.
 */
export const CARD = {
  rise: 0.5,
  stagger: 0.08,
  ease: 'power3.out',
} as const;
