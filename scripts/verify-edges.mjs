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
 *   node scripts/verify-edges.mjs --width 390
 *   node scripts/verify-edges.mjs --senza-clip-margin
 *
 * **La larghezza conta.** Fino alla Fase 7 questo script guardava solo 1440, e
 * quindi diceva qualcosa sui fili di **un tier su tre**. Il committente ha
 * segnalato bordi mancanti a mobile, e non c'era una sola misura di pixel sotto
 * i 1200 a cui chiedere conferma o smentita. Ora `verify:edges` gira a 390, 768
 * e 1440, cioe' una larghezza per tier.
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import { startDevServer, CHROMIUM } from './dev-server.mjs';

/* Il viola dei blocchi accent, che la linea la copre invece di lasciarla
   vedere: e' la regola D2, non un'eccezione di questa sonda. Sta qui e non
   accanto a RULE perche' HOVER lo usa, e HOVER si costruisce prima. */
const VIOLA = [0x60, 0x3c, 0xff];

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
  // Dentro al megamenu: le voci e il bottone di chiusura hanno lo stesso
  // riempimento dei bottoni, su richiesta del committente. `apri` apre il
  // pannello prima di guardarli, e da li' in poi resta aperto.
  //
  // `filo` off-white, e non e' un dettaglio di colore: nel pannello il filo
  // **e' dello stesso colore del riempimento**. Su pagina chiara un bottone
  // riempito di off-white ha bisogno del contorno scuro per non galleggiare;
  // su nero e' il riempimento stesso a fare da bordo, e quello che va
  // verificato e' che il suo margine cada sulla linea, non che ci sia sopra un
  // secondo pixel di un altro colore che non esisterebbe comunque.
  { route: '/', selector: '.menu-voice', nome: 'voce (megamenu)', apri: true, filo: [0xf7, 0xf6, 0xf9] },
  { route: '/', selector: '.menu-social', nome: 'social (megamenu)', apri: true, filo: [0xf7, 0xf6, 0xf9] },
  { route: '/', selector: '.menu-close', nome: 'chiudi (megamenu)', apri: true, filo: [0xf7, 0xf6, 0xf9] },
  /*
   * Le tre superfici entrate dopo, e che senza queste righe sarebbero le uniche
   * senza prova.
   *
   * Il loro strato non ripete le regole di scatola dell'originale, le eredita
   * (`flex-direction: inherit` e compagnia in components.css): e' piu' breve,
   * ma vuol dire che a cambiare padding a `.footer-link` cambia anche il
   * riempimento, e nessuno se ne accorgerebbe leggendo il CSS. E' proprio il
   * caso in cui la misura vale piu' della rilettura.
   *
   * La voce di footer si guarda su /about e non su /: in home la prima
   * `.footer-link` e' "Home", che e' la voce corrente e porta la barra viola
   * sotto: il riempimento la copre, ma un pixel viola sotto a un riempimento
   * viola non prova niente.
   */
  { route: '/', selector: '.skill-card', nome: 'card del mix', scorri: true, eredita: true },
  /*
   * Il nome a fondo pagina confina a destra con il bottone viola del footer,
   * che parte esattamente sul pixel della linea e la copre, come fa ogni blocco
   * accent (NOTES.md D2). Li' il filo non deve esserci, e pretenderlo era un
   * errore della sonda, non del sito: misurato, quel pixel e' viola **anche a
   * riposo**, con il riempimento ancora arrotolato.
   *
   * Si dichiara invece di saltarlo. Il lato destro cosi' non prova granche' —
   * viola su viola — ma gli altri tre provano quello che conta, e una riga che
   * dice perche' vale piu' di un caso tolto in silenzio.
   */
  { route: '/about', selector: '.footer-brand', nome: 'nome a fondo pagina', scorri: true, eredita: true, filo: { destro: VIOLA } },
  { route: '/about', selector: '.footer-link', nome: 'voce di footer', scorri: true, eredita: true },
];

