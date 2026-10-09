<?php
require_once __DIR__ . '/admin_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$datos = leerJSON();
$usuario = trim(is_string($datos['usuario'] ?? null) ? $datos['usuario'] : '');
$password = is_string($datos['password'] ?? null) ? $datos['password'] : '';

if ($usuario === '' || strlen($usuario) > 40 || $password === '' || strlen($password) > 200) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuario o contraseña inválidos.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, usuario, password_hash FROM administradores WHERE usuario = ?');
$stmt->execute([$usuario]);
$administrador = $stmt->fetch();

if (!$administrador || !password_verify($password, $administrador['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos.']);
    exit;
}

iniciarSesionAdministrador();
session_regenerate_id(true);
$_SESSION['admin_id'] = (int) $administrador['id'];
$_SESSION['admin_usuario'] = $administrador['usuario'];

echo json_encode(['ok' => true, 'usuario' => $administrador['usuario']]);