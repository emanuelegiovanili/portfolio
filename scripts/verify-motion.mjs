/**
 * Il movimento fa quello che dice, e sparisce quando deve.
 *
 * Tre cose:
 * 1. con `prefers-reduced-motion: reduce` non viene creato niente: lo scroll e'
 *    quello del browser e le linee sono intere;
 * 2. senza quella preferenza lo scroll e' morbido e le linee partono corte;
 * 3. una linea raggiunta dallo scroll arriva a lunghezza piena e ci resta.
 *
 * Il terzo punto e' quello che conta: un'animazione che non si completa lascia
 * un bordo a meta' su una griglia a vista, e si vede da tre metri.
 *
 * Si guarda la griglia di **pagina**. Il megamenu ha la sua timeline, legata
 * all'apertura e non allo scroll: a menu chiuso i suoi fili sono a zero per
 * costruzione, ed e' giusto cosi'.
 */

/**
 * La griglia di pagina: quella che scorre col contenuto.
 *
 * Era `.grid:not(.megamenu__grid)`, cioe' "tutte tranne quella". Ha retto
 * finche' le griglie erano due, e si e' rotta appena ne e' arrivata una terza —
 * la barra fissa (NOTES.md D123): il selettore ne prendeva due, e sui blocchi
 * della barra le quattro variabili dei fili sono **vuote**, perche' nessuno
 * gliele scrive e vale il fallback `100%` del CSS. La sonda leggeva stringa
 * vuota e riportava `NaN%`, cioe' un difetto che non c'era.
 *
 * Definirla per dov'e' invece che per dove non e' toglie il problema alla
 * radice: la griglia di pagina e' quella dentro `#smooth-content`, e restera'
 * quella anche quando le griglie saranno quattro.
 */
const PAGE_GRID = '#smooth-content .grid';

import { chromium } from 'playwright';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

const ROUTE = process.argv[2] ?? '/';

const server = await startDevServer({ probePath: ROUTE });
const browser = await chromium.launch({ executablePath: CHROMIUM });
let failures = 0;

