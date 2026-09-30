/**
 * Il sipario fra una pagina e l'altra.
 *
 * Cinque promesse, e quattro si rompono in silenzio.
 *
 * 1. A riposo non c'e'. Un sipario che resta mezzo dentro la finestra si vede
 *    come una banda piatta in fondo alla pagina, e nessun'altra sonda la
 *    guarderebbe: per le altre e' colore di pagina sopra colore di pagina.
 * 2. Copre prima di lasciare la pagina. Se coprisse dopo, il lampo bianco del
 *    caricamento resterebbe li' dov'era e il sipario non servirebbe a niente.
 * 3. Si alza da solo anche **senza JavaScript**. E' il rischio vero di questo
 *    meccanismo: un modulo che non arriva lascia una schermata piena che non
 *    se ne va piu'. Qui si stacca il JavaScript apposta.
 * 4. Non tocca quello che non e' suo: un'ancora interna e un link esterno
 *    devono restare click del browser.
 * 5. Tornando indietro non resta calato. La cache di navigazione restituisce
 *    la pagina **com'era**, cioe' coperta.
 *
 * Il colore si campiona: il sipario e' del colore della pagina, quindi "coperto"
 * e "scoperto" si distinguono solo guardando se i pixel scuri — i fili dei
 * blocchi — ci sono o no.
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const PAGINA = [0xf7, 0xf6, 0xf9];
const TOLLERANZA = 6;

let falliti = 0;
function check(nome, esito, nota = '') {
  if (!esito) falliti += 1;
  console.log(`  ${esito ? 'ok     ' : 'FALLITO'} ${nome}${nota ? ` — ${nota}` : ''}`);
}

/** Quanti pixel scuri ci sono nella finestra: e' il contenuto che si vede. */
async function scuri(page) {
  const { data, info } = await sharp(await page.screenshot()).raw().toBuffer({ resolveWithObject: true });
  let n = 0;
  for (let i = 0; i < info.width * info.height; i += 7) {
    const o = i * info.channels;
    if (data[o] < 180 && data[o + 1] < 180 && data[o + 2] < 180) n += 1;
  }
  return n;
}

/** Tutta la finestra e' del colore della pagina? */
async function piatta(page) {
  const { data, info } = await sharp(await page.screenshot()).raw().toBuffer({ resolveWithObject: true });
  let fuori = 0;
  for (let i = 0; i < info.width * info.height; i += 13) {
    const o = i * info.channels;
    const male = [0, 1, 2].some((c) => Math.abs(data[o + c] - PAGINA[c]) > TOLLERANZA);
    if (male) fuori += 1;
  }
  return fuori;
}

/*
 * `--url` fa girare la sonda sulla build servita da wrangler invece che su
 * `astro dev`. Qui serve piu' che altrove: lo script in `<head>` e' inline e il
 * modulo e' impacchettato, e sono due cose che la build tratta diversamente dal
 * server di sviluppo.
 */
const args = process.argv.slice(2);
const indirizzo = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
const server = indirizzo ? { base: indirizzo, stop: () => {} } : await startDevServer({ probePath: '/' });
const browser = await chromium.launch({ executablePath: CHROMIUM });

