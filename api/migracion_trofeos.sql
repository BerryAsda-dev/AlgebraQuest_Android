USE algebraquest;

CREATE TABLE IF NOT EXISTS trofeos_jugador (
    jugador_id   INT         NOT NULL,
    trofeo_id    VARCHAR(40) NOT NULL,
    adquirido_en DATETIME    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (jugador_id, trofeo_id),

    CONSTRAINT fk_trofeo_jugador
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;