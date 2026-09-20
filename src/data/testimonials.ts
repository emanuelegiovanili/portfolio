/**
 * I testimonial.
 *
 * Il Figma mostra **quattro nomi** nella riga (266:1148) ma **un solo testo**,
 * quello attivo. Gli altri tre non esistono da nessuna parte nel file.
 *
 * Due schede su quattro hanno un testo vero. Le altre due sono senza citazione,
 * e su richiesta del committente **non vanno in pagina**: la home riceve
 * `COMPLETE_TESTIMONIALS`, non `TESTIMONIALS`. Restano qui perche' i clienti
 * esistono e il testo puo' arrivare: scriverlo nella citazione vuota e basta,
 * la scheda torna nel giro da sola. B13 resta aperto per questo.
 *
 * La riga delle schede si dispone sul numero di schede che riceve — otto celle
 * divise in parti uguali a md e lg, una scheda per riga a base — quindi non c'e'
 * niente da toccare nel CSS quando questa lista cambia di lunghezza.
 */

export interface Testimonial {
  /** Il nome del cliente, cosi' come compare nella riga. */
  client: string;
  quote?: string;
  author?: string;
  role?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    client: 'Seezy',
    quote:
      'I’ve had the pleasure of working with Emanuele on several projects, and I highly recommend him. Professional, creative, and very detail-oriented, he immediately understands the client’s needs and turns them into high-quality work. He’s always available, precise, and truly knowledgeable.',
    author: 'Leonardo De Cesare',
    role: 'COO',
  },
  // Senza citazione: fuori dalla home finche' resta cosi'. Vedi la nota in
  // testa al file e NOTES.md B13.
  { client: 'Noranutrizione', quote: '', author: '', role: '' },
  {
    client: 'TAMA caffè',
    quote:
      'We entrusted Emanuele with the redesign of our e-commerce site and the transition to a reliable solution like Shopify. What we appreciated most was that he understood our company culture and designed the purchasing process accordingly, highlighting our products and their value. He also oversaw a series of related marketing activities, such as newsletters and packaging. The new site is efficient and accessible, and in the first year alone, online sales increased by approximately 200%.',
    author: 'Michael Angelini',
    role: 'CEO',
  },
  { client: 'Aggrego', quote: '', author: '', role: '' },
];

/** Quelli che hanno davvero qualcosa da leggere: e' questa la lista in home. */
export const COMPLETE_TESTIMONIALS = TESTIMONIALS.filter((t) => t.quote);
