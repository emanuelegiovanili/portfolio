/** Dati del sito che non vengono dal Figma. */

export const SITE_NAME = 'Emanuele Giovanili';

/** URL dei profili social. Non sono nel Figma: forniti dal committente. */
export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/in/emanuele-giovanili/',
  instagram: 'https://www.instagram.com/whereisemanuelegiovanili/',
} as const;

/** Un href ancora da riempire, per non pubblicare un link che non porta da nessuna parte. */
export function isPlaceholder(href: string): boolean {
  return href === '#';
}
