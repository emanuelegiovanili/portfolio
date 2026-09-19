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

export const ABOUT_FOOTER_ROWS = { lg: 28 };

export const aboutBlocks = {
  aboutTitle: { lg: [2, 3, 4, 1] },
  aboutBioLabel: { lg: [8, 3, 1, 1] },
  aboutPortrait: { lg: [3, 4, 4, 5] },
  aboutBio: { lg: [8, 4, 4, 3] },
  aboutPin: { lg: [8, 8, 1, 1] },
  aboutLocation: { lg: [9, 8, 2, 1] },
  aboutRemote: { lg: [11, 9, 1, 1] },

  recipeIcon: { lg: [2, 11, 1, 1] },
  recipeTitle: { lg: [2, 12, 4, 1] },
  recipeFlame: { lg: [11, 12, 1, 1] },
  recipeOne: { lg: [3, 13, 3, 3] },
  recipeBlender: { lg: [6, 13, 1, 1] },
  recipeThree: { lg: [9, 13, 3, 3] },
  recipeTwo: { lg: [6, 14, 3, 3] },

  kitchenTitle: { lg: [2, 19, 3, 2] },
  kitchenPot: { lg: [5, 19, 1, 1] },
  kitchenPhoto: { lg: [3, 20, 8, 5] },

  spotifyCover: { lg: [6, 24, 2, 2] },
  spotifyTitle: { lg: [8, 24, 3, 1] },
  spotifyDisc: { lg: [11, 24, 1, 1] },
  spotifyPlaylist: { lg: [8, 25, 4, 1] },
} as const satisfies LayoutMap;

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
    ...tags.map((tag) => build(tag.toLowerCase().replace(/\s+/g, '-'), tag, tag)),
  ];
}

export const worksFooter = footerMap(WORKS_FOOTER_ROWS);

/* ---------- /works/[slug] ---------- */

export const WORK_FOOTER_ROWS = { lg: 45 };

export const workBlocks = {
  workCover: { lg: [2, 3, 10, 6] },
  workTitle: { lg: [2, 10, 5, 1] },
  workBody: { lg: [8, 10, 4, 5] },
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
