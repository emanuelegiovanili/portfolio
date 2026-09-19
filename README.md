# Portfolio — Emanuele Giovanili

Sito statico di cinque pagine costruito su una griglia visibile. Astro 5, CSS puro, GSAP.
Deploy su Cloudflare Workers come static assets.

## Stack

| Ambito | Scelta |
|---|---|
| Framework | Astro 5, `output: 'static'` |
| Stile | CSS puro con custom properties. Nessun framework, nessun preprocessore |
| Contenuti | Astro Content Collections |
| Immagini | `astro:assets` con `<Picture>` |
| Animazioni | GSAP 3.13 con ScrollTrigger e SplitText |
| Icone | `lucide-static`, SVG inline nel markup |
| Font | Poppins + DT Getai Grotesk Display, self-hosted woff2 |
| Hosting | Cloudflare Workers |

## Comandi

```
npm install
npm run dev            # sviluppo su :4321
npm run build          # build statica in dist/ (/grid viene rimossa)
npm run check          # type check
npm run verify         # tutte le sonde, sorgente e build
npm run verify:grid    # l'invariante: 13 larghezze x 3 scroll x 7 route
npm run verify:edges   # i fili dei bordi, letti nei pixel dipinti
npm run verify:build   # la build servita da Workers: indirizzi, richieste, griglia, fili
npm run measure        # margine fra uno span e il suo contenuto, larghezza per larghezza
npm run preview        # la build servita in locale con wrangler
npm run deploy         # pubblica su Cloudflare Workers
```

## Pubblicare

Il sito e' un Worker di soli asset statici: `wrangler.jsonc` punta a `dist/` e
non c'e' codice da eseguire a runtime.

```
npx wrangler login     # una volta sola, apre il browser
npm run verify:build   # costruisce e rimisura quel che andra' online
npm run deploy
```

L'indirizzo che ne esce ha la forma `<nome-worker>.<sottodominio>.workers.dev`,
dove il nome del worker e' quello in `wrangler.jsonc` (`emanuelegiovanili`) e il
sottodominio e' quello scelto una volta per tutte sull'account.

`wrangler login` e' un giro OAuth nel browser: da un ambiente senza browser
serve invece `CLOUDFLARE_API_TOKEN` (permesso *Workers Scripts: Edit*) e
`CLOUDFLARE_ACCOUNT_ID` nelle variabili d'ambiente.

### Automatico

`.github/workflows/deploy.yml` fa la stessa cosa a ogni push su `main`:
costruisce, misura la build con `verify:build`, e pubblica **quel** `dist/`,
senza ricostruire in mezzo.

Perche' funzioni servono due cose, da fare una volta sola:

1. i secret del repository: `CLOUDFLARE_API_TOKEN` (permesso *Workers Scripts:
   Edit*) e `CLOUDFLARE_ACCOUNT_ID`;
2. un ramo `main`. Oggi il repository ne ha uno solo, di lavorazione, e il
   workflow parte su `main`: finche' non c'e', non pubblica niente.

## L'invariante del progetto

**I bordi dei blocchi cadono sulle linee della griglia, a ogni larghezza di finestra, in ogni fotogramma di ogni animazione.**

Da cui discendono le regole non negoziabili:

- nessuna `width` o `height` in px sui blocchi: solo `grid-column` / `grid-row` con posizione e span espliciti;
- nessun `grid-auto-flow`: i blocchi hanno vuoti intenzionali fra loro;
- nessuna `line-height: normal`;
- nessuna animazione sposta o ridimensiona un blocco bordato.

## Sorgente di verità

File Figma `JnQzL6FnsjioRZNZQYoz9Q`.

| Route | lg 1440 | md 767 | base 390 |
|---|---|---|---|
| `/` | `247:60` | `321:2716` | `314:2229` |
| `/about` | `274:1855` | — | — |
| `/works` | `310:1270` | — | — |
| `/works/[slug]` | `310:1614` | — | — |
| `/contact` | `312:1995` | — | — |
| megamenu | `268:1498` | — | — |

Ogni scostamento consapevole dal file è elencato in `NOTES.md`.

**Attenzione a `get_metadata`:** su molti nodi restituisce frame senza figli anche quando sono pieni. Usare `get_design_context` come fonte primaria. Elenco dei nodi interessati in `NOTES.md` §4.9.

## Aggiungere un progetto

1. Crea `src/content/works/<slug>.json`:

```json
{
  "title": "Nome progetto",
  "order": 4,
  "tags": ["Web Design", "Branding"],
  "cover": "./cover.png",
  "excerpt": "Una riga di descrizione.",
  "body": "Il testo del case study."
}
```

2. Metti le immagini in `src/assets/works/<slug>/`.
3. `git push`.

Il deploy parte da solo. I contatori dei filtri su `/works`, la paginazione del carosello in home e le pagine `/works/<slug>` si aggiornano da soli: non c'è nessun numero scritto a mano.

Tag ammessi: `Web Design`, `Branding`, `Product`.

## Nota sulla rete di questa sessione

`figma.com` è bloccato dalla policy di egress dell'ambiente (403 al CONNECT). Gli asset immagine
del Figma non sono scaricabili da qui. Per sbloccare, una delle due:

- abilitare `www.figma.com` nella network policy dell'ambiente Claude Code;
- esportare le immagini da Figma a mano e metterle in `src/assets/`.

Gli URL asset restituiti dall'MCP scadono in 7 giorni: nessuno di essi va committato.

Stessa policy, stesso 403 al CONNECT, per `api.cloudflare.com`: **da questa
sessione il deploy non parte**, nemmeno con un token. Il comando va dato da una
macchina che arriva a Cloudflare. Tutto il resto — configurazione, build,
verifica della build servita da Workers — e' gia' fatto e passa.
