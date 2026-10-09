USE algebraquest;

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