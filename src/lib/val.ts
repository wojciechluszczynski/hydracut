/**
 * Values in src/data/site.ts that start with "?" are not confirmed yet.
 * plain() strips the marker for attributes, meta tags and JSON-LD.
 * isTbd() drives the visual marker in <Val />.
 */
export const isTbd = (text: string): boolean => text.startsWith('?');

export const plain = (text: string): string => (isTbd(text) ? text.slice(1) : text);

const NBSP = ' ';

/**
 * Polish typography: never break a number from its unit, and never leave a
 * one-letter word at the end of a line.
 */
export const tighten = (text: string): string =>
  text
    .replace(/(\d)\s+(mm|cm|m|kg|KM|kW|obr|min|h|°|%)/g, `$1${NBSP}$2`)
    .replace(/(^|[\s(])([aiouwz])\s+/gi, `$1$2${NBSP}`);

/** Same rule applied inside a longer sentence: "?" marks the whole sentence. */
export const splitTbd = (text: string): { text: string; tbd: boolean } => ({
  text: tighten(plain(text)),
  tbd: isTbd(text),
});
