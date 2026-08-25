/**
 * Site content, assembled at build time.
 *
 * Everything the editors manage in Sanity wins; anything not modelled there yet
 * falls back to `site.static.ts`, which stays the source of truth for the rest.
 * If the Content Lake cannot be reached the build still succeeds on the static
 * copy, because a marketing site must not fail to build over a network blip.
 *
 * Components import `site` exactly as before. None of them had to change.
 */
import {createClient} from '@sanity/client'
import {site as staticSite} from './site.static'

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'xcq6c04g'
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'hydracut'

type Confirmable = {text?: string; unconfirmed?: boolean} | undefined

/** The site encodes "not verified with the manufacturer" as a leading "?". */
const val = (c: Confirmable, fallback: string): string => {
  if (!c?.text) return fallback
  return c.unconfirmed ? `?${c.text}` : c.text
}

const QUERY = `{
  "settings": *[_id == "siteSettings"][0],
  "home": *[_id == "homePage"][0],
  "specs": *[_id == "productSpecs"][0],
  "tracking": *[_id == "tracking"][0],
  "theme": *[_id == "theme"][0],
  "downloads": *[_type == "download"] | order(order asc) {
    title, availability, "url": file.asset->url
  }
}`

const fetchContent = async () => {
  try {
    const client = createClient({projectId, dataset, apiVersion: '2024-01-01', useCdn: false})
    return await client.fetch(QUERY)
  } catch (error) {
    console.warn(`[site] Sanity unreachable, building from the static copy: ${(error as Error).message}`)
    return null
  }
}

const cms = await fetchContent()

const keep = <T>(incoming: T | undefined | null, fallback: T): T =>
  incoming === undefined || incoming === null || (Array.isArray(incoming) && incoming.length === 0)
    ? fallback
    : incoming

const s = cms?.settings
const h = cms?.home
const sp = cms?.specs

export const site = {
  ...staticSite,

  meta: {
    ...staticSite.meta,
    brand: keep(s?.brand, staticSite.meta.brand),
    model: keep(s?.model, staticSite.meta.model),
    url: keep(s?.url, staticSite.meta.url),
    title: keep(s?.title, staticSite.meta.title),
    description: keep(s?.description, staticSite.meta.description),
    maker: keep(s?.maker, staticSite.meta.maker),
  },

  contact: {
    ...staticSite.contact,
    company: keep(s?.company, staticSite.contact.company),
    brandLine: keep(s?.brandLine, staticSite.contact.brandLine),
    phone: keep(s?.phone, staticSite.contact.phone),
    email: keep(s?.email, staticSite.contact.email),
    street: keep(s?.street, staticSite.contact.street),
    city: keep(s?.city, staticSite.contact.city),
    nip: val(s?.nip, staticSite.contact.nip),
    regon: val(s?.regon, staticSite.contact.regon),
    hours: keep(s?.hours, staticSite.contact.hours),
    reply: keep(s?.reply, staticSite.contact.reply),
  },

  nav: keep(
    s?.nav?.map((n: any) => ({label: n.label, href: n.href})),
    staticSite.nav,
  ),

  hero: {
    ...staticSite.hero,
    eyebrow: keep(h?.heroEyebrow, staticSite.hero.eyebrow),
    h1: keep(h?.heroHeading, staticSite.hero.h1),
    lead: keep(h?.heroLead, staticSite.hero.lead),
  },

  stats: keep(
    h?.stats?.map((x: any) => ({value: x.value, unit: x.unit, label: x.label})),
    staticSite.stats,
  ),

  pains: {
    ...staticSite.pains,
    rows: keep(
      h?.pains?.map((x: any) => ({pain: x.pain, gain: x.gain})),
      staticSite.pains.rows,
    ),
  },

  why: {
    ...staticSite.why,
    rows: keep(
      h?.methods?.map((x: any) => ({method: x.method, marks: x.marks ?? [], highlight: Boolean(x.highlight)})),
      staticSite.why.rows,
    ),
  },

  how: {
    ...staticSite.how,
    steps: keep(
      h?.steps?.map((x: any) => ({title: x.title, body: x.body})),
      staticSite.how.steps,
    ),
    video: {...staticSite.how.video, youtubeId: h?.videoYoutubeId || staticSite.how.video.youtubeId},
  },

  people: {
    ...staticSite.people,
    quote: h?.quote?.text
      ? {text: h.quote.text, author: h.quote.author, role: h.quote.role}
      : staticSite.people.quote,
  },

  equipment: {
    ...staticSite.equipment,
    items: keep(
      h?.equipment?.map((x: any) => ({title: x.title, body: x.body})),
      staticSite.equipment.items,
    ),
  },

  specs: {
    ...staticSite.specs,
    eyebrow: keep(sp?.eyebrow, staticSite.specs.eyebrow),
    h2: keep(sp?.heading, staticSite.specs.h2),
    caption: keep(sp?.caption, staticSite.specs.caption),
    rows: keep(
      sp?.rows?.map((r: any) => ({k: r.label, v: val(r.value, '')})),
      staticSite.specs.rows,
    ),
  },

  faq: {
    ...staticSite.faq,
    items: keep(
      h?.faq?.map((f: any) => ({q: f.question, a: f.answer})),
      staticSite.faq.items,
    ),
  },

  downloads: keep(
    cms?.downloads?.map((d: any) => ({
      title: d.title,
      file: d.availability === 'file' && d.url ? d.url : 'na zapytanie',
      format: 'PDF',
    })),
    staticSite.downloads,
  ),

  /** Editor-managed analytics identifiers. Empty strings mean "do not render". */
  tracking: {
    gtmId: cms?.tracking?.gtmId ?? '',
    ga4Id: cms?.tracking?.ga4Id ?? '',
    googleAdsId: cms?.tracking?.googleAdsId ?? '',
    metaPixelId: cms?.tracking?.metaPixelId ?? '',
    googleSiteVerification: cms?.tracking?.googleSiteVerification ?? '',
    customHeadSnippet: cms?.tracking?.customHeadSnippet ?? '',
  },

  theme: {
    accent: cms?.theme?.accent ?? 'amber',
    typeface: cms?.theme?.typeface ?? 'archivo',
    defaultMode: cms?.theme?.defaultMode ?? 'system',
  },
}

export type Site = typeof staticSite
