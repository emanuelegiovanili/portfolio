/**
 * La misura dell'invariante: i bordi dei blocchi cadono sulle linee?
 *
 * Una sola implementazione, usata sia dal pannello di /grid sia dallo script di
 * verifica in Playwright, cosi' non possono divergere.
 *
 * Il metodo non sa nulla della mappa di posizionamento, e questo e' il punto:
 * raccoglie le coordinate dei confini disegnati dalle linee visibili, poi per
 * ogni bordo di ogni blocco cerca il confine piu' vicino. Se il massimo di
 * quelle distanze e' zero, l'invariante regge; se cresce, si e' rotto qualcosa
 * a monte, qualunque cosa sia.
 */

/** Di quanto un blocco sfora, e su quale asse: senza questo non si sa cosa cambiare. */
export interface Overflow {
  block: string;
  dx: number;
  dy: number;
}

export interface GridProbeResult {
  tier: 'base' | 'md' | 'lg';
  cols: number;
  rows: number;
  cell: number;
  containerWidth: number;
  /** Distanza massima fra un bordo di blocco e il confine di griglia piu' vicino, in px CSS. */
  maxDrift: number;
  /** Il bordo che sbaglia di piu', per sapere dove guardare. */
  worst: { block: string; edge: string; delta: number } | null;
  /** Blocchi il cui contenuto esce dal proprio span, e di quanto. */
  overflowing: Overflow[];
  /** Gli sfori gia' presenti nel Figma, dichiarati sul blocco con `data-known-overflow`. */
  known: Overflow[];
  tolerance: number;
}

/**
 * Sotto questa soglia lo scarto e' rumore in virgola mobile di
 * getBoundingClientRect, non un disallineamento. Un pixel fisico su uno schermo
 * a densita' 3 vale 0,333px CSS: la soglia sta piu' di un ordine di grandezza
 * sotto, quindi non puo' mascherare un errore visibile.
 */
const TOLERANCE = 0.02;

/** Un elemento e' spento se una media query lo ha messo a display:none. */
function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

