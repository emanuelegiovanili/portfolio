/**
 * Quello che /about tiene fuori dai dizionari.
 *
 * I testi stanno in `src/i18n/en.ts` e `it.ts`. Qui restano i dati che non
 * sono parole: l'elenco dei settori con icona e tag, e il blocco Spotify, che
 * dal disegno aggiornato e' fuori pagina ma non si butta (vedi sotto).
 */

/**
 * Quello che dei settori **non e' copy**: l'icona e il tag del filtro.
 *
 * Titoli e testi sono passati nei dizionari (`src/i18n/`), perche' cambiano
 * con la lingua. Icona e tag no: l'icona e' la stessa in tutte le lingue, e il
 * tag e' il valore su cui /works filtra, non una parola da leggere. Tenerli
 * qui vuol dire che una scheda che punta a un ambito inesistente continua a
 * non arrivare alla build, come prima: la guardia sta in `about.astro` e
 * legge `WORK_TAGS`.
 *
 * L'ordine e' quello delle schede in pagina, e deve combaciare con l'ordine
 * di `settori` nei dizionari. Lo verifica `about.astro`.
 */
export const SETTORI = [
  { icon: 'swatch-book', tag: 'Branding' },
  { icon: 'tablet-smartphone', tag: 'Product' },
  { icon: 'app-window', tag: 'Web Design' },
] as const;

/**
 * Il blocco Spotify: **fuori dal disegno da D143**.
 *
 * Il frame aggiornato di /about non ha piu' ne' la fotografia della scrivania
 * ne' la riga della playlist, ne' a desktop ne' a mobile. La pagina non legge
 * piu' niente di tutto questo e `src/lib/spotify.ts` non viene piu' chiamato,
 * quindi il deploy smette anche di loggare l'errore di B4.
 *
 * Il dato resta qui, e non per dimenticanza: se il committente rivuole la
 * sezione, le sono rimasti i valori e il meccanismo, e si riaccende rimettendo
 * i blocchi in pagina. Cancellarlo vorrebbe dire riscriverlo.
 *
 * `playlist` e `count` sono **ripieghi**: il valore vero lo legge la build da
 * Spotify (`src/lib/spotify.ts`), e questi due restano per quando le credenziali
 * non ci sono — in locale, sempre — o la lettura fallisce. Finche' l'API resta
 * chiusa (B4: vuole un account Premium) sono gli unici valori che la pagina
 * vede, quindi li da' il committente e invecchiano con la playlist: quando
 * cambia, si cambiano qui.
 *
 * `heading` no, quello e' scritto nel disegno: "Now playing" e' il titolo della
 * sezione, non il brano in ascolto. Una playlist ferma non sa cosa sto
 * ascoltando, e per saperlo servirebbe un token utente custodito da qualche
 * parte: e' la strada che non abbiamo preso. Vedi NOTES.md D114.
 *
 * L'indirizzo e' senza il parametro `si`: quello e' il codice di condivisione
 * legato all'account di chi copia il link, e questo repository e' pubblico.
 */
export const SPOTIFY = {
  heading: 'Now playing',
  action: 'Play now on Spotify',
  /** L'id della playlist, l'unica cosa che la build usa davvero. */
  id: '6ilF0yNkzBFGdNdLmxHaO4',
  playlist: 'Let me cook',
  count: '50 songs',
  href: 'https://open.spotify.com/playlist/6ilF0yNkzBFGdNdLmxHaO4',
};
