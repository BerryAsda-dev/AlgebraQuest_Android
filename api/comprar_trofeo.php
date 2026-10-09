<?php
/*
==================================================================
    POST /api/comprar_trofeo.php
    Compra un trofeo único con monedas.
==================================================================
*/

require_once __DIR__ . '/db.php';

$catalogo = [
    'bronce' => ['precio' => 50],
    'plata' => ['precio' => 100],
    'oro' => ['precio' => 180],
    'campeon' => ['precio' => 300],
];

$datos = leerJSON();
$nombre = nombreValido($datos['nombre'] ?? null);
$trofeoId = $datos['trofeoId'] ?? null;

if ($nombre === false || !is_string($trofeoId) || !isset($catalogo[$trofeoId])) {
    http_response_code(400);
    echo json_encode(['error' => 'Jugador o trofeo inválido.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id, monedas FROM jugadores WHERE nombre = ? FOR UPDATE');
    $stmt->execute([$nombre]);
    $jugador = $stmt->fetch();

    if (!$jugador) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Jugador no encontrado.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT trofeo_id FROM trofeos_jugador WHERE jugador_id = ? AND trofeo_id = ?');
    $stmt->execute([$jugador['id'], $trofeoId]);
    if ($stmt->fetch()) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'Ya tienes este trofeo.']);
        exit;
    }

    $precio = $catalogo[$trofeoId]['precio'];
    if ((int) $jugador['monedas'] < $precio) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'Aún no tienes monedas suficientes.']);
        exit;
    }

    $monedas = (int) $jugador['monedas'] - $precio;
    $pdo->prepare('UPDATE jugadores SET monedas = ? WHERE id = ?')
        ->execute([$monedas, $jugador['id']]);
    $pdo->prepare('INSERT INTO trofeos_jugador (jugador_id, trofeo_id) VALUES (?, ?)')
        ->execute([$jugador['id'], $trofeoId]);

    $stmt = $pdo->prepare('SELECT trofeo_id FROM trofeos_jugador WHERE jugador_id = ?');
    $stmt->execute([$jugador['id']]);
    $trofeos = array_column($stmt->fetchAll(), 'trofeo_id');
    $pdo->commit();

    echo json_encode(['ok' => true, 'monedas' => $monedas, 'trofeos' => $trofeos]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo completar la compra.']);
}