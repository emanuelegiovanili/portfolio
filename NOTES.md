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
