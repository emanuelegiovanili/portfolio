# Immagini — cosa va dove

Esportare **dal frame**, non dal singolo fill: alcuni blocchi hanno più livelli sovrapposti
(`299:344` ne ha due, `301:522` tre). Esportando il frame vengono già appiattiti.

Scala di esportazione: **2x** per tutto il raster. Formato PNG o JPG indifferente: la
conversione in avif/webp la fa `astro:assets` in build. Non serve comprimere a mano.

| File | Nodo Figma | Blocco | Resa | Esporta a |
|---|---|---|---|---|
| `works/seezy/cover.png` | `310:1607` | 8×5 | 960×600 | **1920×1200** |
| `works/seezy/01-10x6.png` | `310:1735` | 10×6 | 1200×720 | **2400×1440** |
| `works/seezy/02-5x4.png` | `310:1798` | 5×4 | 600×480 | **1200×960** |
| `works/seezy/03-10x6.png` | `310:1831` | 10×6 | 1200×720 | **2400×1440** |
| `works/seezy/04-10x6.png` | `312:1994` | 10×6 | 1200×720 | **2400×1440** |
| `works/seezy/05-5x4.png` | `312:1991` | 5×4 | 600×480 | **1200×960** |
| `works/seezy/06-5x4.png` | `312:1990` | 5×4 | 600×480 | **1200×960** |
| `works/tama-caffe/cover.png` | `310:1569` | 8×5 | 960×600 | **1920×1200** |
| `works/noranutrizione/cover.png` | `310:1441` | 8×5 | 960×600 | **1920×1200** |
| `about/portrait.png` | `301:1053` | 4×5 | 480×600 | **960×1200** |
| `about/desk.png` | `299:344` | 8×5 | 960×600 | **1920×1200** |
| `about/spotify-cover.svg` | `301:522` | 2×2 | 240×240 | **SVG** |

## Note

**Le cover si esportano in 8×5, non in 8×4.** La stessa immagine serve al carosello della home
(8×5) e alla card di `/works` (8×4): partendo dalla più alta il ritaglio toglie e basta, non
deforma. Nel Figma la card di `/works` è 8×4 e va ritagliata dal codice con `object-fit: cover`.

**Il numero nel nome dice lo span del blocco che riempie.** `03-10x6` va nel blocco 10×6, e
l'ordine numerico è l'ordine di lettura della pagina. Il JSON del progetto resta l'autorità, ma
così un file nel posto sbagliato si vede a colpo d'occhio.

**Il ritratto `301:1053` nel Figma sfora il proprio riquadro** (immagine al 120% dell'altezza,
posizionata a -5,73%). Esportare il riquadro 4×5 come si vede: l'inquadratura la tiene il file,
non il CSS.

**`about/spotify-cover.svg` è vettoriale**, non una foto: è l'illustrazione del vinile, composta
da tre livelli di cui uno animato. Esportare il frame intero in SVG.

## Ancora senza disegno

`tama-caffe` e `noranutrizione` non hanno una pagina di dettaglio nel Figma: serve solo la cover.
Quando ne verrà disegnata una, le immagini vanno qui con la stessa convenzione.
