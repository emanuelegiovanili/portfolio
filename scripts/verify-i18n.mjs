/**
 * Verifica che il sito sia davvero in due lingue, e non in una travestita.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' NON BASTA GUARDARE
 *
 * Un sito multilingua si rompe in modi che non si vedono aprendo la pagina:
 * l'attributo `lang` resta inglese mentre il testo e' italiano, un `hreflang`
 * punta a se' stesso, il comando della lingua riporta sempre alla home, una
 * stringa resta inglese in fondo a una pagina che nessuno riapre. Niente di
 * tutto questo si nota a occhio, e tutto si misura.
 *
 * Questa sonda legge il **costruito**, non il sorgente: e' quello che arriva
 * al browser. Non apre un browser perche' non serve — qui non si misurano
 * pixel, si leggono attributi e testi.
 * ---------------------------------------------------------------------------
 *
 * Cinque sezioni:
 *
 * 1. ogni pagina esiste nelle due lingue;
 * 2. `lang` dice la lingua giusta;
 * 3. i due `hreflang` piu' `x-default` ci sono e puntano dove devono;
 * 4. il comando della lingua porta alla **stessa pagina** nell'altra lingua,
 *    non alla home;
 * 5. le pagine italiane dicono italiano, e **non** dicono inglese: e' il
 *    controllo che prende le regressioni vere, quelle in cui una stringa
 *    scordata resta inglese senza che niente si rompa.
 *
 * Uso: node scripts/verify-i18n.mjs   (vuole `dist/`, quindi dopo la build)
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

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

/**
 * Le spie: frasi che devono comparire in una lingua e **mancare** nell'altra.
 *
 * Non sono una a caso per pagina. Ognuna e' presa da un punto diverso della
 * pagina — testa, corpo, fondo — perche' il modo tipico in cui una traduzione
 * si rompe e' a meta': l'inizio tradotto e la coda no.
 */
const SPIE = {
  '/': {
    it: ['Esperienze digitali', 'Cosa c’è dentro?', 'Gente di buon gusto', 'Lavoriamo insieme'],
    en: ['Never tasteless', 'in the mix', 'People with good taste'],
  },
  '/about': {
    it: ['Chi sono', 'Di cosa', 'Il mio segreto', 'Problemi veri'],
    en: ['My secret recipe', 'What I actually do', 'Find real problems'],
  },
  '/works': {
    it: ['Portfolio'],
    en: ['My work'],
  },
  '/contact': {
    it: ['Lavoriamo insieme'],
    en: ['Let’s work together'],
  },
  '/works/seezy': {
    it: ['Chi segnala una situazione pericolosa', 'Altri progetti', 'Continua a leggere', 'Vedi tutti i progetti'],
    en: ['Reporting a dangerous situation', 'Related work', 'Keep reading'],
  },
};

const percorsoFile = (rotta, locale) => {
  const base = locale === 'it' ? `/it${rotta === '/' ? '' : rotta}` : rotta;
  return `${DIST}${base === '' ? '' : base}/index.html`.replace('//index.html', '/index.html');
};

let fallite = 0;
let passate = 0;

function esito(ok, descrizione, dettaglio = '') {
  if (ok) passate += 1;
  else fallite += 1;
  const segno = ok ? 'ok  ' : 'NO  ';
  console.log(`  ${segno}    ${descrizione}${dettaglio ? ` — ${dettaglio}` : ''}`);
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
    // Il blocco del comando porta la classe `menu-lang` e un `hreflang`.
    const comandi = [...html.matchAll(/class="[^"]*menu-lang[^"]*"[^>]*href="([^"]+)"/g)].map(
      (m) => m[1],
    );
    const comandiAlt = [...html.matchAll(/href="([^"]+)"[^>]*class="[^"]*menu-lang[^"]*"/g)].map(
      (m) => m[1],
    );
    const tutti = [...comandi, ...comandiAlt];
    esito(
      tutti.includes(atteso),
      `${locale} · ${rotta} → ${altra}`,
      tutti.length ? tutti.join(' , ') : 'nessun comando trovato',
    );
  }
}

sezione('Le pagine italiane dicono italiano, e non inglese?');
for (const [rotta, spie] of Object.entries(SPIE)) {
  const htmlIt = pagine.get(`it${rotta}`);
  const htmlEn = pagine.get(`en${rotta}`);
  if (!htmlIt || !htmlEn) continue;

  for (const frase of spie.it) {
    esito(htmlIt.includes(frase), `it · ${rotta} · c’è «${frase}»`);
  }
  for (const frase of spie.en) {
    esito(!htmlIt.includes(frase), `it · ${rotta} · non c’è «${frase}»`);
    esito(htmlEn.includes(frase), `en · ${rotta} · c’è «${frase}»`);
  }
}

/*
 * Il registro di quello che resta da tradurre.
 *
 * Non fa fallire niente: e' un elenco, non un errore. Serve perche' una
 * stringa inglese in pagina italiana, dichiarata, e' una cosa diversa da una
 * dimenticata — e la differenza fra le due la fa solo il fatto che qualcuno la
 * conti.
 */
sezione('Cosa resta da tradurre?');
/*
 * Si legge il **sorgente**, non il registro a runtime.
 *
 * Importare `it.ts` da qui vorrebbe dire trasformare TypeScript dentro una
 * sonda che per il resto non ne ha bisogno. Le chiamate a `daTradurre` hanno la
 * chiave scritta come prima cosa, quindi basta leggerle: e' meno elegante e non
 * puo' sbagliarsi su quale modulo e' stato caricato.
 *
 * I progetti senza traduzione li marca `src/lib/progetti.ts` a runtime, quindi
 * li si conta a parte, sul costruito: una pagina italiana che ripete parola per
 * parola il corpo inglese e' un progetto non tradotto.
 */
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
    ? 'Le due lingue stanno in piedi: rotte, lang, hreflang, comando e testi.'
    : 'Il multilingua ha un buco: vedi le righe NO qui sopra.',
);
process.exit(fallite === 0 ? 0 : 1);
