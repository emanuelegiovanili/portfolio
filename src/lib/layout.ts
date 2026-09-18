/**
 * Il sistema di posizionamento.
 *
 * Una pagina dichiara una sola mappa: per ogni blocco, e per ogni tier in cui il
 * blocco esiste, la quaterna [colonna, riga, span colonne, span righe] letta dal
 * frame Figma. Da quella mappa discendono sia le custom property che finiscono
 * inline sul blocco, sia il numero di righe della griglia.
 *
 * `--rows` non si scrive a mano. La tabella degli handoff contava l'altezza del
 * frame, che ha righe vuote in fondo, e sbagliava su tre pagine su sette. Qui e'
 * il massimo di (riga + span) sui blocchi reali, quindi non puo' divergere dal
 * contenuto: se un blocco scende, la pagina cresce e l'ultima linea scende con lui.
 */

export const TIERS = ['base', 'md', 'lg'] as const;
export type Tier = (typeof TIERS)[number];

/**
 * Larghezza minima di ogni tier, in px.
 *
 * I documenti di handoff ne davano tre serie incompatibili (680/1200, solo 1200,
 * 768/1280). Vedi NOTES.md D9 per il motivo di questi.
 *
 * Questi numeri sono duplicati nelle media query di grid.css, perche' le media
 * query non leggono le custom property. Cambiarli qui senza cambiarli li' non
 * produce nessun errore: produce una griglia storta. Sono l'unica duplicazione
 * del sistema ed e' segnata anche in grid.css.
 */
export const BREAKPOINTS: Record<Tier, number> = { base: 0, md: 720, lg: 1200 };

/** Numero di colonne per tier. Il layout cambia tre volte, le colonne una sola. */
export const COLS: Record<Tier, number> = { base: 10, md: 10, lg: 12 };

/** Oltre questa larghezza il contenitore si ferma e resta centrato. */
export const GRID_MAX = 1680;

/** [colonna di partenza, riga di partenza, colonne occupate, righe occupate], 1-based. */
export type Placement = readonly [col: number, row: number, cSpan: number, rSpan: number];

/** Dove sta un blocco, tier per tier. Un tier assente significa: qui il blocco non c'e'. */
export type BlockPlacements = Partial<Record<Tier, Placement>>;

export type LayoutMap = Record<string, BlockPlacements>;

/** Quante righe occupa il contenuto, tier per tier. */
export type RowCounts = Partial<Record<Tier, number>>;

function assertPlacement(name: string, tier: Tier, p: Placement): void {
  const [col, row, cSpan, rSpan] = p;
  const cols = COLS[tier];
  if (!Number.isInteger(col) || !Number.isInteger(row) || !Number.isInteger(cSpan) || !Number.isInteger(rSpan)) {
    throw new Error(`layout: "${name}" a ${tier} ha valori non interi: [${p.join(', ')}]`);
  }
  if (col < 1 || row < 1 || cSpan < 1 || rSpan < 1) {
    throw new Error(`layout: "${name}" a ${tier} ha valori sotto 1: [${p.join(', ')}]`);
  }
  if (col + cSpan - 1 > cols) {
    throw new Error(
      `layout: "${name}" a ${tier} arriva alla colonna ${col + cSpan - 1}, ma il tier ne ha ${cols}. ` +
        `Un blocco che sfora crea una colonna implicita e allarga la griglia: le linee smettono di combaciare.`,
    );
  }
}

/**
 * Il fondo del contenuto per ogni tier.
 *
 * Un tier che nessun blocco dichiara resta assente: le pagine interne esistono
 * solo a desktop e non ha senso inventare un'altezza per un layout che non c'e'.
 */
export function deriveRows(map: LayoutMap): RowCounts {
  const rows: RowCounts = {};
  for (const [name, placements] of Object.entries(map)) {
    for (const tier of TIERS) {
      const p = placements[tier];
      if (!p) continue;
      assertPlacement(name, tier, p);
      const bottom = p[1] + p[3] - 1;
      const current = rows[tier];
      if (current === undefined || bottom > current) rows[tier] = bottom;
    }
  }
  return rows;
}

/**
 * Risolve un tier mancante sul piu' vicino che esiste, verso il basso e poi verso
 * l'alto. Serve alle quattro pagine disegnate solo a desktop: sotto 1200px non
 * esiste un disegno, e mostrare il layout desktop stretto e' comunque meglio che
 * mostrare una pagina vuota. E' una deviazione consapevole, vedi NOTES.md B2.
 */
export function resolveTier<T>(byTier: Partial<Record<Tier, T>>, tier: Tier): T | undefined {
  const order: Record<Tier, Tier[]> = {
    base: ['base', 'md', 'lg'],
    md: ['md', 'base', 'lg'],
    lg: ['lg', 'md', 'base'],
  };
  for (const t of order[tier]) {
    const value = byTier[t];
    if (value !== undefined) return value;
  }
  return undefined;
}

/**
 * Le custom property di posizione, da mettere inline sul blocco.
 *
 * Ogni tier ha le sue; grid.css sceglie quale usare con una catena di fallback,
 * cosi' un blocco che non ridichiara la posizione a md eredita quella di base
 * senza che il markup debba ripeterla.
 */
export function placementStyle(placements: BlockPlacements): string {
  const parts: string[] = [];
  for (const tier of TIERS) {
    const p = placements[tier];
    if (!p) continue;
    parts.push(`--col-${tier}:${p[0]}`, `--row-${tier}:${p[1]}`, `--c-${tier}:${p[2]}`, `--r-${tier}:${p[3]}`);
  }
  if (parts.length === 0) {
    throw new Error('layout: un blocco deve dichiarare almeno un tier');
  }
  return parts.join(';');
}

/** I tier in cui il blocco esiste, per l'attributo che ne governa la visibilita'. */
export function tiersOf(placements: BlockPlacements): string {
  return TIERS.filter((t) => placements[t] !== undefined).join(' ');
}

/**
 * Le linee da disegnare, raggruppate per tier che le condividono.
 *
 * Il numero di linee dipende dal tier (105 righe a mobile, 42 a desktop) e i
 * selettori CSS non sanno fare aritmetica su una custom property, quindi il
 * raggruppamento si fa qui e in pagina diventa un attributo. Tier con lo stesso
 * conteggio finiscono nello stesso gruppo e le linee si emettono una volta sola.
 */
export type LineGroup = { show: string; count: number };

function groupByCount(byTier: Partial<Record<Tier, number>>): LineGroup[] {
  const groups = new Map<number, Tier[]>();
  for (const tier of TIERS) {
    const count = resolveTier(byTier, tier);
    if (count === undefined) continue;
    const bucket = groups.get(count);
    if (bucket) bucket.push(tier);
    else groups.set(count, [tier]);
  }
  return [...groups].map(([count, tiers]) => ({ show: tiers.join(' '), count }));
}

export function verticalGroups(): LineGroup[] {
  return groupByCount(COLS);
}

export function horizontalGroups(rows: RowCounts): LineGroup[] {
  return groupByCount(rows);
}
