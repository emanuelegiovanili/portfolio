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

/** Le tre card del processo. Sfalsate: la 1 e la 3 partono a riga 13, la 2 a riga 14. */
export const RECIPE = [
  {
    number: '1',
    title: 'Research',
    body: 'Before anything gets drawn, I try to be wrong about something. That usually means a handful of conversations with the people who will actually use the thing — five or six is enough. Some of it confirms the brief. Some of it kills an idea I was attached to.',
  },
  {
    number: '2',
    title: 'Blend of skills',
    body: "Then everything goes in at once: the brand, the product, and what is realistic to build. A decision in one changes the other two, so I keep them in the same place instead of letting the trade-offs surface later, on someone else's desk.",
  },
  {
    number: '3',
    title: 'Proof',
    body: "Then it has to hold up outside the file — with a real person, and with whoever builds it. That means testing, documenting, and changing things when the answer comes back wrong. It's also where I say when a project needs a developer instead of no-code.",
  },
];

/**
 * Il blocco Spotify.
 *
 * "32 songs" e "Now playing" sono scritti a mano perche' non c'e' un endpoint.
 * Sono un dato vivo: il conteggio sara' sbagliato entro un mese e "Now playing"
 * promette il brano in ascolto in tempo reale, che una playlist fissa non e'.
 * Vedi NOTES.md B4: serve una decisione prima della messa online.
 */
export const SPOTIFY = {
  heading: 'Now playing',
  playlist: 'Let me cook',
  count: '32 songs',
  action: 'Play now on Spotify',
  href: '#',
};
