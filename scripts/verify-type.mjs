/**
 * Verifica che i titoli display abbiano esattamente l'altezza dei text node Figma.
 *
 * Con `text-box: trim-both cap alphabetic` e `line-height: 1` la scatola di un
 * titolo vale (cap-height x font-size) per la prima riga, piu' un font-size
 * pieno per ogni riga successiva. La cap-height di Getai e' 0.74em. Se il font
 * non carica, o se il trim non viene applicato, i numeri cambiano subito.
 *
 * I valori attesi vengono dai text node del Figma, non da una formula
 * riscritta: e' il confronto che serve.
 */

import { chromium } from 'playwright';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const CASES = [
  { node: '310:1336', text: 'My work', size: 64, width: null, expected: 47, label: 'titolo pagina, 1 riga' },
  { node: '266:1126', text: 'People with good taste', size: 64, width: 438, expected: 111, label: 'titolo pagina, 2 righe' },
  { node: '264:968', text: "What's in the mix", size: 64, width: 438, expected: 111, label: 'titolo sezione home, 2 righe' },
  { node: '266:1101', text: 'Baking Ideas', size: 204, width: 800, expected: 355, label: 'hero, 2 righe' },
];

/** Il Figma arrotonda l'altezza del text node all'intero: un pixel di scarto e' il suo, non nostro. */
const TOLERANCE = 1;

