# Wdrożenie na Hostingerze

Strona jest statyczna. Na serwer trafia zawartość katalogu `dist/`, nic więcej.

## 1. Build

```bash
npm install
npm run build
```

W `dist/` powstaje komplet plików: HTML każdej podstrony, `_astro/` z CSS i fontami,
`sitemap-index.xml`, `robots.txt`, `llms.txt`, `.htaccess` oraz `api/kontakt.php`.

## 2. Wgranie plików

W hPanelu: **Pliki → Menedżer plików** albo FTP/SFTP.

1. Wejdź do katalogu domeny `hydracut.pl`, zwykle `public_html`.
2. Skasuj domyślny `default.php` albo `index.html` Hostingera.
3. Wgraj **zawartość** `dist/` (nie sam katalog) do `public_html`.
4. Upewnij się, że `.htaccess` też się wgrał. Menedżer plików domyślnie ukrywa pliki
   zaczynające się od kropki, trzeba włączyć pokazywanie ukrytych.

Po wgraniu `https://hydracut.pl/` powinno działać od razu, razem z `/dane-techniczne/`
i pozostałymi podstronami.

## 3. Skrzynka i formularz

Formularz wysyła zapytania przez `mail()` z PHP, bez zewnętrznych usług.

1. hPanel → **E-maile → Konta e-mail** → utwórz `formularz@hydracut.pl`.
   Nadawca musi być na tej domenie, inaczej SPF odrzuci wiadomość i zapytania
   wylądują w spamie.
2. Sprawdź górę pliku `public/api/kontakt.php`:
   - `$TO` — adres, na który mają iść zapytania (domyślnie `biuro@fijalo.pl`),
   - `$FROM` — `formularz@hydracut.pl`.
3. Test: wypełnij formularz na `/kontakt/` i sprawdź skrzynkę odbiorczą oraz spam.

Jeśli hosting ma wyłączone `mail()`, alternatywą jest SMTP przez PHPMailer albo
zewnętrzny endpoint. Wtedy zmienia się tylko ten jeden plik.

## 4. DNS i certyfikat

- Rekordy A domeny `hydracut.pl` mają wskazywać na serwer Hostingera. Jeżeli domena
  jest kupiona i utrzymywana w tym samym koncie, dzieje się to automatycznie.
- hPanel → **SSL** → wystaw darmowy certyfikat Let's Encrypt i włącz wymuszanie HTTPS.
  `.htaccess` i tak przekierowuje na HTTPS oraz z `www` na domenę bez `www`.

## 5. Po wdrożeniu

- [ ] Google Search Console: dodaj własność `https://hydracut.pl`, prześlij `sitemap-index.xml`.
- [ ] Sprawdź `https://hydracut.pl/robots.txt` i `https://hydracut.pl/llms.txt`.
- [ ] Sprawdź podgląd linku w Messengerze albo LinkedIn (obrazek `og/hydracut.png`).
- [ ] Wyślij testowe zapytanie z formularza.
- [ ] Sprawdź stronę na telefonie, w trybie jasnym i ciemnym.

## 6. Aktualizacja

Każda zmiana treści to: edycja `src/data/site.ts` → `npm run build` → wgranie `dist/`.
Można to zautomatyzować GitHub Actions z deployem po FTP, jeśli strona trafi do repozytorium.
