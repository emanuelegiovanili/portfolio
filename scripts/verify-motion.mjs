/**
 * Il movimento fa quello che dice, e sparisce quando deve.
 *
 * Tre cose:
 * 1. con `prefers-reduced-motion: reduce` non viene creato niente: lo scroll e'
 *    quello del browser e le linee sono intere;
 * 2. senza quella preferenza lo scroll e' morbido e le linee partono corte;
 * 3. una linea raggiunta dallo scroll arriva a lunghezza piena e ci resta.
 *
 * Il terzo punto e' quello che conta: un'animazione che non si completa lascia
 * un bordo a meta' su una griglia a vista, e si vede da tre metri.
 */

import { chromium } from 'playwright';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const ROUTE = process.argv[2] ?? '/';

const server = await startDevServer({ probePath: ROUTE });
const browser = await chromium.launch({ executablePath: CHROMIUM });
let failures = 0;

const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'ok     ' : 'FALLITO'} ${label}${detail ? ` — ${detail}` : ''}`);
};

async function open(reducedMotion) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion,
  });
  const errors = [];
  const page = await context.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(server.base + ROUTE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

try {
  console.log(`\nMovimento su ${ROUTE}\n`);

  console.log('prefers-reduced-motion: reduce');
  {
    const { context, page, errors } = await open('reduce');
    const state = await page.evaluate(() => {
      const line = document.querySelector('.grid-line--h');
      const block = document.querySelector('.block[data-surface="line"]');
      return {
        transform: line ? getComputedStyle(line).transform : null,
        ruleX: block ? getComputedStyle(block).getPropertyValue('--rule-x').trim() : null,
        wrapperPosition: getComputedStyle(document.getElementById('smooth-wrapper')).position,
      };
    });
    check('le linee sono intere', state.transform === 'none' || state.transform === 'matrix(1, 0, 0, 1, 0, 0)', state.transform ?? '');
    check('i fili dei blocchi sono interi', state.ruleX === '1', state.ruleX ?? '');
    check('nessun wrapper fisso: lo scroll e\' del browser', state.wrapperPosition !== 'fixed', state.wrapperPosition);
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');
    await context.close();
  }

  console.log('\nsenza preferenza');
  {
    const { context, page, errors } = await open('no-preference');
    const before = await page.evaluate(() => {
      const lines = [...document.querySelectorAll('.grid-line--h')].filter((l) => l.offsetHeight > 0);
      const last = lines[lines.length - 1];
      const rect = last.getBoundingClientRect();
      return {
        smootherActive: getComputedStyle(document.getElementById('smooth-wrapper')).position === 'fixed',
        lastWidth: rect.width,
        lastTop: rect.top,
        count: lines.length,
      };
    });
    check('ScrollSmoother attivo', before.smootherActive);
    check(
      'l\'ultima linea parte corta',
      before.lastWidth < 1,
      `larga ${before.lastWidth.toFixed(1)}px, ${before.count} linee`,
    );

    // Si scende in fondo e si aspetta che l'inerzia si esaurisca.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2500);

    const after = await page.evaluate(() => {
      const lines = [...document.querySelectorAll('.grid-line--h')].filter((l) => l.offsetHeight > 0);
      const widths = lines.map((l) => l.getBoundingClientRect().width);
      const grid = document.querySelector('.grid');
      const full = grid.getBoundingClientRect().width;
      const blocks = [...document.querySelectorAll('.block[data-surface="line"]')];
      const rules = blocks.map((b) => Number.parseFloat(getComputedStyle(b).getPropertyValue('--rule-x')));
      const verticals = [...document.querySelectorAll('.grid-line--v')].filter((l) => l.offsetWidth > 0);
      const vScale = verticals.map((v) => v.getBoundingClientRect().height / v.offsetHeight);
      return {
        shortest: Math.min(...widths) / full,
        minRule: Math.min(...rules),
        minVertical: Math.min(...vScale),
      };
    });
    check(
      'tutte le orizzontali sono arrivate a fondo corsa',
      after.shortest > 0.99,
      `la piu' corta e' al ${(after.shortest * 100).toFixed(1)}%`,
    );
    check('tutti i fili dei blocchi sono interi', after.minRule > 0.99, `il piu' corto e' ${after.minRule.toFixed(3)}`);
    check(
      'le verticali arrivano in fondo alla pagina',
      after.minVertical > 0.99,
      `la piu' corta e' al ${(after.minVertical * 100).toFixed(1)}%`,
    );
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');
    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

if (failures > 0) {
  console.error(`\n${failures} controlli falliti.`);
  process.exit(1);
}
console.log('\nIl movimento si completa e sparisce quando deve.');