/**
 * Porta il blocco sotto gli occhi, e aspetta che smetta di muoversi.
 *
 * Serve solo ai casi marcati `scorri`. I sei di prima stanno tutti nella prima
 * schermata, e infatti questa sezione non aveva mai navigato ne' scrollato: e'
 * bastato aggiungere una voce di footer perche' lo scatto finisse fuori dalla
 * finestra e la sonda morisse leggendo un pixel che non c'era.
 *
 * L'attesa e' lunga perche' sono due cose in fila: l'inerzia di ScrollSmoother,
 * e il giro dei fili, che si disegnano sullo scroll. Misurare un blocco appena
 * entrato vuol dire misurare un filo a meta'.
 */
async function porta(page, selector) {
  /*
   * Non al centro: a un settimo dall'alto.
   *
   * La finestra d'ingresso di un blocco si chiude quando il suo bordo alto
   * arriva al 25% della schermata (`src/scripts/motion.ts`). Centrandolo lo si
   * lascia al 50%, cioe' **a meta' del giro dei fili**, e la sonda misurava un
   * lato ancora corto scambiandolo per un lato coperto. Sopra il 25% il giro e'
   * finito e il blocco e' fermo.
   */
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.15);
  }, selector);
  await page.waitForTimeout(2600);

  // E si controlla di averlo davvero aspettato, invece di fidarsi del numero.
  const fili = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return ['--rule-t', '--rule-r', '--rule-b', '--rule-l'].map((n) => {
      const v = cs.getPropertyValue(n).trim();
      return v === '' ? 100 : Number.parseFloat(v);
    });
  }, selector);
  if (fili && Math.min(...fili) < 99) {
    throw new Error(
      `${selector}: misurato a giro non finito, fili al ${fili.map((f) => f.toFixed(0)).join('/')}%. ` +
        `La sonda deve aspettare di piu', non il sito disegnare di meno.`,
    );
  }
}

/** Torna in cima: il megamenu si apre da li', e le prove dopo lo danno per fermo. */
async function inCima(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2600);
}

const menuAperto = (page) =>
  page.evaluate(() => document.getElementById('megamenu')?.hasAttribute('data-open') ?? false);

/** Apre il megamenu e aspetta che sia fermo. */
async function apriMenu(page) {
  if (await menuAperto(page)) return;
  await page.click('#menu-toggle');
  await page.waitForTimeout(1400);
}

/**
 * Chiude il megamenu e aspetta che sia sparito.
 *
 * Serve fra un giro di controlli e l'altro: a pannello aperto la hamburger di
 * pagina c'e' ancora e si vede, ma sta **sotto** al pannello, e un `hover` su
 * di lei va in timeout perche' il pannello intercetta il puntatore. E' la
 * stessa cosa che succederebbe a un visitatore, quindi non e' un difetto del
 * sito: e' lo script che deve rimettere la pagina com'era.
 */
async function chiudiMenu(page) {
  if (!(await menuAperto(page))) return;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
}

/**
 * I blocchi bordati che si guardano, uno per forma e per vicinato.
 *
 * `apri` apre il megamenu prima di misurare, e `filo` cambia il colore atteso:
 * dentro al pannello i fili sono off-white, non il grigio dei componenti.
 */
