/*
==================================================================
    ÁLGEBRA QUEST — BOOTSTRAP
==================================================================
    Punto de entrada de la aplicación. Intenta recuperar la
    sesión guardada en este dispositivo (auto-login contra el
    servidor), prepara el router y registra todas las rutas.

    Para agregar una pantalla nueva:
      1. Crear su vista en js/views/miVista.js (objeto con
         .nombre y .render(container, params)).
      2. Incluir el script en index.html.
      3. Registrar la ruta aquí abajo con Router.agregar(...).
==================================================================
*/

window.addEventListener("DOMContentLoaded", async function () {

    Router.init("app");

    Router.agregar("/", HomeView);
    Router.agregar("/menu", MenuView);
    Router.agregar("/worlds", WorldsView);
    Router.agregar("/world/:worldId", LevelSelectView);
    Router.agregar("/level/:worldId/:levelId/intro", LevelIntroView);
    Router.agregar("/level/:worldId/:levelId/tutorial", TutorialView);
    Router.agregar("/level/:worldId/:levelId/play", GameView);
    Router.agregar("/tutoriales", TutorialsView);
    Router.agregar("/tienda", StoreView);
    Router.agregar("/logros", AchievementsView);
    Router.agregar("/ranking", RankingView);
    Router.agregar("/admin/login", AdminLoginView);
    Router.agregar("/admin/ranking", TeacherRankingView);
    Router.agregar("/ajustes", SettingsView);

    // Si este dispositivo ya recuerda un nombre, intentamos
    // recuperar automáticamente su progreso desde el servidor.
    const nombreRecordado = Storage.nombreRecordado();

    if (nombreRecordado) {
        try {
            await Storage.login(nombreRecordado);
        } catch (e) {
            console.warn("No se pudo recuperar la sesión guardada:", e);
            Storage.olvidarNombre();
        }
    }

    Router.resolver();

});
