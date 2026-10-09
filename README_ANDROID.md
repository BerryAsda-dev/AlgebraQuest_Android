# AlgebraQuest: Android, Kotlin Multiplatform y Ktor local

Abre esta carpeta en Android Studio y sincroniza Gradle. Usa JDK 21 (el JBR de
Android Studio) y Android SDK 36. El módulo nuevo para ejecutar es
`frontend.androidApp`. `app` conserva el juego HTML anterior.

## Iniciar el backend

En PowerShell, desde la raíz:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
.\gradlew.bat :backend:run
```

El servidor escucha en `http://127.0.0.1:8080`; `/health` devuelve su estado.
Déjalo abierto mientras ejecutas el frontend. El emulador Android usa
`http://10.0.2.2:8080`, dirección del equipo anfitrión. Para un teléfono USB:

```powershell
adb reverse tcp:8080 tcp:8080
```

En ese caso cambia la dirección Android en
`frontend/composeApp/src/androidMain/kotlin/com/algebraquest/data/Platform.kt`
a `http://127.0.0.1:8080`. En un dispositivo por Wi-Fi usa la IP local del equipo
y arranca el servidor con `$env:HOST='0.0.0.0'` en tu red de desarrollo.

## Cuentas predefinidas

| Usuario | Contraseña | Vista |
| --- | --- | --- |
| admin | Admin123! | Administrador |
| supervisor | Supervisor123! | Supervisor académico |
| alumno | Alumno123! | Alumno y ejercicio de álgebra |

Las credenciales están exclusivamente en `backend/src/main/resources/users.json`.
Reinicia el backend después de modificar el archivo. Son cuentas de demostración
local, con contraseñas de prueba en texto plano según el requisito; no son un
sistema listo para producción. La API devuelve usuario, rol y token, nunca la
contraseña. Las sesiones se guardan en memoria, duran ocho horas y desaparecen
al reiniciar el servidor. Cerrar sesión invalida el token. El frontend no persiste
credenciales y vuelve al login cuando se cierra la aplicación.

## Frontend compartido

```text
backend/                     Ktor Server JVM / Netty
  src/main/resources/users.json
  wizard/                    Evidencia del generador oficial
frontend/
  androidApp/                MainActivity que arranca Compose
  composeApp/src/
    commonMain/kotlin/com/algebraquest/
      composeApp/            Pantallas y Navigation Compose
      data/                  Ktor Client, DTOs y repositorio
      domain/                Roles, modelos, LoginUseCase
      ui/                    AuthViewModel y StateFlow
    androidMain/             URL del emulador / motor OkHttp
    iosMain/                 ComposeUIViewController / motor Darwin
    wasmJsMain/              ComposeViewport / motor JS
```

Flujo: HTTP JSON → Ktor Client → AuthRepository → LoginUseCase →
AuthViewModel (StateFlow) → Compose UI → ruta del rol devuelto por el servidor.
Navigation Compose es la implementación multiplataforma. El usuario no elige su
rol en el formulario; cada cuenta recibe el rol de su registro JSON.
Las vistas de administración y supervisión son paneles iniciales. El juego HTML
completo sigue disponible en `app`; no ha sido reescrito en Compose.

## Web

```powershell
.\gradlew.bat :frontend:composeApp:wasmJsBrowserDevelopmentRun
```

Instala Node.js y npm y comprueba que estén en PATH (`node --version` y `npm --version`). Se usa Node.js local para conservar `FAIL_ON_PROJECT_REPOS`.

Abre `http://localhost:8081` con el backend corriendo. CORS permite únicamente
localhost/127.0.0.1 en ese puerto. Web requiere un navegador compatible con WasmGC.

## iOS

El módulo produce el framework `ComposeApp` y expone `MainViewController()` para
SwiftUI. En macOS con Xcode ejecuta:

```bash
./gradlew :frontend:composeApp:linkDebugFrameworkIosSimulatorArm64
```

Usa `frontend/iosApp/ContentView.swift` dentro de un proyecto host iOS de Xcode,
con el framework enlazado y embebido. El host Xcode aún debe crearse en macOS.
Para HTTP local configura `NSAppTransportSecurity/NSAllowsLocalNetworking = YES`
en Info.plist de desarrollo. En un iPhone físico cambia la URL de iosMain por la
IP del equipo. Windows no puede compilar ni ejecutar el destino iOS.

## Verificación

```powershell
.\gradlew.bat :backend:test :frontend:androidApp:assembleDebug :frontend:composeApp:compileKotlinWasmJs
```

Las pruebas del backend verifican las tres cuentas y sus roles, ausencia de
contraseñas en las respuestas, credenciales incorrectas, JSON inválido y
revocación de sesión. El APK nuevo queda en
`frontend/androidApp/build/outputs/apk/debug/androidApp-debug.apk`.
Los dos módulos Android comparten applicationId: instalar uno reemplaza el otro.

## Origen del servidor

Se descargó el esqueleto desde el generador oficial https://start.ktor.io usando
su endpoint `/project/generate`. La solicitud exacta está en
`backend/wizard/request.json`, y el ZIP original en
`backend/wizard/algebraquest-backend.zip`. `backend/wizard/generated` conserva
el proyecto original sin editar. El backend adapta ese esqueleto al monorepo,
usa su `Serialization.kt` y `logback.xml`, y sustituye las rutas de ejemplo por
la autenticación local. Versiones fijadas: Ktor 3.3.0, Kotlin 2.2.20,
Compose Multiplatform 1.9.0, AGP 8.11.1 y Gradle 8.14.3.
## Resultado de validación (8 de octubre de 2026)

- Backend: dos pruebas aprobadas, sin errores; incluyen las tres cuentas y revocación.
- Android: APK del frontend Compose y APK del juego original generados correctamente.
- Kotlin/Wasm: código compartido, ejecutable Wasm y bundle Webpack generados correctamente.
- iOS: punto de entrada incluido, pendiente de compilación en macOS/Xcode.
