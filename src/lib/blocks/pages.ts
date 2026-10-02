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
import type { LayoutMap, Tier } from '../layout';
import { footerMap } from './chrome';

/* ---------- /about ---------- */

export const ABOUT_FOOTER_ROWS = { base: 104, md: 104, lg: 34 };

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

  /*
   * "What I actually do": la sezione nuova, fra la biografia e la ricetta.
   *
   * A desktop le tre schede sono sfalsate come quelle della ricetta — righe 13,
   * 14 e 15 — e sono 3x3 e non 3x4 (397:936, 397:930, 397:942). A mobile stanno
   * in colonna, larghe otto celle, e **non sono alte uguali**: sette, otto e
   * sette righe (400:977, 400:980, 400:983). E' il file: la seconda ha un testo
   * piu' lungo e il blocco cresce invece di stringere il corpo.
   *
   * La pentola sta sotto al titolo a desktop e sopra a mobile. Anche questo e'
   * il file, e non c'e' niente da dedurre: 310:1484 contro 400:968.
   */
  whatIcon: { base: [2, 34, 2, 2], lg: [6, 12, 1, 1] },
  whatTitle: { base: [2, 36, 7, 4], lg: [2, 11, 4, 2] },
  sectorOne: { base: [2, 40, 8, 7], lg: [3, 13, 3, 3] },
  sectorTwo: { base: [2, 47, 8, 8], lg: [6, 14, 3, 3] },
  sectorThree: { base: [2, 55, 8, 7], lg: [9, 15, 3, 3] },

  /*
   * La ricetta scende di sette righe a desktop e di ventinove a mobile: sopra
   * c'e' la sezione nuova. Le schede passano da 3x4 a 3x3 (299:277, 299:314,
   * 299:317) e il frullino fra la prima e la seconda non c'e' piu'.
   */
  recipeIcon: { base: [2, 64, 2, 2], lg: [2, 18, 1, 1] },
  recipeTitle: { base: [2, 66, 7, 2], lg: [2, 19, 4, 1] },
  recipeFlame: { lg: [11, 19, 1, 1] },
  recipeSteps: { base: [1, 68, 10, 9] },
  recipeOne: { lg: [3, 20, 3, 3] },
  recipeTwo: { lg: [6, 21, 3, 3] },
  recipeThree: { lg: [9, 20, 3, 3] },

  aboutCta: { base: [2, 79, 7, 5], lg: [8, 27, 4, 3] },
  aboutForm: { base: [2, 84, 8, 16], lg: [3, 26, 5, 6] },
  aboutSend: { base: [5, 100, 5, 2], lg: [8, 30, 2, 1] },
} as const satisfies LayoutMap);

export const aboutFooter = footerMap(ABOUT_FOOTER_ROWS);

/* ---------- /works ---------- */

export const WORKS_FOOTER_ROWS = { base: 71, md: 71, lg: 28 };

export const worksBlocks = mdComeBase({
  worksTitle: { base: [2, 4, 6, 2], lg: [2, 3, 4, 1] },
  worksFlame: { base: [8, 4, 2, 2], lg: [6, 3, 1, 1] },
  /*
   * La barra dei filtri a base: un blocco nudo largo quanto la griglia, dentro
   * al quale i quattro tab scorrono di lato.
   *
   * Nel file la riga e' larga 627 dentro 390 (397:389) e la taglia il frame,
   * esattamente come la riga delle schede di /about. Quindi stessa costruzione:
   * il contenitore non disegna niente, i margini di pagina li da' il padding
   * del binario, e il contorno e' dei tab. Vedi D141.
   */
  worksFilterBar: { base: [1, 6, 10, 2] },
  worksContactForm: { base: [2, 51, 8, 16], lg: [3, 20, 5, 6] },
  worksContactCta: { base: [2, 46, 7, 5], lg: [8, 21, 4, 3] },
  worksContactSend: { base: [5, 67, 5, 2], lg: [8, 24, 2, 1] },
} as const satisfies LayoutMap);

