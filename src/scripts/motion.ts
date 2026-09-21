/**
 * Il movimento del sito.
 *
 * Due cose, entrambe legate allo scroll:
 *
 * 1. Lo scroll morbido, con ScrollSmoother.
 * 2. Il disegno delle linee: i bordi si completano quando il blocco entra in
 *    vista.
 * 3. Le immagini, che si scoprono dall'alto verso il basso.
 * 4. Il titolo e le categorie delle card progetto, che spuntano dal basso.
 * 5. Il marquee, che e' l'unico movimento che non dipende dallo scroll.
 *
 * Tutto passa da `gsap.matchMedia()`. Sotto `prefers-reduced-motion: reduce`
 * non viene creato niente: lo scroll resta nativo e le linee restano intere.
 * Se questo modulo non venisse caricato affatto, la pagina resterebbe com'e'
 * adesso — le linee sono intere per default e si accorciano solo qui.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { DURATION, EASE, SMOOTH } from '../motion/tokens';
import { clearRules, restoreRules, traceRules } from '../motion/trace';
import { startMarquee } from '../motion/marquee';
import { startCarousel } from '../motion/carousel';
import { startTestimonials } from '../motion/testimonials';
import { revealCards } from '../motion/card';

/**
 * Dove finisce l'ingresso: il bordo **basso** del blocco, in frazioni di
 * schermata.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' IL BORDO BASSO E NON QUELLO ALTO
 *
 * Fino alla Fase 7 la finestra era legata al bordo **alto**: da `top 95%` a
 * `top 60%`. Con un blocco alto il risultato era giusto, con un blocco basso
 * no: un quadrato da una cella che stava **tutto dentro lo schermo**, appoggiato
 * al bordo inferiore, aveva il bordo alto ancora al 92% e quindi il filo appena
 * cominciato. A schermo: un blocco intero, visibile, senza bordo.
 *
 * Su desktop si notava poco — le celle sono grandi e i blocchi occupano una
 * fetta di schermo. A 390 la cella e' 39px: nella fascia bassa ci stanno cinque
 * blocchi, e restano li' senza bordo finche' non scorri ancora. E' quello che
 * il committente ha visto e ha chiamato "in mobile mancano i bordi ai
 * container". Non era un difetto di mobile: era un difetto che mobile rendeva
 * visibile.
 *
 * Legata al bordo basso, la promessa diventa esprimibile in una riga: **un
 * blocco che dista dal fondo piu' di un settimo di schermata ha i suoi quattro
 * fili interi**, alto o basso che sia. La fascia in cui si vede un filo a meta'
 * passa da due quinti di schermo a un settimo.
 * ---------------------------------------------------------------------------
 */
const ENTER_END = 0.85;

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);


/*
 * Carosello e testimonial stanno qui fuori, non dentro `matchMedia`.
 *
 * Cambiare slide o scheda e' un comando, non un'animazione: sotto reduced
 * motion i comandi devono continuare a funzionare, e li' il cambio e'
 * istantaneo e l'avanzamento automatico non parte.
 */
