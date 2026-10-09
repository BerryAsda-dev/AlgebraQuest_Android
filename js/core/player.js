/*
==================================================================
    ÁLGEBRA QUEST — ESTADO DEL JUGADOR
==================================================================
    "player" guarda el estado. Cualquier cambio dispara el evento
    "player:update" en document, para que el HUD (o cualquier otra
    vista) se actualice sin que este archivo necesite conocerlo.

    El estado autoritativo vive en la base de datos (ver
    js/core/storage.js). Este objeto es la copia en memoria que
    usa el juego mientras se juega; se sincroniza con el servidor
    al iniciar sesión y cada vez que cambia algo importante.
==================================================================
*/

const Player = {

    id: null,           // id en la base de datos (null = no ha iniciado sesión)
    nombre: "Invitado",
    nivel: 1,
    xp: 0,
    xpMax: 100,
    monedas: 0,
    vidas: 3,
    vidasMax: 3,
    trofeos: [],

    // progreso[worldId] = { completados: [idNivel, idNivel...] }
    progreso: {},

    // ------------------------------------------------------------
    // Notificar cambios
    // ------------------------------------------------------------
    _notificar() {
        document.dispatchEvent(new CustomEvent("player:update", { detail: this }));
    },

    // ------------------------------------------------------------
    // XP y niveles
    // ------------------------------------------------------------
    ganarXP(cantidad) {
        this.xp += cantidad;

        let subioNivel = false;

        while (this.xp >= this.xpMax) {
            this.xp -= this.xpMax;
            this.nivel++;
            this.xpMax = Math.round(this.xpMax * 1.15);
            subioNivel = true;
        }

        Storage.guardar();
        this._notificar();

        return subioNivel;
    },

    // ------------------------------------------------------------
    // Monedas
    // ------------------------------------------------------------
    ganarMonedas(cantidad) {
        this.monedas += cantidad;
        Storage.guardar();
        this._notificar();
    },

    // ------------------------------------------------------------
    // Vidas
    // ------------------------------------------------------------
    perderVida() {
        if (this.vidas > 0) this.vidas--;
        Storage.guardar();
        this._notificar();
        return this.vidas <= 0;
    },

    recuperarVida() {
        return Storage.recuperarVida();
    },

    reiniciarVidas() {
        this.vidas = this.vidasMax;
        Storage.guardar();
        this._notificar();
    },

    // ------------------------------------------------------------
    // Progreso de niveles
    // ------------------------------------------------------------
    marcarNivelCompletado(worldId, nivelId) {
        if (!this.progreso[worldId]) {
            this.progreso[worldId] = { completados: [] };
        }

        if (!this.progreso[worldId].completados.includes(nivelId)) {
            this.progreso[worldId].completados.push(nivelId);
            Storage.marcarNivelCompletado(worldId, nivelId);
        }

        this._notificar();
    },

    nivelCompletado(worldId, nivelId) {
        return !!(this.progreso[worldId] &&
            this.progreso[worldId].completados.includes(nivelId));
    },

    // Un nivel está desbloqueado si es el primero, o si el anterior
    // ya fue completado.
    nivelDesbloqueado(worldId, nivelId) {
        if (nivelId === 1) return true;
        return this.nivelCompletado(worldId, nivelId - 1);
    },

    mundoCompletado(world) {
        if (!world.niveles.length) return false;
        return world.niveles.every(n => this.nivelCompletado(world.id, n.id));
    },

    // Un mundo está desbloqueado si su bandera "desbloqueado" es true,
    // o si el mundo del que depende ("requiere") ya fue completado al 100%.
    // Esto encadena los mundos: completar uno desbloquea el siguiente.
    mundoDesbloqueado(world) {
        if (world.desbloqueado) return true;
        if (!world.requiere) return false;

        const requerido = WORLDS.find(w => w.id === world.requiere);
        return requerido ? this.mundoCompletado(requerido) : false;
    },

    // ------------------------------------------------------------
    // Reiniciar progreso del jugador actual (llama al servidor,
    // conserva el nombre/sesión).
    // ------------------------------------------------------------
    async reset() {
        await Storage.reset();

        this.nivel = 1;
        this.xp = 0;
        this.xpMax = 100;
        this.monedas = 0;
        this.vidas = 3;
        this.vidasMax = 3;
        this.progreso = {};
        this.trofeos = [];

        this._notificar();
    },

    // ------------------------------------------------------------
    // Cerrar la sesión actual en este dispositivo (para volver a
    // la pantalla de inicio y entrar con otro nombre). No borra
    // nada en el servidor, solo limpia la copia en memoria.
    // ------------------------------------------------------------
    reiniciarSesion() {
        this.id = null;
        this.nombre = "Invitado";
        this.nivel = 1;
        this.xp = 0;
        this.xpMax = 100;
        this.monedas = 0;
        this.vidas = 3;
        this.vidasMax = 3;
        this.progreso = {};
        this.trofeos = [];

        this._notificar();
    }

};
