# NOTES — scostamenti consapevoli e difetti del file

Ogni voce elenca cosa fa il codice, cosa fa il Figma, e perché divergono.
File Figma: `JnQzL6FnsjioRZNZQYoz9Q`. Frame di riferimento in `README.md`.

---

## 1. Decisioni prese su richiesta del committente (18 set 2026)

| # | Decisione | Effetto sul codice |
|---|---|---|
| D1 | Fondo dei blocchi **sempre `rgba(247,246,249,.5)`** | Uniformato. Nel Figma il fondo è misto: opaco su `265:1082`, `266:1123`, `299:310`, `300:354`, `300:432`; al 50% su hero description, skill card, about, form, footer; assente (trasparente) su logo, hero text, CTA, paginazione e frecce |
| D2 | Blocchi viola **restano opachi** e senza bordo | Scelta mia dentro D1: `#603CFF` al 50% su fondo off-white diventa lavanda e perde la funzione di accento. Coerente col Figma, che non applica mai alpha al viola |
| D3 | Linee di griglia **anche sui bordi** del contenitore | Il frame desktop ha solo linee interne (verticali 120→1320, orizzontali da y=120); i frame 390 e 767 hanno anche le linee di bordo. Uniformato sulla versione mobile |
| D4 | Marquee **full bleed a tutti i tier** | Nel Figma sfora solo a 767 (1440px su 767). A 1440 e a 390 è a filo viewport |
| D5 | Frecce prev/next dei testimonial **solo a desktop** | Confermato dal committente. `266:1177` non ha equivalente nei frame 767 e 390 |
| D6 | Ordine di entrata delle Skill card: **Product Design → Web Design → Branding** | Cioè `262:937` → `262:939` → `262:930`. Coincide con l'ordine per riga (9, 10, 12) |
| D7 | Copertina Spotify: **valori reali del Figma** | `get_motion_context` su `301:543`: rotazione da `0.017rad` a `-6.266rad` in **2,515428s**, `linear`, infinita, **senso antiorario**. Non i +360°/1s di `disc-3` proposti in `home-handoff` §9 |
| D8 | Nome canonico del tag: **`Product`** | Il filtro su `/works` dice `Product`, la card di `/works/[slug]` e quella di Seezy su `/works` dicono `Product Design`. Vince `Product` |

## 2. Decisioni prese in autonomia (mandato del committente)

| # | Decisione | Motivo |
|---|---|---|
| D9 | Breakpoint **md ≥ 720px**, **lg ≥ 1200px** | Le fonti ne davano tre serie incompatibili: `grid-system` §2 dice 680/1200, il codice in §3 dichiara solo 1200, `home-handoff` §3 dice 768/1280. A 680 la cella vale 68px contro i 76,7 del disegno (11% sotto) e i due campi affiancati del form scendono a 203px: regge, ma senza margine. 720 dà 72px di cella e nessun campo sotto i 215px |
| D10 | `text-box-trim: trim-both` + `text-box-edge: cap alphabetic` su **tutti** i display Getai | Nel Figma è applicato in modo irregolare: c'è su `274:1931`, `274:1933`, `300:355`, `268:1255`, `266:1126`, `266:1101`; **manca** su `299:311` ("My secret recipe") e `300:433` ("Now playing"), entrambi Getai 40px. Senza trim la posizione dipende dalle metriche di Getai e non è deterministica, quindi uniformo verso il trim |
| D11 | Contatori dei filtri su `/works` **calcolati dalla collection** | Vedi §3.1: il numero scritto nel Figma è sbagliato |
| D12 | Navigazione invariata rispetto al disegno | `/contact` resta raggiungibile solo da bottone header (`Square-button` variante Mail, viola, `lucide/send`), da "Let's work together" (footer e megamenu) e dal Send button. Non aggiungo voci non disegnate |
| D13 | Il tag `" Web Design"` viene normalizzato a `"Web Design"` | Nel Figma ha uno **spazio iniziale** in tutte e quattro le occorrenze (`265:1081`, `310:1447`, `310:1573`, `310:1580`). Uno spazio iniziale in una chiave di filtro è un bug funzionale, non una scelta tipografica |
| D14 | Indicatore di link attivo del footer **derivato dalla route** | Nel Figma è sotto "Home" su tutte e cinque le pagine (`268:1290`, `310:1405`, `310:1694`, `312:2133`, `274:2041`): il footer è stato ricopiato senza aggiornare lo stato |

---

## 3. Errori del file Figma riprodotti o corretti

### 3.1 Il contatore "All: 4" è sbagliato, i progetti sono 3
I tre progetti su `/works` e i loro tag, letti dai nodi:

| Progetto | Nodo | Tag |
|---|---|---|
| Seezy | `310:1607` | Branding, Product Design |
| TAMA caffè | `310:1569` | Web Design |
| Noranutrizione | `310:1441` | Web Design, Branding |

Conteggi derivati: **Web Design 2, Branding 2, Product 1** — che coincidono esattamente con i tre contatori del Figma. Solo "All" dice 4 invece di 3. Non esiste nessun quarto progetto: il numero è stale. Il codice calcola tutti e quattro i contatori dalla collection.

### 3.2 La paginazione del carosello home dice "1/5"
`299:308` mostra `1/5` con tre progetti in collection. Calcolata a runtime.

### 3.3 Blocchi fuori griglia
Nel codice si usa sempre lo **span**, mai il valore in pixel del Figma.

| Nodo | Pagina | Valore | Atteso | Scarto |
|---|---|---|---|---|
| `321:2861` Contact Form | home 767 | y = 3910 | 3850 | **60px** |
| `321:2815` Primary-button | home 767 | 240×120 a y=1882 | 3×1 a y=1848 | istanza mai riscalata dal desktop |
| `310:1798`, `312:1991` | work-page | x = 114, w = 606 | 120, 600 | 6px |
| `312:1990` | work-page | w = 606 a x = 720 | 600 | sfora la colonna 12 di 6px |
| `300:432` "Now playing" | about | x = 839, w = 361 | 840, 360 | 1px |
| `266:1185`, `310:1502`, `312:2170` Contact Form | home, works, contact | h = 719 | 720 | 1px |
| `310:1502`, `310:1530`, `310:1533` | works | y = 2281 / 2401 / 2761 | 2280 / 2400 / 2760 | 1px |
| `321:2823`, `321:2889`, `321:2898` | home 767 | x = 79 / 78 / 76 | 76,7 | 1-2px |
| vari | home 390 | y a 1832, 1871, 1910, 2300, 3082 | 1833, 1872, 1911, 2301, 3081 | 1px |

### 3.4 `--rows` reali, diversi dalla tabella in `grid-system` §3
La tabella contava l'altezza del **frame**, che ha righe vuote in fondo. Qui il fondo del contenuto.

| Pagina | tier | fondo | righe | tabella diceva |
|---|---|---|---|---|
| `/` | lg | 5040 | **42** | 42 |
| `/` | md | 4851 | **63** | 64 |
| `/` | base | 4095 | **105** | 107 |
| `/about` | lg | 3480 | **29** | 30 |
| `/works` | lg | 3480 | **29** | 29 |
| `/works/[slug]` | lg | 5520 | **46** | 46 |
| `/contact` | lg | 1560 | **13** | 13 |
Nel codice `--rows` non è scritto a mano: è derivato dalla mappa di layout come `max(row + rowSpan - 1)`.

### 3.5 Errori di lingua e di fatto riprodotti, non corretti
- `268:1238` / `310:1529` / `312:2197`: *"I agree with the processing my personal data"*, manca una preposizione. Forma corretta: *"I agree to the processing of my personal data"*. **Riprodotto com'è.**
- Marquee `250:196`: l'etichetta **"Teacher"**. L'insegnamento è finito a settembre 2026. **Riprodotta com'è.**
- `274:2065` bio su `/about`: *"I also teach interface design"*, al presente. Stesso problema. **Riprodotta com'è.**
- Il testo del consenso rimanda a una privacy policy che non esiste.

### 3.6 Difetti di contenimento
- `300:354` su `/about`: blocco largo 360px (3 colonne) con dentro un testo largo 438px. Sfora di 78px.
- `321:2900` su home 767: `Active Footer Link Indicator` largo 240px dentro un blocco da 154px.
- `314:2674` / `314:2679` su home 390: frecce del carosello 39×39px, sotto il minimo di 44×44 per il touch.
- `310:1788` su work-page: tag "Product Design" (110px di testo) in una cella da 120px.

### 3.7 Rumore da ripulire nel file
- `grid-bg` è alto 6244px su tutte le pagine, indipendentemente dall'altezza del frame. Su `/contact` il frame è alto 1680.
- Frame `empty` 24×24 residui dentro le voci footer mobile e 767 (`314:2700`, `314:2710`, `321:2998`, `321:3003`).
- Due voci footer con testo chiamato `LinkedIn Link` su mobile e 767: una delle due è Instagram.
- `265:1068` si chiama "Previous Testimonial" ma è la freccia del carosello **works**.
- `Frame 157` indica tre cose diverse; `Frame 164` due; `Frame 103` il titolo di sezione su tre pagine.

---

## 4. Correzioni ai documenti di handoff

Verificate sul file, sostituiscono quanto scritto negli handoff.

1. **Le card progetto NON sono immagini nude.** `home-handoff` §10.3 e `pagine-interne` §7.4 lo affermano sulla base di `get_metadata`, che su questi nodi restituisce frame senza figli. Con `get_design_context` compaiono: titolo Getai Black 24px in un blocco 3×1 e uno o due tag Poppins Bold 14px in blocchi 1×1, tutti nell'ultima riga della card. Vale sia per `265:1044` (home) sia per le tre card di `/works`.
2. **`Icon-1x1` (`266:1158`) contiene `;)`**, Poppins Medium 24px. È decorativo. Chiude la domanda aperta in `home-handoff` §10.5.
3. **Esiste un quinto colore non documentato: `#B0ADB9`** (Light Grey). Usato per: nomi dei testimonial inattivi, placeholder e asterischi del form, bordi della `Testimonial Row`, e **il fondo del Send button**.
4. **Il Send button è disegnato nello stato disabilitato.** `314:2226`, `310:1533` e `312:2199` hanno fondo `#B0ADB9`. Non è un bottone primario viola.
5. **Il filtro attivo su `/works` è disegnato**: `310:1587` ("All") ha fondo `#603CFF` e testo `#F7F6F9`; gli altri tre sono off-white con testo nero.
6. **`Square-button 1x1` ha tre varianti, non due**: `Menu` (`lucide/menu`), `Mail` (viola, `lucide/send`), `Profile` (`lucide/user-round`). La variante Profile è nel blocco bottoni dell'hero, non documentata in nessuna mappa.
7. **Il blocco bottoni dell'hero non è in nessuna mappa.** Dentro `255:762` c'è `257:818` con un `Square-button` variante Profile e un `Primary-button-2x1` "Discover more", che occupano l'ultima riga del blocco 3×3.
8. **Il tier md esiste.** `home-handoff` §10.1 lo dà per non disegnato; il frame `321:2716` è completo e verificato. Restano senza md e senza base le quattro pagine interne e il megamenu.
9. **`get_metadata` è inaffidabile sui figli** su molti più nodi di quanto segnalato: oltre a `274:1855`, restituisce frame vuoti anche per `265:1044`, `310:1607`, `310:1569`, `310:1441`, `310:1735`, `310:1831`, `312:1994`, `310:1798`, `312:1990`, `312:1991`, `310:1802`, `310:1807`. Vale come fonte per coordinate e dimensioni, mai per la presenza di contenuto.
10. **`--baseline` non esiste più.** `home-handoff` §2 lo usa come unità delle line-height; `grid-system` §6 lo ritira. Restano validi i valori assoluti: body 16/24, titolo blocco 24/36, meta 12/24.

---

## 6. Fase 1 — come il sistema garantisce l'invariante

### D15. Linee e blocchi stanno nello stesso grid
`grid-system-handoff` §4 proponeva un `.grid-lines` in `position: absolute; inset: 0` con un proprio
`display: grid` e righe in `1fr`. Non e' stato fatto.

Il motivo e' che sarebbero due griglie distinte: quella del contenuto posa tracce da `var(--cell)`,
quella dell'overlay divide in parti uguali l'altezza *misurata* del contenitore. Con la cella
frazionaria (a 1280px vale 105,4167px) i due algoritmi arrotondano in modo diverso, e su 105 righe
lo scarto si accumula. E' lo stesso difetto che il documento attribuiva al `repeating-linear-gradient`,
spostato di un livello.

Qui le linee sono figlie dello **stesso** `.grid` dei blocchi, sotto di essi per `z-index`. Un solo
algoritmo di layout, un solo arrotondamento. Il nodo `aria-hidden` che le raccoglie ha
`display: contents`, quindi non introduce il livello che si voleva evitare.

Per lo stesso motivo le colonne sono `repeat(var(--cols), var(--cell))` e non `repeat(var(--cols), 1fr)`:
con `1fr` le colonne si dividono la larghezza reale, e basta una scrollbar o un padding perche'
smettano di valere `100cqw / --cols`.

### D16. Il blocco disegna solo il filo alto e sinistro
> **Superata da D44 e D45.** Valeva finche' le linee di griglia e i bordi dei componenti erano dello
> stesso colore. Il ragionamento sul modello di scatola resta valido e spiega perche' i fili non
> sono `border`.
Un `border` in CSS sta **dentro** la scatola. Se un blocco alle colonne 3-5 disegnasse anche il
bordo destro, quel bordo occuperebbe l'ultimo pixel dentro la colonna 5, mentre la linea della
colonna 6 occupa il primo pixel dentro la colonna 6: **due pixel scuri adiacenti invece di uno**.
Il bordo alto e sinistro invece cade sullo stesso pixel della linea e ci si sovrappone senza
ispessirla.

Quindi il blocco disegna `border-top` e `border-left`; il lato basso e il lato destro sono la linea
di griglia successiva, che cade esattamente li'. Questo funziona solo perche' le linee stanno anche
sui bordi del contenitore (D3): e' quello che garantisce che una linea esista sempre a destra e
sotto l'ultimo blocco. Se D3 cambiasse, cambierebbe anche questo.

Visivamente il risultato e' identico al Figma: 1px scuro a ogni confine di blocco. Cambia il
meccanismo, non il disegno.

### D17. `--rows` e' derivato, non scritto
Vedi §3.4 per gli errori che la tabella scritta a mano conteneva. `deriveRows()` in
`src/lib/layout.ts` lo calcola come `max(riga + span - 1)` sui blocchi reali, tier per tier. Se un
blocco scende, la pagina cresce e l'ultima linea scende con lui.

La stessa funzione valida le posizioni: un blocco che sforerebbe l'ultima colonna del proprio tier
fa fallire la build con il nome del blocco, invece di creare una colonna implicita che allarga la
griglia e disallinea tutte le linee.

### D18. Interlinea 1.5 ovunque per Poppins, anche dove l'handoff diceva altro
`home-handoff` §2 dava una tabella con `Meta / location 12px / 24px`. Sul nodo reale (`257:834`,
alto 36px per due righe da 12px) sono **12px/18px**, cioe' 1.5 come tutto il resto. Verificato
anche su `255:763` (72px per due righe da 24px) e `255:794` (72px per tre righe da 16px).

L'unica eccezione e' la citazione dei testimonial, `266:1129`, che e' 24px con interlinea **1.75**.

Nessuna `line-height: normal` nel CSS.

### D19. Query a intervallo per le sole regole di visibilita'
`grid-system-handoff` §2 chiede breakpoint in `min-width`, mobile-first. Vale per tutto tranne due
regole: quella che nasconde un blocco nei tier in cui non esiste, e quella che accende il gruppo di
linee giusto. Li' le tre condizioni devono essere **mutuamente esclusive**, altrimenti un blocco
visibile riceve comunque una dichiarazione di `display` e il suo componente non puo' piu' essere
`grid` o `flex`. Sono scritte con la sintassi a intervallo (`720px <= width < 1200px`).

### D20. Font
- **Poppins**: self-hostato da Google Fonts, sottoinsieme **latino**, solo i pesi **500 e 700**, che
  sono i due che il Figma usa.
- **DT Getai Grotesk Display Black**: fornito dal committente, 16 KB, 135 glifi, nessun carattere
  mancante sul copy del sito. `unitsPerEm` 1000, **cap-height 740**.

Il fallback metrico di entrambi e' calcolato dai woff2 reali con `scripts/font-metrics.mjs`, non
stimato. Il `size-adjust` del peso 700 di Poppins e' calcolato contro Arial Regular e non Arial
Bold, perche' Arial Bold non e' misurabile da qui.

### D21. I due font si pareggiano su grandezze diverse
`size-adjust` puo' pareggiare la larghezza media dei glifi **oppure** la cap-height, non entrambe.
Quale conti dipende dal ruolo del font, e sbagliare non e' una sfumatura:

- **Poppins** e' testo di lettura che va a capo davvero. Conta la **larghezza**: pareggiandola, il
  numero di righe non cambia e il blocco di testo resta alto uguale. `size-adjust: 125.37%` per il
  Medium, `130.33%` per il Bold.