startCarousel();
startTestimonials();

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: SMOOTH,
    // I blocchi non si muovono mai: non c'e' nessun effetto da applicare.
    effects: false,
    // `normalizeScroll` sposta lo scroll su JS anche da tastiera e touch. Qui
    // fa piu' danno che bene: intercetta il tab e le frecce, che su una pagina
    // con un form devono restare quelle del browser.
    normalizeScroll: false,
  });

  /*
   * Ogni fase ha la sua rete.
   *
   * Queste funzioni cominciano **togliendo** qualcosa — i fili vanno a zero, le
   * immagini si ritagliano a niente — e lo rimettono animandolo. Se una di loro
   * inciampa a meta', quel che ha tolto resta tolto: una pagina senza bordi, o
   * con i riquadri delle immagini vuoti. E' successo, su un motore che qui non
   * posso provare.
   *
   * Con la rete, un errore costa l'animazione e non il contenuto. E si vede in
   * console, invece di somigliare a un difetto di disegno.
   */
  safely('fili dei blocchi', revealRules, () =>
    restoreRules(gsap.utils.toArray<HTMLElement>('.block[data-surface="line"]')),
  );
  safely('immagini', revealMedia, () =>
    gsap.set(gsap.utils.toArray<HTMLElement>('[data-reveal]'), { clipPath: 'none' }),
  );
  safely('titoli delle card', revealCards, () =>
    gsap.set(gsap.utils.toArray<HTMLElement>('.works-card__tags > *'), { yPercent: 0 }),
  );
  const marquee = startMarquee();

  /*
   * Le ancore interne, finche' lo scroll e' dello smoother.
   *
   * Il markup e' sempre stato giusto — "Discover more" e' un `href="#about"`
   * verso `id="about"` — ed era il salto nativo a essere sbagliato qui.
   * Misurato: cliccandolo, il browser porta la sezione in vista scrollando
   * `#smooth-wrapper`, che e' fisso, invece della pagina. Il wrapper finisce a
   * `scrollTop: 1080` e `window.scrollY` resta **0**.
   *
   * A schermo sembra funzionare. Non funziona: la pagina crede di essere in
   * cima, quindi le finestre d'ingresso dei blocchi scavalcati non si aprono e
   * quei blocchi restano senza fili — cioe' senza bordi, che su questa griglia
   * e' il difetto peggiore di tutti. E lo scostamento del wrapper non si
   * riassorbe piu': da li' in poi ogni rotellata somma due posizioni diverse.
   *
   * `smoother.scrollTo` muove la posizione vera, quindi ScrollTrigger vede
   * quello che vede l'occhio. Sotto reduced motion questo blocco non esiste e
   * l'ancora nativa va benissimo: misurato, li' era gia' corretta.
   */
  const ancora = (href: string | null): HTMLElement | null => {
    if (!href || !href.startsWith('#') || href.length < 2) return null;
    return document.getElementById(decodeURIComponent(href.slice(1)));
  };

  /*
   * La quota a cui sta il blocco dentro il contenuto, non nella finestra.
   *
   * Si misura contro `#smooth-content` e non contro la finestra perche' le due
   * cose coincidono solo da fermi: mentre lo scroll morbido insegue, la
   * posizione dipinta e quella vera sono diverse, e un click a meta' corsa
   * calcolerebbe un bersaglio sbagliato. La differenza fra i due rettangoli e'
   * invece sempre la stessa, qualunque sia il ritardo.
   */
  const quotaDi = (target: HTMLElement): number => {
    const content = document.getElementById('smooth-content');
    return target.getBoundingClientRect().top - (content?.getBoundingClientRect().top ?? 0);
  };

  // Un click sull'ancora mentre la corsa precedente non ha finito annulla il
  // fuoco di quella prima, o si finirebbe con il fuoco su una sezione che non
  // e' piu' quella dove si sta andando.
  let focoDopo: gsap.core.Tween | null = null;

  const vaiAll = (target: HTMLElement) => {
    /*
     * Un numero, non l'elemento.
     *
     * `smoother.scrollTo(elemento)` allinea a modo suo: misurato, su "Mix"
     * porta a 870 invece di 1080, cioe' lascia la sezione 210px sotto il bordo,
     * e passargli `'top top'` non lo sposta di un pixel. La quota giusta e'
     * quella qui sopra — `window.scrollTo(0, 1080)` mette la sezione esatta in
     * cima, verificato — quindi gliela si da' e basta.
     */
    /*
     * Il fuoco **prima** dello scroll, e non dopo.
     *
     * L'ancora nativa il fuoco lo sposta, e toglierglielo senza rimetterlo
     * lascerebbe chi naviga da tastiera fermo sul bottone, col tab che riparte
     * da sopra la sezione appena raggiunta.
     *
     * Ma `preventScroll: true` qui **non viene rispettato**: dentro un wrapper
     * fisso il browser aggiusta comunque, e misurato sposta di 210px — era lui
     * a lasciare "Mix" sotto il bordo, non `scrollTo`. Mettendolo per primo,
     * l'aggiustamento avviene e poi ci pensa lo scroll a coprirlo: l'ultimo che
     * parla decide, e qui l'ultimo e' quello che sa dove si va.
     */
    smoother.scrollTo(quotaDi(target), true);

    /*
     * Il fuoco **dopo** essere arrivati, non prima.
     *
     * L'ancora nativa il fuoco lo sposta, e toglierglielo senza rimetterlo
     * lascia chi naviga da tastiera fermo sul bottone, col tab che riparte da
     * sopra la sezione appena raggiunta.
     *
     * Il problema e' che `preventScroll: true` qui **non viene rispettato**:
     * dentro un wrapper fisso il browser aggiusta comunque. Chiedendolo a
     * sezione ancora lontana spostava di 210px e lasciava due numeri diversi —
     * posizione nativa a 1080, contenuto trasformato di -870 — che si
     * riallineavano solo alla rotellata dopo.
     *
     * Ma quell'aggiustamento e' grande **perche' l'elemento e' lontano**. A
     * corsa finita l'elemento e' gia' in cima alla finestra, non c'e' niente da
     * portare in vista, e il browser non tocca niente. Si aspetta quindi che lo
     * scroll morbido abbia finito: `SMOOTH` e' la sua durata, il quinto di
     * secondo in piu' e' margine.
     */
    focoDopo?.kill();
    focoDopo = gsap.delayedCall(SMOOTH + 0.2, () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  };

  const onAncora = (event: MouseEvent) => {
    // Click con un modificatore, o non con il tasto principale: sono "apri
    // altrove", e non ci riguardano.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = (event.target as Element | null)?.closest?.('a[href]');
    const target = ancora(link?.getAttribute('href') ?? null);
    if (!link || !target) return;

    event.preventDefault();
    vaiAll(target);
    history.pushState(null, '', link.getAttribute('href'));
  };

  document.addEventListener('click', onAncora);

  /*
   * E chi arriva gia' con l'ancora nell'indirizzo.
   *
   * Il browser fa lo stesso salto sbagliato prima che questo modulo parta: il
   * wrapper e' gia' storto. Si azzera e si rifa' il percorso per davvero, senza
   * animazione, perche' a pagina appena aperta non c'e' niente da accompagnare.
   */
  const iniziale = ancora(window.location.hash);
  if (iniziale) {
    const wrapper = document.getElementById('smooth-wrapper');
    if (wrapper) wrapper.scrollTop = 0;
    smoother.scrollTo(quotaDi(iniziale), false);
  }

  return () => {
    focoDopo?.kill();
    document.removeEventListener('click', onAncora);
    marquee?.stop();
    smoother.kill();
  };
});

