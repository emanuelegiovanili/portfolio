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
 * Il titolo della sezione nuova, e le tre schede degli ambiti.
 *
 * Frame 274:1855, blocchi 397:936, 397:930, 397:942. Ognuna porta a /works gia'
 * filtrata sul proprio ambito, come le card del mix in home: e' la richiesta
 * del committente, ed e' anche la ragione per cui a mobile il file ci mette
 * dentro una freccia (400:996) — su un telefono l'hover non esiste e senza
 * freccia niente direbbe che si puo' toccare.
 *
 * `tag` e' il tag del progetto, non l'etichetta. Il tipo lo tiene dentro
 * `WORK_TAGS`, quindi una scheda che punta a un ambito inesistente non arriva
 * alla build: la guardia sta in `about.astro`, come in home.
 *
 * "Product design" con la d minuscola e' quello che dice il file (397:933),
 * mentre la card in home dice "Product Design". Non si uniforma: la copy non si
 * corregge, si riproduce e si segnala (NOTES.md D143).
 */
export const WHAT_TITLE = 'What I actually do';

export const SECTORS = [
  {
    icon: 'swatch-book',
    title: 'Branding',
    tag: 'Branding',
    body: "Most businesses aren't forgotten because they're bad. They're forgotten because nothing about them sticks. What people remember is what you stand for when they have to choose. Branding, to me, is the work of making who you are visible and remarkable.",
  },
  {
    icon: 'tablet-smartphone',
    title: 'Product design',
    tag: 'Product',
    body: "I start from what users need, then map how the technology behind the product really works. That shapes the interface, so it follows the research, fits the brand and is easier to build. It's also why I love working with startups, where the system doesn't exist yet and I get to help build it.",
  },
  {
    icon: 'app-window',
    title: 'Web Design',
    tag: 'Web Design',
    body: "As with branding, being seen isn't enough. You need to be remembered, and your online presence speaks for you. I build in Webflow through no-code when the project fits, and if it doesn't, I bring in a developer for guaranteed success.",
  },
] as const;

/**
 * Le tre card del processo, riscritte di nuovo dal committente.
 *
 * **La struttura e' cambiata.** Prima c'era un titolo breve (Research / Mix /
 * Bake), poi una riga forte, poi il corpo. Nel frame aggiornato i titoli brevi
 * non ci sono piu': la scheda si apre direttamente con la frase, in Poppins
 * Bold 24 (415:2939, 301:1075, 301:1077), e sotto c'e' il corpo in Medium 16.
 * Quindi qui `heading` e' una frase, non un'etichetta, e la pagina la rende in
 * `<h3>`: e' il titolo della scheda a tutti gli effetti.
 *
 * **Il frame mobile e' rimasto indietro, di nuovo**: 356:622 ha ancora
 * "Step title" col testo di prima. La sorgente e' una sola e alimenta tutti e
 * due i tier, quindi vale il desktop, che e' il frame rivisto. A base restano
 * le proporzioni del frame mobile (18 per la frase, 14 per il corpo) applicate
 * alla struttura nuova. Segnalato in NOTES.md D143.
 *
 * Un problema di copy, riprodotto e segnalato (NOTES.md §3.5): la prima scheda
 * dice "comes together. then I look at" — punto fermo e poi la minuscola. La
 * copy non si corregge, si riproduce.
 */
export const RECIPE = [
  {
    heading: 'Find real problems for real people.',
    body: "I start by understanding the people who'll use what we're building, then work out which technology we'll use and how the system comes together. then I look at what the business needs to achieve, and which number will tell us it worked.",
  },
  {
    heading: 'Many skills, one pair of hands.',
    body: 'I trained in product design, started out in code and branding and spent years working on conversion and web design. So when I shape a solution, design, technology and business get weighed at the same time, by the same person.',
  },
  {
    heading: 'Built together, tested to the end.',
    body: "This is where it gets made, and you're part of it. You see the work as it takes shape, and we make the important decisions together along the way. I stay on it through the build and the details, up to the final tests with real people.",
  },
];

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
