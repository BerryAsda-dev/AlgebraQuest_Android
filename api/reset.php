<?php
/*
==================================================================
    POST /api/reset.php
    Body: { "nombre" }

    Borra todo el progreso (niveles completados) y regresa las
    estadísticas del jugador a los valores iniciales.
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

$stmt = $pdo->prepare('SELECT id FROM jugadores WHERE nombre = ?');
$stmt->execute([$nombre]);
$jugador = $stmt->fetch();

if (!$jugador) {
    http_response_code(404);
    echo json_encode(['error' => 'Jugador no encontrado']);
    exit;
}

$pdo->prepare('DELETE FROM progreso WHERE jugador_id = ?')
    ->execute([$jugador['id']]);
$pdo->prepare('DELETE FROM trofeos_jugador WHERE jugador_id = ?')
    ->execute([$jugador['id']]);

$pdo->prepare('
    UPDATE jugadores
    SET nivel = 1, xp = 0, xp_max = 100, monedas = 0, vidas = 3, vidas_max = 3
    WHERE id = ?
')->execute([$jugador['id']]);

echo json_encode(['ok' => true]);
