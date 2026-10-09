/*
==================================================================
    VISTA: RANKING
==================================================================
    Muestra a los mejores jugadores según la base de datos
    (ordenados por nivel, luego XP, luego monedas).
==================================================================
*/

const RankingView = {

    nombre: "ranking",

    async render(container) {
        HUD.montar();
        HUD.mostrar();

        container.innerHTML = `
            <div class="worldContainer">
                <h1>🏆 RANKING</h1>
                <h2>Los mejores jugadores de Álgebra Quest</h2>
                <div id="rankingLista" class="rankingLista">
                    <p>Cargando ranking...</p>
                </div>
                <button class="btnRegresar" id="btnVolver">← Regresar al menú</button>
            </div>
        `;

        container.querySelector("#btnVolver").addEventListener("click", () => {
            Router.navegar("/menu");
        });

        try {
            const jugadores = await Storage.obtenerRanking();
            this._pintar(container, jugadores);
        } catch (e) {
            container.querySelector("#rankingLista").innerHTML =
                `<p class="errorLogin">⚠ No se pudo cargar el ranking local.</p>`;
        }
    },

    _pintar(container, jugadores) {
        const medallas = ["🥇", "🥈", "🥉"];

        if (!jugadores.length) {
            container.querySelector("#rankingLista").innerHTML =
                "<p>Todavía no hay jugadores registrados.</p>";
            return;
        }

        const filas = jugadores.map((j, i) => `
            <div class="rankingFila ${j.nombre === Player.nombre ? "yo" : ""}">
                <span class="rankingPos">${medallas[i] || (i + 1) + "."}</span>
                <span class="rankingNombre">${j.nombre}</span>
                <span class="rankingDato">⭐ Nivel ${j.nivel}</span>
                <span class="rankingDato">${j.xp} XP</span>
                <span class="rankingDato">🪙 ${j.monedas}</span>
            </div>
        `).join("");

        container.querySelector("#rankingLista").innerHTML = filas;
    }

};
