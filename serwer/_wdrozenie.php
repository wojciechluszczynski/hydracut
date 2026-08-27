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
const CHRONIONE = ['_wdrozenie.php', '_wdrozenie-klucz.php', '.wdrozenie-tmp', '.wdrozenie.lock'];
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

// ---- autoryzacja ----
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    koniec(405, 'error', 'Nieobslugiwana metoda.');
}
$plikKlucza = $root . '/_wdrozenie-klucz.php';
if (!is_readable($plikKlucza)) {
    koniec(500, 'error', 'Brak pliku z kluczem.');
}
$klucz = (string) (require $plikKlucza);
$podany = $_SERVER['HTTP_X_WDROZENIE_KLUCZ'] ?? '';
if ($klucz === '' || !is_string($podany) || !hash_equals($klucz, $podany)) {
    koniec(403, 'error', 'Brak uprawnien.');
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
flock($lock, LOCK_UN);
fclose($lock);

koniec(200, 'ok', 'Strona zaktualizowana.', [
    'wgrane'   => $wgrane,
    'usuniete' => count($doUsuniecia),
]);
