/**
 * La mappa di posizionamento della home.
 *
 * E' l'unica pagina con tutti e tre i tier, ed e' il motivo per cui si fa per
 * prima: valida il sistema responsive prima che venga replicato altrove.
 *
 * Gli span vengono dai frame 247:60 (1440), 321:2716 (767) e 314:2229 (390),
 * verificati nodo per nodo. Dove i nomi dei layer portano ancora lo span del
 * desktop, vale quello reale: `Hero Description Block-3x3` a base e' 7x9.
 */
import type { LayoutMap } from '../layout';
import { footerMap } from './chrome';

/** Riga di partenza del footer, tier per tier. */
export const HOME_FOOTER_ROWS = { base: 100, md: 62, lg: 41 };

export const homeBlocks = {
  heroText: { base: [2, 4, 8, 4], md: [2, 3, 6, 4], lg: [2, 2, 7, 4] },
  heroDescription: { base: [3, 8, 7, 9], md: [5, 7, 5, 4], lg: [9, 3, 3, 3] },
  // L'ultima riga del blocco descrizione: il quadrato e il bottone primario.
  // Sono blocchi a se' e non figli in flex, cosi' cadono sulle colonne invece
  // che sui bordi interni del blocco che li ospita (257:818, 321:2785, 314:2298).
  heroProfile: { base: [3, 15, 2, 2], md: [5, 10, 1, 1], lg: [9, 5, 1, 1] },
  heroDiscover: { base: [5, 15, 5, 2], md: [6, 10, 4, 1], lg: [10, 5, 2, 1] },

  // A md il marquee e' largo 1440 su una viewport da 767: sfora di proposito da
  // entrambi i lati. Il committente ha deciso il full bleed a tutti i tier
  // (NOTES.md D4), quindi lo span resta pieno e lo sbordo lo fa il CSS.
  marquee: { base: [1, 18, 10, 2], md: [1, 12, 10, 1], lg: [1, 7, 12, 1] },

  // Le tre skill card. L'ordine di lettura cambia per tier: a lg e md e'
  // Product, Web, Branding; a base e' Branding, Product, Web.
  skillProduct: { base: [6, 32, 4, 3], md: [7, 14, 3, 3], lg: [6, 9, 3, 2] },
  skillWeb: { base: [3, 35, 4, 3], md: [7, 17, 3, 3], lg: [9, 10, 3, 2] },
  skillBranding: { base: [2, 32, 4, 3], md: [7, 20, 3, 3], lg: [7, 12, 3, 2] },

  about: { base: [2, 22, 7, 10], md: [2, 15, 5, 6], lg: [2, 10, 4, 4] },

  worksSection: { base: [2, 40, 6, 2], md: [2, 24, 5, 3], lg: [2, 16, 3, 2] },
  // A md l'istanza del Figma (321:2815) e' rimasta 240x120, la misura del
  // desktop, a y=1882 che non e' multiplo di 77. Qui e' 3x1 allineata.
  worksViewAll: { base: [3, 51, 5, 2], md: [7, 25, 3, 1], lg: [10, 17, 2, 1] },
  worksImage: { base: [2, 42, 7, 9], md: [2, 27, 7, 8], lg: [3, 18, 8, 5] },
  worksPagination: { base: [9, 48, 1, 1], md: [9, 32, 1, 1], lg: [11, 20, 1, 1] },
  worksPrev: { base: [9, 49, 1, 1], md: [9, 33, 1, 1], lg: [11, 21, 1, 1] },
  worksNext: { base: [9, 50, 1, 1], md: [9, 34, 1, 1], lg: [11, 22, 1, 1] },

  testimonialsSection: { base: [2, 58, 6, 3], md: [2, 37, 6, 3], lg: [2, 25, 4, 2] },
  testimonialsIcon: { base: [8, 60, 1, 1], md: [8, 39, 1, 1], lg: [6, 26, 1, 1] },
  // A base la riga e' larga 468 su 390: diventa a scorrimento orizzontale, e lo
  // span resta quello della griglia mentre il contenitore sborda. Vedi D32.
  testimonialsRow: { base: [2, 61, 8, 2], md: [2, 40, 8, 1], lg: [2, 27, 8, 1] },
  testimonialsContainer: { base: [2, 63, 8, 10], md: [2, 41, 8, 4], lg: [2, 28, 10, 3] },
  // 266:1178 e 266:1181: due celle in fondo a destra della riga di navigazione.
  //
  // A base e md nel file non ci sono, e il carosello restava senza comandi: da
  // li' si poteva solo aspettare i dieci secondi. Sono su richiesta del
  // committente, nella stessa posizione che hanno a lg — ultime due colonne del
  // contenitore, riga subito sotto — che e' la stessa regola con cui stanno le
  // frecce del carosello dei lavori.
  testimonialsPrev: { base: [8, 73, 1, 1], md: [8, 45, 1, 1], lg: [10, 31, 1, 1] },
  testimonialsNext: { base: [9, 73, 1, 1], md: [9, 45, 1, 1], lg: [11, 31, 1, 1] },

  contactForm: { base: [2, 80, 8, 16], md: [3, 51, 7, 8], lg: [3, 33, 5, 6] },
  contactCta: { base: [2, 75, 7, 5], md: [2, 47, 6, 5], lg: [8, 34, 4, 3] },
  contactSend: { base: [5, 96, 5, 2], md: [7, 60, 3, 1], lg: [8, 37, 2, 1] },
} as const satisfies LayoutMap;

export const homeFooter = footerMap(HOME_FOOTER_ROWS);
