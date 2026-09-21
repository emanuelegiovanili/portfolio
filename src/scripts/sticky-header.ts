/**
 * La barra fissa compare quando l'header e' passato.
 *
 * Un IntersectionObserver sul blocco dell'header, non lo scroll: la domanda e'
 * "l'header si vede ancora?", e quella e' la domanda che un observer risponde
 * senza contare pixel. Funziona identico con lo scroll morbido e senza, perche'
 * guarda la posizione dipinta e non `window.scrollY` — che con ScrollSmoother
 * sono due cose diverse (NOTES.md D122).
 *
 * `rootMargin` negativo di una riga: la barra non entra nell'istante in cui
 * l'ultimo pixel dell'header esce, ma quando se n'e' andato per davvero.
 * Altrimenti a ogni micro-rimbalzo dello scroll morbido attorno a quel confine
 * la barra lampeggerebbe.
 *
 * Senza JavaScript la barra resta nascosta e non manca niente: i due comandi
 * ci sono in cima alla pagina, e il footer ha tutta la navigazione.
 */

const bar = document.getElementById('sticky-header');
/* Il bottone menu dell'header, che e' l'ultimo blocco dell'header a uscire:
   finche' si vede lui, l'header c'e'. */
const sentinella = document.getElementById('menu-toggle');

if (bar && sentinella && 'IntersectionObserver' in window) {
  const osserva = new IntersectionObserver(
    ([voce]) => {
      if (voce.isIntersecting) bar.removeAttribute('data-shown');
      else bar.setAttribute('data-shown', '');
    },
    { threshold: 0, rootMargin: '0px' },
  );

  osserva.observe(sentinella);
}
