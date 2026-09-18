/**
 * Le icone del sito, tutte da lucide.
 *
 * L'elenco e' chiuso: un nome fuori da qui non compila. Serve a impedire che
 * un refuso diventi un'icona mancante scoperta in produzione, e a tenere il
 * conto di cosa il sito usa davvero.
 *
 * `blender` non esiste in lucide-static 0.x: e' stato aggiunto dalla 1.x. E'
 * il motivo per cui il progetto sta sulla 1.47.
 */

/** Le sette per cui esiste un'animazione definita (home-handoff §12). */
export const ANIMATED_ICONS = [
  'send',
  'menu',
  'x',
  'chevron-left',
  'chevron-right',
  'map-pin',
  'disc-3',
] as const;

/** Tutte le altre restano ferme, per decisione chiusa. */
export const STATIC_ICONS = [
  'arrow-up-right',
  'flame',
  'chef-hat',
  'blender',
  'cooking-pot',
  'audio-lines',
  'swatch-book',
  'tablet-smartphone',
  'app-window',
  'user-round',
] as const;

export const ICONS = [...ANIMATED_ICONS, ...STATIC_ICONS] as const;

export type AnimatedIconName = (typeof ANIMATED_ICONS)[number];
export type IconName = (typeof ICONS)[number];

export function isAnimated(name: IconName): name is AnimatedIconName {
  return (ANIMATED_ICONS as readonly string[]).includes(name);
}
