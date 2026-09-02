# Jak pracować przy HydraCut

Krótko o tym, gdzie kończy się kod, a zaczyna treść, i jak wypuścić zmianę.

## Najważniejsza zasada

**Teksty i zdjęcia żyją w panelu, nie w kodzie.** Strona buduje się statycznie,
ale przy każdym budowaniu zaciąga treść z Sanity. Jeśli poprawisz zdanie
bezpośrednio w komponencie, przy najbliższej publikacji wróci ono do wersji
z panelu i będziesz się zastanawiać, kto to cofnął.

Wyjątek to `src/data/site.static.ts`, czyli kopia zapasowa treści. Ona wchodzi
tylko wtedy, gdy Sanity jest nieosiągalne, żeby budowanie nie padło przez chwilową
awarię sieci. Nie edytuj jej po to, żeby zmienić stronę.

| Chcesz zmienić | Miejsce |
|---|---|
| tekst, zdjęcie, opis produktu, artykuł | panel Sanity |
| układ, kolory, komponenty, nowa podstrona | kod w tym repo |
| co w ogóle da się edytować w panelu | schemat w repo panelu |

## Uruchomienie u siebie

Potrzebujesz Node 22 lub nowszego.

```bash
npm ci
npm run dev     # podglad pod http://localhost:4321
npm run build   # to samo, co robi CI; wynik ląduje w dist/
```

Treść zaciąga się z Sanity także lokalnie, więc podgląd pokazuje to, co jest
w panelu w tej chwili.

## Jak wypuścić zmianę

Repozytorium jest publiczne, ale prawo zapisu zostaje po stronie prowadzącego
projekt. Pracujesz przez fork i pull requesta:

1. Forkujesz repo na swoje konto.
2. Robisz zmianę na gałęzi w swoim forku.
3. Otwierasz pull requesta do `main`.
4. GitHub sam zbuduje Twoją zmianę i pokaże, czy się składa.
5. Po scaleniu strona wdraża się sama, zwykle w kilkadziesiąt sekund.

Sprawdzenie przy pull requeście **niczego nie wdraża** i nie ma dostępu do
sekretów. Buduje projekt i pilnuje, żeby w wyniku był `index.html`, `.htaccess`
i co najmniej 40 plików.

## Co się dzieje po scaleniu

```
merge do main
  -> GitHub Actions buduje strone
  -> wynik ląduje na galezi live
  -> CI puka do odbiornika na serwerze
  -> serwer pobiera paczke i podmienia public_html
```

To samo uruchamia publikacja treści w panelu, z tą różnicą, że sygnał idzie
z Sanity. Dlatego zmiana tekstu w panelu nie wymaga niczyjej pomocy.

Odbiornik **odmówi podmiany**, jeśli paczka nie ma `index.html`, `.htaccess`
albo ma mniej niż 40 plików. W takiej sytuacji strona zostaje na poprzedniej
wersji, zamiast pokazać się w połowie.

## Czego lepiej nie ruszać bez uzgodnienia

- `.github/workflows/deploy.yml`, bo to on wypuszcza stronę na produkcję
- `serwer/_wdrozenie.php`, czyli odbiornik po stronie serwera
- `public/.htaccess`, w szczególności przekierowania i reguły blokujące
- `public/api/kontakt.php`, obsługa formularza

## Gdzie co żyje

| | |
|---|---|
| domena | hydracut.pl |
| hosting | Hostinger, katalog `public_html` |
| panel treści | Sanity, dataset `hydracut` |
| budowanie i wdrożenie | GitHub Actions w tym repo |
