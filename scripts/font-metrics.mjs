// Calcola gli override per i @font-face di fallback a partire dai woff2 reali.
//
// Perche' serve: quando il font definitivo non e' pronto, il fallback ha glifi di
// dimensione diversa e il layout cambia. size-adjust serve a farli combaciare.
//
// Ma "combaciare" vuol dire due cose diverse a seconda del ruolo del font, e non
// si possono avere entrambe:
//
//   --match width  (default, per il testo di lettura)
//     Pareggia la larghezza media dei glifi, quindi il punto di a capo, quindi il
//     numero di righe, quindi l'altezza del blocco di testo.
//
//   --match cap    (per i display sotto text-box-trim)
//     Pareggia la cap-height, quindi l'altezza della scatola del titolo.
//     Con `text-box-edge: cap alphabetic` la scatola vale cap-height x font-size, e
//     nessun override CSS agisce sulla cap-height: la puo' spostare solo size-adjust.
//     Su Getai la differenza non e' teorica: pareggiando la larghezza, la scatola di
//     un titolo da 64px passerebbe da 47px a 64px, e il titolo sfonderebbe la propria
//     cella. Pareggiando la cap-height cambia invece dove va a capo, che su titoli
//     brevi si nota molto meno.
//
// Uso: node scripts/font-metrics.mjs [--match cap|width] [...file.woff2]
// Stampa il blocco CSS da incollare in src/styles/type.css.

import * as fontkit from 'fontkit';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

// Metriche dei font di sistema usati come fallback, in unita' per em.
const FALLBACKS = {
  'Arial': { unitsPerEm: 2048, ascent: 1854, descent: -434, lineGap: 67, avgWidth: 913, capHeight: 1467 },
};

/** Larghezza media dei glifi latini minuscoli, la grandezza che governa il punto di a capo. */
function avgLowercaseWidth(font) {
  const sample = 'abcdefghijklmnopqrstuvwxyz ';
  let total = 0, n = 0;
  for (const ch of sample) {
    const [glyph] = font.layout(ch).glyphs;
    if (!glyph) continue;
    total += glyph.advanceWidth;
    n += 1;
  }
  return n ? total / n : font.unitsPerEm / 2;
}

const argv = process.argv.slice(2);
const matchIndex = argv.indexOf('--match');
const match = matchIndex >= 0 ? argv[matchIndex + 1] : 'width';
if (!['cap', 'width'].includes(match)) {
  console.error(`--match accetta "cap" o "width", non "${match}"`);
  process.exit(1);
}
const files = argv.filter((a, i) => a !== '--match' && i !== matchIndex + 1);
if (files.length === 0) {
  console.error('uso: node scripts/font-metrics.mjs [--match cap|width] public/fonts/*.woff2');
  process.exit(1);
}

const lines = [];
for (const file of files) {
  const font = fontkit.create(readFileSync(file));
  const upm = font.unitsPerEm;
  const fb = FALLBACKS['Arial'];

  const own = match === 'cap' ? font.capHeight / upm : avgLowercaseWidth(font) / upm;
  const theirs = match === 'cap' ? fb.capHeight / fb.unitsPerEm : fb.avgWidth / fb.unitsPerEm;
  const sizeAdjust = (own / theirs) * 100;

  // Gli override si esprimono in frazione dell'em del font *reale*, riscalata
  // da size-adjust, cosi' la scatola di riga del fallback coincide con la sua.
  const k = 100 / sizeAdjust;
  lines.push({
    file: basename(file),
    family: font.familyName,
    sizeAdjust,
    ascent: (font.ascent / upm) * 100 * k,
    descent: (Math.abs(font.descent) / upm) * 100 * k,
    lineGap: (font.lineGap / upm) * 100 * k,
  });
}

const pct = (n) => `${n.toFixed(2)}%`;
for (const m of lines) {
  console.log(`/* ${m.file} — ${m.family} — pareggiata la ${match === 'cap' ? 'cap-height' : 'larghezza media'} */`);
  console.log(`@font-face {`);
  console.log(`  font-family: '${m.family} Fallback';`);
  console.log(`  src: local('Arial');`);
  console.log(`  size-adjust: ${pct(m.sizeAdjust)};`);
  console.log(`  ascent-override: ${pct(m.ascent)};`);
  console.log(`  descent-override: ${pct(m.descent)};`);
  console.log(`  line-gap-override: ${pct(m.lineGap)};`);
  console.log(`}`);
}