/**
 * Esegue una fase del movimento, e se fallisce rimette le cose a posto.
 *
 * `restore` non deve ricostruire niente: deve riportare gli elementi allo stato
 * che avrebbero senza questo modulo, cioe' quello che il CSS gia' descrive.
 */
function safely(nome: string, run: () => void, restore: () => void): void {
  try {
    run();
  } catch (error) {
    try {
      restore();
    } catch {
      // Se fallisce anche il ripristino non c'e' altro da tentare.
    }
    console.error(`movimento: "${nome}" non e' partito, quella parte resta ferma`, error);
  }
}

/**
 * Le linee si disegnano quando le raggiungi.
 *
 * Le orizzontali si allungano da sinistra man mano che entrano nella vista.
 * Le verticali no: attraversano tutta la pagina, e disegnarne una intera in
 * mezzo secondo mostrerebbe una linea che arriva fin dove non sei ancora. Si
 * allungano quindi verso il basso in proporzione allo scroll, tenendo il
 * proprio capo appena sotto il bordo inferiore della finestra.
 *
 * I bordi dei blocchi sono un caso a parte. Cadono sulla stessa linea di
 * griglia, ma il fondo del blocco e' al 50% e la smorza: il bordo serve a
 * riportarla piena. Non e' un `border`, che non si puo' accorciare, ma quattro
 * gradienti percorsi da un tratto solo che gira attorno alla sagoma e si chiude
 * dov'e' partito. Vedi `src/motion/trace.ts`.
 */
