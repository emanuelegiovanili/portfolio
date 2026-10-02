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
 * I due pulsanti che restano in alto dopo che l'header e' passato.
 *
 * Sono **gli stessi** dell'header, e si scrivono derivandoli invece di
 * ricopiarli: identici era la richiesta, e due liste di numeri uguali oggi sono
 * due liste diverse fra sei mesi. Il logo non c'e': in una barra che galleggia
 * sopra la pagina servono i due comandi, non il nome.
 */
export const stickyHeaderMap = {
  headerContact: headerMap.headerContact,
  headerMenu: headerMap.headerMenu,
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
  { key: 'footerHome', voce: 'home', href: '/', external: false },
  { key: 'footerAbout', voce: 'about', href: '/about', external: false },
  { key: 'footerWorks', voce: 'works', href: '/works', external: false },
  { key: 'footerLinkedin', voce: 'linkedin', href: SOCIAL.linkedin, external: true },
  { key: 'footerInstagram', voce: 'instagram', href: SOCIAL.instagram, external: true },
] as const;

/* ---------- Megamenu ---------- */

/**
 * Megamenu (268:1498).
 *
 * Il frame e' 1440x840: dodici colonne da 120 e sette righe. I nodi del file
 * lasciano l'ultima riga vuota e mettono i social in sesta. Qui i social stanno
 * in sesta e sono alti una cella, su richiesta del committente: il pannello
 * finisce con loro, cioe' e' alto sei righe invece di sette, e non resta nessuna
 * riga vuota in fondo.
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
 *   13 righe   9 righe     6 righe
 */
export const megamenuMap = {
  // Riga 1: da bordo a bordo, come nel frame.
  menuLogo: { base: [1, 1, 5, 2], md: [1, 1, 6, 1], lg: [1, 1, 4, 1] },
  menuClose: { base: [9, 1, 2, 2], md: [10, 1, 1, 1], lg: [12, 1, 1, 1] },
  menuCta: { base: [2, 10, 8, 2], md: [7, 1, 3, 1], lg: [8, 1, 4, 1] },

  // Il resto rientra di una colonna per lato.
  menuWork: { base: [2, 4, 8, 3], md: [2, 3, 8, 3], lg: [2, 2, 10, 2] },
  menuAbout: { base: [2, 7, 8, 3], md: [2, 6, 8, 3], lg: [2, 4, 10, 2] },

  /*
   * Alti una cella, attaccati sotto ad About. A base no: due celle, in fondo.
   *
   * Erano due ovunque, come le voci, perche' cosi' il menu riempiva il frame.
   * Il committente li ha visti troppo alti e ha chiesto di dimezzarli, e
   * l'altezza del pannello e' scesa di una riga da se' (`deriveRows` conta
   * l'ultima riga occupata).
   *
   * Poi, per il solo menu mobile, ha chiesto di rialzarli di una cella e di
   * spostarli in basso: a base scendono **sotto** al "Let's work together",
   * che sale di una riga a prendere il loro posto. Non sono piu' attaccati ad
   * About — a base la sequenza diventa Work, About, CTA, social — e questo
   * chiude la composizione invece di lasciarla finire con il bottone viola.
   *
   * A md e lg niente cambia: li' il CTA sta nella riga di testa, e i social
   * sono gia' l'ultima cosa del pannello.
   */
  menuLinkedin: { base: [2, 12, 4, 2], md: [4, 9, 3, 1], lg: [8, 6, 2, 1] },
  menuInstagram: { base: [6, 12, 4, 2], md: [7, 9, 3, 1], lg: [10, 6, 2, 1] },

  /*
   * Il comando della lingua, 412:1020 e 412:1024.
   *
   * A lg viene dal file: due celle 1x1 in basso a sinistra, riga 6, cioe' la
   * **stessa riga dei social** all'altro capo del pannello. Quella simmetria e'
   * la regola, e a md la si applica tale e quale: riga 9, colonne 2 e 3, con i
   * social da 4 in poi. La misura e' 1x1 come il bottone di chiusura, che a md
   * e' 1x1 anche lui.
   *
   * A base non c'e' spazio sulla riga dei social — occupano le colonne 2-9 —
   * quindi il comando scende alla riga sotto, ed e' 2x2 perche' a base tutti i
   * comandi quadrati del sito sono 2x2 (il bottone di chiusura compreso).
   *
   * Base e md il file **non li disegna**: sono derivati dalla regola di lg, con
   * lo stesso ragionamento con cui ci sono le frecce dei testimonial a base e
   * md (NOTES.md D5). L'alternativa era un cambio lingua che esiste solo da
   * desktop, cioe' una funzione rotta su un telefono.
   */
  menuLangIt: { base: [2, 14, 2, 2], md: [2, 9, 1, 1], lg: [2, 6, 1, 1] },
  menuLangEn: { base: [4, 14, 2, 2], md: [3, 9, 1, 1], lg: [3, 6, 1, 1] },
} as const satisfies LayoutMap;

/**
 * Le due voci del megamenu.
 *
 * Il file scrive "Work" al singolare qui e "Works" al plurale nel footer, per
 * la stessa pagina. Le copie si riproducono come stanno (NOTES.md B7).
 * Manca "Home": non la aggiungo, il logo in alto a sinistra porta li'.
 */
export const MENU_LINKS = [
  { key: 'menuWork', voce: 'work', href: '/works' },
  { key: 'menuAbout', voce: 'about', href: '/about' },
] as const;

/** I due social del megamenu, nell'ordine del file. */
export const MENU_SOCIALS = [
  { key: 'menuLinkedin', voce: 'linkedin', href: SOCIAL.linkedin },
  { key: 'menuInstagram', voce: 'instagram', href: SOCIAL.instagram },
] as const;
