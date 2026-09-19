/**
 * Verifica strumentale dell'invariante del progetto.
 *
 * Apre /grid in Chromium alle larghezze della definizione di finito, a tre
 * posizioni di scroll, e misura quanto distano i bordi dei blocchi dai confini
 * di griglia. Non guarda screenshot: legge le coordinate. Uno screenshot a 1440
 * non mostra uno scarto di 0,3px, una misura si'.
 *
 * Uso:
 *   node scripts/verify-grid.mjs                 (avvia da solo `astro dev`)
 *   node scripts/verify-grid.mjs --url http://…  (usa un server gia' acceso)
 *   node scripts/verify-grid.mjs --paths /,/about    (solo queste route)
 *   node scripts/verify-grid.mjs --shots         (salva anche i png in .verify/)
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { transform } from 'esbuild';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const WIDTHS = [320, 390, 430, 719, 720, 768, 1024, 1199, 1200, 1280, 1440, 1680, 1920];

/**
 * Le pagine interne esistono solo a desktop: misurarle sotto 1200 non dice
 * niente sullo sforo, perche' non c'e' un disegno con cui confrontarsi.
 *
 * Era un elenco, e l'elenco dimenticava due case study su tre: `verify:build`
 * li misura tutti e li faceva fallire, mentre `/works/seezy` — identico per
 * struttura — passava perche' era scritto nella lista. La regola vera non e'
 * un elenco di indirizzi: **la home e' l'unica pagina con tre tier**, tutto il
 * resto e' disegnato solo a 1440.
 *
 * L'allineamento alle linee resta un errore ovunque, a qualunque larghezza:
 * qui si allenta solo la misura dello sforo del contenuto.
 */
const isDesktopOnly = (route) => route !== '/' && !route.startsWith('/grid');

/**
 * Il frame piu' piccolo del Figma e' a 390.
 *
 * Sotto, nessun blocco ha un disegno: la composizione regge e le linee restano
 * al loro posto, ma qualche blocco di testo sfora di pochi pixel perche' la
 * cella e' piu' stretta di quella per cui e' stato disegnato. Lo si misura e lo
 * si stampa, non lo si fa fallire: non c'e' niente a cui essere fedeli.
 */
const SMALLEST_DESIGNED_WIDTH = 390;
const SCROLLS = ['top', 'middle', 'bottom'];
/** Il megamenu e' lo stesso su ogni pagina: si apre e si misura su una sola. */
const MENU_ROUTE = '/';
const DEFAULT_PATHS = ['/grid', '/grid/components', '/', '/about', '/works', '/works/seezy', '/contact'];
const SHOT_DIR = '.verify';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

/*
 * Le route da misurare si possono restringere.
 *
 * Serve per misurare la build di produzione, dove `/grid` non esiste: e' una
 * route di debug e la build la cancella (`astro.config.mjs`). Senza questo, la
 * stessa sonda non si poteva puntare sulla cosa che va davvero online.
 */
const PATHS = value('--paths', null)?.split(',').filter(Boolean) ?? DEFAULT_PATHS;

const explicitUrl = value('--url', null);
const server = explicitUrl ? { base: explicitUrl, stop: () => {} } : await startDevServer({ probePath: PATHS[0] });

if (flag('--shots') && !existsSync(SHOT_DIR)) await mkdir(SHOT_DIR, { recursive: true });

/**
 * La sonda viene iniettata, non importata dalla pagina.
 *
 * Le route di produzione non devono spedire codice di misura al visitatore, e
 * le route di debug non devono essere le uniche misurabili. Iniettando lo
 * stesso sorgente che il pannello di /grid importa, l'implementazione resta
 * una sola e vale su qualunque pagina.
 */
const probeSource = await readFile(new URL('../src/scripts/grid-probe.ts', import.meta.url), 'utf8');
const { code: probeScript } = await transform(probeSource, {
  loader: 'ts',
  format: 'iife',
  target: 'es2022',
});

const browser = await chromium.launch({ executablePath: CHROMIUM });
const rows = [];
let failures = 0;

