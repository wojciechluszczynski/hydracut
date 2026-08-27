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
