// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // La route /grid è solo di debug: viene esclusa dalla build di produzione
  // (vedi scripts/strip-grid.mjs, invocato dal workflow di deploy).
  devToolbar: { enabled: false },
});
