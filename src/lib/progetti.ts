/**
 * Il contenuto di un progetto nella lingua richiesta.
 *
 * Il file JSON tiene l'inglese ai campi di sempre e l'italiano dentro `it`:
 * un file per progetto, cosi' copertina, galleria, tag e ordine restano scritti
 * una volta sola. Qui si sceglie quale dei due si legge.
 *
 * **Se l'italiano manca, esce l'inglese e si conta.** Non e' un ripiego muto:
 * la stringa passa da `daTradurre`, quindi finisce nell'elenco che
 * `verify:i18n` stampa. Un progetto nuovo che arriva senza traduzione si vede
 * nel registro invece di scoprirlo da una pagina italiana scritta in inglese.
 */
import type { CollectionEntry } from 'astro:content';
import { daTradurre, DEFAULT_LOCALE, type Locale } from '../i18n';

export interface ContenutoProgetto {
  excerpt: string;
  coverAlt: string;
  body: string[];
  /** Nello stesso ordine di `caseStudy.blocks`. */
  blockAlts: string[];
}

export function contenutoProgetto(
  work: CollectionEntry<'works'>,
  locale: Locale = DEFAULT_LOCALE,
): ContenutoProgetto {
  const blocchi = work.data.caseStudy?.blocks ?? [];
  const inglese: ContenutoProgetto = {
    excerpt: work.data.excerpt,
    coverAlt: work.data.coverAlt,
    body: [...(work.data.caseStudy?.body ?? [])],
    blockAlts: blocchi.map((b) => b.alt),
  };

  if (locale === DEFAULT_LOCALE) return inglese;

  const tradotto = work.data.it;
  if (!tradotto) return daTradurre(`progetto.${work.id}`, inglese);

  return {
    excerpt: tradotto.excerpt,
    coverAlt: tradotto.coverAlt,
    body: [...tradotto.body],
    blockAlts: [...tradotto.blockAlts],
  };
}