function nearest(value: number, candidates: number[]): number {
  let best = Infinity;
  for (const c of candidates) {
    const d = Math.abs(value - c);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Di quanto il contenuto esce dalla scatola del blocco.
 *
 * Sull'asse verticale si confrontano i rettangoli dei figli, non `scrollHeight`.
 * Il motivo e' `text-box-trim`: accorcia la scatola del titolo alla cap-height
 * ma le line box restano alte quanto il font, quindi `scrollHeight` conta
 * sempre lo scarto che il trim ha appena tolto e segnala uno sforo che non
 * esiste. Sull'asse orizzontale il trim non c'entra, e `scrollWidth` serve
 * comunque a intercettare una parola lunga che sborda dal proprio paragrafo.
 */
function measureOverflow(block: Element, rect: DOMRect, style: CSSStyleDeclaration): { dx: number; dy: number } {
  const top = rect.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
  const bottom = rect.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
  const left = rect.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
  const right = rect.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);

  let dx = Math.max(0, block.scrollWidth - Math.ceil(block.clientWidth));
  let dy = 0;
  for (const child of block.children) {
    const r = child.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    // Un figlio in posizione assoluta sta dove lo hai messo, anche fuori dal
    // box del contenuto: l'indicatore di voce attiva del footer copre di
    // proposito il padding fino al bordo.
    const position = getComputedStyle(child).position;
    if (position === 'absolute' || position === 'fixed') continue;
    dy = Math.max(dy, top - r.top, r.bottom - bottom);
    dx = Math.max(dx, left - r.left, r.right - right);
  }
  return { dx: Math.round(Math.max(0, dx)), dy: Math.round(Math.max(0, dy)) };
}

function labelOf(el: Element, index: number): string {
  const text = el.querySelector('.label')?.textContent?.trim();
  return text || el.className || `blocco ${index}`;
}

export function probeGrid(root: ParentNode = document): GridProbeResult | null {
  const grid = root.querySelector('.grid');
  if (!(grid instanceof HTMLElement)) return null;

  const style = getComputedStyle(grid);
  const cols = Number.parseInt(style.getPropertyValue('--cols').trim(), 10);
  const rows = Number.parseInt(style.getPropertyValue('--rows').trim(), 10);
  const containerWidth = grid.getBoundingClientRect().width;

  // Il confine e' il lato della cella, non il pixel in cui la linea e' dipinta:
  // l'ultima linea di ogni asse disegna il proprio bordo dal lato opposto per
  // restare dentro il contenitore, e confrontare i pixel dipinti darebbe un
  // falso scarto di 1px proprio sul bordo.
  const xs: number[] = [];
  const ys: number[] = [];
  for (const line of grid.querySelectorAll('.grid-line')) {
    if (!isVisible(line)) continue;
    const rect = line.getBoundingClientRect();
    const edge = line.hasAttribute('data-edge');
    if (line.classList.contains('grid-line--v')) xs.push(edge ? rect.right : rect.left);
    else ys.push(edge ? rect.bottom : rect.top);
  }

  let maxDrift = 0;
  let worst: GridProbeResult['worst'] = null;
  const overflowing: Overflow[] = [];
  const known: Overflow[] = [];

  // Solo i figli diretti: un blocco annidato dentro un contenitore flex non e'
  // un elemento di griglia, la sua posizione la decide il flex e confrontarla
  // con le linee non vuol dire niente.
  const blocks = [...grid.querySelectorAll(':scope > .block')].filter(isVisible);
  blocks.forEach((block, i) => {
    const rect = block.getBoundingClientRect();
    const name = labelOf(block, i);
    const checks: [string, number, number[]][] = [
      ['left', rect.left, xs],
      ['right', rect.right, xs],
      ['top', rect.top, ys],
      ['bottom', rect.bottom, ys],
    ];
    for (const [edge, value, candidates] of checks) {
      const delta = nearest(value, candidates);
      if (delta > maxDrift) {
        maxDrift = delta;
        worst = { block: name, edge, delta };
      }
    }
    // Un blocco marcato `data-bleed` ha un figlio che esce di proposito dal
    // proprio span, come il marquee: li' l'eccedenza e' il disegno, non un
    // errore. I suoi quattro bordi restano comunque misurati come tutti.
    // Un blocco marcato `data-bleed` esce di proposito dal proprio span, come
    // il marquee. Un contenitore che scorre pure: la riga dei testimonial a
    // base e' larga dodici celle dentro uno span da otto, ed e' il disegno.
    const style = getComputedStyle(block);
    const scrolls = /auto|scroll/.test(style.overflowX) || /auto|scroll/.test(style.overflowY);
    if (!block.hasAttribute('data-bleed') && !scrolls) {
      const over = measureOverflow(block, rect, style);
      if (over.dx > 0 || over.dy > 0) {
        // Un blocco che dichiara `data-known-overflow` sfora gia' nel Figma: il
        // motivo sta nell'attributo. Va visto, non va confuso con una
        // regressione, e non fa fallire la verifica.
        const entry = { block: name, ...over };
        if (block.hasAttribute('data-known-overflow')) known.push(entry);
        else overflowing.push(entry);
      }
    }
  });

  const tier: GridProbeResult['tier'] =
    window.innerWidth >= 1200 ? 'lg' : window.innerWidth >= 720 ? 'md' : 'base';

  return {
    tier,
    cols,
    rows,
    cell: containerWidth / cols,
    containerWidth,
    maxDrift,
    worst,
    overflowing,
    known,
    tolerance: TOLERANCE,
  };
}

declare global {
  interface Window {
    __probeGrid?: typeof probeGrid;
  }
}

if (typeof window !== 'undefined') window.__probeGrid = probeGrid;
