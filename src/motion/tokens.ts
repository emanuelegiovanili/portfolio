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
 * Da 0,9 a 1,2 su richiesta del committente: e' il ritardo con cui la pagina
 * raggiunge la rotella, non la distanza che percorre a ogni scatto. Quella la
 * cambierebbe `speed` su ScrollSmoother, che qui non e' impostata e resta a 1.
 *
 * Chi cambia questo numero tocca anche l'ancora interna: il fuoco arriva a
 * `SMOOTH + 0.2` (motion.ts), e l'attesa della sonda in `verify:motion` deve
 * restare piu' lunga di cosi'.
 */
export const SMOOTH = 1.2;

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
 * fermo-immagine. La durata e' una richiesta del committente: prima dieci
 * secondi, poi quindici — con due citazioni lunghe, dieci non bastavano a
 * leggerle prima che la scheda cambiasse.
 */
export const TESTIMONIAL = {
  dwell: 15,
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

/**
 * Il sipario fra una pagina e l'altra.
 *
 * Un pannello del colore della pagina sale dal basso a coprire, sotto parte la
 * navigazione vera, e la pagina nuova arriva gia' coperta e si scopre uscendo
 * dall'alto. Il movimento e' uno solo e va sempre nella stessa direzione: non
 * e' una tendina che va e torna, e' un foglio che passa.
 *
 * Il caricamento sta nascosto dentro la copertura, quindi `cover` non e' solo
 * estetica: e' il tempo che il browser ha per cominciare a prendere la pagina
 * nuova prima che si veda qualcosa. Sotto i tre decimi il taglio si sente.
 *
 * Non e' nel Figma: e' una richiesta del committente. Vedi NOTES.md D142.
 */
export const SIPARIO = {
  /** Sale a coprire, al click. */
  cover: 0.45,
  /** Esce dall'alto, a pagina nuova caricata. */
  reveal: 0.55,
  /** Se il modulo non arriva, il sipario si alza lo stesso dopo tanto. */
  soccorso: 1500,
  ease: 'power3.inOut',
} as const;
