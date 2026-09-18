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
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [excludeDebugRoutes()],
});
