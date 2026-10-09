/*
==================================================================
    VISTA: SELECCIÓN DE MUNDOS
==================================================================
    Las tarjetas se generan a partir de WORLDS (js/data/worlds.js).
    Agregar un mundo nuevo con contenido real lo hace aparecer
    aquí automáticamente, sin tocar esta vista.
==================================================================
*/

const WorldsView = {

    nombre: "worlds",

    render(container) {
        HUD.montar();
        HUD.mostrar();

        const tarjetas = WORLDS.map(mundo => {
            const desbloqueado = Player.mundoDesbloqueado(mundo);
            const completado = desbloqueado && Player.mundoCompletado(mundo);

            const mundoRequerido = mundo.requiere ? WORLDS.find(w => w.id === mundo.requiere) : null;
            const textoBloqueado = mundoRequerido
                ? `Bloqueado 🔒 · Completa ${mundoRequerido.nombre}`
                : "Bloqueado 🔒";

            return `
                <div class="card ${desbloqueado ? "unlocked" : "locked"}"
                     data-world="${mundo.id}"
                     style="${desbloqueado ? `border-color:${mundo.color}` : ""}">
                    <div class="icon">${mundo.icono}</div>
                    <h3>${mundo.nombre}</h3>
                    <p>${!desbloqueado
                        ? textoBloqueado
                        : (completado ? "Completado ⭐" : "Disponible")}</p>
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="worldContainer">
                <h1>ÁLGEBRA QUEST</h1>
                <h2>Selecciona un Mundo</h2>
                <div class="cards">${tarjetas}</div>
                <button class="btnRegresar" id="btnVolver">← Regresar al menú</button>
            </div>
        `;

        container.querySelectorAll(".card.unlocked").forEach(card => {
            card.addEventListener("click", () => {
                Router.navegar("/world/" + card.dataset.world);
            });
        });

        container.querySelector("#btnVolver").addEventListener("click", () => {
            Router.navegar("/menu");
        });
    }

};