try {
  for (const route of PATHS)
  for (const width of WIDTHS) {

    // Sotto il confine md si emula un telefono: densita' 3, touch, niente
    // hover. Da quando la scrollbar di sistema e' nascosta (tokens.css) la
    // larghezza utile e' la stessa nei due casi, ma l'emulazione resta perche'
    // le animazioni di icona non devono partire dove non c'e' un puntatore.
    const mobile = width < 720;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 900 },
      deviceScaleFactor: mobile ? 3 : 2,
      isMobile: mobile,
      hasTouch: mobile,
    });
    await context.addInitScript({ content: probeScript });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(server.base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    for (const where of SCROLLS) {
      await page.evaluate((w) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, w === 'top' ? 0 : w === 'bottom' ? max : Math.round(max / 2));
      }, where);

      const result = await page.evaluate(() => window.__probeGrid?.() ?? null);
      if (!result) throw new Error(`nessuna griglia trovata a ${width}px`);

      // Sotto la larghezza minima disegnata, o sotto i 1200 su una pagina che
      // esiste solo a desktop, lo sforo si misura e si stampa: non c'e' un
      // disegno con cui confrontarsi. L'allineamento delle linee invece deve
      // reggere ovunque, e resta un errore.
      const belowDesign = width < SMALLEST_DESIGNED_WIDTH || (isDesktopOnly(route) && width < 1200);
      // Un blocco fuori dalla griglia e' sempre un errore, a qualunque larghezza:
      // non dipende dal disegno, dipende da dove sta nel markup.
      const ok =
        result.maxDrift <= result.tolerance &&
        result.misplaced.length === 0 &&
        (belowDesign || result.overflowing.length === 0);
      if (!ok) failures += 1;
      rows.push({ route, width, where, ...result, ok, belowDesign, errors: errors.length });

      if (flag('--shots') && where === 'top') {
        const name = route.replace(/\//g, '-').replace(/^-/, '');
        await page.screenshot({ path: `${SHOT_DIR}/${name}-${width}.png`, fullPage: false });
      }
    }

    /*
     * Il megamenu si misura aperto, e si misura davvero.
     *
     * E' l'unica griglia del sito senza linee disegnate — sul nero il file mette
     * solo i blocchi bordati — quindi la sonda ne legge le tracce invece dei
     * pixel dipinti. E' identico su tutte le route, e si misura su una sola:
     * dodici misure in piu', non ottantaquattro.
     */
    if (route === MENU_ROUTE) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.click('#menu-toggle');
      // La tendina dura 0,7s e il contenuto finisce di comparire a 0,85: si
      // misura a entrata finita, quando il pannello e' dove restera'.
      await page.waitForTimeout(1400);

      const result = await page.evaluate(
        () => window.__probeGrid?.(document.getElementById('megamenu')) ?? null,
      );
      if (!result) throw new Error(`megamenu non trovato a ${width}px`);

      const ok = result.maxDrift <= result.tolerance && result.misplaced.length === 0;
      if (!ok) failures += 1;
      rows.push({ route: 'megamenu', width, where: 'aperto', ...result, ok, belowDesign: width < 1200, errors: errors.length });

      if (flag('--shots')) {
        await page.screenshot({ path: `${SHOT_DIR}/megamenu-${width}.png`, fullPage: false });
      }

      await page.keyboard.press('Escape');
    }

    if (errors.length > 0) {
      failures += 1;
      console.error(`  errori in console su ${route} a ${width}px:`, errors.slice(0, 3));
    }

    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

