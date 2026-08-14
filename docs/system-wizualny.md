# System wizualny HydraCut

Ten dokument istnieje po to, żeby HydraCut i HornetCut nie zrosły się z powrotem
w jedną stronę w dwóch kolorach. Wcześniej różnica między nimi wynosiła 38 linii
CSS, samych wartości barwnych. Teraz różni je układ, nie paleta.

## Metafora: przekrój

HydraCut pracuje w jednej płaszczyźnie: łańcuch obejmuje rurę, tarcza objeżdża
obwód i wraca w punkt startu. Strona jest rysowana **jak przekrój**. Sekcje nie
mają numerów, tylko **litery płaszczyzn przekroju** — dokładnie tak, jak oznacza
się przekrój na rysunku.

HornetCut używa **arkusza z szyną** i numerów `01`–`09`. To osobny język.
Elementów jednego nie przenosimy do drugiego.

## Elementy

| Klasa | Rola |
|---|---|
| `.cut` | kontener szerokości, odpowiednik `.shell`, ale własna nazwa systemu |
| `.plane` | wywołanie przekroju `[A]— ETYKIETA ————[A]` zamiast eyebrow |
| `.plane__line` | linia płaszczyzny cięcia we wzorze ISO: długa, krótka, długa |
| `.clamp` | obejma: cztery narożne zaczepy zamiast ramki lub karty |
| `.band--gauge` | pionowa podziałka przy prawej krawędzi pasa, kreska co 12 px |
| `.bore` | przekrój rury: współśrodkowe okręgi przecięte prostą płaszczyzną |
| `.bignum` | wielka liczba tabelaryczna |

Wywołanie przekroju stawia komponent [`Plane.astro`](../src/components/Plane.astro).
Litery: strona główna `A`–`K` po kolei, podstrony mają własną literę w nagłówku
(`<PageHero mark="M">`) i numerację sekcji od `A` w środku.

### Pułapka: siatka na tym samym elemencie co kontener

`<div class="cut pick">` sprawia, że `.cut` jest jednocześnie kontenerem i siatką,
więc `<Plane>` wpada do niej jako komórka i rozbija układ. Kontener i siatka
muszą być osobnymi elementami:

```astro
<div class="cut">
  <Plane mark="B" label="Wybór modelu" />
  <div class="pick">…</div>
</div>
```

### Pułapka: geometria w tle bierze wysokość

`.bore` jest `position: absolute`, ale reguła w rodzaju `.band > *` nadająca
`position: relative` odbiera mu to i pas rośnie o całą wysokość rysunku.
Sekcja z geometrią podnosi treść przez `#modele > .cut { position: relative }`,
a nie przez regułę na wszystkie dzieci.

### Pułapka: `assets` zamiast `_astro`

`astro.config.mjs` ma `build.assets: 'assets'`. Katalog zaczynający się od
podkreślenia znikał przy operacji „move" w menedżerze plików Hostingera
i wszystkie czcionki zwracały 404. Nie wracać do domyślnej nazwy.

### Pułapka: `isTbd` w liście plików

`do-pobrania.astro` sprawdza `d.file.startsWith('/')`, a nie `isTbd()`.
Warunek na znaczniku robił link z opisu „wysyłamy na zapytanie".

## Rytm pasów

Trzy stopnie wysokości (`.band`, `.band--tight`, `.band--wide`) i **dwa** pasy
`--paper` zamiast pięciu. Równy padding na każdym pasie sprawia, że strona tyka
jak metronom.

## Kolor

Akcent to stalowy cyjan. Zmienna nadal nazywa się `--color-amber`, bo tak
nazywa ją współdzielony szkielet — wartość jest cyjanem. Hover przycisku to
`#4fdcea`; wcześniej stał tam bursztyn Horneta i przycisk żółkł pod kursorem.

## Logotyp

Wordmark producenta zawiera już pełną nazwę „hydraCUT", więc nie dokładamy do
niego niczego. Warianty barwne: `-light` ma **jasny tusz** i idzie na ciemne tło,
`-dark` jest grafitowy i idzie na jasne. Nazwa opisuje kolor farby, nie motyw.

Znak wchodzi jako tło CSS, nie `<img>`: poprzednia wersja ładowała oba warianty
i chowała jeden przez `display: none`, czyli płaciła za nieużyty plik.

Lockup FIJALO-POLAND w stopce zostaje rastrem — to ciemny kafel z wyciętym białym
napisem, więc trasowanie alfy dałoby jednolity prostokąt. Działa na obu tłach.

## Zasady, które zostają

**Zakazane:** fiolet i indigo, gradienty blue→purple, glassmorphism, wyśrodkowane
hero z dwoma pigułkami, siatka trzech kart z ikonką lucide, `rounded-3xl`,
`shadow-2xl`, Inter, domyślny shadcn, emoji, stockowe zdjęcia AI maszyn,
półpauza w polskim copy.

**Obowiązuje:** Archivo do display i tekstu, IBM Plex Mono do każdej liczby i
etykiety, promień maksymalnie 2 px, struktura budowana kreską 1 px zamiast kart
i cieni, `prefers-reduced-motion` respektowane. Nagłówki będące pytaniami mają
pytajnik. Copy: krótkie zdania oznajmujące, konkretne liczby z jednostkami.
