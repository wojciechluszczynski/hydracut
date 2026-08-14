# hydracut.pl

Strona produktowa wycinarki okręgów **HydraCut HPO** (Fijalo-Poland, Gdańsk).

Autor i opieka techniczna: **Wojciech Łuszczyński**, GTM Architect, [wojciech.io](https://wojciech.io).

## Stack

| Warstwa | Rozwiązanie |
|---|---|
| Generator | Astro 7, wyjście statyczne (`dist/`) |
| Style | Tailwind 4 + własna warstwa tokenów w `src/styles/global.css` |
| Fonty | self-hosted Archivo (zmienny, oś szerokości) + IBM Plex Mono, podzbiory latin i latin-ext |
| Treść | jeden plik `src/data/site.ts` |
| Formularz | `public/api/kontakt.php`, PHP `mail()` na hostingu współdzielonym |
| Hosting docelowy | Hostinger, katalog `public_html` |

Bez frameworka JS na produkcji. Cały HTML jest statyczny, JavaScript obsługuje tylko
menu mobilne, przełącznik motywu, suwak średnicy w rysunku i odsłanianie sekcji.

## Komendy

```bash
npm install
npm run dev      # serwer deweloperski, http://localhost:4321
npm run build    # build statyczny do dist/
npm run preview  # podgląd builda
```

## Struktura

```
src/
  data/site.ts        cała treść i wszystkie liczby
  layouts/Base.astro  head, SEO, JSON-LD, motyw, stopka
  components/         CutDiagram (rysunek CAD), SpecTable, Faq, LeadForm, PhotoSlot, VideoSlot
  pages/              po jednej stronie na plik, plus llms.txt.ts
public/
  .htaccess           przekierowania, nagłówki, cache dla Apache
  api/kontakt.php     endpoint formularza
  robots.txt          zgody dla wyszukiwarek i silników odpowiedzi
```

## Zasada oznaczania danych

Wartość zaczynająca się od `?` w `src/data/site.ts` jest **niepotwierdzona**.
Renderuje się z kropkowanym podkreśleniem i podpowiedzią „do potwierdzenia".
Po weryfikacji usuwasz `?` z początku wartości i przebudowujesz stronę.

Znacznik służy do danych, których nie znamy. **Nie do polityki firmy** — zdanie
„cenę podajemy w odpowiedzi na zapytanie" jest decyzją, a nie luką, i idzie bez
znacznika. Opinii klienta nie wymyślamy: dopóki nie ma prawdziwej, stoi tam
zdanie z dokumentacji producenta z uczciwym podpisem.

## Dokumentacja

- [System wizualny](docs/system-wizualny.md) — **czytaj przed zmianą układu**
- [Wdrożenie na Hostingerze](docs/wdrozenie-hostinger.md)
- [Edycja treści](docs/edycja-tresci.md)
