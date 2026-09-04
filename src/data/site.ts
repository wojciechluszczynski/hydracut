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
  },
  "media": *[_id == "mediaSlots"][0],
  "assets": *[_type == "sanity.imageAsset"]{_id, url, metadata{dimensions}},
  "pages": *[_type == "pageContent"]{key, h1, lead, title, description},
  "models": *[_id == "modelComparison"][0],
  "articles": *[_type == "article" && defined(slug.current)] | order(published desc){
    title, "slug": slug.current, lead, seoTitle, seoDescription, published, readMin, body
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

/**
 * Redaktor wkleja to, co ma pod reka: caly adres z paska albo sam identyfikator.
 * Obie postacie sa poprawne, wiec wyciagamy identyfikator zamiast wymagac jednej.
 */
const idYouTube = (wartosc?: string | null): string => {
  const v = (wartosc ?? '').trim()
  if (!v) return ''
  if (/^[\w-]{11}$/.test(v)) return v
  const m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : ''
}

const keep = <T>(incoming: T | undefined | null, fallback: T): T =>
  incoming === undefined || incoming === null || (Array.isArray(incoming) && incoming.length === 0)
    ? fallback
    : incoming

const assetsById = new Map<string, any>((cms?.assets ?? []).map((a: any) => [a._id, a]))

/** Sanity serves images from its own CDN; ask for a sensible size and format. */
const img = (slot: any, fallback: {src: string; alt: string; w?: number; h?: number}) => {
  const asset = assetsById.get(slot?.asset?._ref)
  if (!asset?.url) return fallback
  const d = asset.metadata?.dimensions
  return {
    src: `${asset.url}?w=1600&fm=webp&q=78`,
    alt: slot.alt || fallback.alt,
    w: d?.width ?? fallback.w,
    h: d?.height ?? fallback.h,
  }
}

const pageBy = (key: string) => (cms?.pages ?? []).find((p: any) => p.key === key)

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
    video: {...staticSite.how.video, youtubeId: idYouTube(h?.videoYoutubeId) || staticSite.how.video.youtubeId},
  },

  people: {
    ...staticSite.people,
    eyebrow: keep(h?.sectionHeadings?.peopleEyebrow, staticSite.people.eyebrow),
    h2: keep(h?.sectionHeadings?.peopleHeading, staticSite.people.h2),
    body: keep(h?.peopleBody, staticSite.people.body),
    facts: keep(
      h?.peopleFacts?.map((f: any) => ({k: f.label, v: f.value})),
      staticSite.people.facts,
    ),
    quote: h?.quote?.text
      ? {text: h.quote.text, author: h.quote.author, role: h.quote.role}
      : staticSite.people.quote,
  },

  uses: {
    ...staticSite.uses,
    eyebrow: keep(h?.sectionHeadings?.usesEyebrow, staticSite.uses.eyebrow),
    h2: keep(h?.sectionHeadings?.usesHeading, staticSite.uses.h2),
    items: keep(
      h?.uses?.map((u: any, i: number) => ({
        title: u.title,
        body: u.body,
        icon: u.icon ?? staticSite.uses.items[i]?.icon,
      })),
      staticSite.uses.items,
    ),
  },

  maker: {
    ...staticSite.maker,
    eyebrow: keep(h?.sectionHeadings?.makerEyebrow, staticSite.maker.eyebrow),
    h2: keep(h?.sectionHeadings?.makerHeading, staticSite.maker.h2),
    body: keep(h?.makerBody, staticSite.maker.body),
    facts: keep(
      h?.makerFacts?.map((f: any) => ({k: f.label, v: f.value})),
      staticSite.maker.facts,
    ),
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

  // Only HydraCut ships a two-model comparison; HornetCut has no such section.
  ...((staticSite as any).models
    ? {
        models: {
          ...(staticSite as any).models,
          eyebrow: keep(cms?.models?.eyebrow, (staticSite as any).models.eyebrow),
          h2: keep(cms?.models?.heading, (staticSite as any).models.h2),
          lead: keep(cms?.models?.lead, (staticSite as any).models.lead),
          items: keep(
            cms?.models?.items?.map((m: any) => ({
              name: m.name, range: m.range, blade: m.blade, weight: m.weight, note: m.note,
            })),
            (staticSite as any).models.items,
          ),
          rows: keep(
            cms?.models?.rows?.map((r: any) => ({k: r.label, a: r.a, b: r.b})),
            (staticSite as any).models.rows,
          ),
        },
      }
    : {}),

  form: {
    ...staticSite.form,
    eyebrow: keep(s?.formEyebrow, staticSite.form.eyebrow),
    h2: keep(s?.formHeading, staticSite.form.h2),
    intro: keep(s?.formIntro, staticSite.form.intro),
    fields: {...staticSite.form.fields, ...(s?.formLabels ?? {})},
    scopeOptions: keep(s?.formScopeOptions, staticSite.form.scopeOptions),
    consent: keep(s?.formConsent, staticSite.form.consent),
  },

  photos: Object.fromEntries(
    Object.entries(staticSite.photos).map(([name, fallback]: [string, any]) => [
      name,
      {...fallback, ...img(cms?.media?.[name], fallback)},
    ]),
  ) as typeof staticSite.photos,

  media: Object.fromEntries(
    Object.entries(staticSite.media).map(([name, fallback]: [string, any]) =>
      'video' in fallback ? [name, fallback] : [name, img(cms?.media?.[name], fallback)],
    ),
  ) as typeof staticSite.media,

  pages: Object.fromEntries(
    Object.entries(staticSite.pages).map(([key, fallback]: [string, any]) => {
      const p = pageBy(key)
      return [
        key,
        p ? {...fallback, h1: keep(p.h1, fallback.h1), lead: keep(p.lead, fallback.lead), title: keep(p.title, fallback.title), description: keep(p.description, fallback.description)} : fallback,
      ]
    }),
  ) as typeof staticSite.pages,

  /** Guide articles. Empty until an editor writes one, which is a valid state. */
  articles: (cms?.articles ?? []).map((a: any) => ({
    title: a.title,
    h1: a.title,
    slug: a.slug,
    lead: a.lead ?? '',
    description: a.seoDescription ?? a.lead ?? '',
    published: a.published ?? '',
    readMin: a.readMin ?? 5,
    body: a.body ?? [],
  })),

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
