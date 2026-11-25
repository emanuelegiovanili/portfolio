/**
 * I dati strutturati del sito, in JSON-LD.
 *
 * ---------------------------------------------------------------------------
 * COS'E' E A CHI PARLA
 *
 * Non si vede in pagina e non cambia un pixel: e' un blocco che i motori di
 * ricerca leggono per sapere **chi** c'e' dietro questo sito — una persona,
 * non un'azienda qualsiasi — e per collegare fra loro i profili sparsi
 * (LinkedIn, Instagram, Contra, Malt). E' il contenuto che il committente ha
 * scritto, riprodotto come l'ha scritto: le descrizioni e l'elenco dei servizi
 * sono sue parole, non mie.
 *
 * I tre nodi si citano a vicenda con `@id`, che e' il modo in cui JSON-LD dice
 * "questa persona e' la stessa di sopra" invece di ripeterla tre volte.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' GLI INDIRIZZI NON SONO SCRITTI A MANO
 *
 * Il committente li aveva scritti per esteso, `https://emanuelegiovanili.com/`
 * in otto punti. Qui discendono da `Astro.site` e da `SOCIAL` in `site.ts`,
 * cioe' dagli stessi posti da cui discendono canonical, hreflang e i link del
 * footer. Il giorno che il dominio cambia — ed e' gia' cambiato una volta, da
 * `.it` a `.com` — cambia in un posto solo invece che in nove, e soprattutto
 * non resta **meta'** sito su un dominio e meta' sull'altro: un `@id` che non
 * combacia con il canonical non collega niente, e nessuno se ne accorge
 * guardando la pagina.
 *
 * La foto viene dall'import dell'immagine, quindi e' l'indirizzo con
 * l'impronta che la build calcola sul contenuto. Non e' una copia in
 * `public/`: due copie della stessa faccia sono due cose che possono divergere
 * (e' la ragione per cui `CONTACT_EMAIL` sta in un posto solo).
 * ---------------------------------------------------------------------------
 */
import { SITE_NAME, SOCIAL } from './site';

export interface DatiStrutturatiOpzioni {
  /** La radice del sito, assoluta e con la barra finale. */
  radice: string;
  /** L'indirizzo assoluto della foto profilo. */
  immagine: string;
}

/** L'indirizzo postale, uguale nei due nodi che lo dichiarano. */
const INDIRIZZO = {
  '@type': 'PostalAddress',
  addressLocality: 'San Benedetto del Tronto',
  addressRegion: 'Marche',
  addressCountry: 'IT',
} as const;

const SERVIZI = [
  'UX/UI design for websites, apps and SaaS platforms',
  'Website design and development',
  'E-commerce redesign',
  'Design systems and component libraries',
] as const;

export function datiStrutturati({ radice, immagine }: DatiStrutturatiOpzioni) {
  const persona = `${radice}#person`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': persona,
        name: SITE_NAME,
        jobTitle: 'UX/UI & Product Designer',
        description:
          'Freelance UX/UI and product designer who designs and builds digital experiences: websites, apps and platforms for startups and SMEs.',
        url: radice,
        image: immagine,
        address: INDIRIZZO,
        knowsLanguage: ['it', 'en'],
        knowsAbout: [
          'UX design',
          'UI design',
          'Product design',
          'Design systems',
          'Webflow development',
          'Front-end development',
          'E-commerce design',
          'Figma',
        ],
        /*
         * I primi due sono gli stessi link del footer, presi da `site.ts`:
         * se un profilo cambia indirizzo, cambia anche qui. Gli altri due non
         * sono in pagina da nessuna parte, e vanno bene lo stesso — `sameAs`
         * serve proprio a dichiarare profili che il sito non linka.
         */
        sameAs: [
          SOCIAL.linkedin,
          SOCIAL.instagram,
          'https://contra.com/emanuele_giovanili_g8r2je5w',
          'https://www.malt.com/profile/emanuelegiovanili',
        ],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${radice}#service`,
        name: `${SITE_NAME} — UX/UI & Product Design`,
        url: radice,
        founder: { '@id': persona },
        address: INDIRIZZO,
        areaServed: [
          { '@type': 'Country', name: 'Italy' },
          { '@type': 'Place', name: 'Europe' },
        ],
        availableLanguage: ['it', 'en'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: SERVIZI.map((nome) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: nome },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${radice}#website`,
        url: radice,
        name: SITE_NAME,
        /* Le due lingue del sito, le stesse di `hreflang`. */
        inLanguage: ['en', 'it'],
        publisher: { '@id': persona },
      },
    ],
  };
}
