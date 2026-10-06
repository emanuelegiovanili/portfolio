/**
 * La copy inglese, che e' anche la **forma** del dizionario.
 *
 * `it.ts` si dichiara `satisfies Dizionario`, quindi una chiave che manca o un
 * tipo che non torna fermano la build invece di uscire vuoti in pagina. E' la
 * sola garanzia che regge nel tempo: un dizionario senza tipo si scopre rotto
 * in produzione, da un utente.
 *
 * ---------------------------------------------------------------------------
 * COSA C'ERA PRIMA, E PERCHE' QUESTO FILE LO CORREGGE
 *
 * Le pagine inglesi servivano **testo italiano** in tre punti, e nessuno se ne
 * era accorto perche' non si vede guardando la pagina:
 *
 * - le `description` nel `<head>` di /about, /works, /contact e delle tre
 *   pagine progetto (quelle dei progetti le ha segnalate il committente, e le
 *   versioni inglesi vengono dal suo file);
 * - l'etichetta dei comandi quadrati — "Scopri chi sono", "Scrivimi",
 *   "Progetto precedente", "Testimonianza successiva", "Apri il menu" — che e'
 *   quello che un lettore di schermo pronuncia al posto dell'icona;
 * - "Un occhiolino", il testo nascosto del `;)` in home.
 *
 * Erano stringhe scritte in italiano dentro `lang="en"`: un lettore di schermo
 * inglese le pronuncia con la fonetica sbagliata, e per chi naviga cosi' la
 * pagina e' l'unica interfaccia che ha. Qui sono in inglese, e l'italiano e'
 * in `it.ts` dove serve.
 *
 * Le righe marcate **(mia)** non stanno nel Figma: sono etichette di
 * accessibilita' e `description` che il disegno non prevede ma che la pagina
 * deve avere. Le ho scritte io e sono segnalate in NOTES.md D148, cosi' il
 * committente sa quali parole sono sue e quali no.
 * ---------------------------------------------------------------------------
 *
 * I titoli display stanno in **array di righe**, non in stringhe con `<br>`:
 * dove il disegno manda a capo, il capo e' un dato, non markup.
 */

import { CONTACT_EMAIL } from '../lib/site';

