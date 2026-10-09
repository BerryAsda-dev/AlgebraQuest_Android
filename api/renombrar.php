<?php
/*
==================================================================
    POST /api/renombrar.php
    Body: { "actual", "nuevo" }

    Cambia el nombre de un jugador, verificando que el nuevo
    nombre no esté ya en uso por otro jugador.
==================================================================
*/

require_once __DIR__ . '/db.php';

$datos  = leerJSON();
$actual = nombreValido($datos['actual'] ?? null);
$nuevo  = nombreValido($datos['nuevo'] ?? null);

if ($actual === false || $nuevo === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre inválido']);
    exit;
}

if ($actual === $nuevo) {
    echo json_encode(['ok' => true, 'nombre' => $nuevo]);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM jugadores WHERE nombre = ?');
$stmt->execute([$nuevo]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Ese nombre ya está en uso por otro jugador.']);
    exit;
}

$stmt = $pdo->prepare('UPDATE jugadores SET nombre = ? WHERE nombre = ?');
$stmt->execute([$nuevo, $actual]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Jugador no encontrado']);
    exit;
}

echo json_encode(['ok' => true, 'nombre' => $nuevo]);
