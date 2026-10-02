/**
 * I testimonial.
 *
 * Il Figma mostra **quattro nomi** nella riga (266:1148) ma **un solo testo**,
 * quello attivo. Gli altri tre non esistono da nessuna parte nel file.
 *
 * Due schede su quattro hanno un testo vero. Le altre due sono senza citazione,
 * e su richiesta del committente **non vanno in pagina**: la home riceve
 * `testimonialCompleti(lingua)`, non `TESTIMONIALS`. Restano qui perche' i clienti
 * esistono e il testo puo' arrivare: scriverlo nella citazione vuota e basta,
 * la scheda torna nel giro da sola. B13 resta aperto per questo.
 *
 * La riga delle schede si dispone sul numero di schede che riceve — otto celle
 * divise in parti uguali a md e lg, una scheda per riga a base — quindi non c'e'
 * niente da toccare nel CSS quando questa lista cambia di lunghezza.
 */

/**
 * Una citazione per lingua.
 *
 * **Le parole di un cliente sono sue.** Le versioni italiane le ha mandate il
 * committente, non le ho tradotte io: tradurre una testimonianza vorrebbe dire
 * mettere in bocca a una persona reale parole che non ha scritto, e poi
 * pubblicarle col suo nome e il suo ruolo accanto. Resta consigliato un cenno
 * dei due clienti sulle versioni italiane prima di promuovere il sito in
 * italiano (NOTES.md D148).
 *
 * Una citazione vuota in una lingua vuol dire che la scheda, in quella lingua,
 * resta fuori dalla home: e' la stessa regola di B13, applicata per lingua
 * invece che una volta sola.
 */
import type { Locale } from '../i18n';

export interface Testimonial {
  /** Il nome del cliente, cosi' come compare nella riga. Non si traduce. */
  client: string;
  quote?: Partial<Record<Locale, string>>;
  author?: string;
  role?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    client: 'Seezy',
    quote: {
      en: 'I’ve had the pleasure of working with Emanuele on several projects, and I highly recommend him. Professional, creative, and very detail-oriented, he immediately understands the client’s needs and turns them into high-quality work. He’s always available, precise, and truly knowledgeable.',
      it: 'Ho avuto il piacere di lavorare con Emanuele su diversi lavori e non posso che consigliarlo. Professionale, creativo e molto attento ai dettagli, riesce a capire subito le esigenze del cliente e trasformarle in lavori di grande qualità. Sempre disponibile, preciso e davvero competente.',
    },
    author: 'Leonardo De Cesare',
    role: 'COO',
  },
  // Senza citazione: fuori dalla home finche' resta cosi'. Vedi la nota in
  // testa al file e NOTES.md B13.
  { client: 'Noranutrizione', author: '', role: '' },
  {
    client: 'TAMA caffè',
    quote: {
      en: 'We entrusted Emanuele with the redesign of our e-commerce site and the transition to a reliable solution like Shopify. What we appreciated most was that he understood our company culture and designed the purchasing process accordingly, highlighting our products and their value. He also oversaw a series of related marketing activities, such as newsletters and packaging. The new site is efficient and accessible, and in the first year alone, online sales increased by approximately 200%.',
      it: 'Ci siamo affidati a Emanuele per riprogettare il nostro ecommerce e passare ad una soluzione affidabile come Shopify. La cosa che abbiamo apprezzato di più è che ha capito la nostra cultura aziendale e ha costruito il percorso d’acquisto di conseguenza, facendo emergere i nostri prodotti ed il loro valore. Ha anche curato una serie di attività di marketing di contorno come newsletter e packaging. Il nuovo sito è efficiente ed accessibile, solo nel primo anno le vendite online sono aumentate di circa il 200%.',
    },
    author: 'Michael Angelini',
    role: 'CEO',
  },
  { client: 'Aggrego', author: '', role: '' },
];

/** Quelli che hanno davvero qualcosa da leggere **in quella lingua**. */
export function testimonialCompleti(locale: Locale): Testimonial[] {
  return TESTIMONIALS.filter((t) => t.quote?.[locale]);
}
