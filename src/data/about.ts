/**
 * I contenuti di /about, dal frame 274:1855.
 *
 * Due problemi di copy, riprodotti e segnalati (NOTES.md §3.5):
 * la biografia dice "I also teach interface design" al presente, ma
 * l'insegnamento e' finito a settembre 2026.
 */

export const BIO = [
  "I'm a digital designer and, to be honest, a bit of a nerd. I'm passionate about anything with a clear process and meaningful results.",
  "I work at the intersection of strategy, design, and technology, that's where ideas take practical form. Design's true role is in understanding: making technology feel human and instantly clear to its users.",
  'I also teach interface design: explaining my daily work is the best way to keep improving.',
];

export const LOCATION = 'Based in San Benedetto del Tronto, Italy';
export const REMOTE = 'Working remotely';

/**
 * Le tre card del processo, riscritte dal committente.
 *
 * La struttura e' cambiata con il testo: prima era un numero grande, un titolo
 * e un paragrafo; ora sono un titolo, una **riga forte** e un corpo. Il numero
 * nel frame aggiornato non c'e' piu' (299:277, 299:314, 299:317), e la riga
 * forte non e' una prima frase in grassetto: e' la promessa del passaggio, e il
 * corpo spiega come si mantiene.
 *
 * Le posizioni delle tre schede non sono cambiate: restano sfalsate come prima.
 */
export const RECIPE = [
  {
    title: 'Research',
    lead: 'Find the real problem before the budget goes into solving the wrong one.',
    body: 'I gather what already exists, read the context, and talk to the people who are going to use it. I also ask what the business needs to happen, and which number will tell us it did. Most briefs arrive without that answer, and it is cheap to settle here.',
  },
  {
    title: 'Blend',
    lead: 'One person across brand, product and build, so nothing gets lost in between.',
    body: 'I look at what the technology allows before committing to a direction, then work through the options against how people behave and what the business needs to earn. Brand, product and build move together, so the expensive decisions get caught while they are still being made.',
  },
  {
    title: 'Proof',
    lead: 'It ships, it works, and whoever builds it can actually build it.',
    body: 'Components, documentation, and the build itself when the project fits no-code. When it outgrows that, I bring in a developer. Then it goes in front of real people, and I check the number we agreed on at the start.',
  },
];

/**
 * Il blocco Spotify.
 *
 * `playlist` e `count` sono **ripieghi**: il valore vero lo legge la build da
 * Spotify (`src/lib/spotify.ts`), e questi due restano per quando le credenziali
 * non ci sono — in locale, sempre — o la lettura fallisce. Sono i valori del
 * Figma, quindi il peggio che possa capitare e' la pagina di prima.
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
  id: '5O4DY0tPikApfk7UvqMAJx',
  playlist: 'Let me cook',
  count: '32 songs',
  href: 'https://open.spotify.com/playlist/5O4DY0tPikApfk7UvqMAJx',
};
