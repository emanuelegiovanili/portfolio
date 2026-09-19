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
 * Il frame e' 1440x840: dodici colonne da 120 e sette righe. I nodi del file
 * lasciano l'ultima riga vuota e mettono i social in sesta; per decisione del
 * committente i social occupano **sesta e settima**, cosi' il menu riempie il
 * frame invece di lasciarne fuori un ottavo.
 *
 * La riga 1 va da bordo a bordo — logo, CTA, chiudi — e tutto il resto rientra
 * di **una colonna per lato**, a ogni tier. E' la regola che il file applica a
 * desktop (le voci stanno da 2 a 11 di 12) e che il committente ha chiesto di
 * tenere anche sotto.
 *
 * **I tier base e md restano una proposta**, perche' un frame per gli schermi
 * piccoli non esiste. Nessuna scelta e' inventata: ognuna viene da una regola
 * che il file applica gia' altrove, e sono elencate in NOTES.md D66.
 *
 *   base       md          lg
 *   10 colonne 10 colonne  12 colonne
 *   13 righe   10 righe    7 righe
 */
export const megamenuMap = {
  // Riga 1: da bordo a bordo, come nel frame.
  menuLogo: { base: [1, 1, 5, 2], md: [1, 1, 6, 1], lg: [1, 1, 4, 1] },
  menuClose: { base: [9, 1, 2, 2], md: [10, 1, 1, 1], lg: [12, 1, 1, 1] },
  menuCta: { base: [2, 12, 8, 2], md: [7, 1, 3, 1], lg: [8, 1, 4, 1] },

  // Il resto rientra di una colonna per lato.
  menuWork: { base: [2, 4, 8, 3], md: [2, 3, 8, 3], lg: [2, 2, 10, 2] },
  menuAbout: { base: [2, 7, 8, 3], md: [2, 6, 8, 3], lg: [2, 4, 10, 2] },

  // Attaccati sotto ad About, e alti due celle come le voci.
  menuLinkedin: { base: [2, 10, 4, 2], md: [4, 9, 3, 2], lg: [8, 6, 2, 2] },
  menuInstagram: { base: [6, 10, 4, 2], md: [7, 9, 3, 2], lg: [10, 6, 2, 2] },
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
