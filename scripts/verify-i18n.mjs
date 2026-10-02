/**
 * Verifica che il sito sia davvero in due lingue, e non in una travestita.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' NON BASTA GUARDARE
 *
 * Un sito multilingua si rompe in modi che non si vedono aprendo la pagina:
 * l'attributo `lang` resta inglese mentre il testo e' italiano, un `hreflang`
 * punta a se' stesso, il comando della lingua riporta sempre alla home, una
 * stringa resta inglese in fondo a una pagina che nessuno riapre.
 *
 * Questa sonda legge il **costruito**, non il sorgente: e' quello che arriva al
 * browser. Non apre un browser perche' non serve — qui non si misurano pixel,
 * si leggono attributi e testi.
 * ---------------------------------------------------------------------------
 *
 * COME QUESTA SONDA HA GIA' FALLITO UNA VOLTA
 *
 * La prima versione controllava **spie scelte a mano**: una frase per pagina,
 * che doveva esserci in italiano e mancare in inglese. Passava 99 controlli
 * mentre /it/about e /it/works servivano form e CTA **tutti in inglese**, e
 * "Add some details" era inglese su ogni pagina, contatti compresi. Li ha
 * trovati il committente, a occhio, dopo che io avevo dichiarato il lavoro
 * verde.
 *
 * Nessuna spia li nominava, ed e' il punto: una sonda a elenco trova solo cio'
 * che a chi la scrive e' venuto in mente di elencare, e quello che dimentica
 * **lo dichiara verde**. Una verifica che da' falsa sicurezza e' peggio che non
 * averla, perche' smette di far guardare.
 *
 * Adesso non si elenca piu' niente: si legge il dizionario intero.
 *
 * Uso: node scripts/verify-i18n.mjs   (vuole `dist/`, quindi dopo la build)
 */

import { readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { build } from 'esbuild';

const DIST = 'dist';

/** Le rotte, nella forma inglese. */
const ROTTE = [
  '/',
  '/about',
  '/works',
  '/contact',
  '/works/seezy',
  '/works/tama-caffe',
  '/works/noranutrizione',
];

const percorsoFile = (rotta, locale) => {
  const base = locale === 'it' ? `/it${rotta === '/' ? '' : rotta}` : rotta;
  return `${DIST}${base === '' ? '' : base}/index.html`.replace('//index.html', '/index.html');
};

let fallite = 0;
let passate = 0;

function esito(ok, descrizione, dettaglio = '') {
  if (ok) passate += 1;
  else fallite += 1;
  console.log(`  ${ok ? 'ok  ' : 'NO  '}    ${descrizione}${dettaglio ? ` — ${dettaglio}` : ''}`);
}

function sezione(titolo) {
  console.log(`\n${titolo}\n`);
}

const pagine = new Map();

sezione('Ogni pagina esiste nelle due lingue?');
for (const rotta of ROTTE) {
  for (const locale of ['en', 'it']) {
    const file = percorsoFile(rotta, locale);
    const c0 = existsSync(file);
    esito(c0, `${locale} · ${rotta}`, c0 ? '' : `manca ${file}`);
    if (c0) pagine.set(`${locale}${rotta}`, await readFile(file, 'utf8'));
  }
}

sezione('L’attributo lang dice la lingua giusta?');
for (const rotta of ROTTE) {
  for (const locale of ['en', 'it']) {
    const html = pagine.get(`${locale}${rotta}`);
    if (!html) continue;
    const trovato = html.match(/<html[^>]*\slang="([^"]+)"/)?.[1];
    esito(trovato === locale, `${locale} · ${rotta}`, `lang="${trovato ?? 'assente'}"`);
  }
}

sezione('I due hreflang, e x-default sull’inglese?');
for (const rotta of ROTTE) {
  const html = pagine.get(`en${rotta}`);
  if (!html) continue;
  const itAtteso = rotta === '/' ? '/it' : `/it${rotta}`;
  const alt = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => [m[1], m[2]],
  );
  const mappa = Object.fromEntries(alt);
  esito(mappa.en === rotta, `${rotta} · hreflang en`, `→ ${mappa.en ?? 'assente'}`);
  esito(mappa.it === itAtteso, `${rotta} · hreflang it`, `→ ${mappa.it ?? 'assente'}`);
  esito(mappa['x-default'] === rotta, `${rotta} · x-default`, `→ ${mappa['x-default'] ?? 'assente'}`);
}

