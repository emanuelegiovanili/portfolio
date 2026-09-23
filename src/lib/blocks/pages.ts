/**
 * Le mappe delle quattro pagine interne.
 *
 * Tutte e quattro esistono **solo a desktop**: sotto 1200px il Figma non ha un
 * disegno, quindi qui c'e' solo il tier lg e `resolveTier` fa cadere i tier
 * piu' piccoli su di esso. E' una deviazione consapevole, vedi NOTES.md B2.
 *
 * Gli span vengono da pagine-interne-handoff §3 e §9, verificati nodo per nodo.
 * Dove il file e' fuori griglia si usa lo span, mai il pixel: `310:1798` e
 * `312:1991` stanno a x=114 invece che a 120.
 */
import type { LayoutMap } from '../layout';
import { footerMap } from './chrome';

/* ---------- /about ---------- */

export const ABOUT_FOOTER_ROWS = { base: 90, md: 90, lg: 35 };

/**
 * A md /about non ha un disegno suo, e prende quello di base.
 *
 * Non e' una scelta di ripiego: fra 720 e 1199 il file non disegna niente, e
 * senza una dichiarazione esplicita la regola che nasconde i blocchi fuori dal
 * proprio tier **non si applica** — vale solo se la pagina dichiara quel tier
 * (grid.css). Il risultato sarebbe la riga di schede di base e le tre schede di
 * desktop insieme, sovrapposte.
 *
 * Dichiarando md uguale a base si ottiene quello che la catena dei fallback
 * avrebbe fatto comunque — le colonne sono dieci in tutti e due i tier — ma
 * detto, quindi con le regole di visibilita' che funzionano.
 */
function mdComeBase(map: LayoutMap): LayoutMap {
  return Object.fromEntries(
    Object.entries(map).map(([chiave, posti]) => [chiave, posti.base ? { ...posti, md: posti.base } : posti]),
  );
}

export const aboutBlocks = mdComeBase({
  aboutTitle: { base: [2, 4, 6, 2], lg: [2, 3, 4, 1] },
  aboutBioLabel: { base: [8, 17, 2, 2], lg: [8, 3, 1, 1] },
  aboutPortrait: { base: [2, 6, 8, 10], lg: [3, 4, 4, 5] },
  aboutBio: { base: [2, 19, 8, 9], lg: [8, 4, 4, 3] },
  aboutPin: { base: [2, 29, 2, 2], lg: [8, 8, 1, 1] },
  aboutLocation: { base: [4, 29, 6, 2], lg: [9, 8, 2, 1] },
  aboutRemote: { base: [8, 31, 2, 2], lg: [11, 9, 1, 1] },

  recipeIcon: { base: [2, 35, 2, 2], lg: [2, 11, 1, 1] },
  recipeTitle: { base: [2, 37, 7, 2], lg: [2, 12, 4, 1] },
  recipeFlame: { lg: [11, 12, 1, 1] },
  /*
   * Quattro righe, non tre.
   *
   * Nel frame le schede sono 360x360 (299:277, 299:314, 299:317) e il testo
   * nuovo dentro non ci sta: misurato, a 1440 ne chiede **13px** in piu' e a
   * 1200 fino a 63, cioe' due righe e mezzo di corpo tagliate via. Nel file il
   * problema c'e' lo stesso — la scheda ha `overflow-clip` e il testo e' ad
   * altezza automatica — solo che li' non si vede.
   *
   * Una riga in piu' e non un corpo piu' piccolo: il testo e' del committente e
   * non si tocca. E' la stessa decisione di D109 per la citazione di TAMA e di
   * D127 per il case study. Non tocca nessuno degli altri blocchi: il frullino
   * resta alla riga 13, dove la seconda scheda non arriva, e il form comincia
   * dove la seconda scheda finisce.
   */
  /*
   * A base le tre schede stanno in una riga sola, e la riga e' piu' larga
   * della finestra: 21 colonne dentro a 10 (356:622, largo 818 in un frame da
   * 390). E' il blocco che la contiene, alto nove righe come le schede.
   *
   * Tutta la larghezza della griglia, e il blocco e' `bare`.
   *
   * Nel file la riga e' tagliata dal frame a 390, non da un contenitore: e'
   * il **bordo dello schermo** a tagliare le schede, da tutti e due i lati.
   * Un blocco che si ferma alla nona colonna taglia a destra a 351, uno che si
   * ferma alla seconda taglia a sinistra a 39. Quindi il blocco prende tutta
   * la griglia e non disegna niente: il contorno e' delle schede, e il margine
   * di pagina glielo danno le due colonne vuote del binario. Vedi NOTES.md
   * D141.
   */
  recipeSteps: { base: [1, 39, 10, 9] },
  recipeOne: { lg: [3, 13, 3, 4] },
  recipeBlender: { lg: [6, 13, 1, 1] },
  recipeThree: { lg: [9, 13, 3, 4] },
  recipeTwo: { lg: [6, 14, 3, 4] },

  /*
   * La sezione di contatto, che prima su /about non c'era.
   *
   * Arriva con il frame aggiornato (382:3672, 382:3700, 382:3703) e usa lo
   * stesso componente di home, works e contact: non e' un secondo form da
   * mantenere.
   */
  aboutForm: { base: [2, 54, 8, 16], lg: [3, 18, 5, 6] },
  aboutCta: { base: [2, 49, 7, 5], lg: [8, 19, 4, 3] },
  aboutSend: { base: [5, 70, 5, 2], lg: [8, 22, 2, 1] },

  /*
   * Da qui in giu' tutto scende di **sette righe**, per far posto al contatto.
   *
   * Nel frame questi quattro stanno 26 pixel sopra la linea: 2974 invece di
   * 3000, 3094 invece di 3120, 3574 invece di 3600, 3694 invece di 3720.
   * Ventisei pixel identici su tutti e quattro, cioe' un gruppo trascinato a
   * mano e non quattro posizioni scelte. Qui si torna sulla linea — la regola
   * zero non ammette scostamenti — e la prova che il numero giusto e' sette e'
   * che tutti e quattro tornano esatti con lo stesso spostamento, e la loro
   * distanza reciproca resta quella di prima.
   */
  kitchenTitle: { base: [2, 74, 6, 2], lg: [2, 26, 3, 2] },
  kitchenPot: { base: [8, 74, 2, 2], lg: [5, 26, 1, 1] },
  kitchenPhoto: { base: [3, 76, 7, 6], lg: [3, 27, 8, 5] },

  spotifyCover: { base: [2, 82, 2, 2], lg: [6, 31, 2, 2] },
  spotifyTitle: { base: [4, 82, 5, 2], lg: [8, 31, 3, 1] },
  spotifyDisc: { base: [8, 86, 2, 2], lg: [11, 31, 1, 1] },
  spotifyPlaylist: { base: [2, 84, 8, 2], lg: [8, 32, 4, 1] },
} as const satisfies LayoutMap);

