<?php
/**
 * Contact endpoint for shared hosting (Hostinger, Apache + PHP).
 * No database, no third party service. Sends the enquiry by mail() and
 * answers JSON to fetch() or redirects browsers without JavaScript.
 *
 * SETUP: change $TO and $FROM below to the real mailboxes.
 * $FROM must be an address on this domain, otherwise SPF fails and the mail
 * lands in spam.
 */

$TO      = 'biuro@fijalo.pl';        // odbiorca zapytań
$FROM    = 'formularz@hydracut.pl'; // skrzynka do założenia w hPanelu, musi być na tej domenie
$SUBJECT = 'HydraCut: zapytanie ze strony';
$THANKS  = '/kontakt/dziekujemy/';

header('X-Content-Type-Options: nosniff');

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond($ok, $message, $wantsJson, $thanks) {
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: ' . ($ok ? $thanks : '/kontakt/?blad=1'), true, 303);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Metoda niedozwolona.', $wantsJson, $THANKS);
}

// Bots fill hidden fields and submit instantly.
if (!empty($_POST['firma_www'])) {
    respond(true, 'OK', $wantsJson, $THANKS); // silent accept
}
$stamp = isset($_POST['t']) ? (int) $_POST['t'] : 0;
if ($stamp > 0 && (round(microtime(true) * 1000) - $stamp) < 2500) {
    respond(false, 'Formularz wysłany zbyt szybko.', $wantsJson, $THANKS);
}

$clean = function ($key, $max = 500) {
    $raw = isset($_POST[$key]) ? (string) $_POST[$key] : '';
    $raw = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $raw);
    return mb_substr(trim(strip_tags($raw)), 0, $max);
};

$name    = $clean('imie', 120);
$company = $clean('firma', 160);
$phone   = $clean('telefon', 40);
$email   = $clean('email', 160);
$scope   = $clean('zakres', 60);
$message = mb_substr(trim(strip_tags((string) ($_POST['wiadomosc'] ?? ''))), 0, 4000);
$consent = !empty($_POST['zgoda']);

if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$consent) {
    respond(false, 'Uzupełnij imię, telefon, poprawny e-mail i zgodę.', $wantsJson, $THANKS);
}

// Crude per-IP throttle: 3 submissions per 10 minutes.
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$file = sys_get_temp_dir() . '/hc_' . md5($ip);
$now  = time();
$hits = file_exists($file) ? array_filter(explode(',', (string) file_get_contents($file)), function ($t) use ($now) {
    return (int) $t > $now - 600;
}) : [];
if (count($hits) >= 3) {
    respond(false, 'Zbyt wiele zapytań. Spróbuj za chwilę.', $wantsJson, $THANKS);
}
$hits[] = $now;
@file_put_contents($file, implode(',', $hits));

$body = "Nowe zapytanie ze strony hydracut.pl\n\n"
    . "Imię i nazwisko: $name\n"
    . "Firma: $company\n"
    . "Telefon: $phone\n"
    . "E-mail: $email\n"
    . "Zakres średnic studzienek: $scope\n\n"
    . "Wiadomość:\n$message\n\n"
    . "---\n"
    . 'IP: ' . $ip . "\n"
    . 'Data: ' . date('Y-m-d H:i:s') . "\n";

$headers = [
    'From: HydraCut <' . $FROM . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
    'X-Mailer: hydracut-form',
];

$sent = @mail($TO, '=?UTF-8?B?' . base64_encode($SUBJECT) . '?=', $body, implode("\r\n", $headers));

respond((bool) $sent, $sent ? 'Zapytanie wysłane.' : 'Wysyłka nie powiodła się.', $wantsJson, $THANKS);
