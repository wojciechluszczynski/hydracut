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
import {LANG, localizeHref} from '../lib/i18n'
import staticStrings from '../lib/static-i18n.json'

/**
 * The static fallback is written in Polish and holds copy the CMS never
 * modelled. Exact strings are swapped through a map, so a phrase missing from
 * the map stays Polish and is visibly untranslated rather than silently wrong.
 */
const translateStatic = <T>(node: T): T => {
  if (LANG === 'pl') return node
  if (typeof node === 'string') {
    const hit = (staticStrings as Record<string, Record<string, string>>)[node]
    return (hit?.[LANG] ?? node) as unknown as T
  }
  if (Array.isArray(node)) return node.map(translateStatic) as unknown as T
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = k === 'href' || k === 'src' || k === 'url' ? v : translateStatic(v)
    }
    return out as T
  }
  return node
}

/**
 * Translations live as sibling documents with a language suffix, so adding a
 * language never touches the schema: `homePage` is Polish, `homePage__en` is
 * English. Every read coalesces down to the Polish document, which means a
 * half-translated site still builds and shows Polish where a translation is
 * missing rather than an empty page.
 */
const sfx = LANG === 'pl' ? '' : `__${LANG}`
const tr = (id: string) => (sfx ? `coalesce(*[_id == "${id}${sfx}"][0], *[_id == "${id}"][0])` : `*[_id == "${id}"][0]`)

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'xcq6c04g'
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'hydracut'

type Confirmable = {text?: string; unconfirmed?: boolean} | undefined

/** The site encodes "not verified with the manufacturer" as a leading "?". */
const val = (c: Confirmable, fallback: string): string => {
  if (!c?.text) return fallback
  return c.unconfirmed ? `?${c.text}` : c.text
}