const pad = (v, n) => String(v).padEnd(n);
const head = `${pad('route', 19)}${pad('larghezza', 10)}${pad('scroll', 8)}${pad('tier', 6)}${pad('col', 5)}${pad('righe', 7)}${pad('blocchi', 9)}${pad('cella', 12)}${pad('scarto', 11)}${pad('sfora', 7)}esito`;
console.log('\n' + head);
console.log('-'.repeat(head.length));
for (const r of rows) {
  console.log(
    pad(r.route, 19) +
      pad(r.width + 'px', 10) +
      pad(r.where, 8) +
      pad(r.tier, 6) +
      pad(r.cols, 5) +
      pad(r.rows, 7) +
      pad(`${r.visible}/${r.total}`, 9) +
      pad(r.cell.toFixed(4), 12) +
      pad(r.maxDrift.toFixed(4) + 'px', 11) +
      pad(r.overflowing.length, 7) +
      (r.ok
        ? r.belowDesign && r.overflowing.length > 0
          ? `ok (sotto ${SMALLEST_DESIGNED_WIDTH}: ${r.overflowing.map((o) => o.block).join(', ')})`
          : 'ok'
        : `FALLITO ${r.misplaced.length ? `fuori griglia: ${r.misplaced.join(', ')} · ` : ''}` +
          `${r.worst && r.maxDrift > r.tolerance ? `(${r.worst.block} ${r.worst.edge} ${r.worst.delta.toFixed(3)}px)` : ''}` +
          (r.overflowing.length
            ? ` sfora: ${r.overflowing.map((o) => `${o.block} ${o.dx ? `+${o.dx}w` : ''}${o.dy ? `+${o.dy}h` : ''}`).join(', ')}`
            : '')),
  );
}

const knownRows = rows.filter((r) => r.known.length > 0);
if (knownRows.length > 0) {
  console.log('\nSfori gia' + String.fromCharCode(39) + ' presenti nel Figma (dichiarati con data-known-overflow):');
  const seen = new Set();
  for (const r of knownRows) {
    for (const k of r.known) {
      const key = `${r.route} ${k.block}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`  ${r.route} · ${k.block} · fino a +${k.dx}w +${k.dy}h`);
    }
  }
}

/*
 * Una pagina non puo' svuotarsi cambiando larghezza.
 *
 * Questo controllo esiste per un difetto che e' stato online dall'inizio senza
 * che nessuno lo vedesse: `/about`, `/works`, `/works/[slug]` e `/contact`
 * erano **vuote sotto i 1200**, header a parte. Dichiaravano il tier `base`
 * perche' header e footer un disegno a base ce l'hanno, e la regola che spegne
 * i blocchi assenti in un tier spegneva tutto il contenuto.
 *
 * Perche' nessuna sonda l'ha visto: questa scarta i blocchi a `display: none`,
 * per un motivo giusto — un blocco spento non ha misure da confrontare — e
 * quindi misurava l'header, lo trovava perfetto, e diceva ok. Nessuno chiedeva
 * **quanti** blocchi fossero rimasti.
 *
 * Ora lo si chiede. La soglia e' relativa al massimo della route stessa: la
 * home cambia composizione per tier e qualche blocco in piu' o in meno e'
 * normale, ma passare da trenta blocchi a due non lo e' a nessuna larghezza.
 */
const SVUOTAMENTO = 0.4;
const perRoute = new Map();
for (const r of rows) {
  if (r.where !== 'top') continue;
  const lista = perRoute.get(r.route) ?? [];
  lista.push(r);
  perRoute.set(r.route, lista);
}

const svuotate = [];
for (const [route, lista] of perRoute) {
  const max = Math.max(...lista.map((r) => r.visible));
  for (const r of lista) {
    if (r.visible < max * SVUOTAMENTO) svuotate.push({ route, width: r.width, visible: r.visible, max });
  }
}

if (svuotate.length > 0) {
  failures += svuotate.length;
  console.error('\nPagine che si svuotano cambiando larghezza:');
  for (const s of svuotate) {
    console.error(`  ${s.route} a ${s.width}px mostra ${s.visible} blocchi su ${s.max}`);
  }
}

const worst = rows.reduce((a, b) => (b.maxDrift > a.maxDrift ? b : a), rows[0]);
console.log(
  `\n${rows.length} misure su ${PATHS.length} route · scarto massimo ${worst.maxDrift.toFixed(4)}px` +
    ` a ${worst.width}px su ${worst.route} · tolleranza ${worst.tolerance}px`,
);

await writeFile(`${SHOT_DIR}/report.json`, JSON.stringify(rows, null, 2)).catch(() => {});

if (failures > 0) {
  console.error(`\n${failures} misure fuori tolleranza.`);
  process.exit(1);
}
console.log('Invariante verificato: i bordi dei blocchi cadono sulle linee a tutte le larghezze.');
