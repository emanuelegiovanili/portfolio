/**
 * "Continua a leggere" sulla pagina di un progetto.
 *
 * ---------------------------------------------------------------------------
 * COSA FA, E PERCHE' NON LO PUO' FARE IL SOLO CSS
 *
 * A base il testo del caso studio non ci sta nelle dieci righe che il blocco
 * ha: ne chiede da diciassette a ventisei, a seconda del progetto e della
 * lingua. Il comando apre il `<details>`, e da li' in poi **il blocco cresce**
 * e tutto quello che sta sotto scende: galleria, footer, fondo pagina.
 *
 * Di quanto cresce non lo sa il CSS, perche' dipende da quante righe occupa
 * quel testo a quella larghezza con quel font: un numero che esiste solo dopo
 * che il browser ha impaginato. Questo modulo lo misura una volta, lo scrive
 * come `--espansione-aperta` sulla griglia, e il resto lo fa `pages.css` con
 * un `calc` sulla riga che ogni blocco ha gia' — lo stesso meccanismo del
 * filtro di /works.
 *
 * **Prima scorreva dentro al blocco** (D145). Era una scelta mia, dichiarata
 * come tale, e il committente l'ha bocciata: "non espande il blocco intero ma
 * solo il testo dentro, e' errato". Vedi D152.
 *
 * SENZA JAVASCRIPT
 *
 * `--espansione-aperta` non viene scritta, `var(--espansione-aperta, 0)` vale
 * zero e aprire non allunga niente: il testo torna a scorrere dentro al
 * blocco, che e' il comportamento di prima. Il comando resta utile, la pagina
 * resta leggibile, e nessun blocco finisce fuori dalla griglia.
 *
 * LE LINEE
 *
 * La pagina cresce di N righe, e ogni riga nuova vuole la sua linea
 * orizzontale: senza, la meta' bassa della pagina resta senza griglia mentre i
 * blocchi ci cadono sopra. Le linee in piu' si creano qui e stanno spente
 * finche' il blocco e' chiuso — accese, cadrebbero oltre `--rows` e
 * creerebbero righe implicite alte un pixel l'una. E la linea di bordo del
 * gruppo base/md si sposta al nuovo fondo pagina, come fa il filtro di /works
 * (D144).
 * ---------------------------------------------------------------------------
 */

interface WorkBody {
  stop(): void;
}