- **Getai** sta sotto `text-box-edge: cap alphabetic`, dove la scatola del titolo vale
  `cap-height x font-size` e **nessun override CSS agisce sulla cap-height**: la puo' spostare solo
  `size-adjust`. Pareggiando la larghezza (140,21%) la scatola di un titolo da 64px passerebbe da
  47px a **64px** e il titolo sfonderebbe la propria cella. Pareggiando la cap-height (**103,31%**)
  cambia invece dove va a capo, che su titoli brevi e quasi tutti `nowrap` si nota molto meno.

`scripts/font-metrics.mjs --match cap|width` calcola l'uno o l'altro.

### D22. La catena di `local()` nei fallback
Gli override sono tarati su Arial, che non esiste ovunque. Il `src` elenca quindi
`Arial, Helvetica Neue, Helvetica, Liberation Sans, Arimo`: Helvetica copre macOS, Liberation Sans e
Arimo coprono Linux e hanno le stesse larghezze di avanzamento di Arial.

Se il `src` non risolve **nessun** font, il `@font-face` e' invalido e gli override non vengono
applicati affatto. E' il modo silenzioso in cui questa tecnica smette di funzionare, e nel primo
giro e' successo davvero: con il solo `local('Arial')` il fallback misurava 41,91px invece di 47,36,
cioe' il font di sistema nudo. `npm run verify:type` lo intercetta.

### D23. `font-display: optional` per Getai, con preload
`swap` sposterebbe i titoli a pagina gia' disegnata, e sotto `text-box-trim` lo spostamento sarebbe
di parecchi pixel (vedi D21). `optional` non fa nessuno scambio a meta' strada: usa Getai se e'
pronto al primo paint, altrimenti tiene il fallback per tutta la vita della pagina. CLS zero in
entrambi i casi. Il `preload` in `Base.astro` fa partire la richiesta insieme all'HTML, cosi'
"pronto al primo paint" e' il caso normale.

Poppins resta su `swap`: li' il fallback e' pareggiato in larghezza e lo scambio non muove niente.

### Verifica
`npm run verify` apre `/grid` in Chromium a 320 · 390 · 430 · 719 · 720 · 768 · 1024 · 1199 · 1200 ·
1280 · 1440 · 1680 · 1920, a tre posizioni di scroll, e misura quanto distano i bordi dei blocchi
dai confini di griglia. Non guarda screenshot: legge le coordinate, perche' uno screenshot a 1440
non mostra uno scarto di 0,3px.

Il metodo non sa nulla della mappa di posizionamento: raccoglie i confini disegnati dalle linee
visibili e per ogni bordo di ogni blocco cerca il confine piu' vicino. Se qualcosa si rompe a monte,
si vede comunque.

Include 719/720 e 1199/1200 perche' il salto di tier e' il punto in cui il sistema ha piu'
probabilita' di sbagliare.

`npm run verify:type` verifica che i titoli display abbiano **esattamente** l'altezza dei text node
Figma. Con `line-height: 1` e `text-box: trim-both cap alphabetic` la scatola vale
`cap-height x font-size` per la prima riga piu' un `font-size` pieno per ogni riga successiva, e la
cap-height di Getai e' 0,74em:

| Nodo | Caso | Atteso (Figma) | Misurato |
|---|---|---|---|
| `310:1336` | "My work", 64px, 1 riga | 47 | 47,36 |
| `266:1126` | "People with good taste", 64px, 2 righe | 111 | 111,36 |
| `264:968` | "What's in the mix", 64px, 2 righe | 111 | 111,36 |
| `266:1101` | hero, 204px, 2 righe | 355 | 354,95 |

E' la conferma che `text-box-trim` e' davvero quello che il Figma applica: i quattro numeri vengono
dai text node, non da una formula riscritta.

---

## 7. Fase 2 — componenti condivisi

### D24. Il Send button e' davvero disabilitato, non dipinto di grigio
`314:2226`, `310:1533` e `312:2199` hanno fondo `#B0ADB9` su tutte e tre le pagine. Non e' un
bottone primario di un altro colore: e' lo **stato disabilitato**, disegnato con il form vuoto. E'
l'unico stato oltre al default che il Figma contenga, insieme al filtro attivo su `/works`.

Nel codice il bottone parte con l'attributo `disabled` nell'HTML, quindi senza JavaScript resta
esattamente com'e' disegnato, e un piccolo listener lo accende quando il form diventa valido.
Renderlo grigio e basta avrebbe riprodotto il pixel e perso il significato.

Il colore del bottone **abilitato** non e' disegnato da nessuna parte: uso il viola degli altri
bottoni primari. E' un'inferenza, segnalata qui perche' e' l'unico modo di avere un form usabile.

### D25. lucide-static 1.47, non 0.544
`blender` non esiste nella 0.x: e' stato aggiunto nella 1.x. Il Figma lo usa su `/about`
(`299:332`), e il glifo renderizzato dal file e' una caraffa da frullatore, non le due
circonferenze sovrapposte di `blend`, che sarebbe stata la sostituzione ovvia e sbagliata.

Tutti e diciassette i glifi sono stati renderizzati e guardati uno per uno prima di considerarli
equivalenti a quelli del Figma. `chef-hat` non e' cambiato fra le due versioni, quindi il favicon
resta valido.

### D26. Le icone sono diciassette, non sedici
`pagine-interne` §5 ne conta sedici. Manca `user-round`, che sta nella variante **Profile** del
`Square-button`, nel blocco bottoni dell'hero: un blocco che nessuna mappa degli handoff elenca.
Resta statica.

### D26-bis. Gli URL social non sono nel Figma
Le etichette "LinkedIn" e "Instagram" ci sono, i link no. Sono stati forniti dal committente e stanno
in `src/lib/site.ts`, non sparsi nel markup, perche' cambiano indipendentemente dal disegno.

### D27. SVG inline, con elenco chiuso
Le icone sono inline nel markup e non `<img src>`: un'immagine esterna non e' animabile, e sette di
queste hanno un'animazione. L'elenco dei nomi ammessi sta in `src/lib/icons.ts` ed e' chiuso: un
nome fuori da li' non compila, e un file lucide mancante fa fallire la build con il nome dell'icona
invece di lasciare un buco scoperto in produzione.

### D28. `max-width` in px sui testi, mai sui blocchi
Il Figma vincola la larghezza di alcuni *testi* per imporre il punto di a capo: il titolo della CTA
e' largo 376px dentro un blocco da 480. E' una proprieta' del testo, non del blocco, e non tocca la
geometria della griglia. Se un testo dovesse sforare il proprio blocco, la sonda di `/grid` lo
segnala fra i "blocchi che sforano".

### D29. Il display scala con la cella a lg
La scala del Figma e' tarata su una cella da 120px, cioe' su un contenitore da 1440. Sotto, la
cella si stringe ma il testo no, e i blocchi piu' stretti non lo contengono piu'. Misurato sul
blocco CTA, che e' 4x3 e ha il margine piu' sottile di tutti:

| Viewport | Cella | Contenuto del blocco | Serve | Avanzo |
|---|---|---|---|---|
| 1200 | 98,75 | 355x256 | 351 | **-95** |
| 1280 | 105,42 | 382x276 | 287 | **-11** |
| 1320 | 108,75 | 395x286 | 287 | **-1** |
| 1366 | 112,58 | 410x298 | 287 | +10 |
| 1440 | 118,75 | 435x316 | 287 | +29 |

Alla larghezza di disegno il margine e' 29px su 316, cioe' il 9%: e' un blocco fragile gia' nel
Figma, e infatti il file lo taglia con `overflow-clip`.

`grid-system-handoff` §2 direbbe di alzare il confine invece di ridurre il testo, ma qui il confine
andrebbe a **1366** e i portatili da 1280 prenderebbero il layout disegnato per 767. Fra le due,
scalare e' la deviazione piu' piccola: a 1280 il titolo e' 56px invece di 64, la composizione resta,
e sopra 1440 il testo non cresce comunque.

La formula e' `min(dimensione, calc(var(--cell) * dimensione / 120))`, applicata ai due ruoli
display a lg. Sotto lg le dimensioni vengono dai frame 767 e 390.

Due correzioni collegate, trovate dalla stessa misura:

- Le larghezze dei testi della CTA sono `min(100%, 307px)` e `min(100%, 376px)`, non percentuali
  pure. In percentuale il lead scendeva sotto i 307px del Figma gia' a 1400 e passava a tre righe:
  era il lead, non il titolo, a far sforare il blocco.
- Il `scrollbar-gutter: stable` che serviva a non far saltare la griglia all'apertura del megamenu (**superato da D58**: la scrollbar di sistema ora e' nascosta e non occupa larghezza)
  costa **circa l'1% su ogni cella**: a 1440 di viewport il contenitore e' 1425 e la cella 118,75
  invece di 120. E' un costo che nessuna alternativa evita, perche' qualunque blocco dello scroll
  toglie la scrollbar, ma va saputo: il disegno a 1440 ha gia' l'1% in meno di quanto il Figma
  assuma.

### D30. Tre grandezze per il logo e per le voci del footer
Lette dai nodi, non stimate.

| Elemento | base (390) | md (767) | lg (1440) |
|---|---|---|---|
| Logo e brand del footer | Getai **20px**, nome su **due righe** | Getai 24px, una riga | Getai 40px, una riga |
| Voce di navigazione del footer | Poppins Bold 12px | 16px | 16px |
| Voce social del footer | 12px, **icona sopra** l'etichetta | 12px, icona sopra | 16px, icona di fianco |

A base il Figma spezza il nome esplicitamente su "Emanuele" / "Giovanili", quindi nel markup sono
due span e l'a capo e' una regola, non un caso.

Le voci del footer non hanno padding sotto lg: nel Figma il testo usa tutta la cella e con 20px per
lato "Instagram" non entra in una cella da 39px. Il gruppo icona piu' etichetta e' centrato invece
che appoggiato in alto come nel file: sono 16px, in una cella che sotto i 390 il disegno non copre
comunque.

L'etichetta ha il tetto a 12px e scala sotto la larghezza di disegno, perche' a 320 (che e' sotto il
frame base, che sta a 390) una voce da due colonne e' larga 61px e "Instagram" a 12px non ci entra.

---

## 8. Fase 3 — la home

### D31. `src/content.config.ts`, non `src/content/config.ts`
Il prompt di progetto indicava la posizione di Astro 4. Astro 5 vuole il file alla radice di `src/`.

### D32. `--u`, il pixel di disegno
E' la decisione piu' grossa della fase, e viene da una misura.

Ogni tier del Figma e' disegnato a una larghezza precisa: 390, 767, 1440. `grid-system-handoff` §2
dice, giustamente, che un layout **regge bene sopra la propria larghezza di disegno e male sotto**,
e che i confini vanno messi perche' ogni layout lavori sopra. Poi pero' fissa i confini a 680 e
1200, cioe' **sotto**: a 1200 la cella vale 98,75 contro i 120 del disegno, il 17% in meno.

Misurato sulla home, con la scala del Figma presa alla lettera:

| Blocco | 720 | 768 | 1200 | 1280 |
|---|---|---|---|---|
| Hero | +33w | +5w | +7w | +5w |
| About | +17h | | | |
| Logo | | | +6h | +3h |
| Testimonial | | | +13h | |
| Form di contatto | +29h | +9h | +14h | |

`--u` e' quanto vale, in questa cella, un pixel del frame: `min(1px, cella / cella-di-disegno)`.
Vale **esattamente 1px alla larghezza di disegno**, scende in proporzione sotto, e sopra non sale
mai. Tutte le grandezze del Figma sono espresse in pixel di disegno: `calc(var(--u) * 20)` invece
di `20px`.

Sostituisce lo `min(64px, calc(var(--cell) * 64 / 120))` della Fase 2, che faceva la stessa cosa ma
solo a lg.

Tre eccezioni, ognuna per un motivo misurato:

1. **Il testo di lettura ha un pavimento a 14px** (`max(14px, calc(var(--u) * 16))`). A 1200 il
   fattore e' 0,82 e un corpo a 13px non e' piu' un testo.
2. **Le larghezze di riga non si scalano.** I due testi della CTA sono vincolati a 307 e 376px nel
   Figma per imporre il punto di a capo. Scalandoli il blocco sforava di **37px a 1200** invece che
   di 1: stringere una riga aggiunge righe, che e' il contrario di quel che serve.
3. **L'hero non si dimensiona in pixel di disegno** ma in frazione della larghezza interna del
   proprio blocco (`25,5cqi`). E' l'unico testo che nel Figma riempie esattamente lo spazio utile
   con `nowrap`: qualunque restringimento lo fa sforare, e a base sfora gia' nel file.

