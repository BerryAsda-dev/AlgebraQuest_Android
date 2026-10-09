/*
==================================================================
    VISTA: MENÚ PRINCIPAL
==================================================================
*/

const MenuView = {

    nombre: "menu",

    render(container) {
        HUD.montar();
        HUD.mostrar();

        const mundoMision = WORLDS.find(mundo => Player.mundoDesbloqueado(mundo) &&
            mundo.niveles.some(nivel => Player.nivelDesbloqueado(mundo.id, nivel.id) &&
                !Player.nivelCompletado(mundo.id, nivel.id))) || WORLDS.find(mundo => Player.mundoDesbloqueado(mundo));
        const nivelMision = mundoMision && (mundoMision.niveles.find(nivel =>
            Player.nivelDesbloqueado(mundoMision.id, nivel.id) && !Player.nivelCompletado(mundoMision.id, nivel.id)) ||
            mundoMision.niveles[0]);
        const nivelesCompletados = mundoMision
            ? mundoMision.niveles.filter(nivel => Player.nivelCompletado(mundoMision.id, nivel.id)).length
            : 0;
        const progresoMundo = mundoMision && mundoMision.niveles.length
            ? Math.round(nivelesCompletados / mundoMision.niveles.length * 100)
            : 0;
        const retosDisponibles = WORLDS.filter(mundo => Player.mundoDesbloqueado(mundo)).flatMap(mundo =>
            mundo.niveles.filter(nivel => Player.nivelDesbloqueado(mundo.id, nivel.id) &&
                !Player.nivelCompletado(mundo.id, nivel.id)).map(nivel => ({ mundo, nivel }))
        );
        const retos = retosDisponibles.length ? retosDisponibles : WORLDS
            .filter(mundo => Player.mundoDesbloqueado(mundo))
            .flatMap(mundo => mundo.niveles.slice(0, 1).map(nivel => ({ mundo, nivel })));
        const retoFlash = retos[Math.floor(Math.random() * retos.length)];

        container.innerHTML = `
            <main class="menu-screen">
                <section class="menu-content">
                    <header class="menu-heading">
                        <p class="menu-kicker">CENTRO DE MISIONES</p>
                        <h1>¡Hola, ${Player.nombre}!</h1>
                        <p>Tu próxima respuesta te acerca a la meta.</p>
                    </header>

                    ${mundoMision && nivelMision ? `
                        <section class="mission-panel" aria-label="Misión recomendada">
                            <div class="mission-panel-top">
                                <span class="mission-world">${mundoMision.icono} ${mundoMision.nombre}</span>
                                <span class="mission-progress-label">${nivelesCompletados}/${mundoMision.niveles.length} niveles</span>
                            </div>
                            <div class="mission-copy">
                                <span class="mission-eyebrow">SIGUIENTE RETO</span>
                                <h2>${nivelMision.icono} ${nivelMision.titulo}</h2>
                            </div>
                            <div class="mission-track" role="progressbar" aria-label="Progreso del mundo"
                                 aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progresoMundo}">
                                <span style="width:${progresoMundo}%"></span>
                            </div>
                            <div class="mission-actions">
                                <button id="btnMision" class="mission-primary" type="button">▶ Continuar misión</button>
                                <button id="btnRepaso" class="mission-secondary" type="button">Ver tutorial</button>
                            </div>
                        </section>
                    ` : ""}

                    <nav class="menu-shortcuts" aria-label="Navegación principal">
                        <button id="btnNuevo" class="shortcut-worlds" type="button"><span>🗺️</span> Mundos</button>
                        <button id="btnTutoriales" type="button"><span>📚</span> Temas</button>
                        <button id="btnTienda" type="button"><span>🛒</span> Tienda</button>
                        <button id="btnLogros" type="button"><span>🏆</span> Logros</button>
                        <button id="btnRanking" type="button"><span>📊</span> Ranking</button>
                        <button id="btnRetoFlash" class="shortcut-flash" type="button"><span>⚡</span> Reto relámpago</button>
                        <button id="btnProfesor" type="button"><span>🎓</span> Acceso docente</button>
                        <button id="btnAjustes" type="button"><span>⚙️</span> Ajustes</button>
                    </nav>
                </section>

                <aside class="menu-character" aria-label="Acompañante de aventura">
                    <img src="img/personaje2.jpg" alt="Tu compañero de aventura">
                    <p>Una pregunta a la vez.</p>
                </aside>
            </main>
        `;

        container.querySelector("#btnNuevo").addEventListener("click", () => {
            Router.navegar("/worlds");
        });

        container.querySelector("#btnTutoriales").addEventListener("click", () => {
            Router.navegar("/tutoriales");
        });

        container.querySelector("#btnTienda").addEventListener("click", () => {
            Router.navegar("/tienda");
        });

        const btnMision = container.querySelector("#btnMision");
        if (btnMision) {
            btnMision.addEventListener("click", () => {
                Router.navegar(`/level/${mundoMision.id}/${nivelMision.id}/intro`);
            });
            container.querySelector("#btnRepaso").addEventListener("click", () => {
                Router.navegar(`/level/${mundoMision.id}/${nivelMision.id}/tutorial`);
            });
        }

        container.querySelector("#btnLogros").addEventListener("click", () => {
            Router.navegar("/logros");
        });

        container.querySelector("#btnRanking").addEventListener("click", () => {
            Router.navegar("/ranking");
        });

        container.querySelector("#btnRetoFlash").addEventListener("click", () => {
            Router.navegar(`/level/${retoFlash.mundo.id}/${retoFlash.nivel.id}/intro`);
        });

        container.querySelector("#btnProfesor").addEventListener("click", () => {
            Router.navegar("/admin/login");
        });

        container.querySelector("#btnAjustes").addEventListener("click", () => {
            Router.navegar("/ajustes");
        });
    }

};
