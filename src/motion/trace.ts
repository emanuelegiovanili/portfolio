/**
 * Il filo che gira attorno a un blocco.
 *
 * Un tratto solo, non quattro. Parte dall'angolo in alto a sinistra, corre
 * lungo l'alto, scende a destra, torna indietro lungo il basso, risale a
 * sinistra e si chiude dov'era partito: e' un trim path, e la sagoma si
 * completa invece di gonfiarsi.
 *
 * L'avanzamento e' uno solo, da 0 a 1 sul **perimetro**, e viene ripartito fra
 * i quattro lati in proporzione alla loro lunghezza. E' questo che tiene la
 * velocita' costante lungo tutto il giro: quattro tween in sequenza, uno per
 * lato, avrebbero percorso un lato corto e uno lungo nello stesso tempo, e ogni
 * angolo sarebbe stato uno scatto. Con un avanzamento solo l'ease vale sul
 * giro intero e gli angoli non si sentono.
 *
 * Chi lo chiama decide cosa muove l'avanzamento: lo scroll, sulle pagine, o una
 * timeline, nel megamenu.
 *
 * Le quattro variabili sono registrate in `grid.css`, e i quattro gradienti del
 * blocco sono ancorati agli angoli giusti perche' il giro torni.
 */

import gsap from 'gsap';

/** I quattro lati nell'ordine in cui il filo li percorre. */
const SIDES = ['--rule-t', '--rule-r', '--rule-b', '--rule-l'] as const;

/** Filo assente: da qui parte il disegno. */
export function clearRules(blocks: HTMLElement[]): void {
  gsap.set(blocks, { '--rule-t': 0, '--rule-r': 0, '--rule-b': 0, '--rule-l': 0 });
}

/**
 * Il giro completo attorno a un blocco.
 *
 * Il tween e' su un oggetto di appoggio e non sull'elemento: le quattro
 * variabili non sono indipendenti, sono quattro finestre sullo stesso
 * avanzamento, e animarle separatamente vorrebbe dire tenerle in accordo a
 * mano.
 *
 * Le misure si prendono al primo fotogramma utile e non alla costruzione: il
 * megamenu costruisce la propria timeline al caricamento della pagina e si apre
 * molto dopo, e un blocco agganciato allo scroll puo' essere costruito mentre
 * e' ancora fuori vista.
 */
export function traceRules(block: HTMLElement, vars: gsap.TweenVars): gsap.core.Tween {
  const at = { p: 0 };
  let lengths: number[] | null = null;
  let perimeter = 1;

  const measure = () => {
    const w = block.offsetWidth;
    const h = block.offsetHeight;
    lengths = [w, h, w, h];
    // Mai zero: un blocco alto o largo zero dividerebbe per niente, e il giro
    // finirebbe prima di cominciare.
    perimeter = 2 * (w + h) || 1;
  };

  return gsap.to(at, {
    ...vars,
    p: 1,
    onUpdate: () => {
      if (!lengths) measure();
      let drawn = at.p * perimeter;
      SIDES.forEach((side, i) => {
        const length = lengths![i] || 1;
        block.style.setProperty(side, String(clamp(drawn / length)));
        drawn -= length;
      });
    },
  });
}

function clamp(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
