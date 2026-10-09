<?php
/*
==================================================================
    POST /api/guardar.php
    Body: { "nombre", "nivel", "xp", "xpMax", "monedas", "vidas", "vidasMax" }

    Actualiza el estado del jugador. Se llama en segundo plano
    cada vez que cambia XP, monedas o vidas.
==================================================================
*/

require_once __DIR__ . '/db.php';

$datos  = leerJSON();
$nombre = nombreValido($datos['nombre'] ?? null);

if ($nombre === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre inválido']);
    exit;
}

$stmt = $pdo->prepare('
    UPDATE jugadores
    SET nivel = ?, xp = ?, xp_max = ?, monedas = ?, vidas = ?, vidas_max = ?
    WHERE nombre = ?
');

$stmt->execute([
    (int) ($datos['nivel']    ?? 1),
    (int) ($datos['xp']       ?? 0),
    (int) ($datos['xpMax']    ?? 100),
    (int) ($datos['monedas']  ?? 0),
    (int) ($datos['vidas']    ?? 3),
    (int) ($datos['vidasMax'] ?? 3),
    $nombre,
]);

echo json_encode(['ok' => true]);
