<?php
/*
==================================================================
    POST /api/login.php
    Body: { "nombre": "Ana" }

    Si el jugador ya existe, devuelve su estado guardado.
    Si no existe, lo crea con los valores por defecto.
==================================================================
*/

require_once __DIR__ . '/db.php';

$datos  = leerJSON();
$nombre = nombreValido($datos['nombre'] ?? null);

if ($nombre === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Escribe un nombre válido (máx. 20 caracteres).']);
    exit;
}

// Buscar jugador existente
$stmt = $pdo->prepare('SELECT * FROM jugadores WHERE nombre = ?');
$stmt->execute([$nombre]);
$jugador = $stmt->fetch();

// Si no existe, crearlo
if (!$jugador) {
    $stmt = $pdo->prepare('INSERT INTO jugadores (nombre) VALUES (?)');
    $stmt->execute([$nombre]);

    $stmt = $pdo->prepare('SELECT * FROM jugadores WHERE nombre = ?');
    $stmt->execute([$nombre]);
    $jugador = $stmt->fetch();
}

// Cargar el progreso (niveles completados) de ese jugador
$stmt = $pdo->prepare('SELECT mundo_id, nivel_id FROM progreso WHERE jugador_id = ?');
$stmt->execute([$jugador['id']]);
$filas = $stmt->fetchAll();

$progreso = [];
foreach ($filas as $fila) {
    $mundoId = $fila['mundo_id'];

    if (!isset($progreso[$mundoId])) {
        $progreso[$mundoId] = ['completados' => []];
    }

    $progreso[$mundoId]['completados'][] = (int) $fila['nivel_id'];
}

$stmt = $pdo->prepare('SELECT trofeo_id FROM trofeos_jugador WHERE jugador_id = ?');
$stmt->execute([$jugador['id']]);
$trofeos = array_column($stmt->fetchAll(), 'trofeo_id');

echo json_encode([
    'id'       => (int) $jugador['id'],
    'nombre'   => $jugador['nombre'],
    'nivel'    => (int) $jugador['nivel'],
    'xp'       => (int) $jugador['xp'],
    'xpMax'    => (int) $jugador['xp_max'],
    'monedas'  => (int) $jugador['monedas'],
    'vidas'    => (int) $jugador['vidas'],
    'vidasMax' => (int) $jugador['vidas_max'],
    'progreso' => empty($progreso) ? new stdClass() : $progreso,
    'trofeos'  => $trofeos,
]);
