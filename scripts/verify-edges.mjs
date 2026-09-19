/**
 * I fili dei blocchi cadono sul pixel della linea, non accanto.
 *
 * `verify:grid` misura le **scatole**: i bordi dei blocchi coincidono con i
 * confini di griglia a 0,0000px, e questo resta vero. Ma un bordo di un pixel
 * disegnato dentro la scatola cade sulla linea solo in alto e a sinistra; in
 * basso e a destra le sta accanto, e a schermo si vede un pixel scuro e uno
 * chiaro appaiati. Le scatole erano giuste e il disegno no.
 *
 * Questo script guarda i pixel veri. Ritaglia una striscia larga o alta un
 * pixel che attraversa i quattro lati di un blocco e verifica che:
 *
 *   - sul lato ci sia il colore del filo;
 *   - **subito fuori** non ci sia il colore della griglia, cioe' che il filo
 *     abbia coperto la linea invece di affiancarla.
 *
 * Uso:
 *   node scripts/verify-edges.mjs
 *   node scripts/verify-edges.mjs --url http://…
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

/**
 * I bottoni di cui si controlla lo strato di hover.
 *
 * Deve coprire il blocco piu' esattamente un pixel a destra e in basso, cioe'
 * le due linee di griglia che lo chiudono. Ne' meno — resterebbe scoperta una
 * riga del vecchio colore — ne' piu': sborderebbe nella cella del vicino.
 */
const HOVER = [
  { route: '/', selector: '#menu-toggle', nome: 'menu (bordato)' },
  { route: '/', selector: '.square-button[data-variant="mail"]', nome: 'mail (viola)' },
  { route: '/', selector: '.primary-button', nome: 'primario (viola)' },
];

/** I blocchi bordati che si guardano, uno per forma e per vicinato. */
const CASES = [
  { route: '/', selector: '.skill-card', nome: 'skill card (isolata)' },
  { route: '/', selector: '.about-section', nome: 'about (larga)' },
  { route: '/', selector: '.logo', nome: 'logo di testa' },
  { route: '/about', selector: '.prose', nome: 'bio (/about)' },
  { route: '/works', selector: '.works-card', nome: 'card progetto (/works)' },
];

const RULE = [0x50, 0x4d, 0x5c];
const GRID = [0xd8, 0xd6, 0xdd];
/** Quanto puo' scostarsi un canale prima di non essere piu' quel colore. */
const TOLLERANZA = 12;

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const explicitUrl = value('--url', null);
const server = explicitUrl ? { base: explicitUrl, stop: () => {} } : await startDevServer({ probePath: CASES[0].route });

const browser = await chromium.launch({ executablePath: CHROMIUM });
let failures = 0;

const near = (px, target) => px.every((c, i) => Math.abs(c - target[i]) <= TOLLERANZA);

/**
 * Il rettangolo di un blocco, e se tocca il bordo della griglia.
 *
 * Sul bordo il filo torna dentro, come fa l'ultima linea di griglia: fuori
 * cadrebbe oltre il contenitore. L'atteso cambia di un pixel, e senza questo la
 * verifica cercherebbe il filo del bottone del menu — dodicesima colonna — a
 * x=1440 di uno schermo largo 1440.
 */
const BOX_OF = `(sel) => {
  const el = document.querySelector(sel);
  const grid = el.closest('.grid');
  const r = el.getBoundingClientRect();
  const g = grid.getBoundingClientRect();
  return {
    left: Math.round(r.left), right: Math.round(r.right),
    top: Math.round(r.top), bottom: Math.round(r.bottom),
    edgeX: r.right >= g.right - 0.5,
    edgeY: r.bottom >= g.bottom - 0.5,
  };
}`;

/** Una striscia di pixel dallo schermo, letta come terne RGB. */
async function strip(page, clip) {
  const buf = await page.screenshot({ clip });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const out = [];
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    out.push([data[o], data[o + 1], data[o + 2]]);
  }
  return out;
}

