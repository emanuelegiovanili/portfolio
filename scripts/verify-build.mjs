/**
 * Verifica quello che va davvero online.
 *
 * Tutto il resto misura `astro dev`. Ma in produzione il CSS e' minificato, i
 * nomi dei file hanno l'impronta, `/grid` non esiste piu' e davanti c'e'
 * Workers con le sue regole su barre finali e pagine mancanti. Sono quattro
 * differenze fra la cosa misurata e la cosa pubblicata, e ognuna e' un posto
 * dove un errore puo' nascondersi.
 *
 * Qui si costruisce, si serve la build con lo stesso runtime di Cloudflare, e
 * si rimisura:
 *
 *   - ogni indirizzo scritto nel markup risponde 200 al primo colpo, senza
 *     rimbalzi (un 307 su ogni navigazione e' un viaggio buttato);
 *   - nessuna richiesta della pagina finisce in 404 o in errore;
 *   - l'invariante della griglia regge, con la stessa sonda di sempre;
 *   - i fili dei bordi sono ancora dipinti dove devono.
 *
 * Uso: node scripts/verify-build.mjs [--skip-build]
 */

import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { chromium } from 'playwright';
import { waitForServer, CHROMIUM } from './dev-server.mjs';

/** Le route pubbliche: le stesse che la build produce, meno quelle di debug. */
const ROUTES = ['/', '/about', '/works', '/works/seezy', '/works/noranutrizione', '/works/tama-caffe', '/contact'];
/** Deve rispondere 404: se un giorno risponde 200, la route di debug e' finita online. */
const MUST_404 = ['/grid', '/grid/components'];
const WIDTHS = [390, 768, 1440];

const args = process.argv.slice(2);

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

let failures = 0;
const fallito = (msg) => {
  failures += 1;
  console.error('  FALLITO ' + msg);
};

if (!args.includes('--skip-build')) {
  console.log('Costruisco…');
  const build = spawnSync('npm', ['run', 'build'], { stdio: ['ignore', 'ignore', 'inherit'] });
  if (build.status !== 0) {
    console.error("la build non passa");
    process.exit(1);
  }
}

const port = await freePort();
const worker = spawn('npx', ['wrangler', 'dev', '--port', String(port), '--ip', '127.0.0.1'], {
  stdio: 'ignore',
  detached: true,
});
worker.unref();
const base = `http://127.0.0.1:${port}`;
const stop = () => {
  try {
    process.kill(-worker.pid, 'SIGTERM');
  } catch {
    // gia' morto
  }
};

try {
  await waitForServer(base + '/', 90_000);
} catch (e) {
  stop();
  console.error(String(e.message));
  process.exit(1);
}

console.log(`\nWorkers su ${base}\n`);

try {
  /*
   * 1. Gli indirizzi.
   *
   * `redirect: 'manual'` perche' un 307 seguito in silenzio e' esattamente il
   * difetto che si sta cercando: la pagina arriva lo stesso, e nessuno si
   * accorge del viaggio in piu'.
   */
  console.log('Indirizzi');
  for (const route of ROUTES) {
    const res = await fetch(base + route, { redirect: 'manual' });
    const ok = res.status === 200;
    console.log(`  ${route.padEnd(26)} ${res.status}${ok ? '' : ' -> ' + (res.headers.get('location') ?? '-')}`);
    if (!ok) fallito(`${route} risponde ${res.status}, non 200`);
  }
  for (const route of MUST_404) {
    const res = await fetch(base + route, { redirect: 'manual' });
    console.log(`  ${route.padEnd(26)} ${res.status} (atteso 404)`);
    if (res.status !== 404) fallito(`${route} risponde: la route di debug sta ancora nella build`);
  }

  /*
   * 2. Quello che ogni pagina si porta dietro.
   *
   * Un font o un foglio di stile che risponde 404 in produzione non si vede da
   * uno screenshot: la pagina c'e', e' solo sbagliata.
   */
  console.log('\nRichieste e console');
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  try {
    for (const width of WIDTHS) {
      const mobile = width < 720;
      const context = await browser.newContext({
        viewport: { width, height: mobile ? 844 : 900 },
        deviceScaleFactor: mobile ? 3 : 2,
        isMobile: mobile,
        hasTouch: mobile,
      });
      for (const route of ROUTES) {
        const page = await context.newPage();
        const problemi = [];
        page.on('console', (m) => m.type() === 'error' && problemi.push('console: ' + m.text()));
        page.on('pageerror', (e) => problemi.push('errore: ' + String(e)));
        page.on('requestfailed', (r) => problemi.push('richiesta fallita: ' + r.url()));
        page.on('response', (r) => {
          if (r.status() >= 400) problemi.push(`${r.status()} su ${r.url()}`);
        });

        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.close();

        console.log(`  ${String(width + 'px').padEnd(8)}${route.padEnd(26)}${problemi.length === 0 ? 'pulita' : ''}`);
        for (const p of problemi.slice(0, 5)) fallito(`${route} a ${width}px · ${p}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  /*
   * 3. La griglia e i fili, sulla build.
   *
   * Si riusano le sonde di sempre puntate su questo server: se la misura qui
   * divergesse da quella su `astro dev`, la differenza sarebbe nella build, che
   * e' l'unica cosa che questo file vuole scoprire.
   */
  for (const [nome, script, extra] of [
    ['griglia', 'scripts/verify-grid.mjs', ['--paths', ROUTES.join(',')]],
    ['fili', 'scripts/verify-edges.mjs', []],
  ]) {
    console.log(`\nSonda: ${nome}`);
    const res = spawnSync('node', [script, '--url', base, ...extra], { stdio: 'inherit' });
    if (res.status !== 0) fallito(`la sonda "${nome}" non passa sulla build`);
  }
} finally {
  stop();
}

if (failures > 0) {
  console.error(`\n${failures} controlli falliti sulla build.`);
  process.exit(1);
}
console.log("\nLa build regge: si puo\u2019 pubblicare.");
