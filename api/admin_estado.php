<?php
require_once __DIR__ . '/admin_auth.php';
iniciarSesionAdministrador();
$configurado = (int) $pdo->query('SELECT COUNT(*) FROM administradores')->fetchColumn() > 0;

if (empty($_SESSION['admin_id'])) {
    echo json_encode(['autenticado' => false, 'configurado' => $configurado]);
    exit;
}

echo json_encode([
    'autenticado' => true,
    'configurado' => $configurado,
    'usuario' => $_SESSION['admin_usuario'] ?? 'Administrador',
]);