/**
 * La copy italiana.
 *
 * `satisfies Dizionario` non e' decorativo: se qui manca una chiave che esiste
 * in inglese, o se un array cambia forma, **la build si ferma**. Un dizionario
 * senza tipo si scopre rotto in produzione, da un utente, e il buco si vede
 * solo nella lingua che nessuno rilegge.
 *
 * ---------------------------------------------------------------------------
 * DA DOVE VIENE OGNI RIGA
 *
 * - home e /about: frame 416:3118 e 416:3335;
 * - /works, pagina progetto e /contact: frame 423:207, 423:368, 423:80;
 * - i testi dei progetti e la tabella dei comandi: il file md del committente;
 * - le citazioni dei testimonial: mandate dal committente in chat.
 *
 * **Oggi non manca niente**: ogni stringa ha la sua versione italiana. Il
 * meccanismo per dichiarare quello che manca resta — `daTradurre` in
 * `index.ts`, usato da `src/lib/progetti.ts` — perche' il prossimo progetto
 * puo' arrivare senza traduzione, e quel giorno deve finire in un elenco
 * invece che in una pagina italiana scritta in inglese.
 * ---------------------------------------------------------------------------
 *
 * COSE CHE NON SI CORREGGONO (NOTES.md §3.5 e D148)
 *
 * - `aboutCorpo` ha un **punto isolato**: "un impatto positivo su . cio' che le
 *   persone guardano". E' cosi' nel frame 416:3216.
 * - `bio` dice "Insegno anche interface design" al presente, come l'inglese,
 *   e l'insegnamento e' finito a settembre 2026.
 * - `ricetta[0].corpo` tiene la minuscola dopo il punto, come l'inglese.
 *
 * COSE CHE IL FRAME ITALIANO **TOGLIE**, e non sono traduzioni mancate
 *
 * - l'hero non dice "Working remotely": una riga sola, non due;
 * - la sezione dei lavori non ha didascalia;
 * - "Teacher" nel marquee e' nascosta nel frame italiano.
 *
 * Sono differenze di contenuto fra le due lingue, riprodotte come stanno.
 */

import { CONTACT_EMAIL } from '../lib/site';
import type { Dizionario } from './en';

