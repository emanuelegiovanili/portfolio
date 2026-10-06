// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
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
  integrations: [
    excludeDebugRoutes(),
    /*
     * La sitemap, con le due lingue dichiarate.
     *
     * Non serve a "farsi trovare" genericamente: serve a dire a un motore di
     * ricerca che `/about` e `/it/about` sono **la stessa pagina in due
     * lingue**. L'integrazione scrive per ogni voce i rimandi `xhtml:link`
     * verso l'altra lingua, che e' la stessa informazione dei `<link hreflang>`
     * nella testa della pagina, ripetuta dove un crawler la legge prima —
     * perche' la sitemap la scarica subito, le pagine le visita dopo.
     *
     * `/grid` non ci finisce: quella rotta e' di debug e l'integrazione
     * `excludeDebugRoutes` la toglie dalla build prima che la sitemap la veda.
     * Il filtro qui sotto e' la seconda rete, nel caso quella prima cambi.
     */
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', it: 'it' },
      },
      filter: (pagina) => !pagina.includes('/grid'),

      /*
       * Due correzioni su quello che l'integrazione scrive da sola.
       *
       * **La barra finale.** L'integrazione segue il formato della build e
       * scrive `/about/`, ma ogni pagina dichiara canonico `/about` — senza —
       * ed e' anche la forma di tutti i link interni e quella che il Worker
       * serve (`html_handling: drop-trailing-slash`). Lasciarle discordi vuol
       * dire mandare a un motore di ricerca due versioni dello stesso
       * indirizzo e poi dirgli che solo una vale: lavoro inutile per lui e
       * un segnale confuso. La radice fa eccezione, perche' li' la barra **e'**
       * l'indirizzo.
       *
       * **`x-default`.** L'integrazione scrive `en` e `it` ma non la voce che
       * dice quale lingua serve a chi non ne chiede nessuna. Nella testa delle
       * pagine c'e' gia'; qui mancava, e le due fonti devono dire la stessa
       * cosa o si contraddicono.
       */
      serialize(voce) {
        const senzaBarra = (indirizzo) => {
          const u = new URL(indirizzo);
          if (u.pathname !== '/') u.pathname = u.pathname.replace(/\/$/, '');
          return u.href;
        };

        voce.url = senzaBarra(voce.url);
        if (voce.links) {
          voce.links = voce.links.map((l) => ({ ...l, url: senzaBarra(l.url) }));
          const inglese = voce.links.find((l) => l.lang === 'en');
          if (inglese) voce.links.push({ lang: 'x-default', url: inglese.url });
        }
        return voce;
      },
    }),
  ],
});
