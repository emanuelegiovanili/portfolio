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
       * Il case study. Presente solo dove un disegno esiste: oggi Seezy.
       * `blocks` alterna le due sole forme che la pagina sa comporre.
       */
      caseStudy: z
        .object({
          body: z.string(),
          blocks: z.array(
            z.object({
              src: image(),
              alt: z.string(),
              shape: z.enum(['wide', 'half']),
            }),
          ),
        })
        .optional(),
    }),
});

export const collections = { works };
