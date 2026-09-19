/**
 * Header e footer: le mappe di posizionamento dei componenti condivisi.
 *
 * Nel Figma non sono componenti, sono frame locali ricopiati pagina per pagina,
 * e infatti l'indicatore di link attivo e' rimasto su "Home" su tutte e cinque
 * le pagine. Qui sono uno solo.
 *
 * L'header sta sempre alla riga 1, quindi la sua mappa e' una costante. Il
 * footer no: cade all'ultima riga utile, che cambia da pagina a pagina, quindi
 * la sua mappa e' una funzione della riga di partenza.
 */

import type { LayoutMap, Tier } from '../layout';
import { SOCIAL } from '../site';

/** Riga di partenza del footer, tier per tier. */
export type FooterRows = Partial<Record<Tier, number>>;

export const headerMap = {
  logo: { base: [1, 1, 5, 2], md: [1, 1, 6, 1], lg: [1, 1, 4, 1] },
  headerContact: { base: [7, 1, 2, 2], md: [9, 1, 1, 1], lg: [11, 1, 1, 1] },
  headerMenu: { base: [9, 1, 2, 2], md: [10, 1, 1, 1], lg: [12, 1, 1, 1] },
} as const satisfies LayoutMap;

/**
 * Il footer occupa 10 colonne dalla 2, su due righe.
 *
 * A base la composizione e' diversa, non di poco: il brand e' alto due righe,
 * le voci sono 2x2, e il "Let's work together" non sta nella prima riga ma
 * diventa un bottone a fondo pagina accanto alla sesta voce. E' il mobile
 * l'anomalia: 767 e 1440 hanno entrambi cinque voci.
 */
export function footerMap(rows: FooterRows): LayoutMap {
  const map: LayoutMap = {};
  const put = (key: string, tier: Tier, col: number, rowOffset: number, c: number, r: number) => {
    const start = rows[tier];
    if (start === undefined) return;
    map[key] = { ...map[key], [tier]: [col, start + rowOffset, c, r] };
  };

  //     chiave              tier    col  riga+  span
  put('footerBrand', 'base', 2, 0, 8, 2);
  put('footerBrand', 'md', 2, 0, 5, 1);
  put('footerBrand', 'lg', 2, 0, 6, 1);

  put('footerWorkTogether', 'md', 7, 0, 3, 1);
  put('footerWorkTogether', 'lg', 8, 0, 4, 1);

  put('footerHome', 'base', 2, 2, 2, 2);
  put('footerHome', 'md', 2, 1, 2, 1);
  put('footerHome', 'lg', 2, 1, 2, 1);

  put('footerAbout', 'base', 4, 2, 2, 2);
  put('footerAbout', 'md', 4, 1, 2, 1);
  put('footerAbout', 'lg', 4, 1, 2, 1);

  put('footerWorks', 'base', 6, 2, 2, 2);
  put('footerWorks', 'md', 6, 1, 2, 1);
  put('footerWorks', 'lg', 6, 1, 2, 1);

  put('footerLinkedin', 'base', 8, 2, 2, 2);
  put('footerLinkedin', 'md', 8, 1, 1, 1);
  put('footerLinkedin', 'lg', 8, 1, 2, 1);

  put('footerInstagram', 'base', 8, 4, 2, 2);
  put('footerInstagram', 'md', 9, 1, 1, 1);
  put('footerInstagram', 'lg', 10, 1, 2, 1);

  // Solo a base: il "Let's work together" scende a fondo pagina come bottone.
  put('footerCta', 'base', 2, 4, 6, 2);

  return map;
}

/**
 * Le voci del footer, nell'ordine in cui compaiono.
 *
 * Gli URL dei due social non sono nel Figma e non me li sono inventati: un link
 * a un profilo sbagliato e' un bug che va online. Vedi NOTES.md B10.
 */