function revealRules(): void {
  /*
   * La griglia di pagina e' quella che scorre col contenuto.
   *
   * Qui c'era `.grid:not(.megamenu__grid)` con `querySelector`: prendeva la
   * prima griglia che non fosse quella del menu, e funzionava per ordine nel
   * documento, cioe' per fortuna. Da quando c'e' anche la barra fissa le
   * griglie sono tre, e dire dove sta la pagina e' piu' solido che elencare
   * dove non sta. Il megamenu e la barra hanno le loro animazioni, non questa.
   */
  const grid = document.querySelector('#smooth-content .grid');
  if (!(grid instanceof HTMLElement)) return;

  const horizontals = gsap.utils.toArray<HTMLElement>('.grid-line--h', grid).filter(isVisible);
  const verticals = gsap.utils.toArray<HTMLElement>('.grid-line--v', grid).filter(isVisible);
  // Solo i blocchi accesi. Un blocco spento da una media query non ha misure e
  // il suo trigger non parte mai: azzerarne i fili lo lascerebbe senza bordo se
  // una rotazione dello schermo lo riaccendesse. Cosi' invece nasce gia' intero.
  const ruled = gsap.utils.toArray<HTMLElement>('.block[data-surface="line"]', grid).filter(isVisible);
  // Lo sfalsamento dei blocchi che si disegnano all'apertura si conta a parte:
  // dipende da quanti ne stanno nella prima schermata, non dalla loro
  // posizione nell'elenco di tutti i blocchi della pagina.
  let onLoad = 0;

  gsap.set(horizontals, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(verticals, { transformOrigin: 'center top' });
  clearRules(ruled);

  ScrollTrigger.batch(horizontals, {
    start: 'top bottom',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        scaleX: 1,
        duration: DURATION.rule,
        ease: EASE.rule,
        stagger: DURATION.ruleStagger,
        overwrite: true,
      }),
  });

  // Il capo della verticale sta dove sta il bordo basso della finestra: a
  // scroll zero e' gia' alto quanto una schermata, a fondo pagina e' intero.
  const startScale = () => Math.min(1, window.innerHeight / grid.offsetHeight);
  gsap.fromTo(
    verticals,
    { scaleY: startScale },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: grid,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );

  // Un giro per blocco, e non un tween solo su tutto il gruppo: la ripartizione
  // fra i quattro lati dipende dalle misure di **quel** blocco.
  //
  // Agganciato allo scroll e non lanciato all'ingresso. Con un'animazione a
  // tempo che parte a `top bottom` il blocco e' ancora tutto sotto la piega:
  // meta' del giro succedeva fuori schermo e chi guardava vedeva comparire un
  // bordo gia' fatto per tre quarti. Cosi' invece il filo si disegna mentre il
  // blocco sale, che e' quello che era stato chiesto: i bordi si completano
  // quando l'oggetto arriva nella view.
  for (const block of ruled) {
    if (isBelowTheFold(block)) {
      traceRules(block, { ease: 'none', scrollTrigger: entering(block) });
    } else {
      // Gia' in vista all'apertura: il suo ingresso e' adesso, non piu' avanti.
      traceRules(block, { duration: DURATION.trace, ease: EASE.rule, delay: onLoad++ * DURATION.ruleStagger });
    }
  }
}

/**
 * Sotto la piega, cioe' con un ingresso ancora da fare.
 *
 * Divide i due modi in cui un filo si disegna, e la divisione e' necessaria:
 * un blocco della prima schermata ha una finestra d'ingresso che si chiude
 * **prima** dello scroll zero, quindi il suo trigger non verrebbe mai
 * disegnato e i suoi fili resterebbero a zero, cioe' invisibili, per sempre.
 * Quel blocco non deve aspettare lo scroll: si disegna all'apertura.
 *
 * Il confine e' il fondo della finestra, non una frazione: se all'apertura si
 * vede anche solo un pixel del blocco, quel blocco si disegna subito. Cosi'
 * nessuno resta a meta' senza che ci sia dello scroll davanti a finirlo.
 */
