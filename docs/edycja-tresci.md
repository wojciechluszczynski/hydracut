# Edycja treści

Cała treść strony siedzi w jednym pliku: **`src/data/site.ts`**.
Komponenty nie mają w sobie żadnych zdań ani liczb, więc nie musisz ich otwierać.

## Jak to wygląda

```ts
stats: [
  { value: '100', unit: 'mm', label: 'Głębokość cięcia' },
  ...
],
```

Zmieniasz tekst w cudzysłowie, zapisujesz plik, uruchamiasz `npm run build`
i wgrywasz `dist/` na serwer. Instrukcja wgrywania: [wdrozenie-hostinger.md](wdrozenie-hostinger.md).

## Znak zapytania na początku wartości

`v: '?840 × 1080 mm'` oznacza **daną niepotwierdzoną**. Na stronie taka wartość ma
kropkowane podkreślenie i podpowiedź „do potwierdzenia". Kiedy potwierdzisz liczbę
w dokumentacji technicznej, kasujesz sam znak `?`:

```ts
v: '840 × 1080 mm'
```

Lista wszystkich takich miejsc:

```bash
grep -n "'?" src/data/site.ts
```

## Gdzie co siedzi

| Sekcja pliku | Co zmienia |
|---|---|
| `meta` | tytuł i opis strony w Google |
| `contact` | telefon, e-mail, adres, NIP, godziny |
| `hero` | nagłówek główny i zdanie pod nim |
| `stats` | pasek pięciu liczb pod hero |
| `pains` | zestawienie „tak jest zwykle" i „z HydraCut" |
| `why` | porównanie metod cięcia |
| `how` | cztery kroki pracy oraz **film** (`youtubeId`) |
| `people` | sekcja o ludziach i cytat użytkownika |
| `uses`, `equipment`, `specs` | zastosowania, wyposażenie, tabela parametrów |
| `faq` | pytania; `home: true` oznacza pokazanie także na stronie głównej |
| `photos` | lista ujęć do zrobienia, opisy widoczne w pustych ramkach |
| `downloads` | pliki PDF do pobrania |
| `pages` | treść podstron |

## Film promocyjny

W `how.video` wpisz identyfikator filmu z YouTube:

```ts
video: { youtubeId: 'dQw4w9WgXcQ', caption: '...', title: '...' }
```

Identyfikator to fragment adresu po `watch?v=`. Do czasu wpisania wartości na stronie
widać ramkę z podpisem „Film promocyjny, wkrótce". Film ładuje się dopiero po kliknięciu,
więc do tego momentu przeglądarka nie łączy się z serwerami YouTube i nie ma potrzeby
pytania o zgodę na cookies.

## Zdjęcia

Puste ramki na stronie opisują ujęcie, które ma tam trafić, razem z proporcją i minimalną
szerokością. Kiedy zdjęcia będą gotowe:

1. wrzuć pliki do `public/foto/`,
2. w `src/data/site.ts` dopisz do danego wpisu `src: '/foto/nazwa.webp'`,
3. przebuduj stronę.

## Czego nie zmieniać bez potrzeby

- `src/styles/global.css` — kolory, siatka i typografia całej strony.
- `public/.htaccess` — przekierowania i nagłówki serwera.
- `src/pages/llms.txt.ts` — plik dla wyszukiwarek AI, generuje się sam z treści.
