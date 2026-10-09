/*
==================================================================
    VISTA: TUTORIAL INTERACTIVO POR TEMA
==================================================================
*/

const TutorialView = {

    nombre: "tutorial",
    temporizador: null,
    paso: 0,

    render(container, params) {
        HUD.montar();
        HUD.mostrar();

        const mundo = Engine.obtenerMundo(params.worldId);
        const nivel = Engine.obtenerNivel(params.worldId, params.levelId);

        if (!mundo || !nivel) {
            Router.navegar("/tutoriales");
            return;
        }

        this.detener();
        this.container = container;
        this.mundo = mundo;
        this.nivel = nivel;
        this.pregunta = nivel.preguntas[0];
        this.opcionElegida = -1;
        this.ultimaOpcionIncorrecta = -1;
        this.respuestaRepasoCorrecta = false;
        this.opcionesRepaso = this.pregunta.opciones.map((texto, indice) => ({ texto, indice }));
        for (let indice = this.opcionesRepaso.length - 1; indice > 0; indice--) {
            const aleatorio = Math.floor(Math.random() * (indice + 1));
            [this.opcionesRepaso[indice], this.opcionesRepaso[aleatorio]] =
                [this.opcionesRepaso[aleatorio], this.opcionesRepaso[indice]];
        }
        this.pasos = [
            { etiqueta: "OBJETIVO", texto: `Hoy repasamos ${nivel.titulo}. Observa la regla y luego aplícala en un ejemplo.` },
            { etiqueta: "IDEA CLAVE", texto: nivel.teoria.definicion },
            { etiqueta: "EJEMPLO GUIADO", texto: nivel.teoria.ejemplo }
        ];
        this.paso = 0;

        const opciones = this.opcionesRepaso.map(opcion => `
            <button class="review-option" data-option="${opcion.indice}" type="button" aria-pressed="false">${opcion.texto}</button>
        `).join("");

        const videoKey = `algebraquest_video_${mundo.id}_${nivel.id}`;
        container.innerHTML = `
            <main class="tutorial-page">
                <header class="tutorial-topbar">
                    <a href="#/tutoriales" class="tutorial-back">← Biblioteca</a>
                    <span class="tutorial-world-tag" style="--topic-color:${mundo.color}">${mundo.icono} ${mundo.nombre}</span>
                </header>

                <section class="tutorial-title-row">
                    <div>
                        <p class="tutorial-kicker">LECCIÓN ${nivel.id} · REPASO GUIADO</p>
                        <h1>${nivel.titulo}</h1>
                    </div>
                    <span class="tutorial-title-icon" aria-hidden="true">${nivel.icono}</span>
                </section>

                <div class="lesson-layout">
                    <section class="lesson-player" aria-label="Reproductor de repaso">
                        <div class="lesson-screen">
                            <div class="lesson-screen-top"><span>ÁLGEBRA QUEST</span><span id="lessonCounter">01 / 03</span></div>
                            <div class="lesson-board">
                                <span id="lessonLabel" class="lesson-label"></span>
                                <p id="lessonText" class="lesson-text"></p>
                            </div>
                            <div class="lesson-controls">
                                <button id="lessonPlay" class="lesson-play" type="button" aria-label="Reproducir repaso">▶</button>
                                <div class="lesson-timeline"><span id="lessonProgress"></span></div>
                                <span id="lessonState">Pausa</span>
                            </div>
                        </div>
                        <div class="lesson-player-actions">
                            <button id="lessonPrev" class="lesson-step" type="button" aria-label="Paso anterior">←</button>
                            <p id="lessonHint">Pulsa reproducir o avanza a tu ritmo.</p>
                            <button id="lessonNext" class="lesson-step" type="button" aria-label="Paso siguiente">→</button>
                        </div>
                        <button id="btnVideo" class="video-cta" type="button">
                            <span class="video-cta-icon" aria-hidden="true">▶</span>
                            <span>Ver video del tema</span>
                            <span class="video-cta-arrow" aria-hidden="true">↗</span>
                        </button>
                    </section>

                    <aside class="lesson-notes">
                        <section class="lesson-note">
                            <p class="tutorial-kicker">REGLA DEL NIVEL</p>
                            <p>${nivel.teoria.definicion}</p>
                        </section>
                        <section class="lesson-note lesson-example">
                            <p class="tutorial-kicker">EJEMPLO</p>
                            <p>${nivel.teoria.ejemplo}</p>
                        </section>
                        <section class="review-quiz">
                            <div class="review-quiz-heading">
                                <span>RETO RÁPIDO</span>
                                <span>+ práctica</span>
                            </div>
                            <h2>${this.pregunta.enunciado}</h2>
                            <div class="review-options">${opciones}</div>
                            <button id="reviewCheck" class="review-check" type="button" disabled>Comprobar respuesta</button>
                            <p id="reviewFeedback" class="review-feedback" aria-live="polite"></p>
                        </section>
                    </aside>
                </div>

                <footer class="tutorial-footer">
                    <button id="btnVolverTema" type="button">← Elegir otro tema</button>
                    <button id="btnPracticar" type="button">Ir al reto del nivel →</button>
                </footer>

                <section id="videoModal" class="video-modal" role="dialog" aria-modal="true" aria-labelledby="videoModalTitle" hidden>
                    <div class="video-modal-backdrop" data-close-video></div>
                    <div class="video-modal-panel">
                        <header class="video-modal-heading">
                            <div><p class="tutorial-kicker">VIDEO DE APOYO</p><h2 id="videoModalTitle">${nivel.titulo}</h2></div>
                            <button id="videoClose" class="video-modal-close" type="button" aria-label="Cerrar video">×</button>
                        </header>
                        <div class="video-frame-wrap">
                            <iframe id="lessonVideo" title="Video tutorial" hidden
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                            <div id="videoPlaceholder" class="video-placeholder">Pega un enlace para cargar el video.</div>
                        </div>
                    </div>
                </section>
            </main>
        `;

        const modal = container.querySelector("#videoModal");
        const videoId = this.extraerVideoId(nivel.videoUrl || "");
        const iframe = container.querySelector("#lessonVideo");
        const placeholder = container.querySelector("#videoPlaceholder");

        const cerrarVideo = () => {
            modal.hidden = true;
            iframe.src = "";
            iframe.hidden = true;
            placeholder.hidden = false;
        };
        this.cerrarVideo = cerrarVideo;
        this.videoEscape = event => {
            if (event.key === "Escape" && !modal.hidden) cerrarVideo();
        };
        document.addEventListener("keydown", this.videoEscape);
        container.querySelector("#btnVideo").addEventListener("click", () => {
            modal.hidden = false;
            if (videoId) {
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
                iframe.hidden = false;
                placeholder.hidden = true;
            } else {
                placeholder.textContent = "Este tema todavía no tiene un video asignado.";
            }
        });
        container.querySelector("#videoClose").addEventListener("click", cerrarVideo);
        modal.querySelector("[data-close-video]").addEventListener("click", cerrarVideo);

        this.actualizarPaso();
        container.querySelector("#lessonPlay").addEventListener("click", () => this.alternarReproduccion());
        container.querySelector("#lessonPrev").addEventListener("click", () => this.cambiarPaso(-1));
        container.querySelector("#lessonNext").addEventListener("click", () => this.cambiarPaso(1));
        container.querySelectorAll(".review-option").forEach(boton => {
            boton.addEventListener("click", () => {
                this.opcionElegida = Number(boton.dataset.option);
                container.querySelectorAll(".review-option").forEach(opcion => opcion.classList.remove("selected"));
                boton.classList.add("selected");
                container.querySelectorAll(".review-option").forEach(opcion => {
                    opcion.setAttribute("aria-pressed", String(opcion === boton));
                });
                container.querySelector("#reviewCheck").disabled = this.respuestaRepasoCorrecta ||
                    this.opcionElegida === this.ultimaOpcionIncorrecta;
                container.querySelector("#reviewFeedback").textContent = "";
                container.querySelector("#reviewFeedback").className = "review-feedback";
            });
        });
        container.querySelector("#reviewCheck").addEventListener("click", () => this.comprobarRepaso());
        container.querySelector("#btnVolverTema").addEventListener("click", () => Router.navegar("/tutoriales"));
        container.querySelector("#btnPracticar").addEventListener("click", () => {
            Router.navegar(`/level/${mundo.id}/${nivel.id}/intro`);
        });
    },

    salir() {
        this.detener();
        if (this.videoEscape) document.removeEventListener("keydown", this.videoEscape);
        if (this.cerrarVideo) this.cerrarVideo();
        this.container = null;
    },

    extraerVideoId(url) {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace(/^www\./, "");
            let id = "";
            if (host === "youtu.be") id = parsed.pathname.slice(1);
            else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
                id = parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || "";
            }
            return /^[\w-]{11}$/.test(id) ? id : null;
        } catch (error) {
            return null;
        }
    },

    actualizarPaso() {
        if (!this.container) return;
        const paso = this.pasos[this.paso];
        this.container.querySelector("#lessonLabel").textContent = paso.etiqueta;
        this.container.querySelector("#lessonText").textContent = paso.texto;
        this.container.querySelector("#lessonCounter").textContent = `${String(this.paso + 1).padStart(2, "0")} / ${String(this.pasos.length).padStart(2, "0")}`;
        this.container.querySelector("#lessonProgress").style.width = `${(this.paso + 1) / this.pasos.length * 100}%`;
        this.container.querySelector("#lessonHint").textContent = this.paso === 0
            ? "Empieza con la idea general."
            : this.paso === 1 ? "Quédate con esta regla antes de resolver." : "Ahora prueba una pregunta del tema.";
    },

    cambiarPaso(direccion) {
        this.paso = (this.paso + direccion + this.pasos.length) % this.pasos.length;
        this.actualizarPaso();
    },

    alternarReproduccion() {
        if (this.temporizador) {
            this.detener();
            return;
        }

        const boton = this.container.querySelector("#lessonPlay");
        boton.textContent = "Ⅱ";
        boton.setAttribute("aria-label", "Pausar repaso");
        this.container.querySelector("#lessonState").textContent = "Reproduciendo";
        this.temporizador = window.setInterval(() => {
            if (this.paso === this.pasos.length - 1) {
                this.detener();
                return;
            }
            this.cambiarPaso(1);
        }, 4200);
    },

    detener() {
        if (this.temporizador) window.clearInterval(this.temporizador);
        this.temporizador = null;
        if (!this.container) return;
        const boton = this.container.querySelector("#lessonPlay");
        const estado = this.container.querySelector("#lessonState");
        if (boton) {
            boton.textContent = "▶";
            boton.setAttribute("aria-label", "Reproducir repaso");
        }
        if (estado) estado.textContent = "Pausa";
    },

    comprobarRepaso() {
        const feedback = this.container.querySelector("#reviewFeedback");
        if (this.opcionElegida < 0) {
            feedback.textContent = "Elige una respuesta para comprobarla.";
            feedback.className = "review-feedback";
            return;
        }

        const correcto = this.opcionElegida === this.pregunta.correcta;
        const opcionElegida = this.container.querySelector(`.review-option[data-option="${this.opcionElegida}"]`);
        if (correcto) {
            this.respuestaRepasoCorrecta = true;
            opcionElegida.classList.add("is-correct");
            this.container.querySelectorAll(".review-option").forEach(opcion => opcion.disabled = true);
            this.container.querySelector("#reviewCheck").disabled = true;
            this.container.querySelector("#reviewCheck").textContent = "¡Respuesta correcta!";
            feedback.textContent = "¡Lo tienes! El reto del nivel te dará XP y monedas.";
        } else {
            this.ultimaOpcionIncorrecta = this.opcionElegida;
            opcionElegida.classList.add("is-wrong");
            this.container.querySelector("#reviewCheck").disabled = true;
            feedback.textContent = "Buen intento. Revisa el ejemplo y elige otra respuesta.";
        }
        feedback.className = `review-feedback ${correcto ? "is-correct" : "is-wrong"}`;
    }

};