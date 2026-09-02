<?php
/**
 * Odbiornik wdrożeń.
 *
 * Hostinger nie zaciąga gałęzi `live` sam, a wdrożenie przez FTP nie dociera do
 * katalogu strony, bo węzeł FTP jest inny niż węzeł serwujący domenę. Dlatego
 * po zbudowaniu strony GitHub Actions puka tutaj, a serwer sam pobiera gotową
 * paczkę z GitHuba i podmienia zawartość katalogu publicznego.
 *
 * Repozytorium jest publiczne, więc na serwerze nie ma żadnego tokenu. Jedyny
 * sekret to klucz w `_wdrozenie-klucz.php`, który chroni ten endpoint.
 *
 * Plik trzeba wgrać ręcznie raz. Wdrożenie go nie kasuje, bo siedzi na liście
 * chronionych nazw.
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const REPO      = 'wojciechluszczynski/hydracut';
const GALAZ     = 'live';
const CHRONIONE = ['_wdrozenie.php', '_wdrozenie-klucz.php', '.wdrozenie-tmp', '.wdrozenie.lock', '.wdrozenie-proby.json', '.wdrozenie-stan.json'];
const PROBY_LIMIT = 10;      // nieudanych prob na adres
const PROBY_OKNO  = 3600;    // w tylu sekundach
const MIN_PLIKOW = 40;

$root = __DIR__;

function koniec(int $kod, string $status, string $tekst, array $extra = []): never {
    http_response_code($kod);
    echo json_encode(['status' => $status, 'message' => $tekst] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Usuwa katalog razem z zawartością. */
function skasuj(string $sciezka): void {
    if (is_link($sciezka) || is_file($sciezka)) { @unlink($sciezka); return; }
    if (!is_dir($sciezka)) return;
    foreach (scandir($sciezka) ?: [] as $p) {
        if ($p === '.' || $p === '..') continue;
        skasuj("$sciezka/$p");
    }
    @rmdir($sciezka);
}

/** Zwraca ścieżki względne wszystkich plików w katalogu. */
function spis(string $baza, string $pod = ''): array {
    $kat = $pod === '' ? $baza : "$baza/$pod";
    $out = [];
    foreach (scandir($kat) ?: [] as $p) {
        if ($p === '.' || $p === '..') continue;
        $wzgl = $pod === '' ? $p : "$pod/$p";
        if (in_array(explode('/', $wzgl)[0], CHRONIONE, true)) continue;
        if (is_dir("$kat/$p")) {
            $out = array_merge($out, spis($baza, $wzgl));
        } else {
            $out[] = $wzgl;
        }
    }
    return $out;
}

// Wywolanie z crona na serwerze. Kto ma dostep do crona, ma i tak dostep do
// plikow, wiec nie ma czego dodatkowo pilnowac. Ta droga omija blokade ruchu
// przychodzacego, przez ktora wywolanie z GitHuba potrafi sie nie dodzwonic.
$zCrona = PHP_SAPI === 'cli';
$wymuszone = $zCrona
    ? in_array('--wymus', $argv ?? [], true)
    : isset($_GET['wymus']);

// ---- autoryzacja ----
if (!$zCrona && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    koniec(405, 'error', 'Nieobslugiwana metoda.');
}
$plikKlucza = $root . '/_wdrozenie-klucz.php';
if ($zCrona) { goto poAutoryzacji; }
if (!is_readable($plikKlucza)) {
    koniec(500, 'error', 'Brak pliku z kluczem.');
}
$klucz = (string) (require $plikKlucza);
$podany = $_SERVER['HTTP_X_WDROZENIE_KLUCZ'] ?? '';

// Zgadywanie klucza jest nierealne, ale nie ma powodu pozwalac na dowolna
// liczbe prob. Liczymy nieudane strzaly z adresu i po przekroczeniu limitu
// odmawiamy, zanim w ogole porownamy klucz.
$plikProb = $root . '/.wdrozenie-proby.json';
$adres = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$teraz = time();
$proby = is_readable($plikProb) ? (json_decode((string) file_get_contents($plikProb), true) ?: []) : [];
foreach ($proby as $kto => $czasy) {
    $proby[$kto] = array_values(array_filter($czasy, fn($t) => $t > $teraz - PROBY_OKNO));
    if (!$proby[$kto]) unset($proby[$kto]);
}
$mojKlucz = hash('sha256', $adres);
$dobry = $klucz !== '' && is_string($podany) && hash_equals($klucz, $podany);

// Poprawny klucz przechodzi zawsze. Licznik nie moze zablokowac wdrozenia
// tylko dlatego, ze ktos inny zza tego samego adresu strzelal na oslep.
if ($dobry) {
    if (isset($proby[$mojKlucz])) {
        unset($proby[$mojKlucz]);
        @file_put_contents($plikProb, json_encode($proby), LOCK_EX);
    }
} else {
    $proby[$mojKlucz][] = $teraz;
    @file_put_contents($plikProb, json_encode($proby), LOCK_EX);
    if (count($proby[$mojKlucz]) > PROBY_LIMIT) {
        koniec(429, 'error', 'Za duzo nieudanych prob z tego adresu.');
    }
    koniec(403, 'error', 'Brak uprawnien.');
}

