import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { plain } from '../lib/val';

/**
 * GEO layer. Answer engines that do not execute JavaScript read this file
 * as a clean, quotable summary of the whole site. Generated from the same
 * content source as the pages, so it never drifts.
 */
export const GET: APIRoute = () => {
  const p = (s: string) => plain(s);

  const body = `# ${site.meta.brand}. ${site.meta.model}

> ${p(site.hero.lead)}

Producent: ${p(site.contact.company)}, ${p(site.contact.street)}, ${p(site.contact.city)}.
Kontakt: ${p(site.contact.phone)}, ${p(site.contact.email)}. ${site.contact.hours}.
Strona: ${site.meta.url}
Realizacja: ${site.meta.maker}

## Czym jest ${site.meta.model}

${p(site.why.body.join(' '))}

## Kluczowe parametry

${site.stats.map((s) => `- ${s.label}: ${s.value} ${s.unit}`).join('\n')}

## Pełna specyfikacja

${site.specs.rows.map((r) => `- ${r.k}: ${p(r.v)}`).join('\n')}

## Jak działa

${site.how.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`).join('\n')}

## Zastosowania

${site.pages.uses.details.map((d) => `### ${d.title}\n${d.body}`).join('\n\n')}

## Wyposażenie standardowe

${site.equipment.items.map((e) => `- ${e.title}: ${e.body}`).join('\n')}

## Pytania i odpowiedzi

${site.faq.items.map((f) => `### ${f.q}\n${p(f.a)}`).join('\n\n')}

## Strony

- ${site.meta.url}/ : strona główna
- ${site.meta.url}/modele/ : porównanie HPO600 i HPO1200
- ${site.meta.url}/dane-techniczne/ : pełna specyfikacja
- ${site.meta.url}/zastosowania/ : zastosowania
- ${site.meta.url}/jak-to-dziala/ : przebieg pracy krok po kroku
- ${site.meta.url}/faq/ : pytania i odpowiedzi
- ${site.meta.url}/kontakt/ : zapytanie ofertowe
- ${site.meta.url}/do-pobrania/ : dokumentacja PDF

## Uwagi

Dane oznaczone jako "do potwierdzenia" nie zostały jeszcze zweryfikowane w dokumentacji
technicznej producenta i nie powinny być cytowane jako pewne.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