### D33. `--cell` e `--u` sono registrate con `@property`
Senza registrazione, `100cqw` dentro una custom property si risolve sul contenitore dell'elemento
che la **usa**, non di quello che la dichiara. Bastava un `container-type` su un blocco qualsiasi
(e l'hero ne ha uno) perche' tutti i suoi discendenti si ritrovassero una cella diversa. Registrate
come `<length>`, si risolvono una volta sola su `.grid`.

### D34. Gli sfori gia' presenti nel Figma sono dichiarati, non nascosti
Sei blocchi della home non contengono il proprio contenuto **nemmeno nel file**, che li taglia con
`overflow-clip`. Sono marcati in pagina con `data-known-overflow`, che ne porta il nodo e il
motivo, e `npm run verify:grid` li stampa a parte invece di farli fallire: vanno visti, non vanno
confusi con una regressione.

| Blocco | Nodo | Quanto |
|---|---|---|
| Hero | `314:2437` | il titolo a 72px chiede 125px dentro 116 di spazio utile |
| About | `314:2325` | sotto i 390 il corpo guadagna righe che il blocco non ha |
| Selected Works | `314:2336` | titolo piu' didascalia chiedono 57px dentro 38 |
| Testimonials | `314:2372` | il titolo va su tre righe: 88px dentro 77 |
| CTA | `314:2402` | lead e titolo chiedono 156px dentro 155 |
| Form di contatto | `321:2861` | a md il file lo fa alto 633 contro i 616 di otto righe |

### D35. Sotto i 390 non c'e' niente a cui essere fedeli
Il frame piu' piccolo del Figma e' a 390. A 320 le linee restano al loro posto (scarto 0,000px) ma
il logo e il bottone primario sfiorano la cella di tre pixel. La verifica lo misura e lo stampa,
non lo fa fallire: non esiste un disegno con cui confrontarsi.

### D36. La verifica emula un telefono sotto i 720
Con la scrollbar classica il varco riservato da `scrollbar-gutter: stable` toglie 15px su 390, il
4% della larghezza, e i blocchi di testo guadagnano una riga che sul dispositivo reale non hanno. I
telefoni hanno scrollbar a sovrapposizione e il varco vale zero. Senza questa emulazione la
verifica falliva su blocchi che in mano a un utente stanno benissimo.

### D37. La riga dei testimonial e' un blocco a tutti e tre i tier
Nel Figma a lg sta **dentro** il contenitore bordato (`266:1148` e' figlio di `266:1107`), a md e
base e' un blocco separato sopra. Qui e' sempre un blocco, con una posizione per tier: a lg cade
sulla prima riga del contenitore, che parte una riga piu' sotto. Il risultato in pagina e' lo
stesso e il markup delle schede non va duplicato.

Conseguenza minore: nel Figma il filo fra la riga e il testo e' grigio chiaro e largo otto colonne;
qui e' la linea di griglia, scura e larga dieci. Un pixel di sfumatura.

### D38. La sonda misura gli sfori sui rettangoli dei figli, non su `scrollHeight`
`text-box-trim` accorcia la scatola del titolo alla cap-height ma le line box restano alte quanto il
font: `scrollHeight` conta sempre lo scarto che il trim ha appena tolto. Segnalava l'hero come
sforante di 35px a 1440, dove ha 84px di margine. Ora il confronto e' fra i rettangoli dei figli e
il box del contenuto, saltando i figli in posizione assoluta, che stanno dove li hai messi.

---

## 9. Fase 4 — le pagine interne, e il movimento

### D39. Una pagina disegnata solo a desktop tiene le sue dodici colonne ovunque
Le quattro pagine interne dichiarano solo il tier lg. Senza accorgimenti, sotto i 1200 `--cols`
sarebbe passata a 10 mentre i blocchi restavano posizionati per 12: la dodicesima colonna sarebbe
diventata implicita, la griglia si sarebbe allargata e **ogni linea avrebbe smesso di combaciare**.

`Grid.astro` ora dichiara sulla griglia i tier che la pagina usa davvero, e il CSS tiene le dodici
colonne dove il tier lg e' l'unico. Sotto i 1200 quelle pagine diventano un desktop rimpicciolito.
Non e' un disegno, e' il meno peggio finche' un disegno non esiste (B2).

Stessa ragione per la regola che nasconde i blocchi fuori tier: vale solo se la **pagina** dichiara
quel tier, altrimenti sotto i 720 avrebbe nascosto tutto.

### D40. `<Picture>` mette la classe sull'`<img>`, non sul `<picture>`
Il wrapper restava `display: inline` e alto quanto l'immagine, e ogni card progetto si ritrovava un
figlio piu' alto del proprio span: **+70px a 1200**. E' il tipo di errore che uno screenshot non
mostra, perche' il blocco ha `overflow: clip`.

### D41. Lo scroll morbido e' ScrollSmoother, e la struttura che chiede ha una conseguenza
Dalla 3.13 tutti i plugin GSAP sono gratuiti: ScrollSmoother e SplitText inclusi. Niente librerie
in piu', come chiede il prompt.

`#smooth-content` viene **traslato**, e una trasformazione rende l'elemento il contenitore di
riferimento dei propri discendenti in `position: fixed`. Tutto cio' che deve restare ancorato alla
finestra va quindi **fuori**: `Base.astro` ha uno slot `fixed` apposta, gia' usato dal pannello di
debug e pronto per il megamenu della Fase 5.

I due elementi non hanno stile proprio: li imposta ScrollSmoother a runtime. Se il JavaScript non
arriva, la pagina scorre in modo nativo e nulla e' fuori posto.

`normalizeScroll` resta **spento**: sposta su JavaScript anche il tab e le frecce, che su una pagina
con un form devono restare quelle del browser.

### D42. Le linee si disegnano quando le raggiungi
Le **orizzontali** si allungano da sinistra quando entrano nella vista, con uno scarto di 40ms fra
una e l'altra.

Le **verticali** no: attraversano tutta la pagina, e disegnarne una intera in mezzo secondo
mostrerebbe una linea che arriva fin dove non sei ancora. Si allungano verso il basso in proporzione
allo scroll, tenendo il proprio capo appena sotto il bordo inferiore della finestra:
`scaleY` va da `altezza finestra / altezza pagina` a 1, legata allo scroll.

I **bordi dei blocchi** sono un caso a parte, e il motivo e' D16: cadono sulla stessa linea di
griglia, ma il fondo del blocco e' al 50% e la smorza, quindi il bordo serve a riportarla piena. Un
`border` non si puo' accorciare, cosi' il filo e' diventato una coppia di gradienti la cui lunghezza
sta in `--rule-x` e `--rule-y`, registrate come numeri perche' GSAP possa interpolarle.
`background-origin: border-box` li fa partire esattamente dove stava il border, e il valore iniziale
e' 1: **senza JavaScript la pagina resta quella di prima**, ed e' l'animazione ad accorciare i fili
prima di ridisegnarli.

### D43. Il movimento si verifica, non si guarda
`npm run verify:motion` controlla tre cose:

- con `prefers-reduced-motion: reduce` non viene creato niente: scroll nativo, linee intere, fili
  interi;
- senza quella preferenza lo scroll e' morbido e le linee partono corte;
- **arrivati in fondo, ogni linea e ogni filo sono a lunghezza piena.** E' il controllo che conta:
  un'animazione che non si completa lascia un bordo a meta' su una griglia a vista, e si vede da
  tre metri.

`verify:grid` continua a passare con il movimento attivo, e non e' un caso: le orizzontali si
scalano dal lato sinistro e le verticali dall'alto, quindi il bordo che la sonda legge non si
sposta mai.

---

## 10. Correzioni dopo la prima revisione

### D44. Due grigi, non uno
`grid-system-handoff` §3 dava `--line-color: var(--dark-grey)`, cioe' **#504D5C anche per le linee
di griglia**. E' sbagliato, e con un colore solo la griglia e i componenti si confondevano: non si
distingueva piu' un bordo di blocco da una linea di fondo.

I valori corretti, indicati dal committente:

| Ruolo | Colore |
|---|---|
| Linee di griglia | **#D8D6DD** |
| Bordi dei componenti | **#504D5C** |

Il primo non compare nell'elenco stili che il Figma restituisce, ma e' disegnato **dentro l'asset
della copertina Spotify** (`301:522`), che si porta dietro la griglia di pagina: sedici `<line>` in
`#D8D6DD`. E' la prova che il colore delle linee e' quello, ed e' anche il motivo per cui da
quell'SVG la griglia era stata tolta (vedi `src/assets/README.md`).

### D45. Il blocco disegna tutti e quattro i fili
Conseguenza diretta di D44. Finche' linee e bordi erano dello stesso colore, il blocco poteva
disegnare solo il filo alto e sinistro e prendere in prestito dalla griglia gli altri due. Con la
griglia molto piu' chiara quel prestito non regge: un blocco con due lati scuri e due chiari e'
sbilenco.

Ora sono quattro, come nel Figma (`border: 1px solid #504D5C`). Restano gradienti e non `border`
per il motivo di D16: un border non si puo' accorciare, e questi fili si disegnano allo scroll.

Due blocchi adiacenti producono quindi 2px di scuro, esattamente come nel file, dove ogni componente
ha il proprio bordo interno.

### D46. Un `.block` che non e' figlio della griglia e' rotto per costruzione
Il quadrato accanto a "Discover more" era annidato in un contenitore flex insieme al bottone
primario. Le sue custom property di posizione non facevano niente, la larghezza la decideva il flex,
e il flex non sa niente della griglia: la riga era larga quanto il **contenuto** del blocco che la
ospitava, cioe' due pixel meno del blocco, e il confine fra i due bottoni cadeva fuori colonna.

Nel Figma sono annidati davvero (`257:818` sta dentro `255:762`), ma geometricamente stanno su
colonne intere. Qui sono blocchi a se':

| | base | md | lg |
|---|---|---|---|
| Quadrato profilo | `[3,15,2,2]` | `[5,10,1,1]` | `[9,5,1,1]` |
| "Discover more" | `[5,15,5,2]` | `[6,10,4,1]` | `[10,5,2,1]` |

Stessa cosa per le frecce dei testimonial, che erano figlie di un blocco `Testimonials Navigation`
e ora sono due celle alle colonne 10 e 11.

**La sonda ora conta i blocchi che non sono figli diretti della griglia e li fa fallire a qualunque
larghezza.** Non e' una questione di misura, e' un errore di struttura: non dipende dal disegno,
dipende da dove sta il blocco nel markup. Con il controllo attivo, sulle sette route non ne resta
nessuno.

Nello stesso giro il titolo della card progetto e' passato da larghezza-del-testo a un numero intero
di celle (sei a base, quattro a md, tre a lg): con `white-space: nowrap` il suo bordo destro cadeva
dove finiva la parola invece che su una colonna.

### D47. Inerzia dello scroll a 0,8s
Era 0,9. Sta in `src/motion/tokens.ts`.

---

## 11. Fase 5 — il megamenu

Il frame e' `268:1498`, 1440x840: dodici colonne da 120 e **sette** righe, l'ultima vuota. Qui le
righe sono sei e il nero del pannello copre da solo il resto della finestra. A schermo e' identico,
e una riga vuota dichiarata sarebbe una riga che qualcuno un giorno prova a riempire.

| Blocco | Figma | Posizione |
|---|---|---|
| Logo | x=0 y=0 480x120 | `[1,1,4,1]` |
| Let's work together | x=840 y=0 480x120 | `[8,1,4,1]` |
| Chiudi | x=1320 y=0 120x120 | `[12,1,1,1]` |
| Work | x=120 y=120 1200x240 | `[2,2,10,2]` |
| About | x=120 y=360 1200x240 | `[2,4,10,2]` |
| LinkedIn | x=840 y=600 240x120 | `[8,6,2,1]` |
| Instagram | x=1080 y=600 240x120 | `[10,6,2,1]` |

### D48. Tre variabili, non un tema
Il megamenu e' lo stesso sistema con tre valori diversi, dichiarati su `.megamenu__panel`:

| | Sito | Megamenu | Perche' |
|---|---|---|---|
| `--rule-color` | `#504D5C` | `#F7F6F9` | Sul nero il grigio dei componenti sparisce |
| `--block-bg` | off-white 50% | `transparent` | Mezzo off-white sul nero sarebbe una foschia che nel file non c'e' |
| `color` | `#020202` | `#F7F6F9` | — |

Le tinte del frame sono tre: White, Black, Purple. Non ce n'e' una quarta, ed e' il motivo per cui
`--rule-color` era stato separato da `--dark-grey` prima ancora di scrivere il componente:
`--dark-grey` e' anche un colore di testo, e ribaltarlo avrebbe schiarito i `.t-meta` di mezzo sito.

**Nessuna griglia di sfondo** (`<Grid lines={false}>`): sul nero il file disegna solo i blocchi
bordati. E' l'unica griglia del progetto senza linee.

### D49. Il bottone di chiusura non ha filo
`268:1503` e' l'istanza di `Square-button 1x1` con `lucide/x`, e sul nero non mostra nessun bordo,
mentre la stessa variante sul sito ce l'ha come tutti i blocchi. Il componente ha ora una prop
`surface` che scavalca la variante, usata solo qui.

### D50. Il logo del megamenu porta a casa
Nel file e' un frame di testo, non un link. Il menu non ha una voce "Home" (B7) e un logo muto
dentro una navigazione a tutto schermo e' un vicolo cieco: qui e' un link a `/`. Non e' una voce in
piu' (D12 resta), e' l'unico elemento gia' disegnato che possa portarci.

### D51. La tendina si muove, i blocchi no
Il pannello entra da destra (`xPercent` 100 -> 0) e il suo contenuto si contro-trasla della stessa
quantita' (`xPercent` -100 -> 0), con la stessa durata e la stessa curva. Il risultato a schermo e'
che **si muove il ritaglio, non i blocchi**: ogni bordo resta dove sara' alla fine, per tutta
l'animazione. E' l'unico modo di far entrare un pannello senza violare la regola zero.

Dietro alla tendina i fili si disegnano (`--rule-x`/`--rule-y` da 0) e il contenuto compare in
opacita', con lo stesso stagger delle linee di pagina: 0,04s fra un blocco e il successivo.

Sotto `prefers-reduced-motion: reduce` non si costruisce nessuna timeline. Il pannello compare e
sparisce, e tutto il resto — fuoco, `inert`, blocco dello scroll — funziona identico.

### D52. La trappola del fuoco e' `inert`, non un ciclo di keydown
All'apertura `#smooth-wrapper` diventa `inert`: tutto cio' che sta dietro esce dall'ordine di
tabulazione e dall'albero di accessibilita' in un colpo solo. Il fuoco va al bottone di chiusura e
alla chiusura torna alla hamburger — dopo aver tolto `inert`, perche' `focus()` su un elemento
inerte non fa niente. Esc chiude; il resto della tastiera resta del browser.

Lo scroll lo ferma `ScrollSmoother.paused(true)`, che e' chi lo governa. Senza smoother (reduced
motion, o GSAP che non arriva) si torna a `overflow: hidden` sulla radice, che non fa saltare niente
perche' il varco della scrollbar e' gia' riservato da `scrollbar-gutter: stable`.

Senza JavaScript il pannello resta chiuso e la hamburger non fa niente: la navigazione vive comunque
nel footer, che sta su ogni pagina.

### D53. La sonda misura anche una griglia senza linee
Il megamenu non ne disegna nessuna, quindi non ci sarebbero confini da confrontare. Invece di
fidarsi, la sonda legge le **tracce risolte** di `grid-template-columns`/`rows` e le somma dal bordo
del contenitore: sono le stesse coordinate che una linea occuperebbe, lette dal layout del browser e
non ricalcolate da me. `verify:grid` apre il menu su `/` a tutte e tredici le larghezze e lo misura
aperto, a entrata finita.

### D54. Le pagine disegnate solo a lg sparivano sotto i 1200
Trovato aprendo il megamenu a 320px, ma non e' del megamenu: c'era dalla Fase 4 su tutte e quattro
le pagine interne.

`placementStyle()` emette solo i tier che il blocco dichiara, e la catena in `grid.css` guardava solo
verso il basso:

```css
.block { --col: var(--col-base); }
@media (min-width: 720px)  { .block { --col: var(--col-md, var(--col-base)); } }
@media (min-width: 1200px) { .block { --col: var(--col-lg, var(--col-md, var(--col-base))); } }
```

Su un blocco che esiste solo a lg, sotto i 1200 `--col-base` e `--col-md` non esistono: `--col` resta
senza valore, `grid-column: var(--col) / span var(--c)` diventa invalido e il blocco cade in
posizionamento automatico. Misurato a 1024 su `/about`: `grid-column: auto`, rettangolo **0x0**.
L'intero contenuto delle quattro pagine interne, sotto i 1200, non c'era. Restava l'header, che i
tre tier li dichiara tutti.

La catena ora va in tutte e due le direzioni, nello stesso ordine di `resolveTier`: tier corrente,
poi il piu' vicino verso il basso, infine quello verso l'alto.

**Perche' nessuna misura se ne era accorta.** La sonda considerava spento un elemento con rettangolo
nullo — serviva a saltare i blocchi messi a `display: none` da una media query — e quei blocchi
erano accesi e nulli. Venivano scartati tutti, e restava misurato il solo header, che e' allineato:
scarto 0,0000px su una pagina vuota. Ora la prova e' sul `display` calcolato, che e' il meccanismo
vero: un blocco acceso viene misurato anche se misura zero.

E' il secondo caso in cui una verifica passava misurando la cosa sbagliata (il primo era
`scrollHeight` contro `text-box-trim`, D40). Tutte e due le volte il rimedio e' stato misurare il
meccanismo invece del sintomo.

### D55. Il padding non ha mai scalato con la cella
Trovato misurando il megamenu a 320px, e vale per tutto il sito da sempre.

I tre token stavano su `:root`:

```css
:root { --u: 1px; --pad: calc(var(--u) * 20); }
```

Dentro una custom property il `var()` si risolve **sull'elemento che la dichiara**, non su quello che
la usa. Su `:root`, dove `--u` vale 1px, `--pad` diventa `20px` e da li' in giu' eredita **20px
fissi**: `.grid` cambia `--u` tier per tier, ma `--pad` era gia' un numero e non se ne accorgeva.
L'uso diretto (`font-size: calc(var(--u) * 40)` su una regola qualsiasi) e' sempre stato corretto,
perche' li' il `var()` si risolve sull'elemento che lo usa. Era rotta solo l'indirezione.

Non e' un problema di spaziatura. Con `box-sizing: border-box` una scatola non puo' essere piu' bassa
del proprio padding piu' i bordi: in una cella da 26,7px un blocco con 20px di padding per lato era
alto **42px comunque**, cioe' quindici fuori dalla propria traccia, e il suo bordo cadeva a meta' di
un'altra riga. E' cosi' che il megamenu sforava a 320, 390 e 430.

I tre token sono ora ridichiarati su `.grid`, dove `--u` ha il valore del tier. Su `:root` restano
come ripiego per chi stesse fuori da una griglia.

**Effetto sugli sfori gia' noti**, senza toccare nient'altro:

| Blocco | Prima | Dopo |
|---|---|---|
| `about-section` (home) | +44h | +30h |
| `prose` (`/about`) | +18h | +7h |
| `hero-text` (home) | +9h | +5h |
| `recipe-card`, `playlist` (`/about`) | +12h, +3h | spariti |


### D56. Il filo gira attorno alla sagoma, non si gonfia
Prima erano due variabili, `--rule-x` e `--rule-y`: i quattro lati crescevano **insieme**, i due
orizzontali da sinistra e i due verticali dall'alto. Vista da fuori non era una linea che si
disegnava, era una cornice che si apriva a ventaglio da due angoli.

Ora le variabili sono quattro — `--rule-t`, `--rule-r`, `--rule-b`, `--rule-l` — e ciascun lato e'
ancorato all'angolo da cui il tratto **arriva**: alto a sinistra, destro in alto, basso a destra,
sinistro in basso. Il filo parte dall'angolo in alto a sinistra, gira in senso orario e si chiude
dov'era partito. E' un trim path fatto con quattro gradienti invece che con un `stroke-dashoffset`.

**Perche' non un `<svg><rect>` con `stroke-dasharray`**, che sarebbe la via ovvia: lo stroke di un
SVG e' centrato sul tracciato, quindi mezzo pixel cadrebbe fuori dalla scatola e mezzo dentro, e il
bordo non starebbe piu' dove sta la linea di griglia. Rientrarci vorrebbe dire un `viewBox` in
pixel, cioe' misurare ogni blocco in JavaScript e rimisurarlo a ogni resize. I gradienti stanno gia'
esattamente sul border box, ed e' quello che `verify:grid` misura a 0,0000px.

**L'avanzamento e' uno solo**, da 0 a 1 sul perimetro, ripartito fra i quattro lati in proporzione
alla loro lunghezza (`src/motion/trace.ts`). Quattro tween in sequenza avrebbero percorso un lato da
120px e uno da 960px nello stesso tempo, e ogni angolo sarebbe stato uno scatto: con un avanzamento
solo la velocita' e' costante lungo il giro e l'ease vale sul giro intero.

Le misure si prendono alla partenza e non alla costruzione, perche' il megamenu costruisce la
propria timeline al caricamento della pagina e si apre molto dopo.

### D57. Il bottone del menu e' l'unica cosa che non cambia
Richiesta del committente. La tendina entra da destra, quindi il **primo** quadrato che scopre e'
proprio quello in alto a destra, dove sta la hamburger: a 1440 la cella e' la stessa, colonna 12
riga 1, sia nella griglia di pagina sia in quella del menu.

Tre conseguenze:

1. Il bottone del megamenu porta l'icona `menu`, non `x`. La X e' il punto d'arrivo del morph, non
   un'icona diversa.
2. Quel blocco e' **fuori dalla dissolvenza** dei blocchi: e' a opacita' piena dal primo fotogramma.
   Tutto il resto della pagina viene coperto, lui resta.