try {
  console.log('\nI fili cadono sulla linea?\n');

  for (const { route, selector, nome } of CASES) {
    // Densita' 1: un pixel dell'immagine e' un pixel CSS, e i conti tornano.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const found = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;
    }, selector);

    if (found === null) {
      console.log(`  SALTATO ${nome} — ${selector} non esiste su ${route}`);
      await context.close();
      continue;
    }

    // Il blocco va portato in vista e il suo filo deve aver finito il giro:
    // a meta' tratto non c'e' niente da misurare.
    await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 250)), found);
    await page.waitForTimeout(2600);

    const box = await page.evaluate(new Function('return ' + BOX_OF)(), selector);

    // Una fascia orizzontale e una verticale, prese vicino a un angolo dove il
    // contenuto non arriva: si guardano i fili, non il testo. Il margine si
    // accorcia sui blocchi a filo di schermo, dove non c'e' un "fuori" da
    // misurare: il logo di testa sta a x=0.
    const PAD = 3;
    const padL = Math.min(PAD, box.left);
    const padT = Math.min(PAD, box.top);
    const w = box.right - box.left;
    const h = box.bottom - box.top;

    const cols = await strip(page, { x: box.left - padL, y: box.top + 6, width: padL + w + PAD, height: 1 });
    const rows = await strip(page, { x: box.left + 6, y: box.top - padT, width: 1, height: padT + h + PAD });

    /*
     * Dove deve stare il filo.
     *
     * Alto e sinistro cadono sul **primo** pixel del blocco, destro e basso sul
     * primo pixel **dopo** il blocco: e' li' che sta la linea di griglia che lo
     * chiude, ed e' esattamente lo spostamento che si sta verificando. Subito
     * oltre non deve restare griglia scoperta.
     */
    // Sul bordo della griglia il filo sta all'ultimo pixel **dentro** il blocco.
    const dx = padL + w - (box.edgeX ? 1 : 0);
    const dy = padT + h - (box.edgeY ? 1 : 0);
    const lati = [
      ['sinistro', cols[padL], padL > 0 ? cols[padL - 1] : null],
      ['destro', cols[dx], cols[dx + 1] ?? null],
      ['alto', rows[padT], padT > 0 ? rows[padT - 1] : null],
      ['basso', rows[dy], rows[dy + 1] ?? null],
    ];

    for (const [lato, dentro, fuori] of lati) {
      const haFilo = near(dentro, RULE);
      const lineaScoperta = fuori !== null && near(fuori, GRID);
      const ok = haFilo && !lineaScoperta;
      if (!ok) failures += 1;
      const dett = `filo ${dentro.join(',')}${fuori ? ` · fuori ${fuori.join(',')}` : ''}`;
      console.log(
        `  ${ok ? 'ok     ' : 'FALLITO'} ${nome} · lato ${lato}` +
          (ok ? '' : ` — ${!haFilo ? 'nessun filo dove dovrebbe' : 'la linea resta scoperta accanto al filo'} (${dett})`),
      );
    }

    await context.close();
  }
  console.log('\nLo strato dell\'hover copre il blocco e la sua linea?\n');

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + HOVER[0].route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    for (const { selector, nome } of HOVER) {
      const scarti = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const fill = el.querySelector('.hover-fill');
        if (!fill) return 'senza strato';
        const b = el.getBoundingClientRect();
        const f = fill.getBoundingClientRect();
        const g = el.closest('.grid').getBoundingClientRect();
        return {
          sx: +(b.left - f.left).toFixed(2),
          su: +(b.top - f.top).toFixed(2),
          dx: +(f.right - b.right).toFixed(2),
          giu: +(f.bottom - b.bottom).toFixed(2),
          edgeX: b.right >= g.right - 0.5,
          edgeY: b.bottom >= g.bottom - 0.5,
        };
      }, selector);

      if (scarti === null || typeof scarti === 'string') {
        failures += 1;
        console.log(`  FALLITO ${nome} — ${scarti ?? 'blocco assente'}`);
        continue;
      }
      // Zero sui due lati che gia' coincidono, un pixel sui due che chiudono —
      // ma zero anche li' quando il blocco tocca il bordo della griglia, dove
      // il decoro torna dentro.
      const attesoDx = scarti.edgeX ? 0 : 1;
      const attesoGiu = scarti.edgeY ? 0 : 1;
      const ok = scarti.sx === 0 && scarti.su === 0 && scarti.dx === attesoDx && scarti.giu === attesoGiu;
      if (!ok) failures += 1;
      console.log(
        `  ${ok ? 'ok     ' : 'FALLITO'} ${nome}` +
          (ok ? '' : ` — sx ${scarti.sx} su ${scarti.su} dx ${scarti.dx} giu ${scarti.giu}, attesi 0 0 ${attesoDx} ${attesoGiu}`),
      );
    }

    /*
     * E il filo deve restare visibile **mentre** il bottone e' riempito.
     *
     * Senza contorno un bottone riempito di off-white su una pagina off-white
     * galleggia, e il blocco esce dalla griglia proprio mentre lo stai
     * puntando: e' la regressione che il committente ha segnalato.
     */
    console.log('\nE con il riempimento su, il filo c\'e\' ancora?\n');

    for (const { selector, nome } of HOVER) {
      const box = await page.evaluate(new Function('return ' + BOX_OF)(), selector);

      await page.hover(selector);
      // Il riempimento e' una transizione CSS: si misura a corsa finita.
      await page.waitForTimeout(900);

      const PAD = 3;
      const padL = Math.min(PAD, box.left);
      const padT = Math.min(PAD, box.top);
      const w = box.right - box.left;
      const h = box.bottom - box.top;
      const cols = await strip(page, { x: box.left - padL, y: box.top + 6, width: padL + w + PAD, height: 1 });
      const rows = await strip(page, { x: box.left + 6, y: box.top - padT, width: 1, height: padT + h + PAD });

      for (const [lato, px] of [
        ['sinistro', cols[padL]],
        ['destro', cols[padL + w - (box.edgeX ? 1 : 0)]],
        ['alto', rows[padT]],
        ['basso', rows[padT + h - (box.edgeY ? 1 : 0)]],
      ]) {
        const ok = near(px, RULE);
        if (!ok) failures += 1;
        console.log(`  ${ok ? 'ok     ' : 'FALLITO'} ${nome} in hover · lato ${lato}` + (ok ? '' : ` — ${px.join(',')} invece del filo`));
      }

      await page.mouse.move(2, 2);
      await page.waitForTimeout(700);
    }

    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

if (failures > 0) {
  console.error(`\n${failures} lati non cadono sulla linea.`);
  process.exit(1);
}
console.log('\nI quattro fili di ogni blocco coprono la propria linea di griglia.');
