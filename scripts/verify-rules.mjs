/**
 * La promessa sui fili, verificata scorrendo davvero le pagine.
 *
 * `verify:grid` misura le scatole. `verify:edges` guarda i pixel dipinti, ma a
 * pagina ferma e su un blocco alla volta. Nessuno dei due ha mai guardato la
 * cosa che l'utente guarda: **una pagina che scorre**, con i suoi blocchi che
 * entrano uno dopo l'altro.
 *
 * Il difetto che ha dato origine a questo script: la finestra d'ingresso era
 * legata al bordo **alto** del blocco, quindi un blocco basso appoggiato al
 * fondo dello schermo poteva essere tutto visibile con il filo appena
 * cominciato. A 390, dove la cella e' 39px, nella fascia bassa ci stanno cinque
 * blocchi cosi'. Il committente l'ha visto e l'ha chiamato "in mobile mancano i
 * bordi ai container".
 *
 * La promessa che si verifica qui, in una riga: **un blocco che dista dal fondo
 * della finestra piu' di `1 - ENTER_END` di schermata ha i suoi quattro fili
 * interi**, a qualunque larghezza, su qualunque pagina, a qualunque altezza di
 * scroll.
 *
 * Uso:
 *   node scripts/verify-rules.mjs
 *   node scripts/verify-rules.mjs --url http://…
 */

import { chromium } from 'playwright';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

/** Deve restare uguale a `ENTER_END` in src/scripts/motion.ts. */
const ENTER_END = 0.85;

/** Una larghezza per tier, con il telefono emulato dove serve. */
const VIEWPORTS = [
  { width: 390, height: 844, touch: true },
  { width: 768, height: 900, touch: false },
  { width: 1440, height: 900, touch: false },
];

const ROUTES = ['/', '/about', '/works', '/works/seezy', '/contact'];

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const explicitUrl = value('--url', null);
const server = explicitUrl ? { base: explicitUrl, stop: () => {} } : await startDevServer({ probePath: ROUTES[0] });

const browser = await chromium.launch({ executablePath: CHROMIUM });
let failures = 0;

try {
  console.log('\nScorrendo la pagina, un blocco fermo ha sempre i suoi fili?\n');

  for (const { width, height, touch } of VIEWPORTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 2,
        isMobile: touch,
        hasTouch: touch,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      await page.goto(server.base + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      // Il primo giro di trigger e le immagini pigre della prima schermata.
      await page.waitForTimeout(1500);

      const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      // Passo di poco meno di mezza schermata: nessun blocco puo' attraversare
      // tutta la fascia d'ingresso fra un campione e il successivo.
      const passo = Math.max(1, Math.round(height * 0.4));
      const rotti = new Map();
      let campioni = 0;

      for (let y = 0; y <= max; y += passo) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        // Lo scrub e' immediato, ma il fotogramma va lasciato passare.
        await page.waitForTimeout(400);
        campioni += 1;

        const bad = await page.evaluate((soglia) => {
          const out = [];
          // Dentro `#smooth-content`, non "tutte tranne il megamenu": le
          // griglie sono tre da quando c'e' la barra fissa, e i suoi blocchi
          // hanno i fili interi per fallback, senza variabile scritta. Vedi
          // NOTES.md D124.
          for (const b of document.querySelectorAll('#smooth-content .grid .block[data-surface="line"]')) {
            if (!(b.offsetWidth || b.offsetHeight)) continue;
            const r = b.getBoundingClientRect();
            // Fuori dalla promessa: sopra il bordo alto non c'e' niente da
            // dire, e sotto la soglia il blocco si sta ancora disegnando.
            if (r.top < 0 || r.bottom > window.innerHeight * soglia) continue;
            const v = ['--rule-t', '--rule-r', '--rule-b', '--rule-l'].map(
              (n) => Number.parseFloat(getComputedStyle(b).getPropertyValue(n)) || 0,
            );
            // Percentuali, non frazioni: il filo intero e' 100.
            if (Math.min(...v) < 99) {
              out.push({
                nome: b.className.replace('block ', '').split(' ')[0] || b.tagName.toLowerCase(),
                fili: v.map((x) => `${x.toFixed(0)}%`).join('/'),
              });
            }
          }
          return out;
        }, ENTER_END);

        for (const r of bad) rotti.set(r.nome, `${r.nome} ${r.fili}`);
      }

      const ok = rotti.size === 0;
      if (!ok) failures += 1;
      console.log(
        `  ${ok ? 'ok     ' : 'FALLITO'} ${String(width + 'px').padEnd(8)}${route.padEnd(16)}` +
          `${campioni} posizioni` +
          (ok ? '' : ` — ${[...rotti.values()].join(' | ')}`),
      );

      await context.close();
    }
  }
} finally {
  await browser.close();
  server.stop();
}

if (failures > 0) {
  console.error(`\n${failures} pagine mostrano un blocco fermo senza i suoi fili.`);
  process.exit(1);
}
console.log('\nUn blocco fermo ha sempre i suoi quattro fili, a ogni larghezza e a ogni altezza di scroll.');
