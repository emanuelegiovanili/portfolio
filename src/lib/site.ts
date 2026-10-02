/** Dati del sito che non vengono dal Figma. */

export const SITE_NAME = 'Emanuele Giovanili';

/**
 * L'indirizzo di contatto: quello a cui arriva il form **e** quello mostrato
 * su /contact.
 *
 * Uno solo, e non per economia. Per un giro ne sono esistiti due — questo e
 * una copia dentro i dizionari — e bastava cambiarne uno per mostrare a
 * schermo un indirizzo e spedire le mail a un altro. Un difetto che nessuna
 * sonda vede, perche' a schermo tutto sembra giusto.
 *
 * Non e' nel Figma: l'ha scelto il committente. Finche' non c'e' un backend
 * (NOTES.md B3) il form apre il client di posta con `mailto:`, quindi questo
 * indirizzo sta **in chiaro nel sorgente pubblico e nel JavaScript del sito**:
 * e' leggibile da chiunque e raccoglibile da uno scraper. E' una conseguenza di
 * `mailto:`, non un difetto di questa riga, e la risposta se il problema si
 * pone e' un backend, non offuscare la stringa.
 *
 * Il dominio e' passato da `.it` a `.com` su richiesta del committente.
 * **Resta da verificare che `.com` sia registrato e che la casella esista**
 * (NOTES.md B21): se non lo e', queste mail continuano a non arrivare da
 * nessuna parte, e il sito lo mostra pure in pagina.
 */
export const CONTACT_EMAIL = 'hello@emanuelegiovanili.com';

/** URL dei profili social. Non sono nel Figma: forniti dal committente. */
export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/in/emanuele-giovanili/',
  instagram: 'https://www.instagram.com/whereisemanuelegiovanili/',
} as const;

/** Un href ancora da riempire, per non pubblicare un link che non porta da nessuna parte. */
export function isPlaceholder(href: string): boolean {
  return href === '#';
}
