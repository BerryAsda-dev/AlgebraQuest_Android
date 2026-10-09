/*
==================================================================
    ÁLGEBRA QUEST — HUD
==================================================================
    El HUD vive fuera del router: se monta una sola vez y se
    actualiza solo, escuchando "player:update". Las vistas pueden
    mostrarlo u ocultarlo con HUD.mostrar() / HUD.ocultar().
==================================================================
*/

const HUD = {

    montado: false,
    rutaDetalle: "/worlds",

    plantilla() {
        return `
            <div id="hud">
                <div class="hud-top">
                    <button id="hudVidas" class="hud-stat hud-lives" type="button" aria-expanded="false"></button>
                    <button id="hudNombre" class="hud-stat hud-player" type="button" title="Abrir configuración"></button>
                    <button id="hudNivel" class="hud-stat hud-level" type="button" title="Ver progreso de nivel"></button>
                </div>
                <div class="hud-middle">
                    <span>XP</span>
                    <div class="barra">
                        <div id="hudXpBar" class="progreso"></div>
                    </div>
                    <button id="hudXpTexto" class="hud-stat hud-xp" type="button" title="Ver experiencia"></button>
                </div>
                <div class="hud-bottom">
                    <button id="hudMonedas" class="hud-stat hud-coins" type="button" title="Ver monedas"></button>
                </div>
                <div id="hudDetalle" class="hud-detail" hidden>
                    <p id="hudDetalleTexto" aria-live="polite"></p>
                    <button id="hudIrMapa" type="button">Ver misiones</button>
                    <button id="hudCerrarDetalle" class="hud-close" type="button" aria-label="Cerrar">×</button>
                </div>
            </div>
        `;
    },

    montar() {
        if (this.montado) return;

        document.getElementById("hudContainer").innerHTML = this.plantilla();
        this.montado = true;

        document.addEventListener("player:update", () => this.actualizar());

        document.getElementById("hudVidas").addEventListener("click", () => {
            this.mostrarDetalle(`Te quedan ${Player.vidas} de ${Player.vidasMax} vidas. Recupera una por 25 XP.`, "Canjear XP", "/tienda");
        });
        document.getElementById("hudNombre").addEventListener("click", () => Router.navegar("/ajustes"));
        document.getElementById("hudNivel").addEventListener("click", () => {
            this.mostrarDetalle(`Nivel ${Player.nivel}. Sigue resolviendo preguntas para subir.`);
        });
        document.getElementById("hudXpTexto").addEventListener("click", () => {
            this.mostrarDetalle(`Experiencia: ${Player.xp} de ${Player.xpMax} XP. Una vida cuesta 25 XP.`, "Recuperar vida", "/tienda");
        });
        document.getElementById("hudMonedas").addEventListener("click", () => {
            this.mostrarDetalle(`Tienes ${Player.monedas} monedas. Canjéalas por trofeos.`, "Ver trofeos", "/tienda");
        });
        document.getElementById("hudIrMapa").addEventListener("click", () => Router.navegar(this.rutaDetalle));
        document.getElementById("hudCerrarDetalle").addEventListener("click", () => this.cerrarDetalle());

        this.actualizar();
    },

    mostrarDetalle(mensaje, accion = "Ver misiones", ruta = "/worlds") {
        const detalle = document.getElementById("hudDetalle");
        if (!detalle) return;

        this.rutaDetalle = ruta;
        document.getElementById("hudDetalleTexto").textContent = mensaje;
        document.getElementById("hudIrMapa").textContent = accion;
        detalle.hidden = false;
        document.getElementById("hudVidas").setAttribute("aria-expanded", "true");
    },

    cerrarDetalle() {
        const detalle = document.getElementById("hudDetalle");
        if (detalle) detalle.hidden = true;
        const vidas = document.getElementById("hudVidas");
        if (vidas) vidas.setAttribute("aria-expanded", "false");
    },

    actualizar() {
        if (!this.montado) return;

        const vidas = document.getElementById("hudVidas");
        vidas.textContent = "❤️".repeat(Player.vidas) + "🖤".repeat(Player.vidasMax - Player.vidas);
        vidas.title = `${Player.vidas} de ${Player.vidasMax} vidas. Pulsa para ver detalles.`;

        document.getElementById("hudNombre").textContent = "👤 " + Player.nombre;

        document.getElementById("hudNivel").textContent = "⭐ Nivel " + Player.nivel;

        document.getElementById("hudXpBar").style.width =
            (Player.xp / Player.xpMax * 100) + "%";

        document.getElementById("hudXpTexto").textContent = Player.xp + " / " + Player.xpMax;

        document.getElementById("hudMonedas").textContent = "🪙 " + Player.monedas + " monedas";
    },

    mostrar() {
        const el = document.getElementById("hud");
        if (el) el.style.display = "block";
        document.body.classList.add("con-hud");
    },

    ocultar() {
        const el = document.getElementById("hud");
        if (el) el.style.display = "none";
        document.body.classList.remove("con-hud");
    }

};
