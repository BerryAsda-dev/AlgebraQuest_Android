/*
==================================================================
    ÁLGEBRA QUEST — GAME ENGINE
==================================================================
    Esta es la pieza central del "motor de juego": conoce las
    reglas (cargar nivel, avanzar pregunta, comprobar respuesta,
    otorgar recompensas) sin saber nada de HTML ni de CSS.

    Las vistas (js/views/*.js) sólo leen su estado y llaman a
    sus métodos. Así, para tener un nivel nuevo, no hace falta
    tocar el motor: solo agregar datos en js/data/worlds.js.
==================================================================
*/

const Engine = {

    mundoActual: null,
    nivelActual: null,
    preguntaIndice: 0,
    aciertos: 0,
    preguntasOrdenadas: [],

    // ------------------------------------------------------------
    // Utilidades de datos
    // ------------------------------------------------------------
    obtenerMundo(worldId) {
        return WORLDS.find(w => w.id === worldId) || null;
    },

    obtenerNivel(worldId, nivelId) {
        const mundo = this.obtenerMundo(worldId);
        if (!mundo) return null;
        return mundo.niveles.find(n => n.id === Number(nivelId)) || null;
    },

    // ------------------------------------------------------------
    // Cargar un nivel para jugar
    // ------------------------------------------------------------
    cargarNivel(worldId, nivelId) {
        this.mundoActual = this.obtenerMundo(worldId);
        this.nivelActual = this.obtenerNivel(worldId, nivelId);
        this.preguntaIndice = 0;
        this.aciertos = 0;

        this.preguntasOrdenadas = this.nivelActual
            ? this.nivelActual.preguntas.map((_, indice) => indice)
            : [];
        for (let indice = this.preguntasOrdenadas.length - 1; indice > 0; indice--) {
            const aleatorio = Math.floor(Math.random() * (indice + 1));
            [this.preguntasOrdenadas[indice], this.preguntasOrdenadas[aleatorio]] =
                [this.preguntasOrdenadas[aleatorio], this.preguntasOrdenadas[indice]];
        }

        return this.nivelActual;
    },

    preguntaActual() {
        if (!this.nivelActual) return null;
        return this.nivelActual.preguntas[this.preguntasOrdenadas[this.preguntaIndice]];
    },

    totalPreguntas() {
        return this.preguntasOrdenadas.length;
    },

    progreso() {
        if (!this.nivelActual) return 0;
        return Math.round((this.preguntaIndice / this.totalPreguntas()) * 100);
    },

    esUltimaPregunta() {
        return this.preguntaIndice >= this.totalPreguntas() - 1;
    },

    // ------------------------------------------------------------
    // Comprobar la respuesta. "correcto" ya viene evaluado por la
    // vista (que es quien conoce el orden -barajado- de las
    // opciones en pantalla); el motor solo aplica las recompensas.
    // ------------------------------------------------------------
    comprobar(correcto) {
        const pregunta = this.preguntaActual();
        if (!pregunta) return null;

        let subioNivel = false;
        let sinVidas = false;

        if (correcto) {
            this.aciertos++;
            subioNivel = Player.ganarXP(pregunta.xp);
            Player.ganarMonedas(pregunta.monedas);
        } else {
            sinVidas = Player.perderVida();
        }

        return { correcto, subioNivel, sinVidas, pregunta };
    },

    // ------------------------------------------------------------
    // Avanzar de pregunta. Devuelve false si el nivel ya terminó.
    // ------------------------------------------------------------
    siguientePregunta() {
        this.preguntaIndice++;
        return this.preguntaIndice < this.totalPreguntas();
    },

    // ------------------------------------------------------------
    // Marcar el nivel actual como completado y devolver el
    // siguiente nivel disponible (o null si era el último).
    // ------------------------------------------------------------
    completarNivel() {
        if (!this.mundoActual || !this.nivelActual) return null;

        Player.marcarNivelCompletado(this.mundoActual.id, this.nivelActual.id);

        const siguiente = this.obtenerNivel(this.mundoActual.id, this.nivelActual.id + 1);
        return siguiente;
    }

};