function isBelowTheFold(el: HTMLElement): boolean {
  return el.getBoundingClientRect().top >= window.innerHeight;
}

/**
 * La finestra di scroll in cui un blocco "arriva nella view".
 *
 * Da quando spunta dal fondo a quando il suo bordo basso e' salito a
 * `ENTER_END`: il filo si chiude quando il blocco e' dentro per intero **piu'**
 * un margine, non quando il suo bordo alto ha raggiunto una certa quota.
 *
 * La finestra ovvia sarebbe "fino a quando il bordo basso diventa visibile", e
 * li' il giro finirebbe nell'istante esatto in cui lo diventa: il rettangolo
 * intero non si vedrebbe mai (era il difetto di D59). Il margine di
 * `1 - ENTER_END` e' esattamente quello che serve a vederlo finito.
 */
function entering(block: HTMLElement): ScrollTrigger.Vars {
  return {
    trigger: block,
    // `clamp()` tiene la finestra dentro la corsa di scroll disponibile. Senza,
    // i blocchi dell'ultima schermata non arriverebbero mai in fondo — non c'e'
    // piu' pagina sotto di loro — e resterebbero senza bordo.
    start: 'clamp(top bottom)',
    /*
     * Funzione e non stringa: dipende dall'altezza del blocco, che cambia con
     * la larghezza della finestra, e `invalidateOnRefresh` la rilegge.
     *
     * Un blocco piu' alto della fascia disponibile non puo' stare "tutto dentro
     * con un margine": non esiste una posizione di scroll in cui sia vero. Per
     * lui si torna al bordo alto, a un quarto di schermata, che e' il punto in
     * cui se n'e' visto abbastanza.
     */
    end: () => {
      const h = block.getBoundingClientRect().height;
      return h <= window.innerHeight * ENTER_END
        ? `clamp(bottom ${ENTER_END * 100}%)`
        : 'clamp(top 25%)';
    },
    scrub: true,
    invalidateOnRefresh: true,
  };
}

/**
 * Le immagini si scoprono dall'alto verso il basso.
 *
 * Un `clip-path` che si apre da sopra, come se il contenitore si espandesse
 * verso il basso fino a riempire la propria cella. Il clip sta **sull'immagine**
 * e non sul blocco: il blocco e' bordato e sulla griglia, e un blocco bordato
 * non cambia misura nemmeno per un fotogramma. Quel che si vede e' comunque un
 * riquadro che si riempie, perche' l'immagine occupa tutta la cella.
 *
 * Segue lo scroll con la stessa finestra del filo che gira attorno al blocco:
 * cornice e contenuto si riempiono insieme mentre il blocco sale, e quando il
 * blocco e' entrato per intero l'immagine c'e' tutta. La finestra e' quella del
 * **blocco** che la contiene, non dell'immagine: e' il contenitore che si
 * espande.
 */
function revealMedia(): void {
  const media = gsap.utils.toArray<HTMLElement>('[data-reveal]').filter(isVisible);

  for (const image of media) {
    const frame = image.closest<HTMLElement>('.block') ?? image;
    const open = { clipPath: 'inset(0 0 0% 0)' };
    gsap.fromTo(
      image,
      { clipPath: 'inset(0 0 100% 0)' },
      isBelowTheFold(frame)
        ? { ...open, ease: 'none', scrollTrigger: entering(frame) }
        : { ...open, duration: DURATION.trace, ease: EASE.rule },
    );
  }
}

/** Un tier spento sta a display:none: misurarlo darebbe zero e animarlo niente. */
function isVisible(el: HTMLElement): boolean {
  return el.offsetWidth > 0 || el.offsetHeight > 0;
}
