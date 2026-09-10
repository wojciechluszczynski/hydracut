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
const LOCALES = ['pl', 'en', 'de', 'uk']
const HREFLANG = {pl: 'pl-PL', en: 'en-GB', de: 'de-DE', uk: 'uk-UA'}
// Musi zgadzac sie z URL_PREFIX w src/lib/i18n.ts: ukrainski jedzie pod /ua/.
const PREFIX = {pl: '', en: 'en', de: 'de', uk: 'ua'}
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
const pages = Object.fromEntries(LOCALES.map((l) => [l, []]))
for (const lang of LOCALES.filter((l) => l !== 'pl')) {
  const src = path.join(staging, lang)
  for (const rel of await walk(src)) {
    const mapped = remap(rel.split(path.sep).join('/'), lang)
    const dest = path.join(dist, PREFIX[lang], mapped)
    await mkdir(path.dirname(dest), {recursive: true})
    await cp(path.join(src, rel), dest)
  }
}

// Collect page URLs per language for the sitemap, from what actually exists.
for (const lang of LOCALES) {
  const base = lang === 'pl' ? dist : path.join(dist, PREFIX[lang])
  if (!existsSync(base)) continue
  for (const rel of await walk(base)) {
    if (path.basename(rel) !== 'index.html') continue
    if (lang === 'pl' && LOCALES.some((l) => l !== 'pl' && rel.startsWith(`${PREFIX[l]}/`))) continue
    const dir = path.dirname(rel).split(path.sep).join('/')
    const urlPath = dir === '.' ? '/' : `/${dir}/`
    pages[lang].push(lang === 'pl' ? urlPath : `/${PREFIX[lang]}${urlPath}`)
  }
}

/** Pair each page with its siblings so the sitemap can carry hreflang. */
const keyOf = (urlPath, lang) => {
  const bare = lang === 'pl' ? urlPath : urlPath.replace(`/${PREFIX[lang]}`, '') || '/'
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
    // Wykluczamy po kluczu trasy, nie po nazwie sluga: lista slugow milczaco
    // przepuszczala kazdy nowy jezyk, przez co ukrainska polityka prywatnosci
    // trafila do sitemapy, a jej trzy siostry nie.
    if (key === 'privacy') continue
    const alts = Object.entries(byLang)
      .map(([l, ap]) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${esc(SITE + ap)}"/>`)
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

console.log(`
✓ dist gotowy — ${LOCALES.map((l) => `${l}:${pages[l].length}`).join(' ')}, ${urls.length} adresów w sitemap.xml`)
