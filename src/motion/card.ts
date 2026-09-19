/**
 * Il titolo e le categorie di una card progetto, che spuntano dal basso.
 *
 * I riquadri stanno appoggiati al fondo della card (265:1075) e sono blocchi
 * bordati a tutti gli effetti: un riquadro per il titolo e uno per ciascuna
 * categoria, larghi un numero intero di celle. Salgono in sequenza — prima il
 * titolo, poi le categorie nell'ordine in cui stanno — da sotto il bordo della
 * card.
 *
 * La maschera e' il contenitore, che non si muove: sono i riquadri a traslare
 * dentro di lui. Nessun blocco della griglia si sposta, e la card resta dov'e'.
 *
 * Due momenti in cui parte:
 *
 *   - quando la card arriva nella vista, come tutto il resto del sito;
 *   - quando una slide del carosello diventa quella attiva, perche' li' la card
 *     e' nuova e si compone davanti a chi guarda.
 *
 * Le timeline sono una per card e vivono in una WeakMap: la stessa card puo'
 * tornare attiva piu' volte, e ricostruirla ogni volta vorrebbe dire rimisurare
 * e ripartire da uno stato sporco.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CARD } from './tokens';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const timelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
let pending: gsap.core.Tween | null = null;

/** Il gruppo dei riquadri di una card, se ce l'ha. */
function metaOf(card: ParentNode): HTMLElement | null {
  return card.querySelector<HTMLElement>('.works-card__tags');
}

function timelineFor(meta: HTMLElement): gsap.core.Timeline {
  const existing = timelines.get(meta);
  if (existing) return existing;

  const boxes = [...meta.children] as HTMLElement[];
  const tl = gsap
    .timeline({ paused: true })
    .fromTo(
      boxes,
      { yPercent: 100 },
      { yPercent: 0, duration: CARD.rise, ease: CARD.ease, stagger: CARD.stagger },
    );

  timelines.set(meta, tl);
  return tl;
}

/**
 * Prepara tutte le card in pagina e le fa salire quando arrivano nella vista.
 *
 * Sta dentro al contesto del movimento: sotto reduced motion non viene
 * chiamata, e i riquadri sono dove il CSS li mette, cioe' al loro posto.
 */
export function revealCards(root: ParentNode = document): void {
  const metas = [...root.querySelectorAll<HTMLElement>('.works-card__tags')];
  if (metas.length === 0) return;

  for (const meta of metas) {
    const tl = timelineFor(meta);
    // La slide nascosta di un carosello non ha misure: la sua timeline parte
    // quando diventa attiva, non quando la pagina scorre.
    if (meta.closest('[data-slide]')?.hasAttribute('hidden')) continue;

    /*
     * Il trigger sta sul **gruppo dei riquadri**, non sulla card.
     *
     * I riquadri sono appoggiati al fondo della card, e una card e' alta cinque
     * celle: con il trigger sul suo bordo alto l'animazione partiva quando i
     * riquadri erano ancora quattrocento pixel sotto la piega, e finiva prima
     * che diventassero visibili. Misurato, non dedotto. E' lo stesso errore di
     * D59, che li' riguardava il filo.
     *
     * `bottom bottom` fa partire il giro quando il gruppo e' entrato per
     * intero: e' il primo istante in cui c'e' qualcosa da vedere.
     */
    ScrollTrigger.create({
      trigger: meta,
      start: 'bottom bottom',
      once: true,
      onEnter: () => tl.play(0),
    });
  }
}

/**
 * Rigioca i riquadri dentro `root`: lo usa il carosello a ogni cambio slide.
 *
 * `delay` serve a farli salire **dopo** che la slide ha finito di entrare. Senza,
 * salivano mentre la slide era ancora in viaggio da destra: l'animazione c'era
 * e non si vedeva, perche' succedeva fuori dallo schermo o su un'immagine che
 * si stava ancora spostando.
 */
export function playCardMeta(root: ParentNode, delay = 0): void {
  if (reduced.matches) return;
  const meta = metaOf(root);
  if (!meta) return;

  // `invalidate` rimisura la percentuale: la timeline di una slide nasce mentre
  // la slide e' `hidden`, e li' l'altezza e' zero — cioe' il 100% da cui i
  // riquadri dovrebbero salire varrebbe zero pixel. Il `pause(0)` subito dopo
  // li rimanda sotto la maschera mentre la slide viaggia.
  const tl = timelineFor(meta).invalidate().pause(0);

  // Un solo appuntamento alla volta: due comandi rapidi non devono accavallarsi.
  pending?.kill();
  pending = gsap.delayedCall(delay, () => tl.play(0));
}
