/*
==================================================================
    VISTA: JUEGO (responder preguntas de un nivel)
==================================================================
    Reemplaza a "game.html" + "gameUI.js" + "ejemplo.js". Soporta
    dos tipos de pregunta ("opcion" y "arrastrar") sin necesitar
    una página distinta para cada una: el "case" está en el motor
    de render, no en el HTML.
==================================================================
*/

const GameView = {

    nombre: "game",

    seleccion: -1,          // índice elegido (opción múltiple)
    valorArrastrado: null,  // índice de la pieza soltada (drag & drop)
    racha: 0,
    puntosQuiz: 0,
    reloj: null,
    inicioPregunta: 0,

    render(container, params) {
        HUD.montar();
        HUD.mostrar();

        const mundo = Engine.obtenerMundo(params.worldId);

        if (!mundo || !Player.mundoDesbloqueado(mundo)) {
            Router.navegar("/worlds");
            return;
        }

        const nivel = Engine.cargarNivel(params.worldId, params.levelId);

        if (!nivel) {
            Router.navegar("/world/" + params.worldId);
            return;
        }

        this.container = container;
        this.worldId = params.worldId;
        this.racha = 0;
        this.puntosQuiz = 0;

        this._renderPregunta();
    },

    salir() {
        this._detenerReloj();
        this.container = null;
    },

    // --------------------------------------------------------
    // Baraja las opciones de la pregunta para que la respuesta
    // correcta no quede siempre en el mismo lugar. Devuelve las
    // opciones ya mezcladas junto con el nuevo índice correcto.
    // --------------------------------------------------------
    _barajarOpciones(pregunta) {
        const indices = pregunta.opciones.map((_, i) => i);

        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        return {
            opciones: indices.map(i => pregunta.opciones[i]),
            correcta: indices.indexOf(pregunta.correcta)
        };
    },

    // --------------------------------------------------------
    _renderPregunta() {
        this._detenerReloj();
        const pregunta = Engine.preguntaActual();
        const nivel = Engine.nivelActual;

        this.seleccion = -1;
        this.valorArrastrado = null;
        this.ultimaRespuestaIncorrecta = null;
        this.opcionesActuales = this._barajarOpciones(pregunta);

        this.container.innerHTML = `
            <button class="btnRegresar" id="btnSalir">← Salir del nivel</button>

            <div class="gameContainer">

                <div class="gameHeader">
                    <h1>${nivel.titulo}</h1>
                    <h3>Pregunta ${Engine.preguntaIndice + 1} de ${Engine.totalPreguntas()}</h3>
                    <div class="barraProgresoNivel">
                        <div class="progresoNivel" style="width:${Engine.progreso()}%"></div>
                    </div>
                    <div class="game-live-stats" aria-live="polite">
                        <span>⏱ <strong id="gameClock">0.0 s</strong></span>
                        <span>🔥 Racha <strong id="gameStreak">${this.racha}</strong></span>
                    </div>
                </div>

                <div class="card">
                    <h2 id="pregunta">${pregunta.enunciado}</h2>

                    <div id="zonaJuego"></div>

                    <button id="btnComprobar" disabled>Comprobar respuesta</button>
                    <p id="mensaje" aria-live="polite">Elige una respuesta para comenzar.</p>
                </div>

            </div>
        `;

        const zona = this.container.querySelector("#zonaJuego");

        if (pregunta.tipo === "arrastrar") {
            this._renderArrastrar(zona, pregunta);
        } else {
            this._renderOpcion(zona, pregunta);
        }

        this.container.querySelector("#btnComprobar")
            .addEventListener("click", () => this._comprobar());

        this.container.querySelector("#btnSalir")
            .addEventListener("click", () => {
                Router.navegar("/world/" + this.worldId);
            });

        this.inicioPregunta = performance.now();
        this.reloj = window.setInterval(() => {
            const segundos = (performance.now() - this.inicioPregunta) / 1000;
            const reloj = this.container?.querySelector("#gameClock");
            if (reloj) reloj.textContent = `${segundos.toFixed(1)} s`;
        }, 200);
    },

    // --------------------------------------------------------
    // Tipo: selección múltiple
    // --------------------------------------------------------
    _renderOpcion(zona) {
        zona.innerHTML = `<div class="opciones" id="opciones"></div>`;

        const opciones = zona.querySelector("#opciones");

        this.opcionesActuales.opciones.forEach((texto, indice) => {
            const btn = document.createElement("button");
            btn.className = "pieza opcionBtn";
            btn.dataset.indice = indice;
            btn.setAttribute("aria-pressed", "false");
            btn.textContent = texto;
            btn.addEventListener("click", () => {
                opciones.querySelectorAll(".opcionBtn").forEach(opcion => {
                    opcion.classList.remove("seleccionada");
                    opcion.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("seleccionada");
                btn.setAttribute("aria-pressed", "true");
                this.seleccion = indice;
                const botonComprobar = this.container.querySelector("#btnComprobar");
                botonComprobar.disabled = indice === this.ultimaRespuestaIncorrecta;
                this._mensaje(botonComprobar.disabled
                    ? "Esa opción ya la intentaste. Elige otra para seguir."
                    : "¡Buena elección! Pulsa comprobar cuando estés listo.", "");
            });
            opciones.appendChild(btn);
        });
    },

    // --------------------------------------------------------
    // Tipo: arrastrar y soltar
    // --------------------------------------------------------
    _renderArrastrar(zona) {
        zona.innerHTML = `
            <div id="zonaRespuesta" class="zona">Arrastra aquí la respuesta correcta</div>
            <br>
            <div class="opciones" id="piezas"></div>
        `;

        const drop = zona.querySelector("#zonaRespuesta");
        const piezas = zona.querySelector("#piezas");

        this.opcionesActuales.opciones.forEach((texto, indice) => {
            const pieza = document.createElement("div");
            pieza.className = "pieza";
            pieza.dataset.indice = indice;
            pieza.draggable = true;
            pieza.tabIndex = 0;
            pieza.setAttribute("role", "button");
            pieza.setAttribute("aria-pressed", "false");
            pieza.textContent = texto;

            pieza.addEventListener("click", () => this._seleccionarPieza(indice, pieza, drop));
            pieza.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    this._seleccionarPieza(indice, pieza, drop);
                }
            });
            pieza.addEventListener("dragstart", event => {
                pieza.classList.add("arrastrando");
                drop.dataset.indice = indice;
                event.dataTransfer.setData("text/plain", String(indice));
            });

            pieza.addEventListener("dragend", () => {
                pieza.classList.remove("arrastrando");
            });

            piezas.appendChild(pieza);
        });

        drop.addEventListener("dragover", e => e.preventDefault());

        drop.addEventListener("drop", e => {
            e.preventDefault();
            const indice = Number(e.dataTransfer.getData("text/plain") || drop.dataset.indice);
            const pieza = piezas.querySelector(`[data-indice="${indice}"]`);
            if (pieza) this._seleccionarPieza(indice, pieza, drop);
        });
    },

    _seleccionarPieza(indice, pieza, drop) {
        this.valorArrastrado = indice;
        drop.textContent = this.opcionesActuales.opciones[indice];
        drop.classList.add("zona-seleccionada");
        this.container.querySelectorAll("#piezas .pieza").forEach(opcion => {
            opcion.classList.toggle("seleccionada", opcion === pieza);
            opcion.setAttribute("aria-pressed", String(opcion === pieza));
        });

        const botonComprobar = this.container.querySelector("#btnComprobar");
        botonComprobar.disabled = indice === this.ultimaRespuestaIncorrecta;
        this._mensaje(botonComprobar.disabled
            ? "Esa opción ya la intentaste. Elige otra para seguir."
            : "Respuesta lista. Comprueba tu idea.", "");
    },

    // --------------------------------------------------------
    _comprobar() {
        const pregunta = Engine.preguntaActual();
        const elegido = pregunta.tipo === "arrastrar" ? this.valorArrastrado : this.seleccion;

        if (elegido === null || elegido === -1 || elegido === undefined) {
            this._mensaje("Selecciona una respuesta.", "");
            return;
        }

        const correcto = elegido === this.opcionesActuales.correcta;
        const duracionMs = Math.round(performance.now() - this.inicioPregunta);
        const resultado = Engine.comprobar(correcto);
        const mensaje = this.container.querySelector("#mensaje");
        const btnComprobar = this.container.querySelector("#btnComprobar");

        if (resultado.correcto) {
            this.racha++;
            const puntos = 1000 + Math.max(0, 500 - Math.floor(duracionMs / 1000) * 25) + Math.min((this.racha - 1) * 100, 300);
            this.puntosQuiz += puntos;
            this._registrarRespuesta(true, duracionMs, puntos);
            this._detenerReloj();
            this.container.querySelector("#gameStreak").textContent = this.racha;
            const opcionCorrecta = pregunta.tipo === "arrastrar"
                ? this.container.querySelector(`#piezas [data-indice="${elegido}"]`)
                : this.container.querySelector(`.opcionBtn[data-indice="${elegido}"]`);
            if (opcionCorrecta) opcionCorrecta.classList.add("correcta");
            this.container.querySelectorAll(".opcionBtn, #piezas .pieza").forEach(opcion => {
                opcion.setAttribute("aria-disabled", "true");
                if ("disabled" in opcion) opcion.disabled = true;
            });
            this._mensaje(`¡Correcto! +${pregunta.xp} XP y +${pregunta.monedas} monedas.` +
                ` +${puntos} pts${this.racha > 1 ? ` · Racha x${this.racha}` : ""}` +
                (resultado.subioNivel ? " ¡Subiste de nivel!" : ""), "correcto");
            btnComprobar.disabled = true;
            btnComprobar.textContent = "¡Respuesta correcta!";

            setTimeout(() => {
                if (Engine.siguientePregunta()) {
                    this._renderPregunta();
                } else {
                    this._nivelCompletado();
                }
            }, 900);

        } else {
            this._registrarRespuesta(false, duracionMs, 0);
            this.racha = 0;
            this.container.querySelector("#gameStreak").textContent = this.racha;
            this.ultimaRespuestaIncorrecta = elegido;
            const opcionIncorrecta = pregunta.tipo === "arrastrar"
                ? this.container.querySelector(`#piezas [data-indice="${elegido}"]`)
                : this.container.querySelector(`.opcionBtn[data-indice="${elegido}"]`);
            if (opcionIncorrecta) opcionIncorrecta.classList.add("incorrecta");
            this._mensaje(resultado.sinVidas
                ? "Se acabaron las vidas. Usa la pista y recupérate para continuar."
                : `Casi. −1 vida. Pista: ${Engine.nivelActual.teoria.definicion}`,
            "incorrecto");
            btnComprobar.disabled = true;
            btnComprobar.textContent = resultado.sinVidas ? "Sin vidas" : "Elige otra respuesta";

            if (resultado.sinVidas) {
                setTimeout(() => this._sinVidas(), 900);
            }
        }
    },

    _mensaje(texto, clase) {
        const el = this.container.querySelector("#mensaje");
        el.textContent = texto;
        el.className = clase;
    },

    _registrarRespuesta(correcta, duracionMs, puntos) {
        Storage.registrarRespuesta({
            mundoId: Engine.mundoActual.id,
            nivelId: Engine.nivelActual.id,
            correcta,
            duracionMs,
            puntos
        }).catch(error => console.warn("No se pudo registrar la respuesta para el ranking:", error));
    },

    _detenerReloj() {
        if (this.reloj) window.clearInterval(this.reloj);
        this.reloj = null;
    },

    // --------------------------------------------------------
    _nivelCompletado() {
        // Mundos que dependían de este y aún no eran accesibles
        const bloqueadosAntes = WORLDS.filter(w => w.requiere === Engine.mundoActual.id && !Player.mundoDesbloqueado(w));

        const siguiente = Engine.completarNivel();
        const mundo = Engine.mundoActual;
        const nivel = Engine.nivelActual;

        // Mundos que se acaban de desbloquear con este nivel/mundo completado
        const desbloqueadosAhora = bloqueadosAntes.filter(w => Player.mundoDesbloqueado(w));

        this.container.innerHTML = `
            <button class="btnRegresar" id="btnMundo">← Volver a niveles</button>

            <div class="gameContainer">
                <div class="card resultado">
                    <h1>🏆 ¡Nivel completado!</h1>
                    <p>${nivel.titulo} - ${mundo.nombre}</p>

                    <div class="statsResultado">
                        <div>✅ ${Engine.aciertos} / ${Engine.totalPreguntas()} correctas</div>
                        <div>⚡ ${this.puntosQuiz.toLocaleString()} puntos de aula</div>
                    </div>

                    ${desbloqueadosAhora.length ? `
                        <div class="mundoDesbloqueado">
                            🌟 ¡Mundo completado! Desbloqueaste:
                            ${desbloqueadosAhora.map(w => `<span>${w.icono} ${w.nombre}</span>`).join(" ")}
                        </div>
                    ` : ""}

                    <button id="btnRepetir">🔁 Repetir nivel</button>
                    ${siguiente ? `<button id="btnSiguiente">➡ Siguiente nivel</button>` : ""}
                    ${desbloqueadosAhora.length ? `<button id="btnMundos">🌎 Ver nuevos mundos</button>` : ""}
                </div>
            </div>
        `;

        this.container.querySelector("#btnRepetir").addEventListener("click", () => {
            Router.navegar(`/level/${mundo.id}/${nivel.id}/play`);
        });

        const btnSig = this.container.querySelector("#btnSiguiente");
        if (btnSig) {
            btnSig.addEventListener("click", () => {
                Router.navegar(`/level/${mundo.id}/${siguiente.id}/intro`);
            });
        }

        const btnMundos = this.container.querySelector("#btnMundos");
        if (btnMundos) {
            btnMundos.addEventListener("click", () => {
                Router.navegar("/worlds");
            });
        }

        this.container.querySelector("#btnMundo").addEventListener("click", () => {
            Router.navegar(`/world/${mundo.id}`);
        });
    },

    // --------------------------------------------------------
    _sinVidas() {
        this._detenerReloj();
        const mundo = Engine.mundoActual;
        const nivel = Engine.nivelActual;

        this.container.innerHTML = `
            <button class="btnRegresar" id="btnMundo">← Volver a niveles</button>

            <div class="gameContainer">
                <div class="card resultado">
                    <h1>💔 Te quedaste sin vidas</h1>
                    <p>${nivel.titulo} - ${mundo.nombre}</p>
                    <p>Canjea 25 XP por una vida para continuar tu misión.</p>
                    <p id="mensajeRecuperarVida" class="review-feedback" aria-live="polite"></p>
                    <button id="btnRecuperarVida" ${Player.xp < 25 ? "disabled" : ""}>❤️ Recuperar vida · 25 XP</button>
                    <button id="btnTienda" class="btnVolver">Abrir tienda de trofeos</button>
                </div>
            </div>
        `;

        this.container.querySelector("#btnRecuperarVida").addEventListener("click", async () => {
            const boton = this.container.querySelector("#btnRecuperarVida");
            const mensaje = this.container.querySelector("#mensajeRecuperarVida");
            boton.disabled = true;

            try {
                await Storage.recuperarVida();
                Router.navegar(`/level/${mundo.id}/${nivel.id}/play`);
            } catch (error) {
                mensaje.textContent = error.message;
                boton.disabled = Player.xp < 25;
            }
        });

        this.container.querySelector("#btnTienda").addEventListener("click", () => {
            Router.navegar("/tienda");
        });

        this.container.querySelector("#btnMundo").addEventListener("click", () => {
            Router.navegar(`/world/${mundo.id}`);
        });
    }

};