export const FOOTER_LINKS = [
  { key: 'footerHome', label: 'Home', href: '/', external: false },
  { key: 'footerAbout', label: 'About', href: '/about', external: false },
  { key: 'footerWorks', label: 'Works', href: '/works', external: false },
  { key: 'footerLinkedin', label: 'LinkedIn', href: SOCIAL.linkedin, external: true },
  { key: 'footerInstagram', label: 'Instagram', href: SOCIAL.instagram, external: true },
] as const;

/* ---------- Megamenu ---------- */

/**
 * Megamenu (268:1498).
 *
 * Il frame e' 1440x840: dodici colonne da 120 e sette righe, ma la settima e'
 * vuota. Qui le righe sono sei e il nero del pannello copre da solo il resto
 * della finestra, che e' esattamente cio' che si vede nel file.
 *
 * **I tier base e md sono una proposta, non un disegno.** Il Figma ha solo il
 * frame a 1440. Non sono inventati: ogni scelta viene da una regola che il file
 * applica gia' altrove, ed e' scritta in NOTES.md D65. In due parole:
 *
 *   - il bottone di chiusura sta **nella cella della hamburger di pagina**, tier
 *     per tier, perche' e' quello il gesto (D57): 9,1 2x2 a base, 10,1 1x1 a md;
 *   - il logo copia il logo dell'header, stessa cella;
 *   - a base "Let's work together" scende a fondo pagina come bottone largo,
 *     esattamente come fa il footer a base, dove a lg sta invece in prima riga;
 *   - le due voci prendono tutta la larghezza, perche' a dieci colonne il
 *     rientro di una colonna per lato del frame lg lascerebbe un titolo da
 *     64px in otto celle da 39.
 *
 *   logo    x=0    y=0    480x120   -> 1,1 span 4x1
 *   cta     x=840  y=0    480x120   -> 8,1 span 4x1
 *   chiudi  x=1320 y=0    120x120   -> 12,1 span 1x1
 *   Work    x=120  y=120  1200x240  -> 2,2 span 10x2
 *   About   x=120  y=360  1200x240  -> 2,4 span 10x2
 *   LinkedIn  x=840  y=600 240x120  -> 8,6 span 2x1
 *   Instagram x=1080 y=600 240x120  -> 10,6 span 2x1
 */
export const megamenuMap = {
  menuLogo: { base: [1, 1, 5, 2], md: [1, 1, 6, 1], lg: [1, 1, 4, 1] },
  menuClose: { base: [9, 1, 2, 2], md: [10, 1, 1, 1], lg: [12, 1, 1, 1] },
  menuCta: { base: [1, 14, 10, 2], md: [7, 1, 3, 1], lg: [8, 1, 4, 1] },
  menuWork: { base: [1, 4, 10, 3], md: [1, 3, 10, 3], lg: [2, 2, 10, 2] },
  menuAbout: { base: [1, 7, 10, 3], md: [1, 6, 10, 3], lg: [2, 4, 10, 2] },
  menuLinkedin: { base: [1, 11, 5, 2], md: [5, 10, 3, 1], lg: [8, 6, 2, 1] },
  menuInstagram: { base: [6, 11, 5, 2], md: [8, 10, 3, 1], lg: [10, 6, 2, 1] },
} as const satisfies LayoutMap;

/**
 * Le due voci del megamenu.
 *
 * Il file scrive "Work" al singolare qui e "Works" al plurale nel footer, per
 * la stessa pagina. Le copie si riproducono come stanno (NOTES.md B7).
 * Manca "Home": non la aggiungo, il logo in alto a sinistra porta li'.
 */
export const MENU_LINKS = [
  { key: 'menuWork', label: 'Work', href: '/works' },
  { key: 'menuAbout', label: 'About', href: '/about' },
] as const;

/** I due social del megamenu, nell'ordine del file. */
export const MENU_SOCIALS = [
  { key: 'menuLinkedin', label: 'LinkedIn', href: SOCIAL.linkedin },
  { key: 'menuInstagram', label: 'Instagram', href: SOCIAL.instagram },
] as const;
