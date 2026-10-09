<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/db.php';

$stmt = $pdo->query('SELECT COUNT(*) FROM administradores');
echo 'Crear cuenta de administrador para Algebra Quest' . PHP_EOL;
echo 'Usuario: ';
$usuario = trim((string) fgets(STDIN));
echo 'Contraseña (mínimo 12 caracteres): ';
$password = rtrim((string) fgets(STDIN), "\r\n");

if (!preg_match('/^[\pL\pN_.-]{3,40}$/u', $usuario) || strlen($password) < 12 || strlen($password) > 200) {
    fwrite(STDERR, 'Usuario inválido o contraseña fuera del rango permitido.' . PHP_EOL);
    exit(1);
}

$stmt = $pdo->prepare('INSERT INTO administradores (usuario, password_hash) VALUES (?, ?)');
$stmt->execute([$usuario, password_hash($password, PASSWORD_DEFAULT)]);
echo 'Administrador creado. Ya puedes iniciar sesión en la página de acceso docente.' . PHP_EOL;