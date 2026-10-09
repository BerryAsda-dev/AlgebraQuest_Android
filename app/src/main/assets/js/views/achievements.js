/*
==================================================================
    VISTA: LOGROS
==================================================================
    Los logros se calculan a partir de Player.progreso, no se
    guardan aparte, así siempre reflejan el estado real.
==================================================================
*/

const AchievementsView = {

    nombre: "achievements",

    _lista() {
        const totalNiveles = WORLDS.reduce((acc, m) => acc + m.niveles.length, 0);

        const completados = WORLDS.reduce((acc, m) => {
            return acc + (Player.progreso[m.id] ? Player.progreso[m.id].completados.length : 0);
        }, 0);

        return [
            {
                icono: "🥇",
                titulo: "Primer Paso",
                descripcion: "Completa tu primer nivel",
                logrado: completados >= 1
            },
            {
                icono: "🔥",
                titulo: "Racha de 3",
                descripcion: "Completa 3 niveles",
                logrado: completados >= 3
            },
            {
                icono: "🌱",
                titulo: "Maestro de la Factorización",
                descripcion: "Completa todo el mundo Factorización",
                logrado: !!WORLDS.find(m => m.id === "factorizacion" && Player.mundoCompletado(m))
            },
            {
                icono: "💰",
                titulo: "Coleccionista",
                descripcion: "Junta 100 monedas",
                logrado: Player.monedas >= 100
            },
            {
                icono: "⭐",
                titulo: "Nivel de Jugador 3",
                descripcion: "Alcanza el nivel 3 de jugador",
                logrado: Player.nivel >= 3
            },
            {
                icono: "🏆",
                titulo: "Completista",
                descripcion: "Completa todos los niveles disponibles",
                logrado: totalNiveles > 0 && completados >= totalNiveles
            }
        ];
    },

    render(container) {
        HUD.montar();
        HUD.mostrar();

        const tarjetas = this._lista().map(logro => `
            <div class="logro ${logro.logrado ? "logrado" : "pendiente"}">
                <div class="icon">${logro.logrado ? logro.icono : "🔒"}</div>
                <h3>${logro.titulo}</h3>
                <p>${logro.descripcion}</p>
            </div>
        `).join("");

        const trofeos = (Player.trofeos || []).map(id => TROFEOS_TIENDA.find(trofeo => trofeo.id === id))
            .filter(Boolean);

        container.innerHTML = `
            <div class="worldContainer">
                <h1>🏆 LOGROS</h1>
                <h2>Tu progreso en Álgebra Quest</h2>
                <div class="cards logros">${tarjetas}</div>
                <section class="trofeosVitrina">
                    <h2>🏅 Tu vitrina</h2>
                    ${trofeos.length ? `
                        <div class="trofeosAdquiridos">
                            ${trofeos.map(trofeo => `<span title="${trofeo.nombre}">${trofeo.icono} ${trofeo.nombre}</span>`).join("")}
                        </div>
                    ` : `<p>Aún no tienes trofeos comprados.</p>`}
                    <button id="btnTiendaTrofeos">🪙 Ir a la tienda</button>
                </section>
                <button class="btnRegresar" id="btnVolver">← Volver al menú</button>
            </div>
        `;

        container.querySelector("#btnTiendaTrofeos").addEventListener("click", () => Router.navegar("/tienda"));

        container.querySelector("#btnVolver").addEventListener("click", () => {
            Router.navegar("/menu");
        });
    }

};
