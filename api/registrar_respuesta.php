<?php
/*
==================================================================
    POST /api/registrar_respuesta.php
    Registra una respuesta del juego para el ranking de aula.
==================================================================
*/

require_once __DIR__ . '/db.php';

$datos = leerJSON();
$nombre = nombreValido($datos['nombre'] ?? null);
$mundoId = $datos['mundoId'] ?? '';
$nivelId = filter_var($datos['nivelId'] ?? null, FILTER_VALIDATE_INT);
$duracion = filter_var($datos['duracionMs'] ?? 0, FILTER_VALIDATE_INT);
$correcta = filter_var($datos['correcta'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
$puntos = filter_var($datos['puntos'] ?? 0, FILTER_VALIDATE_INT);

if ($nombre === false || !is_string($mundoId) || !preg_match('/^[a-z0-9_-]{1,40}$/', $mundoId) ||
    $nivelId === false || $nivelId < 1 || $duracion === false || $duracion < 0 || $duracion > 600000 ||
    $correcta === null || $puntos === false || $puntos < 0 || $puntos > 3000) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de respuesta inválidos']);
    exit;
}

if (!$correcta) $puntos = 0;

$stmt = $pdo->prepare('SELECT id FROM jugadores WHERE nombre = ?');
$stmt->execute([$nombre]);
$jugadorId = $stmt->fetchColumn();

if (!$jugadorId) {
    http_response_code(404);
    echo json_encode(['error' => 'Jugador no encontrado']);
    exit;
}

$stmt = $pdo->prepare('
    INSERT INTO respuestas (jugador_id, mundo_id, nivel_id, correcta, puntos, duracion_ms)
    VALUES (?, ?, ?, ?, ?, ?)
');
$stmt->execute([$jugadorId, $mundoId, $nivelId, (int) $correcta, $puntos, $duracion]);

echo json_encode(['ok' => true]);