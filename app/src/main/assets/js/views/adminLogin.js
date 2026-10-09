/*
==================================================================
    VISTA: ACCESO ADMINISTRATIVO
==================================================================
*/

const AdminLoginView = {

    nombre: "admin-login",

    render(container) {
        HUD.ocultar();

        container.innerHTML = `
            <main class="admin-login-page">
                <section class="admin-login-story">
                    <p class="admin-eyebrow">ÁLGEBRA QUEST · DOCENTES</p>
                    <div class="admin-equation" aria-hidden="true">x² + 2x + 1</div>
                    <h1>El progreso<br>también se enseña.</h1>
                    <p class="admin-story-copy">Un espacio de control separado para revisar el ritmo y los resultados del grupo.</p>
                    <div class="admin-signal" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
                    <a href="#/" class="admin-student-link">← Volver a jugadores</a>
                </section>

                <section class="admin-login-panel">
                    <div class="admin-panel-mark" aria-hidden="true">∑</div>
                    <p class="admin-eyebrow">ACCESO RESTRINGIDO</p>
                    <h2>Administrador</h2>
                    <p class="admin-panel-copy">Ingresa con tu cuenta docente.</p>
                    <form id="adminLoginForm" novalidate>
                        <label for="adminUser">Usuario</label>
                        <input id="adminUser" name="usuario" type="text" minlength="3" maxlength="40" autocomplete="username" required>
                        <label for="adminPassword">Contraseña</label>
                        <div class="admin-password-wrap">
                            <input id="adminPassword" name="password" type="password" autocomplete="current-password" required>
                            <button id="adminTogglePassword" type="button" aria-label="Mostrar contraseña" title="Mostrar contraseña">◉</button>
                        </div>
                        <button id="adminSubmit" class="admin-submit" type="submit">Entrar al panel <span aria-hidden="true">→</span></button>
                        <p id="adminLoginFeedback" class="admin-feedback" aria-live="polite"></p>
                    </form>
                    <p id="adminSetupHint" class="admin-setup-hint" hidden></p>
                    <p class="admin-security-note"><span aria-hidden="true">▣</span> Sesión protegida y separada de los jugadores</p>
                </section>
            </main>
        `;

        const form = container.querySelector("#adminLoginForm");
        const username = container.querySelector("#adminUser");
        const password = container.querySelector("#adminPassword");
        const submit = container.querySelector("#adminSubmit");
        const feedback = container.querySelector("#adminLoginFeedback");
        const setupHint = container.querySelector("#adminSetupHint");
        const togglePassword = container.querySelector("#adminTogglePassword");

        togglePassword.addEventListener("click", () => {
            const mostrar = password.type === "password";
            password.type = mostrar ? "text" : "password";
            togglePassword.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
            togglePassword.title = mostrar ? "Ocultar contraseña" : "Mostrar contraseña";
        });

        form.addEventListener("submit", async event => {
            event.preventDefault();
            feedback.textContent = "";
            submit.disabled = true;
            submit.classList.add("is-loading");
            submit.querySelector("span").textContent = "…";

            try {
                await Storage.adminIniciar(username.value.trim(), password.value);
                Router.navegar("/admin/ranking");
            } catch (error) {
                feedback.textContent = error.message;
                feedback.className = "admin-feedback is-error";
                submit.disabled = false;
                submit.classList.remove("is-loading");
                submit.querySelector("span").textContent = "→";
            }
        });

        Storage.adminEstado().then(estado => {
            if (estado.autenticado) {
                Router.navegar("/admin/ranking");
            }
        }).catch(() => {});
    }

};