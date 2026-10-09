<?php
/*
==================================================================
    GET /api/ranking.php

    Devuelve los 20 mejores jugadores ordenados por nivel, luego
    XP, luego monedas.
==================================================================
*/

require_once __DIR__ . '/db.php';

$stmt = $pdo->query('
    SELECT nombre, nivel, xp, monedas
    FROM jugadores
    ORDER BY nivel DESC, xp DESC, monedas DESC
    LIMIT 20
');

$jugadores = $stmt->fetchAll();

// Normalizar tipos numéricos para el frontend
foreach ($jugadores as &$j) {
    $j['nivel']   = (int) $j['nivel'];
    $j['xp']      = (int) $j['xp'];
    $j['monedas'] = (int) $j['monedas'];
}

echo json_encode($jugadores);
