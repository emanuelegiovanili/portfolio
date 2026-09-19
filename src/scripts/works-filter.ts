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
 */

interface WorksFilter {
  stop(): void;
}

export function startWorksFilter(root: ParentNode = document): WorksFilter | null {
  const grid = root.querySelector<HTMLElement>('.works-grid');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('.work-filter')];
  if (!grid || buttons.length === 0) return null;

  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const lines = [...grid.querySelectorAll<HTMLElement>('.grid-line--h')];

  /*
   * L'ultima linea orizzontale sta **dentro** l'ultima riga, non sotto: e' la
   * regola dei bordi di griglia (grid.css). Cambiando il numero di righe va
   * spostata, quindi il suo `--at` originale non si puo' rileggere dopo la
   * prima volta e si tiene da parte.
   */
  const edge = lines.find((line) => line.hasAttribute('data-edge'));
  const atOf = new Map(lines.map((line) => [line, Number(line.style.getPropertyValue('--at'))]));

  /**
   * Una card si vede in uno stato se il build le ha dato una riga per quello
   * stato. Non serve sapere che tag ha: la domanda e' gia' stata risposta.
   */
  const shownIn = (card: HTMLElement, slug: string) =>
    card.style.getPropertyValue(`--row-${slug}`).trim() !== '';

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
      if (line === edge) continue;
      line.hidden = (atOf.get(line) ?? 0) > rows;
    }
    edge?.style.setProperty('--at', String(rows));

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

  return {
    stop() {
      for (const button of buttons) button.removeEventListener('click', onClick);
      apply('all');
    },
  };
}