try {
  console.log('\nIl sipario: copre quando deve, e non resta calato?\n');

  /* ---------- 1 e 2: a riposo non c'e', e copre prima di andarsene ---------- */
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errori = [];
    page.on('pageerror', (e) => errori.push(String(e)));

    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);

    const riposo = await page.evaluate(() => {
      const s = document.querySelector('.sipario');
      if (!s) return null;
      const r = s.getBoundingClientRect();
      return { sopra: r.top, attributo: document.documentElement.dataset.sipario ?? null, eventi: getComputedStyle(s).pointerEvents };
    });
    check('il sipario esiste', riposo !== null);
    if (riposo) {
      check(
        'a riposo sta fuori dalla finestra, in basso',
        riposo.sopra >= 899,
        `il suo bordo alto e' a ${Math.round(riposo.sopra)} su una finestra da 900`,
      );
      check('e non intercetta i click', riposo.eventi === 'none', `pointer-events: ${riposo.eventi}`);
      check('e non c\'e\' nessun attributo di stato appeso', riposo.attributo === null, String(riposo.attributo));
    }
    const primaScuri = await scuri(page);
    check('la pagina a riposo si vede', primaScuri > 500, `${primaScuri} campioni scuri`);

    /*
     * La copertura si misura **da dentro la pagina che se ne va**.
     *
     * Dall'esterno non si riesce: fra il click e la navigazione passano quattro
     * decimi di secondo, e una schermata da 1440x900 piu' la sua analisi ne
     * costa quasi uno. La prima stesura di questa sonda fotografava dopo la
     * navigazione e trovava la finestra piatta — ma era la pagina **nuova**,
     * che arriva coperta di suo. Diceva ok sul fotogramma sbagliato.
     *
     * Qui un giro su `requestAnimationFrame` tiene la copertura massima
     * raggiunta, e `pagehide` la deposita in `sessionStorage` un attimo prima
     * che la pagina muoia. Il rettangolo e' quello vero, non uno stato
     * dichiarato dal modulo che stiamo verificando.
     */
    await page.evaluate(() => {
      const tela = document.querySelector('.sipario');
      let coperto = 0;
      let stato = '';
      const giro = () => {
        const r = tela.getBoundingClientRect();
        const quota =
          Math.max(0, Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top)) / window.innerHeight;
        if (quota > coperto) {
          coperto = quota;
          stato = document.documentElement.dataset.sipario ?? '';
        }
        requestAnimationFrame(giro);
      };
      giro();
      window.addEventListener('pagehide', () => {
        try {
          sessionStorage.setItem('prova-sipario', JSON.stringify({ coperto, stato }));
        } catch {
          /* niente */
        }
      });
    });

    await page.locator('a[href="/about"]').first().click({ force: true });
    await page.waitForURL('**/about', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2000);

    const prova = await page.evaluate(() => {
      const grezzo = sessionStorage.getItem('prova-sipario');
      sessionStorage.removeItem('prova-sipario');
      return grezzo ? JSON.parse(grezzo) : null;
    });
    check(
      'al click copre tutta la finestra **prima** di lasciare la pagina',
      prova !== null && prova.coperto >= 0.999,
      prova === null ? 'nessuna misura consegnata' : `copriva il ${(prova.coperto * 100).toFixed(1)}%`,
    );
    check(
      'e mentre copre lo stato dice che sta uscendo',
      prova !== null && prova.stato === 'esce',
      `stato: ${prova?.stato ?? '—'}`,
    );

    check(
      'a pagina nuova caricata il sipario se n\'e\' andato',
      (await page.evaluate(() => document.documentElement.dataset.sipario)) === undefined,
    );
    const dopoScuri = await scuri(page);
    check('e la pagina nuova si vede', dopoScuri > 500, `${dopoScuri} campioni scuri`);
    check('nessun errore in console', errori.length === 0, errori[0] ?? '');
    await context.close();
  }

  /* ---------- 3: senza JavaScript il sipario si alza lo stesso ---------- */
  console.log('\nE se il JavaScript non arriva?\n');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    // Il segnale che lascerebbe la pagina precedente.
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('sipario', '1');
      } catch {
        /* niente */
      }
    });
    // Tutti i moduli via: resta solo lo script in `<head>`, che e' inline.
    // Il glob prende sia i sorgenti di `astro dev` sia i pacchetti della build.
    await page.route(/\.(js|ts|mjs)(\?.*)?$/, (route) => route.abort());

    await page.goto(server.base + '/about', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    check(
      'la pagina arriva coperta, come deve',
      (await page.evaluate(() => document.documentElement.dataset.sipario)) === 'entra',
    );
    await page.waitForTimeout(2200);
    check(
      'e dopo il soccorso si scopre da sola',
      (await page.evaluate(() => document.documentElement.dataset.sipario)) === undefined,
      'senza questo, una schermata piena che non se ne va piu\'',
    );
    const visibili = await scuri(page);
    check('la pagina si vede', visibili > 300, `${visibili} campioni scuri`);
    await context.close();
  }

  /* ---------- 4: non tocca quello che non e' suo ---------- */
  console.log('\nE quello che non e\' suo?\n');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);

    // Un ascoltatore che parla dopo il nostro, e che ferma la navigazione vera.
    await page.evaluate(() => {
      window.__fermato = [];
      document.addEventListener(
        'click',
        (e) => {
          const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
          if (a) window.__fermato.push({ href: a.getAttribute('href'), preso: e.defaultPrevented });
          e.preventDefault();
        },
        false,
      );
    });

    const ancora = await page.locator('a[href^="#"]').first();
    let siparioSuAncora = 'mai provato';
    if ((await ancora.count()) > 0) {
      await ancora.click({ force: true });
      await page.waitForTimeout(400);
      siparioSuAncora = await page.evaluate(() => document.documentElement.dataset.sipario ?? 'nessuno');
    }

    await page.evaluate(() => {
      const a = document.createElement('a');
      a.href = 'https://example.com/qualcosa';
      a.target = '_blank';
      a.textContent = 'fuori';
      a.style.cssText = 'position:fixed;left:2px;top:2px;z-index:9999';
      document.body.append(a);
      a.click();
    });
    await page.waitForTimeout(400);

    const visti = await page.evaluate(() => window.__fermato);
    const interna = visti.find((v) => v.href?.startsWith('#'));
    const esterna = visti.find((v) => v.href?.startsWith('https://example.com'));
    /*
     * Su un'ancora interna `preventDefault` c'e', ed e' giusto che ci sia: non
     * la chiama il sipario, la chiama lo scroll morbido, che porta al bersaglio
     * passando per lo smoother invece di saltarci (vedi `motion.ts`). La
     * domanda da fare e' un'altra — il sipario e' sceso? — e la prima stesura
     * di questa sonda faceva quella sbagliata, dichiarando rotto un pezzo che
     * funzionava.
     */
    check(
      'su un\'ancora interna il sipario non scende',
      interna !== undefined && siparioSuAncora === 'nessuno',
      `ancora vista: ${Boolean(interna)}, sipario: ${siparioSuAncora}`,
    );
    check('un link esterno anche', esterna !== undefined && esterna.preso === false, JSON.stringify(esterna ?? null));
    check(
      'e in nessuno dei due casi il sipario e\' sceso',
      (await page.evaluate(() => document.documentElement.dataset.sipario)) === undefined,
    );
    await context.close();
  }

  /* ---------- 5: tornando indietro non resta calato ---------- */
  console.log('\nE tornando indietro?\n');
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    await page.locator('a[href="/about"]').first().click({ force: true });
    await page.waitForURL('**/about', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2200);
    check(
      'la pagina di prima torna scoperta',
      (await page.evaluate(() => document.documentElement.dataset.sipario)) === undefined,
    );
    const tornata = await scuri(page);
    check('e si vede', tornata > 500, `${tornata} campioni scuri`);
    await context.close();
  }

  /* ---------- Chi chiede meno movimento ---------- */
  console.log('\nE chi chiede meno movimento?\n');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    check(
      'il sipario non e\' nemmeno disegnato',
      (await page.evaluate(() => getComputedStyle(document.querySelector('.sipario')).display)) === 'none',
    );
    await page.locator('a[href="/about"]').first().click({ force: true });
    await page.waitForURL('**/about', { timeout: 10000 });
    check('e il link porta dove deve, subito', page.url().endsWith('/about'), page.url());
    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

if (falliti > 0) {
  console.error(`\n${falliti} controlli falliti.`);
  process.exit(1);
}
console.log('\nIl sipario copre, scopre, e non resta calato.');
