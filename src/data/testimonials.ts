/**
 * I testimonial.
 *
 * Il Figma mostra **quattro nomi** nella riga (266:1148) ma **un solo testo**,
 * quello attivo. Gli altri tre non esistono da nessuna parte nel file.
 *
 * Due schede su quattro hanno un testo vero; le altre due hanno una citazione
 * **vuota**, non inventata: il
 * committente ha chiesto di tenerle nel giro perche' la rotazione e la barra di
 * avanzamento si possano vedere e mettere a punto subito. Sono segnaposto, e
 * finche' restano cosi' quelle tre schede mostrano un pannello vuoto per dieci
 * secondi. B13 resta aperto: il testo vero va scritto qui e basta.
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
  // Segnaposto: vedi la nota in testa al file e NOTES.md B13.
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

/** Quelli che hanno davvero qualcosa da leggere. */
export const COMPLETE_TESTIMONIALS = TESTIMONIALS.filter((t) => t.quote);
