/**
 * La barra fissa e' **la stessa cosa** dei due comandi dell'header.
 *
 * Era la richiesta del committente — "i pulsanti restano identici" — e identici
 * e' una parola che si verifica: stessa colonna, stessa misura, a ogni
 * larghezza. Se un giorno l'header si sposta di una colonna e la barra no, a
 * schermo sono due quadrati quasi allineati, che e' il modo peggiore di
 * sbagliare.
 *
 * Serve una sonda a parte perche' **`verify:grid` non la guarda**: misura le
 * griglie di pagina, e questa sta fuori da `#smooth-content` per necessita'
 * (NOTES.md D123). Prima di scriverla, era l'unica cosa del sito senza misura.
 *
 * Si controlla anche il comportamento, che e' dove due comandi gemelli
 * divergono: aprono lo stesso pannello, portano lo stesso stato, e a pannello
 * aperto la barra diventa inerte — sta fuori da `#smooth-wrapper`, quindi
 * l'`inert` che copre la pagina dietro al modale non la raggiunge da solo.
 *
 * Uso: node scripts/verify-sticky.mjs [--url http://...]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const args = process.argv.slice(2);
const urlIndex = args.indexOf('--url');
const explicitUrl = urlIndex >= 0 ? args[urlIndex + 1] : null;

const WIDTHS = [390, 768, 1200, 1440, 1920];
/** Quanto si puo' discostare una copia dal suo originale: niente. */
const TOLLERANZA = 0.02;
/** Il grigio del filo, come in verify-edges. */
const RULE = [0x50, 0x4d, 0x5c];
/** Quanto puo' sbagliare un canale prima di non essere piu' quel colore. */
const TINTA = 6;

const server = explicitUrl ? { base: explicitUrl, stop: () => {} } : await startDevServer({ probePath: '/' });
const browser = await chromium.launch({ executablePath: CHROMIUM });
let failures = 0;

