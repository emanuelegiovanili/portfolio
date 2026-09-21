/**
 * Apertura e chiusura del megamenu.
 *
 * Il pannello entra da destra mentre il suo contenuto si contro-trasla della
 * stessa quantita': a schermo si muove il ritaglio, i blocchi restano fermi.
 * E' l'unico modo di far entrare un pannello senza spostare un blocco bordato,
 * che e' la regola zero del progetto. Dietro alla tendina i fili si disegnano e
 * il contenuto compare, con lo stesso stagger delle linee di pagina.
 *
 * La contro-traslazione e non un `clip-path`: la seconda si compone peggio sul
 * compositor, e qui la tendina copre l'intera finestra.
 *
 * Sotto `prefers-reduced-motion: reduce` resta la sola dissolvenza: nessuna
 * traslazione, nessun filo che si disegna. Fuoco, `inert` e blocco dello scroll
 * funzionano identici nei due casi.
 */

import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { DURATION, EASE, MENU } from '../motion/tokens';
import { clearRules, traceRules } from '../motion/trace';

const menu = document.getElementById('megamenu');
/*
 * I bottoni che aprono il menu sono **due**: quello dell'header e quello della
 * barra che resta in alto (StickyHeader.astro). Fanno la stessa cosa e portano
 * lo stesso stato, quindi si prendono insieme invece di dare al secondo un giro
 * suo, che e' il modo in cui due comandi uguali finiscono per discordare.
 */
const toggles = [...document.querySelectorAll<HTMLElement>('[data-menu-toggle]')];
const toggle = toggles[0] ?? null;
const closeButton = document.getElementById('menu-close');
const wrapper = document.getElementById('smooth-wrapper');
/*
 * La barra fissa sta **fuori** da `#smooth-wrapper` — deve, per restare
 * ancorata alla finestra — quindi l'`inert` che copre la pagina dietro al menu
 * non la raggiunge. Senza questa riga, a pannello aperto i suoi due bottoni
 * resterebbero raggiungibili col tab da dietro a un dialogo modale.
 */
const stickyHeader = document.getElementById('sticky-header');

if (menu && toggle) {
  /** Lo stato va su tutti e due i bottoni: sono la stessa cosa, detta due volte. */
  const espanso = (value: boolean) => {
    for (const t of toggles) t.setAttribute('aria-expanded', String(value));
  };

  /** Chi ha aperto, per ridargli il fuoco quando si chiude. */
  let ultimo: HTMLElement = toggle;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timeline = reduced.matches ? fade(menu) : wipe(menu);
  let open = false;

  for (const t of toggles) {
    t.addEventListener('click', () => {
      ultimo = t;
      if (open) close();
      else show();
    });
  }
  closeButton?.addEventListener('click', close);

  // Esc chiude, ed e' l'unico tasto gestito: il resto della tastiera resta del
  // browser. La trappola del fuoco la fa `inert` sul resto della pagina, non un
  // ciclo di keydown scritto a mano che finirebbe per litigare con il tab.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) close();
  });

  timeline.eventCallback('onReverseComplete', () => {
    if (!open) menu.removeAttribute('data-open');
  });

  function show(): void {
    if (open) return;
    open = true;

    menu!.removeAttribute('inert');
    menu!.removeAttribute('aria-hidden');
    menu!.setAttribute('data-open', '');
    espanso(true);
    wrapper?.setAttribute('inert', '');
    stickyHeader?.setAttribute('inert', '');
    lock(true);

    timeline.timeScale(1).play();
    closeButton?.focus();
  }

  function close(): void {
    if (!open) return;
    open = false;

    // Per chi legge con la tastiera o con uno screen reader il menu e' chiuso
    // subito: l'uscita e' un fatto grafico, non un'attesa.
    menu!.setAttribute('inert', '');
    menu!.setAttribute('aria-hidden', 'true');
    espanso(false);
    wrapper?.removeAttribute('inert');
    stickyHeader?.removeAttribute('inert');
    lock(false);

    // Il fuoco torna dove era prima, e solo dopo che il resto della pagina ha
    // smesso di essere inerte: su un elemento inerte focus() non fa niente.
    // "Dove era prima" e' il bottone che ha aperto, non sempre quello di
    // pagina: chi ha premuto quello della barra si ritroverebbe il fuoco in
    // cima al documento, cioe' da un'altra parte.
    ultimo.focus();

    // Si esce piu' in fretta di quanto si entri: chiudere e' un comando, e un
    // comando non si fa aspettare.
    timeline.timeScale(1 / MENU.exitScale).reverse();
  }
}

/**
 * La tendina, costruita una volta e ferma sul primo fotogramma.
 *
 * I `fromTo` si applicano gia' alla creazione: il pannello e' fuori campo e il
 * contenuto trasparente da subito, quindi all'apertura non esiste un fotogramma
 * in cui il menu sia gia' a posto.
 */
function wipe(menu: HTMLElement): gsap.core.Timeline {
  const panel = menu.querySelector<HTMLElement>('.megamenu__panel');
  const inner = menu.querySelector<HTMLElement>('.megamenu__inner');
  const blocks = gsap.utils.toArray<HTMLElement>('.block', menu);

  /*
   * Il bottone in alto a destra e' l'unica cosa che non cambia.
   *
   * Occupa la stessa cella della hamburger di pagina, e la tendina entrando da
   * destra lo scopre per primo: resta li' dov'era, a opacita' piena dal primo
   * fotogramma, mentre l'icona si trasforma in X. Tutto il resto della pagina
   * viene coperto, lui no. Per questo e' fuori dalla dissolvenza.
   */
  const fading = blocks.filter((block) => !block.classList.contains('menu-close'));
  // Fuori dalla dissolvenza e **anche** dal giro del filo: quel quadrato non si
  // costruisce sotto gli occhi di chi guarda, e' gia' fatto.
  const ruled = fading.filter((block) => block.dataset.surface === 'line');

  clearRules(ruled);

  const tl = gsap.timeline({ paused: true, defaults: { ease: MENU.ease } });

  tl.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: MENU.wipe }, 0);
  // La contro-traslazione: stessa larghezza, segno opposto, stessa curva.
  tl.fromTo(inner, { xPercent: -100 }, { xPercent: 0, duration: MENU.wipe }, 0);

  tl.fromTo(
    fading,
    { opacity: 0 },
    { opacity: 1, duration: MENU.fade, stagger: MENU.stagger, ease: 'none' },
    MENU.contentAt,
  );

  // Un giro di filo per blocco, sfalsati come le linee di pagina.
  ruled.forEach((block, i) => {
    tl.add(
      traceRules(block, { duration: DURATION.trace, ease: EASE.rule }),
      MENU.contentAt + i * DURATION.ruleStagger,
    );
  });

  return tl;
}

/** Sotto reduced motion: la sola dissolvenza, niente che si sposti. */
function fade(menu: HTMLElement): gsap.core.Timeline {
  const panel = menu.querySelector<HTMLElement>('.megamenu__panel');
  return gsap
    .timeline({ paused: true })
    .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: MENU.reducedFade, ease: 'none' });
}

/**
 * Il blocco dello scroll.
 *
 * Con lo scroll morbido attivo lo ferma ScrollSmoother, che e' chi lo governa.
 * Senza — sotto reduced motion, o se GSAP non arriva — si torna a `overflow:
 * hidden` sull'elemento radice, che non fa saltare niente perche' la scrollbar
 * di sistema e' nascosta e non occupa larghezza (vedi tokens.css).
 */
function lock(locked: boolean): void {
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.paused(locked);
    return;
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