sezione('Il comando della lingua porta alla stessa pagina, non alla home?');
for (const rotta of ROTTE) {
  for (const locale of ['en', 'it']) {
    const html = pagine.get(`${locale}${rotta}`);
    if (!html) continue;
    const altra = locale === 'en' ? 'it' : 'en';
    const atteso = altra === 'it' ? (rotta === '/' ? '/it' : `/it${rotta}`) : rotta;
    const comandi = [
      ...[...html.matchAll(/class="[^"]*menu-lang[^"]*"[^>]*href="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/href="([^"]+)"[^>]*class="[^"]*menu-lang[^"]*"/g)].map((m) => m[1]),
    ];
    esito(
      comandi.includes(atteso),
      `${locale} · ${rotta} → ${altra}`,
      comandi.length ? comandi.join(' , ') : 'nessun comando trovato',
    );
  }
}

/*
 * ---------------------------------------------------------------------------
 * IL CONTROLLO CHE CONTA
 *
 * Si legge il **dizionario intero**, si prendono tutte le stringhe in cui
 * inglese e italiano differiscono, e per ognuna si pretende che
 *
 *   - il valore inglese **non compaia** in nessuna pagina italiana;
 *   - il valore italiano compaia in **almeno una** pagina italiana.
 *
 * Il secondo prende un caso che il primo non vede: una chiave tradotta nel
 * dizionario e poi mai usata in pagina. E' esattamente com'era `form.dettagli`
 * — tradotta, e intanto il markup aveva "Add some details" scritto a mano.
 *
 * Il pagliaio non e' l'HTML grezzo: li' dentro ci sono classi, percorsi e nomi
 * di file che darebbero falsi allarmi. E' il **testo visibile** piu' il
 * contenuto degli attributi che portano copy. Un segnaposto inglese in una
 * pagina italiana e' un difetto quanto un titolo, ed e' proprio uno di quelli
 * sfuggiti la prima volta.
 * ---------------------------------------------------------------------------
 */

/** I dizionari TypeScript, resi importabili da Node. */
async function leggiDizionari() {
  const tmp = '.verify/dizionari.mjs';
  await build({
    entryPoints: ['src/i18n/dizionario.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: tmp,
    logLevel: 'silent',
  });
  const mod = await import(`../${tmp}?t=${Date.now()}`);
  const d = { en: mod.dizionario('en'), it: mod.dizionario('it') };
  await rm(tmp, { force: true });
  return d;
}

/** Tutte le foglie di stringa del dizionario, col loro percorso puntato. */
function foglie(oggetto, prefisso = '') {
  const out = [];
  for (const [k, v] of Object.entries(oggetto)) {
    const chiave = prefisso ? `${prefisso}.${k}` : k;
    if (typeof v === 'string') out.push([chiave, v]);
    else if (v && typeof v === 'object') out.push(...foglie(v, chiave));
  }
  return out;
}

/**
 * Il testo che una persona legge, piu' la copy che vive negli attributi.
 *
 * Script e stili escono: dentro ci sono stringhe del codice che non sono cio'
 * che si vede. Fra un nodo e l'altro va un separatore, o due testi adiacenti si
 * saldano in una frase che in pagina non esiste.
 */
function copyVisibile(html) {
  const senzaCodice = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const attributi = [
    ...senzaCodice.matchAll(/(?:aria-label|alt|placeholder|title|content)="([^"]*)"/gi),
  ]
    .map((m) => m[1])
    .join(' \u0001 ');
  const testo = senzaCodice.replace(/<[^>]+>/g, ' \u0001 ');
  /*
   * Le entita' si sciolgono **tutte**, anche quelle numeriche.
   *
   * Astro scrive `&` come `&#38;`, non come `&amp;`: la prima versione
   * decodificava solo quelle con il nome e la descrizione italiana della home
   * risultava "mai in pagina" mentre era li'. Un falso allarme in una sonda
   * costa quanto un difetto taciuto: insegna a non fidarsi delle righe NO.
   */
  return `${testo} \u0001 ${attributi}`
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

const dizionari = await leggiDizionari();
const fogliaEn = Object.fromEntries(foglie(dizionari.en));
const fogliaIt = Object.fromEntries(foglie(dizionari.it));

/*
 * Le stringhe uguali nelle due lingue non dicono niente: "Branding", "Home",
 * "LinkedIn", "Baking Ideas" stanno in italiano perche' cosi' vuole il file.
 * Sotto i quattro caratteri si rischiano coincidenze, non difetti.
 */
const diverse = Object.keys(fogliaEn).filter(
  (k) => fogliaIt[k] !== undefined && fogliaEn[k] !== fogliaIt[k] && fogliaEn[k].length >= 4,
);

/**
 * La frase c'e' **come frase**, non come pezzo di una parola piu' lunga.
 *
 * "Product Design" sta dentro "Product Designer", che in italiano compare nella
 * descrizione della home: senza questo controllo la sonda segnalava una perdita
 * che non c'era. Si guarda il carattere prima e quello dopo: se sono lettere,
 * la corrispondenza e' dentro una parola e non vale.
 */
function contieneFrase(testo, frase) {
  /*
   * Le frasi con un segnaposto si cercano **a pezzi**.
   *
   * "Visita {nome}, si apre in una nuova scheda" in pagina diventa "Visita
   * Seezy, si apre...": la stringa letterale non c'e' mai, e saltarla
   * vorrebbe dire smettere di controllarla. Si pretende invece che ci siano
   * tutti i pezzi fra un segnaposto e l'altro, che e' quello che si puo'
   * davvero verificare.
   */
  if (frase.includes('{')) {
    return frase
      .split(/\{[^}]*\}/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 4)
      .every((p) => contieneFrase(testo, p));
  }
  /*
   * Il confine si pretende **solo dove la frase e' fatta di lettere**.
   *
   * Serve a non far combaciare "Product Design" dentro "Product Designer". Ma
   * se la frase comincia o finisce con punteggiatura — ", si apre in una nuova
   * scheda" — allora li' un confine non esiste e pretenderlo scarta una
   * corrispondenza buona: in pagina quella frase segue "caffe'", e la "e'" e'
   * una lettera. Costato un giro.
   */
  const lettera = /\p{L}/u;
  const confineInizio = lettera.test(frase[0] ?? '');
  const confineFine = lettera.test(frase.at(-1) ?? '');
  let i = testo.indexOf(frase);
  while (i !== -1) {
    const prima = testo[i - 1];
    const dopo = testo[i + frase.length];
    const okPrima = !confineInizio || !(prima && lettera.test(prima));
    const okDopo = !confineFine || !(dopo && lettera.test(dopo));
    if (okPrima && okDopo) return true;
    i = testo.indexOf(frase, i + 1);
  }
  return false;
}

const copyIt = new Map();
for (const rotta of ROTTE) {
  const html = pagine.get(`it${rotta}`);
  if (html) copyIt.set(rotta, copyVisibile(html));
}

sezione(`Nessuna stringa inglese sopravvive in una pagina italiana? (${diverse.length} stringhe)`);
for (const chiave of diverse) {
  const inglese = fogliaEn[chiave];
  const dove = [...copyIt].filter(([, t]) => contieneFrase(t, inglese)).map(([r]) => r);
  esito(dove.length === 0, `${chiave} · «${inglese.slice(0, 40)}»`, dove.join(', '));
}

sezione('Ogni stringa italiana arriva davvero in pagina?');
for (const chiave of diverse) {
  const italiano = fogliaIt[chiave];
  const usata = [...copyIt].some(([, t]) => contieneFrase(t, italiano));
  esito(usata, `${chiave} · «${italiano.slice(0, 40)}»`, usata ? '' : 'tradotta ma mai in pagina');
}

/*
 * Il registro di quello che resta da tradurre.
 *
 * Non fa fallire niente: e' un elenco, non un errore. Una stringa inglese in
 * pagina italiana **dichiarata** e' una cosa diversa da una dimenticata, e la
 * differenza fra le due la fa solo il fatto che qualcuno la conti.
 */
sezione('Cosa resta da tradurre?');
const sorgenteIt = await readFile('src/i18n/it.ts', 'utf8');
const chiavi = [...sorgenteIt.matchAll(/daTradurre\(\s*'([^']+)'/g)].map((m) => m[1]);

const progettiNonTradotti = [];
for (const rotta of ROTTE.filter((r) => r.startsWith('/works/'))) {
  const it = pagine.get(`it${rotta}`);
  const en = pagine.get(`en${rotta}`);
  if (!it || !en) continue;
  const corpo = (html) => html.match(/<div class="work-body__text">([\s\S]*?)<\/div>/)?.[1] ?? '';
  if (corpo(it) && corpo(it) === corpo(en)) progettiNonTradotti.push(rotta);
}

const elenco = [...chiavi, ...progettiNonTradotti.map((r) => `progetto${r}`)].sort();
if (elenco.length === 0) console.log('  niente: tutte le stringhe hanno una versione italiana.');
else for (const chiave of elenco) console.log(`  da tradurre    ${chiave}`);

console.log(
  `\n${passate + fallite} controlli · ${fallite === 0 ? 'tutti passati' : `${fallite} falliti`}`,
);
console.log(
  fallite === 0
    ? 'Le due lingue stanno in piedi: rotte, lang, hreflang, comando e ogni stringa del dizionario.'
    : 'Il multilingua ha un buco: vedi le righe NO qui sopra.',
);
process.exit(fallite === 0 ? 0 : 1);
