/**
 * I filtri di /works.
 *
 * **Filtrare cambia il layout, non solo la visibilita'.** Con meno card, tutto
 * quello che sta sotto sale di quattro righe per card nascosta e la pagina si
 * accorcia di altrettanto. Se le card sparissero e basta, resterebbero buchi da
 * otto righe in mezzo alla pagina.
 *
 * Qui non si calcola nessuna posizione. Le righe di ogni stato le ha gia'
 * scritte il build, come custom property: questo modulo sceglie **quale stato e'
 * attivo** e mette a posto le due cose che il CSS da solo non puo' fare — quali
 * card si vedono, e quante linee orizzontali disegnare.
 *
 * Senza JavaScript la pagina resta nello stato "All", che e' quello che il
 * markup dichiara: il filtro e' un comodo, non un prerequisito per vedere i
 * progetti.
 *
 * **Lo stato iniziale puo' arrivare dall'indirizzo**: `/works?filter=branding`.
 * Ci arrivano le tre card del "mix" in home, che da li' portano a /works gia'
 * ristretta al proprio ambito. Lo slug e' lo stesso che il build ha scritto sui
 * bottoni, e uno sconosciuto viene ignorato: la pagina resta su "All" invece di
 * mostrare zero progetti a chi ha sbagliato a copiare un link.
 */

interface WorksFilter {
  stop(): void;
}

const TIER = ['base', 'md', 'lg'] as const;

export function startWorksFilter(root: ParentNode = document): WorksFilter | null {
  const grid = root.querySelector<HTMLElement>('.works-grid');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('.work-filter')];
  if (!grid || buttons.length === 0) return null;

  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const lines = [...grid.querySelectorAll<HTMLElement>('.grid-line--h')];

  /*
   * Le ultime linee orizzontali stanno **dentro** l'ultima riga, non sotto: e'
   * la regola dei bordi di griglia (grid.css). Cambiando il numero di righe
   * vanno spostate, quindi il loro `--at` originale non si puo' rileggere dopo
   * la prima volta e si tiene da parte.
   *
   * Al plurale, e non e' un dettaglio: le linee sono in gruppi, uno per tier,
   * e **ogni gruppo ha la sua linea di bordo**. Finche' /works aveva il solo
   * disegno desktop ce n'era una e `find` bastava; col tier mobile ne sono
   * comparse altre due, e quella di md restava alla riga 72 dentro una griglia
   * che il filtro aveva accorciato a 60. La griglia restava allineata: mancava
   * solo la linea che chiude la pagina, e con lei il confine su cui il bordo
   * basso del footer doveva cadere. Vedi NOTES.md D144.
   */
  const edges = lines.filter((line) => line.hasAttribute('data-edge'));
  const atOf = new Map(lines.map((line) => [line, Number(line.style.getPropertyValue('--at'))]));

  /**
   * Una card si vede in uno stato se il build le ha dato una riga per quello
   * stato. Non serve sapere che tag ha: la domanda e' gia' stata risposta.
   *
   * Le righe sono **una per tier** da quando /works ha anche un disegno mobile,
   * quindi il nome porta il tier in coda. Cercando ancora `--row-<stato>` la
   * risposta era sempre "no" e il filtro nascondeva tutte le card: la griglia
   * restava impeccabile e la pagina vuota. Vedi NOTES.md D144.
   */
  const shownIn = (card: HTMLElement, slug: string) =>
    TIER.some((tier) => card.style.getPropertyValue(`--row-${slug}-${tier}`).trim() !== '');

  const apply = (slug: string) => {
    grid.dataset.filter = slug;

    for (const button of buttons) {
      button.setAttribute('aria-pressed', button.dataset.filter === slug ? 'true' : 'false');
    }
    for (const card of cards) card.hidden = !shownIn(card, slug);

    /*
     * Le linee oltre il nuovo fondo pagina vanno spente.
     *
     * `--rows` e' cambiato con lo stato, ma le linee restano quelle del markup:
     * una linea alla riga 29 dentro una griglia da 21 righe creerebbe otto
     * righe implicite e la pagina tornerebbe lunga come prima, con la meta'
     * inferiore vuota.
     */
    const rows = Number(getComputedStyle(grid).getPropertyValue('--rows'));
    if (!Number.isFinite(rows) || rows <= 0) return;

    for (const line of lines) {
      if (edges.includes(line)) continue;
      line.hidden = (atOf.get(line) ?? 0) > rows;
    }
    for (const bordo of edges) bordo.style.setProperty('--at', String(rows));

    /*
     * I fili dei blocchi sono agganciati allo scroll, e i blocchi si sono
     * appena spostati: le finestre d'ingresso vanno ricalcolate, altrimenti un
     * blocco salito di otto righe si disegna in base a dove stava prima.
     *
     * Un evento di ridimensionamento e non un import di ScrollTrigger: questo
     * modulo non deve sapere che il movimento esiste, e ScrollTrigger si
     * aggiorna da solo quando la finestra cambia.
     */
    window.dispatchEvent(new Event('resize'));
  };

  const onClick = (event: Event) => {
    const slug = (event.currentTarget as HTMLElement).dataset.filter;
    if (slug) apply(slug);
  };

  for (const button of buttons) button.addEventListener('click', onClick);

  /*
   * Lo stato d'apertura. `apply` si chiama solo se c'e' davvero qualcosa da
   * cambiare: su "All" il markup e' gia' a posto, e chiamarlo per niente
   * manderebbe un `resize` finto prima che il movimento abbia finito di
   * montarsi.
   */
  const wanted = new URLSearchParams(window.location.search).get('filter');
  if (wanted && wanted !== 'all' && buttons.some((button) => button.dataset.filter === wanted)) {
    apply(wanted);
  }

  return {
    stop() {
      for (const button of buttons) button.removeEventListener('click', onClick);
      apply('all');
    },
  };
}