export const en = {
  comune: {
    marchio: 'Emanuele Giovanili',

    intestazione: {
      scrivimi: 'Write to me', // (mia)
      apriMenu: 'Open the menu', // (mia)
      chiudiMenu: 'Close the menu', // (mia)
      menu: 'Menu', // (mia)
    },

    menu: {
      lavoriamo: 'Let’s work together',
      work: 'Work',
      about: 'About',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
    },

    /** Il comando lingua, 412:1020 e 412:1024. Le due etichette non si traducono. */
    lingua: {
      etichetta: 'Language', // (mia)
      it: 'IT',
      en: 'ENG',
      /** Letto da chi usa un lettore di schermo al posto del colore del fondo. */
      attiva: 'current language', // (mia)
    },

    footer: {
      lavoriamo: 'Let’s work together',
      home: 'Home',
      about: 'About',
      works: 'Works',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
    },

    form: {
      nome: 'Your name',
      nomeSegnaposto: 'How can I call you?',
      azienda: 'Your company name',
      aziendaSegnaposto: 'Where do you work?',
      email: 'Your email address',
      emailSegnaposto: 'example@mail.com',
      dettagli: 'Add some details',
      dettagliSegnaposto: 'Help me understand',
      invia: 'Send',
    },

    cta: {
      lead: 'Don’t let your ideas sit and simmer for too long',
      /*
       * Il titolo in tre pezzi, e non e' pignoleria.
       *
       * In inglese la parola viola sta **in mezzo**: "Let's **bake** something
       * together". In italiano sta **in testa**: "**Costruiamo** qualcosa
       * insieme". Con due soli pezzi — accento piu' resto — l'inglese avrebbe
       * perso il suo viola su "bake" e lo avrebbe preso "Let's", cambiando il
       * disegno senza che nessuno lo chiedesse. Tre pezzi reggono tutte e due,
       * e il pezzo vuoto non stampa niente.
       */
      titoloPrima: 'Let’s ',
      titoloAccento: 'bake',
      titoloDopo: ' something together',
    },

    progetto: {
      visita: 'Visit',
      /**
       * Quello che un lettore di schermo pronuncia al posto di "Visit".
       *
       * `{nome}` e' il nome del progetto. "Visit" da solo non dice dove si va,
       * e la scheda che si apre e' nuova: chi non vede lo schermo deve saperlo
       * prima di premere, non dopo. Era scritta in italiano **anche qui**.
       */
      visitaVoce: 'Visit {nome}, opens in a new tab',
      continua: 'Keep reading',
      correlati: 'Related work',
      vediTutti: 'View all',
    },
  },

  home: {
    titoloPagina: 'Emanuele Giovanili — Baking Ideas',
    descrizione: 'UX/UI & Product Designer, creating digital experiences and bringing them to life.', // (mia, era in italiano)

    heroTitolo: ['Baking', 'Ideas'],
    heroLead: ['Never tasteless', 'digital experiences'],
    heroCorpo: 'I’m a UX/UI & Product Designer, creating digital experiences and bringing them to life.',
    /**
     * Due righe in inglese. Il frame italiano ne ha **una sola**: li' "Working
     * remotely" non c'e'. E' una differenza di contenuto, non di traduzione, e
     * sta in NOTES.md D148 — qui la forma regge tutte e due, un array.
     */
    heroLuogo: ['Based in San Benedetto del Tronto, Italy', 'Working remotely'],
    heroProfilo: 'About me', // (mia, era "Scopri chi sono")
    heroScopri: 'Discover more',

    servizi: ['UX/UI', 'Product', 'Visual', 'No-coder', 'Teacher'],

    aboutTitolo: ['What’s', 'in the mix'],
    aboutCorpo:
      'To me, design is about making people happy about what they are looking at, using or experiencing. Whether it is a product, a website or a brand, I find purpose in design when it makes a real impact on people’s daily lives.',

    skillProduct: 'Product Design',
    skillWeb: 'Web Design',
    skillBranding: 'Branding',

    lavoriTitolo: ['Selected Works'],
    /** Il frame italiano non ha didascalia: vedi D148. */
    lavoriDidascalia: 'Ideas that got baked',
    lavoriVediTutti: 'View all my work',
    lavoriPrecedente: 'Previous project', // (mia, era "Progetto precedente")
    lavoriSuccessivo: 'Next project', // (mia, era "Progetto successivo")

    testimonialTitolo: ['People with good taste'],
    testimonialClienti: 'Clients', // (mia, era "Clienti")
    testimonialPrecedente: 'Previous testimonial', // (mia)
    testimonialSuccessivo: 'Next testimonial', // (mia)
    occhiolino: 'A wink', // (mia, era "Un occhiolino")
  },

  about: {
    titoloPagina: 'About — Emanuele Giovanili',
    descrizione: 'Who I am, how I work and what I care about.', // (mia, era in italiano)

    titolo: 'About',
    bioEtichetta: 'Bio',
    /** Il testo alternativo del ritratto: era in italiano dentro `lang="en"`. (mia) */
    ritrattoAlt: 'Portrait of Emanuele Giovanili, in a purple t-shirt, seated on a sofa',
    bio: [
      'I’m a digital designer and, to be honest, a bit of a nerd. I’m passionate about anything with a clear process and meaningful results.',
      'I work at the intersection of strategy, design, and technology, that’s where ideas take practical form. Design’s true role is in understanding: making technology feel human and instantly clear to its users.',
      'I also teach interface design: explaining my daily work is the best way to keep improving.',
    ],
    luogo: 'Based in San Benedetto del Tronto, Italy',
    remoto: 'Working remotely',

    cosaTitolo: ['What I actually do'],
    settori: [
      {
        titolo: 'Branding',
        corpo:
          'Most businesses aren’t forgotten because they’re bad. They’re forgotten because nothing about them sticks. What people remember is what you stand for when they have to choose. Branding, to me, is the work of making who you are visible and remarkable.',
      },
      {
        titolo: 'Product design',
        corpo:
          'I start from what users need, then map how the technology behind the product really works. That shapes the interface, so it follows the research, fits the brand and is easier to build. It’s also why I love working with startups, where the system doesn’t exist yet and I get to help build it.',
      },
      {
        titolo: 'Web Design',
        corpo:
          'As with branding, being seen isn’t enough. You need to be remembered, and your online presence speaks for you. I build in Webflow through no-code when the project fits, and if it doesn’t, I bring in a developer for guaranteed success.',
      },
    ],

    ricettaTitolo: ['My secret recipe'],
    ricetta: [
      {
        heading: 'Find real problems for real people.',
        /** "comes together. then I look at": minuscola dopo il punto, dal file. NOTES.md §3.5. */
        corpo:
          'I start by understanding the people who’ll use what we’re building, then work out which technology we’ll use and how the system comes together. then I look at what the business needs to achieve, and which number will tell us it worked.',
      },
      {
        heading: 'Many skills, one pair of hands.',
        corpo:
          'I trained in product design, started out in code and branding and spent years working on conversion and web design. So when I shape a solution, design, technology and business get weighed at the same time, by the same person.',
      },
      {
        heading: 'Built together, tested to the end.',
        corpo:
          'This is where it gets made, and you’re part of it. You see the work as it takes shape, and we make the important decisions together along the way. I stay on it through the build and the details, up to the final tests with real people.',
      },
    ],
  },

  works: {
    titoloPagina: 'Works — Emanuele Giovanili',
    descrizione: 'Branding, web design and product design projects.', // (mia, era in italiano)
    titolo: 'My work',
    /** Il contatore dice 4 nel Figma con tre progetti: vedi NOTES.md §3.1. */
    tutti: 'All',
  },

  contatti: {
    titoloPagina: 'Contact — Emanuele Giovanili',
    descrizione: 'Tell me what you have in mind.', // (mia, era in italiano)
    titolo: 'Let’s work together',
    /**
     * Telefono e indirizzo, blocco 423:147, aggiunti dal committente.
     *
     * Sono gli stessi nelle due lingue, e stanno qui e non in `comune` perche'
     * li mostra **solo** /contact: metterli in comune vorrebbe dire invitare
     * a spargerli per il sito senza una decisione.
     */
    telefono: '+39 3313521295',
    /* Uno solo, da `site.ts`: e' anche l'indirizzo a cui il form spedisce, e
       due copie possono divergere senza che si veda. */
    email: CONTACT_EMAIL,
  },
};

/**
 * La forma del dizionario.
 *
 * Niente `as const` sopra, e non e' una dimenticanza: con le costanti ogni
 * stringa avrebbe il **tipo del suo contenuto** — `'Work'`, non `string` — e
 * `it.ts` non potrebbe soddisfarla, perche' in italiano quella voce dice
 * "Progetti". Senza, i tipi restano `string` e `string[]` e il controllo fa
 * quello che serve davvero: pretendere che ci siano tutte le chiavi, con la
 * stessa forma.
 */
export type Dizionario = typeof en;
