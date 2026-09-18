/**
 * Le sette icone animate.
 *
 * Porting in GSAP delle animazioni di Animate UI (`registry/icons/<nome>`),
 * con i valori letti dal sorgente. La libreria non si installa: e' React piu'
 * `motion/react`, cioe' 60-75kb gzip e un secondo sistema di animazione accanto
 * a GSAP, per sette icone da 24 pixel.
 *
 * Tre vincoli, tutti e tre obbligatori:
 *
 * 1. L'SVG e' inline nel markup (lo fa Icon.astro): un `<img src>` non si anima.
 * 2. Niente `transform-box: fill-box`. Diverse di queste animazioni dipendono
 *    dal comportamento predefinito degli SVG, dove l'origine si risolve sul
 *    `viewBox` e non sul bounding box: su una linea orizzontale il bounding box
 *    e' alto zero, e "top right" e "bottom right" coinciderebbero. Qui si usa
 *    `svgOrigin`, che lavora gia' nelle coordinate del viewBox.
 * 3. L'animazione resta dentro il riquadro 24x24 e non tocca mai il blocco che
 *    la contiene.
 *
 * Una timeline per istanza, costruita al primo hover e tenuta in una WeakMap:
 * le stesse icone compaiono piu' volte in pagina e una timeline condivisa le
 * farebbe partire tutte insieme.
 */

import gsap from 'gsap';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface Controller {
  enter(): void;
  leave(): void;
}

type Builder = (svg: SVGElement) => Controller;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Le icone che rispondono al passaggio del mouse.
 *
 * `menu` non e' qui: non e' un hover, e' uno stato. Lo pilota `aria-expanded`
 * sul bottone, piu' in basso.
 */
const BUILDERS: Record<string, Builder> = {
  send,
  x,
  'chevron-left': chevron(-1),
  'chevron-right': chevron(1),
  'map-pin': mapPin,
  'disc-3': disc,
};

const controllers = new WeakMap<SVGElement, Controller>();

bindHover();
bindMenuMorph();

/**
 * L'hover si aggancia al comando, non all'icona.
 *
 * Un quadrato di 24px dentro una cella da 120 sarebbe un bersaglio minuscolo:
 * chi punta il bottone si aspetta che risponda il bottone. Dove l'icona non e'
 * dentro un comando (map-pin e disc-3 su /about stanno in celle non
 * cliccabili) il bersaglio e' il blocco.
 */
function bindHover(): void {
  // Su touch l'hover non parte mai: ogni icona deve essere leggibile da ferma,
  // e un `mouseenter` sintetizzato dal tap farebbe partire l'animazione dopo
  // che il dito ha gia' lasciato.
  if (!window.matchMedia('(hover: hover)').matches) return;

  for (const svg of document.querySelectorAll<SVGElement>('[data-icon]')) {
    const build = BUILDERS[svg.dataset.icon ?? ''];
    if (!build) continue;

    const host = svg.closest('button, a, .block') ?? svg;
    host.addEventListener('mouseenter', () => controllerFor(svg, build).enter());
    host.addEventListener('mouseleave', () => controllerFor(svg, build).leave());
  }
}

function controllerFor(svg: SVGElement, build: Builder): Controller {
  let controller = controllers.get(svg);
  if (!controller) {
    controller = build(svg);
    controllers.set(svg, controller);
  }
  return controller;
}

/* ---------- Le sei animazioni di hover ---------- */

/**
 * Send: il gruppo arretra, vola fuori in alto a destra, riappare in basso a
 * sinistra e rientra. Il viewBox ritaglia l'uscita da solo.
 *
 * Sorgente: scale [1,.8,1,1,1], x [0,-10%,100%,-125%,0], y [0,10%,-100%,125%,0],
 * times [0,.25,.5,.5,1], 1,2s. I due keyframe a 0,5 coincidono: e' un salto
 * istantaneo, non un movimento, ed e' il `set` qui sotto.
 */
