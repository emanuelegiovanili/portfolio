// Calcola gli override per i @font-face di fallback a partire dai woff2 reali.
//
// Perche' serve: durante il caricamento del font il fallback ha glifi di larghezza
// diversa, il testo va a capo in un punto diverso, i blocchi cambiano altezza e la
// griglia sembra rotta per mezzo secondo. Con size-adjust il fallback occupa la
// stessa larghezza del font definitivo e il salto sparisce.
//
// Uso: node scripts/font-metrics.mjs [...file.woff2]
// Stampa il blocco CSS da incollare in src/styles/type.css.

import * as fontkit from 'fontkit';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

// Metriche dei font di sistema usati come fallback, in unita' per em.
const FALLBACKS = {
  'Arial': { unitsPerEm: 2048, ascent: 1854, descent: -434, lineGap: 67, avgWidth: 913 },
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

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('uso: node scripts/font-metrics.mjs public/fonts/*.woff2');
  process.exit(1);
}

const lines = [];
for (const file of files) {
  const font = fontkit.create(readFileSync(file));
  const upm = font.unitsPerEm;
  const fb = FALLBACKS['Arial'];

  const own = avgLowercaseWidth(font) / upm;
  const theirs = fb.avgWidth / fb.unitsPerEm;
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
  console.log(`/* ${m.file} — ${m.family} */`);
  console.log(`@font-face {`);
  console.log(`  font-family: '${m.family} Fallback';`);
  console.log(`  src: local('Arial');`);
  console.log(`  size-adjust: ${pct(m.sizeAdjust)};`);
  console.log(`  ascent-override: ${pct(m.ascent)};`);
  console.log(`  descent-override: ${pct(m.descent)};`);
  console.log(`  line-gap-override: ${pct(m.lineGap)};`);
  console.log(`}`);
}
