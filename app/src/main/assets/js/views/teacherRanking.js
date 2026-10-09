/*
==================================================================
    VISTA: RANKING EN MODO PROFESOR
==================================================================
*/

const TeacherRankingView = {

    nombre: "teacher-ranking",
    intervalo: null,
    solicitud: 0,
    container: null,

    async render(container) {
        HUD.ocultar();
        this.detener();
        this.container = container;

        let administrador;
        try {
            administrador = await Storage.adminEstado();
        } catch (error) {
            if (this.container !== container) return;
            container.innerHTML = `
                <main class="admin-login-page">
                    <section class="admin-login-card">
                        <p class="admin-eyebrow">CONTROL DOCENTE</p>
                        <h1>No se pudo verificar el acceso</h1>
                        <p>Inicia sesión con tu cuenta docente para acceder al panel.</p>
                        <button id="adminRetryLogin" type="button">Volver al acceso docente</button>
                    </section>
                </main>
            `;
            container.querySelector("#adminRetryLogin").addEventListener("click", () => Router.navegar("/admin/login"));
            return;
        }

        if (this.container !== container) return;
        if (!administrador.autenticado) {
            Router.navegar("/admin/login");
            return;
        }

        const mundos = WORLDS.map(mundo =>
            `<option value="${mundo.id}">${mundo.icono} ${mundo.nombre}</option>`
        ).join("");

        container.innerHTML = `
            <main class="teacher-dashboard">
                <header class="teacher-heading">
                    <div>
                        <p class="tutorial-kicker">PANEL ADMINISTRATIVO · ${administrador.usuario}</p>
                        <h1>Ranking de aula</h1>
                        <p>Resultados de los jugadores, actualizados automáticamente.</p>
                    </div>
                    <button id="teacherLogout" type="button">⏻ Cerrar sesión</button>
                </header>

                <section class="teacher-toolbar" aria-label="Controles del ranking">
                    <label for="teacherWorld">Mundo</label>
                    <select id="teacherWorld">
                        <option value="">Todos los mundos</option>
                        ${mundos}
                    </select>
                    <button id="teacherRefresh" type="button" aria-label="Actualizar ranking">↻ Actualizar</button>
                    <span id="teacherStatus" aria-live="polite">Conectando...</span>
                </section>

                <section class="teacher-summary" aria-label="Resumen de resultados">
                    <div><span>Jugadores</span><strong id="teacherPlayers">—</strong></div>
                    <div><span>Respuestas registradas</span><strong id="teacherAnswers">—</strong></div>
                    <div><span>Líder actual</span><strong id="teacherLeader">—</strong></div>
                </section>

                <section class="teacher-table-wrap" aria-label="Clasificación">
                    <div class="teacher-table-head" aria-hidden="true">
                        <span>#</span><span>Jugador</span><span>Puntos</span>
                        <span>Aciertos</span><span>Precisión</span><span>Tiempo medio</span>
                    </div>
                    <div id="teacherRows" class="teacher-rows" aria-live="polite">
                        <p class="teacher-empty">Cargando resultados...</p>
                    </div>
                </section>
            </main>
        `;

        container.querySelector("#teacherLogout").addEventListener("click", async () => {
            await Storage.adminCerrar().catch(() => {});
            Router.navegar("/admin/login");
        });
        container.querySelector("#teacherWorld").addEventListener("change", () => this.actualizar());
        container.querySelector("#teacherRefresh").addEventListener("click", () => this.actualizar());
        this.actualizar();
        this.intervalo = window.setInterval(() => this.actualizar(), 10000);
    },

    salir() {
        this.detener();
        this.container = null;
    },

    detener() {
        if (this.intervalo) window.clearInterval(this.intervalo);
        this.intervalo = null;
        this.solicitud++;
    },

    async actualizar() {
        if (!this.container) return;
        const container = this.container;
        const solicitud = ++this.solicitud;
        const mundoId = container.querySelector("#teacherWorld").value;
        const estado = container.querySelector("#teacherStatus");
        estado.textContent = "Actualizando...";
        estado.className = "";

        try {
            const jugadores = await Storage.obtenerRankingAula(mundoId);
            if (this.container !== container || solicitud !== this.solicitud) return;
            this.pintar(container, jugadores);
            estado.textContent = `Actualizado ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        } catch (error) {
            if (this.container !== container || solicitud !== this.solicitud) return;
            if (error.status === 401) {
                Router.navegar("/admin/login");
                return;
            }
            estado.textContent = "No se pudieron obtener los datos locales.";
            estado.className = "teacher-error";
        }
    },

    pintar(container, jugadores) {
        const rows = container.querySelector("#teacherRows");
        rows.replaceChildren();
        container.querySelector("#teacherPlayers").textContent = jugadores.length;
        container.querySelector("#teacherAnswers").textContent = jugadores.reduce((total, jugador) => total + jugador.respuestas, 0);
        container.querySelector("#teacherLeader").textContent = jugadores[0]?.nombre || "—";

        if (!jugadores.length) {
            const empty = document.createElement("p");
            empty.className = "teacher-empty";
            empty.textContent = "Aún no hay respuestas registradas para este filtro.";
            rows.appendChild(empty);
            return;
        }

        jugadores.forEach((jugador, indice) => {
            const row = document.createElement("div");
            row.className = `teacher-row${indice < 3 ? ` podium podium-${indice + 1}` : ""}`;
            const values = [
                indice < 3 ? ["🥇", "🥈", "🥉"][indice] : String(indice + 1),
                jugador.nombre,
                `${jugador.puntos.toLocaleString()} pts`,
                `${jugador.correctas} / ${jugador.respuestas}`,
                `${jugador.precision}%`,
                jugador.tiempoPromedio ? `${(jugador.tiempoPromedio / 1000).toFixed(1)} s` : "—"
            ];

            values.forEach((value, columna) => {
                const cell = document.createElement("span");
                cell.textContent = value;
                if (columna === 1) cell.className = "teacher-player-name";
                row.appendChild(cell);
            });
            rows.appendChild(row);
        });
    }

};