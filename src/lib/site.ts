/** Dati del sito che non vengono dal Figma. */

export const SITE_NAME = 'Emanuele Giovanili';

/**
 * URL dei profili social.
 *
 * Il Figma mostra le etichette "LinkedIn" e "Instagram" ma non i link, e non me
 * li sono inventati: un link a un profilo sbagliato e' un bug che va online e
 * che nessuno nota finche' non ci clicca qualcuno. Vedi NOTES.md B10.
 */
export const SOCIAL = {
  linkedin: '#',
  instagram: '#',
} as const;

/** Un href ancora da riempire, per non pubblicare un link che non porta da nessuna parte. */
export function isPlaceholder(href: string): boolean {
  return href === '#';
}