export function startWorkBody(root: ParentNode = document): WorkBody | null {
  const grid = root.querySelector<HTMLElement>('.work-grid');
  const dettagli = root.querySelector<HTMLDetailsElement>('.work-body__more');
  const blocco = root.querySelector<HTMLElement>('.work-body');
  const testo = root.querySelector<HTMLElement>('.work-body__text');
  const linee = root.querySelector<HTMLElement>('.work-grid .grid-lines');
  if (!grid || !dettagli || !blocco || !testo || !linee) return null;

  /*
   * La linea che chiude la pagina, per il gruppo che contiene il tier base.
   *
   * Al singolare qui, ma i gruppi sono due (base+md e lg) e ognuno ha la sua:
   * spostare quella sbagliata vorrebbe dire chiudere la pagina a desktop in un
   * punto in cui non finisce. E' lo stesso inciampo di D144.
   */
  const bordo =
    [...grid.querySelectorAll<HTMLElement>('.grid-line--h[data-edge]')].find((linea) =>
      (linea.dataset.show ?? '').split(' ').includes('base'),
    ) ?? null;
  const bordoAt = bordo ? Number(bordo.style.getPropertyValue('--at')) : 0;
  const mostra = bordo?.dataset.show ?? 'base md';

  const extra: HTMLElement[] = [];
  let espansione = 0;
  let righeBase = 0;

  /**
   * Quanto sarebbe alto il testo se niente lo contenesse.
   *
   * Su una copia, e non allentando il vincolo sull'originale: il blocco e'
   * dentro la griglia, e un'altezza libera anche per un solo fotogramma e' un
   * fotogramma in cui i bordi non cadono sulle linee. E' la stessa trappola
   * delle schede della ricetta (D38): misurare cambiando cio' che si misura.
   */
  const altezzaNaturale = (): number => {
    const copia = testo.cloneNode(true) as HTMLElement;
    copia.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;height:auto;max-height:none;overflow:visible;';
    copia.style.width = `${testo.clientWidth}px`;
    testo.parentElement?.appendChild(copia);
    const alto = copia.scrollHeight;
    copia.remove();
    return alto;
  };

  /** Le linee in piu', una per riga guadagnata. */
  const sincronizzaLinee = () => {
    while (extra.length > espansione) extra.pop()?.remove();
    while (extra.length < espansione) {
      const linea = document.createElement('i');
      linea.className = 'grid-line grid-line--h';
      linea.dataset.show = mostra;
      linea.dataset.extra = '';
      linee.appendChild(linea);
      extra.push(linea);
    }
    extra.forEach((linea, i) => linea.style.setProperty('--at', String(righeBase + i + 1)));
  };

  const misura = () => {
    const stileGriglia = getComputedStyle(grid);
    const cella = parseFloat(stileGriglia.getPropertyValue('--cell'));
    righeBase = Number(stileGriglia.getPropertyValue('--rows-base'));

    const stileBlocco = getComputedStyle(blocco);
    const righe = Number(stileBlocco.getPropertyValue('--r-base'));
    const padding =
      parseFloat(stileBlocco.paddingTop) + parseFloat(stileBlocco.paddingBottom);
    if (!Number.isFinite(cella) || cella <= 0 || !Number.isFinite(righe) || righe <= 0) return;

    /*
     * Lo spazio utile e' quello del blocco **aperto**, dove il comando non c'e'
     * piu': se lo contassi, chiederei una riga in piu' del necessario a ogni
     * apertura.
     */
    const dentro = righe * cella - padding;
    const mancano = altezzaNaturale() - dentro;
    espansione = mancano > 1 ? Math.ceil(mancano / cella) : 0;

    grid.style.setProperty('--espansione-aperta', String(espansione));
    blocco.dataset.espandibile = espansione > 0 ? 'si' : 'no';
    sincronizzaLinee();
  };

  const aggiorna = (avvisa: boolean) => {
    const aperto = dettagli.open && espansione > 0;
    if (aperto) grid.dataset.testoAperto = '';
    else delete grid.dataset.testoAperto;
    if (bordo) {
      bordo.style.setProperty('--at', String(aperto ? righeBase + espansione : bordoAt));
    }
    /*
     * I fili dei blocchi sono agganciati allo scroll, e meta' pagina si e'
     * appena spostata. Un evento di ridimensionamento e non un import di
     * ScrollTrigger, per la stessa ragione del filtro di /works: questo modulo
     * non deve sapere che il movimento esiste. Non si manda mentre si sta
     * gia' rispondendo a un ridimensionamento, o sarebbe un giro infinito.
     */
    if (avvisa) window.dispatchEvent(new Event('resize'));
  };

  const onToggle = () => aggiorna(true);
  const onResize = () => {
    misura();
    aggiorna(false);
  };

  dettagli.addEventListener('toggle', onToggle);
  window.addEventListener('resize', onResize);

  misura();
  aggiorna(false);

  /* Il corpo e' in Poppins con `font-display: swap`: finche' arriva, il testo
     e' impaginato col ripiego e va a capo in posti diversi. */
  document.fonts?.ready.then(() => {
    misura();
    aggiorna(false);
  });

  return {
    stop() {
      dettagli.removeEventListener('toggle', onToggle);
      window.removeEventListener('resize', onResize);
      espansione = 0;
      sincronizzaLinee();
      aggiorna(false);
      grid.style.removeProperty('--espansione-aperta');
      delete blocco.dataset.espandibile;
    },
  };
}
