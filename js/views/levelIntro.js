/*
==================================================================
    VISTA: INTRODUCCIÓN / TEORÍA DE UN NIVEL
==================================================================
    Reemplaza a "nivel1.html". Sirve para cualquier nivel de
    cualquier mundo, leyendo nivel.teoria desde los datos.
==================================================================
*/

const LevelIntroView = {

    nombre: "level-intro",

    render(container, params) {
        HUD.montar();
        HUD.mostrar();

        const mundo = Engine.obtenerMundo(params.worldId);
        const nivel = Engine.obtenerNivel(params.worldId, params.levelId);

        if (!mundo || !nivel || !Player.mundoDesbloqueado(mundo) || !Player.nivelDesbloqueado(mundo.id, nivel.id)) {
            Router.navegar("/worlds");
            return;
        }

        container.innerHTML = `
            <div class="container">

                <div class="left">
                    <h1><span>Nivel ${nivel.id}</span>${nivel.titulo}</h1>

                    <p>📖 Aprende</p>
                    <p>${nivel.teoria.definicion}</p>

                    <h2>Ejemplo</h2>
                    <p>${nivel.teoria.ejemplo}</p>

                    <button id="btnComenzar">Comenzar reto</button>
                    <button id="btnTutorial">▶ Ver tutorial del tema</button>
                    <button class="btnRegresar" id="btnVolver">← Volver</button>
                </div>

                <div class="right">
                    <img src="${ImagenAleatoria.personaje()}" alt="Personaje">
                </div>

            </div>
        `;

        container.querySelector("#btnComenzar").addEventListener("click", () => {
            Router.navegar(`/level/${mundo.id}/${nivel.id}/play`);
        });

        container.querySelector("#btnTutorial").addEventListener("click", () => {
            Router.navegar(`/level/${mundo.id}/${nivel.id}/tutorial`);
        });

        container.querySelector("#btnVolver").addEventListener("click", () => {
            Router.navegar(`/world/${mundo.id}`);
        });
    }

};