function send(svg: SVGElement): Controller {
  const g = group(svg);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut' } });

  tl.to(g, { xPercent: -10, yPercent: 10, scale: 0.8, duration: 0.3 })
    .to(g, { xPercent: 100, yPercent: -100, scale: 1, duration: 0.3 })
    .set(g, { xPercent: -125, yPercent: 125 })
    .to(g, { xPercent: 0, yPercent: 0, duration: 0.6 });

  // All'uscita del mouse non si fa niente: l'aereo torna al punto di partenza
  // da solo, e una reverse() a meta' volo lo farebbe rientrare all'indietro.
  return { enter: () => void tl.play(0), leave: () => {} };
}

/**
 * X: un quarto di giro.
 *
 * Una X ruotata di 90 gradi e' di nuovo una X: il gesto e' il giro, non una
 * trasformazione. Le due linee partono sfalsate di 0,1s.
 */
function x(svg: SVGElement): Controller {
  const [first, second] = svg.querySelectorAll<SVGPathElement>('path');
  const tl = gsap.timeline({ paused: true });

  tl.to(first, { rotation: 90, svgOrigin: '12 12', duration: 0.4, ease: 'power1.inOut' }, 0);
  tl.to(second, { rotation: 90, svgOrigin: '12 12', duration: 0.4, ease: 'power1.inOut' }, 0.1);

  return { enter: () => void tl.play(0), leave: () => {} };
}

/**
 * Chevron: una spinta nella direzione in cui punta, e il rientro.
 *
 * Animate UI ha due varianti: quella base resta spostata fino al mouseleave,
 * quella `default-loop` va e torna. Qui sono le frecce di un carosello: se si
 * clicca e il puntatore resta fermo, la variante base lascerebbe la freccia
 * fuori posto, quindi si usa il giro completo.
 */
function chevron(direction: -1 | 1): Builder {
  return (svg) => {
    const path = svg.querySelector('path');
    const tl = gsap.timeline({ paused: true });

    tl.to(path, { x: direction * 4, duration: 0.3, ease: 'power1.inOut' }).to(path, {
      x: 0,
      duration: 0.3,
      ease: 'power1.inOut',
    });

    return {
      // Su una freccia disabilitata — primo o ultimo elemento — non parte:
      // muoversi in risposta a un comando che non c'e' e' una bugia.
      enter: () => {
        if (!isDisabled(svg)) tl.play(0);
      },
      leave: () => {},
    };
  };
}

/** MapPin: il rimbalzo, con il perno sulla punta (12 24) e non sul centro. */
function mapPin(svg: SVGElement): Controller {
  const g = group(svg);
  const pivot = { svgOrigin: '12 24', ease: 'power1.inOut' } as const;
  const tl = gsap.timeline({ paused: true });

  tl.to(g, { scale: 0.75, rotation: 30, y: -6, duration: 0.333, ...pivot })
    .to(g, { scale: 1, rotation: -15, y: 0, duration: 0.333, ...pivot })
    .to(g, { rotation: 0, duration: 0.334, ...pivot });

  return { enter: () => void tl.play(0), leave: () => {} };
}

/**
 * Disc3: rotazione continua, 360 gradi al secondo, lineare.
 *
 * Ruota il gruppo attorno al centro del viewBox e non l'elemento `<svg>`: sulla
 * radice di un SVG l'attributo `transform` non ha effetto, e il risultato a
 * schermo e' lo stesso.
 *
 * All'uscita del mouse non si ferma di colpo: si porta al giro successivo alla
 * stessa velocita' e poi si mette in pausa, altrimenti il disco si blocca
 * storto.
 */
