/**
 * HydraCut HPO. Jedyne miejsce z treścią strony.
 *
 * ZASADA EDYCJI: cały widoczny tekst i każda liczba są tutaj. Komponenty
 * nie zawierają treści. Żeby zmienić stronę, edytujesz ten plik i przebudowujesz.
 *
 * ZNACZNIK "?" NA POCZĄTKU WARTOŚCI = dana niepotwierdzona.
 * Renderuje się z podkreśleniem i dopiskiem "do potwierdzenia".
 *
 * ŹRÓDŁO DANYCH: karta katalogowa producenta "Obwodowa Hydrauliczna Piła
 * do rur HPO600 / HPO1200", Fijalo-Poland. Wszystkie liczby poniżej pochodzą
 * z tej karty, chyba że oznaczono inaczej.
 */

export const site = {
  meta: {
    brand: 'HYDRACUT',
    model: 'HydraCut HPO',
    domain: 'hydracut.pl',
    url: 'https://hydracut.pl',
    lang: 'pl-PL',
    title: 'HydraCut HPO. Obwodowa piła hydrauliczna do cięcia rur',
    description:
      'Piła obwodowa HydraCut tnie rury po obwodzie w wykopie. Zakres 203 do 1206 mm, potrzeba 35 cm luzu wokół rury, żeliwo fi 800 w 14 minut. Dwa modele, HPO600 i HPO1200.',
    maker: 'Wojciech Łuszczyński, GTM Architect, wojciech.io',
  },

  contact: {
    // NIP i REGON potwierdzone stopką karty katalogowej HPO.
    // Adres za fijalo.pl, zgodnie z ustaleniem. Karta HPO podaje Biskupnicę,
    // czyli najpewniej zakład, a nie adres do korespondencji.
    company: 'Fijalo-Poland Cyprian Fijało',
    brandLine: 'Producent maszyn dla budownictwa podziemnego',
    phone: '+48 534 979 628',
    phoneHref: '+48534979628',
    email: 'biuro@fijalo.pl',
    street: 'ul. Jana Kochanowskiego 130',
    city: '80-405 Gdańsk',
    nip: '843-150-44-13',
    regon: '221964971',
    hours: 'Poniedziałek do piątku, 9:00–18:00',
    reply: 'Odpowiadamy w ciągu jednego dnia roboczego.',
  },

  nav: [
    { label: 'Piła', href: '/#pila' },
    { label: 'Modele', href: '/modele/' },
    { label: 'Zastosowania', href: '/zastosowania/' },
    { label: 'Jak to działa', href: '/jak-to-dziala/' },
    { label: 'Dane techniczne', href: '/dane-techniczne/' },
    { label: 'FAQ', href: '/faq/' },
    { label: 'Kontakt', href: '/kontakt/' },
  ],

  hero: {
    eyebrow: 'Obwodowa piła hydrauliczna do rur',
    h1: 'Przetnij rurę tam,\ngdzie leży.',
    lead: 'HydraCut obejmuje rurę łańcuchem i prowadzi tarczę po obwodzie, bez wyciągania rury na powierzchnię. Potrzebuje 35 cm wolnego miejsca dookoła, pracuje zalewana wodą i tnie żeliwo fi 800 w 14 minut.',
    ctaPrimary: { label: 'Zapytaj o cenę', href: '/kontakt/' },
    ctaSecondary: { label: 'Porównaj modele', href: '/modele/' },
  },

  stats: [
    { value: '203–1206', unit: 'mm', label: 'Zakres średnic rur' },
    { value: '35', unit: 'cm', label: 'Wolnego miejsca wokół rury' },
    { value: '14', unit: 'min', label: 'Żeliwo fi 800' },
    { value: '138', unit: 'bar', label: 'Ciśnienie robocze' },
    { value: '13–14', unit: 'kg', label: 'Masa piły' },
  ],

  pains: {
    eyebrow: 'Problem i korzyść',
    h2: 'Dlaczego cięcie rury w wykopie jest trudne?',
    lead: 'Bo rura leży w ziemi, wykop jest ciasny, a woda z niej nie przestaje lecieć. Narzędzie musi sobie z tym poradzić na miejscu, a nie w warsztacie.',
    rows: [
      {
        pain: 'Szlifierka wymaga obejścia rury dookoła i miejsca na ramię operatora',
        gain: 'Piła obejmuje rurę łańcuchem. Wystarczy 35 cm wolnego miejsca wokół niej.',
      },
      {
        pain: 'Cięcie ręczne schodzi z linii i kończy się spiralą zamiast obwodu',
        gain: 'Łańcuch prowadzący trzyma tarczę w jednej płaszczyźnie, więc linia cięcia się schodzi.',
      },
      {
        pain: 'Woda z przeciętej rury zalewa stanowisko i wyłącza sprzęt',
        gain: 'Napęd hydrauliczny pracuje dalej, nawet gdy piła jest zalewana.',
      },
      {
        pain: 'Iskry i odpryski w ciasnym wykopie to realne ryzyko dla operatora',
        gain: 'Regulowana osłona tarczy zasłania strefę cięcia na całym obwodzie.',
      },
      {
        pain: 'Wyciąganie rury na powierzchnię to koparka, czas i rozkopany pas',
        gain: 'Rurę tniesz tam, gdzie leży. Wykop zostaje taki, jaki był.',
      },
    ],
  },

  why: {
    eyebrow: 'Porównanie metod',
    h2: 'Palnik, szlifierka czy piła obwodowa?',
    body: [
      'Palnik nadaje się tylko do metalu i zostawia strefę wpływu ciepła, a w wykopie z gazem albo resztkami medium bywa wykluczony. Szlifierka kątowa tnie wszystko, ale wymaga obejścia rury dookoła i utrzymania płaszczyzny ręką.',
      'Piła obwodowa rozwiązuje jedno i drugie: mocuje się na rurze, prowadzi tarczę po łańcuchu i wraca dokładnie w punkt startu. Operator nie utrzymuje linii, tylko posuw.',
    ],
    rows: [
      {
        method: 'Palnik tlenowy',
        marks: ['tylko metal', 'strefa wpływu ciepła', 'ryzyko w wykopie z medium'],
        highlight: false,
      },
      {
        method: 'Szlifierka kątowa',
        marks: ['potrzeba obejść rurę', 'linia schodzi w spiralę', 'operator w strefie iskier'],
        highlight: false,
      },
      {
        method: 'HydraCut HPO',
        marks: ['35 cm luzu wystarczy', 'cięcie schodzi się w punkt', 'osłona na całym obwodzie'],
        highlight: true,
      },
    ],
  },

  how: {
    eyebrow: 'Jak to działa',
    h2: 'Cztery kroki w wykopie',
    steps: [
      {
        title: 'Założenie łańcucha',
        body: 'Łańcuch prowadzący stały obejmuje rurę i wyznacza płaszczyznę cięcia. To on, a nie ręka operatora, decyduje o tym, gdzie pójdzie tarcza.',
      },
      {
        title: 'Zamocowanie piły',
        body: 'Piła siada na łańcuchu i zaciska się na rurze. Potrzebuje 35 cm wolnego miejsca dookoła, więc mieści się w ciasnym wykopie.',
      },
      {
        title: 'Podłączenie hydrauliki',
        body: 'Zasilanie z agregatu hydraulicznego lub innego nośnika: przepływ 20 do 30 l/min, ciśnienie około 140 bar, źródło trzyliniowe.',
      },
      {
        title: 'Cięcie po obwodzie',
        body: 'Łańcuch ruchomy przesuwa piłę wokół rury. Cięcie schodzi się w punkcie startu, bez efektu spirali i mijania się linii.',
      },
    ],
    video: {
      youtubeId: '',
      file: '/foto/h-loop.mp4',
      poster: '/foto/h-loop.webp',
      caption: 'Piła na rurze, materiał producenta. Film promocyjny zastąpi go po nagraniu.',
      title: 'HydraCut HPO w pracy: cięcie rury po obwodzie',
    },
  },

  /** Tabela porównawcza dwóch modeli. Serce tej strony. */
  models: {
    eyebrow: 'Dwa modele',
    h2: 'HPO600 czy HPO1200?',
    lead: 'Różnica sprowadza się do zakresu średnic i tarczy. Reszta parametrów jest wspólna, więc wybór zależy wyłącznie od tego, jakie rury tniesz.',
    items: [
      {
        name: 'HPO600',
        range: '203–603 mm',
        blade: 'tarcza 200 mm',
        weight: '13 kg',
        note: 'Przyłącza, sieci rozdzielcze i rury średnich średnic.',
      },
      {
        name: 'HPO1200',
        range: '355–1206 mm',
        blade: 'tarcza 230 mm',
        weight: '14 kg',
        note: 'Kolektory, magistrale i rury wielkich średnic.',
      },
    ],
    rows: [
      { k: 'Zakres cięcia', a: '203–603 mm', b: '355–1206 mm' },
      { k: 'Średnica tarczy', a: '200 mm', b: '230 mm' },
      { k: 'Mocowanie tarczy', a: '22,2 mm', b: '22,2 / 25,4 mm' },
      { k: 'Masa', a: '13 kg', b: '14 kg' },
      { k: 'Przepływ oleju', a: '20–26 l/min', b: '20–26 l/min' },
      { k: 'Ciśnienie robocze', a: '138 bar', b: '138 bar' },
      { k: 'Obroty maksymalne tarczy', a: '2000 1/min', b: '2000 1/min' },
      { k: 'Moc akustyczna LWA', a: '93,4 ±1,5 dBA', b: '93,4 ±1,5 dBA' },
      { k: 'Moc akustyczna LPA', a: '98,5 ±2,3 dBA', b: '98,5 ±2,3 dBA' },
    ],
    overlap:
      'Zakresy nakładają się od 355 do 603 mm. W tym przedziale pracują oba modele, więc jeżeli tniesz głównie w tych średnicach, decyduje reszta parku maszynowego.',
  },

  people: {
    eyebrow: 'Ludzie i maszyna',
    h2: 'Kto tym pracuje?',
    body: 'Piła jedzie do wykopu z ekipą sieciową, nie z serwisem producenta. Waży 13 albo 14 kilogramów, więc schodzi na dół w rękach. Zasilanie bierze z agregatu, który brygada zwykle i tak ma na budowie.',
    quote: {
      text: '?Miejsce na opinię użytkownika. Jedno lub dwa zdania o tym, ile trwało cięcie i co się zmieniło na budowie.',
      author: '?Imię i nazwisko',
      role: '?Firma, stanowisko',
    },
    facts: [
      { k: 'Masa piły', v: '13 kg (HPO600), 14 kg (HPO1200)' },
      { k: 'Zasilanie', v: 'agregat hydrauliczny, źródło trzyliniowe' },
      { k: 'Kontakt serwisowy', v: 'ten sam numer co do sprzedaży' },
    ],
  },

  uses: {
    eyebrow: 'Zastosowania',
    h2: 'Gdzie pracuje?',
    items: [
      {
        title: 'Wymiana odcinka rurociągu',
        icon: 'rura',
        body: 'Wycięcie uszkodzonego fragmentu bez wyciągania całej rury z wykopu.',
      },
      {
        title: 'Wcinki i przyłącza',
        icon: 'wcinka',
        body: 'Otwarcie czynnej magistrali pod nowe przyłącze albo armaturę.',
      },
      {
        title: 'Awarie sieci wodociągowych',
        icon: 'awaria',
        body: 'Cięcie możliwe także wtedy, gdy z rury nadal leci woda i zalewa stanowisko.',
      },
      {
        title: 'Kanalizacja i kolektory',
        icon: 'kolektor',
        body: 'Rury wielkich średnic, do 1206 mm, w ciasnych wykopach i komorach.',
      },
      {
        title: 'Rozbiórki i demontaże',
        icon: 'demontaz',
        body: 'Podział rur na odcinki możliwe do wyciągnięcia i wywiezienia.',
      },
      {
        title: 'Ciepłownictwo i gaz',
        icon: 'cieplo',
        body: 'Cięcie stali i żeliwa bez otwartego ognia, więc bez strefy wpływu ciepła.',
      },
    ],
  },

  equipment: {
    eyebrow: 'Wyposażenie',
    h2: 'Co jest w zestawie?',
    items: [
      { title: 'Łańcuch prowadzący stały', body: 'Wyznacza płaszczyznę cięcia i trzyma ją przez cały obwód.' },
      { title: 'Łańcuch ruchomy', body: 'Przesuwa piłę wokół rury podczas cięcia.' },
      { title: 'Regulowana osłona tarczy', body: 'Zasłania strefę iskier i odprysków, ustawiana pod średnicę rury.' },
      { title: 'Tarcza diamentowa', body: '200 mm w HPO600, 230 mm w HPO1200. Żeliwo, stal, PVC, PE.' },
      { title: 'Skrzynia transportowa', body: 'Piła, łańcuchy i przewody w jednym opakowaniu.' },
      { title: 'Przewody hydrauliczne', body: 'Do podłączenia do agregatu w układzie trzyliniowym.' },
    ],
  },

  specs: {
    eyebrow: 'Dane techniczne',
    h2: 'Parametry',
    caption: 'Dane techniczne HydraCut HPO600 i HPO1200',
    rows: [
      { k: 'Zakres cięcia, HPO600', v: '203–603 mm' },
      { k: 'Zakres cięcia, HPO1200', v: '355–1206 mm' },
      { k: 'Masa', v: '13 kg / 14 kg' },
      { k: 'Średnica tarczy', v: '200 mm / 230 mm' },
      { k: 'Obroty maksymalne tarczy', v: '2000 1/min' },
      { k: 'Przepływ oleju', v: '20–26 l/min' },
      { k: 'Ciśnienie robocze', v: '138 bar' },
      { k: 'Wolne miejsce wokół rury', v: '35 cm' },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    h2: 'Najczęściej pytane',
    items: [
      {
        q: 'Jakie rury tnie HydraCut?',
        a: 'Żeliwne, stalowe, PVC i PE. Zakres średnic zależy od modelu: HPO600 tnie od 203 do 603 mm, HPO1200 od 355 do 1206 mm.',
        home: true,
      },
      {
        q: 'Ile miejsca potrzeba wokół rury?',
        a: 'Trzydzieści pięć centymetrów wolnej przestrzeni dookoła. Tyle wystarczy, żeby łańcuch objął rurę, a piła obeszła ją po obwodzie.',
        home: true,
      },
      {
        q: 'Czy piła zadziała, gdy z rury leci woda?',
        a: 'Tak. Napęd jest hydrauliczny, więc piła pracuje także wtedy, gdy jest zalewana wodą z ciętej rury. To sytuacja typowa przy awariach wodociągowych.',
        home: true,
      },
      {
        q: 'Ile trwa przecięcie rury?',
        a: 'Producent podaje 14 minut dla rury żeliwnej fi 800. Czas zależy od materiału, grubości ścianki i stanu tarczy.',
        home: true,
      },
      {
        q: 'Czego potrzeba do zasilania?',
        a: 'Agregatu hydraulicznego albo innego nośnika z instalacją o przepływie 20 do 30 l/min i ciśnieniu około 140 bar. Wymagane jest źródło trzyliniowe.',
        home: true,
      },
      {
        q: 'Czy cięcie schodzi się w jednym punkcie?',
        a: 'Tak. Łańcuch prowadzący utrzymuje tarczę w jednej płaszczyźnie, więc nie ma efektu spirali ani mijania się linii cięcia.',
        home: true,
      },
      {
        q: 'Który model wybrać, HPO600 czy HPO1200?',
        a: 'Decyduje zakres średnic. Do 603 mm wystarczy HPO600. Powyżej potrzebny jest HPO1200, który schodzi do 1206 mm. W przedziale 355 do 603 mm pracują oba.',
        home: false,
      },
      {
        q: 'Jak zabezpieczony jest operator?',
        a: 'Regulowana osłona tarczy zasłania strefę cięcia na całym obwodzie, chroniąc przed iskrzeniem i odpryskami. Poziom mocy akustycznej LWA wynosi 93,4 dBA.',
        home: false,
      },
      {
        q: 'Ile waży piła?',
        a: 'Trzynaście kilogramów w modelu HPO600 i czternaście w HPO1200. Sama piła schodzi do wykopu w rękach, agregat zostaje na górze.',
        home: false,
      },
      {
        q: 'Ile kosztuje HydraCut?',
        a: '?Cenę podajemy w odpowiedzi na zapytanie, bo zależy od modelu i konfiguracji zestawu.',
        home: false,
      },
    ],
  },

  maker: {
    eyebrow: 'Producent',
    h2: 'Kto za tym stoi?',
    body: 'Fijalo-Poland, polski producent maszyn dla budownictwa podziemnego. Ta sama firma stoi za bezpłuczkową maszyną przeciskową ALUSTEER, pokazywaną na TRAKO i ENERGETAB. Ten sam serwis i ten sam numer telefonu, pod który dzwonisz po tarcze i łańcuchy.',
    facts: [
      { k: 'Siedziba', v: 'Gdańsk, Kochanowskiego 130' },
      { k: 'Druga marka', v: 'ALUSTEER, przeciski sterowane' },
      { k: 'Produkcja', v: 'Polska' },
      { k: 'Targi', v: 'TRAKO i ENERGETAB 2025' },
      { k: 'NIP', v: '843-150-44-13' },
    ],
    links: [
      { label: 'fijalo.pl', href: 'https://fijalo.pl/' },
      { label: 'YouTube', href: 'https://www.youtube.com/@fijalopoland' },
    ],
  },

  form: {
    eyebrow: 'Kontakt',
    h2: 'Zapytaj o cenę i dostępność',
    intro: 'Napisz, jakie rury tniesz i w jakich warunkach. Odpowiemy doborem modelu i ceną.',
    endpoint: '/api/kontakt.php',
    fields: {
      name: 'Imię i nazwisko',
      company: 'Firma',
      phone: 'Telefon',
      email: 'E-mail',
      scope: 'Średnice rur',
      message: 'Wiadomość',
    },
    scopeOptions: ['do 600 mm', '600–1200 mm', 'różne średnice', 'jeszcze nie wiem'],
    consent:
      'Zgadzam się na kontakt w sprawie zapytania. Dane przetwarza Fijalo-Poland Cyprian Fijało wyłącznie w tym celu.',
    submit: 'Wyślij zapytanie',
    success: 'Zapytanie wysłane. Odezwiemy się w ciągu jednego dnia roboczego.',
    error: 'Nie udało się wysłać. Zadzwoń pod +48 534 979 628 albo napisz na biuro@fijalo.pl.',
  },

  photos: {
    hero: {
      id: 'FOTO 01', desc: 'Piła zamocowana na rurze', ratio: '16:9',
      src: '/foto/h-mount.webp',
      alt: 'Piła obwodowa HydraCut zamocowana łańcuchem na rurze w wykopie',
    },
    work: {
      id: 'FOTO 02', desc: 'Operator przy cięciu', ratio: '16:9',
      src: '/foto/h-cutting.webp',
      alt: 'Operator w kasku prowadzi piłę obwodową po rurze w wykopie',
    },
    edge: {
      id: 'FOTO 03', desc: 'Łańcuch prowadzący na rurze', ratio: '16:9',
      src: '/foto/h-chain.webp',
      alt: 'Łańcuch prowadzący założony na rurze wielkiej średnicy',
    },
    ring: {
      id: 'FOTO 04', desc: 'Przecięta rura', ratio: '16:9',
      src: '/foto/h-pipe.webp',
      alt: 'Rura wielkiej średnicy przecięta po obwodzie, załadowana na samochód',
    },
    transport: {
      id: 'FOTO 05', desc: 'Skrzynia transportowa', ratio: '4:3',
      src: '/foto/h-case.webp',
      alt: 'Piła, łańcuchy i przewody hydrauliczne w skrzyni transportowej',
    },
    detail: {
      id: 'FOTO 06', desc: 'Piła z bliska', ratio: '4:3',
      src: '/foto/h-saw.webp',
      alt: 'Zbliżenie na korpus piły hydraulicznej zamocowanej na rurze',
    },
    crew: {
      id: 'FOTO 07', desc: 'Ekipa w wykopie', ratio: '16:9',
      src: '/foto/h-trench.webp',
      alt: 'Ekipa pracująca w głębokim wykopie przy dwóch rurach magistralnych',
    },
    handover: {
      id: 'FOTO 08', desc: 'Montaż łańcucha', ratio: '16:9',
      src: '/foto/h-hands.webp',
      alt: 'Pracownik zakłada łańcuch prowadzący na rurę w wykopie',
    },
    site: {
      id: 'FOTO 09', desc: 'Stanowisko z agregatem', ratio: '16:9',
      src: '/foto/h-power.webp',
      alt: 'Piła hydrauliczna i agregat na stanowisku obok wykopu',
    },
  },

  media: {
    pain: { src: '/foto/h-crew.webp', alt: 'Ekipa w wykopie przy rurach magistralnych' },
    dusk: { src: '/foto/h-cutting.webp', alt: 'Operator prowadzi piłę po obwodzie rury' },
    footer: { src: '/foto/h-trench.webp', alt: 'Głęboki wykop z rurami i ekipą' },
    trench: { src: '/foto/h-power.webp', alt: 'Stanowisko z agregatem hydraulicznym' },
    yard: { src: '/foto/h-pipe.webp', alt: 'Przecięta rura wielkiej średnicy' },
    street: { src: '/foto/h-mount.webp', alt: 'Piła zamocowana na rurze łańcuchem' },
    lowangle: { src: '/foto/h-saw.webp', alt: 'Piła hydrauliczna z bliska' },
    machine: { src: '/foto/h-chain.webp', alt: 'Łańcuch prowadzący na rurze' },
    loop: { video: '/foto/h-loop.mp4', poster: '/foto/h-loop.webp' },
  },

  downloads: [
    { title: 'Karta katalogowa HPO600 i HPO1200', file: '/do-pobrania/hydracut-hpo.pdf', format: 'PDF' },
    { title: 'Rysunek wymiarowy HPO1200', file: '?do dostarczenia', format: 'PDF' },
    { title: 'Instrukcja obsługi', file: '?do dostarczenia', format: 'PDF' },
  ],

  pages: {
    specs: {
      title: 'Dane techniczne HydraCut HPO600 i HPO1200',
      description:
        'Pełna specyfikacja pił obwodowych HydraCut: zakres cięcia 203 do 1206 mm, ciśnienie 138 bar, przepływ 20 do 26 l/min, tarcze 200 i 230 mm.',
      h1: 'Dane techniczne\nHydraCut HPO',
      lead: 'Parametry obu modeli według karty katalogowej producenta.',
      blocks: [
        {
          h2: 'Cięcie',
          rows: [
            { k: 'Zakres cięcia, HPO600', v: '203–603 mm' },
            { k: 'Zakres cięcia, HPO1200', v: '355–1206 mm' },
            { k: 'Średnica tarczy, HPO600', v: '200 mm' },
            { k: 'Średnica tarczy, HPO1200', v: '230 mm' },
            { k: 'Mocowanie tarczy, HPO600', v: '22,2 mm' },
            { k: 'Mocowanie tarczy, HPO1200', v: '22,2 / 25,4 mm' },
            { k: 'Obroty maksymalne tarczy', v: '2000 1/min' },
            { k: 'Cięte materiały', v: 'żeliwo, stal, PVC, PE' },
          ],
        },
        {
          h2: 'Zasilanie hydrauliczne',
          rows: [
            { k: 'Przepływ oleju', v: '20–26 l/min' },
            { k: 'Ciśnienie robocze', v: '138 bar' },
            { k: 'Zalecane parametry źródła', v: '20–30 l/min, około 140 bar' },
            { k: 'Rodzaj źródła', v: 'trzyliniowe' },
          ],
        },
        {
          h2: 'Praca i bezpieczeństwo',
          rows: [
            { k: 'Wolne miejsce wokół rury', v: '35 cm' },
            { k: 'Praca przy zalaniu wodą', v: 'możliwa' },
            { k: 'Osłona tarczy', v: 'regulowana, na całym obwodzie' },
            { k: 'Moc akustyczna LWA', v: '93,4 ±1,5 dBA' },
            { k: 'Moc akustyczna LPA', v: '98,5 ±2,3 dBA' },
          ],
        },
        {
          h2: 'Masa i transport',
          rows: [
            { k: 'Masa, HPO600', v: '13 kg' },
            { k: 'Masa, HPO1200', v: '14 kg' },
            { k: 'Transport', v: 'skrzynia z łańcuchami i przewodami' },
          ],
        },
      ],
    },
    uses: {
      title: 'Zastosowania piły obwodowej do rur',
      description:
        'Gdzie pracuje HydraCut: wymiana odcinków rurociągu, wcinki, awarie wodociągowe, kolektory kanalizacyjne, rozbiórki, ciepłownictwo i gaz.',
      h1: 'Zastosowania',
      lead: 'Wszędzie tam, gdzie rurę trzeba przeciąć na miejscu, w wykopie, bez wyciągania jej na powierzchnię.',
      details: [
        {
          title: 'Wymiana odcinka rurociągu',
          body: 'Uszkodzony fragment wycina się dwoma cięciami po obwodzie i wyjmuje. Reszta rurociągu zostaje nietknięta, a wykop nie musi być dłuższy niż wymieniany odcinek.',
        },
        {
          title: 'Wcinki i przyłącza',
          body: 'Otwarcie czynnej magistrali pod nowe przyłącze albo armaturę. Cięcie po obwodzie daje równą, prostopadłą krawędź pod kołnierz albo złączkę.',
        },
        {
          title: 'Awarie sieci wodociągowych',
          body: 'Przy awarii woda zwykle nie przestaje lecieć, dopóki odcinek nie zostanie odcięty. Napęd hydrauliczny pracuje także wtedy, gdy piła jest zalewana.',
        },
        {
          title: 'Kanalizacja i kolektory',
          body: 'Model HPO1200 schodzi do 1206 mm, więc obejmuje rury kolektorowe. Wystarczy 35 cm wolnego miejsca wokół rury, co ma znaczenie w komorach i ciasnych wykopach.',
        },
        {
          title: 'Rozbiórki i demontaże',
          body: 'Podział długiej rury na odcinki, które da się wyciągnąć koparką i wywieźć. Bez otwartego ognia, więc bez ograniczeń przy resztkach medium.',
        },
        {
          title: 'Ciepłownictwo i gaz',
          body: 'Cięcie mechaniczne zamiast palnika eliminuje strefę wpływu ciepła i otwarty ogień w wykopie.',
        },
      ],
    },
    how: {
      title: 'Jak działa obwodowa piła hydrauliczna HydraCut',
      description:
        'Łańcuch prowadzący, łańcuch ruchomy i napęd hydrauliczny. Cztery kroki cięcia rury po obwodzie w wykopie, krok po kroku.',
      h1: 'Jak to działa',
      lead: 'Piła bazuje na łańcuchu założonym na rurze, a nie na ręce operatora. To jedyny powód, dla którego cięcie schodzi się w punkcie startu.',
      safety: {
        h2: 'Zanim ruszysz',
        items: [
          'Sprawdź, czy wokół rury jest 35 cm wolnego miejsca na całym obwodzie.',
          'Ustaw regulowaną osłonę tarczy pod średnicę ciętej rury.',
          'Podłącz zasilanie trzyliniowe: 20 do 30 l/min, około 140 bar.',
          'Prowadź posuw równomiernie. Dociskanie tarczy nie przyspiesza cięcia.',
          'Przy cięciu żeliwa i stali licz się z poziomem LWA 93,4 dBA. Ochronniki obowiązkowo.',
        ],
      },
    },
    faq: {
      title: 'FAQ: obwodowa piła hydrauliczna do rur',
      description:
        'Odpowiedzi na pytania o HydraCut: zakres średnic, wymagane miejsce, praca przy zalaniu, czas cięcia, zasilanie i wybór modelu.',
      h1: 'Pytania i odpowiedzi',
      lead: 'Zebrane pytania z rozmów o cięciu rur w wykopie.',
    },
    models: {
      title: 'HPO600 czy HPO1200: porównanie modeli HydraCut',
      description:
        'Tabela porównawcza pił obwodowych HydraCut HPO600 i HPO1200: zakres cięcia, tarcza, masa, parametry hydrauliki i hałas.',
      h1: 'HPO600 czy HPO1200?',
      lead: 'Oba modele dzielą hydraulikę, obroty i osłonę. Różnią się zakresem średnic i tarczą, więc wybór zależy od tego, jakie rury tniesz.',
    },
    contact: {
      title: 'Kontakt i zapytanie ofertowe',
      description: 'Zapytaj o cenę i dostępność pił obwodowych HydraCut HPO600 i HPO1200.',
      h1: 'Kontakt',
      lead: 'Napisz, jakie rury tniesz i w jakich warunkach. Dobierzemy model i podamy cenę.',
    },
    downloads: {
      title: 'Do pobrania: karty i dokumentacja',
      description: 'Karta katalogowa i dokumentacja techniczna pił obwodowych HydraCut HPO600 i HPO1200.',
      h1: 'Do pobrania',
      lead: 'Dokumenty producenta w formacie PDF.',
    },
    notFound: {
      title: 'Nie znaleziono strony',
      description: 'Ten adres nie istnieje na hydracut.pl.',
      h1: 'Nie ma tu nic\ndo przecięcia',
      lead: 'Ten adres nie istnieje. Wróć na stronę główną albo zajrzyj do danych technicznych.',
    },
    thanks: {
      title: 'Zapytanie wysłane',
      description: 'Potwierdzenie wysłania zapytania o piłę obwodową HydraCut.',
      h1: 'Zapytanie\nwysłane',
      lead: 'Odezwiemy się w ciągu jednego dnia roboczego. Jeżeli sprawa jest pilna, zadzwoń.',
    },
    privacy: {
      title: 'Polityka prywatności',
      description: 'Zasady przetwarzania danych z formularza kontaktowego na hydracut.pl.',
      h1: 'Polityka prywatności',
    },
  },
} as const;
