/**
 * La riga dei testimonial (266:1148).
 *
 * E' un `tablist`: ogni cliente e' una scheda, e il pannello sotto mostra la
 * citazione di quella selezionata. Il testo delle schede sta negli attributi
 * della scheda stessa, non in un secondo pacchetto di dati spedito a parte: al
 * server la lista la conosce gia' Astro, e al client serve solo poterla
 * rileggere.
 *
 * **Oggi ha un solo cliente selezionabile.** Il Figma mostra quattro nomi e una
 * citazione sola, e le altre tre non esistono da nessuna parte nel file
 * (NOTES.md B13): quelle schede ci sono ma sono disabilitate. Questo modulo e'
 * scritto per quando i testi arriveranno, e finche' non arrivano non fa niente
 * di visibile.
 *
 * La barra sotto la scheda attiva e' il conto alla rovescia dell'avanzamento
 * automatico — nel file e' a tre quarti, che e' un fermo-immagine a meta'
 * corsa. Parte solo se c'e' piu' di una scheda da mostrare: con una sola non
 * c'e' nessun avanzamento da annunciare, e la barra resta piena.
 *
 * Come il carosello, sta fuori dal contesto del movimento: scegliere una
 * scheda e' un comando. Sotto `prefers-reduced-motion: reduce` il cambio e'
 * istantaneo e l'avanzamento automatico non parte, perche' li' un contenuto
 * che si muove da solo e' proprio quello che si vuole evitare.
 */

import gsap from 'gsap';
import { TESTIMONIAL } from './tokens';

export interface Testimonials {
  stop(): void;
}

export function startTestimonials(root: ParentNode = document): Testimonials | null {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-testimonial]')];
  const panel = root.querySelector<HTMLElement>('#testimonial-panel');
  if (tabs.length === 0 || !panel) return null;

  const quote = panel.querySelector<HTMLElement>('[data-testimonial-quote]');
  const author = panel.querySelector<HTMLElement>('[data-testimonial-author]');
  const role = panel.querySelector<HTMLElement>('[data-testimonial-role]');

  const prev = root.querySelector<HTMLButtonElement>('[data-testimonial-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-testimonial-next]');

  /** Solo le schede che un testo ce l'hanno: le altre non sono raggiungibili. */
  const usable = tabs.filter((tab) => !tab.disabled);
  if (usable.length === 0) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const auto = usable.length > 1 && !reduced.matches;

  let current = Math.max(0, usable.indexOf(tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? usable[0]));
  let fade: gsap.core.Timeline | null = null;
  let countdown: gsap.core.Tween | null = null;

  const barOf = (tab: HTMLElement) => tab.querySelector<HTMLElement>('.testimonial-tab__progress');

  const sync = () => {
    for (const tab of tabs) {
      const selected = tab === usable[current];
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    }
    if (prev) prev.disabled = usable.length < 2;
    if (next) next.disabled = usable.length < 2;
    panel.setAttribute('aria-labelledby', usable[current].id);
  };

  /** La barra: conto alla rovescia se si avanza da soli, piena se no. */
  const restartBar = () => {
    countdown?.kill();
    for (const tab of tabs) {
      const bar = barOf(tab);
      if (bar) gsap.set(bar, { scaleX: tab === usable[current] && !auto ? 1 : 0 });
    }
    if (!auto) return;
    const bar = barOf(usable[current]);
    if (!bar) return;
    countdown = gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, duration: TESTIMONIAL.dwell, ease: 'none', onComplete: () => show(current + 1) },
    );
  };

  const show = (index: number) => {
    const target = ((index % usable.length) + usable.length) % usable.length;
    if (target === current && fade) return;

    current = target;
    const tab = usable[current];

    fade?.kill();
    const swap = () => {
      if (quote) quote.textContent = tab.dataset.quote ?? '';
      if (author) author.textContent = tab.dataset.author ?? '';
      if (role) role.textContent = tab.dataset.role ?? '';
      sync();
    };

    if (reduced.matches) {
      swap();
      restartBar();
      return;
    }

    fade = gsap
      .timeline({ onComplete: () => (fade = null) })
      .to(panel, { opacity: 0, duration: TESTIMONIAL.fade, ease: 'none' })
      .add(swap)
      .to(panel, { opacity: 1, duration: TESTIMONIAL.fade, ease: 'none' });

    restartBar();
  };

  const onTab = (event: Event) => {
    const tab = (event.currentTarget as HTMLButtonElement) ?? null;
    const index = usable.indexOf(tab);
    if (index >= 0) show(index);
  };

  /*
   * Frecce da tastiera, come chiede il pattern `tablist`.
   *
   * Solo fra le schede raggiungibili: portare il fuoco su una disabilitata
   * sarebbe un vicolo cieco.
   */
  const onKey = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    show(current + step);
    usable[current].focus();
  };

  for (const tab of usable) {
    tab.addEventListener('click', onTab);
    tab.addEventListener('keydown', onKey);
  }
  const onPrev = () => show(current - 1);
  const onNext = () => show(current + 1);
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);

  sync();
  restartBar();

  return {
    stop() {
      for (const tab of usable) {
        tab.removeEventListener('click', onTab);
        tab.removeEventListener('keydown', onKey);
      }
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      fade?.kill();
      countdown?.kill();
      gsap.set(panel, { opacity: 1 });
    },
  };
}
