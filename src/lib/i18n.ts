/**
 * Language layer for a site that is built once per language.
 *
 * The whole codebase imports the `site` singleton from `data/site`, so making
 * content locale-aware inside one build would have meant threading a locale
 * prop through 21 files and 6 shared components. Instead the build runs three
 * times with SITE_LANG set, and each run emits one language into its own tree.
 * Nothing downstream had to learn about locales; only this module and the
 * router did.
 */
import routes from './routes.json'
import strings from './ui.json'

export const LOCALES = ['pl', 'en', 'de', 'uk'] as const
export type Locale = (typeof LOCALES)[number]

/** Language of the current build. Everything else derives from it. */
export const LANG: Locale = (() => {
  const raw = import.meta.env.SITE_LANG
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : 'pl'
})()

/**
 * The URL prefix is deliberately not the locale code. Ukrainian is `uk` under
 * ISO 639-1 and has to stay `uk` in lang and hreflang, but a Ukrainian reader
 * recognises UA, and `/uk/` next to `/en/` reads as the United Kingdom. The
 * code stays correct for machines, the address stays legible for people.
 */
const URL_PREFIX: Record<Locale, string> = {pl: '', en: '/en', de: '/de', uk: '/ua'}

export const prefixOf = (lang: Locale) => URL_PREFIX[lang]

/**
 * Slugs are translated, not just prefixed. A German buyer landing on
 * /de/dane-techniczne/ reads it as a site that was not really translated,
 * and that impression costs more than the routing does.
 */
export const ROUTES = routes as Record<RouteKey, Record<Locale, string>>

export type RouteKey = keyof typeof routes

/** Path of a route in a given language, prefix included. */
export const L = (key: RouteKey, lang: Locale = LANG): string =>
  `${prefixOf(lang)}${ROUTES[key][lang]}`

/** Every language version of one route, for hreflang and the switcher. */
export const alternates = (key: RouteKey) =>
  LOCALES.map((lang) => ({lang, href: L(key, lang)}))

/** BCP 47 tags, for the lang attribute, og:locale and JSON-LD. */
export const BCP47: Record<Locale, string> = {pl: 'pl-PL', en: 'en-GB', de: 'de-DE', uk: 'uk-UA'}
export const OG_LOCALE: Record<Locale, string> = {pl: 'pl_PL', en: 'en_GB', de: 'de_DE', uk: 'uk_UA'}
export const LANG_NAME: Record<Locale, string> = {pl: 'Polski', en: 'English', de: 'Deutsch', uk: 'Українська'}

/** Two-letter label on the switcher. Ukrainian shows its country code, not its language code. */
export const LANG_SHORT: Record<Locale, string> = {pl: 'PL', en: 'EN', de: 'DE', uk: 'UA'}

/** Static UI text that lives in components rather than in the CMS. */
export const UI = {
  home: {pl: 'Strona główna', en: 'Home', de: 'Startseite'},
  otherPosts: {pl: 'Pozostałe teksty', en: 'More articles', de: 'Weitere Beiträge'},
  langLabel: {pl: 'Język', en: 'Language', de: 'Sprache'},
  skipToContent: {pl: 'Przejdź do treści', en: 'Skip to content', de: 'Zum Inhalt springen'},
} as const

export const t = (key: keyof typeof UI, lang: Locale = LANG): string => UI[key][lang]

/**
 * Interface text that never belonged in the CMS: button labels, aria labels,
 * the words drawn on the cutting diagram. Editors do not touch these, so they
 * live in the repo rather than adding forty fields to every Sanity document.
 */
export const ui = (key: keyof typeof strings, lang: Locale = LANG): string =>
  (strings as Record<string, Record<Locale, string>>)[key][lang]

const KEY_BY_PL = Object.fromEntries(
  (Object.keys(ROUTES) as RouteKey[]).map((k) => [ROUTES[k].pl, k]),
) as Record<string, RouteKey>

/**
 * Maps a Polish path onto the current language. The build always emits Polish
 * file names — the merge step renames the directories — so this is what turns
 * an authored href, a breadcrumb or Astro.url.pathname into the address the
 * page will actually be served from.
 */
export const localizeHref = (href: string, lang: Locale = LANG): string => {
  if (!href || /^(https?:|mailto:|tel:|\/\/|#)/.test(href)) return href
  const [rawPath, hash] = href.split('#')
  const path = rawPath || '/'
  const suffix = hash ? `#${hash}` : ''
  const key = KEY_BY_PL[path]
  if (key) return `${L(key, lang)}${suffix}`
  return `${prefixOf(lang)}${path}${suffix}`
}

/** Which route the current page is, so hreflang can point at its siblings. */
export const routeKeyOf = (path: string): RouteKey | null => KEY_BY_PL[path] ?? null

import staticStrings from './static-i18n.json'

/**
 * Copy written inline in a page — the label and note on a "next" link, a
 * caption passed as a prop — never reaches the content adapter, so components
 * that receive such strings translate them here against the same map.
 */
export const tx = (value: string, lang: Locale = LANG): string => {
  if (lang === 'pl' || !value) return value
  const hit = (staticStrings as Record<string, Record<string, string>>)[value]
  return hit?.[lang] ?? value
}