export const it = {
  comune: {
    marchio: 'Emanuele Giovanili',

    intestazione: {
      scrivimi: 'Scrivimi',
      apriMenu: 'Apri il menu',
      chiudiMenu: 'Chiudi il menu',
      menu: 'Menu',
    },

    menu: {
      lavoriamo: 'Lavoriamo insieme',
      work: 'Progetti',
      about: 'Chi sono',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
    },

    lingua: {
      etichetta: 'Lingua',
      it: 'IT',
      en: 'ENG',
      attiva: 'lingua attiva',
    },

    footer: {
      lavoriamo: 'Lavoriamo insieme',
      home: 'Home',
      about: 'Chi sono',
      works: 'Progetti',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
    },

    form: {
      nome: 'Il tuo nome',
      nomeSegnaposto: 'Come posso chiamarti?',
      azienda: 'La tua azienda',
      aziendaSegnaposto: 'Dove lavori?',
      email: 'La tua email',
      emailSegnaposto: 'esempio@mail.com',
      /*
       * Il frame 416:3284 dice "Raccontami il progetto": il committente l'ha
       * cambiata in chat. Qui vince la richiesta, non il file — ma le due cose
       * ora divergono, e il Figma andrebbe allineato (NOTES.md D150).
       */
      dettagli: 'Raccontami la tua idea',
      dettagliSegnaposto: 'Aiutami a capire di cosa hai bisogno',
      invia: 'Invia',
    },

    cta: {
      lead: 'Non lasciare che le tue idee si raffreddino',
      titoloPrima: '',
      titoloAccento: 'Costruiamo',
      titoloDopo: ' qualcosa insieme',
    },

    progetto: {
      visita: 'Visita',
      visitaVoce: 'Visita {nome}, si apre in una nuova scheda',
      continua: 'Continua a leggere',
      /**
       * Il frame 423:476 dice ancora "Related work" e il file md non lo
       * elencava: l'ha dato il committente in chat.
       *
       * Scritto con la maiuscola. Lui l'ha scritto "altri progetti", ma ogni
       * altro titolo display italiano comincia per maiuscola — "Chi sono",
       * "Il mio segreto", "Di cosa mi occupo" — e una minuscola in mezzo a
       * quelli si legge come una svista, non come una scelta. Segnalato
       * (NOTES.md D148): se era voluta, e' una lettera.
       */
      correlati: ['Altri', 'progetti'],
      /**
       * Qui frame e file md **non vanno d'accordo**: 423:493 dice "View all",
       * il file md dice "Vedi tutti i progetti". Vince il file md, che e' il
       * documento di copy — il frame porta la geometria. Misurato: ci sta nel
       * bottone da due celle, vedi D148.
       */
      vediTutti: 'Vedi tutti i progetti',
    },
  },

  home: {
    titoloPagina: 'Emanuele Giovanili — Baking Ideas',
    descrizione: 'UX/UI & Product Designer. Creo esperienze digitali e le porto in vita.',

    /** Non si traduce: 416:3192 dice "Baking Ideas" anche in italiano. */
    heroTitolo: ['Baking', 'Ideas'],
    heroLead: ['Esperienze digitali,', 'mai insipide'],
    heroCorpo: 'Sono un UX/UI e Product Designer: progetto prodotti digitali e siti e li porto online.',
    /** Una riga sola: il frame italiano non ha "Working remotely". */
    heroLuogo: ['San Benedetto del Tronto, Italia'],
    heroProfilo: 'Scopri chi sono',
    heroScopri: 'Scopri di più',

    /** Quattro, non cinque: "Teacher" e' nascosta nel frame italiano. */
    servizi: ['UX/UI', 'Product', 'Visual', 'No-coder'],

    aboutTitolo: ['Cosa c’è dentro?'],
    aboutCorpo:
      'Per me progettare significa un impatto positivo su . ciò che le persone guardano, usano e vivono ogni giorno. Che sia un prodotto, un sito o un brand, il lavoro ha senso quando cambia davvero qualcosa nella giornata di chi lo usa.',

    skillProduct: 'Product design',
    skillWeb: 'Web Design',
    skillBranding: 'Branding',

    lavoriTitolo: ['Lavori', 'selezionati'],
    /** Il frame italiano non ha didascalia: resta vuota, e la pagina non la stampa. */
    lavoriDidascalia: '',
    lavoriVediTutti: 'Vedi tutti i progetti',
    lavoriPrecedente: 'Progetto precedente',
    lavoriSuccessivo: 'Progetto successivo',

    testimonialTitolo: ['Gente di buon gusto'],
    testimonialClienti: 'Clienti',
    testimonialPrecedente: 'Testimonianza precedente',
    testimonialSuccessivo: 'Testimonianza successiva',
    occhiolino: 'Un occhiolino',
  },

  about: {
    titoloPagina: 'Chi sono — Emanuele Giovanili',
    descrizione: 'Chi sono, come lavoro e cosa mi interessa.',

    titolo: 'Chi sono',
    bioEtichetta: 'Bio',
    ritrattoAlt: 'Ritratto di Emanuele Giovanili, maglietta viola, seduto su un divano',
    /** 416:3405 e' un testo solo: diviso sugli stessi tre stacchi dell'inglese. */
    bio: [
      'Sono un digital designer e, a dirla tutta, anche un po’ nerd. Mi appassiona tutto ciò che ha un processo chiaro e risultati concreti.',
      'Lavoro dove si incontrano strategia, design e tecnologia: è lì che le idee prendono una forma pratica. Il vero compito del design è capire: rendere la tecnologia umana e subito chiara per chi la usa.',
      'Insegno anche interface design: spiegare il mio lavoro agli studenti è il modo migliore per continuare a migliorarlo.',
    ],
    luogo: 'San Benedetto del Tronto, Marche',
    remoto: 'Anche da remoto',

    cosaTitolo: ['Di cosa', 'mi occupo'],
    settori: [
      {
        titolo: 'Branding',
        corpo:
          'Un’azienda raramente viene dimenticata perché lavora male: più spesso succede perché non lascia il segno. Quando arriva il momento di scegliere, le persone si ricordano di chi ha un’identità chiara. Per me branding significa questo: far emergere chi sei e farlo restare impresso nella mente dei tuoi clienti.',
      },
      {
        titolo: 'Product design',
        corpo:
          'Un prodotto nasce dai bisogni di chi userà il prodotto e da una mappatura chiara del sistema. Da lì prende forma l’interfaccia: coerente con la ricerca e con il brand, e più semplice da sviluppare. È anche per questo che amo lavorare con le startup, dove il sistema non esiste ancora e posso aiutare a crearlo da zero.',
      },
      {
        titolo: 'Web Design',
        corpo:
          'Come per il branding, non basta farsi vedere: bisogna farsi ricordare e spesso è il tuo sito il primo a parlare di te. Quando il progetto lo permette lo realizzo in Webflow, senza scrivere codice, quando serve qualcosa in più, coinvolgo uno sviluppatore e il risultato è garantito.',
      },
    ],

    ricettaTitolo: ['Il mio segreto'],
    ricetta: [
      {
        heading: 'Problemi veri  per persone vere.',
        corpo:
          'Parto dalle persone che useranno quello che stiamo costruendo, poi scelgo la tecnologia e capisco come si incastra il sistema. Infine guardo cosa deve ottenere il business e quale numero ci dirà che ha funzionato.',
      },
      {
        heading: 'Tante competenze, un solo paio di mani.',
        corpo:
          'Mi sono formato in product design, ho cominciato con il codice e il branding, e ho passato anni a lavorare su conversione e web design. Così, quando do forma a una soluzione, design, tecnologia e business vengono pesati insieme, dalla stessa persona.',
      },
      {
        heading: 'Costruito insieme, testato fino in fondo.',
        corpo:
          'È qui che il progetto si realizza, e tu ne fai parte. Vedi il lavoro mentre prende forma e decidiamo insieme le cose importanti lungo il percorso. Lo seguo durante lo sviluppo e nei dettagli, fino ai test finali con persone vere.',
      },
    ],
  },

  works: {
    titoloPagina: 'Portfolio — Emanuele Giovanili',
    descrizione: 'Progetti di branding, web design e product design.',
    titolo: 'Portfolio',
    /** 423:313 dice "All" anche in italiano, come i tag. */
    tutti: 'All',
  },

  contatti: {
    titoloPagina: 'Contatti — Emanuele Giovanili',
    descrizione: 'Scrivimi: raccontami cosa hai in mente.',
    titolo: 'Lavoriamo insieme',
    telefono: '+39 3313521295',
    /* Uno solo, da `site.ts`: e' anche l'indirizzo a cui il form spedisce, e
       due copie possono divergere senza che si veda. */
    email: CONTACT_EMAIL,
  },
} satisfies Dizionario;
