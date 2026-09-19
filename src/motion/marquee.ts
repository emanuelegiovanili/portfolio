/**
 * Il marquee che scorre (250:196, layer "Marquee autoscroll").
 *
 * Il file lo chiama autoscroll ma non dice a che velocita' ne' con che
 * spaziatura: a 1440 mette le cinque parole distribuite sull'intera larghezza,
 * che e' una composizione ferma. Qui la composizione ferma resta il punto di
 * partenza, e il movimento la fa scorrere senza cambiarla.
 *
 * Il trucco e' tutto nel passo. Si misura quanto spazio avanza fra le parole
 * quando un solo giro riempie esattamente il contenitore, e quello diventa il
 * gap: da fermo si vede la distribuzione del Figma, e in movimento la sequenza
 * si ripete senza salti, perche' il ciclo e' largo quanto il contenitore.
 *
 * Le copie servono a coprire il vuoto che il primo giro lascia dietro di se'.
 * Sono `aria-hidden`: la lista da leggere e' una sola.
 */

import gsap from 'gsap';
import { MARQUEE } from './tokens';

export interface Marquee {
  /** Rimette il marquee com'era: niente tween, niente copie, niente listener. */
  stop(): void;
}

export function startMarquee(root: ParentNode = document): Marquee | null {
  const bleed = root.querySelector<HTMLElement>('.marquee__bleed');
  const track = bleed?.querySelector<HTMLElement>('.marquee__track');
  if (!bleed || !track) return null;

  const originals = [...track.children] as HTMLElement[];
  if (originals.length === 0) return null;

  let tween: gsap.core.Tween | null = null;
  let pending = 0;

  const build = () => {
    tween?.kill();
    gsap.set(track, { x: 0 });
    for (const clone of track.querySelectorAll('[data-clone]')) clone.remove();

    const style = getComputedStyle(bleed);
    const avail = bleed.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const content = originals.reduce((total, item) => total + item.offsetWidth, 0);

    /*
     * Il passo: quel che avanza, diviso per il numero di parole.
     *
     * Si divide per `n` e non per `n - 1` come farebbe `space-between`: un
     * passo in piu' serve fra l'ultima parola di un giro e la prima del giro
     * dopo, altrimenti la sequenza si incolla a se' stessa. E' uno scarto di
     * qualche pixel sulla distribuzione ferma, e in cambio il ciclo e' largo
     * quanto il contenitore.
     *
     * Se le parole non ci stanno gia' — succede a base, dove la cella e' 39px —
     * il passo resta quello di riposo e il ciclo e' piu' largo dello schermo.
     */
    const gap = Math.max(MARQUEE.minGap, (avail - content) / originals.length);
    const cycle = content + gap * originals.length;

    track.style.setProperty('--marquee-gap', `${gap}px`);
    track.dataset.running = '';

    // Copie finche' il giro che esce a sinistra non e' rimpiazzato da quello
    // che entra a destra. Il `+ 1` copre l'arrotondamento dell'ultimo pixel.
    while (track.scrollWidth < avail + cycle + 1) {
      for (const item of originals) {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.dataset.clone = '';
        clone.setAttribute('aria-hidden', 'true');
        track.append(clone);
      }
    }

    tween = gsap.to(track, {
      x: -cycle,
      // Velocita' costante in pixel al secondo: la durata la detta la larghezza,
      // cosi' su uno schermo largo non scorre piu' in fretta.
      duration: cycle / MARQUEE.speed,
      ease: 'none',
      repeat: -1,
    });
  };

  build();

  // Al ridimensionamento cambiano sia lo spazio disponibile sia la dimensione
  // del testo, che scala con la cella: i conti si rifanno da capo.
  const onResize = () => {
    window.clearTimeout(pending);
    pending = window.setTimeout(build, 150);
  };
  window.addEventListener('resize', onResize);

  /*
   * Si ferma sotto al puntatore e quando qualcosa dentro prende il fuoco.
   *
   * Non e' nel Figma: e' il requisito 2.2.2 delle WCAG, che su un contenuto in
   * movimento automatico piu' lungo di cinque secondi chiede un modo per
   * metterlo in pausa. Qui il modo e' fermarcisi sopra.
   */
  const pause = () => tween?.pause();
  const resume = () => tween?.play();
  bleed.addEventListener('mouseenter', pause);
  bleed.addEventListener('mouseleave', resume);
  bleed.addEventListener('focusin', pause);
  bleed.addEventListener('focusout', resume);

  return {
    stop() {
      window.clearTimeout(pending);
      window.removeEventListener('resize', onResize);
      bleed.removeEventListener('mouseenter', pause);
      bleed.removeEventListener('mouseleave', resume);
      bleed.removeEventListener('focusin', pause);
      bleed.removeEventListener('focusout', resume);
      tween?.kill();
      gsap.set(track, { x: 0 });
      for (const clone of track.querySelectorAll('[data-clone]')) clone.remove();
      track.style.removeProperty('--marquee-gap');
      delete track.dataset.running;
    },
  };
}
