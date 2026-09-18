/**
 * I testimonial.
 *
 * Il Figma mostra **quattro nomi** nella riga (266:1148) ma **un solo testo**,
 * quello attivo. Gli altri tre non esistono da nessuna parte nel file.
 *
 * Qui i quattro nomi ci sono tutti, perche' sono dati reali letti dal Figma, e
 * la citazione sta dove esiste. La scheda di chi non ce l'ha non e' cliccabile,
 * invece di mostrarne una inventata. Vedi NOTES.md B13.
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
  { client: 'Noranutrizione' },
  { client: 'TAMA caffè' },
  { client: 'Aggrego' },
];

export const COMPLETE_TESTIMONIALS = TESTIMONIALS.filter((t) => t.quote !== undefined);
