const COSTO_VIDA_XP = 25;

const TROFEOS_TIENDA = [
    { id: "bronce", icono: "🥉", nombre: "Trofeo de bronce", descripcion: "La primera pieza de tu colección.", precio: 50 },
    { id: "plata", icono: "🥈", nombre: "Trofeo de plata", descripcion: "Una medalla para una mente constante.", precio: 100 },
    { id: "oro", icono: "🥇", nombre: "Trofeo de oro", descripcion: "Un premio para quienes dominan los retos.", precio: 180 },
    { id: "campeon", icono: "🏆", nombre: "Copa de campeón", descripcion: "El gran premio de Álgebra Quest.", precio: 300 }
];

const StoreView = {

    nombre: "store",

    render(container, aviso = "") {
        HUD.montar();
        HUD.mostrar();

        const trofeos = TROFEOS_TIENDA.map(trofeo => {
            const adquirido = (Player.trofeos || []).includes(trofeo.id);
            const alcanza = Player.monedas >= trofeo.precio;

            return `
                <article class="trofeoProducto ${adquirido ? "adquirido" : ""}">
                    <span class="productoIcono" aria-hidden="true">${trofeo.icono}</span>
                    <div class="productoInfo">
                        <h3>${trofeo.nombre}</h3>
                        <p>${trofeo.descripcion}</p>
                    </div>
                    <button class="comprarTrofeo" data-trofeo="${trofeo.id}" type="button"
                            ${adquirido || !alcanza ? "disabled" : ""}>
                        ${adquirido ? "En tu vitrina" : alcanza ? `Comprar · ${trofeo.precio} 🪙` : `Faltan ${trofeo.precio - Player.monedas} 🪙`}
                    </button>
                </article>
            `;
        }).join("");

        const puedeRecuperar = Player.vidas < Player.vidasMax && Player.xp >= COSTO_VIDA_XP;
        const estadoVidas = Player.vidas >= Player.vidasMax
            ? "Tienes todas tus vidas."
            : Player.xp < COSTO_VIDA_XP
                ? `Te faltan ${COSTO_VIDA_XP - Player.xp} XP para recuperar una vida.`
                : "Recupera una vida y vuelve al reto.";

        container.innerHTML = `
            <main class="store-page">
                <header class="store-heading">
                    <div>
                        <p class="store-kicker">INTERCAMBIOS DE AVENTURA</p>
                        <h1>Tienda de recompensas</h1>
                    </div>
                    <button class="store-back" id="btnVolverMenu" type="button">← Menú</button>
                </header>

                <section class="store-balance" aria-label="Tu saldo">
                    <div><span>VIDAS</span><strong>❤️ ${Player.vidas} / ${Player.vidasMax}</strong></div>
                    <div><span>EXPERIENCIA</span><strong>⭐ ${Player.xp} / ${Player.xpMax} XP</strong></div>
                    <div><span>MONEDAS</span><strong>🪙 ${Player.monedas}</strong></div>
                </section>

                <p id="storeMessage" class="store-message" role="status">${aviso}</p>

                <section class="life-exchange">
                    <div class="life-emblem" aria-hidden="true">❤️</div>
                    <div class="life-copy">
                        <p class="store-kicker">RECUPERACIÓN</p>
                        <h2>Una vida extra</h2>
                        <p>${estadoVidas}</p>
                    </div>
                    <span class="life-price">25 XP</span>
                    <button id="btnRecuperarVida" type="button" ${puedeRecuperar ? "" : "disabled"}>
                        Canjear vida
                    </button>
                </section>

                <section class="trophy-shop">
                    <div class="trophy-shop-heading">
                        <div>
                            <p class="store-kicker">COLECCIÓN</p>
                            <h2>Trofeos</h2>
                        </div>
                        <span>Los premios comprados aparecen en Logros.</span>
                    </div>
                    <div class="trofeoLista">${trofeos}</div>
                </section>

                <button class="store-achievements" id="btnVerLogros" type="button">Ver mi vitrina y logros →</button>
            </main>
        `;

        container.querySelector("#btnVolverMenu").addEventListener("click", () => Router.navegar("/menu"));
        container.querySelector("#btnVerLogros").addEventListener("click", () => Router.navegar("/logros"));
        container.querySelector("#btnRecuperarVida").addEventListener("click", async event => {
            event.currentTarget.disabled = true;
            try {
                await Storage.recuperarVida();
                this.render(container, "¡Vida recuperada! Ya puedes volver a tu misión.");
            } catch (error) {
                this.render(container, error.message);
            }
        });
        container.querySelectorAll(".comprarTrofeo:not(:disabled)").forEach(boton => {
            boton.addEventListener("click", async () => {
                boton.disabled = true;
                try {
                    const trofeo = TROFEOS_TIENDA.find(item => item.id === boton.dataset.trofeo);
                    await Storage.comprarTrofeo(boton.dataset.trofeo);
                    this.render(container, `${trofeo.icono} ${trofeo.nombre} agregado a tu vitrina.`);
                } catch (error) {
                    this.render(container, error.message);
                }
            });
        });
    }

};