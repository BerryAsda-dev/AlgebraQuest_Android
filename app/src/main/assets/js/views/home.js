/*
==================================================================
    VISTA: HOME (login por nombre)
==================================================================
    Si el dispositivo ya recuerda un jugador (auto-login hecho en
    app.js al arrancar), se muestra una bienvenida rápida. Si no,
    se pide un nombre: con ese nombre se crea o recupera el
    jugador en la base de datos (sin contraseña).
==================================================================
*/

const HomeView = {

    nombre: "home",

    render(container) {
        HUD.ocultar();

        const yaLogueado = !!Player.id;

        container.innerHTML = `
            <div class="container">

                <div class="left">
                    <h1><span>ÁLGEBRA</span>QUEST</h1>
                    <p>Aprende Álgebra Universitaria jugando</p>

                    ${yaLogueado ? `
                        <p class="bienvenida">👋 Hola de nuevo, <strong>${Player.nombre}</strong></p>
                        <button id="btnContinuar">Continuar</button>
                        <button class="btnVolver" id="btnCambiar">Jugar con otro nombre</button>
                    ` : `
                        <div class="loginBox">
                            <label for="inputNombre">¿Cómo te llamas?</label>
                            <input type="text" id="inputNombre" maxlength="20" placeholder="Tu nombre" autocomplete="off">
                            <button id="btnEntrar">Comenzar</button>
                            <p id="loginError" class="errorLogin"></p>
                        </div>
                    `}
                    <button class="teacher-entry" id="btnAdminAccess" type="button">
                        <span aria-hidden="true">🎓</span> Acceso docente
                    </button>
                </div>

                <div class="right">
                    <img src="img/personaje.jpg" alt="Personaje">
                </div>

            </div>
        `;

        container.querySelector("#btnAdminAccess").addEventListener("click", () => {
            Router.navegar("/admin/login");
        });

        if (yaLogueado) {
            container.querySelector("#btnContinuar").addEventListener("click", () => {
                Router.navegar("/menu");
            });

            container.querySelector("#btnCambiar").addEventListener("click", () => {
                Storage.olvidarNombre();
                Player.reiniciarSesion();
                Router.navegar("/");
            });

            return;
        }

        const input = container.querySelector("#inputNombre");
        const boton = container.querySelector("#btnEntrar");
        const error = container.querySelector("#loginError");

        const intentarEntrar = async () => {
            const nombre = input.value.trim();

            if (!nombre) {
                error.textContent = "Escribe un nombre para continuar.";
                return;
            }

            boton.disabled = true;
            error.textContent = "";

            try {
                await Storage.login(nombre);
                Router.navegar("/menu");
            } catch (e) {
                error.textContent = "⚠ " + e.message;
                boton.disabled = false;
            }
        };

        boton.addEventListener("click", intentarEntrar);

        input.addEventListener("keydown", e => {
            if (e.key === "Enter") intentarEntrar();
        });

        input.focus();
    }

};
