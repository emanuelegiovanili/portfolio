/**
 * Il carosello Selected Works (265:1044).
 *
 * Le slide stanno tutte nel markup, una sopra l'altra, e quelle non in vista
 * sono `hidden`: senza JavaScript si vede la prima e le altre non esistono
 * nemmeno per lo screen reader, che e' il comportamento giusto per un
 * contenuto che non si puo' raggiungere.
 *
 * **Non gira in tondo.** Il file mostra una paginazione "1/5" e due frecce: un
 * contatore che dice a che punto sei ha senso se una fine c'e'. Ai capi la
 * freccia si disabilita, e l'animazione dell'icona non parte (`icons.ts`).
 *
 * La slide che esce e quella che entra scorrono insieme, nella direzione del
 * comando. Non e' un blocco che si muove — le slide sono contenuto dentro un
 * blocco che resta dov'e' — ma per sicurezza il ritaglio e' su un contenitore
 * proprio, senza il margine che i blocchi bordati concedono al filo.
 *
 * **Sta fuori dal contesto del movimento**, a differenza di tutto il resto:
 * cambiare slide e' un comando, non un'animazione, e deve funzionare anche
 * sotto `prefers-reduced-motion: reduce`. Li' lo scorrimento dura zero e la
 * slide cambia di colpo, che e' esattamente quello che quella preferenza
 * chiede.
 */

import gsap from 'gsap';
import { CAROUSEL } from './tokens';

export interface Carousel {
  stop(): void;
}

export function startCarousel(root: ParentNode = document): Carousel | null {
  const box = root.querySelector<HTMLElement>('[data-carousel]');
  if (!box) return null;

  const slides = [...box.querySelectorAll<HTMLElement>('[data-slide]')];
  if (slides.length < 2) return null;

  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const counter = root.querySelector<HTMLElement>('[data-carousel-current]');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let running: gsap.core.Timeline | null = null;

  const sync = () => {
    slides.forEach((slide, i) => {
      const shown = i === current;
      slide.setAttribute('aria-hidden', shown ? 'false' : 'true');
      slide.tabIndex = shown ? 0 : -1;
    });
    if (counter) counter.textContent = String(current + 1);
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === slides.length - 1;
  };

  const go = (target: number) => {
    if (target === current || target < 0 || target >= slides.length) return;
    // Un comando durante la transizione la manda a fondo corsa e poi riparte:
    // meglio un salto secco che due slide a meta' strada.
    running?.progress(1);

    const direction = target > current ? 1 : -1;
    const from = slides[current];
    const to = slides[target];

    to.hidden = false;
    gsap.set(to, { xPercent: 100 * direction });

    current = target;
    sync();

    running = gsap
      .timeline({
        defaults: { duration: reduced.matches ? 0 : CAROUSEL.slide, ease: CAROUSEL.ease },
        onComplete: () => {
          from.hidden = true;
          gsap.set(from, { xPercent: 0 });
          running = null;
        },
      })
      .to(from, { xPercent: -100 * direction }, 0)
      .to(to, { xPercent: 0 }, 0);
  };

  const onPrev = () => go(current - 1);
  const onNext = () => go(current + 1);
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);

  sync();

  return {
    stop() {
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      running?.kill();
      running = null;
      slides.forEach((slide, i) => {
        gsap.set(slide, { xPercent: 0 });
        slide.hidden = i !== current;
      });
    },
  };
}
