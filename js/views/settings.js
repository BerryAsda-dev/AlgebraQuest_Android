/*
==================================================================
    VISTA: AJUSTES
==================================================================
*/

const SettingsView = {

    nombre: "settings",

    render(container) {
        HUD.montar();
        HUD.mostrar();

        container.innerHTML = `
            <div class="worldContainer">
                <h1>⚙ CONFIGURACIÓN</h1>

                <div class="card ajustesCard">

                    <label>Nombre del jugador</label>
                    <input type="text" id="inputNombre" value="${Player.nombre}" maxlength="20">
                    <button id="btnGuardarNombre">Guardar nombre</button>
                    <p id="nombreMsg" class="errorLogin"></p>

                    <hr>

                    <p>Esto borrará tu XP, monedas, nivel y progreso de forma permanente (tu nombre se conserva).</p>
                    <button id="btnReset" class="btnPeligro">🗑 Reiniciar progreso</button>

                    <hr>

                    <p>¿Vas a jugar con otro nombre en este dispositivo?</p>
                    <button id="btnCambiarJugador">🔄 Jugar con otro nombre</button>
                </div>

                <button class="btnRegresar" id="btnVolver">← Volver al menú</button>
            </div>
        `;

        container.querySelector("#btnGuardarNombre").addEventListener("click", async () => {
            const input = container.querySelector("#inputNombre");
            const msg = container.querySelector("#nombreMsg");
            const nuevoNombre = input.value.trim();

            if (!nuevoNombre || nuevoNombre === Player.nombre) return;

            msg.textContent = "";
            msg.style.color = "";

            try {
                await Storage.renombrar(nuevoNombre);
                HUD.actualizar();
                msg.style.color = "#00ff99";
                msg.textContent = "✅ Nombre actualizado.";
            } catch (e) {
                msg.textContent = "⚠ " + e.message;
            }
        });

        container.querySelector("#btnReset").addEventListener("click", async () => {
            if (!confirm("¿Seguro que quieres reiniciar todo tu progreso?")) return;

            try {
                await Player.reset();
                Router.navegar("/menu");
            } catch (e) {
                alert("No se pudo reiniciar el progreso: " + e.message);
            }
        });

        container.querySelector("#btnCambiarJugador").addEventListener("click", () => {
            Storage.olvidarNombre();
            Player.reiniciarSesion();
            Router.navegar("/");
        });

        container.querySelector("#btnVolver").addEventListener("click", () => {
            Router.navegar("/menu");
        });
    }

};
