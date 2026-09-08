/**
 * Builds the site once per language and assembles one deployable tree.
 *
 * Each Astro run emits Polish directory names, because the page files are
 * Polish; the language of a run only changes which Sanity documents it reads.
 * This script renames those directories onto the translated slugs the pages
 * already link to, drops the result under /en and /de, and writes one sitemap
 * covering all three with hreflang alternates.
 */
import {execFileSync} from 'node:child_process'
import {cp, mkdir, rm, readdir, writeFile, stat, readFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'

const routes = JSON.parse(await readFile(new URL('../src/lib/routes.json', import.meta.url), 'utf8'))
const LOCALES = ['pl', 'en', 'de']
const SITE = process.env.SITE_URL || JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).homepage || ''

const trim = (p) => p.replace(/^\/|\/$/g, '')
const plToTarget = (lang) =>
  Object.values(routes)
    .filter((r) => r.pl !== '/')
    .map((r) => [trim(r.pl), trim(r[lang])])
    .sort((a, b) => b[0].length - a[0].length) // deepest first, so kontakt/dziekujemy wins over kontakt

/** Rewrite one relative path (a/b/index.html) onto the language's slugs. */
const remap = (rel, lang) => {
  const pairs = plToTarget(lang)
  for (const [from, to] of pairs) {
    if (rel === from || rel.startsWith(`${from}/`)) return to + rel.slice(from.length)
  }
  return rel
}

const walk = async (dir, base = dir, out = []) => {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) await walk(full, base, out)
    else out.push(path.relative(base, full))
  }
  return out
}

const build = (lang, outDir) => {
  console.log(`\n── build ${lang} → ${outDir}`)
  execFileSync('npx', ['astro', 'build', '--outDir', outDir], {
    stdio: 'inherit',
    env: {...process.env, SITE_LANG: lang},
  })
}

const root = process.cwd()
const dist = path.join(root, 'dist')
const staging = path.join(root, '.i18n-build')

await rm(staging, {recursive: true, force: true})
await rm(dist, {recursive: true, force: true})

for (const lang of LOCALES) build(lang, path.join(staging, lang))

// Polish is the root tree.
await cp(path.join(staging, 'pl'), dist, {recursive: true})

// The other languages go under their prefix, with directories renamed.
const pages = {pl: [], en: [], de: []}
for (const lang of LOCALES.filter((l) => l !== 'pl')) {
  const src = path.join(staging, lang)
  for (const rel of await walk(src)) {
    const mapped = remap(rel.split(path.sep).join('/'), lang)
    const dest = path.join(dist, lang, mapped)
    await mkdir(path.dirname(dest), {recursive: true})
    await cp(path.join(src, rel), dest)
  }
}

// Collect page URLs per language for the sitemap, from what actually exists.
for (const lang of LOCALES) {
  const base = lang === 'pl' ? dist : path.join(dist, lang)
  if (!existsSync(base)) continue
  for (const rel of await walk(base)) {
    if (path.basename(rel) !== 'index.html') continue
    if (lang === 'pl' && (rel.startsWith('en/') || rel.startsWith('de/'))) continue
    const dir = path.dirname(rel).split(path.sep).join('/')
    const urlPath = dir === '.' ? '/' : `/${dir}/`
    pages[lang].push(lang === 'pl' ? urlPath : `/${lang}${urlPath}`)
  }
}

/** Pair each page with its siblings so the sitemap can carry hreflang. */
const keyOf = (urlPath, lang) => {
  const bare = lang === 'pl' ? urlPath : urlPath.replace(`/${lang}`, '') || '/'
  for (const [key, r] of Object.entries(routes)) if (trim(r[lang]) === trim(bare)) return key
  const art = bare.match(/^\/[^/]+\/(.+?)\/$/)
  return art ? `article:${art[1]}` : null
}

const groups = new Map()
for (const lang of LOCALES)
  for (const p of pages[lang]) {
    const k = keyOf(p, lang) ?? `solo:${lang}:${p}`
    if (!groups.has(k)) groups.set(k, {})
    groups.get(k)[lang] = p
  }

const esc = (u) => u.replace(/&/g, '&amp;')
const today = new Date().toISOString().slice(0, 10)
const urls = []
for (const [key, byLang] of groups) {
  if (key.startsWith('solo:') && Object.values(byLang)[0].includes('404')) continue
  for (const [lang, p] of Object.entries(byLang)) {
    if (p.includes('polityka-prywatnosci') || p.includes('privacy-policy') || p.includes('datenschutz')) continue
    const alts = Object.entries(byLang)
      .map(([l, ap]) => `    <xhtml:link rel="alternate" hreflang="${{pl: 'pl-PL', en: 'en-GB', de: 'de-DE'}[l]}" href="${esc(SITE + ap)}"/>`)
      .join('\n')
    urls.push(
      `  <url>\n    <loc>${esc(SITE + p)}</loc>\n    <lastmod>${today}</lastmod>\n${alts}\n` +
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE + (byLang.pl ?? p))}"/>\n  </url>`,
    )
  }
}

await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
)
await rm(path.join(dist, 'sitemap-index.xml'), {force: true})
await rm(path.join(dist, 'sitemap-0.xml'), {force: true})
await rm(staging, {recursive: true, force: true})

console.log(`\n✓ dist gotowy — pl:${pages.pl.length} en:${pages.en.length} de:${pages.de.length}, ${urls.length} adresów w sitemap.xml`)
