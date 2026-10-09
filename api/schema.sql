-- ==================================================================
--  ÁLGEBRA QUEST — ESQUEMA DE BASE DE DATOS
-- ==================================================================
--  Cómo usarlo con XAMPP:
--    1. Abre phpMyAdmin (http://localhost/phpmyadmin)
--    2. Pestaña "SQL"
--    3. Pega y ejecuta todo este archivo
--  (o desde línea de comandos: mysql -u root < schema.sql)
-- ==================================================================

CREATE DATABASE IF NOT EXISTS algebraquest
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE algebraquest;

-- ------------------------------------------------------------------
-- Jugadores: una fila por nombre de jugador (sin contraseña)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jugadores (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(20)  NOT NULL UNIQUE,
    nivel          INT          NOT NULL DEFAULT 1,
    xp             INT          NOT NULL DEFAULT 0,
    xp_max         INT          NOT NULL DEFAULT 100,
    monedas        INT          NOT NULL DEFAULT 0,
    vidas          INT          NOT NULL DEFAULT 3,
    vidas_max      INT          NOT NULL DEFAULT 3,
    creado_en      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- Progreso: qué niveles completó cada jugador
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progreso (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id     INT          NOT NULL,
    mundo_id       VARCHAR(40)  NOT NULL,
    nivel_id       INT          NOT NULL,
    completado_en  DATETIME     DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unico_nivel_por_jugador (jugador_id, mundo_id, nivel_id),

-- ------------------------------------------------------------------
-- Respuestas: actividad de juego para el ranking del modo profesor
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS respuestas (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    jugador_id     INT          NOT NULL,
    mundo_id       VARCHAR(40)  NOT NULL,
    nivel_id       INT          NOT NULL,
    correcta       TINYINT(1)   NOT NULL DEFAULT 0,
    puntos         INT          NOT NULL DEFAULT 0,
    duracion_ms    INT          NOT NULL DEFAULT 0,
    respondido_en  DATETIME     DEFAULT CURRENT_TIMESTAMP,

    KEY idx_respuestas_ranking (mundo_id, jugador_id, respondido_en),

    CONSTRAINT fk_respuesta_jugador
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

    CONSTRAINT fk_progreso_jugador
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- Administradores: cuentas separadas de los jugadores
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administradores (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    usuario       VARCHAR(40)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en     DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------
-- Trofeos comprados con monedas
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trofeos_jugador (
    jugador_id   INT         NOT NULL,
    trofeo_id    VARCHAR(40) NOT NULL,
    adquirido_en DATETIME    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (jugador_id, trofeo_id),

    CONSTRAINT fk_trofeo_jugador
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Índice para acelerar el ranking (ordenar por nivel y xp)
CREATE INDEX idx_ranking ON jugadores (nivel DESC, xp DESC, monedas DESC);