const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'ok     ' : 'FALLITO'} ${label}${detail ? ` — ${detail}` : ''}`);
};

try {
  console.log('\nLa barra fissa e i due comandi veri sono la stessa cosa?\n');

  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);

    const inCima = await page.evaluate(() => {
      const bar = document.getElementById('sticky-header');
      return bar ? { c: bar.hasAttribute('data-shown'), v: getComputedStyle(bar).visibility } : null;
    });
    check(`${width}: in cima alla pagina la barra non c'e'`, inCima !== null && !inCima.c && inCima.v === 'hidden',
      inCima === null ? 'barra assente' : `${inCima.v}`);

    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(2200);

    const m = await page.evaluate(() => {
      const bar = document.getElementById('sticky-header');
      const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
      const copiaMenu = bar.querySelector('[data-menu-toggle]');
      const copiaMail = bar.querySelector('.square-button[data-variant="mail"]');
      const veroMenu = document.getElementById('menu-toggle');
      const veraMail = document.querySelector('#smooth-content .square-button[data-variant="mail"]');
      return {
        mostrata: bar.hasAttribute('data-shown') && getComputedStyle(bar).visibility === 'visible',
        top: bar.getBoundingClientRect().top,
        copiaMenu: r(copiaMenu), veroMenu: r(veroMenu),
        copiaMail: r(copiaMail), veraMail: r(veraMail),
      };
    });

    check(`${width}: passato l'header, la barra c'e' ed e' attaccata in alto`,
      m.mostrata && Math.abs(m.top) <= TOLLERANZA, `top ${m.top.toFixed(2)}`);

    for (const [nome, copia, vero] of [['menu', m.copiaMenu, m.veroMenu], ['mail', m.copiaMail, m.veraMail]]) {
      const stessaColonna = Math.abs(copia.x - vero.x) <= TOLLERANZA;
      const stessaMisura = Math.abs(copia.w - vero.w) <= TOLLERANZA && Math.abs(copia.h - vero.h) <= TOLLERANZA;
      check(`${width}: ${nome} — stessa colonna dell'originale`, stessaColonna,
        `${copia.x.toFixed(2)} invece di ${vero.x.toFixed(2)}`);
      check(`${width}: ${nome} — stessa misura dell'originale`, stessaMisura,
        `${copia.w.toFixed(2)}x${copia.h.toFixed(2)} invece di ${vero.w.toFixed(2)}x${vero.h.toFixed(2)}`);
    }

    await context.close();
  }

  /*
   * E i suoi blocchi bordati hanno davvero i quattro fili.
   *
   * Questa e' la parte che la barra ha gia' fatto sbagliare una volta, in
   * direzione opposta. `verify:rules` e `verify:motion` la prendevano dentro
   * con un selettore scritto per esclusione, leggevano le quattro variabili dei
   * fili — vuote, perche' nessuno gliele scrive — e riportavano `0%` e `NaN%`,
   * cioe' un difetto che non c'era: senza variabile vale il fallback `100%` del
   * CSS, e i fili sono interi.
   *
   * Corretto quel selettore, la barra e' uscita da tutt'e due. Quindi il
   * controllo se lo prende qui, e si fa sui **pixel dipinti** invece che sulle
   * variabili: quello che conta e' che il bordo si veda, non come e' scritto.
   */
  console.log('\nE i blocchi bordati della barra hanno i loro quattro fili?\n');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(2200);

    const bordati = await page.evaluate(() =>
      [...document.querySelectorAll('#sticky-header .block[data-surface="line"]')].map((el, i) => {
        const b = el.getBoundingClientRect();
        el.setAttribute('data-sonda', String(i));
        return { i, l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) };
      }),
    );
    check('la barra ha almeno un blocco bordato da controllare', bordati.length > 0, `ne ho trovati ${bordati.length}`);

    const pixel = async (x, y) => {
      const buf = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
      const { data } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      return [data[0], data[1], data[2]];
    };
    const eFilo = (px) => px.every((c, k) => Math.abs(c - RULE[k]) <= TINTA);

    for (const box of bordati) {
      for (const [lato, x, y] of [
        ['alto', box.l + 20, box.t],
        ['sinistro', box.l, box.t + 20],
        ['destro', box.r - 1, box.t + 20],
        ['basso', box.l + 20, box.b - 1],
      ]) {
        const px = await pixel(x, y);
        check(`blocco ${box.i} · filo ${lato}`, eFilo(px), px.join(','));
      }
    }

    await context.close();
  }

  console.log('\nE il suo bottone menu fa quello che fa l\'altro?\n');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(2200);

    await page.click('#sticky-header [data-menu-toggle]');
    await page.waitForTimeout(1600);
    const aperto = await page.evaluate(() => ({
      open: document.getElementById('megamenu').hasAttribute('data-open'),
      inert: document.getElementById('sticky-header').hasAttribute('inert'),
      stati: [...document.querySelectorAll('[data-menu-toggle]')].map((t) => t.getAttribute('aria-expanded')),
    }));
    check('dalla barra il pannello si apre', aperto.open);
    check('a pannello aperto la barra e\' inerte', aperto.inert,
      'sta fuori da #smooth-wrapper: l\'inert della pagina non la raggiunge');
    check('i due bottoni dicono la stessa cosa', aperto.stati.every((v) => v === 'true'), aperto.stati.join(', '));

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1600);
    const chiuso = await page.evaluate(() => ({
      open: document.getElementById('megamenu').hasAttribute('data-open'),
      inert: document.getElementById('sticky-header').hasAttribute('inert'),
      fuoco: document.getElementById('sticky-header').contains(document.activeElement),
      stati: [...document.querySelectorAll('[data-menu-toggle]')].map((t) => t.getAttribute('aria-expanded')),
    }));
    check('chiudendo, la barra torna viva', !chiuso.open && !chiuso.inert);
    check('il fuoco torna al bottone che ha aperto, non a quello di pagina', chiuso.fuoco);
    check('lo stato torna chiuso su tutti e due', chiuso.stati.every((v) => v === 'false'), chiuso.stati.join(', '));

    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

if (failures > 0) {
  console.error(`\n${failures} controlli falliti sulla barra fissa.`);
  process.exit(1);
}
console.log('\nLa barra fissa e\' identica ai comandi veri, e si comporta come loro.');