const server = await startDevServer();
const browser = await chromium.launch({ executablePath: CHROMIUM });
let failures = 0;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(server.base + '/grid', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // fonts.check() dice se il font e' gia' pronto, non se il CSS lo userebbe: su
  // /grid nessun elemento usa Getai, quindi senza una load() esplicita
  // risponderebbe di no anche con il file perfettamente a posto.
  const loaded = await page.evaluate(async () => {
    const want = ['900 64px "DT Getai Grotesk Display"', '500 16px Poppins', '700 16px Poppins'];
    await Promise.all(want.map((f) => document.fonts.load(f)));
    return {
      getai: document.fonts.check(want[0]),
      poppins500: document.fonts.check(want[1]),
      poppins700: document.fonts.check(want[2]),
    };
  });
  console.log(
    `font caricati — Getai ${loaded.getai ? 'si' : 'NO'} · Poppins 500 ${loaded.poppins500 ? 'si' : 'NO'} · Poppins 700 ${loaded.poppins700 ? 'si' : 'NO'}`,
  );
  if (!loaded.getai) failures += 1;

  const results = await page.evaluate((cases) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
    document.body.append(host);
    const out = cases.map((c) => {
      const el = document.createElement('p');
      el.className = 't-display';
      el.textContent = c.text;
      el.style.margin = '0';
      el.style.fontSize = `${c.size}px`;
      if (c.width) el.style.width = `${c.width}px`;
      else el.style.whiteSpace = 'nowrap';
      host.append(el);
      const rect = el.getBoundingClientRect();
      const lines = Math.round(el.getClientRects().length);
      return { ...c, measured: rect.height, lines };
    });
    host.remove();
    return out;
  }, CASES);

  // Con font-display: optional, se Getai non arriva in tempo la pagina resta sul
  // fallback per tutta la sua vita. Quel caso deve comunque stare nella cella:
  // il fallback e' tarato sulla cap-height proprio per questo, e qui si verifica.
  const fallback = await page.evaluate(() => {
    const el = document.createElement('p');
    el.className = 't-display';
    el.textContent = 'My work';
    el.style.cssText =
      'position:absolute;left:-9999px;top:0;margin:0;font-size:64px;white-space:nowrap;' +
      "font-family:'Getai Fallback'";
    document.body.append(el);
    const h = el.getBoundingClientRect().height;
    el.remove();
    return h;
  });
  // Tolleranza 3px: gli override sono tarati su Arial, ma il src risolve su
  // Liberation Sans dove Arial non c'e', e la sua cap-height e' il 4% piu' bassa.
  // Sopra questa soglia vuol dire che il @font-face non ha risolto niente e gli
  // override non sono stati applicati, che e' il guasto vero da intercettare.
  const fallbackDelta = Math.abs(fallback - 47.36);
  const fallbackOk = fallbackDelta <= 3;
  if (!fallbackOk) failures += 1;
  console.log(
    `fallback Getai a 64px: ${fallback.toFixed(2)}px contro i 47.36px del font reale ` +
      `(scarto ${fallbackDelta.toFixed(2)}px) ${fallbackOk ? 'ok' : 'FALLITO'}`,
  );

  /*
   * Nessun testo display puo' chiedere al font un glifo che non ha.
   *
   * Il committente ha segnalato un difetto sulla "e" accentata di "TAMA
   * caffe'". Non era codifica — il JSON, la build e le intestazioni sono UTF-8
   * corretti — ma il file del font: **DT Getai Grotesk Display Black non ha i
   * glifi accentati**. La lettera cadeva sul ripiego, cioe' un font di sistema
   * con gli override metrici di Getai addosso: forma sbagliata e deformata, in
   * mezzo a una parola.
   *
   * Non lo vedeva nessuna sonda. `verify:type` misurava le **altezze** dei
   * titoli, che restano giuste anche quando a disegnare una lettera e' un altro
   * font: la geometria non si accorge di un cambio di carattere.
   *
   * Si misura per carattere e non per famiglia, perche' `document.fonts.check`
   * risponde sulla famiglia: stessa larghezza con e senza il font vuol dire che
   * a disegnarlo e' stato il ripiego.
   *
   * I buchi gia' noti si **dichiarano**, come gli sfori del Figma: la sonda
   * serve a fermare il **prossimo** carattere che entra in un titolo senza
   * avere un glifo, non a restare rossa su un difetto di cui si e' gia' deciso
   * cosa fare. Il giorno che arriva un file di Getai completo, questa lista si
   * svuota e il ripiego in `tokens.css` si toglie. Vedi NOTES.md B26.
   */
  const GLIFI_NOTI = ['\u00e8'];
  console.log('\nI testi display stanno dentro ai glifi che il font ha?\n');
  {
    const rotte = ['/', '/works', '/works/tama-caffe', '/works/seezy', '/works/noranutrizione', '/about', '/contact'];
    const pagina = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    for (const rotta of rotte) {
      await pagina.goto(server.base + rotta, { waitUntil: 'networkidle' });
      await pagina.evaluate(() => document.fonts.ready);

      const mancanti = await pagina.evaluate(() => {
        const ctx = document.createElement('canvas').getContext('2d');
        const haGlifo = (ch) => {
          ctx.font = '900 64px "DT Getai Grotesk Display", monospace';
          const con = ctx.measureText(ch).width;
          ctx.font = '900 64px monospace';
          return Math.abs(con - ctx.measureText(ch).width) > 0.01;
        };
        const visti = new Map();
        for (const el of document.querySelectorAll('*')) {
          if (!getComputedStyle(el).fontFamily.includes('Getai')) continue;
          const testo = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
          for (const ch of testo) {
            // Spazi e a capo non hanno un glifo da disegnare.
            if (/\s/.test(ch) || visti.has(ch)) continue;
            visti.set(ch, haGlifo(ch));
          }
        }
        return [...visti].filter(([, ok]) => !ok).map(([ch]) => ch);
      });

      const nuovi = mancanti.filter((c) => !GLIFI_NOTI.includes(c));
      const noti = mancanti.filter((c) => GLIFI_NOTI.includes(c));
      if (nuovi.length > 0) failures += 1;
      console.log(
        `  ${nuovi.length === 0 ? 'ok     ' : 'FALLITO'} ${rotta}` +
          (nuovi.length ? ` — il font display non ha: ${nuovi.map((c) => `"${c}"`).join(' ')}` : '') +
          (noti.length ? ` (gia' noti: ${noti.map((c) => `"${c}"`).join(' ')})` : ''),
      );
    }
    await pagina.close();
  }

  const pad = (v, n) => String(v).padEnd(n);
  console.log(`\n${pad('nodo', 11)}${pad('caso', 30)}${pad('px', 6)}${pad('atteso', 8)}${pad('misurato', 10)}esito`);
  console.log('-'.repeat(73));
  for (const r of results) {
    const delta = Math.abs(r.measured - r.expected);
    const ok = delta <= TOLERANCE;
    if (!ok) failures += 1;
    console.log(
      pad(r.node, 11) + pad(r.label, 30) + pad(r.size, 6) + pad(r.expected, 8) +
        pad(r.measured.toFixed(2), 10) + (ok ? 'ok' : `FALLITO (scarto ${delta.toFixed(2)}px)`),
    );
  }
} finally {
  await browser.close();
  server.stop();
}

if (failures > 0) {
  console.error(`\n${failures} controlli falliti.`);
  process.exit(1);
}
console.log('\nI titoli display hanno le altezze dei text node Figma.');
