/**
 * Il movimento del sito.
 *
 * Due cose, entrambe legate allo scroll:
 *
 * 1. Lo scroll morbido, con ScrollSmoother.
 * 2. Il disegno delle linee: i bordi si completano quando il blocco entra in
 *    vista.
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
import { clearRules, traceRules } from '../motion/trace';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

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

  revealRules();

  return () => {
    smoother.kill();
  };
});

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
  // Il megamenu ha la sua timeline, legata all'apertura e non allo scroll: la
  // pagina qui e' la prima griglia che non sia la sua.
  const grid = document.querySelector('.grid:not(.megamenu__grid)');
  if (!(grid instanceof HTMLElement)) return;

  const horizontals = gsap.utils.toArray<HTMLElement>('.grid-line--h', grid).filter(isVisible);
  const verticals = gsap.utils.toArray<HTMLElement>('.grid-line--v', grid).filter(isVisible);
  const ruled = gsap.utils.toArray<HTMLElement>('.block[data-surface="line"]', grid);

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
  ScrollTrigger.batch(ruled, {
    start: 'top bottom',
    once: true,
    onEnter: (batch) =>
      // `batch` arriva tipizzato come Element[]: gli elementi sono quelli di
      // `ruled`, che e' una lista di HTMLElement.
      (batch as HTMLElement[]).forEach((block, i) =>
        traceRules(block, DURATION.rule, EASE.rule).delay(i * DURATION.ruleStagger),
      ),
  });
}

/** Un tier spento sta a display:none: misurarlo darebbe zero e animarlo niente. */
function isVisible(el: HTMLElement): boolean {
  return el.offsetWidth > 0 || el.offsetHeight > 0;
}
