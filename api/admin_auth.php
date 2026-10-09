<?php
require_once __DIR__ . '/db.php';

function iniciarSesionAdministrador(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    ini_set('session.use_strict_mode', '1');
    session_name('algebraquest_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function exigirAdministrador(): void {
    iniciarSesionAdministrador();
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Inicia sesión como administrador para continuar.']);
        exit;
    }
}