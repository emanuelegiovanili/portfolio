/**
 * Le due lingue del sito.
 *
 * ---------------------------------------------------------------------------
 * COME SONO FATTI GLI INDIRIZZI
 *
 * L'inglese sta alla radice (`/about`), l'italiano sotto un prefisso
 * (`/it/about`). E' la richiesta del committente — "teniamo la principale
 * visualizzazione in inglese" — e vuol dire che l'inglese non ha prefisso del
 * tutto: niente `/en/about`, che sarebbe un secondo indirizzo per la stessa
 * pagina e un regalo ai motori di ricerca sbagliato.
 *
 * In pratica ogni pagina sta sotto `src/pages/[...lang]/`. Il parametro di
 * rotta e' **facoltativo**: `{ lang: undefined }` genera `/about`,
 * `{ lang: 'it' }` genera `/it/about`. Un solo file per pagina, due uscite.
 * L'alternativa — `src/pages/` e `src/pages/it/` con i file duplicati — vuol
 * dire mantenere due copie dello stesso markup, e il giorno che una delle due
 * si dimentica una modifica non lo dice nessuno.
 * ---------------------------------------------------------------------------
 *
 * **Nessun rinvio automatico sulla lingua del browser.** Chi arriva da un
 * motore di ricerca o da un link vede quello che l'indirizzo dice, e cambia
 * lingua con il comando nel megamenu. Un rinvio automatico contraddirebbe
 * "principale in inglese" e, soprattutto, toglierebbe all'utente il controllo
 * di dove si trova.
 */

export const LOCALES = ['en', 'it'] as const;
export type Locale = (typeof LOCALES)[number];

/** La lingua senza prefisso. */
export const DEFAULT_LOCALE: Locale = 'en';

/** Il valore dell'attributo `lang` su `<html>`, e di `hreflang`. */
export const HTML_LANG: Record<Locale, string> = { en: 'en', it: 'it' };

/**
 * I parametri per `getStaticPaths`, uno per lingua.
 *
 * `undefined` e non `''`: Astro tratta un parametro rest indefinito come
 * segmento assente, mentre la stringa vuota lascerebbe una barra doppia.
 */
export const localeRoutes = LOCALES.map((locale) => ({
  params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
  props: { locale },
}));

/** Dal segmento di rotta alla lingua, con la radice che vale inglese. */
export function localeFrom(lang: string | undefined): Locale {
  const trovata = LOCALES.find((l) => l === lang);
  return trovata ?? DEFAULT_LOCALE;
}

/**
 * L'indirizzo di una pagina interna nella lingua data.
 *
 * `percorso` e' sempre quello inglese, con la barra iniziale: e' la forma in
 * cui gli indirizzi stanno scritti nei componenti, e cosi' resta una sola
 * tabella di rotte invece di una per lingua. Gli slug dei progetti non si
 * traducono (il file md del committente li da' uguali nelle due lingue),
 * quindi qui non c'e' niente da rimappare.
 */
export function pathFor(locale: Locale, percorso: string): string {
  if (!percorso.startsWith('/')) return percorso; // ancore, mailto, esterni
  if (locale === DEFAULT_LOCALE) return percorso;
  return percorso === '/' ? `/${locale}` : `/${locale}${percorso}`;
}

/** L'altra lingua: quella verso cui punta il comando nel megamenu. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'it' : 'en';
}

/**
 * Lo stesso indirizzo nelle due lingue, per `hreflang` e per il comando.
 *
 * Va chiamato con il percorso **inglese** della pagina corrente.
 */
export function alternates(percorso: string): { locale: Locale; href: string }[] {
  return LOCALES.map((locale) => ({ locale, href: pathFor(locale, percorso) }));
}

/**
 * Il registro di quello che non e' ancora tradotto.
 *
 * `/works`, `/works/[slug]` e `/contact` non hanno ancora un frame italiano:
 * il committente li sta disegnando. Finche' non arrivano, quelle rotte
 * esistono in italiano e mostrano l'inglese — ma non in silenzio. Ogni stringa
 * che passa di qui finisce in questo elenco, e `scripts/verify-i18n.mjs` lo
 * stampa: cosi' l'inglese travestito da italiano e' sempre contato, e la lista
 * si accorcia da sola man mano che i testi arrivano.
 *
 * Non e' un `TODO` in un commento. Un commento non lo legge la build.
 */
const daTradurreRegistro = new Set<string>();

export function daTradurre<T>(chiave: string, valoreInglese: T): T {
  daTradurreRegistro.add(chiave);
  return valoreInglese;
}

export function elencoDaTradurre(): string[] {
  return [...daTradurreRegistro].sort();
}
