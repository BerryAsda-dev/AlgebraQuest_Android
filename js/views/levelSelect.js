/*
==================================================================
    VISTA: SELECCIÓN DE NIVEL DENTRO DE UN MUNDO
==================================================================
    Antes esto era "factorizacion.html" con los niveles escritos
    a mano en el HTML. Ahora sirve para CUALQUIER mundo: los
    niveles salen de WORLDS[mundo].niveles.
==================================================================
*/

const LevelSelectView = {

    nombre: "level-select",

    render(container, params) {
        HUD.montar();
        HUD.mostrar();

        const mundo = Engine.obtenerMundo(params.worldId);

        if (!mundo || !Player.mundoDesbloqueado(mundo)) {
            Router.navegar("/worlds");
            return;
        }

        const botones = mundo.niveles.map(nivel => {
            const desbloqueado = Player.nivelDesbloqueado(mundo.id, nivel.id);
            const completado = Player.nivelCompletado(mundo.id, nivel.id);

            return `
                <article class="nivel-card">
                    <button class="nivel ${desbloqueado ? "desbloqueado" : "bloqueado"}"
                            data-nivel="${nivel.id}"
                            ${desbloqueado ? "" : "disabled"}>
                        ${desbloqueado ? nivel.icono : "🔒"} Nivel ${nivel.id}
                        <span>${nivel.titulo}${completado ? " · ✅" : ""}</span>
                    </button>
                    <button class="nivel-tutorial" data-tutorial="${nivel.id}" type="button">
                        ▶ Repasar tema
                    </button>
                </article>
            `;
        }).join("");

        container.innerHTML = `
            <div class="container">

                <div class="left">
                    <h1><span>MUNDO</span>${mundo.nombre.toUpperCase()}</h1>
                    <p>Continua con tu Progeso</p>

                    <div class="menuBotones">
                        ${botones || "<p>Aún no hay niveles disponibles.</p>"}
                    </div>

                    <button class="btnRegresar" id="btnVolver">← Volver a Mundos</button>
                </div>

                <div class="right">
                    <img src="${ImagenAleatoria.personaje()}" alt="Personaje">
                </div>

            </div>
        `;

        container.querySelectorAll(".nivel.desbloqueado").forEach(btn => {
            btn.addEventListener("click", () => {
                Router.navegar(`/level/${mundo.id}/${btn.dataset.nivel}/intro`);
            });
        });

        container.querySelectorAll(".nivel-tutorial").forEach(btn => {
            btn.addEventListener("click", () => {
                Router.navegar(`/level/${mundo.id}/${btn.dataset.tutorial}/tutorial`);
            });
        });

        container.querySelector("#btnVolver").addEventListener("click", () => {
            Router.navegar("/worlds");
        });
    }

};
