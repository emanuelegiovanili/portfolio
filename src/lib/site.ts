/** Dati del sito che non vengono dal Figma. */

export const SITE_NAME = 'Emanuele Giovanili';

/**
 * L'indirizzo a cui arriva il form.
 *
 * Non e' nel Figma: l'ha scelto il committente. Finche' non c'e' un backend
 * (NOTES.md B3) il form apre il client di posta con `mailto:`, quindi questo
 * indirizzo sta **in chiaro nel sorgente pubblico e nel JavaScript del sito**:
 * e' leggibile da chiunque e raccoglibile da uno scraper. E' una conseguenza di
 * `mailto:`, non un difetto di questa riga, e la risposta se il problema si
 * pone e' un backend, non offuscare la stringa.
 *
 * **Il dominio non e' ancora registrato** (NOTES.md B21): oggi queste mail non
 * arrivano da nessuna parte.
 */
export const CONTACT_EMAIL = 'hello@emanuelegiovanili.it';

/** URL dei profili social. Non sono nel Figma: forniti dal committente. */
export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/in/emanuele-giovanili/',
  instagram: 'https://www.instagram.com/whereisemanuelegiovanili/',
} as const;

/** Un href ancora da riempire, per non pubblicare un link che non porta da nessuna parte. */
export function isPlaceholder(href: string): boolean {
  return href === '#';
}
