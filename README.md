> **Android Studio / Ktor / Kotlin Multiplatform:** la arquitectura local nueva
> está documentada en [README_ANDROID.md](README_ANDROID.md). Ejecuta
> `frontend.androidApp` para el login Compose y `:backend:run` para el servidor.
> El módulo `app` conserva el juego web original.
# Álgebra Quest

Juego educativo para aprender álgebra, construido como una **SPA (Single Page
Application)** con un motor de juego propio en JavaScript puro (sin
frameworks). Todo el almacenamiento de datos (progreso, ranking, trofeos)
funciona de forma local dentro de la misma aplicación mediante `localStorage`,
por lo que no requiere servidores externos ni conexión a internet.

## Requisitos

- Ninguno. Se puede ejecutar abriendo `index.html` directamente en cualquier navegador
  o dentro de la aplicación nativa en Android Studio.

## Ejecución en Android Studio

1. Abre el proyecto `AlgebraQuest` en Android Studio.
2. Sincroniza el proyecto con Gradle.
3. Ejecuta el módulo `:app` en un emulador o dispositivo físico Android.

La aplicación compila y empaqueta automáticamente los archivos de la app web
(`index.html`, `js`, `css`, `img`) como recursos locales dentro del APK (`file:///android_asset/index.html`).

## Arquitectura

```
index.html                   ← único punto de entrada (frontend)
css/                          ← estilos (tema, HUD, juego, mundos, ranking)
img/                          ← imágenes de personajes
js/
  data/
    worlds.js                 ← contenido: mundos y niveles
  core/
    player.js                  ← estado del jugador en memoria (XP, vidas...)
    storage.js                  ← almacenamiento local (localStorage)
    engine.js                    ← motor: cargar nivel, comprobar respuesta
    hud.js                        ← barra superior (vidas, XP, monedas)
    router.js                      ← router basado en #/hash
  views/
    home.js                    ← login por nombre
    menu.js, worlds.js, levelSelect.js, levelIntro.js,
    game.js, achievements.js, ranking.js, settings.js
  app.js                     ← registra las rutas y arranca la app
```

## Sistema de almacenamiento local

- **Progreso y perfil**: Guardados por jugador en `localStorage`. Al ingresar un nombre,
  se recupera o crea el perfil localmente.
- **Ranking y estadísticas**: Se calculan a partir de los datos almacenados localmente en el dispositivo.
- **Acceso docente**: Permite administrar el panel docente en modo offline directamente desde la interfaz.

## Cómo agregar un nivel nuevo

Edita `js/data/worlds.js` y agrega un objeto dentro de `niveles` del mundo que corresponda:

```js
{
    id: 6,
    titulo: "Suma de Cubos",
    icono: "🧮",
    teoria: {
        definicion: "a³ + b³ = (a+b)(a² - ab + b²)",
        ejemplo: "x³ + 8 = (x+2)(x² - 2x + 4)"
    },
    preguntas: [
        {
            tipo: "opcion",           // o "arrastrar"
            enunciado: "x³ + 27",
            opciones: ["(x+3)(x²-3x+9)", "(x+3)³", "(x-3)(x²+3x+9)", "(x+9)(x²-3x+3)"],
            correcta: 0,
            xp: 30,
            monedas: 20
        }
    ]
}
```