function disc(svg: SVGElement): Controller {
  const g = group(svg);
  const spin = gsap.to(g, {
    rotation: 360,
    svgOrigin: '12 12',
    duration: 1,
    ease: 'none',
    repeat: -1,
    paused: true,
  });

  let settle: gsap.core.Tween | null = null;

  return {
    enter: () => {
      settle?.kill();
      settle = null;
      spin.play();
    },
    leave: () => {
      if (!spin.isActive()) return;
      const angle = (gsap.getProperty(g, 'rotation') as number) % 360;
      spin.pause();
      settle = gsap.to(g, {
        rotation: 360,
        svgOrigin: '12 12',
        // Stessa velocita' angolare: quel che resta del giro, alla stessa ora.
        duration: (360 - angle) / 360,
        ease: 'none',
        onComplete: () => {
          gsap.set(g, { rotation: 0, svgOrigin: '12 12' });
          spin.progress(0).pause();
          settle = null;
        },
      });
    },
  };
}

/* ---------- Il morph della hamburger ---------- */

/**
 * Menu -> X, al click e non all'hover.
 *
 * Lo pilota `aria-expanded` sul bottone: uno stato solo, lo stesso che legge
 * uno screen reader, che non puo' desincronizzarsi da quello che si vede.
 *
 * Le due linee ruotano attorno ai due angoli destri del viewBox — (24,0) e
 * (24,24) — e non attorno al proprio centro: e' questo che da' al gesto il
 * carattere di una chiusura a forbice invece del solito incrocio.
 */
function bindMenuMorph(): void {
  for (const svg of document.querySelectorAll<SVGElement>('[data-icon="menu"]')) {
    const button = svg.closest('button');
    if (!button) continue;

    const tl = menuMorph(svg);
    const sync = () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      // Sotto reduced motion il morph diventa uno scambio istantaneo: la forma
      // giusta c'e' comunque, e' il percorso che sparisce.
      if (reduced.matches) tl.progress(open ? 1 : 0).pause();
      else if (open) tl.play();
      else tl.reverse();
    };

    new MutationObserver(sync).observe(button, { attributes: true, attributeFilter: ['aria-expanded'] });
    sync();
  }
}

function menuMorph(svg: SVGElement): gsap.core.Timeline {
  // Ordinate e non ordine nel markup: se lucide riordina i tre path in una
  // versione futura, il morph si spezza in silenzio.
  const [top, middle, bottom] = [...svg.querySelectorAll<SVGPathElement>('path')].sort(
    (a, b) => lineY(a) - lineY(b),
  );

  const tl = gsap.timeline({ paused: true });
  tl.to(top, { rotation: -45, x: -2.35, y: 0.35, svgOrigin: '24 0', duration: 0.45, ease: 'back.out(1.2)' }, 0);
  tl.to(bottom, { rotation: 45, x: -2.35, y: -0.35, svgOrigin: '24 24', duration: 0.45, ease: 'back.out(1.2)' }, 0);
  tl.to(middle, { opacity: 0, duration: 0.2, ease: 'power1.inOut' }, 0);
  return tl;
}

/** L'ordinata di una linea, letta dal suo `d`: `M4 5h16` da' 5. */
function lineY(path: SVGPathElement): number {
  const match = /^[Mm]\s*-?[\d.]+[\s,]+(-?[\d.]+)/.exec(path.getAttribute('d')?.trim() ?? '');
  return match ? Number.parseFloat(match[1]) : 0;
}

/* ---------- Utilita' ---------- */

/**
 * Il gruppo su cui agire.
 *
 * Diverse animazioni spostano l'icona intera, e lucide non avvolge i propri
 * tracciati: il gruppo lo si crea al volo, una sola volta. Il `<title>`, quando
 * c'e', resta figlio diretto dell'SVG: dentro un `<g>` non e' piu' il nome
 * accessibile dell'immagine.
 */
function group(svg: SVGElement): SVGGElement {
  const existing = svg.querySelector<SVGGElement>('g[data-icon-group]');
  if (existing) return existing;

  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('data-icon-group', '');
  for (const node of [...svg.childNodes]) {
    if (node.nodeName === 'title') continue;
    g.appendChild(node);
  }
  svg.appendChild(g);
  return g;
}

function isDisabled(svg: SVGElement): boolean {
  const host = svg.closest('button, a');
  if (!host) return false;
  return (host as HTMLButtonElement).disabled === true || host.getAttribute('aria-disabled') === 'true';
}