const CASES = [
  { route: '/', selector: '.skill-card', nome: 'skill card (isolata)' },
  { route: '/', selector: '.about-section', nome: 'about (larga)' },
  { route: '/', selector: '.logo', nome: 'logo di testa' },
  { route: '/about', selector: '.prose', nome: 'bio (/about)' },
  { route: '/works', selector: '.works-card', nome: 'card progetto (/works)' },
  { route: '/', selector: '.menu-close', nome: 'chiudi (megamenu)', apri: true, filo: [0xf7, 0xf6, 0xf9] },
  { route: '/', selector: '.menu-voice', nome: 'voce (megamenu)', apri: true, filo: [0xf7, 0xf6, 0xf9] },
  // Il nome di un cliente non e' un blocco: sta dentro al blocco `bare` della
  // riga e il filo se lo disegna da solo. Il committente ne ha notato
  // l'assenza, quindi ora c'e' e va misurato come tutti gli altri.
  { route: '/', selector: '.testimonial-tab', nome: 'nome cliente (testimonial)' },
  // Questi due avevano un `overflow: clip` proprio, come ce l'aveva la card
  // progetto: taglia al padding box e si mangia i quattro fili. Non lo vedeva
  // nessuno perche' nessuna sonda li guardava. Ora li guarda.
  { route: '/about', selector: '.spotify-cover', nome: 'copertina playlist' },
  { route: '/works/seezy', selector: '.media-block', nome: 'media (case study)' },
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

/**
 * Una larghezza per tier.
 *
 * Densita' 1 a tutte e tre: un pixel dell'immagine deve essere un pixel CSS,
 * altrimenti un filo da un pixel ne occupa due o tre e i conti sull'indice
 * della striscia non tornano piu'.
 */
const WIDTHS = value('--width', null) ? [Number(value('--width', null))] : [390, 768, 1440];

/**
 * Finge un browser che non implementa `overflow-clip-margin`.
 *
 * Safari e' quel browser, e per questo su Safari non si vedeva **nessun** bordo
 * su **nessun** blocco: il filo sta un pixel oltre il border box, il ritaglio
 * si misura dal padding box, e senza margine di franchigia il disegno finiva
 * buttato via dopo essere stato calcolato giusto. Tre settimane di ipotesi
 * sbagliate perche' nessuna sonda guardava i pixel di un motore diverso da
 * Chromium, e questo e' il modo piu' vicino che ho per farlo senza avere
 * quel motore.
 *
 * Il ritaglio ora lo fa `clip-path`, che non ha quel buco. Questo interruttore
 * serve a non tornarci mai piu': se qualcuno rimette `overflow: clip` con un
 * margine, qui i fili spariscono e la verifica fallisce.
 */
/**
 * Finestra alta, perche' i blocchi vanno fotografati interi.
 *
 * La copertina di un case study e' alta sei celle, cioe' 720px a 1440: con una
 * finestra da 900 e il blocco che comincia a 240 non ci stava, e la prova
 * veniva saltata invece che fatta. Un blocco saltato in silenzio e' un blocco
 * non verificato.
 */
const HEIGHT = 1200;

const SENZA_CLIP_MARGIN = args.includes('--senza-clip-margin');
// Solo la rassegna: serve a provare che la rassegna stessa veda un difetto,
// senza rifare i cinque minuti dei casi curati.
const SOLO_RASSEGNA = args.includes('--solo-rassegna');
const NEUTRALIZZA = '*, *::before, *::after { overflow-clip-margin: 0px !important; }';

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
  console.log(`\nI fili cadono sulla linea?${SENZA_CLIP_MARGIN ? ' (fingendo un browser senza overflow-clip-margin)' : ''}\n`);

  for (const larghezza of SOLO_RASSEGNA ? [] : WIDTHS)
  for (const { route, selector, nome, apri, filo } of CASES) {
    // Densita' 1: un pixel dell'immagine e' un pixel CSS, e i conti tornano.
    const context = await browser.newContext({
      viewport: { width: larghezza, height: HEIGHT },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(server.base + route, { waitUntil: 'networkidle' });
    if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
    await page.evaluate(() => document.fonts.ready);

    const found = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;
    }, selector);

    if (found === null) {
      console.log(`  SALTATO ${nome} @${larghezza} — ${selector} non esiste su ${route}`);
      await context.close();
      continue;
    }

    if (apri) {
      // Il pannello va aperto, e il suo filo deve aver finito il giro.
      await page.click('#menu-toggle');
      await page.waitForTimeout(2600);
    } else {
      // Il blocco va portato in vista e il suo filo deve aver finito il giro:
      // a meta' tratto non c'e' niente da misurare.
      await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 250)), found);
      await page.waitForTimeout(2600);
    }

    const box = await page.evaluate(new Function('return ' + BOX_OF)(), selector);
    const etichetta = `${nome} @${larghezza}`;

    /*
     * Un blocco piu' alto della finestra non si puo' fotografare tutto.
     *
     * Succede a 390, dove le celle sono piccole e certi blocchi sono alti dieci
     * righe di contenuto. Si dichiara saltato invece di ritagliare fuori dallo
     * schermo, che darebbe un errore di sharp e nessuna informazione.
     */
    if (box.top < 0 || box.bottom > HEIGHT) {
      console.log(`  SALTATO ${etichetta} — non ci sta nella finestra (${box.top}…${box.bottom})`);
      await context.close();
      continue;
    }

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

    const atteso = filo ?? RULE;
    for (const [lato, dentro, fuori] of lati) {
      const haFilo = near(dentro, atteso);
      const lineaScoperta = fuori !== null && near(fuori, GRID);
      const ok = haFilo && !lineaScoperta;
      if (!ok) failures += 1;
      const dett = `filo ${dentro.join(',')}${fuori ? ` · fuori ${fuori.join(',')}` : ''}`;
      console.log(
        `  ${ok ? 'ok     ' : 'FALLITO'} ${etichetta} · lato ${lato}` +
          (ok ? '' : ` — ${!haFilo ? 'nessun filo dove dovrebbe' : 'la linea resta scoperta accanto al filo'} (${dett})`),
      );
    }

    await context.close();
  }
  /*
   * Il marquee ha due fili, e vanno guardati a parte.
   *
   * Non e' un blocco bordato: sfora di proposito su tutta la larghezza della
   * finestra, e i suoi due fili se li disegna da solo — quello alto e' un
   * `border-top`, quello basso uno pseudo-elemento un pixel sotto. Il secondo
   * era invisibile, mangiato dal ritaglio che serve al testo che scorre, e a
   * trovarlo e' stato l'occhio del committente.
   */
  console.log('\nE il marquee ha i suoi due fili?\n');

  if (!SOLO_RASSEGNA) {
    const context = await browser.newContext({ viewport: { width: 1440, height: HEIGHT }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + '/', { waitUntil: 'networkidle' });
    if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
    await page.evaluate(() => document.fonts.ready);

    const top = await page.evaluate(() => {
      const el = document.querySelector('.marquee');
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    });

    if (top === null) {
      failures += 1;
      console.log('  FALLITO il marquee non esiste su /');
    } else {
      await page.evaluate((t) => window.scrollTo(0, Math.max(0, t - 300)), top);
      await page.waitForTimeout(2600);

      const box = await page.evaluate(() => {
        const r = document.querySelector('.marquee').getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
      });
      // Una colonna lontana dalle parole, dove restano solo i due fili.
      const column = await strip(page, { x: 700, y: box.top - 3, width: 1, height: box.bottom - box.top + 6 });

      for (const [lato, px] of [
        ['alto', column[3]],
        ['basso', column[3 + (box.bottom - box.top)]],
      ]) {
        const ok = near(px, RULE);
        if (!ok) failures += 1;
        console.log(`  ${ok ? 'ok     ' : 'FALLITO'} marquee · filo ${lato}` + (ok ? '' : ` — ${px.join(',')} invece del filo`));
      }
    }

    await context.close();
  }

  console.log('\nLo strato dell\'hover copre il blocco e la sua linea?\n');

  if (!SOLO_RASSEGNA) {
    const context = await browser.newContext({ viewport: { width: 1440, height: HEIGHT }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(server.base + HOVER[0].route, { waitUntil: 'networkidle' });
    if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
    await page.evaluate(() => document.fonts.ready);

    let rotta = HOVER[0].route;
    for (const { selector, nome, apri, route, scorri, eredita } of HOVER) {
      if (route !== rotta) {
        await page.goto(server.base + route, { waitUntil: 'networkidle' });
        if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
        await page.evaluate(() => document.fonts.ready);
        rotta = route;
      }
      if (scorri) await porta(page, selector);
      if (apri) await apriMenu(page);
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

      /*
       * E non basta che la scatola combaci: deve combaciare anche cio' che c'e'
       * dentro.
       *
       * Lo strato di questi tre eredita la scatola dell'originale
       * (components.css), ma la prima versione della regola si era persa
       * `text-align`: `.hover-fill` nasce centrato perche' i bottoni lo sono, e
       * le due righe della card del mix scattavano al centro al passaggio del
       * puntatore. La sonda diceva ok, perche' guardava i quattro lati e non il
       * contenuto. E' stato il committente a vederlo.
       */
      if (eredita) {
        const eredita4 = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          const fill = el?.querySelector('.hover-fill');
          if (!el || !fill) return null;
          const props = ['text-align', 'flex-direction', 'justify-content', 'align-items'];
          const a = getComputedStyle(el);
          const b = getComputedStyle(fill);
          return props
            .filter((n) => a.getPropertyValue(n) !== b.getPropertyValue(n))
            .map((n) => `${n}: ${b.getPropertyValue(n)} invece di ${a.getPropertyValue(n)}`);
        }, selector);
        const uguali = eredita4 !== null && eredita4.length === 0;
        if (!uguali) failures += 1;
        console.log(
          `  ${uguali ? 'ok     ' : 'FALLITO'} ${nome} · lo strato eredita la disposizione` +
            (uguali ? '' : ` — ${(eredita4 ?? ['strato assente']).join(', ')}`),
        );
      }
    }

    /*
     * E il filo deve restare visibile **mentre** il bottone e' riempito.
     *
     * Senza contorno un bottone riempito di off-white su una pagina off-white
     * galleggia, e il blocco esce dalla griglia proprio mentre lo stai
     * puntando: e' la regressione che il committente ha segnalato.
     */
    console.log('\nE con il riempimento su, il filo c\'e\' ancora?\n');

    // Si riparte dalla pagina, non dal pannello aperto del giro precedente.
    await chiudiMenu(page);

    rotta = HOVER[0].route;
    await page.goto(server.base + rotta, { waitUntil: 'networkidle' });
    if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
    await page.evaluate(() => document.fonts.ready);

    for (const { selector, nome, apri, filo, route, scorri } of HOVER) {
      if (route !== rotta) {
        await page.goto(server.base + route, { waitUntil: 'networkidle' });
        if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
        await page.evaluate(() => document.fonts.ready);
        rotta = route;
      }
      if (apri) await apriMenu(page);
      else await chiudiMenu(page);
      if (scorri) await porta(page, selector);
      else await inCima(page);
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
        // `filo` e' o un colore per tutti e quattro i lati, o una mappa lato per
        // lato per i blocchi che hanno un vicino con idee proprie.
        const atteso = Array.isArray(filo) ? filo : (filo?.[lato] ?? RULE);
        const ok = near(px, atteso);
        if (!ok) failures += 1;
        console.log(`  ${ok ? 'ok     ' : 'FALLITO'} ${nome} in hover · lato ${lato}` + (ok ? '' : ` — ${px.join(',')} invece del filo`));
      }

      await page.mouse.move(2, 2);
      await page.waitForTimeout(700);
    }

    await context.close();
  }

  /*
   * La rassegna: tutti i blocchi bordati di tutte le rotte, a 390.
   *
   * I casi qui sopra sono una lista curata, e una lista curata verifica i
   * blocchi a cui qualcuno ha pensato. Il committente ha segnalato che su
   * mobile i bordi non si vedevano, ed erano due blocchi che nella lista non
   * c'erano: uno con un `overflow` che gli mangiava lo pseudo-elemento dei fili
   * (D103 di nuovo), l'altro con la foto del vicino sopra al filo basso (D112
   * di nuovo). Nessuna sonda li guardava.
   *
   * Due modi di sbagliare, e questa rassegna li ha fatti tutti e due prima di
   * funzionare.
   *
   * Il primo: misurare niente. Il megamenu chiuso resta un rettangolo grande
   * quanto la finestra, e l'esclusione dei blocchi viola lo prendeva per una
   * copertura: ogni punto di ogni blocco veniva cancellato, zero lati guardati,
   * cinque "ok" di fila. Da qui il conto dei lati e il conto dei blocchi mai
   * misurati: una rassegna vuota e una rassegna pulita si stampano uguale.
   *
   * Il secondo: inventarsi un difetto. I fili si disegnano sullo scroll e
   * chiudono il giro quando il bordo alto del blocco arriva al 25% della
   * finestra (vedi `porta()` qui sopra). Misurando ogni blocco che entra
   * intero nella finestra si misurano lati ancora corti, e diciassette di
   * questi erano finiti in un elenco di difetti che non esistevano. Quindi non
   * si misura per posizione: si guardano le quattro variabili del filo, e si
   * misura solo chi ha chiuso il giro.
   */
  console.log('\nE tutti gli altri, a 390?\n');
  {
    const ROTTE = ['/', '/about', '/works', '/works/seezy', '/contact'];
    const context = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    for (const rotta of ROTTE) {
      await page.goto(server.base + rotta, { waitUntil: 'networkidle' });
      if (SENZA_CLIP_MARGIN) await page.addStyleTag({ content: NEUTRALIZZA });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);

      // Un numero a ciascun blocco, per sapere alla fine chi non e' stato visto.
      const { totale, fuoriMisura } = await page.evaluate(() => {
        const tutti = [...document.querySelectorAll('#smooth-content .block[data-surface="line"]')]
          // A base la pagina dichiara un tier solo: i blocchi degli altri sono
          // `display: none` e non sono blocchi mancanti, non esistono.
          .filter((e) => getComputedStyle(e).display !== 'none');
        tutti.forEach((e, i) => { e.dataset.sonda = String(i); });
        return {
          totale: tutti.length,
          // Piu' alti della finestra: i quattro lati non stanno mai in uno
          // scatto solo. Si dicono, non si fingono misurati.
          fuoriMisura: tutti.filter((e) => e.getBoundingClientRect().height > window.innerHeight - 4).map((e) => e.className),
        };
      });
      const altezza = await page.evaluate(() => document.documentElement.scrollHeight);
      const misurati = new Set();
      const guasti = [];
      let lati = 0;

      /*
       * Il giro lo guidano i blocchi, non i pixel.
       *
       * A passi fissi un blocco alto 624 in una finestra da 800 ha 174 pixel di
       * posizioni buone: con passi da 300 lo si salta, ed e' cosi' che il
       * blocco del modulo di contatto e' rimasto fuori da due rotte. Qui si
       * porta sotto gli occhi il primo blocco non ancora misurato, e in quello
       * stesso scatto si misura tutto quello che nel frattempo e' a posto.
       */
      const tentativi = new Map();
      for (let giro = 0; giro < totale * 2 + 4; giro += 1) {
        const portato = await page.evaluate(([gia, arresi, ritentare]) => {
          const restano = [...document.querySelectorAll('#smooth-content .block[data-surface="line"]')]
            .filter((e) => e.dataset.sonda !== undefined)
            .filter((e) => !gia.includes(e.dataset.sonda) && !arresi.includes(e.dataset.sonda))
            .filter((e) => e.getBoundingClientRect().height <= window.innerHeight - 4);
          if (restano.length === 0) return null;
          const b = restano[0].getBoundingClientRect();
          /*
           * A un settimo dall'alto, come `porta()`: sopra il 25% il giro dei
           * fili e' finito e il blocco e' fermo. Ma un blocco alto 700 in una
           * finestra da 800 messo a 120 esce di sotto e non si misura mai: si
           * alza quel tanto che basta a farcelo stare intero.
           */
          /*
           * Al secondo tentativo si sale a filo della finestra.
           *
           * I fili si disegnano scorrendo, e un blocco alto 624 in una finestra
           * da 800 a 120 dall'alto ha il lato sinistro ancora al 74%: non e' un
           * difetto, e' meta' del giro. A top 0 e' al 100% ed e' ancora tutto
           * in vista. Senza questo secondo giro il blocco del modulo di
           * contatto restava fuori dalla rassegna su due rotte.
           */
          const quota = ritentare.includes(restano[0].dataset.sonda) ? 0 : window.innerHeight * 0.15;
          const alto = Math.max(0, Math.min(quota, window.innerHeight - 2 - b.height));
          window.scrollTo(0, Math.max(0, window.scrollY + b.top - alto));
          return restano[0].dataset.sonda;
        }, [
          [...misurati],
          [...tentativi].filter(([, n]) => n >= 3).map(([k]) => k),
          [...tentativi].filter(([, n]) => n >= 1).map(([k]) => k),
        ]);
        if (portato === null) break;
        tentativi.set(portato, (tentativi.get(portato) ?? 0) + 1);
        // Non un'attesa a occhio: si aspetta che **quel** blocco abbia chiuso
        // il giro. Un'attesa fissa da 1500ms lasciava fuori il blocco del
        // modulo di contatto, che e' il piu' alto del sito e ci mette di piu'.
        await page
          .waitForFunction(
            (id) => {
              const e = document.querySelector(`[data-sonda="${id}"]`);
              if (!e) return true;
              const st = getComputedStyle(e);
              return ['t', 'r', 'b', 'l']
                .map((k) => st.getPropertyValue('--rule-' + k).trim())
                .every((v) => v === '' || parseFloat(v) >= 99.5);
            },
            portato,
            { timeout: 6000 },
          )
          .catch(() => {});
        /*
         * E che la pagina sia ferma.
         *
         * ScrollSmoother frena per quasi un secondo dopo che i fili hanno
         * chiuso il giro: misurando li' il rettangolo si legge in un fotogramma
         * e lo scatto si prende nel successivo, il blocco si e' spostato di
         * qualche pixel, e il campione cade accanto al filo invece che sopra.
         * Sessantatre lati "senza filo" in una passata, tutti inventati dalla
         * sonda. Due letture uguali a 200ms di distanza: la pagina e' ferma.
         */
        await page
          .evaluate(() => { delete window.__fermo; })
          .then(() =>
            page.waitForFunction(
              () => {
                const c = document.getElementById('smooth-content');
                const y = c ? c.getBoundingClientRect().top : -window.scrollY;
                const prima = window.__fermo;
                window.__fermo = y;
                return prima !== undefined && Math.abs(prima - y) < 0.05;
              },
              null,
              { timeout: 6000, polling: 200 },
            ),
          )
          .catch(() => {});
        const blocchi = await page.evaluate((gia) => {
          const accenti = [...document.querySelectorAll('.block[data-surface="accent"], .megamenu, .sticky-header')]
            .filter((e) => getComputedStyle(e).visibility !== 'hidden')
            .map((e) => e.getBoundingClientRect())
            .filter((b) => b.width > 0);
          const coperto = (x, y) =>
            accenti.some((a) => x >= a.left - 1 && x <= a.right + 1 && y >= a.top - 1 && y <= a.bottom + 1);
          const intero = (v) => v === '' || parseFloat(v) >= 99.5;

          return [...document.querySelectorAll('#smooth-content .block[data-surface="line"]')]
            .filter((e) => getComputedStyle(e).display !== 'none' && !gia.includes(e.dataset.sonda))
            .map((e) => {
              const b = e.getBoundingClientRect();
              /*
               * Le soglie sono larghe di un pixel, e non per pigrizia.
               *
               * `top < 2` teneva fuori la prima riga di ogni pagina, che
               * comincia a zero: logo e bottone del menu non erano misurabili
               * da nessuna posizione. E `top < 0` teneva fuori il blocco del
               * modulo di contatto, che portato a filo della finestra si ferma
               * a -0.2 per via dell'inerzia dello smoother. Un sottopixel non
               * e' un blocco fuori dalla finestra.
               */
              if (b.top < -1 || b.bottom > window.innerHeight + 1 || b.width < 4 || b.height < 4) return null;
              // Solo chi ha chiuso il giro: un lato a meta' non e' un lato coperto.
              const st = getComputedStyle(e);
              const fili = ['t', 'r', 'b', 'l'].map((k) => st.getPropertyValue('--rule-' + k).trim());
              if (!fili.every(intero)) return null;
              // Sul bordo della griglia il filo torna dentro, come fa l'ultima
              // linea: fuori cadrebbe oltre il contenitore.
              const g = e.closest('.grid').getBoundingClientRect();
              const bordoX = b.right >= g.right - 0.5 ? 1 : 0;
              const bordoY = b.bottom >= g.bottom - 0.5 ? 1 : 0;
              const punti = {
                alto: [Math.round(b.left + b.width / 2), Math.max(0, Math.round(b.top))],
                sinistro: [Math.max(0, Math.round(b.left)), Math.round(b.top + b.height / 2)],
                // Destro e basso cadono un pixel **fuori** dal border box, sulla
                // linea che chiude il blocco (D61).
                destro: [Math.round(b.right) - bordoX, Math.round(b.top + b.height / 2)],
                basso: [Math.round(b.left + b.width / 2), Math.min(Math.round(b.bottom) - bordoY, window.innerHeight - 1)],
              };
              for (const [lato, [x, yy]] of Object.entries(punti)) if (coperto(x, yy)) delete punti[lato];
              return { id: e.dataset.sonda, nome: e.className, punti };
            })
            .filter(Boolean);
        }, [...misurati]);
        if (blocchi.length > 0) {
        const { data, info } = await sharp(await page.screenshot()).raw().toBuffer({ resolveWithObject: true });
        const px = (x, yy) => {
          const o = (yy * info.width + x) * info.channels;
          return [data[o], data[o + 1], data[o + 2]];
        };
        for (const b of blocchi) {
          misurati.add(b.id);
          for (const [lato, [x, yy]] of Object.entries(b.punti)) {
            lati += 1;
            const c = px(x, yy);
            /*
             * Il colore del filo, non "un colore scuro".
             *
             * Con la soglia larga questa rassegna ha dichiarato pulita una
             * pagina in cui la fotografia del ritratto copriva il filo basso
             * del titolo: la foto li' e' scura, e scuro passava. Il filo e'
             * opaco e ha un colore solo, quindi si pretende quello. I casi in
             * cui la linea e' legittimamente coperta — i blocchi viola, D2 —
             * sono tolti prima, per rettangolo.
             */
            if (!near(c, RULE)) guasti.push(`${b.nome} · ${lato} = ${c.join(',')}`);
          }
        }
        }

        /*
         * Perche' quel blocco non e' stato misurato.
         *
         * Senza questo, un blocco che sfugge alla rassegna si presenta come un
         * nome in un elenco e basta, e per sapere se e' un difetto del sito o
         * della sonda bisogna rifare a mano tutto il giro.
         */
        if (!misurati.has(portato) && tentativi.get(portato) >= 3) {
          const perche = await page.evaluate((id) => {
            const e = document.querySelector(`[data-sonda="${id}"]`);
            if (!e) return 'sparito dal documento';
            const b = e.getBoundingClientRect();
            const st = getComputedStyle(e);
            return `alto ${Math.round(b.top)} basso ${Math.round(b.bottom)} di ${window.innerHeight}, largo ${Math.round(b.width)}, display ${st.display}, fili ${['t', 'r', 'b', 'l'].map((k) => st.getPropertyValue('--rule-' + k).trim() || 'vuoto').join(' ')}`;
          }, portato);
          guasti.push(`non misurabile — ${perche}`);
        }
      }

      if (lati === 0) guasti.push('nessun lato guardato: la rassegna non ha misurato niente');
      if (fuoriMisura.length > 0) console.log(`            (fuori misura, piu' alti della finestra: ${fuoriMisura.join(', ')})`);
      if (misurati.size < totale - fuoriMisura.length) {
        const mai = await page.evaluate(
          (gia) =>
            [...document.querySelectorAll('#smooth-content .block[data-surface="line"]')]
              .filter((e) => e.dataset.sonda !== undefined && !gia.includes(e.dataset.sonda))
              .filter((e) => e.getBoundingClientRect().height <= window.innerHeight - 4)
              .map((e) => e.className),
          [...misurati],
        );
        guasti.push(`mai misurati: ${mai.join(', ')}`);
      }

      failures += guasti.length;
      console.log(
        `  ${guasti.length === 0 ? 'ok     ' : 'FALLITO'} ${rotta} — ${misurati.size}/${totale} blocchi, ${lati} lati, ${guasti.length} guasti`,
      );
      for (const g of guasti.slice(0, 12)) console.log(`            ${g}`);
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
