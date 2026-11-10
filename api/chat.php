
<?php

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ]);
    exit;
}

require_once __DIR__ . '/../config/config.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Format data tidak valid.'
    ]);
    exit;
}

$message = trim($data['message'] ?? '');

if ($message === '' || mb_strlen($message) > 2000) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Pesan kosong atau terlalu panjang.'
    ]);
    exit;
}

$history = $data['history'] ?? [];

if (!is_array($history)) {
    $history = [];
}

$contents = [];

foreach (array_slice($history, -10) as $item) {
    if (!is_array($item)) {
        continue;
    }

    $role = $item['role'] ?? '';
    $content = trim($item['content'] ?? '');

    if (
        !in_array($role, ['user', 'model'], true) ||
        $content === '' ||
        mb_strlen($content) > 2000
    ) {
        continue;
    }

    $contents[] = [
        'role' => $role,
        'parts' => [
            ['text' => $content]
        ]
    ];
}

$contents[] = [
    'role' => 'user',
    'parts' => [
        ['text' => $message]
    ]
];

$systemInstruction = <<<PROMPT
Kamu adalah Asisten Jalan Kebaikan, asisten virtual
untuk membantu pengunjung website donasi.

Gunakan Bahasa Indonesia yang ramah, sopan,
sederhana, dan mudah dipahami.

Prioritaskan pengguna low vision:
- Gunakan kalimat jelas dan tidak berbelit-belit.
- Hindari jawaban terlalu panjang.
- Berikan panduan langkah demi langkah.
- Perhatikan kebutuhan aksesibilitas pengguna.

Kamu dapat membantu menjelaskan penggunaan website,
fitur aksesibilitas, dan informasi donasi.

Jangan mengarang informasi tentang program,
nominal donasi, rekening, atau prosedur pembayaran.
Jika informasi tidak tersedia, arahkan pengguna
untuk memeriksa informasi resmi website.

Untuk tahap ini, kamu hanya menjawab percakapan.
Jangan mengaku telah mengubah pengaturan website
atau melakukan transaksi.
PROMPT;

$payload = [
    'systemInstruction' => [
        'parts' => [
            ['text' => $systemInstruction]
        ]
    ],
    'contents' => $contents,
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 500
    ]
];

$url = 'https://generativelanguage.googleapis.com/v1beta/models/'
    . GEMINI_MODEL
    . ':generateContent';

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . GEMINI_API_KEY
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$curlErrno = curl_errno($ch);
$curlError = curl_error($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($response === false) {
    error_log(sprintf(
        'Gemini cURL Error (%d): %s',
        $curlErrno,
        $curlError
    ));

    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Layanan AI tidak dapat dihubungi. Periksa koneksi server atau coba lagi.'
    ]);
    exit;
}

$result = json_decode($response, true);

if ($statusCode < 200 || $statusCode >= 300) {
    $apiError = $result['error']['status'] ?? 'unknown';
    error_log(sprintf(
        'Gemini API Error: HTTP %d, status %s',
        $statusCode,
        $apiError
    ));

    http_response_code($statusCode === 429 ? 429 : 502);
    echo json_encode([
        'success' => false,
        'message' => $statusCode === 429
            ? 'Layanan AI sedang sibuk. Silakan coba lagi beberapa saat.'
            : 'Layanan AI menolak permintaan. Periksa model dan API key di konfigurasi server.'
    ]);
    exit;
}

$reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

$reply = trim($reply);

if ($reply === '') {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Asisten belum dapat memberikan jawaban.'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'reply' => $reply
], JSON_UNESCAPED_UNICODE);
