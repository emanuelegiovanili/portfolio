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
 *   node scripts/verify-grid.mjs --shots         (salva anche i png in .verify/)
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const WIDTHS = [320, 390, 430, 719, 720, 768, 1024, 1199, 1200, 1280, 1440, 1680, 1920];
const SCROLLS = ['top', 'middle', 'bottom'];
const PATH = '/grid';
const SHOT_DIR = '.verify';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const explicitUrl = value('--url', null);
const server = explicitUrl ? { base: explicitUrl, stop: () => {} } : await startDevServer({ probePath: PATH });

if (flag('--shots') && !existsSync(SHOT_DIR)) await mkdir(SHOT_DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROMIUM });
const rows = [];
let failures = 0;

try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(server.base + PATH, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    for (const where of SCROLLS) {
      await page.evaluate((w) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, w === 'top' ? 0 : w === 'bottom' ? max : Math.round(max / 2));
      }, where);

      const result = await page.evaluate(() => window.__probeGrid?.() ?? null);
      if (!result) throw new Error(`nessuna griglia trovata a ${width}px`);

      const ok = result.maxDrift <= result.tolerance && result.overflowing.length === 0;
      if (!ok) failures += 1;
      rows.push({ width, where, ...result, ok, errors: errors.length });

      if (flag('--shots') && where === 'top') {
        await page.screenshot({ path: `${SHOT_DIR}/grid-${width}.png`, fullPage: false });
      }
    }

    if (errors.length > 0) {
      failures += 1;
      console.error(`  errori in console a ${width}px:`, errors.slice(0, 3));
    }

    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

const pad = (v, n) => String(v).padEnd(n);
const head = `${pad('larghezza', 10)}${pad('scroll', 8)}${pad('tier', 6)}${pad('col', 5)}${pad('righe', 7)}${pad('cella', 12)}${pad('scarto', 11)}${pad('sfora', 7)}esito`;
console.log('\n' + head);
console.log('-'.repeat(head.length));
for (const r of rows) {
  console.log(
    pad(r.width + 'px', 10) +
      pad(r.where, 8) +
      pad(r.tier, 6) +
      pad(r.cols, 5) +
      pad(r.rows, 7) +
      pad(r.cell.toFixed(4), 12) +
      pad(r.maxDrift.toFixed(4) + 'px', 11) +
      pad(r.overflowing.length, 7) +
      (r.ok ? 'ok' : `FALLITO ${r.worst ? `(${r.worst.block} ${r.worst.edge})` : ''}`),
  );
}

const worst = rows.reduce((a, b) => (b.maxDrift > a.maxDrift ? b : a), rows[0]);
console.log(
  `\n${rows.length} misure · scarto massimo ${worst.maxDrift.toFixed(4)}px a ${worst.width}px` +
    ` · tolleranza ${worst.tolerance}px`,
);

await writeFile(`${SHOT_DIR}/report.json`, JSON.stringify(rows, null, 2)).catch(() => {});

if (failures > 0) {
  console.error(`\n${failures} misure fuori tolleranza.`);
  process.exit(1);
}
console.log('Invariante verificato: i bordi dei blocchi cadono sulle linee a tutte le larghezze.');