3. Le due icone `menu` in pagina — quella della hamburger e quella del menu — sono pilotate dalla
   **stessa** sorgente di stato, l'`aria-expanded` della hamburger. Si danno il cambio nell'istante
   in cui il bordo della tendina attraversa quel quadrato, quindi devono trovarsi allo stesso punto
   del morph: due timeline indipendenti si sarebbero sfasate di qualche fotogramma e si sarebbe
   visto un salto.

Misurato: la tendina scopre la dodicesima colonna a circa 0,19s su 0,7, mentre il morph (0,45s) e'
ancora in corso. Quel che si vede e' un quadrato che non si muove, con dentro un'icona che si sta
trasformando, e il resto dello schermo che diventa nero attorno.

Sotto i 1200 le due celle non coincidono per larghezza — la pagina ha dieci colonne, il menu dodici
— ma stanno tutte e due all'estremita' destra della prima riga, quindi il gesto regge. E' un altro
effetto di B2.


### D58. Niente scrollbar di sistema
La scrollbar occupava una quindicina di pixel sul lato destro, e quei pixel non sono una cella: la
griglia partiva a filo a sinistra e lasciava una striscia scoperta a destra. Misurato: a 1440 la
griglia era larga 1425, a 1366 era 1351, e la striscia era sempre 15px.

