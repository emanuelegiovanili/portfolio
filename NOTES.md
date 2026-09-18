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
- Il `scrollbar-gutter: stable` che serve a non far saltare la griglia all'apertura del megamenu
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

## 5. Blocchi aperti

| # | Cosa manca | Conseguenza |
|---|---|---|
| B1 | **Accesso di rete a `figma.com`** da questa sessione | La policy di egress risponde 403 al CONNECT. Nessun asset immagine scaricabile. Vedi `README.md` |
| B2 | Frame mobile e md per `/about`, `/works`, `/works/[slug]`, `/contact` e megamenu | Sotto 1200px quelle quattro route non hanno disegno |
| B3 | Backend del form, stati di errore / invio / conferma, privacy policy | Il form non è inviabile |
| B4 | Blocco Spotify: "32 songs" e "Now playing" sono dati vivi o uno snapshot | Scritto a mano sarà sbagliato entro un mese |
| B5 | Stati hover e focus | Non progettati per nessun componente. Il disabilitato del Send e l'attivo del filtro invece esistono (§4.4, §4.5) |
| B6 | Insieme chiuso di blocchi per i case study | Il layout di `/works/[slug]` è su misura per Seezy |
| B7 | Incoerenza menu (2 voci) / footer (3 voci), e `/contact` orfana | Vedi D12 |
| B9 | Immagini di progetto tutte 16:9 e sotto il 2x sui blocchi larghi, `about/desk.jpg` a 1x | Vedi `src/assets/README.md` |
| B14 | **`/about` si stringe fra 1200 e 1365** | Quattro blocchi di testo tengono a 1440 e chiedono fino a 17px in piu' a 1200. Dichiarati con `data-known-overflow`. Si risolve allargando qualche span o alzando il confine lg: e' una decisione di disegno |
| B13 | **Tre testimonial su quattro non hanno un testo** | Il Figma mostra quattro nomi nella riga (`266:1148`) ma una sola citazione, quella attiva. Le schede senza testo ci sono ma non sono selezionabili: non ne ho inventata nessuna |
| B12 | **Il form di contatto a md non sta nel proprio span, nemmeno nel Figma** | `321:2861` e' alto 633 contro i 616 di otto righe, e il contenuto ne chiede 606 piu' 40 di padding contro i 613 disponibili. Non e' un errore di trascrizione: e' il file. Serve decidere se il blocco diventa 9 righe o se cambiano spaziature e altezza della textarea |