export const aboutFooter = footerMap(ABOUT_FOOTER_ROWS);

/* ---------- /works ---------- */

export const WORKS_FOOTER_ROWS = { lg: 28 };

export const worksBlocks = {
  worksTitle: { lg: [2, 3, 4, 1] },
  worksFlame: { lg: [6, 3, 1, 1] },
  worksContactForm: { lg: [3, 20, 5, 6] },
  worksContactCta: { lg: [8, 21, 4, 3] },
  worksContactSend: { lg: [8, 24, 2, 1] },
} as const satisfies LayoutMap;

/** I quattro filtri, da col 3 in avanti, due colonne ciascuno. */
export function worksFilterAt(index: number): LayoutMap[string] {
  return { lg: [3 + index * 2, 4, 2, 1] };
}

/** Quante righe occupa una card, contando lo stacco dalla successiva. */
export const WORKS_CARD_STRIDE = 4;

/** La riga della card che occupa il posto `index`. */
export function worksCardRow(index: number): number {
  return 5 + index * WORKS_CARD_STRIDE;
}

/** Le card progetto: 8x4 da col 3, una ogni quattro righe a partire dalla 5. */
export function worksCardAt(index: number): LayoutMap[string] {
  return { lg: [3, worksCardRow(index), 8, 4] };
}

/**
 * Gli stati del filtro di /works.
 *
 * Filtrare **sposta i blocchi sulla griglia**: con meno card, tutto quello che
 * sta sotto sale di quattro righe per card tolta, e la pagina si accorcia di
 * altrettanto. Non e' un `display: none` su qualche elemento, e' un layout
 * diverso.
 *
 * Le righe di ogni stato si calcolano **qui, al build**. In pagina diventano
 * una custom property per stato, e il JavaScript sceglie quale stato e' attivo:
 * non calcola posizioni, non sa quanto e' alta una card, non puo' inventarsi un
 * numero che non cade su una linea. E' la stessa regola di sempre — la
 * posizione viene dalla mappa — applicata a quattro mappe invece che a una.
 */
export interface WorksFilterState {
  /** Identificatore usato nell'attributo e nei nomi delle custom property. */
  slug: string;
  label: string;
  /** `null` per "All". */
  tag: string | null;
  /** Gli id dei progetti visibili, nell'ordine in cui compaiono. */
  ids: string[];
  /** Di quante righe sale tutto cio' che sta sotto le card. */
  shift: number;
  /** L'ultima riga occupata dalla pagina in questo stato. */
  rows: number;
}

