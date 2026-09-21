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
  const build = spawnSync('npm', ['run', 'build'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  const log = `${build.stdout ?? ''}${build.stderr ?? ''}`;
  if (build.status !== 0) {
    console.error(log);
    console.error('la build non passa');
    process.exit(1);
  }

  /*
   * Un avviso del minificatore CSS conta come errore.
   *
   * Un `}` di troppo in un foglio di stile non ferma niente: i browser lo
   * ignorano e tirano dritto, esbuild scrive una riga di avviso, e quella riga
   * finiva in uno stdout che questo script buttava via. Ne e' rimasto uno in
   * pages.css per due commit, e nessuna delle sei sonde poteva vederlo: misurano
   * pixel e posizioni, e il CSS rotto in quel punto non ne spostava nessuno.
   *
   * La prossima volta la pubblicazione si ferma qui.
   */
  const sintassi = log.split('\n').filter((r) => r.includes('css-syntax-error'));
  if (sintassi.length > 0) {
    console.error(log);
    console.error(`\nCSS che il minificatore non sa leggere: ${sintassi.length} avvisi.`);
    process.exit(1);
  }

  /*
   * Quel che la build ha da dire, anche quando e' andata bene.
   *
   * Catturare lo stdout per leggerlo aveva un effetto che non avevo previsto: lo
   * rendeva invisibile. In Actions l'unico passo che costruisce e' questo, quindi
   * da qui in poi nessuno avrebbe piu' letto "[spotify] letta" o "[spotify]
   * nessuna credenziale" — cioe' l'unica riga che dice se la playlist in pagina
   * viene da Spotify o dal ripiego. Un avviso che nessuno vede e' un avviso che
   * non esiste: e' esattamente il difetto che il controllo qui sopra chiude.
   *
   * Si ristampano le righe che vanno dette, non tutto il log: il resto e' la
   * lista dei file scritti, che in una verifica non serve a niente.
   */
  const daDire = log.split('\n').filter((r) => /\[spotify\]|\[WARN\]|WARNING/.test(r));
  if (daDire.length > 0) console.log(daDire.join('\n'));
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

        /*
         * Nessun comando che promette e non porta.
         *
         * E' l'errore gia' fatto una volta: "Play now on Spotify" e' stato in
         * pagina per settimane con `href: '#'`, cioe' un invito che non faceva
         * niente (D114). Un link esterno vuoto, `#`, o senza `rel` che protegga
         * la scheda che apre, vale come rotto.
         *
         * Che il "Visit" compaia **solo** dove c'e' un indirizzo non si
         * controlla qui: il componente e' montato dentro `work.data.liveUrl &&`,
         * quindi senza indirizzo non esiste proprio. Una sonda su quello
         * proverebbe il linguaggio, non il sito.
         */
        const linkRotti = await page.evaluate(() =>
          [...document.querySelectorAll('a[target="_blank"], .visit-button')]
            .map((a) => {
              const href = a.getAttribute('href') ?? '';
              if (href === '' || href === '#') return `${a.className}: href "${href}"`;
              if (a.getAttribute('target') === '_blank' && !(a.getAttribute('rel') ?? '').includes('noopener')) {
                return `${a.className}: target _blank senza rel noopener`;
              }
              return null;
            })
            .filter(Boolean),
        );
        for (const rotto of linkRotti) problemi.push(`link: ${rotto}`);

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
    // La barra fissa sta fuori dalle griglie di pagina, quindi la sonda della
    // griglia non la vede: ha la sua (NOTES.md D123).
    ['barra fissa', 'scripts/verify-sticky.mjs', []],
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
