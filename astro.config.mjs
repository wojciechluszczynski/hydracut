// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static build. Output lands in dist/ and is uploaded to Hostinger public_html.
// Directory format + trailing slashes keeps Apache happy without rewrite gymnastics.
export default defineConfig({
  site: 'https://hydracut.pl',
  trailingSlash: 'always',
  // Inline the CSS: two fewer render-blocking requests on a site this small.
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  integrations: [
    sitemap({
      changefreq: 'monthly',
      lastmod: new Date('2026-08-06'),
      filter: (page) => !page.includes('/polityka-prywatnosci'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
