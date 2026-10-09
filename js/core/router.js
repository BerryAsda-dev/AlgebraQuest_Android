/*
==================================================================
    ÁLGEBRA QUEST — ROUTER
==================================================================
    Router basado en hash (#/ruta) para que el proyecto funcione
    aunque se abra el index.html directamente con doble clic
    (sin necesidad de un servidor).

    Cada ruta se registra con un patrón tipo "/world/:id" y una
    vista que expone render(container, params).

    Para agregar una pantalla nueva NO se crea un .html: se
    registra una ruta nueva en app.js y se escribe su vista en
    js/views/.
==================================================================
*/

const Router = {

    rutas: [],
    contenedor: null,
    vistaActual: null,

    // ------------------------------------------------------------
    init(containerId) {
        this.contenedor = document.getElementById(containerId);

        window.addEventListener("hashchange", () => this.resolver());
        window.addEventListener("load", () => this.resolver());
    },

    // ------------------------------------------------------------
    agregar(patron, vista) {
        const segmentos = patron.split("/").filter(Boolean);
        this.rutas.push({ patron, segmentos, vista });
    },

    // ------------------------------------------------------------
    navegar(ruta) {
        const rutaNormalizada = "/" + ruta.split("/").filter(Boolean).join("/");
        const hashActual = "/" + window.location.hash.replace(/^#/, "").split("/").filter(Boolean).join("/");

        if (rutaNormalizada === hashActual) {
            // Es la misma ruta: el navegador no dispara "hashchange",
            // así que forzamos manualmente a resolver de nuevo
            // (esto es lo que arregla botones como "Repetir nivel"
            // o "Intentar de nuevo").
            this.resolver();
        } else {
            window.location.hash = ruta;
        }
    },

    // ------------------------------------------------------------
    _coincide(segmentosRuta, segmentosHash) {
        if (segmentosRuta.length !== segmentosHash.length) return null;

        const params = {};

        for (let i = 0; i < segmentosRuta.length; i++) {
            const s = segmentosRuta[i];

            if (s.startsWith(":")) {
                params[s.slice(1)] = decodeURIComponent(segmentosHash[i]);
            } else if (s !== segmentosHash[i]) {
                return null;
            }
        }

        return params;
    },

    // ------------------------------------------------------------
    resolver() {
        let hash = window.location.hash || "#/";
        hash = hash.replace(/^#/, "");

        const segmentosHash = hash.split("/").filter(Boolean);

        for (const ruta of this.rutas) {
            const params = this._coincide(ruta.segmentos, segmentosHash);

            if (params) {
                this._render(ruta.vista, params);
                return;
            }
        }

        // Ninguna ruta coincidió -> volver al inicio
        this.navegar("/");
    },

    // ------------------------------------------------------------
    _render(vista, params) {
        if (this.vistaActual && typeof this.vistaActual.salir === "function") {
            this.vistaActual.salir();
        }

        this.contenedor.innerHTML = "";
        this.contenedor.className = "vista-" + (vista.nombre || "");

        vista.render(this.contenedor, params);

        this.vistaActual = vista;

        window.scrollTo(0, 0);
    }

};
