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
  /** Blocchi il cui contenuto esce dal proprio span. */
  overflowing: string[];
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
  const overflowing: string[] = [];

  const blocks = [...grid.querySelectorAll('.block')].filter(isVisible);
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
    if (block.scrollWidth > Math.ceil(rect.width) || block.scrollHeight > Math.ceil(rect.height)) {
      overflowing.push(name);
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
    tolerance: TOLERANCE,
  };
}

declare global {
  interface Window {
    __probeGrid?: typeof probeGrid;
  }
}

if (typeof window !== 'undefined') window.__probeGrid = probeGrid;
