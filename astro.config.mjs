// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static build. Output lands in dist/ and is uploaded to Hostinger public_html.
// Directory format + trailing slashes keeps Apache happy without rewrite gymnastics.
export default defineConfig({
  site: 'https://hydracut.pl',
  trailingSlash: 'always',
  // Inline the CSS: two fewer render-blocking requests on a site this small.
  // assets: 'assets' zamiast domyślnego '_astro'. Katalog z podkreśleniem na
  // początku znikał przy operacji "move" w menedżerze plików Hostingera i
  // wszystkie czcionki zwracały 404. Sprawdzone na Hornecie.
  build: { format: 'directory', inlineStylesheets: 'always', assets: 'assets' },
  compressHTML: true,
  // Sitemap is written by scripts/build-i18n.mjs instead: it is the only step
  // that sees all three language trees at once and can pair them with hreflang.
  integrations: [],
  vite: { plugins: [tailwindcss()] },
});
