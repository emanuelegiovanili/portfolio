/**
 * Le collection.
 *
 * Astro 5 vuole questo file in `src/content.config.ts`: il prompt di progetto
 * indicava `src/content/config.ts`, che e' la posizione di Astro 4. Vedi
 * NOTES.md D31.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** I tre tag del filtro su /works. `Product` e non `Product Design`: vedi NOTES.md D8. */
export const WORK_TAGS = ['Web Design', 'Branding', 'Product'] as const;
export type WorkTag = (typeof WORK_TAGS)[number];

const works = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Posizione in elenco. Esplicito, cosi' l'ordine non dipende dal nome del file. */
      order: z.number().int().positive(),
      tags: z.array(z.enum(WORK_TAGS)).min(1),
      /** Copertina 8x5: carosello in home, card su /works, hero della pagina di dettaglio. */
      cover: image(),
      coverAlt: z.string(),
      /** Una riga sotto il titolo nella card. */
      excerpt: z.string(),
      /**
       * Il sito vero, dove esiste.
       *
       * Da qui discende il pulsante "Visit" sulla copertina: **solo** se c'e'
       * un indirizzo. Un progetto senza sito online non deve mostrare un
       * comando che non porta da nessuna parte — e' lo stesso errore che
       * "Play now on Spotify" faceva con `href: '#'` prima di D114.
       */
      liveUrl: z.string().url().optional(),
      /**
       * Il case study: il testo del progetto, e la galleria dove c'e'.
       *
       * `body` e' un **elenco di paragrafi**, non una stringa sola. Il testo
       * fornito dal committente ne ha tre o quattro a progetto, e un `<p>` con
       * dentro tutto perderebbe gli stacchi che l'autore ha scritto.
       *
       * `blocks` ha un valore predefinito vuoto: due progetti su tre hanno il
       * testo e non la galleria, e prima di questo erano costretti a non avere
       * nemmeno il testo.
       */
      caseStudy: z
        .object({
          body: z.array(z.string()).min(1),
          blocks: z
            .array(
              z.object({
                src: image(),
                alt: z.string(),
                shape: z.enum(['wide', 'half']),
              }),
            )
            .default([]),
        })
        .optional(),
    }),
});

export const collections = { works };