const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'ok     ' : 'FALLITO'} ${label}${detail ? ` — ${detail}` : ''}`);
};

async function open(reducedMotion) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion,
  });
  const errors = [];
  const page = await context.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(server.base + ROUTE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors };
}

try {
  console.log(`\nMovimento su ${ROUTE}\n`);

  console.log('prefers-reduced-motion: reduce');
  {
    const { context, page, errors } = await open('reduce');
    const state = await page.evaluate((grid) => {
      const line = document.querySelector(`${grid} .grid-line--h`);
      const block = document.querySelector(`${grid} .block[data-surface="line"]`);
      return {
        transform: line ? getComputedStyle(line).transform : null,
        rules: block
          ? ['--rule-t', '--rule-r', '--rule-b', '--rule-l'].map((n) =>
              getComputedStyle(block).getPropertyValue(n).trim(),
            )
          : null,
        wrapperPosition: getComputedStyle(document.getElementById('smooth-wrapper')).position,
      };
    }, PAGE_GRID);
    check('le linee sono intere', state.transform === 'none' || state.transform === 'matrix(1, 0, 0, 1, 0, 0)', state.transform ?? '');
    /*
     * Sotto reduced motion nessuno scrive le quattro variabili, quindi vale il
     * fallback del CSS, che e' il filo intero. Il controllo e' che siano
     * **vuote**: una dichiarazione qui vorrebbe dire che qualcuno ha toccato i
     * fili quando non doveva.
     */
    check(
      'nessuno ha toccato i fili: vale il fallback, cioe\' il filo intero',
      state.rules?.every((v) => v === '') === true,
      (state.rules ?? []).map((v) => v || '(vuota)').join(' '),
    );
    check('nessun wrapper fisso: lo scroll e\' del browser', state.wrapperPosition !== 'fixed', state.wrapperPosition);
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');
    await context.close();
  }

  console.log('\nsenza preferenza');
  {
    const { context, page, errors } = await open('no-preference');
    const before = await page.evaluate((grid) => {
      const lines = [...document.querySelectorAll(`${grid} .grid-line--h`)].filter((l) => l.offsetHeight > 0);
      const last = lines[lines.length - 1];
      const rect = last.getBoundingClientRect();
      return {
        smootherActive: getComputedStyle(document.getElementById('smooth-wrapper')).position === 'fixed',
        lastWidth: rect.width,
        lastTop: rect.top,
        count: lines.length,
      };
    }, PAGE_GRID);
    check('ScrollSmoother attivo', before.smootherActive);
    check(
      'l\'ultima linea parte corta',
      before.lastWidth < 1,
      `larga ${before.lastWidth.toFixed(1)}px, ${before.count} linee`,
    );

    // Si scende in fondo e si aspetta che l'inerzia si esaurisca.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2500);

    const after = await page.evaluate((sel) => {
      const lines = [...document.querySelectorAll(`${sel} .grid-line--h`)].filter((l) => l.offsetHeight > 0);
      const widths = lines.map((l) => l.getBoundingClientRect().width);
      const grid = document.querySelector(sel);
      const full = grid.getBoundingClientRect().width;
      const blocks = [...document.querySelectorAll(`${sel} .block[data-surface="line"]`)];
      // Tutti e quattro i lati: il filo gira, e un giro che si ferma a tre quarti
      // lascia un lato scoperto proprio dove l'occhio lo cerca.
      const rules = blocks.flatMap((b) => {
        const cs = getComputedStyle(b);
        return ['--rule-t', '--rule-r', '--rule-b', '--rule-l'].map((n) =>
          Number.parseFloat(cs.getPropertyValue(n)),
        );
      });
      const verticals = [...document.querySelectorAll(`${sel} .grid-line--v`)].filter((l) => l.offsetWidth > 0);
      const vScale = verticals.map((v) => v.getBoundingClientRect().height / v.offsetHeight);
      return {
        shortest: Math.min(...widths) / full,
        minRule: Math.min(...rules),
        minVertical: Math.min(...vScale),
      };
    }, PAGE_GRID);
    check(
      'tutte le orizzontali sono arrivate a fondo corsa',
      after.shortest > 0.99,
      `la piu' corta e' al ${(after.shortest * 100).toFixed(1)}%`,
    );
    check(
      'tutti i fili dei blocchi hanno chiuso il giro',
      after.minRule > 99,
      `il lato piu' corto e' al ${after.minRule.toFixed(1)}%`,
    );
    check(
      'le verticali arrivano in fondo alla pagina',
      after.minVertical > 0.99,
      `la piu' corta e' al ${(after.minVertical * 100).toFixed(1)}%`,
    );
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');

    /*
     * Cio' che e' `hidden` non deve occupare spazio.
     *
     * Sembra ovvio e non lo e': `[hidden]` dell'UA ha la specificita' di una
     * classe, e una regola d'autore con `display` lo scavalca in silenzio. Le
     * slide del carosello erano tutte visibili, sovrapposte, e si vedeva
     * l'ultima del markup.
     */
    const nascosti = await page.evaluate(() =>
      [...document.querySelectorAll('[hidden]')]
        .filter((el) => getComputedStyle(el).display !== 'none')
        .map((el) => el.className || el.tagName.toLowerCase()),
    );
    check('gli elementi nascosti non si vedono', nascosti.length === 0, nascosti.slice(0, 3).join(', '));

    await context.close();
  }

  /*
   * Il carosello, andata e ritorno.
   *
   * Il difetto che si sta misurando: tornando indietro si vedevano i campi
   * della slide **gia' su**, poi l'azzeramento, poi l'animazione. Succedeva
   * perche' la slide che usciva restava a fine corsa, e chi la rivedeva la
   * trovava cosi' per il fotogramma prima che GSAP rendesse.
   *
   * Non si guarda l'animazione: si guarda lo **stato a riposo** di una slide
   * nascosta. Se e' giusto quello, non c'e' nessun fotogramma da cui possa
   * uscire l'errore.
   */
  console.log('\nIl carosello: una slide nascosta ha i campi giu\'?');
  {
    const { context, page, errors } = await open('no-preference');
    const meta = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-slide]')].map((slide) => ({
          nascosta: slide.hasAttribute('hidden'),
          // La percentuale di traslazione dei riquadri: 0 vuol dire su, al loro
          // posto; 100 vuol dire giu', sotto la maschera.
          giu: [...(slide.querySelector('.works-card__tags')?.children ?? [])].every((box) => {
            const m = new DOMMatrixReadOnly(getComputedStyle(box).transform);
            return m.f >= box.getBoundingClientRect().height - 1;
          }),
        })),
      );

    await page.locator('[data-carousel-next]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    await page.click('[data-carousel-next]');
    await page.waitForTimeout(1600);
    const dopoAvanti = await meta();
    check(
      'dopo "avanti", le slide nascoste hanno i campi giu\'',
      dopoAvanti.filter((s) => s.nascosta).every((s) => s.giu),
      dopoAvanti.map((s) => `${s.nascosta ? 'nascosta' : 'attiva'}:${s.giu ? 'giu' : 'su'}`).join(' '),
    );

    await page.click('[data-carousel-prev]');
    await page.waitForTimeout(1600);
    const dopoIndietro = await meta();
    check(
      'dopo "indietro", le slide nascoste hanno i campi giu\'',
      dopoIndietro.filter((s) => s.nascosta).every((s) => s.giu),
      dopoIndietro.map((s) => `${s.nascosta ? 'nascosta' : 'attiva'}:${s.giu ? 'giu' : 'su'}`).join(' '),
    );
    check(
      'e la slide tornata attiva ha i campi su',
      dopoIndietro.filter((s) => !s.nascosta).every((s) => !s.giu),
      '',
    );
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');
    await context.close();
  }

  /*
   * I testimonial girano da soli, e la barra dice a che punto sono.
   *
   * Dieci secondi a scheda sono troppi da aspettare in una verifica, e non c'e'
   * bisogno: quello che conta e' che la barra della scheda corrente **cresca**
   * e che le altre restino a zero. Se cresce, arriva in fondo, e in fondo c'e'
   * il passaggio alla scheda dopo.
   */
  /*
   * L'ancora interna porta dove dice, e lascia la pagina in ordine.
   *
   * Il difetto misurato: con lo scroll morbido attivo, il salto nativo portava
   * la sezione in vista scrollando `#smooth-wrapper`, che e' fisso, invece
   * della pagina. A schermo sembrava funzionare, ma `window.scrollY` restava
   * **0**: la pagina si credeva in cima, le finestre d'ingresso dei blocchi
   * scavalcati non si aprivano, e quei blocchi restavano senza fili.
   *
   * Si guardano quindi tre cose, non una. Che la sezione sia in vista e' la
   * piu' debole delle tre, ed e' l'unica che passava anche quando era rotto.
   */
  console.log('\nL\'ancora interna: dove porta, e come lascia la pagina?');
  {
    const { context, page, errors } = await open('no-preference');

    const bersaglio = await page.evaluate(() => {
      const el = document.getElementById('about');
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
    });

    await page.click('a[href="#about"]');
    await page.waitForTimeout(2500);

    const stato = await page.evaluate(() => ({
      scroll: Math.round(window.scrollY),
      top: Math.round(document.getElementById('about').getBoundingClientRect().top),
      wrapper: Math.round(document.getElementById('smooth-wrapper')?.scrollTop ?? 0),
      fuoco: document.activeElement?.id ?? '',
      hash: location.hash,
    }));

    check('la sezione arriva in cima alla finestra', Math.abs(stato.top) <= 2, `${stato.top}px dal bordo`);
    check(
      'a scrollare e\' stata la pagina, non il wrapper fisso',
      Math.abs(stato.scroll - bersaglio) <= 2 && stato.wrapper === 0,
      `scroll ${stato.scroll} invece di ${bersaglio}, wrapper ${stato.wrapper}`,
    );
    check('il fuoco segue, come farebbe l\'ancora nativa', stato.fuoco === 'about', `e\' su "${stato.fuoco}"`);
    check('l\'indirizzo porta l\'ancora', stato.hash === '#about', stato.hash);
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');
    await context.close();
  }

  console.log('\nI testimonial: la barra si riempie?');
  {
    const { context, page, errors } = await open('no-preference');
    await page.locator('[data-testimonial]').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const barre = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-testimonial]')].map((tab) => ({
          attiva: tab.getAttribute('aria-selected') === 'true',
          // `a` della matrice e' la scala orizzontale, cioe' l'avanzamento.
          x: new DOMMatrixReadOnly(
            getComputedStyle(tab.querySelector('.testimonial-tab__progress')).transform,
          ).a,
        })),
      );

    const prima = await barre();
    await page.waitForTimeout(2500);
    const dopo = await barre();

    /*
     * Non un numero fisso: quante schede ci siano lo decide la lista dei
     * testimonial, e la sonda contava quattro perche' quattro ce n'erano il
     * giorno che e' stata scritta. La domanda vera e' un'altra — ne bastano due
     * perche' ci sia una rotazione, e ognuna deve avere un testo da mostrare,
     * altrimenti la barra corre per dieci secondi su un pannello vuoto.
     */
    const tutteConTesto = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testimonial]')].every(
        (tab) => !tab.disabled && (tab.dataset.quote ?? '').trim() !== '',
      ),
    );
    check(
      'le schede sono almeno due, tutte con un testo e selezionabili',
      prima.length >= 2 && tutteConTesto,
      `ne vedo ${prima.length}${tutteConTesto ? '' : ', e almeno una e\' vuota o disabilitata'}`,
    );
    check(
      'la barra della scheda corrente cresce',
      dopo.find((t) => t.attiva).x > prima.find((t) => t.attiva).x + 0.1,
      `da ${prima.find((t) => t.attiva).x.toFixed(2)} a ${dopo.find((t) => t.attiva).x.toFixed(2)}`,
    );
    check(
      'le altre restano a zero',
      dopo.filter((t) => !t.attiva).every((t) => t.x < 0.01),
      dopo.map((t) => t.x.toFixed(2)).join(' '),
    );

    /*
     * E il comando manuale porta alla scheda dopo.
     *
     * La freccia va portata in vista **a mano** prima di premerla: sta cinque
     * celle sotto la riga delle schede, cioe' fuori da una finestra da 900.
     * Ne' `scrollIntoViewIfNeeded` di Playwright ne' lo scroll automatico del
     * click ci arrivano, perche' qui lo scroll lo fa ScrollSmoother e la
     * posizione che il browser crede di avere non e' quella dipinta: il click
     * partiva, atterrava sul vuoto, e il gestore non si accorgeva di niente.
     *
     * Non e' un difetto del sito — con il mouse quella freccia si preme — ma la
     * distinzione si poteva fare solo guardando: il rettangolo e' fuori dalla
     * finestra, e un click a vuoto e un gestore rotto danno lo stesso esito.
     * Da qui il controllo in piu' sulla raggiungibilita': se un giorno fallisse
     * quello, si sa subito da che parte guardare.
     */
    await page.evaluate(() =>
      document.querySelector('[data-testimonial-next]').scrollIntoView({ block: 'center' }),
    );
    // ScrollSmoother insegue la posizione richiesta: si aspetta che arrivi.
    await page.waitForTimeout(1500);
    const inVista = await page.evaluate(() => {
      const r = document.querySelector('[data-testimonial-next]').getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    });
    check('la freccia e\' raggiungibile dal puntatore', inVista, 'resta fuori dalla finestra');

    await page.click('[data-testimonial-next]');
    await page.waitForTimeout(900);
    const dopoFreccia = await barre();
    check(
      'la freccia porta alla scheda successiva',
      dopoFreccia.findIndex((t) => t.attiva) === 1,
      `attiva la ${dopoFreccia.findIndex((t) => t.attiva) + 1}a`,
    );
    check('nessun errore in console', errors.length === 0, errors[0] ?? '');
    await context.close();
  }
} finally {
  await browser.close();
  server.stop();
}

if (failures > 0) {
  console.error(`\n${failures} controlli falliti.`);
  process.exit(1);
}
console.log('\nIl movimento si completa e sparisce quando deve.');