/**
 * Lo slug di un tag, dentro un indirizzo e dentro il CSS.
 *
 * Serve in due posti che non si parlano — lo stato del filtro qui, e il link
 * dalle card del "mix" in home — e due copie della stessa riga divergono al
 * primo tag con un carattere fuori dall'alfabeto.
 */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export function worksFilterStates(
  works: { id: string; tags: readonly string[] }[],
  tags: readonly string[],
  rowsFull: number,
): WorksFilterState[] {
  const build = (slug: string, label: string, tag: string | null): WorksFilterState => {
    const ids = works.filter((w) => tag === null || w.tags.includes(tag)).map((w) => w.id);
    const shift = WORKS_CARD_STRIDE * (works.length - ids.length);
    return { slug, label, tag, ids, shift, rows: rowsFull - shift };
  };

  return [
    build('all', 'All', null),
    ...tags.map((tag) => build(tagSlug(tag), tag, tag)),
  ];
}

export const worksFooter = footerMap(WORKS_FOOTER_ROWS);

/* ---------- /works/[slug] ---------- */

export const WORK_FOOTER_ROWS = { lg: 45 };

export const workBlocks = {
  workCover: { lg: [2, 3, 10, 6] },
  // Nell'angolo in basso a destra della copertina: le sue ultime due colonne,
  // la sua ultima riga. Compare solo dove il progetto ha un `liveUrl`.
  workVisit: { lg: [10, 8, 2, 1] },
  workTitle: { lg: [2, 10, 5, 1] },
  /*
   * Sei righe, non cinque.
   *
   * Nel frame il testo e' un nodo solo alto cinque celle (310:1795), scritto
   * su una versione piu' corta. Il testo che il committente ha fornito e' piu'
   * lungo **ed e' diviso in paragrafi**, e i tre stacchi di Seezy si mangiavano
   * tutto lo spazio: misurato, avanzavano **2px**. Non e' "ci sta", e' "ci sta
   * su questa macchina" — in CI le metriche dei font sono diverse, e nei log si
   * vede (lo stesso blocco misura +384h qui e +405h la').
   *
   * La riga in piu' non sposta niente: sotto, nelle colonne 8-11, le righe 15 e
   * 16 sono libere, perche' la galleria sta nelle colonne 2-6. E' la stessa
   * decisione presa per la citazione di TAMA in D109, che qui costa anche meno.
   */
  workBody: { lg: [8, 10, 4, 6] },
  workRelatedTitle: { lg: [2, 37, 5, 2] },
  workRelatedFlame: { lg: [6, 37, 1, 1] },
  workRelatedOne: { lg: [7, 37, 5, 4] },
  workRelatedTwo: { lg: [2, 39, 5, 4] },
  workViewAll: { lg: [7, 41, 2, 1] },
} as const satisfies LayoutMap;

/** I due tag, celle 1x1 adiacenti a partire da col 8. */
export function workTagAt(index: number): LayoutMap[string] {
  return { lg: [8 + index, 9, 1, 1] };
}

/**
 * L'insieme chiuso di blocchi su cui si compone la galleria.
 *
 * Il layout del case study nel Figma e' su misura per Seezy e alterna blocchi
 * 10x6 a coppie 5x4. Qui e' una sequenza di due forme sole, dichiarata nel JSON
 * del progetto, cosi' la pagina regge un numero qualsiasi di immagini invece di
 * una sequenza cucita addosso a un progetto solo. Vedi pagine-interne §7.7.
 */
const GALLERY_SLOTS = [
  { shape: 'half', at: [2, 12, 5, 4] },
  { shape: 'wide', at: [2, 17, 10, 6] },
  { shape: 'wide', at: [2, 24, 10, 6] },
  { shape: 'half', at: [2, 31, 5, 4] },
  { shape: 'half', at: [7, 31, 5, 4] },
] as const;

export function galleryAt(index: number): LayoutMap[string] {
  const slot = GALLERY_SLOTS[Math.min(index, GALLERY_SLOTS.length - 1)];
  return { lg: slot.at };
}

export function gallerySlots(): readonly (typeof GALLERY_SLOTS)[number][] {
  return GALLERY_SLOTS;
}

export const workFooter = footerMap(WORK_FOOTER_ROWS);

/* ---------- /contact ---------- */

export const CONTACT_FOOTER_ROWS = { lg: 12 };

export const contactBlocks = {
  contactTitle: { lg: [2, 3, 4, 2] },
  contactIcon: { lg: [5, 5, 1, 1] },
  contactForm: { lg: [7, 3, 5, 6] },
  contactSend: { lg: [7, 9, 2, 1] },
} as const satisfies LayoutMap;

export const contactFooter = footerMap(CONTACT_FOOTER_ROWS);
