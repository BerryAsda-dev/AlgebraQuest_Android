<?php
/*
==================================================================
    POST /api/restaurar_vida.php
    Canjea 25 XP por una vida.
==================================================================
*/

require_once __DIR__ . '/db.php';

$datos = leerJSON();
$nombre = nombreValido($datos['nombre'] ?? null);
$costo = 25;

if ($nombre === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre inválido.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id, xp, vidas, vidas_max FROM jugadores WHERE nombre = ? FOR UPDATE');
    $stmt->execute([$nombre]);
    $jugador = $stmt->fetch();

    if (!$jugador) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Jugador no encontrado.']);
        exit;
    }

    if ((int) $jugador['vidas'] >= (int) $jugador['vidas_max']) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'Ya tienes todas tus vidas.']);
        exit;
    }

    if ((int) $jugador['xp'] < $costo) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'Necesitas 25 XP para recuperar una vida.']);
        exit;
    }

    $xp = (int) $jugador['xp'] - $costo;
    $vidas = (int) $jugador['vidas'] + 1;

    $pdo->prepare('UPDATE jugadores SET xp = ?, vidas = ? WHERE id = ?')
        ->execute([$xp, $vidas, $jugador['id']]);
    $pdo->commit();

    echo json_encode(['ok' => true, 'xp' => $xp, 'vidas' => $vidas]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo recuperar la vida.']);
}