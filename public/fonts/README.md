# Font

## Presenti

- `poppins-500.woff2`, `poppins-700.woff2` — sottoinsieme latino, da Google Fonts.
  Solo i due pesi che il Figma usa davvero: Medium per il testo di lettura,
  Bold per titoli di blocco, etichette e link.

## Mancante

- `getai-black.woff2` — **DT Getai Grotesk Display Black**.

E' un font commerciale, non scaricabile. Serve il woff2 della licenza web.
Finche' manca, `font-display: optional` fa cadere tutti i titoli sul fallback
di sistema: il layout regge (le altezze dei blocchi sono in celle, non in
righe di testo) ma il disegno non e' quello.

Quando arriva, mettere il file qui e rigenerare le metriche del fallback:

```
node scripts/font-metrics.mjs public/fonts/getai-black.woff2
```

e incollare il blocco stampato in `src/styles/type.css`, aggiungendo
`'Getai Fallback'` allo stack di `--font-display` in `tokens.css` (c'e' gia').
