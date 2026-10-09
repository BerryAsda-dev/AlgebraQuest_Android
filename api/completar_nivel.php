<?php
/*
==================================================================
    POST /api/completar_nivel.php
    Body: { "nombre", "mundoId", "nivelId" }

    Registra que un jugador completó un nivel. Si ya estaba
    registrado, no hace nada (evita duplicados).
==================================================================
*/

require_once __DIR__ . '/db.php';

$datos   = leerJSON();
$nombre  = nombreValido($datos['nombre'] ?? null);
$mundoId = trim((string) ($datos['mundoId'] ?? ''));
$nivelId = (int) ($datos['nivelId'] ?? 0);

if ($nombre === false || $mundoId === '' || $nivelId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM jugadores WHERE nombre = ?');
$stmt->execute([$nombre]);
$jugador = $stmt->fetch();

if (!$jugador) {
    http_response_code(404);
    echo json_encode(['error' => 'Jugador no encontrado']);
    exit;
}

$stmt = $pdo->prepare('
    INSERT IGNORE INTO progreso (jugador_id, mundo_id, nivel_id)
    VALUES (?, ?, ?)
');
$stmt->execute([$jugador['id'], $mundoId, $nivelId]);

echo json_encode(['ok' => true]);
