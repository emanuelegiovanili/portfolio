# Immagini

## Inventario

| File | Slot | Sorgente | Resa max (cap 1680) | DPR effettivo |
|---|---|---|---|---|
| `works/<slug>/cover.jpg` | card `/works` 8×4, carosello home 8×5, hero `/works/[slug]` 10×6 | 1920×1080 | 1400×840 | **1,29×** |
| `works/<slug>/gallery-N.jpg` | blocchi 10×6 e 5×4 del case study | 1920×1080 | 1400×840 / 700×560 | **1,29× / 1,93×** |
| `about/portrait.jpg` | 4×5 | 960×1200 | 560×700 | 1,71× |
| `about/desk.jpg` | 8×5 | **961×601** | 1120×700 | **0,86×** |
| `about/spotify-cover.svg` | 2×2 | vettoriale | — | — |
| `../../public/favicon.svg` | — | vettoriale | — | — |

## Convenzione

Una `cover` per progetto e una sequenza `gallery-1…N` nell'ordine di lettura della pagina.
Il file **non** dichiara il blocco che riempie: lo dichiara il JSON del progetto, che compone la
galleria su un insieme chiuso di blocchi (`wide` 10×6, `half` 5×4). Così la pagina di dettaglio
regge un numero qualsiasi di immagini senza un layout su misura.

La cover si esporta in 8×5 e non in 8×4: la stessa immagine serve al carosello della home (8×5) e
alla card di `/works` (8×4), e partendo dalla più alta il ritaglio toglie e basta.

## Stato: tre cose da sistemare

1. **Tutte le immagini di progetto sono 16:9.** Nessun blocco del layout è 16:9: sono 8:5, 8:4,
   5:3 e 5:4. Il ritaglio lo fa `object-fit: cover`, ma nel blocco 5×4 il 16:9 perde il **30%
   della larghezza**, e i mockup di laptop ci arrivano tagliati ai lati.
2. **La risoluzione sta sotto il 2× sui blocchi larghi.** Un 1920×1080 ritagliato a 5:3 dà
   1800×1080 utili per un blocco largo 1400 CSS px: 1,29×. Su schermo retina si vede.
   Servirebbe un 3840×2160.
3. **`about/desk.jpg` è a 961×601**, cioè 1× e un pixel oltre su entrambi gli assi. Va
   riesportata a 1920×1200.

## Modifiche fatte in ingresso

- Rinominati tutti i file (`Nora - portoflio cover.jpg` e simili → `cover.jpg`).
- `Seezy - Gallery3.jpg` era **un PNG con estensione .jpg**: rinominato `gallery-2.png`.
- `Cover spotify.png` rimosso: duplicato raster dell'SVG.
- Da `spotify-cover.svg` tolti il fondo `#F7F6F9` e le 16 linee `#D8D6DD`: erano la griglia di
  pagina disegnata dentro l'asset. In pagina la griglia c'è già sotto, e il blocco ha fondo al
  50% (vedi `NOTES.md` D1), quindi averla anche nell'asset l'avrebbe raddoppiata. Restano i
  quattro path del vinile.
- `favicon.svg` ricostruito in vettoriale: quadrato `#603CFF` con raggio 14 su 64 e sopra il
  glifo `lucide/chef-hat` in `#F7F6F9`. La sorgente fornita era un PNG 64×64, troppo piccolo per
  `apple-touch-icon`. Da questo SVG sono generati `apple-touch-icon.png` (180) e `favicon-32.png`.
