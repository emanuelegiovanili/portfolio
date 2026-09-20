/**
 * Un pannello di diagnosi sopra alla pagina vera, temporaneo.
 *
 * Si accende solo con `?diag` nell'indirizzo, quindi non esiste per chi visita
 * il sito. Serve perche' su Safari i bordi dei blocchi non si vedono e da
 * questa sessione Safari non e' misurabile (NOTES.md B23): la pagina di prova
 * `/diagnostica` ha assolto il CSS — tutte e sei le prove passano — quindi
 * quello che resta e' il JavaScript, e va guardato **sulla pagina che
 * sbaglia**, non su una replica.
 *
 * Quello che riporta, e perche':
 *
 *   - la versione di GSAP e quanti ScrollTrigger esistono: se sono zero, il
 *     movimento non si e' agganciato a niente;
 *   - i quattro valori del filo sui primi blocchi bordati, che il CSS legge
 *     dritti dentro `background-size`: `0%` vuol dire che qualcuno li ha
 *     azzerati e nessuno li ha ridisegnati;
 *   - la misura dello pseudo-elemento, per escludere che sia collassato;
 *   - gli errori raccolti dal modulo del movimento.
 *
 * Va tolto appena la causa e' nota.
 */

interface Motion {
  gsap?: string;
  smoother?: string;
  errori: string[];
  triggers?: () => number;
}

const SIDES = ['--rule-t', '--rule-r', '--rule-b', '--rule-l'] as const;

export function mostraDiagnosi(): void {
  const motion = (window as unknown as { __motion?: Motion }).__motion ?? { errori: [] };

  const blocchi = [...document.querySelectorAll<HTMLElement>('.block[data-surface="line"]')]
    .filter((b) => b.offsetWidth > 0 || b.offsetHeight > 0)
    .slice(0, 6);

  const righeBlocchi = blocchi.map((b) => {
    const calcolato = getComputedStyle(b);
    const pseudo = getComputedStyle(b, '::after');
    const valori = SIDES.map((s) => calcolato.getPropertyValue(s).trim() || '(vuoto)').join(' ');
    const nome = (b.className.replace('block ', '').split(' ')[0] || b.tagName).slice(0, 18);
    return `${nome.padEnd(18)} ${valori}\n${' '.repeat(18)} pseudo ${pseudo.width}x${pseudo.height} · size ${pseudo.backgroundSize}`;
  });

  const testo = [
    `gsap ${motion.gsap ?? 'NON CARICATO'}`,
    `ScrollSmoother: ${motion.smoother ?? 'non creato'}`,
    `ScrollTrigger attivi: ${motion.triggers ? motion.triggers() : 'n/d'}`,
    `blocchi bordati visibili: ${blocchi.length}`,
    '',
    'nome               t r b l',
    ...righeBlocchi,
    '',
    `errori: ${motion.errori.length === 0 ? 'nessuno' : ''}`,
    ...motion.errori,
  ].join('\n');

  const pannello = document.createElement('pre');
  pannello.textContent = testo;
  pannello.style.cssText = [
    'position:fixed',
    'inset:auto 8px 8px 8px',
    'z-index:99999',
    'max-height:60vh',
    'margin:0',
    'padding:10px 12px',
    'overflow:auto',
    'background:#111',
    'color:#f7f6f9',
    'font:11px/1.45 ui-monospace,monospace',
    'white-space:pre-wrap',
    'border:2px solid #5b2ff5',
  ].join(';');
  document.body.append(pannello);
}
