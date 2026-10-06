// @ts-check
import { defineConfig } from 'astro/config';
import { rm } from 'node:fs/promises';

/**
 * /grid e' una route di debug. Cancellarla a mano dalla build si dimentica, e
 * il giorno che si dimentica finisce online. Qui esce dalla build di produzione
 * da sola; INCLUDE_GRID=1 la tiene, per gli screenshot di verifica.
 */
function excludeDebugRoutes() {
  return {
    name: 'exclude-debug-routes',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.INCLUDE_GRID === '1') {
          logger.warn('INCLUDE_GRID=1: /grid resta nella build. Non pubblicarla.');
          return;
        }
        await rm(new URL('./grid/', dir), { recursive: true, force: true });
        logger.info('/grid rimossa dalla build');
      },
    },
  };
}

export default defineConfig({
  /*
   * L'indirizzo pubblico del sito.
   *
   * Serve a una cosa sola ma non rinviabile: gli `hreflang` vogliono URL
   * **assoluti**, con protocollo e dominio. Finche' il dominio non esisteva
   * uscivano relativi (`/it/about`), e un motore di ricerca non li collega:
   * tutto il lavoro sulle due lingue restava invisibile proprio a chi doveva
   * vederlo. Da qui escono anche il `canonical` e, il giorno che serve, la
   * sitemap.
   */
  site: 'https://emanuelegiovanili.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [excludeDebugRoutes()],
});
