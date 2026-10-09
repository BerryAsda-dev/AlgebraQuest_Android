<?php
/*
==================================================================
    GET /api/ranking_aula.php?mundo=factorizacion
    Ranking de aula por puntos, precisión y tiempo medio.
==================================================================
*/

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/admin_auth.php';
exigirAdministrador();

$mundoId = $_GET['mundo'] ?? '';
if ($mundoId !== '' && (!is_string($mundoId) || !preg_match('/^[a-z0-9_-]{1,40}$/', $mundoId))) {
    http_response_code(400);
    echo json_encode(['error' => 'Mundo inválido']);
    exit;
}

$sql = '
    SELECT j.nombre,
           SUM(r.puntos) AS puntos,
           SUM(r.correcta = 1) AS correctas,
           COUNT(r.id) AS respuestas,
           ROUND(100 * SUM(r.correcta = 1) / NULLIF(COUNT(r.id), 0), 1) AS precision_pct,
           ROUND(AVG(CASE WHEN r.correcta = 1 THEN r.duracion_ms END)) AS tiempo_promedio
    FROM jugadores j
    INNER JOIN respuestas r ON r.jugador_id = j.id
';

if ($mundoId !== '') $sql .= ' WHERE r.mundo_id = ?';

$sql .= '
    GROUP BY j.id, j.nombre
    ORDER BY puntos DESC, correctas DESC, precision_pct DESC, tiempo_promedio ASC, j.nombre ASC
    LIMIT 50
';

$stmt = $pdo->prepare($sql);
$stmt->execute($mundoId !== '' ? [$mundoId] : []);
$jugadores = $stmt->fetchAll();

foreach ($jugadores as &$jugador) {
    $jugador['puntos'] = (int) $jugador['puntos'];
    $jugador['correctas'] = (int) $jugador['correctas'];
    $jugador['respuestas'] = (int) $jugador['respuestas'];
    $jugador['precision'] = (float) $jugador['precision_pct'];
    $jugador['tiempoPromedio'] = (int) ($jugador['tiempo_promedio'] ?? 0);
    unset($jugador['precision_pct'], $jugador['tiempo_promedio']);
}

echo json_encode($jugadores);