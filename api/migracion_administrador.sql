USE algebraquest;

CREATE TABLE IF NOT EXISTS administradores (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    usuario       VARCHAR(40)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en     DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;