const QUERY = `{
  "settings": ${tr('siteSettings')},
  "home": ${tr('homePage')},
  "specs": ${tr('productSpecs')},
  "tracking": *[_id == "tracking"][0],
  "theme": *[_id == "theme"][0],
  "downloads": *[_type == "download" && coalesce(language, "pl") == "${LANG}"] | order(order asc) {
    title, availability, "url": file.asset->url
  },
  "media": *[_id == "mediaSlots"][0],
  "mediaAlt": ${sfx ? `*[_id == "mediaSlots${sfx}"][0]` : 'null'},
  "assets": *[_type == "sanity.imageAsset"]{_id, url, metadata{dimensions}},
  "pages": *[_type == "pageContent" && coalesce(language, "pl") == "${LANG}"]{key, h1, lead, title, description},
  "models": ${tr('modelComparison')},
  "articles": *[_type == "article" && defined(slug.current) && coalesce(language, "pl") == "${LANG}"] | order(published desc){
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
const img = (slot: any, fallback: {src: string; alt: string; w?: number; h?: number}, key?: string) => {
  const asset = assetsById.get(slot?.asset?._ref)
  if (!asset?.url) return fallback
  const d = asset.metadata?.dimensions
  return {
    src: `${asset.url}?w=1600&fm=webp&q=78`,
    alt: (key ? cms?.mediaAlt?.[key]?.alt : undefined) || slot.alt || fallback.alt,
    w: d?.width ?? fallback.w,
    h: d?.height ?? fallback.h,
  }
}

const pageBy = (key: string) => (cms?.pages ?? []).find((p: any) => p.key === key)

const s = cms?.settings
const h = cms?.home
const sp = cms?.specs

/**
 * Internal links live inside the content (nav, CTAs, footer) as Polish paths.
 * The finished object is walked once and every internal href is mapped through
 * the route table, so a field that holds a link never has to be found by hand.
 */
const localizeDeep = <T>(node: T): T => {
  if (Array.isArray(node)) return node.map(localizeDeep) as unknown as T
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = k === 'href' && typeof v === 'string' ? localizeHref(v) : localizeDeep(v)
    }
    return out as T
  }
  return node
}

const translated = translateStatic(staticSite)

const assembled = {
  ...translated,

  meta: {
    ...translated.meta,
    brand: keep(s?.brand, translated.meta.brand),
    model: keep(s?.model, translated.meta.model),
    url: keep(s?.url, translated.meta.url),
    title: keep(s?.title, translated.meta.title),
    description: keep(s?.description, translated.meta.description),
    maker: keep(s?.maker, translated.meta.maker),
  },

  contact: {
    ...translated.contact,
    company: keep(s?.company, translated.contact.company),
    brandLine: keep(s?.brandLine, translated.contact.brandLine),
    phone: keep(s?.phone, translated.contact.phone),
    email: keep(s?.email, translated.contact.email),
    street: keep(s?.street, translated.contact.street),
    city: keep(s?.city, translated.contact.city),
    nip: val(s?.nip, translated.contact.nip),
    regon: val(s?.regon, translated.contact.regon),
    hours: keep(s?.hours, translated.contact.hours),
    reply: keep(s?.reply, translated.contact.reply),
  },

  nav: keep(
    s?.nav?.map((n: any) => ({label: n.label, href: n.href})),
    translated.nav,
  ),

  hero: {
    ...translated.hero,
    eyebrow: keep(h?.heroEyebrow, translated.hero.eyebrow),
    h1: keep(h?.heroHeading, translated.hero.h1),
    lead: keep(h?.heroLead, translated.hero.lead),
  },

  stats: keep(
    h?.stats?.map((x: any) => ({value: x.value, unit: x.unit, label: x.label})),
    translated.stats,
  ),

  pains: {
    ...translated.pains,
    eyebrow: keep(h?.sectionHeadings?.painsEyebrow, translated.pains.eyebrow),
    h2: keep(h?.sectionHeadings?.painsHeading, translated.pains.h2),
    rows: keep(
      h?.pains?.map((x: any) => ({pain: x.pain, gain: x.gain})),
      translated.pains.rows,
    ),
  },

  why: {
    ...translated.why,
    eyebrow: keep(h?.sectionHeadings?.whyEyebrow, translated.why.eyebrow),
    h2: keep(h?.sectionHeadings?.whyHeading, translated.why.h2),
    rows: keep(
      h?.methods?.map((x: any) => ({method: x.method, marks: x.marks ?? [], highlight: Boolean(x.highlight)})),
      translated.why.rows,
    ),
  },

  how: {
    ...translated.how,
    eyebrow: keep(h?.sectionHeadings?.howEyebrow, translated.how.eyebrow),
    h2: keep(h?.sectionHeadings?.howHeading, translated.how.h2),
    steps: keep(
      h?.steps?.map((x: any) => ({title: x.title, body: x.body})),
      translated.how.steps,
    ),
    video: {...translated.how.video, youtubeId: idYouTube(h?.videoYoutubeId) || translated.how.video.youtubeId},
  },

  people: {
    ...translated.people,
    eyebrow: keep(h?.sectionHeadings?.peopleEyebrow, translated.people.eyebrow),
    h2: keep(h?.sectionHeadings?.peopleHeading, translated.people.h2),
    body: keep(h?.peopleBody, translated.people.body),
    facts: keep(
      h?.peopleFacts?.map((f: any) => ({k: f.label, v: f.value})),
      translated.people.facts,
    ),
    quote: h?.quote?.text
      ? {text: h.quote.text, author: h.quote.author, role: h.quote.role}
      : translated.people.quote,
  },

  uses: {
    ...translated.uses,
    eyebrow: keep(h?.sectionHeadings?.usesEyebrow, translated.uses.eyebrow),
    h2: keep(h?.sectionHeadings?.usesHeading, translated.uses.h2),
    items: keep(
      h?.uses?.map((u: any, i: number) => ({
        title: u.title,
        body: u.body,
        icon: u.icon ?? translated.uses.items[i]?.icon,
      })),
      translated.uses.items,
    ),
  },

  maker: {
    ...translated.maker,
    eyebrow: keep(h?.sectionHeadings?.makerEyebrow, translated.maker.eyebrow),
    h2: keep(h?.sectionHeadings?.makerHeading, translated.maker.h2),
    body: keep(h?.makerBody, translated.maker.body),
    facts: keep(
      h?.makerFacts?.map((f: any) => ({k: f.label, v: f.value})),
      translated.maker.facts,
    ),
  },

  equipment: {
    ...translated.equipment,
    eyebrow: keep(h?.sectionHeadings?.equipmentEyebrow, translated.equipment.eyebrow),
    h2: keep(h?.sectionHeadings?.equipmentHeading, translated.equipment.h2),
    items: keep(
      h?.equipment?.map((x: any) => ({title: x.title, body: x.body})),
      translated.equipment.items,
    ),
  },

  specs: {
    ...translated.specs,
    eyebrow: keep(sp?.eyebrow, translated.specs.eyebrow),
    h2: keep(sp?.heading, translated.specs.h2),
    caption: keep(sp?.caption, translated.specs.caption),
    rows: keep(
      sp?.rows?.map((r: any) => ({k: r.label, v: val(r.value, '')})),
      translated.specs.rows,
    ),
  },

  faq: {
    ...translated.faq,
    eyebrow: keep(h?.sectionHeadings?.faqEyebrow, translated.faq.eyebrow),
    h2: keep(h?.sectionHeadings?.faqHeading, translated.faq.h2),
    items: keep(
      h?.faq?.map((f: any) => ({q: f.question, a: f.answer})),
      translated.faq.items,
    ),
  },

  downloads: keep(
    cms?.downloads?.map((d: any) => ({
      title: d.title,
      file: d.availability === 'file' && d.url ? d.url : 'na zapytanie',
      format: 'PDF',
    })),
    translated.downloads,
  ),

  // Only HydraCut ships a two-model comparison; HornetCut has no such section.
  ...((translated as any).models
    ? {
        models: {
          ...(translated as any).models,
          eyebrow: keep(cms?.models?.eyebrow, (translated as any).models.eyebrow),
          h2: keep(cms?.models?.heading, (translated as any).models.h2),
          lead: keep(cms?.models?.lead, (translated as any).models.lead),
          items: keep(
            cms?.models?.items?.map((m: any) => ({
              name: m.name, range: m.range, blade: m.blade, weight: m.weight, note: m.note,
            })),
            (translated as any).models.items,
          ),
          rows: keep(
            cms?.models?.rows?.map((r: any) => ({k: r.label, a: r.a, b: r.b})),
            (translated as any).models.rows,
          ),
        },
      }
    : {}),

  form: {
    ...translated.form,
    eyebrow: keep(s?.formEyebrow, translated.form.eyebrow),
    h2: keep(s?.formHeading, translated.form.h2),
    intro: keep(s?.formIntro, translated.form.intro),
    fields: {...translated.form.fields, ...(s?.formLabels ?? {})},
    scopeOptions: keep(s?.formScopeOptions, translated.form.scopeOptions),
    consent: keep(s?.formConsent, translated.form.consent),
  },

  photos: Object.fromEntries(
    Object.entries(translated.photos).map(([name, fallback]: [string, any]) => [
      name,
      {...fallback, ...img(cms?.media?.[name], fallback, name)},
    ]),
  ) as typeof translated.photos,

  media: Object.fromEntries(
    Object.entries(translated.media).map(([name, fallback]: [string, any]) =>
      'video' in fallback ? [name, fallback] : [name, img(cms?.media?.[name], fallback, name)],
    ),
  ) as typeof translated.media,

  pages: Object.fromEntries(
    Object.entries(translated.pages).map(([key, fallback]: [string, any]) => {
      const p = pageBy(key)
      return [
        key,
        p ? {...fallback, h1: keep(p.h1, fallback.h1), lead: keep(p.lead, fallback.lead), title: keep(p.title, fallback.title), description: keep(p.description, fallback.description)} : fallback,
      ]
    }),
  ) as typeof translated.pages,

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

export const site = localizeDeep(assembled)

export type Site = typeof staticSite
