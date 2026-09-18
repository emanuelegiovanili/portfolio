# Font

| File | Famiglia | Peso | Origine |
|---|---|---|---|
| `poppins-500.woff2` | Poppins | 500 | Google Fonts, sottoinsieme latino |
| `poppins-700.woff2` | Poppins | 700 | Google Fonts, sottoinsieme latino |
| `getai-black.woff2` | DT Getai Grotesk Display Black | 900 | licenza web del committente |

Solo i pesi che il Figma usa davvero: Poppins Medium per il testo di lettura, Poppins Bold per
titoli di blocco, etichette e link, Getai Black per i display.

## Se un font cambia

Ricalcolare gli override del fallback dal file reale e incollarli in `src/styles/type.css`:

```
node scripts/font-metrics.mjs --match width public/fonts/poppins-500.woff2
node scripts/font-metrics.mjs --match cap   public/fonts/getai-black.woff2
```

`--match width` per il testo di lettura, `--match cap` per i display. Il perche' e' in `NOTES.md` D21.

Poi `npm run verify:type`, che controlla sia le altezze dei titoli contro i text node Figma, sia
che il fallback resti dentro la propria cella quando il font definitivo non arriva.
