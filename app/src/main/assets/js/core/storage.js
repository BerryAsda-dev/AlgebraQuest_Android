/*
==================================================================
    ÁLGEBRA QUEST — PERSISTENCIA LOCAL (localStorage)
==================================================================
    Toda la información del juego (progreso, ranking, trofeos
    y respuestas) se almacena internamente en el dispositivo
    usando localStorage. No requiere conexión a internet ni
    servidores locales (localhost / XAMPP / MySQL).
==================================================================
*/

const Storage = {

    KEY_NOMBRE: "algebraquest_nombre",
    KEY_JUGADORES: "algebraquest_jugadores",
    KEY_ADMIN: "algebraquest_admin_session",

    _obtenerTodosJugadores() {
        try {
            const raw = localStorage.getItem(this.KEY_JUGADORES);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    },

    _guardarTodosJugadores(jugadores) {
        try {
            localStorage.setItem(this.KEY_JUGADORES, JSON.stringify(jugadores));
        } catch (e) {
            console.warn("No se pudo guardar en localStorage:", e);
        }
    },

    nombreRecordado() {
        return localStorage.getItem(this.KEY_NOMBRE);
    },

    recordarNombre(nombre) {
        localStorage.setItem(this.KEY_NOMBRE, nombre);
    },

    olvidarNombre() {
        localStorage.removeItem(this.KEY_NOMBRE);
    },

    async login(nombre) {
        if (!nombre || !nombre.trim()) {
            throw new Error("El nombre de usuario no es válido.");
        }

        const nombreLimpio = nombre.trim();
        const todos = this._obtenerTodosJugadores();

        if (!todos[nombreLimpio]) {
            todos[nombreLimpio] = {
                id: Date.now(),
                nombre: nombreLimpio,
                nivel: 1,
                xp: 0,
                xpMax: 100,
                monedas: 0,
                vidas: 3,
                vidasMax: 3,
                trofeos: [],
                progreso: {},
                respuestas: []
            };
            this._guardarTodosJugadores(todos);
        }

        const datos = todos[nombreLimpio];
        Object.assign(Player, datos);
        this.recordarNombre(nombreLimpio);

        document.dispatchEvent(new CustomEvent("player:update", { detail: Player }));
        return Player;
    },

    guardar() {
        if (!Player.nombre || Player.nombre === "Invitado") return;

        const todos = this._obtenerTodosJugadores();
        todos[Player.nombre] = {
            id: Player.id || Date.now(),
            nombre: Player.nombre,
            nivel: Player.nivel,
            xp: Player.xp,
            xpMax: Player.xpMax,
            monedas: Player.monedas,
            vidas: Player.vidas,
            vidasMax: Player.vidasMax,
            trofeos: Player.trofeos || [],
            progreso: Player.progreso || {},
            respuestas: Player.respuestas || (todos[Player.nombre]?.respuestas || [])
        };

        this._guardarTodosJugadores(todos);
    },

    async recuperarVida() {
        if (Player.vidas >= Player.vidasMax) {
            throw new Error("Ya tienes todas tus vidas al máximo.");
        }
        if (Player.xp < 25) {
            throw new Error("Necesitas al menos 25 XP para canjear una vida.");
        }

        Player.xp -= 25;
        Player.vidas++;
        this.guardar();

        document.dispatchEvent(new CustomEvent("player:update", { detail: Player }));
        return {
            xp: Player.xp,
            vidas: Player.vidas,
            monedas: Player.monedas,
            trofeos: Player.trofeos
        };
    },

    async comprarTrofeo(trofeoId) {
        const precios = {
            bronce: 50,
            plata: 100,
            oro: 180,
            campeon: 300
        };

        const precio = precios[trofeoId] || 100;

        if (!Player.trofeos) Player.trofeos = [];

        if (Player.trofeos.includes(trofeoId)) {
            throw new Error("Ya adquiriste este trofeo.");
        }

        if (Player.monedas < precio) {
            throw new Error("No tienes suficientes monedas para este trofeo.");
        }

        Player.monedas -= precio;
        Player.trofeos.push(trofeoId);
        this.guardar();

        document.dispatchEvent(new CustomEvent("player:update", { detail: Player }));
        return {
            xp: Player.xp,
            vidas: Player.vidas,
            monedas: Player.monedas,
            trofeos: Player.trofeos
        };
    },

    marcarNivelCompletado(mundoId, nivelId) {
        this.guardar();
    },

    async reset() {
        if (!Player.nombre) return;

        Player.nivel = 1;
        Player.xp = 0;
        Player.xpMax = 100;
        Player.monedas = 0;
        Player.vidas = 3;
        Player.vidasMax = 3;
        Player.progreso = {};
        Player.trofeos = [];

        this.guardar();
        document.dispatchEvent(new CustomEvent("player:update", { detail: Player }));
    },

    async renombrar(nuevoNombre) {
        if (!nuevoNombre || !nuevoNombre.trim()) {
            throw new Error("Ingresa un nombre válido.");
        }

        const nuevo = nuevoNombre.trim();
        if (nuevo === Player.nombre) return;

        const todos = this._obtenerTodosJugadores();
        if (todos[nuevo]) {
            throw new Error("Ese nombre ya pertenece a otro jugador en este dispositivo.");
        }

        const antiguoNombre = Player.nombre;
        const datos = todos[antiguoNombre] || {
            id: Date.now(),
            nivel: Player.nivel,
            xp: Player.xp,
            xpMax: Player.xpMax,
            monedas: Player.monedas,
            vidas: Player.vidas,
            vidasMax: Player.vidasMax,
            trofeos: Player.trofeos,
            progreso: Player.progreso,
            respuestas: Player.respuestas || []
        };

        delete todos[antiguoNombre];
        datos.nombre = nuevo;
        todos[nuevo] = datos;

        this._guardarTodosJugadores(todos);

        Player.nombre = nuevo;
        this.recordarNombre(nuevo);

        document.dispatchEvent(new CustomEvent("player:update", { detail: Player }));
    },

    async obtenerRanking() {
        const todos = this._obtenerTodosJugadores();
        const lista = Object.values(todos);

        lista.sort((a, b) => {
            if (b.nivel !== a.nivel) return b.nivel - a.nivel;
            if (b.xp !== a.xp) return b.xp - a.xp;
            return b.monedas - a.monedas;
        });

        return lista;
    },

    async registrarRespuesta(datos) {
        if (!Player.nombre || Player.nombre === "Invitado") return;

        const todos = this._obtenerTodosJugadores();
        const jugador = todos[Player.nombre];
        if (jugador) {
            if (!jugador.respuestas) jugador.respuestas = [];
            jugador.respuestas.push({
                ...datos,
                fecha: new Date().toISOString()
            });
            this._guardarTodosJugadores(todos);
        }
    },

    async obtenerRankingAula(mundoId = "") {
        const todos = this._obtenerTodosJugadores();
        const lista = Object.values(todos);

        const res = lista.map(jugador => {
            const respuestas = (jugador.respuestas || []).filter(r => !mundoId || r.mundoId === mundoId);
            const totalRespuestas = respuestas.length;
            const correctas = respuestas.filter(r => r.correcta).length;
            const puntos = respuestas.reduce((sum, r) => sum + (r.puntos || 0), 0);
            const precision = totalRespuestas > 0 ? Math.round((correctas / totalRespuestas) * 100) : 0;
            const tiempoTotal = respuestas.reduce((sum, r) => sum + (r.tiempoMs || 0), 0);
            const tiempoPromedio = totalRespuestas > 0 ? tiempoTotal / totalRespuestas : 0;

            return {
                nombre: jugador.nombre,
                puntos: puntos || (jugador.nivel * 100 + jugador.xp),
                respuestas: totalRespuestas,
                correctas,
                precision,
                tiempoPromedio
            };
        });

        res.sort((a, b) => b.puntos - a.puntos || b.precision - a.precision);
        return res;
    },

    async adminEstado() {
        const adminSession = localStorage.getItem(this.KEY_ADMIN);
        return {
            configurado: true,
            autenticado: !!adminSession,
            usuario: adminSession || "Docente"
        };
    },

    async adminIniciar(usuario, password) {
        if (!usuario || !usuario.trim()) {
            throw new Error("Ingresa un nombre de usuario.");
        }
        if (!password) {
            throw new Error("Ingresa una contraseña.");
        }

        const user = usuario.trim();
        localStorage.setItem(this.KEY_ADMIN, user);
        return { success: true, usuario: user };
    },

    async adminCerrar() {
        localStorage.removeItem(this.KEY_ADMIN);
    }

};