/** I quattro filtri a desktop, da col 3 in avanti, due colonne ciascuno. */
export function worksFilterAt(index: number): LayoutMap[string] {
  return { lg: [3 + index * 2, 4, 2, 1] };
}

/**
 * Quante righe occupa una card, contando lo stacco dalla successiva, e da
 * quale riga comincia la prima.
 *
 * A desktop sono 8x4 una ogni quattro righe dalla quinta (310:1492); a mobile
 * sono 8x12 una ogni dodici dalla ottava (397:390, 397:403, 397:420). Le due
 * misure stanno qui e non sparse, perche' chi filtra le usa tutte e due.
 */
const PASSO_CARD = { base: 12, md: 12, lg: 4 } as const;
const PRIMA_CARD = { base: 8, md: 8, lg: 5 } as const;

/** La riga della card che occupa il posto `index`, nel tier dato. */
export function worksCardRow(index: number, tier: Tier): number {
  return PRIMA_CARD[tier] + index * PASSO_CARD[tier];
}

export function worksCardAt(index: number): LayoutMap[string] {
  return {
    base: [2, worksCardRow(index, 'base'), 8, 12],
    md: [2, worksCardRow(index, 'md'), 8, 12],
    lg: [3, worksCardRow(index, 'lg'), 8, 4],
  };
}

/**
 * Gli stati del filtro di /works.
 *
 * Filtrare **sposta i blocchi sulla griglia**: con meno card, tutto quello che
 * sta sotto sale di un passo per card tolta, e la pagina si accorcia di
 * altrettanto. Non e' un `display: none` su qualche elemento, e' un layout
 * diverso.
 *
 * Le righe di ogni stato si calcolano **qui, al build**. In pagina diventano
 * una custom property per stato, e il JavaScript sceglie quale stato e' attivo:
 * non calcola posizioni, non sa quanto e' alta una card, non puo' inventarsi un
 * numero che non cade su una linea.
 *
 * Da quando /works ha anche un tier base, `shift` e `rows` sono **per tier**:
 * a mobile una card ne vale dodici di righe e a desktop quattro, quindi un
 * numero solo darebbe la pagina giusta a una larghezza e sbagliata all'altra.
 */
export interface WorksFilterState {
  /** Identificatore usato nell'attributo e nei nomi delle custom property. */
  slug: string;
  label: string;
  /** `null` per "All". */
  tag: string | null;
  /** Gli id dei progetti visibili, nell'ordine in cui compaiono. */
  ids: string[];
  /** Di quante righe sale tutto cio' che sta sotto le card, tier per tier. */
  shift: Partial<Record<Tier, number>>;
  /** L'ultima riga occupata dalla pagina in questo stato, tier per tier. */
  rows: Partial<Record<Tier, number>>;
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
  rowsFull: Partial<Record<Tier, number>>,
  etichettaTutti: string,
): WorksFilterState[] {
  const build = (slug: string, label: string, tag: string | null): WorksFilterState => {
    const ids = works.filter((w) => tag === null || w.tags.includes(tag)).map((w) => w.id);
    const tolte = works.length - ids.length;
    const shift: Partial<Record<Tier, number>> = {};
    const rows: Partial<Record<Tier, number>> = {};
    for (const tier of ['base', 'md', 'lg'] as const) {
      const pieno = rowsFull[tier];
      if (pieno === undefined) continue;
      shift[tier] = PASSO_CARD[tier] * tolte;
      rows[tier] = pieno - shift[tier]!;
    }
    return { slug, label, tag, ids, shift, rows };
  };

  /*
   * L'etichetta di "All" arriva da fuori perche' e' copy, e la copy sta nei
   * dizionari. Nei fatti dice "All" in tutte e due le lingue — lo mostra il
   * frame italiano 423:313, come i tag — ma la differenza fra "e' uguale" e
   * "e' scritto in un posto solo" si vede il giorno che smette di esserlo.
   *
   * I tag invece restano come sono: "Branding", "Product", "Web Design" sono i
   * valori su cui la pagina filtra, non parole da tradurre.
   */
  return [build('all', etichettaTutti, null), ...tags.map((tag) => build(tagSlug(tag), tag, tag))];
}

