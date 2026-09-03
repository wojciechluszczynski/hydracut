# Odbiornik wdrożeń

Hostinger nie zaciąga gałęzi `live` sam, a wdrożenie przez FTP nie dociera do
katalogu strony, bo węzeł FTP jest inny niż ten serwujący domenę. Zamiast tego
serwer sam pobiera gotową paczkę.

    publikacja w Sanity
      -> webhook GROQ
      -> repository_dispatch: sanity-publish
      -> GitHub Actions: build + push na galaz live
      -> curl do _wdrozenie.php
      -> serwer pobiera zip galezi live z codeload i podmienia public_html

Repozytorium jest publiczne, więc **na serwerze nie ma żadnego tokenu**. Jedyny
sekret to klucz chroniący endpoint.

## Co gdzie leży

| Plik | Miejsce | Uwagi |
|---|---|---|
| `_wdrozenie.php` | `public_html/`, wgrany ręcznie raz | wersjonowany tutaj |
| `_wdrozenie-klucz.php` | `public_html/`, wgrany ręcznie raz | **nie trafia do repo** |
| `WDROZENIE_KLUCZ` | sekret repozytorium | ta sama wartość co w pliku wyżej |
| `WDROZENIE_URL` | sekret repozytorium | `https://<domena>/_wdrozenie.php` |

Oba pliki są na liście chronionych nazw w skrypcie, więc wdrożenie ich nie
kasuje. Regułę blokującą dostęp do pliku z kluczem niesie `public/.htaccess`,
dzięki czemu jedzie razem z każdym buildem.

## Bezpieczniki

Skrypt odrzuca paczkę i **nie rusza strony**, jeśli brakuje w niej `index.html`,
`.htaccess` albo ma mniej niż 40 plików. Równoległe wdrożenia blokuje `flock`.

## Cron u Hostingera nie działa, nie próbuj ponownie

Skrypt umie chodzić z crona: uruchomiony z linii poleceń pomija klucz, pyta
GitHuba o sha gałęzi `live` i kończy bez pobierania paczki, gdy nic się nie
zmieniło. Ma to sens tylko wtedy, gdy cron faktycznie startuje.

**Na obecnym planie nie startuje.** Sprawdzone 2026-09-02 testem kontrolowanym:
w `.wdrozenie-stan.json` wpisany fałszywy sha, więc każdy przebieg musiałby
przebudować stronę. Przez cztery godziny, osiem slotów `0,30 * * * *`, plik
został nietknięty. Zadanie widniało na liście z poprawnym poleceniem. Panel
przyjmuje wpis i go nie wykonuje.

Wpisy zostały usunięte, bo zadanie, które nie działa, jest gorsze niż jego brak:
tworzy złudzenie zabezpieczenia.

**I tak nie jest potrzebny.** Wdrożenie z CI dochodzi, nawet gdy `curl` zgłasza
timeout. Zmierzone: gałąź `live` o 15:03:56, plik na serwerze o 15:04:00, przy
kroku, który raportował brak połączenia. Ginie odpowiedź, nie żądanie.

Ręczne uruchomienie zostaje dostępne, jeśli kiedyś będzie potrzebne:

```bash
php /home/<uzytkownik>/public_html/_wdrozenie.php            # wdroz gdy sha sie zmienil
php /home/<uzytkownik>/public_html/_wdrozenie.php --wymus    # wdroz mimo wszystko
```
