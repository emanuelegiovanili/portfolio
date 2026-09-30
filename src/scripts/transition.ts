/**
 * Il sipario fra una pagina e l'altra.
 *
 * Al click su un link interno un pannello sale dal basso a coprire; quando ha
 * coperto parte la navigazione vera. La pagina nuova arriva gia' coperta —
 * glielo dice uno script in `<head>`, vedi `Base.astro` — e il sipario esce
 * dall'alto. Il caricamento sta nascosto dentro la copertura.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' NON IL ROUTER DI ASTRO
 *
 * `<ClientRouter />` darebbe la transizione senza ricaricare, ma vorrebbe dire
 * rifare a ogni cambio pagina ScrollSmoother, ScrollTrigger, il giro dei fili,
 * la barra fissa, il carosello e i testimonial. E' tutto il sistema di
 * movimento del sito, ed e' verificato com'e'. Qui la navigazione resta quella
 * del browser e ogni pagina si inizializza una volta sola, come sempre: il
 * sipario non sa niente di routing, copre e scopre.
 * ---------------------------------------------------------------------------
 *
 * Tre cose che non sono dettagli:
 *
 * - **Senza JavaScript non c'e' sipario.** Il pannello sta sotto la finestra
 *   per default e i link sono link. Il ripiego in `<head>` lo alza comunque
 *   dopo `SIPARIO.soccorso` millisecondi, cosi' un modulo che non arriva
 *   lascia una pagina coperta per un secondo e mezzo, non per sempre.
 * - **`prefers-reduced-motion` lo spegne del tutto**, in entrata e in uscita, e
 *   si legge al momento del click: chi cambia impostazione a pagina aperta non
 *   deve ricaricare per essere ascoltato.
 * - **Il ritorno indietro lo toglie.** Con la cache di navigazione la pagina
 *   torna com'era, cioe' col sipario calato sopra: `pageshow` lo rimette giu'.
 */

import gsap from 'gsap';
import { SIPARIO } from '../motion/tokens';

const sipario = document.querySelector<HTMLElement>('.sipario');
const radice = document.documentElement;

const fermo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Rimette il pannello sotto la finestra, senza animare. */
function abbassa(): void {
  delete radice.dataset.sipario;
  if (sipario) gsap.set(sipario, { clearProps: 'transform' });
}

if (sipario) {
  let inCorso = false;

  /*
   * L'ingresso. Lo stato di partenza non lo mette questo modulo: il pannello e'
   * gia' a coprire per via dell'attributo sull'elemento radice, quindi lo
   * `yPercent` letto qui e' zero e l'animazione va da li' in su, senza il
   * fotogramma di assestamento che darebbe un `fromTo`.
   */
  if (radice.dataset.sipario === 'entra' && !fermo()) {
    gsap.to(sipario, {
      yPercent: -100,
      y: 0,
      duration: SIPARIO.reveal,
      ease: SIPARIO.ease,
      onComplete: abbassa,
    });
  } else {
    abbassa();
  }

  /** Il link porta a un'altra pagina di questo sito, e il click e' un click normale? */
  function daCoprire(evento: MouseEvent, collegamento: HTMLAnchorElement): boolean {
    // Un click con un modificatore apre altrove: e' del browser, non nostro.
    if (evento.defaultPrevented || evento.button !== 0) return false;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return false;
    if (collegamento.hasAttribute('download')) return false;
    if (collegamento.target && collegamento.target !== '_self') return false;

    const meta = new URL(collegamento.href, location.href);
    if (meta.origin !== location.origin) return false;
    if (meta.protocol !== 'http:' && meta.protocol !== 'https:') return false;

    // Un'ancora interna non cambia pagina: la copre lo scroll morbido, non
    // questo. Comprende il caso `href="#mix"` della home.
    const stessaPagina = meta.pathname === location.pathname && meta.search === location.search;
    if (stessaPagina) return false;

    return true;
  }

  document.addEventListener('click', (evento) => {
    if (inCorso || fermo()) return;
    const bersaglio = evento.target;
    if (!(bersaglio instanceof Element)) return;
    const collegamento = bersaglio.closest('a[href]');
    if (!(collegamento instanceof HTMLAnchorElement)) return;
    if (!daCoprire(evento, collegamento)) return;

    evento.preventDefault();
    inCorso = true;
    const dove = collegamento.href;

    /*
     * Il segnale alla pagina successiva. `sessionStorage` e non un parametro
     * nell'indirizzo: l'indirizzo e' quello che l'utente copia e mette nei
     * preferiti, e non deve portarsi dietro lo stato di una transizione.
     * Puo' lanciare — modalita' privata, cookie di terze parti bloccati — e in
     * quel caso la pagina nuova arriva scoperta: si perde l'uscita del
     * sipario, non la navigazione.
     */
    try {
      sessionStorage.setItem('sipario', '1');
    } catch {
      /* Pazienza: si copre e basta. */
    }

    radice.dataset.sipario = 'esce';
    /*
     * `y: 0` non e' decorativo, ed e' costato un giro intero.
     *
     * Il riposo del pannello e' `transform: translateY(100%)` scritto nel CSS.
     * GSAP quel 100% lo legge come **novecento pixel** e se lo tiene da parte,
     * poi ci somma la percentuale che anima: l'inline diventa
     * `translate(0%, 98%) translate3d(0px, 900px, 0px)`, cioe' il sipario
     * scendeva da 200% a 100% e non copriva mai niente. A schermo: un click che
     * aspetta mezzo secondo e poi cambia pagina di colpo.
     *
     * Azzerare `y` in tutti e due gli estremi toglie di mezzo quel residuo e
     * lascia comandare la sola percentuale.
     */
    gsap.fromTo(
      sipario,
      { yPercent: 100, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: SIPARIO.cover,
        ease: SIPARIO.ease,
        onComplete: () => {
          location.href = dove;
        },
      },
    );
  });

  /*
   * Tornando indietro la pagina puo' arrivare dalla cache **com'era**, cioe'
   * col sipario calato sopra e `inCorso` a vero: senza questo, si torna su una
   * schermata piena del colore di pagina che non se ne va piu'.
   */
  window.addEventListener('pageshow', (evento) => {
    if (!evento.persisted) return;
    inCorso = false;
    abbassa();
  });
}