export const worksFooter = footerMap(WORKS_FOOTER_ROWS);

/* ---------- /works/[slug] ---------- */

export const WORK_FOOTER_ROWS = { base: 79, md: 79, lg: 45 };

export const workBlocks = mdComeBase({
  workCover: { base: [2, 5, 8, 12], lg: [2, 3, 10, 6] },
  /*
   * Nell'angolo in basso a destra della copertina: le sue ultime due colonne,
   * la sua ultima riga. Compare solo dove il progetto ha un `liveUrl`.
   *
   * A base il frame non lo disegna — 397:621 e' una copertina e basta — ma
   * quel frame e' di Seezy, che un sito online non ce l'ha, quindi il file non
   * dice ne' si' ne' no. Qui vale la stessa regola di desktop applicata alla
   * copertina di mobile, e due celle per due invece di due per una: sotto i
   * 1200 tutti i comandi quadrati del sito sono 2x2. Scostamento dichiarato in
   * NOTES.md D145 — l'alternativa era togliere a chi sta sul telefono l'unico
   * link al sito del progetto.
   */
  workVisit: { base: [8, 15, 2, 2], lg: [10, 8, 2, 1] },
  workTitle: { base: [2, 18, 8, 2], lg: [2, 10, 5, 1] },
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
  workBody: { base: [2, 22, 8, 10], lg: [8, 10, 4, 6] },
  workRelatedTitle: { lg: [2, 37, 5, 2] },
  workRelatedFlame: { lg: [6, 37, 1, 1] },
  workRelatedOne: { lg: [7, 37, 5, 4] },
  workRelatedTwo: { lg: [2, 39, 5, 4] },
  workViewAll: { lg: [7, 41, 2, 1] },
} as const satisfies LayoutMap);

/** I due tag, celle 1x1 adiacenti a partire da col 8. */
export function workTagAt(index: number): LayoutMap[string] {
  return {
    base: [6 + index * 2, 20, 2, 2],
    md: [6 + index * 2, 20, 2, 2],
    lg: [8 + index, 9, 1, 1],
  };
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

/*
 * A base le forme non ci sono: cinque riquadri uguali, otto per otto, uno ogni
 * nove righe dalla trentatreesima (397:765, 397:767, 397:769, 397:772,
 * 397:776). Su una colonna sola `wide` e `half` non vogliono dire niente.
 */
const GALLERY_BASE = [33, 42, 51, 60, 69] as const;

export function galleryAt(index: number): LayoutMap[string] {
  const i = Math.min(index, GALLERY_SLOTS.length - 1);
  const riga = GALLERY_BASE[i];
  return { base: [2, riga, 8, 8], md: [2, riga, 8, 8], lg: GALLERY_SLOTS[i].at };
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
  /*
   * Telefono e indirizzo, 423:147. Tre celle e non quattro: nel file ne occupa
   * quattro e si sovrappone all'icona a colonna 5. Vedi il commento in
   * contact.astro e NOTES.md D148.
   */
  contactDetails: { lg: [2, 5, 3, 1] },

  /*
   * Il form perde una riga, e non e' una scelta di layout: il committente ha
   * tolto il check del consenso da tutte le pagine, e qui il frame nuovo
   * (423:602) lo mostra alto 600 invece di 719. Cinque righe, non sei, e il
   * bottone sale di conseguenza.
   *
   * **Solo qui.** Su home, /about e /works i frame italiani mostrano il form
   * ancora alto sei righe (416:3263, 423:510): li' il contenuto ha una riga di
   * respiro in piu' e il blocco non si muove. Stringere anche quelli vorrebbe
   * dire spostare CTA, bottone e footer di tre pagine senza un disegno con cui
   * verificare il risultato, che e' esattamente il modo in cui la regola zero
   * si rompe senza accorgersene.
   */
  contactForm: { lg: [7, 3, 5, 5] },
  contactSend: { lg: [7, 8, 2, 1] },
} as const satisfies LayoutMap;

export const contactFooter = footerMap(CONTACT_FOOTER_ROWS);
