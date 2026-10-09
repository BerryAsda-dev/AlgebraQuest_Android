<?php
/*
==================================================================
    ÁLGEBRA QUEST — CONEXIÓN A LA BASE DE DATOS
==================================================================
    Todos los endpoints (login.php, guardar.php, etc.) incluyen
    este archivo. Se encarga de:
      - Conectar a MySQL con PDO
      - Configurar la respuesta como JSON
      - Ofrecer funciones auxiliares: leerJSON() y nombreValido()
==================================================================
*/

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo conectar a la base de datos. Verifica que MySQL '
                 . 'esté iniciado en XAMPP y que hayas importado api/schema.sql.'
    ]);
    exit;
}

// ----------------------------------------------------------------
// Lee el cuerpo JSON de la petición (para POST)
// ----------------------------------------------------------------
function leerJSON(): array {
    $crudo = file_get_contents('php://input');
    $datos = json_decode($crudo, true);
    return is_array($datos) ? $datos : [];
}

// ----------------------------------------------------------------
// Valida y limpia un nombre de jugador. Devuelve false si no sirve.
// ----------------------------------------------------------------
function nombreValido($nombre) {
    if (!is_string($nombre)) return false;

    $nombre = trim($nombre);

    if ($nombre === '' || strlen($nombre) > 20) {
        return false;
    }

    return $nombre;
}
