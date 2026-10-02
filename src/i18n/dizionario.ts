/**
 * Il dizionario della lingua corrente.
 *
 * Sta in un file suo e non in `index.ts` per non chiudere un anello: `it.ts`
 * importa `daTradurre` da `index.ts`, quindi se `index.ts` importasse `it.ts`
 * i due moduli si aspetterebbero a vicenda. Gli anelli in ESM a volte
 * funzionano e a volte restituiscono `undefined` a seconda di chi viene
 * caricato per primo: non e' una cosa su cui costruire le stringhe del sito.
 */
import type { Locale } from './index';
import { en } from './en';
import { it } from './it';

const DIZIONARI = { en, it } as const;

export function dizionario(locale: Locale) {
  return DIZIONARI[locale];
}

export type { Locale };