Per decisione del committente lo schermo deve contenere **solo celle intere**, quindi la scrollbar
sparisce (`scrollbar-width: none` piu' il selettore WebKit per Safari sotto la 18.2). Non e' una
perdita di funzione — lo scroll qui lo governa ScrollSmoother, e rotella, tastiera, touch e trackpad
funzionano identici — ma si perde l'indicatore di posizione, e quello e' il prezzo.

**Effetto che vale piu' della richiesta.** A 1440 la cella torna a valere **esattamente 120px**,
cioe' la cella del frame Figma. Con il varco riservato ne valeva 118,75: tutto il sito stava un
punto percentuale sotto la scala di disegno, e `--u` con lui.

Cade anche `scrollbar-gutter: stable`, che esisteva solo per non far saltare la griglia quando il
megamenu bloccava lo scroll: senza scrollbar non c'e' niente che possa saltare.

### D59. L'ingresso e' mezza schermata, non il varco sotto la piega
Il committente non riusciva a vedere il filo disegnarsi. Non era una questione di durata: la
finestra era sbagliata.

Con `start: 'top bottom'` il tratto comincia quando il bordo alto del blocco tocca il fondo della
finestra, cioe' quando il blocco e' ancora **tutto sotto la piega**. Campionato su una skill card:
meta' del giro succedeva fuori schermo, e quando il blocco diventava visibile il filo era gia' fatto
per tre quarti. Con la finestra che finiva a "blocco entrato per intero", il giro si chiudeva
nell'istante esatto in cui il bordo basso spuntava: il rettangolo intero non si vedeva mai.

Ora la finestra va da `top 90%` a `top 40%` — mezza schermata di scroll, uguale per tutti i blocchi,
alti o bassi — ed e' **agganciata allo scroll** invece che lanciata a tempo. Il filo si disegna
mentre il blocco sale dentro lo schermo, dove lo si vede.

Due dettagli che sono costati due giri di verifica:

1. **I blocchi della prima schermata non hanno un ingresso da fare.** La loro finestra si chiude
   prima dello scroll zero, quindi il trigger non viene mai disegnato e i fili restano a zero, cioe'
   invisibili, per sempre. Un `ScrollTrigger.refresh()` non basta: il trigger non e' in ritardo, e'
   fuori corsa. Quei blocchi si disegnano **a tempo** all'apertura, sfalsati fra loro, che e' anche
   quello che si vuole vedere quando la pagina si apre.
2. **I blocchi dell'ultima schermata non arrivano mai a quattro decimi**: sotto di loro la pagina e'
   finita. `clamp()` sulle due posizioni tiene la finestra dentro la corsa disponibile.

Un blocco spento da una media query non riceve ne' azzeramento ne' trigger: nasce con i fili interi,
cosi' una rotazione dello schermo non lo scopre senza bordo.

### D60. Le immagini si scoprono dall'alto
Richiesta del committente: un reveal allo scroll dall'alto verso il basso, come se il contenitore si
espandesse.

E' un `clip-path: inset(0 0 100% 0)` che si apre da sopra, sulla **stessa finestra** del filo che
gira attorno al blocco: cornice e contenuto si riempiono insieme, e quando il blocco e' entrato
l'immagine c'e' tutta.

Il clip sta **sull'immagine** e non sul blocco. Un blocco bordato non cambia misura nemmeno per un
fotogramma, che e' la regola zero; ma siccome l'immagine occupa tutta la cella, quel che si vede e'
comunque un riquadro che si riempie. La finestra pero' e' quella del blocco che la contiene, non
dell'immagine: e' il contenitore a dettare il tempo.

Le immagini marcate sono le cinque di contenuto (`data-reveal` sui `<Picture>` di `WorkCard`,
`/about` e `/works/[slug]`). La copertina Spotify e' esclusa: ha gia' una rotazione sua, e un taglio
orizzontale su un oggetto ruotato non vuol dire niente.


### D61. Il filo cade sulla linea, non accanto
Il committente ha visto una sovrapposizione su un fermo-immagine. Non era un'impressione: misurati i
pixel dipinti di una skill card a densita' 1,

| lato | pixel |
|---|---|
| alto | `y=200` filo — la linea di griglia e' **coperta** |
| basso | `y=439` filo, `y=440` linea di griglia — **due pixel appaiati** |

Un bordo di un pixel dentro la scatola cade sulla linea solo in alto e a sinistra. In basso e a
destra le sta accanto, perche' la scatola finisce dove la linea comincia. Due lati con un pixel
scuro e due con uno scuro piu' uno chiaro: a schermo sembra un bordo doppio da un lato solo.

I quattro gradienti sono passati dal blocco a uno **pseudo-elemento piu' grande di lui**: si estende
di un `--line` a destra e in basso, cioe' fin sopra le due linee che chiudono il blocco. Ora tutti e
quattro i fili cadono esattamente sulla propria linea. E' la regola zero del progetto portata dalla
scatola al pixel.

Tre cose che sono costate un giro ciascuna:

1. **Il riferimento di un figlio assoluto e' il padding box**, non il border box. Su un blocco
   bordato e' gia' un `--line` dentro e va compensato; su uno senza bordo no. Con i soli valori del
   primo caso il riempimento di un bottone viola sbordava di due pixel invece di uno.
2. **`@property --rule-*` era `inherits: false`.** Lo pseudo-elemento e' un elemento a se': GSAP
   animava il valore sul blocco e lo pseudo continuava a leggere il proprio iniziale, cioe' 1. I fili
   restavano interi e l'animazione non si vedeva affatto.
3. **`overflow-clip-margin: calc(var(--line) * 2)` viene scartata** e il valore calcolato torna a
   zero, quindi il ritaglio di `clip` si mangiava i fili su tutti e quattro i lati. Serve il valore
   per esteso.

E una conseguenza sulla sonda: lo pseudo-elemento sporgente finisce in `scrollWidth`, che lo conta
come contenuto che sfora — due pixel su ogni blocco bordato del sito, 168 misure rosse. Ora lo
sbordo del decoro si scorpora, misurandolo invece di indovinarlo.

### D62. `verify:edges` — una verifica sui pixel dipinti
`verify:grid` misura le **scatole**, e le scatole erano giuste: scarto 0,0000px mentre il disegno era
sbagliato di un pixel su due lati. Nessuna delle misure esistenti poteva accorgersene, e infatti a
trovarlo e' stato l'occhio del committente su un fermo-immagine.

`scripts/verify-edges.mjs` ritaglia strisce alte o larghe un pixel che attraversano i quattro lati di
cinque blocchi diversi, le legge con sharp a densita' 1 — un pixel dell'immagine e' un pixel CSS — e
controlla due cose per lato: che il filo ci sia dove deve, e che **subito fuori** non resti griglia
scoperta. Controlla anche che lo strato dell'hover copra il blocco piu' esattamente un pixel.

### D63. L'hover dei bottoni
Disegnato dal committente: `258:872` per il quadrato, `314:2215` per il primario. E' un'inversione.

| | default | hover |
|---|---|---|
| Mail | viola, icona off-white | off-white, icona nera |
| Menu | off-white, icona nera | viola, icona off-white |
| Menu Open | nero, X off-white | viola, X off-white |
| Profile | off-white, icona nera | il **ritratto** di `/about` |
| Primario | viola, testo off-white | off-white, testo nero |

Il riempimento sale dal basso, come richiesto. Il meccanismo e' un secondo strato sovrapposto che
porta il proprio fondo **e una copia del contenuto** nel colore d'arrivo; un `clip-path` li ritaglia
insieme. E' questo che fa cambiare colore all'icona e alla scritta **esattamente dove passa il bordo
del riempimento**: con una copia sola si potrebbe solo farle cambiare tutte in una volta a meta'
strada.

I fili **restano** anche in hover: vedi D64, che corregge la prima versione di questa decisione.

Tre note:

- **E' una transizione CSS, non una timeline GSAP.** L'hover non ha bisogno di JavaScript e senza
  JavaScript deve funzionare lo stesso. Durata e curva stanno in `--hover-time` e `--hover-ease`.
- **Solo dove c'e' un puntatore** (`@media (hover: hover)`): su touch `:hover` resta appiccicato dopo
  il tocco e il bottone resterebbe riempito finche' non se ne tocca un altro.
- **Le frecce dei caroselli** riusano la forma del `Square-button 1x1` e prendono lo stesso hover,
  pur non avendo una variante propria nel file. Su una freccia disabilitata non parte.

Il "Let's work together" del footer e del megamenu erano due `Block` scritti a mano: sono diventati
`PrimaryButton`, che e' quello che sono nel file, e con questo hanno preso l'hover.


### D64. Il filo resta anche in hover
Prima versione: i fili si spegnevano col ritaglio complementare mentre il riempimento saliva, perche'
il Figma disegna il Menu Hover come viola pieno senza bordo (258:869).

Il committente ha chiesto il contrario, e ha ragione: senza contorno un bottone riempito di off-white
su una pagina off-white **galleggia**, e il blocco esce dalla griglia proprio nell'istante in cui lo
stai puntando. E' una deviazione voluta dal file, in nome dell'invariante del progetto.

Due casi:

- **Bottone bordato** (il menu): non c'e' niente da fare. Lo pseudo-elemento che disegna i fili e'
  l'ultimo figlio, quindi sta gia' sopra al riempimento; e' bastato togliere il ritaglio e lo
  `z-index` che lo strato si era preso.
- **Bottone viola** (mail, primario): il filo non esiste, perche' un blocco viola non ha bordo (D2).
  Lo porta **lo strato stesso**, come immagine di sfondo sopra al proprio colore, cosi' viene
  ritagliato insieme al riempimento e cresce con lui invece di comparire tutto in una volta.

`verify:edges` ora controlla anche questo: si mette in hover su tre bottoni, aspetta la fine della
transizione e rilegge i quattro lati.

### D65. Sul bordo della griglia il filo torna dentro
Conseguenza di D61, trovata dalla verifica appena e' stata estesa all'hover.

Un filo che sporge di un pixel cade sulla linea di griglia che chiude il blocco. Ma **sul bordo del
contenitore quella linea e' disegnata dall'altra parte**: l'ultima verticale sta dentro l'ultima
colonna, non fuori, altrimenti finirebbe oltre lo schermo e non si vedrebbe. E' l'eccezione che le
linee `data-edge` hanno da sempre, e i blocchi devono seguirla. Misurato: il filo destro del bottone
del menu, che sta in dodicesima colonna, cadeva sul pixel 1440 di uno schermo largo 1440.

Non serve nessun dato in piu': `--col` e `--c` stanno sul blocco, `--cols` e `--rows` sulla griglia,
e due `max()` bastano.

```css
--edge-x: max(0, calc(var(--col) + var(--c) - var(--cols)));
--edge-y: max(0, calc(var(--row) + var(--r) - var(--rows)));
```

Un blocco che finisce all'ultima colonna da' 1, tutti gli altri zero. Il decoro e lo strato di hover
lo sommano al proprio scostamento e tornano dentro.

Nello stesso giro: `border: 0` esplicito sui blocchi `accent` e `bare`. Su un `<button>`, senza,
resta il bordo dell'UA — `outset`, che su fondo scuro disegna una L grigia in alto a sinistra. Si
vedeva sul bottone di chiusura del megamenu, l'unico blocco `bare` cliccabile del sito.

### D66. Megamenu: una colonna di rientro, e sette righe piene
Il committente ha mandato un fermo-immagine del file e tre correzioni. La mappa ora e' questa:

| Blocco | base (10 col) | md (10 col) | lg (12 col) |
|---|---|---|---|
| Logo | `[1,1,5,2]` | `[1,1,6,1]` | `[1,1,4,1]` |
| Chiudi | `[9,1,2,2]` | `[10,1,1,1]` | `[12,1,1,1]` |
| Let's work together | `[2,12,8,2]` | `[7,1,3,1]` | `[8,1,4,1]` |
| Work | `[2,4,8,3]` | `[2,3,8,3]` | `[2,2,10,2]` |
| About | `[2,7,8,3]` | `[2,6,8,3]` | `[2,4,10,2]` |
| LinkedIn | `[2,10,4,2]` | `[4,9,3,2]` | `[8,6,2,2]` |
| Instagram | `[6,10,4,2]` | `[7,9,3,2]` | `[10,6,2,2]` |

**1. Niente full width: una colonna di rientro per lato, a ogni tier.** Non e' una regola nuova, e'
quella del file: a desktop le voci stanno da 2 a 11 di 12. La riga 1 fa eccezione e va da bordo a
bordo — logo, CTA, chiudi — perche' cosi' e' disegnata.

**2. I social si attaccano sotto ad About e occupano due righe.** Il frame e' alto 840, cioe' sette
righe da 120, e i nodi ne riempiono sei: con i social in sesta e settima il menu riempie il frame
invece di lasciarne fuori un ottavo. E' la lettura che torna con la misura del file, ed e' quella
che il committente ha chiesto.

A base la voce social va a `padding: 0`: quattro celle da 39 fanno 156px e "Instagram" piu' la
freccia ne chiedono 132, che con 20px per lato non ci starebbero. E' la stessa cosa che fa gia' la
voce social del footer sotto lg.

**3. La hamburger diventa nera al click e ci resta.** E' la variante `Menu / Open` (268:1518). Prima
restava off-white finche' la tendina non le passava sopra, e siccome dopo un click il puntatore e'
fermo li', l'hover la faceva diventare viola. Il file ha anche un `Menu / Open Hover` viola
(268:1555): per decisione del committente **non si usa**, ne' sulla hamburger ne' sul bottone di
chiusura del pannello. Aperto e' nero, e basta.

Lo stato e' `aria-expanded`, lo stesso che pilota il morph dell'icona: uno solo, e non si puo'
desincronizzare.

**Cosa resta proposta.** I tier base e md: un frame per gli schermi piccoli non esiste. Le scelte
derivate, non inventate, sono sempre quelle: il bottone di chiusura nella cella della hamburger di
pagina tier per tier (D57), il logo che copia quello dell'header, la CTA che a base scende a fondo
come fa gia' il footer, e il rientro di una colonna che e' la regola del punto 1.

Misurato: 13 righe a base (507px), 10 a md (767px), 7 a lg (840px, cioe' il frame esatto). Nessuno
sforo a nessuna delle tredici larghezze.

### D67. Il bottone di chiusura ha il filo
Era `bare`, cioe' senza superficie: nel pannello nero risultava un quadrato senza contorno, e
usciva dalla griglia. Ora e' un blocco bordato come gli altri — fondo nero al 50% sul nero del
pannello, cioe' nero, e filo off-white come tutto il resto del megamenu.

Resta fuori **anche dal giro del filo**, oltre che dalla dissolvenza: quel quadrato non si
costruisce sotto gli occhi di chi guarda, e' gia' fatto quando la tendina lo scopre (D57).

`verify:edges` ora apre il megamenu e misura i fili di due suoi blocchi, con l'off-white come
colore atteso invece del grigio dei componenti.

---

## 12. Fase 5 — marquee, carosello, testimonial

### D68. Il marquee scorre, e il passo lo decide la misura
Il file chiama quel layer "Marquee autoscroll" ma non dice ne' a che velocita' ne' con che
spaziatura: a 1440 mette le cinque parole distribuite sull'intera larghezza, che e' una
composizione **ferma**.

Il punto e' tutto nel passo. Si misura quanto spazio avanza fra le parole quando un solo giro
riempie esattamente il contenitore, e quello diventa il gap:

```
passo = (larghezza utile − somma delle parole) / numero di parole
```

Si divide per `n` e non per `n − 1` come farebbe `space-between`: un passo in piu' serve fra
l'ultima parola di un giro e la prima del giro dopo, altrimenti la sequenza si incolla a se'
stessa. In cambio il ciclo e' largo quanto il contenitore, e la ripetizione non ha salti. E' uno
scarto di un passo su cinque rispetto alla distribuzione ferma.

Da fermo — senza JavaScript, o sotto reduced motion — restano la distribuzione e il passo del
Figma. Misurato a 1440: passo 143,2px, tre copie della lista, 70px al secondo.

**La velocita' e' in pixel al secondo e non in secondi per giro**, cosi' su uno schermo largo il
testo non scorre piu' in fretta. 70px/s e' una scelta, tarata perche' una parola da 32px resti
leggibile mentre passa.

Si ferma sotto al puntatore e quando qualcosa dentro prende il fuoco. Non e' nel Figma: e' il
requisito 2.2.2 delle WCAG, che su un contenuto in movimento automatico piu' lungo di cinque
secondi chiede un modo per metterlo in pausa.

### D69. Il carosello non gira in tondo
Il file mostra una paginazione e due frecce. Un contatore che dice a che punto sei ha senso se una
fine c'e': ai capi la freccia si disabilita, e l'animazione dell'icona non parte, che era gia'
previsto in `icons.ts` (§12 degli handoff: "quando la freccia e' disabilitata l'hover non deve
partire").

La slide che esce e quella che entra scorrono insieme, nella direzione del comando. Non e' un blocco
che si muove: le slide sono contenuto dentro un blocco che resta dov'e'.

**Il ritaglio sta su un contenitore proprio**, non sul blocco. Il blocco bordato concede al proprio
filo due pixel oltre il padding box (D61), e in quei due pixel si sarebbe vista spuntare la slide in
uscita.

### D70. Carosello e testimonial stanno fuori dal contesto del movimento
Tutto il resto vive dentro `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`, e sotto
reduced motion semplicemente non esiste. Questi due no: **cambiare slide o scheda e' un comando**,
e un comando deve funzionare sempre. Li' il cambio dura zero e l'avanzamento automatico non parte,
che e' esattamente quello che quella preferenza chiede.

### D71. I testimonial sono pronti per testi che non ci sono
Il modulo fa quello che serve — tablist, frecce da tastiera fra le sole schede raggiungibili,
dissolvenza del pannello, avanzamento automatico con la barra come conto alla rovescia — ma oggi
**non fa niente di visibile**, perche' le schede selezionabili sono una sola (B13).

Due conseguenze scritte apposta:

- **L'avanzamento automatico parte solo da due schede in su.** Con una sola non c'e' nessun
  avanzamento da annunciare, e la barra resta piena invece che a zero: una barra a zero sotto la
  scheda attiva sembra rotta.
- **Il testo di ogni scheda viaggia sui suoi attributi**, non in un secondo pacchetto di dati
  spedito a parte. Al server la lista la conosce gia' Astro; al client serve solo poterla
  rileggere.

Nel Figma la barra e' a 191 su 240, cioe' tre quarti: un fermo-immagine a meta' corsa, che e'
l'unico indizio del fatto che l'avanzamento automatico esista. La durata, 7 secondi, e' una scelta.


### D72. Il filo basso del marquee non c'era
Segnalato dal committente. Il marquee non e' un blocco bordato: sfora di proposito su tutta la
larghezza della finestra, e i suoi due fili se li disegna da solo — quello alto e' un `border-top`,
quello basso uno pseudo-elemento un pixel sotto, per cadere sulla linea di riga invece che
affiancarla (stessa regola di D61, scritta a mano).

Il ritaglio che serve al testo che scorre se lo mangiava: lo pseudo-elemento sta **fuori** dal
padding box, e `overflow: clip` nudo non lo disegna affatto. Due pixel di
`overflow-clip-margin` bastano, gli stessi dei blocchi bordati — e anche qui il valore va scritto per
esteso, perche' con un `calc()` su custom property la dichiarazione viene scartata (D61).

`verify:edges` ora controlla anche i due fili del marquee, su una colonna lontana dalle parole.

### D73. Titolo e categorie spuntano dal basso
Richiesta del committente: un effetto su nome e categorie delle card progetto, in sequenza.

I riquadri stanno appoggiati al fondo della card (265:1075) e sono blocchi bordati a tutti gli
effetti, larghi un numero intero di celle. Salgono uno dopo l'altro — prima il titolo, poi le
categorie nell'ordine in cui stanno — da sotto il bordo della card.

**La maschera e' il contenitore**, che non si muove: sono i riquadri a traslare dentro di lui. Non
serve un wrapper per ognuno, perche' il gruppo e' gia' un elemento a se' appoggiato al fondo, e
basta dargli `overflow: clip`. Nessun blocco della griglia si sposta.

Parte in due momenti:

- quando la card arriva nella vista, come tutto il resto del sito;
- quando una slide del carosello diventa quella attiva, perche' li' la card e' nuova e si compone
  davanti a chi guarda.

Tre trappole, tutte trovate misurando e non guardando.

**1. Il trigger stava sulla card, e i riquadri stanno in fondo alla card.** Una card e' alta cinque
celle: con `start: 'top 85%'` sul suo bordo alto l'animazione partiva quando i riquadri erano ancora
quattrocento pixel sotto la piega, e finiva prima che diventassero visibili. C'era e non si vedeva
mai. E' lo stesso errore di D59, che li' riguardava il filo, e la correzione e' la stessa: il
trigger va sull'elemento che si anima, non sul suo contenitore. Ora sta sul gruppo dei riquadri con
`start: 'bottom bottom'`, cioe' il primo istante in cui il gruppo e' entrato per intero.

Misurato a finestra 800: prima partivano col gruppo a `808..928`, cioe' fuori; ora a `628..748`.

**2. Al cambio slide salivano mentre la slide era ancora in viaggio.** Lo scorrimento dura 0,55s e i
riquadri ne duravano 0,5: finivano prima che la slide si fermasse. Ora partono a scorrimento finito,
che e' il primo istante in cui la slide e' ferma e tutta visibile. Misurato: fermi fino a 450ms,
salgono a 620ms.

**3. La timeline di una slide nasce mentre la slide e' `hidden`**, e li' l'altezza e' zero, cioe' il
100% da cui i riquadri dovrebbero salire vale zero pixel. Al cambio slide serve `invalidate()`, e
subito dopo un `pause(0)` che li rimanda sotto la maschera mentre la slide viaggia.

Le durate sono una scelta — l'effetto non e' nel Figma — abbastanza lente da leggersi e abbastanza
sfalsate da sentirsi come una sequenza e non come un blocco solo che si alza.


### D74. `hidden` perdeva contro `display: block`
Il committente ha descritto quello che vedeva nel video: il primo progetto senza titolo ne'
categorie, poi un "avanti" che mostrava per un attimo il progetto giusto e tornava su quello
sbagliato. Non erano due difetti dell'animazione: era **una sola slide che ne copriva tre**.

Nel foglio di stile dell'UA `[hidden]` vale `display: none`, ma ha la specificita' di una classe.
`.works-card__slide { display: block }` lo scavalcava. Misurato: tutte e tre le slide con
`display: block`, due delle quali marcate `hidden`.

Le slide sono `position: absolute; inset: 0`, quindi si sovrapponevano tutte nello stesso posto e a
schermo vinceva **l'ultima del markup**, che e' l'ultimo progetto per ordine. I suoi riquadri erano
a `yPercent: 100` perche' per il JavaScript quella slide era nascosta e la sua timeline non era mai
partita: da qui "senza titolo e campi". E ogni comando del carosello muoveva slide che nessuno
poteva vedere.

La regola sta ora nel reset, con `!important`, ed e' il punto: **`hidden` e' un'affermazione di
stato, non di presentazione**, e non deve poter essere contraddetta da una regola di impaginazione.
E' il rimedio che i reset moderni adottano da anni.

`verify:motion` ora controlla che nessun elemento con `hidden` abbia un `display` diverso da `none`.
Sembra un controllo ovvio: non lo e', ed e' l'unico modo perche' una regola d'autore che scavalca
uno stato non passi di nuovo in silenzio.

Verificato dopo: Seezy -> TAMA caffe' -> Noranutrizione -> TAMA caffe', una sola slide visibile per
volta tranne durante lo scorrimento, e i riquadri che salgono da 120 a zero a scorrimento finito.

**Uno strascico, scoperto subito dopo.** Con le slide finalmente nascoste davvero, le loro immagini
non si caricavano piu': solo la prima e' `eager`, le altre sono `lazy`, e dentro a `display: none` il
browser non le carica **affatto** — non le rimanda, proprio non parte. Al primo "avanti" la slide
arrivava vuota e l'immagine compariva dopo. Prima non si vedeva solo perche' le slide erano tutte
visibili per sbaglio, il che le teneva in carico.

Si promuovono a `eager` quando il browser ha un momento libero (`requestIdleCallback`), e si chiede
anche la decodifica: scaricata non basta, perche' decodificare un'immagine grande costa un
fotogramma e quel fotogramma cadrebbe proprio sul cambio slide. Misurato campionando una riga di
pixel della card durante tutto lo scorrimento: zero pixel di fondo scoperto, in ogni istante.


---

## 13. Fase 6 — la pubblicazione

### D75. Ogni link interno costava un viaggio in piu'

Il sito scrive `href="/about"`, senza barra finale, e la build mette la pagina in
`dist/about/index.html`. Servita da Workers con le impostazioni predefinite,
`/about` risponde **307** e rimanda a `/about/`: la pagina arriva, ma dopo un
secondo giro completo, e all'indirizzo che il markup non usa. Su ogni
navigazione, su ogni pagina.

Misurato, non dedotto: sette route interrogate sul runtime di Cloudflare, sei
rispondevano 307.

`"html_handling": "drop-trailing-slash"` serve la pagina all'indirizzo che il
sito usa davvero, e toglie la barra a chi la scrive. Ora tutte e sette
rispondono 200 al primo colpo, e `/about/` e' quella che rimanda alla forma
canonica.

### D76. I font si ricontrattavano a ogni visita

I file sotto `/_astro/` hanno l'impronta nel nome e Workers li tiene per sempre
da se'. I font no: il nome ce l'hanno fisso, e prendevano
`max-age=0, must-revalidate` — cioe' una domanda al server prima di poter
disegnare il testo, a ogni pagina. `public/_headers` li dichiara immutabili: se
un giorno cambiassero, cambierebbe il nome.

Nello stesso file due intestazioni che non c'entrano con la cache e che un sito
pubblico dovrebbe avere: `X-Content-Type-Options: nosniff` e
`Referrer-Policy: strict-origin-when-cross-origin`.

### D77. Si verifica la build, non solo il sorgente

Tutte le sonde di questo progetto hanno sempre misurato `astro dev`. Fra quello
e quel che va online ci sono quattro differenze: il CSS e' minificato, i nomi
hanno l'impronta, `/grid` non esiste piu', e davanti c'e' Workers con le sue
regole. Quattro posti in cui un difetto puo' stare senza che nessuna misura lo
veda — che e' esattamente la forma di errore che in questo progetto e' gia'
passata tre volte (D59, D61, D74).

`scripts/verify-build.mjs` costruisce, serve la build con `wrangler dev`, e
rimisura li': gli indirizzi (200 al primo colpo, `/grid` in 404), le richieste
di ogni pagina (niente 404, niente errori in console) e poi le due sonde di
sempre, puntate sul server di Workers invece che su quello di sviluppo.

`verify-grid.mjs` ha preso un `--paths` per questo: senza, andava a cercare
`/grid`, che nella build non c'e' piu'.

**Esito sulla build, non sul sorgente:** 286 misure su 7 route, scarto massimo
**0,0038px**; 45 controlli a livello di pixel sui fili; 21 pagine caricate a
390, 768 e 1440 senza un errore in console ne' una richiesta fallita.

### D78. Il worker si chiama `emanuelegiovanili`

Un indirizzo `workers.dev` ha la forma `<nome-worker>.<sottodominio>.workers.dev`,
e la prima etichetta c'e' sempre. Il committente ha scelto `emanuelegiovanili`
per il nome del worker: e' l'unica delle due parti che si decide qui, perche' il
sottodominio si sceglie una volta sola sull'account e in questo momento non e'
ancora stato assegnato.

Nel codice non c'e' niente che dipenda dal nome. Non ci sono URL assoluti in
pagina, i link interni sono tutti relativi alla radice, e il worker non sa dove
sta: cambia solo l'indirizzo.

### D79. Il deploy passa dalla sonda, e pubblica quello che ha misurato

`.github/workflows/deploy.yml`: su push al ramo di produzione costruisce,
misura, e pubblica. In quest'ordine, e senza ricostruire in mezzo: i byte che
vanno online sono gli stessi che sono passati sotto la sonda. Ricostruire dopo
la verifica vorrebbe dire pubblicare qualcosa che nessuno ha guardato.

La sonda che gira e' `verify:build`, non tutte. Le altre misurano il sorgente, e
il sorgente e' gia' quello che e': qui interessa la cosa pubblicata.

**Una conseguenza immediata.** Mettere `npm run check` nel workflow ha fatto
saltare fuori un errore di tipi che c'era gia' e che nessuno vedeva: `verify` non
chiama `astro check`, e nessuno lo lanciava a mano. In `carousel.ts`,
`if ('requestIdleCallback' in window)` restringeva il ramo `else` a `never`,
perche' quella funzione e' ormai dichiarata come sempre presente. TypeScript
considerava irraggiungibile proprio la ripiegatura che esiste per i Safari
vecchi. L'annotazione esplicita a `| undefined` la tiene viva.

E' la quarta volta in questo progetto che un difetto sopravvive perche' nessuna
misura lo guardava (D59, D61, D74, e questo).

### D80. Il nome del worker non e' un'impostazione del sito

Nel codice non c'e' niente che dipenda dal nome: cambia solo la prima etichetta
dell'indirizzo `workers.dev`. Il sito non sa dove sta, non ci sono URL assoluti
in pagina, e i link interni sono tutti relativi alla radice.

### D81. Pubblicato, e il sottodominio se l'e' scelto Cloudflare

Prima run verde il 19 settembre 2026: 130 file caricati, worker
`emanuelegiovanili` attivo su

    https://emanuelegiovanili.emanuele-giovanili-ap.workers.dev

Il sottodominio dell'account non e' stato chiesto a nessuno: Cloudflare lo
deriva dall'indirizzo email al primo worker. Di qui la ripetizione
`emanuelegiovanili.emanuele-giovanili-ap`, che e' brutta ma non e' un difetto
del sito: e' un'impostazione dell'account, e si cambia dal pannello senza
toccare una riga di codice. La risposta vera e' un dominio proprio.

**Cosa ha dimostrato la corsa.** La sonda ha girato su una macchina GitHub
pulita, con un Chromium diverso da quello di questo ambiente: 286 misure,
scarto massimo 0,0038px, 45 controlli sui fili, 21 pagine senza un errore in
console. L'invariante non dipendeva dall'ambiente in cui e' stato costruito.

**Quello che non ho potuto misurare.** Il sito pubblicato non lo raggiungo:
`workers.dev` e' bloccato dal proxy di uscita come `api.cloudflare.com` e
`figma.com`. Di quell'indirizzo ho la parola del log di wrangler, non una mia
misura. La verifica sul vivo tocca al committente.

---

## 14. Fase 7 — nove correzioni dal committente

### D82. I bordi si chiudono prima di meta' schermo

La finestra d'ingresso andava da `top 90%` a `top 40%`: il filo si chiudeva
quando il bordo alto del blocco era **sopra** la meta' dello schermo, cioe'
quando il blocco l'aveva gia' passata. Ora va da `top 95%` a `top 60%`: il
bordo alto e' ancora nella meta' bassa quando il giro finisce, quindi il blocco
arriva al centro gia' fatto, qualunque sia la sua altezza.

### D83. Una slide nascosta ha sempre i campi giu'

Tornando indietro nel carosello si vedevano i campi gia' alzati, poi
l'azzeramento, poi l'animazione: il committente ha descritto la sequenza
esatta. La slide che usciva restava a fine corsa, e chi la rivedeva la trovava
cosi' per il fotogramma prima che GSAP rendesse — `pause(0)` sposta la testina,
ma il disegno arriva al tick dopo, e in mezzo il browser ha gia' dipinto.

`resetCardMeta` scrive lo stile **adesso**, con un `gsap.set`, e il carosello lo
chiama nel momento in cui la slide sparisce. Non c'e' piu' nessun fotogramma in
cui una slide visibile abbia i campi su prima del tempo.

Misurato da `verify:motion`, che ora guarda lo stato a riposo delle slide
nascoste dopo un avanti e un indietro.

### D84. I nomi dei clienti hanno un filo, e a base vanno a capo

Il committente ha chiesto il bordo attorno a ogni nome. Un bordo deve cadere su
una linea di griglia, e a base la riga era **a scorrimento orizzontale**
(home-handoff §4-bis): dentro un contenitore che scorre il filo si stacca dalla
sua linea appena trascini. Le due cose non stanno insieme.

Il blocco della riga a base e' alto due celle, quindi quattro schede da quattro
colonne ci stanno esatte: 2x2, ogni lato su una linea, niente scorrimento. Da md
in su restano su una riga sola come nel file.

**E le tracce sono fisse, non `flex`.** Quattro schede a `flex-basis: cell * 2`
dentro otto celle fanno una somma esatta in aritmetica e non in layout: a 719px
di viewport arrotondavano un capello oltre il contenitore e l'ultima scheda
andava a capo, raddoppiando l'altezza della riga. A 720 e 768 no. E' il modo in
cui un errore di sotto-pixel si fa riconoscere, e l'ha trovato `verify:grid`.

### D85. La sonda sa che un figlio puo' disegnare un filo

Le schede stanno dentro un blocco `bare` e il filo se lo disegnano da sole:
l'ultima sporge di un pixel oltre il contenitore, che e' il pixel della linea, e
`scrollWidth` lo contava come sforo. Lo scorporo del decoro c'era gia' per i
blocchi bordati e per i bottoni; ora c'e' anche per chi dichiara `data-ruled`.

Nello stesso passaggio e' sparita l'esenzione per i contenitori che scorrono:
c'era per questa riga, e questa riga non scorre piu'. Restava solo un modo per
non vedere lo sforo di qualunque cosa avesse un `overflow: auto`.

### D86. I testimonial girano, e girano quando li guardi

Dieci secondi a scheda, barra viola che si riempie, passaggio automatico alla
successiva. Le tre schede senza testo hanno una citazione **vuota**, non
inventata: servono a far girare la rotazione finche' i testi veri non
arrivano (B13 resta aperto).

**Il conto alla rovescia parte quando la riga entra in vista**, non al
caricamento. Non l'ha chiesto nessuno: l'ha trovato `verify:motion`, che ha
misurato la barra a **0,88** appena aperta la pagina. I testimonial stanno in
fondo, e chi ci arrivava dopo venti secondi di scroll trovava la rotazione gia'
al terzo giro. Dieci secondi a scheda vogliono dire dieci secondi *di chi
guarda*. E' anche la cosa giusta comunque: niente che si muove da solo fuori
dallo schermo.

### D87. Le frecce dei testimonial esistono anche sotto i 1200

Nel file ci sono solo a lg. Sotto, il carosello dei testimonial non aveva
comandi: si poteva solo aspettare. Ora stanno nelle ultime due colonne del
contenitore, riga subito sotto, che e' la stessa regola con cui stanno le frecce
del carosello dei lavori.

### D88. Hover sulle voci del megamenu, e sul bottone di chiusura

Stesso meccanismo dei bottoni: uno strato che sale dal basso con dentro una
copia del contenuto nel colore d'arrivo, e il ritaglio che li taglia insieme.

Dentro al pannello il riempimento e' **off-white**, non viola: su pagina chiara
un blocco che si riempie diventa viola perche' il fondo e' chiaro, ma qui il
fondo e' nero, e viola su nero non e' un'inversione, e' un secondo colore scuro.

Sul bottone di chiusura l'hover era spento insieme a quello della hamburger di
pagina, che a menu aperto resta nera. Sono due bottoni diversi e due stati
diversi: ora la regola riguarda solo la hamburger.

**Il filo, dentro al pannello, e' dello stesso colore del riempimento.** Non e'
un difetto: su nero e' il riempimento stesso a fare da bordo, e quello che va
verificato e' che il suo margine cada sulla linea. `verify:edges` lo controlla
cosi', con il colore del pannello al posto di quello del filo.

### D89. I social del megamenu sono alti una cella

Erano due, per riempire il frame. Il committente li ha visti troppo alti.
Restano attaccati ad About, e il pannello si accorcia di una riga da se':
`deriveRows` conta l'ultima riga occupata. A lg passa da sette righe a sei.

**Conseguenza da guardare:** sotto ai social resta piu' nero vuoto di prima, a
tutti i tier. Non e' un errore, e' quello che succede togliendo una riga a un
pannello ancorato in alto. Vedi B22.

### D90. Il form apre la mail

Il bottone si accendeva gia' quando il form diventava valido. Mancava il
seguito: ora l'invio compone un `mailto:` con nome, azienda, email e messaggio,
in inglese come il resto del form.

Non e' un form che spedisce, e' un form che scrive la mail al posto tuo e la
lascia a te. Chi non ha un client configurato non va da nessuna parte, e nessuno
sapra' mai che ci ha provato: la risposta vera resta un endpoint che riceve il
POST (B3).

L'indirizzo e' `hello@emanuelegiovanili.it`, scelto dal committente. **Il
dominio non e' ancora registrato** (B21), e l'indirizzo sta in chiaro nel
sorgente pubblico: e' una conseguenza di `mailto:`, e se diventasse un problema
la risposta e' un backend, non offuscare la stringa.

### D91. L'hero era pieno al pixel

"Based in San Benedetto del Tronto" era attaccata al bordo basso perche' era
attaccata davvero: il blocco non aveva nessun margine sotto, oltre alle celle
riservate ai due bottoni.

Misurato prima di toccare niente: a 1440 il contenuto chiedeva **220px dentro
220px** di spazio utile. Zero avanzo. Il primo tentativo — venti pixel di
respiro in fondo — sforava di 17-30px a cinque larghezze su dieci.

I venti pixel sono quindi **presi**, non aggiunti: dieci dallo stacco fra titolo
e corpo, dieci da un `gap` che chiedeva spazio gia' assegnato da
`space-between`. A md se ne riservano dieci invece di venti: li' il blocco e'
piu' stretto in proporzione al testo, ed e' la stessa strettoia che il Figma ha
da solo sul form a quel tier (B12).

Dopo: avanzo positivo a tutte e dieci le larghezze, da 5px a 1200 a 309px a 719.

---

## 15. Fase 7-bis — "in mobile mancano i bordi ai container"

Una segnalazione di tre parole. Dietro c'erano due difetti, e il secondo era
grosso.

### D92. La finestra d'ingresso guardava il bordo sbagliato

Era legata al bordo **alto** del blocco: da `top 95%` a `top 60%`. Con un blocco
alto funziona. Con un blocco basso no: un quadrato da una cella appoggiato al
fondo dello schermo e' **tutto visibile** mentre il suo bordo alto e' ancora al
92%, cioe' con il filo appena cominciato. A schermo: un blocco intero, fermo,
senza bordo.

Su desktop si notava poco, perche' le celle sono grandi. A 390 la cella e' 39px:
nella fascia bassa ce ne stanno cinque, e restano li' senza bordo finche' non
scorri ancora. Non era un difetto di mobile, era un difetto che mobile rendeva
visibile.

Ora la finestra va da quando il blocco spunta dal fondo a quando il suo bordo
**basso** e' salito all'85%. La promessa diventa dicibile in una riga: *un
blocco che dista dal fondo piu' di un settimo di schermata ha i suoi quattro
fili interi*, alto o basso che sia. La fascia in cui si vede un filo a meta'
passa da due quinti di schermo a un settimo.

Per i blocchi piu' alti dell'85% della finestra quella posizione non esiste, e
si ripiega sul bordo alto a un quarto di schermata. `end` e' una funzione, non
una stringa, perche' dipende dall'altezza del blocco, che cambia con la
larghezza.

### D93. Quattro pagine su cinque erano vuote sotto i 1200

Cercando il primo difetto e' saltato fuori questo. `/about`, `/works`,
`/works/[slug]` e `/contact` mostravano **solo l'header** a qualunque larghezza
sotto i 1200. Da sempre.

**Il meccanismo.** Ogni pagina passa a `<Grid>` una mappa che contiene anche
header e footer, e `<Grid>` deduceva i tier della pagina guardando **tutti** i
blocchi. Header e footer un disegno ce l'hanno a tutti e tre i tier, quindi
`/about` si dichiarava `base md lg` pur essendo disegnata solo a 1440. Da li',
tre conseguenze:

1. `.grid[data-tiers~='base'] .block:not([data-tiers~='base'])` spegne i blocchi
   che in quel tier non esistono. E' la regola giusta per un blocco tolto di
   proposito — il "Let's work together" del footer a base — e su quelle pagine
   spegneva tutto il contenuto.
2. `--rows` prendeva `--rows-base`, che li' vale **2**: l'altezza del solo
   header.
3. Le linee verticali venivano disegnate **dieci**, quante ne ha il tier base,
   su una griglia che di colonne ne tiene dodici.

**Perche' nessuna sonda l'ha visto.** `verify:grid` scarta i blocchi a
`display: none`, e lo fa per un motivo giusto: un blocco spento non ha misure da
confrontare. Quindi misurava l'header, lo trovava perfetto, e diceva ok.
Nessuno chiedeva **quanti** blocchi fossero rimasti accesi.

**La correzione.** Una pagina puo' dichiarare i tier in cui e' disegnata
(`<Grid tiers={['lg']}>`), e righe e colonne si risolvono solo su quelli. La
deduzione resta per la home, dove e' vera. Ora quelle quattro pagine sono un
desktop rimpicciolito a ogni larghezza — dodici colonne, ventinove righe,
trentuno blocchi su trentuno — che e' esattamente quello che B2 prometteva e che
non stava succedendo.

Resta che sono **illeggibili sotto i 1200**: il testo scala con la cella e a 390
la cella e' 32px. Un desktop rimpicciolito e' meglio di una pagina bianca, non
e' un disegno per il telefono. B2 resta aperto, e adesso si vede.

### D94. Due controlli nuovi, per le due cose che nessuno guardava

**`verify:rules`** scorre ogni pagina a tre larghezze, si ferma ogni due quinti
di schermata e chiede: c'e' un blocco fermo dentro la promessa e senza i suoi
quattro fili? E' l'unica sonda che guarda una pagina **che scorre**, che e' la
cosa che l'utente guarda.

**Il conteggio dei blocchi accesi**, dentro `verify:grid`. Una route non puo'
mostrare meno del 40% dei blocchi che mostra alla sua larghezza migliore. Sarebbe
bastato questo, dal primo giorno, per non pubblicare quattro pagine vuote.

**`verify:edges` gira anche a 390 e 768.** Prima guardava i pixel dipinti solo a
1440, cioe' diceva qualcosa su un tier su tre.

### D95. "Solo desktop" e' una regola, non un elenco

`verify:grid` teneva l'elenco delle pagine disegnate solo a 1440, e l'elenco
dimenticava due case study su tre: `verify:build` li misura tutti e li faceva
fallire, mentre `/works/seezy` — identico per struttura — passava perche' era
scritto nella lista. La regola vera e' che **la home e' l'unica pagina con tre
tier**.

Cosi' e' venuto fuori uno sforo reale: sulle card dei lavori correlati la riga
di titolo e categorie chiede 381px dentro una card da 318 a 768. A 1440 ne
chiede 597 dentro 598, cioe' e' disegnata per riempire esattamente cinque
colonne: a qualunque scala minore l'arrotondamento del testo la fa sbordare, e
il ritaglio della card la taglia. E' B6: il layout dei case study e' su misura
per Seezy a 1440.

---

## 16. Fase 8 — i filtri di /works, e i bordi che su Safari non c'erano

### D96. Filtrare e' un layout diverso, non un `display: none`

I quattro elementi sopra ai progetti erano dipinti: contatori giusti, stato
attivo giusto, nessun effetto. Ora filtrano.

**Il punto e' che filtrare sposta i blocchi.** Con meno card, tutto quello che
sta sotto — form di contatto, CTA, bottone, footer — sale di quattro righe per
card nascosta, e la pagina si accorcia di altrettanto. Nascondere le card e
basta avrebbe lasciato buchi da otto righe in mezzo alla pagina.

**Dove stanno i numeri.** Le righe di ogni stato si calcolano al **build**
(`worksFilterStates`) e finiscono in pagina come custom property. Il JavaScript
sceglie quale stato e' attivo: non calcola posizioni, non sa quanto e' alta una
card, non puo' inventarsi un numero che non cade su una linea. E' la regola di
sempre — la posizione viene dalla mappa — applicata a quattro mappe invece che
a una.

Due dettagli tecnici che meritano una riga:

- Le regole toccano `--row` e `--rows`, non `--row-lg` e `--rows-lg`: quelli
  stanno nell'attributo `style` dei blocchi, e uno stile inline vince su
  qualunque selettore. `--row` invece lo assegna `grid.css` con la specificita'
  di una classe.
- Sotto le card lo scostamento e' lo stesso per tutti, quindi basta un numero
  per stato e un `calc` sulla riga che il blocco ha gia'. Misurato che
  `grid-row-start: calc(20 - 8)` risolve a 12: un `calc` e' accettato dove sta
  un numero di linea.

Le linee orizzontali oltre il nuovo fondo pagina le spegne il JavaScript: una
linea alla riga 29 dentro una griglia da 21 creerebbe otto righe implicite e la
pagina tornerebbe lunga come prima, vuota nella meta' inferiore.

Senza JavaScript la pagina resta su "All", che e' quello che il markup dichiara:
il filtro e' un comodo, non un prerequisito per vedere i progetti.

**E i tre stati filtrati sono misurati** come se fossero pagine a se':
`verify:grid` passa da 286 a 325 misure. Un layout diverso va misurato.

### D97. L'hover di un filtro e' nero, non viola

Su tutto il resto del sito il riempimento di hover e' viola e vuol dire "questo
si preme". Qui il viola e' gia' occupato: vuol dire "questo e' selezionato".
Con l'hover viola se ne vedevano due viola e non si capiva piu' quale fosse
attivo — visibile nel primo screenshot che ho fatto, e corretto prima di
consegnare. Il nero e' lo stesso che prende la hamburger a menu aperto: non e'
un colore nuovo, e' l'altro modo che questo sito ha di dire "stai premendo qui".

### D98. Su Safari non c'era **nessun** bordo

Segnalazione del committente, browser confermato: Safari, nessun bordo su
nessun blocco della home.

**Non ho potuto riprodurlo.** Qui c'e' solo Chromium, e il motore di Safari non
e' scaricabile: il CDN di Playwright e' fuori dalla policy di uscita
dell'ambiente. Quella che segue e' quindi una deduzione dichiarata, non una
misura.

Il layout da lui e' giusto, quindi `@property` c'e': senza, la registrazione di
`--cell` fallirebbe e la griglia collasserebbe. Quello che cambia non e' il
supporto, e' l'**aggiornamento**. I quattro valori del filo si riscrivono a ogni
fotogramma sul blocco, e a usarli e' uno pseudo-elemento. WebKit ha una storia
nota di pseudo-elementi che non si ridisegnano quando cambia una custom property
**registrata** ereditata. Il primo valore scritto e' zero (`clearRules`), e zero
e' esattamente quello che lui vedeva.

**La correzione.** Le quattro variabili diventano percentuali **non
registrate**, usate senza `calc`:

    background-size:
      var(--rule-t, 100%) var(--line),
      var(--line) var(--rule-r, 100%),
      ...

Le custom property non registrate hanno il percorso di invalidazione di sempre,
quello che regge `::after { content: var(--x) }` da dieci anni. Niente
`@property` e niente `calc` nel punto in cui il difetto si manifestava.

**Il guadagno che vale a prescindere dalla diagnosi** e' il fallback `100%`.
Prima l'unico stato scritto era lo zero iniziale, e qualunque inciampo dopo di
quello lasciava i blocchi senza bordo, per sempre, su qualunque browser. Ora un
blocco senza dichiarazione ha il filo **intero**.

### D99. Ogni fase del movimento ha una rete

Stesso ragionamento, generalizzato. `revealRules` e `revealMedia` cominciano
**togliendo** qualcosa — i fili a zero, le immagini ritagliate a niente — e lo
rimettono animandolo. Se una di loro inciampa a meta', quel che ha tolto resta
tolto: una pagina senza bordi, o con i riquadri delle immagini vuoti.

Ora ognuna gira dentro a un `safely(nome, esegui, ripristina)`: un errore costa
l'animazione, non il contenuto, e finisce in console invece di somigliare a un
difetto di disegno.

### D100. A base i social chiudono il menu

Su richiesta del committente, e solo per il menu mobile: i due social tornano
alti due celle e scendono **sotto** al "Let's work together", che sale di una
riga a prendere il loro posto. La sequenza a base diventa Work, About, CTA,
social, e il pannello finisce con loro invece che con il bottone viola.

A md e lg non cambia niente: li' il CTA sta nella riga di testa e i social sono
gia' l'ultima cosa del pannello.

Il pannello passa da 12 a 13 righe. **Il nero sotto resta** (B22): a 390 tredici
righe da 39px fanno 507 pixel su una finestra da 844, e le righe non si possono
allungare perche' la cella e' un quadrato legato alla larghezza. L'unica leva e'
avere piu' contenuto, non righe piu' alte.

---

## 17. Fase 9 — perche' su Safari non c'era nessun bordo

Tre giri di ipotesi, due sbagliate, e la terza misurata. Vale la pena scrivere
anche le due sbagliate: il modo in cui hanno fallito e' quello che ha portato
alla terza.

### D101. La caccia

**Prima ipotesi: `@property`.** I quattro valori del filo erano numeri
registrati, moltiplicati per `100%` dentro `background-size`, e a usarli era uno
pseudo-elemento. WebKit ha una storia di pseudo-elementi che non si ridisegnano
quando cambia una custom property registrata ereditata. Plausibile, e sbagliata:
diventate percentuali non registrate, su Safari non e' cambiato niente.

**Seconda ipotesi: `max()` dentro `calc()`.** `--edge-x` e' un `max()` con un
`calc()` dentro, e finisce dentro a un altro `calc()` che decide `right` e
`bottom` dello pseudo. Se quella catena non risolvesse, le due distanze
diventerebbero `auto` e lo pseudo collasserebbe a zero: nessun bordo, con il
resto della pagina intatto. Plausibile, e sbagliata.

A smentirla e' stata una pagina di prova (`/diagnostica`) aperta sul dispositivo
del committente: sei prove, dalla piu' semplice alla regola vera, **tutte
passate**. `@property` registra, `max()` dentro `calc()` risolve, lo pseudo e'
122x58 con le distanze giuste.

**Ed e' li' che la caccia ha girato.** Se il CSS e' giusto e il disegno non si
vede, il disegno viene buttato via *dopo*. Un pannello sulla pagina vera
(`?diag`) l'ha confermato: valori al 100%, pseudo della misura giusta,
`background-size` corretto, zero errori, e nessun bordo sullo schermo.

### D102. `overflow-clip-margin` non esiste su Safari

Il filo sta **un pixel oltre** il border box, perche' e' li' che cade la linea
di griglia che chiude il blocco (D61). Il ritaglio di `overflow: clip` si misura
invece dal **padding box**. I due pixel di `overflow-clip-margin` erano quello
che glielo concedeva.

Safari non implementa `overflow-clip-margin`, e `clip` senza margine si comporta
come se il margine fosse zero: si mangia tutti e quattro i fili di tutti i
blocchi che dichiarano `clip`, che sul sito sono quasi tutti.

**Misurato**, simulando l'assenza della proprieta' su Chromium. Il pixel sulla
linea del bordo alto di `hero-text`:

    con il margine      80,77,92      il filo
    senza il margine    232,230,235   la linea scoperta

La correzione e' `clip-path: inset(-2px)`, che fa la stessa cosa e la fanno
tutti: ritaglia il contenuto che sfora lasciando due pixel di franchigia, e quei
due pixel sono quelli in cui vive il filo.

### D103. I punti erano tre, non uno

La correzione sui blocchi ne ha scoperti altri due.

**La card progetto** aveva un `overflow: clip` suo, senza margine. Non si vedeva
perche' la franchigia gliela passava la regola del blocco: tolta quella, i suoi
quattro fili sparivano anche su Chromium. L'ha trovato `verify:webkit` al primo
giro.

**Il marquee** e' andato al contrario. Sostituire li' `overflow: clip` con
`clip-path` ha fatto sparire due fili a 390, e il motivo non c'entra con il
ritaglio: dentro al marquee c'e' un nastro di testo largo molte volte lo
schermo, e `overflow: clip` non lo nasconde soltanto, lo **contiene**. Con un
`clip-path`, che e' solo visivo, quella larghezza tornava nell'area scorribile
del documento, la pagina si allargava, e le finestre d'ingresso dei fili — che
si misurano in frazioni di schermata — cadevano altrove.

Li' `overflow: clip` serve davvero. Il filo basso e' passato **fuori** dal
contenitore che ritaglia: sta sul blocco, che non ritaglia niente, e lo sbordo a
tutta larghezza se lo rifa da se'. Trovato da `verify:rules`, che e' la sonda
nata due fasi fa per un difetto completamente diverso.

### D104. `verify:webkit`

Rigira i 128 controlli a livello di pixel **fingendo un browser che non
implementa `overflow-clip-margin`**. E' il modo piu' vicino a misurare Safari
che questa sessione abbia, visto che il motore non e' scaricabile (B23).

Non copre le altre differenze di WebKit, e non va spacciato per una verifica su
Safari. Copre pero' esattamente la classe di difetto che e' costata tre giri:
un disegno calcolato bene e ritagliato via, che nessuna sonda vedeva perche'
tutte guardavano il motore in cui il ritaglio funziona.

### D105. Gli strumenti di diagnosi sono stati tolti

`/diagnostica`, il pannello `?diag` e il quaderno di bordo su `window` erano
temporanei e sono spariti con la causa. Restano nella storia di git per chi un
giorno dovesse rifarli.

Quello che resta e' `verify:webkit`, che e' la versione permanente della stessa
domanda: **quello che disegno sopravvive a un browser che ritaglia diversamente?**

La rete di `safely()` resta anche lei, e non era una correzione al difetto:
serve perche' le fasi del movimento cominciano togliendo qualcosa e lo rimettono
animandolo, quindi un errore a meta' costa il contenuto e non solo
l'animazione. Con la rete costa solo l'animazione.

---

## 18. Fase 10 — il disco gira

### D106. Gira tutto il disco, e gira dentro all'SVG

Richiesta del committente. `data-spin` era gia' nel markup dalla Fase 4: era
un'intenzione che nessuno leggeva.

**Gira tutto il disegno, non una sua parte.** Il primo tentativo faceva girare i
soli due archi off-white, sul ragionamento che il resto fosse sfondo. Lo
screenshot dice altro: la copertina e' un vinile con un morso tolto in alto a
sinistra, e il morso e' proprio quello che rende leggibile la rotazione. Un
disco fermo con i solchi che girano dentro sembra rotto.

**E gira un gruppo dentro all'SVG, non l'elemento `<svg>`.** Girando l'`<svg>`,
che e' una scatola di layout, la scatola si allarga agli angoli: un quadrato
ruotato di 45 gradi sporge di un quinto del proprio lato. A schermo non si
vedeva niente — il disco e' un cerchio e i suoi angoli sono vuoti — ma
`verify:grid` l'ha misurato: **46 pixel fuori dal blocco a 1440**. Un pezzo
fuori dalla griglia resta fuori dalla griglia anche quando e' trasparente.

La trasformazione di un gruppo SVG non tocca il layout: misurato, la scatola
resta 238x238 a qualunque angolo e lo sforo torna ai due pixel del decoro.

Il perno e' `50% 50%`: il centro del disegno (162,29 su 325) coincide con il
centro del viewBox (162,5) a meno di due decimi di unita', cioe' un settimo di
pixel a schermo. Cade giusto comunque il browser risolva `transform-origin`
dentro a un SVG, e non dipendere da quella risoluzione e' il punto.

Sei secondi a giro e' una scelta: un 33 giri ne farebbe uno ogni 1,8, e a quella
velocita' un elemento decorativo in un angolo diventa un disturbo. Sotto
`prefers-reduced-motion: reduce` sta fermo.

**La copertina e' inline.** Era un `<img src>`, e a un indirizzo esterno non si
arriva dal CSS della pagina. E' la stessa ragione per cui le icone di questo
sito sono inline.

### D107. Altri due blocchi si ritagliavano i fili da soli

Cercando dove mettere la rotazione e' saltato fuori che `.spotify-cover` e
`.media-block` avevano un `overflow: clip` proprio, come ce l'aveva la card
progetto (D103): taglia al padding box e si mangia i quattro fili. Il ritaglio
glielo fa gia' il blocco con `clip-path`, quindi il loro e' sparito.

Non lo vedeva nessuno perche' nessuna sonda li guardava. Ora `verify:edges` e
`verify:webkit` li guardano: le prove passano da 128 a 152.

Nello stesso passaggio, la finestra delle sonde a pixel e' salita da 900 a 1200
di altezza. La copertina di un case study e' alta 720px a 1440 e non ci stava:
veniva **saltata**, e un blocco saltato in silenzio e' un blocco non verificato.

### D108. Il testimonial di TAMA caffe'

Testo fornito dal committente, riprodotto come sta. **Manca la firma**: chi
l'ha scritta e con che ruolo. Finche' non arriva, quella scheda mostra la
citazione senza attribuzione. B13 scende da tre schede vuote a due.

### D109. Le misure dei testimonial, e la riga che ne e' seguita

Il committente ha fissato la citazione e il nome a **20 a desktop e 14 sotto**
(nel Figma erano 24 e 16).

**Due conseguenze che non aveva chiesto, e che ho corretto.** Il ruolo era 20 a
lg e 14 a md: con il nome sceso a quelle stesse misure, nome e ruolo finivano
identici e la gerarchia fra chi parla e cosa fa spariva. Il ruolo scende con
lui, 16 a lg e 12 a md, che e' lo stesso scarto del Figma.

**E la citazione di TAMA non ci stava piu'.** E' piu' lunga del quaranta per
cento di quella di Seezy, e il contenitore era dimensionato sulla prima: a 390
sforava di 26px, che il blocco tagliava via. A 390 si sommano due penalita',
la colonna piu' stretta — quindi piu' righe — e il blocco piu' corto.

Il contenitore a base passa da dieci righe a undici, e tutto quello che sta
sotto scende di una. Misurato scheda per scheda a cinque larghezze: l'avanzo
piu' magro e' 10px a 320.

**Il contenitore e' ora dimensionato sulla citazione piu' lunga, non sulla
prima.** Se ne arriva una piu' lunga ancora, il conto va rifatto: nessuna sonda
lo fa da sola, perche' il pannello carica il testo solo quando si clicca la
scheda.

Con la firma di Michael Angelini, CEO, B13 scende a due schede vuote su quattro.

## 19. Fase 11 — due testimonial, un piede cliccabile, e il mix che porta da qualche parte

### D110. La riga dei testimonial non sa piu' quante schede ha

Il committente ha chiesto di togliere dalla home Noranutrizione e Aggrego, che
sono le due schede senza citazione. La home riceve `COMPLETE_TESTIMONIALS` al
posto di `TESTIMONIALS`, e i due clienti restano nel file: il giorno che arriva
un testo, lo si scrive nella citazione vuota e la scheda torna in pagina.

**Il problema non era togliere due schede, era che il CSS ne contava quattro.**
`grid-template-columns: repeat(2, calc(var(--cell) * 4))` a base e
`repeat(4, calc(var(--cell) * 2))` da md: due numeri scritti a mano che con due
schede lasciavano meta' riga vuota, e che il prossimo cambio di lista avrebbe
sbagliato di nuovo.

Ora la riga non sa quante schede ha. Le tracce sono **otto da una cella** — lo
stesso numero con cui la pagina disegna le sue linee, non una divisione che gli
assomiglia — e quante colonne prenda ciascuna scheda lo conta il componente e lo
passa inline: `--tab-col-md` e `--tab-span-md` per scheda, `--tab-cols` e
`--tab-rows` sulla riga. A base resta una scheda per riga, larga tutte e otto le
colonne.

**Due guardie di build**, perche' la liberta' si paga: se le schede non dividono
le otto colonne (cinque, per dire) i loro lati smettono di cadere sulle linee, e
se a base non sono tante quante le righe del blocco la riga resta mezza vuota o
sborda. In tutti e due i casi la build si ferma e dice quale numero rivedere,
invece di consegnare una riga storta.

### D111. Il nome a fondo pagina porta a casa

Richiesta del committente. Stessa ragione, e stessa soluzione, del logo del
megamenu (D50): un nome grande che non fa niente e' un vicolo cieco. Il blocco
diventa un `<a href="/">`, e non serve altro — `:where(a)` azzera gia' colore e
sottolineatura in tutto il sito.

### D112. Sopra una fotografia, il 50% non tiene

Il fondo dei blocchi e' al 50% su tutto il sito per decisione del committente
(D1). Funziona perche' sotto c'e' il colore della pagina, che e' lo stesso: il
50% di off-white su off-white **e' off-white**, e la differenza non si vede da
nessuna parte.

Tranne dove sotto c'e' un'immagine. In /about il titolo "In the kitchen"
(`300:354`) e la riga della playlist (`300:440`) cadono sulla foto della
scrivania, e li' il 50% si vede tutto: si legge la scrivania attraverso
"Now playing". Su richiesta del committente quei blocchi vanno al 100%.

Una classe sola, `.is-opaque`, che ridefinisce `--block-bg` sul blocco invece di
scrivergli un `background`: il meccanismo resta quello di `grid.css`, cambia solo
il valore. L'ho messa anche sul disco, che la foto non la tocca: li' il colore e'
identico — e' lo stesso `--page-bg` — quindi non cambia niente a schermo, e la
riga non ha una giuntura a meta' il giorno che la foto si allarga.

**E il titolo andava anche sollevato.** Nel documento viene *prima* della foto, e
fra due blocchi con lo stesso `z-index` vince l'ultimo: era la foto a coprirlo, e
di quel titolo si leggeva "In the" e mezza "k". `.is-over` lo porta a `z-index: 2`,
lo stesso valore con cui i blocchi viola stanno sopra ai vicini, e i due casi in
pagina non si incontrano mai.

Il blocco porta un `data-known-overflow` che parla di 438px chiesti dentro tre
colonne. E' la misura del **text node Figma**, non di quello che il browser
disegna: misurato ora che si vede, "In the kitchen" sta dentro i 360px del
blocco e non viene tagliato da niente. La nota resta perche' descrive il file.

### D113. Le card del "mix" portano a /works filtrata

Richiesta del committente. Erano tre riquadri che dicevano cosa faccio e
finivano li'; ora ognuno e' un link a `/works?filter=<ambito>`.

**L'etichetta e il tag non sono la stessa parola.** La card dice "Product
Design", il filtro dice "Product". Il tag sta sulla card e passa da
`WORK_TAGS`, quindi una card che puntasse a un ambito inesistente non
compilerebbe; una seconda guardia a runtime regge anche se qualcuno allenta i
tipi.

Lo slug viene da `tagSlug()`, che adesso e' una funzione sola usata dai due lati:
prima la riga `tag.toLowerCase().replace(...)` stava solo dentro
`worksFilterStates`, e una seconda copia in home sarebbe divergente al primo tag
con un carattere fuori dall'alfabeto.

**Perche' la querystring e non una pagina per ambito.** Il filtro e' gia' tutto
nel client (D99): gli stati li scrive il build come custom property, il modulo
sceglie quale e' attivo. Prerenderizzare `/works/filter/branding` vorrebbe dire
quattro copie della stessa pagina e quattro indirizzi che nel Figma non esistono.
Con la querystring la pagina e' una, e uno slug sconosciuto viene ignorato:
si resta su "All" invece di mostrare zero progetti a chi ha sbagliato a copiare
un link.

**Il prezzo e' un lampo.** La pagina arriva su "All" e il filtro si applica
quando il modulo parte, quindi per un fotogramma si vedono tutte le card. Senza
JavaScript si vedono tutte e basta, che e' il comportamento gia' scelto per i
filtri.

### D114. La playlist si legge in build, non nel browser

Il committente ha dato l'indirizzo della playlist e creera' l'app su Spotify.

**"Now playing" e' il titolo della sezione, non il brano in ascolto.** E' la
distinzione che decide tutto il resto: leggere il nome e il conteggio di una
playlist pubblica e' una chiamata senza utente (`client_credentials`), sapere
cosa sto ascoltando adesso vuole un token utente, un refresh token da custodire,
e quindi una rotta Worker. La seconda strada fa smettere il sito di essere un
sito di soli file, e per la maggior parte del tempo mostrerebbe un vuoto, perche'
per la maggior parte del tempo non sto ascoltando niente.

Quindi: **una lettura sola, mentre la pagina si costruisce.** Il dato e' fermo fra
un deploy e l'altro, ed e' il compromesso giusto — "32 songs" scritto a mano era
sbagliato dal giorno dopo, letto in build e' sbagliato al massimo fino al
prossimo deploy.

**Non fallisce mai.** Senza credenziali — cioe' in locale, sempre — e a ogni
errore di rete si torna ai valori del Figma. Nessuna pubblicazione si ferma per
una playlist: il peggio che possa capitare e' la pagina di ieri. Il log della
build dice sempre quale delle due strade ha preso, cosi' un ripiego silenzioso
non esiste.

**E "Play now on Spotify" adesso ci porta davvero.** Era `href: '#'`: un invito
che non faceva niente, in un blocco che prometteva un'azione.

Dall'indirizzo e' stato tolto il parametro `si`: e' il codice di condivisione
legato all'account di chi copia il link, e questo repository e' pubblico.

**Non era mai stato provato contro Spotify da qui**, perche' la policy di uscita
risponde 403 al CONNECT verso `accounts.spotify.com`, come verso Cloudflare (B1).

### D116. Il primo giro vero: 403 sulla playlist

Credenziali in Actions, primo deploy: `[spotify] lettura fallita (playlist:
HTTP 403): resto sui valori scritti a mano.`

**Il token e' stato ottenuto.** L'errore dice `playlist:`, non `token:`, quindi
`client_credentials` ha funzionato e l'app e' valida: e' la lettura della
playlist a essere rifiutata. Il ripiego ha retto e la pagina e' rimasta quella
di prima, che e' esattamente il comportamento per cui era stato scritto.

**E da un 403 nudo non si capisce niente.** Ci sono almeno tre modi di essere
rifiutati — app ancora in sviluppo, playlist non pubblica, endpoint chiuso alle
app nuove — e il numero e' lo stesso per tutti e tre. Spotify il motivo lo
scrive nel corpo della risposta, in `error.message`, e io leggevo solo lo stato.

Ora l'errore riporta il messaggio (troncato a 300 caratteri: se non e' il JSON
atteso e' una pagina d'errore di un proxy, e mezzo megabyte di HTML in un log di
build non aiuta nessuno).

E' la terza volta in questa fase che il difetto non era nel meccanismo ma in
quanto poco si vedeva di lui: il `}` invisibile, il log della build ingoiato, e
adesso un codice di errore senza il suo motivo.

### D117. Il motivo era nessuno dei tre: il Web API vuole Premium

Un deploy dopo, con il messaggio in chiaro:

    403 — Active premium subscription required for the owner of the app.
    When the subscription status changes, it can take a few hours before
    requests are allowed again.

**Nessuna delle tre ipotesi.** Non l'app in sviluppo, non la playlist non
pubblica, non l'endpoint chiuso alle app nuove: Spotify pretende che l'account
**proprietario dell'app** abbia un abbonamento Premium attivo per usare il Web
API. Quello del committente e' Free.

Vale la pena notare quanto le tre ipotesi fossero inutili. Erano plausibili,
ordinate per probabilita', e tutte e tre sbagliate; il messaggio d'errore le ha
risolte in un deploy. **Un'ora di ragionamento su cosa possa essere vale meno di
una riga che lo dice**, ed e' il motivo per cui il commit precedente e' stato
quello e non un tentativo alla cieca.

**La decisione del committente e' di non prendere Premium per questo**, quindi in
pagina restano i valori scritti a mano e il link alla playlist, che funziona.
Rispetto a ieri si guadagna comunque il link: `href` era `'#'`.

C'era una mezza strada e l'ho sconsigliata: `open.spotify.com/oembed` e' pubblico,
non chiede autenticazione ne' Premium, e da' il **titolo** della playlist. Non da'
il conteggio dei brani, che e' esattamente il valore che invecchia: risolve la
meta' che non e' il problema, e aggiunge una dipendenza di rete per un nome che
non cambia quasi mai.

**Il codice resta**, perche' e' finito e senza i due secret non fa nemmeno una
chiamata. Non e' un'intenzione che nessuno legge, come lo era `data-spin` prima
di D106: e' un meccanismo completo, provato fino al punto esatto in cui si ferma,
con il motivo scritto in tre posti. Il giorno che quell'account diventa Premium
si rimettono i secret e riparte, senza toccare una riga.

**I due secret vanno tolti da GitHub.** Restando li', ogni deploy fa due chiamate
che falliscono e scrive una riga di errore nel log: un allarme che suona sempre
smette di essere un allarme. Senza, il log dice `nessuna credenziale`, che e' la
verita'.

### D115. Un `}` di troppo, e le sei sonde che non potevano vederlo

Cercando altro e' saltato fuori un `}` in piu' in `pages.css`, entrato con il
commit del disco e rimasto per due commit. I browser lo ignorano, quindi a
schermo non si vedeva niente; esbuild scriveva una riga di avviso, e quella riga
finiva nello stdout che `verify:build` buttava via.

Nessuna delle sei sonde poteva trovarlo: misurano pixel e posizioni, e un `}`
orfano in quel punto non ne spostava nessuno. E' la stessa forma di tutti i
difetti di questo progetto — non e' che la misura fosse sbagliata, e' che
nessuna misura guardava li'.

Ora `verify:build` legge lo stdout della build e si ferma su qualunque
`css-syntax-error`. Provato all'incontrario: rimesso il `}`, la pubblicazione si
blocca prima delle sonde.

**E catturare quello stdout aveva un effetto che non avevo previsto: lo rendeva
invisibile.** In Actions l'unico passo che costruisce e' `verify:build`, quindi
da quel momento nessuno avrebbe piu' letto `[spotify] letta` o `[spotify]
nessuna credenziale` — l'unica riga che dice se la playlist in pagina viene da
Spotify o dal ripiego. Trovato leggendo il log del primo deploy, dove quella
riga non c'era piu'. Adesso le righe che vanno dette (`[spotify]`, `[WARN]`,
`WARNING`) si ristampano anche quando la build passa; il resto del log, che e'
l'elenco dei file scritti, resta fuori.

Lo stesso errore di forma del `}`: un avviso che nessuno vede e' un avviso che
non esiste.

## 20. Fase 12 — hover che mancavano, e un vincolo mai misurato

### D118. Il segnaposto usciva dal riquadro, e l'SVG lo tagliava

Segnalato dal committente: all'hover l'icona della location si taglia.

`icons.ts` dichiarava in testa, come vincolo numero tre, che «l'animazione resta
dentro il riquadro 24x24 e non tocca mai il blocco che la contiene». La seconda
meta' e' vera e conta — protegge la griglia. La prima **non era mai stata
misurata**, ed era falsa: il segnaposto ruota attorno alla base del viewBox e
ne esce di **7,08 unita' a sinistra, 1,45 a destra e 0,48 sotto**.

Due strade: ridurre il gesto, o smettere di tagliarlo. La seconda, perche' il
gesto e' un porting con valori letti dal sorgente e ridurlo vuol dire
riprogettarlo a occhio. `overflow: visible` cambia cosa viene dipinto, non la
scatola: l'icona resta 24x24 per il layout, e sette pixel cadono dentro una
cella da 120 con il segno al centro.

**Per icona, mai globale.** `send` vola fuori dal riquadro e rientra dall'altro
lato: e' il viewBox a fargli da quinta, e senza ritaglio quel gesto non avrebbe
piu' senso. Il vincolo in testa al file ora dice cosa e' vero davvero.

### D119. La settima icona, e la guardia che valeva per una sola

Richiesta del committente, con in mano `<AudioLines animateOnHover />` di Animate
UI: stessa libreria delle altre sei, stesso trattamento — si porta il gesto in
GSAP, non si installa React per sei barre da 24 pixel.

**Si scala solo verso il basso.** La barra centrale e' `M10 3v18`, cioe' da 3 a
21 dentro un viewBox alto 24: ingrandirla la spinge fuori. Il ciclo va da 1 a
0,45 e torna, e l'icona resta dentro il proprio riquadro senza deroghe — al
contrario del segnaposto qui sopra.

Lo sfasamento e' **negativo**: ogni barra parte gia' a meta' del proprio giro.
Con ritardi positivi l'ultima resterebbe ferma mezzo secondo dopo l'arrivo del
puntatore, e un'onda che parte da sinistra si legge come un caricamento.

**E scrivendola e' saltato fuori che `prefers-reduced-motion` non valeva per le
animazioni di hover.** La guardia c'era solo per il morph della hamburger: le
sei icone si muovevano comunque. Non l'avrei vista se non avessi dovuto
chiedermi cosa succede a un ciclo infinito sotto quella preferenza — il caso
peggiore delle sette, che e' il motivo per cui la domanda e' venuta.

Ora si legge a ogni `mouseenter` e non una volta all'avvio: la preferenza si
cambia a pagina aperta.

### D120. Una dichiarazione che perdeva in silenzio

Il committente ha chiesto il fondo pieno per la cover della playlist. Il CSS ce
l'aveva gia': `.spotify-cover { background: var(--off-white) }`.

Non ha mai dipinto niente. `.block[data-surface='line']` dichiara
`background-color: var(--block-bg)` con **una classe piu' un attributo**, cioe'
piu' specificita' di una classe sola: vinceva lui, e la cover restava al 50%
come tutti gli altri blocchi. Misurato prima di toccare qualunque cosa:
`rgba(247, 246, 249, 0.5)`.

Il fondo ora lo da' `is-opaque` (D112), che agisce su `--block-bg` invece di
provare a scavalcare quella regola. **Una dichiarazione che perde in silenzio e'
peggio di una che manca**: leggendo il file sembra fatta, e nessuno la cerca.

### D121. Due hover mancanti, e la sonda che guardava solo la prima schermata

Le tre card del mix erano diventate link (D113) senza nessuna risposta al
puntatore, e le voci del footer non ne avevano mai avuta una. Prendono il
riempimento viola del sito, lo stesso dei bottoni.

**Lo strato eredita la scatola invece di ripeterla.** Questi tre cambiano forma
per tier: la card ha due padding, la voce di footer passa da colonna a riga a
1200 e cambia corpo due volte, il nome ha tre misure. `flex-direction: inherit`
e compagnia prendono il valore calcolato del genitore, qualunque media query
l'abbia deciso — invece di una seconda serie di regole da tenere allineata per
sempre. `.work-filter` conserva le proprie: ha anche uno spaziatore `::before`,
quindi non e' una copia pura, e nessuna sonda lo guarda. Si potra' unire, ma non
in un passaggio in cui non lo si misura.

**E la sonda a pixel caricava una rotta sola e non scorreva mai.** Le sei
superfici coperte finora stanno tutte nella prima schermata: non era mai
emerso. E' morta appena le ho chiesto una voce di footer, leggendo un pixel
fuori dalla finestra.

Il primo fallimento dopo averla sistemata e' stato istruttivo due volte. Diceva
che il filo destro del nome a fondo pagina era viola invece che grigio, e le due
spiegazioni erano entrambe sbagliate finche' non le ho misurate:

1. **Misurava a meta' animazione.** Centrando il blocco nella finestra lo si
   lascia al 50%, ma la finestra d'ingresso si chiude quando il bordo alto
   arriva al 25%: il filo era ancora corto. Ora la sonda porta il blocco a un
   settimo dall'alto **e verifica di averlo aspettato**, invece di fidarsi di un
   numero di millisecondi.
2. **E anche dopo, quel pixel era viola.** Non per un difetto: a destra del nome
   c'e' il bottone viola del footer, che parte esattamente li' e copre la linea
   come fa ogni blocco accent (D2). Misurato: e' viola **anche a riposo**, con
   il riempimento ancora arrotolato. Il caso di prova era scelto male, e ora lo
   dichiara.

Le prove a pixel passano da 152 a 164.

### D122. "Discover more" portava in vista la sezione senza muovere la pagina

Segnalato dal committente. Il markup era **gia' giusto** da sempre:
`href="#about"` verso `id="about"`. A romperlo era quello che c'e' sotto.

**Misurato:** con lo scroll morbido attivo, il click porta la sezione in vista
scrollando `#smooth-wrapper` — che e' `position: fixed` — invece della pagina.
Il wrapper finisce a `scrollTop: 1080` e `window.scrollY` resta **0**.

A schermo sembra funzionare, ed e' questo il punto. La pagina pero' si crede in
cima: le finestre d'ingresso dei blocchi scavalcati non si aprono e quei blocchi
restano **senza fili**, cioe' senza bordi, che su questa griglia e' il difetto
peggiore che ci sia. E lo scostamento del wrapper non si riassorbe: da li' in
poi ogni rotellata somma due posizioni diverse. Sotto reduced motion, dove lo
smoother non esiste, l'ancora nativa era gia' corretta.

**La prima sonda che ho scritto diceva ok.** Controllava che la sezione fosse in
vista — la sola cosa che funzionava anche da rotta. Ho dovuto guardare
`window.scrollY` accanto a `getBoundingClientRect` per vedere i due numeri
divergere. Una misura che conferma il sintomo che il committente **non** ha
segnalato non e' una misura.

**Due inciampi nel correggerlo, tutti e due utili.**

`smoother.scrollTo(elemento)` allinea a modo suo: porta a 870 invece di 1080,
cioe' lascia la sezione 210px sotto il bordo, e `'top top'` non lo sposta di un
pixel. Si passa quindi la quota, non l'elemento — misurata contro
`#smooth-content` e non contro la finestra, perche' le due coincidono solo da
fermi e un click a meta' corsa calcolerebbe male.

E i 210px **non erano suoi**: erano del fuoco. `preventScroll: true` dentro un
wrapper fisso non viene rispettato, il browser aggiusta comunque, e lasciava
posizione nativa e trasformazione del contenuto disallineate finche' non si
toccava la rotella. Spostare il fuoco prima non bastava, riallinearlo a mano
peggiorava. La soluzione e' stata smettere di combatterlo: **quell'aggiustamento
e' grande perche' l'elemento e' lontano**, quindi si chiede il fuoco a corsa
finita, quando la sezione e' gia' in cima e non c'e' piu' niente da portare in
vista. Misurato: fuoco sulla sezione, posizione esatta, nessun disallineamento.

Il fuoco si sposta perche' lo fa l'ancora nativa: senza, chi naviga da tastiera
resterebbe sul bottone e il tab ripartirebbe da sopra la sezione raggiunta.

`verify:motion` ora guarda tutte e tre le cose, e la piu' debole — "la sezione e'
in vista" — e' segnata come tale.

---

## 5. Blocchi aperti

| # | Cosa manca | Conseguenza |
|---|---|---|
| B1 | **Accesso di rete a `figma.com`** da questa sessione | La policy di egress risponde 403 al CONNECT: nessun asset immagine scaricabile (vedi `README.md`). Dalla Fase 5 il server MCP di Figma legge il file — nodi, misure, variabili, anteprime — quindi le misure si verificano alla fonte; restano fuori portata solo gli URL degli asset |
| B2 | Frame mobile e md per `/about`, `/works`, `/works/[slug]`, `/contact` e megamenu | Sotto 1200px quelle quattro route non hanno disegno |
| B3 | Backend del form, stati di errore / invio / conferma, privacy policy | Il form non è inviabile |
| B4 | Blocco Spotify: **chiuso, con il dato a mano** | Il meccanismo c'e' ed e' provato (D114, D116), ma il Web API vuole un account **Premium** come proprietario dell'app e quello del committente e' Free (D117). Decisione sua: non si prende Premium per questo. In pagina restano nome e conteggio scritti in `src/data/about.ts`, piu' il link alla playlist che ora funziona. Resta da fare una cosa sola, e non e' codice: **togliere i due secret Spotify da GitHub**, o ogni deploy continuera' a loggare un errore che sappiamo gia'. Il conteggio invecchia: quando cambia, si aggiorna li' |
| B5 | Stati hover e focus per **tutto il resto** | I due bottoni ora sono disegnati (D63). Restano senza hover le voci del footer, quelle del megamenu, le card progetto e i filtri. Il focus da tastiera e' visibile solo dentro il megamenu |
| B6 | Insieme chiuso di blocchi per i case study | Il layout di `/works/[slug]` è su misura per Seezy |
| B7 | Incoerenza menu (2 voci) / footer (3 voci), e `/contact` orfana | Vedi D12 |
| B9 | Immagini di progetto tutte 16:9 e sotto il 2x sui blocchi larghi, `about/desk.jpg` a 1x | Vedi `src/assets/README.md` |
| B14 | **`/about` si stringe fra 1200 e 1365** | Quattro blocchi di testo tengono a 1440 e chiedono fino a 17px in piu' a 1200. Dichiarati con `data-known-overflow`. Si risolve allargando qualche span o alzando il confine lg: e' una decisione di disegno |
| B13 | **Due testimonial su quattro non hanno un testo** | Noranutrizione e Aggrego: su richiesta del committente da oggi **non compaiono affatto** in pagina (D110). Restano in `src/data/testimonials.ts`: scrivere la citazione li' e la scheda torna nel giro da sola. Seezy e TAMA caffe' sono complete | Il Figma mostra quattro nomi nella riga (`266:1148`) ma una sola citazione, quella attiva. Non ne ho inventata nessuna |
| B12 | **Il form di contatto a md non sta nel proprio span, nemmeno nel Figma** | `321:2861` e' alto 633 contro i 616 di otto righe, e il contenuto ne chiede 606 piu' 40 di padding contro i 613 disponibili. Non e' un errore di trascrizione: e' il file. Serve decidere se il blocco diventa 9 righe o se cambiano spaziature e altezza della textarea |
| B15 | **Megamenu a base e md: proposta in attesa di conferma** | Composizione derivata dalle regole del file, non disegnata (D66). Se il committente la conferma, B15 si chiude; se preferisce altro, cambia una tabella in `chrome.ts` |
| B16 | **Nessuna pagina 404** | Non e' disegnata e non l'ho inventata. Oggi risponde quella essenziale di Workers. `not_found_handling: "404-page"` e' gia' pronto: il giorno che il disegno c'e', basta una route `404.astro` |
| ~~B17~~ | ~~Il deploy non parte da questa sessione~~ | **Aggirato.** `api.cloudflare.com` resta bloccato da qui (403 al CONNECT, provato anche con un token valido: `fetch failed`), ma il deploy lo fa GitHub Actions, che a Cloudflare ci arriva |
| ~~B18~~ | ~~Il ramo di produzione non esiste~~ | **Chiuso.** `main` creato. Resta da renderlo il ramo predefinito del repository, che e' un'impostazione e non cambia il funzionamento del deploy |
| ~~B19~~ | ~~I secret Cloudflare non sono impostati~~ | **Chiuso.** Entrambi nei secret del repository. Il token passato in chat durante la messa a punto va revocato |
| B20 | **Il sottodominio `workers.dev` e' quello generato da Cloudflare** | `emanuelegiovanili.emanuele-giovanili-ap.workers.dev` ripete il nome. Si cambia dal pannello (Workers & Pages, scheda Domains) o si mette un dominio proprio |
| B21 | **`emanuelegiovanili.it` non e' registrato** | Il form apre un `mailto:` verso `hello@emanuelegiovanili.it` (D90). Finche' il dominio non c'e', quelle mail non arrivano da nessuna parte |
| B22 | **Il megamenu lascia piu' nero vuoto in fondo** | Conseguenza dei social alti una cella (D89): il pannello e' ancorato in alto e si e' accorciato di una riga. A base finisce a meta' schermo. Se non piace, si redistribuisce, ma quella e' una decisione di disegno |
| B23 | **Safari resta un punto cieco** | Il motore WebKit non e' scaricabile (CDN di Playwright fuori dalla policy di uscita), quindi ogni sonda parla di Chromium. `verify:webkit` (D104) copre **una** differenza, quella costata la caccia di D101-D103, e non va spacciato per una verifica su Safari. Il difetto dei bordi e' chiuso e confermato dal committente sul suo dispositivo |