poAutoryzacji:

// ---- czy jest w ogole co wdrazac ----
// Pytamy GitHuba o sha galezi live. Jesli to samo, co ostatnio wgralismy,
// konczymy bez pobierania paczki. Dzieki temu cron moze chodzic czesto.
$plikStanu = $root . '/.wdrozenie-stan.json';
$stan = is_readable($plikStanu) ? (json_decode((string) file_get_contents($plikStanu), true) ?: []) : [];
$sha = null;
$chSha = curl_init(sprintf('https://api.github.com/repos/%s/commits/%s', REPO, GALAZ));
curl_setopt_array($chSha, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_USERAGENT      => 'wdrozenie',
    CURLOPT_HTTPHEADER     => ['Accept: application/vnd.github.sha'],
]);
$odpSha = curl_exec($chSha);
if ((int) curl_getinfo($chSha, CURLINFO_HTTP_CODE) === 200 && is_string($odpSha)) {
    $sha = trim($odpSha);
}
if ($sha !== null && !$wymuszone && ($stan['sha'] ?? null) === $sha) {
    koniec(200, 'ok', 'Bez zmian, strona jest aktualna.', ['sha' => substr($sha, 0, 7)]);
}

// ---- blokada, zeby dwa wdrozenia nie weszly sobie w droge ----
$lock = fopen($root . '/.wdrozenie.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
    koniec(409, 'error', 'Inne wdrozenie wlasnie trwa.');
}

// ---- pobranie paczki ----
$url = sprintf('https://codeload.github.com/%s/zip/refs/heads/%s', REPO, GALAZ);
$tmpZip = $root . '/.wdrozenie-paczka.zip';
$ch = curl_init($url);
$fh = fopen($tmpZip, 'w');
curl_setopt_array($ch, [
    CURLOPT_FILE           => $fh,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_FAILONERROR    => true,
]);
$ok  = curl_exec($ch);
$kod = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
fclose($fh);

if (!$ok || $kod !== 200 || filesize($tmpZip) < 100000) {
    @unlink($tmpZip);
    koniec(502, 'error', 'Nie udalo sie pobrac paczki z GitHuba.', ['http' => $kod, 'curl' => $err]);
}

// ---- rozpakowanie do katalogu roboczego ----
$stage = $root . '/.wdrozenie-tmp';
skasuj($stage);
if (!@mkdir($stage, 0755, true)) {
    @unlink($tmpZip);
    koniec(500, 'error', 'Nie moge utworzyc katalogu roboczego.');
}
$zip = new ZipArchive();
if ($zip->open($tmpZip) !== true || !$zip->extractTo($stage)) {
    $zip->close();
    @unlink($tmpZip);
    skasuj($stage);
    koniec(500, 'error', 'Nie udalo sie rozpakowac paczki.');
}
$zip->close();
@unlink($tmpZip);

// Zip z GitHuba ma jeden katalog na wierzchu, np. hornetcut-live/.
$wierzch = glob($stage . '/*', GLOB_ONLYDIR);
$zrodlo  = (count($wierzch) === 1) ? $wierzch[0] : $stage;

// ---- kontrola przed podmiana ----
$nowe = spis($zrodlo);
$bledy = [];
if (!is_file("$zrodlo/index.html"))      $bledy[] = 'brak index.html';
if (count($nowe) < MIN_PLIKOW)           $bledy[] = 'za malo plikow: ' . count($nowe);
if (!is_file("$zrodlo/.htaccess"))       $bledy[] = 'brak .htaccess';
if ($bledy) {
    skasuj($stage);
    koniec(500, 'error', 'Paczka odrzucona, strona nietknieta.', ['bledy' => $bledy]);
}

// ---- podmiana ----
$stare = spis($root);
$wgrane = 0;
foreach ($nowe as $wzgl) {
    $cel = "$root/$wzgl";
    $kat = dirname($cel);
    if (!is_dir($kat) && !@mkdir($kat, 0755, true)) {
        skasuj($stage);
        koniec(500, 'error', "Nie moge utworzyc katalogu $kat.");
    }
    if (!@copy("$zrodlo/$wzgl", $cel)) {
        skasuj($stage);
        koniec(500, 'error', "Nie moge zapisac $wzgl. Strona moze byc w polowie podmieniona.");
    }
    $wgrane++;
}

// Pliki, ktorych nowy build juz nie zawiera.
$doUsuniecia = array_diff($stare, $nowe);
foreach ($doUsuniecia as $wzgl) {
    @unlink("$root/$wzgl");
}

skasuj($stage);
if ($sha !== null) {
    @file_put_contents($plikStanu, json_encode(['sha' => $sha, 'kiedy' => date('c')]), LOCK_EX);
}
flock($lock, LOCK_UN);
fclose($lock);

koniec(200, 'ok', 'Strona zaktualizowana.', [
    'wgrane'   => $wgrane,
    'usuniete' => count($doUsuniecia),
]);
