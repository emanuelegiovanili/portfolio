/**
 * Quanto margine ha un blocco fra il proprio span e il contenuto piu' lungo.
 *
 * La griglia garantisce che i bordi cadano sulle linee, non che il contenuto ci
 * stia dentro: le tracce sono fisse, quindi un testo troppo lungo non allarga la
 * cella, la sfora. Questo script dice di quanto, larghezza per larghezza, cosi'
 * la decisione si prende sui numeri invece che a occhio.
 *
 * Uso: node scripts/measure-fit.mjs <route> <selettore> [--widths 1200,1440]
 *   node scripts/measure-fit.mjs /grid/components .cta-section
 */

import { chromium } from 'playwright';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const [route = '/grid/components', selector = '.cta-section'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const widthsArg = process.argv.indexOf('--widths');
const WIDTHS =
  widthsArg >= 0
    ? process.argv[widthsArg + 1].split(',').map(Number)
    : [320, 390, 430, 720, 768, 1024, 1200, 1240, 1280, 1320, 1366, 1440, 1512, 1680, 1920];

const server = await startDevServer({ probePath: route });
const browser = await chromium.launch({ executablePath: CHROMIUM });

const pad = (v, n) => String(v).padEnd(n);
console.log(`${selector} su ${route}\n`);
console.log(pad('vw', 8) + pad('cella', 9) + pad('blocco', 13) + pad('contenuto', 13) + pad('serve', 9) + 'avanzo');
console.log('-'.repeat(60));

let worst = null;
for (const width of WIDTHS) {
  // Stessa emulazione della verifica: sotto il confine md la scrollbar e' a
  // sovrapposizione e la cella e' piena, altrimenti i due strumenti misurano
  // due celle diverse alla stessa larghezza.
  const mobile = width < 720;
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 900 },
    deviceScaleFactor: mobile ? 3 : 2,
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  await page.goto(server.base + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const r = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const box = el.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) return { hidden: true };
    const cs = getComputedStyle(el);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const gap = parseFloat(cs.rowGap) || 0;
    const kids = [...el.children];
    const need = kids.reduce((a, k) => a + k.getBoundingClientRect().height, 0) + gap * Math.max(0, kids.length - 1);
    const grid = document.querySelector('.grid');
    const cell = grid.getBoundingClientRect().width / parseInt(getComputedStyle(grid).getPropertyValue('--cols'));
    return {
      cell,
      boxW: box.width,
      boxH: box.height,
      contentW: box.width - padX,
      contentH: box.height - padY,
      need,
    };
  }, selector);

  if (!r) {
    await context.close();
    console.log(pad(width, 8) + 'selettore non trovato');
    continue;
  }
  if (r.hidden) {
    await context.close();
    console.log(pad(width, 8) + 'non visibile a questo tier');
    continue;
  }

  await context.close();

  const slack = r.contentH - r.need;
  if (worst === null || slack < worst.slack) worst = { width, slack };
  console.log(
    pad(width, 8) +
      pad(r.cell.toFixed(2), 9) +
      pad(`${r.boxW.toFixed(0)}x${r.boxH.toFixed(0)}`, 13) +
      pad(`${r.contentW.toFixed(0)}x${r.contentH.toFixed(0)}`, 13) +
      pad(r.need.toFixed(0), 9) +
      (slack >= 0 ? '+' : '') + slack.toFixed(1),
  );
}

await browser.close();
server.stop();

if (worst) {
  console.log(
    `\nmargine minimo ${worst.slack >= 0 ? '+' : ''}${worst.slack.toFixed(1)}px a ${worst.width}px` +
      (worst.slack < 0 ? ' — il contenuto sfora' : ''),
  );
}
