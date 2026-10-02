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
 * In pratica: le rotte sono **statiche**, in `src/pages/` e `src/pages/it/`,
 * e sono file di cinque righe che montano il corpo da `src/pagine/` passandogli
 * `locale`. Il markup resta scritto una volta sola; a raddoppiare e' solo la
 * dichiarazione della rotta.
 *
 * **Prima c'era un parametro di rotta solo, `src/pages/[...lang]/`, e non ha
 * funzionato.** Un parametro rest e' goloso: `/it/works` combacia sia con
 * `[...lang]/works/index.astro` (lang = "it") sia con `[...lang]/index.astro`
 * (lang = "it/works"). La build risolve l'ambiguita' generando le pagine dagli
 * `getStaticPaths` e usciva giusta — sedici pagine, tutte verificate — ma il
 * server di sviluppo risolve per corrispondenza al volo, e sceglieva a caso:
 * misurato, `/it/works` rispondeva 200 alla prima richiesta e 404 alla
 * seconda, e `/about` e `/works` rispondevano 404. Siccome ogni sonda del
 * progetto gira contro il dev, l'intera verifica diventava inutilizzabile —
 * e il modo in cui e' venuto fuori e' che `verify:grid` cadeva con "nessuna
 * griglia trovata" senza dire su quale rotta.
 *
 * Due file sottili per pagina costano dieci righe. Un'ambiguita' di routing
 * costa una catena di verifica che non si puo' far girare.
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
